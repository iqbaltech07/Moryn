import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/db/redis";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { getOwnedProject } from "@/lib/utils/projectHelpers";
import { checkRateLimit, RateLimitWindows } from "@/lib/db/rateLimit";
import { getDailyAiCallLimit } from "@/lib/analytics/planQuota";
import { parseBody, projectIdSchema } from "@/lib/utils/validation";
import { hasActiveCustomAiKeys } from "@/lib/ai/keyManager";
import { FastApiClient } from "@/lib/ai/fastapiClient";
import { waitForStageResult, formatStructureSummary } from "@/lib/ai/pipeline";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, forceSync } = await parseBody(req, projectIdSchema);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true, email: true },
    });

    const isCustomKeysActive = await hasActiveCustomAiKeys(session.user.id);
    if (!isCustomKeysActive) {
      const dailyLimit = getDailyAiCallLimit(user?.tier, user?.email);
      const rl = await checkRateLimit({
        userId: session.user.id,
        scope: "generate:tasks",
        limit: dailyLimit,
        windowSeconds: RateLimitWindows.DAY,
      });
      if (!rl.allowed) {
        return NextResponse.json(
          {
            error: "DAILY_LIMIT_REACHED",
            message: "Batas generate harian tercapai. Coba lagi besok atau gunakan Custom API Key sendiri.",
          },
          { status: 429 }
        );
      }
    }

    // 1. Check Redis Cache
    const cacheKey = `project:${projectId}:tasks`;
    if (!forceSync) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return NextResponse.json(cached);
        }
      } catch (err) {
        console.warn("Redis Cache Miss/Error:", err);
      }
    }

    // 2. Check Database
    const project = await getOwnedProject(session.user.id, projectId, {
      id: true,
      userId: true,
      appName: true,
      appIdea: true,
      formInputs: true,
      strukturData: true,
      prdData: true,
      taskData: true,
      checkedTasks: true,
      designData: true,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    const form = project.formInputs ? JSON.parse(project.formInputs) : {};
    const isOutdated = form._tasksOutdated === true || forceSync === true;

    if (project.taskData && !isOutdated) {
      const data = JSON.parse(project.taskData);
      let savedStatus = {};
      if (project.checkedTasks) {
        try {
          savedStatus = JSON.parse(project.checkedTasks);
        } catch {}
      }
      const responseData = { ...data, savedStatus };
      try {
        await redis.set(cacheKey, responseData);
      } catch {}
      return NextResponse.json(responseData);
    }

    // 3. Smart-wait for background pipeline if generation is in progress
    if (!isOutdated) {
      const awaitedTasks = await waitForStageResult(
        projectId,
        cacheKey,
        async () => {
          const p = await prisma.project.findUnique({
            where: { id: projectId },
            select: { taskData: true, checkedTasks: true },
          });
          if (p?.taskData) {
            const data = JSON.parse(p.taskData);
            let savedStatus = {};
            if (p.checkedTasks) {
              try {
                savedStatus = JSON.parse(p.checkedTasks);
              } catch {}
            }
            return { ...data, savedStatus };
          }
          return null;
        },
        15000,
        1000
      );

      if (awaitedTasks) {
        return NextResponse.json(awaitedTasks);
      }
    }

    // 4. Delegate to FastAPI AI Engine with PRD & Structure context
    const structureSummary = project.strukturData ? formatStructureSummary(project.strukturData) : undefined;

    const tasksRes = await FastApiClient.generateTasks({
      appName: form?.appName || project.appName,
      appIdea: form?.appIdea || project.appIdea,
      prdMarkdown: project.prdData || undefined,
      strukturSummary: structureSummary,
      coreFeatures: form?.coreFeatures,
      stacks: form?.stacks,
      language: (form?.language === "id" ? "id" : "en") as "en" | "id",
    });

    if (!tasksRes?.data) {
      return NextResponse.json({ error: "Failed to generate tasks from AI Engine" }, { status: 500 });
    }

    const parsed = tasksRes.data;

    // Save to Database
    const updateData: { taskData: string; formInputs?: string } = { taskData: JSON.stringify(parsed) };
    if (isOutdated) {
      delete form._tasksOutdated;
      updateData.formInputs = JSON.stringify(form);
    }

    await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      select: { id: true },
    });

    // Save to Redis Cache
    try {
      await redis.set(cacheKey, parsed);
    } catch (err) {
      console.warn("Redis set error:", err);
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Tasks generation error:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}