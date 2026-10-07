import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { getOwnedProject } from "@/lib/utils/projectHelpers";
import { checkRateLimit, RateLimitWindows } from "@/lib/db/rateLimit";
import { getDailyAiCallLimit } from "@/lib/analytics/planQuota";
import { parseBody, projectIdSchema } from "@/lib/utils/validation";
import { hasActiveCustomAiKeys } from "@/lib/ai/keyManager";
import { FastApiClient } from "@/lib/ai/fastapiClient";
import { waitForStageResult, runSequentialGenerationPipeline } from "@/lib/ai/pipeline";

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
        scope: "generate:struktur",
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
    const cacheKeyStruktur = `project:${projectId}:struktur`;
    try {
      const cached = await redis.get(cacheKeyStruktur);
      if (cached) {
        return NextResponse.json(cached);
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
      strukturData: true,
      prdData: true,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    if (project.strukturData) {
      const data = JSON.parse(project.strukturData);
      if (Array.isArray(data?.nodes)) {
        data.nodes.sort((a: any, b: any) => {
          const pA = typeof a.phase === "number" && !isNaN(a.phase) ? a.phase : 1;
          const pB = typeof b.phase === "number" && !isNaN(b.phase) ? b.phase : 1;
          return pA - pB;
        });
      }
      try {
        await redis.set(cacheKeyStruktur, data);
      } catch {}
      return NextResponse.json(data);
    }

    // 3. Smart-wait for background pipeline if currently executing
    const awaitedStruktur = await waitForStageResult(
      projectId,
      cacheKeyStruktur,
      async () => {
        const p = await prisma.project.findUnique({
          where: { id: projectId },
          select: { strukturData: true },
        });
        if (!p?.strukturData) return null;
        const parsed = JSON.parse(p.strukturData);
        if (Array.isArray(parsed?.nodes)) {
          parsed.nodes.sort((a: any, b: any) => {
            const pA = typeof a.phase === "number" && !isNaN(a.phase) ? a.phase : 1;
            const pB = typeof b.phase === "number" && !isNaN(b.phase) ? b.phase : 1;
            return pA - pB;
          });
        }
        return parsed;
      },
      12000,
      1000
    );

    if (awaitedStruktur) {
      return NextResponse.json(awaitedStruktur);
    }

    // 4. Fallback / Direct Generation if pipeline didn't finish or wasn't running
    const formInputs = project.formInputs ? JSON.parse(project.formInputs) : {};
    const language = (formInputs.language === "id" ? "id" : "en") as "en" | "id";

    const strukturRes = await FastApiClient.generateStruktur({
      appName: project.appName,
      appIdea: project.appIdea,
      stacks: formInputs.stacks,
      prdMarkdown: project.prdData || undefined,
      dynamicAnswers: formInputs.dynamicAnswers,
      language,
    });

    if (!strukturRes?.data) {
      return NextResponse.json({ error: "Failed to generate project structure" }, { status: 500 });
    }

    const parsedStruktur = strukturRes.data;
    if (Array.isArray(parsedStruktur?.nodes)) {
      parsedStruktur.nodes.sort((a: any, b: any) => {
        const pA = typeof a.phase === "number" && !isNaN(a.phase) ? a.phase : 1;
        const pB = typeof b.phase === "number" && !isNaN(b.phase) ? b.phase : 1;
        return pA - pB;
      });
    }

    // Save to Database
    await prisma.project.update({
      where: { id: projectId },
      data: {
        strukturData: JSON.stringify(parsedStruktur),
      },
      select: { id: true },
    });

    // Save to Redis Cache
    try {
      await redis.set(cacheKeyStruktur, parsedStruktur);
    } catch (err) {
      console.warn("Redis set error:", err);
    }

    // Continue background pipeline for PRD & Tasks if not yet generated
    after(async () => {
      await runSequentialGenerationPipeline(projectId);
    });

    return NextResponse.json(parsedStruktur);
  } catch (error: unknown) {
    console.error("Structure generation error:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}