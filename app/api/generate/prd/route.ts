import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { getOwnedProject } from "@/lib/utils/projectHelpers";
import { checkRateLimit, RateLimitWindows } from "@/lib/db/rateLimit";
import { getDailyAiCallLimit } from "@/lib/analytics/planQuota";
import { parseBody, projectIdSchema } from "@/lib/utils/validation";
import { fixMermaidBlocks } from "@/lib/utils/mermaidFix";
import { hasActiveCustomAiKeys } from "@/lib/ai/keyManager";
import { FastApiClient } from "@/lib/ai/fastapiClient";
import { waitForStageResult, formatStructureSummary, runSequentialGenerationPipeline } from "@/lib/ai/pipeline";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await parseBody(req, projectIdSchema);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true, email: true },
    });

    const isCustomKeysActive = await hasActiveCustomAiKeys(session.user.id);
    if (!isCustomKeysActive) {
      const dailyLimit = getDailyAiCallLimit(user?.tier, user?.email);
      const rl = await checkRateLimit({
        userId: session.user.id,
        scope: "generate:prd",
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
    const cacheKey = `project:${projectId}:prd`;
    try {
      const cached = await redis.get<string>(cacheKey);
      if (cached) {
        return NextResponse.json({ markdown: cached });
      }
    } catch (err) {
      console.warn("Redis Cache Miss/Error:", err);
    }

    // 2. Check Database
    const project = await getOwnedProject(session.user.id, projectId, {
      id: true,
      userId: true,
      appName: true,
      appIdea: true,
      formInputs: true,
      prdData: true,
      strukturData: true,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    if (project.prdData) {
      try {
        await redis.set(cacheKey, project.prdData);
      } catch {}
      return NextResponse.json({ markdown: project.prdData });
    }

    // 3. Smart-wait for background pipeline if currently executing
    const awaitedPrd = await waitForStageResult(
      projectId,
      cacheKey,
      async () => {
        const p = await prisma.project.findUnique({
          where: { id: projectId },
          select: { prdData: true },
        });
        return p?.prdData ? { markdown: p.prdData } : null;
      },
      15000,
      1000
    );

    if (awaitedPrd) {
      return NextResponse.json(awaitedPrd);
    }

    // 4. Fallback / Direct Generation with Structure Context
    const formInputs = project.formInputs ? JSON.parse(project.formInputs) : {};
    const structureSummary = project.strukturData ? formatStructureSummary(project.strukturData) : undefined;
    const language = (formInputs.language === "id" ? "id" : "en") as "en" | "id";

    // Call FastAPI AI Engine (Single Source of Truth)
    const fastApiRes = await FastApiClient.generatePrd({
      appName: project.appName,
      appIdea: project.appIdea,
      stacks: formInputs.stacks,
      dynamicAnswers: formInputs.dynamicAnswers,
      designPreference: formInputs.designPreference,
      structureContext: structureSummary,
      language,
    });

    if (!fastApiRes?.markdown) {
      return NextResponse.json({ error: "Failed to generate PRD from AI Engine" }, { status: 500 });
    }

    let cleanMarkdown = fastApiRes.markdown;
    cleanMarkdown = await fixMermaidBlocks(cleanMarkdown);

    // Save to Database
    await prisma.project.update({
      where: { id: projectId },
      data: {
        prdData: cleanMarkdown,
        formInputs: JSON.stringify({
          ...formInputs,
          _tasksOutdated: true,
        }),
      },
    });

    // Save to Redis Cache
    try {
      await redis.set(cacheKey, cleanMarkdown);
    } catch (err: unknown) {
      console.warn("Failed to set Redis cache:", err);
    }

    // Continue background pipeline for Tasks if not yet generated
    after(async () => {
      await runSequentialGenerationPipeline(projectId);
    });

    return NextResponse.json({ markdown: cleanMarkdown });
  } catch (error: unknown) {
    console.error("Error generating PRD:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}