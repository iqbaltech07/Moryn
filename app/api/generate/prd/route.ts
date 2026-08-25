import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { generateGemini } from "@/lib/ai/llm";
import { getOwnedProject } from "@/lib/utils/projectHelpers";
import { checkRateLimit, RateLimitWindows } from "@/lib/db/rateLimit";
import { getDailyAiCallLimit } from "@/lib/analytics/planQuota";
import { parseBody, projectIdSchema } from "@/lib/utils/validation";
import { fixMermaidBlocks } from "@/lib/utils/mermaidFix";
import { buildPrdSystemPrompt, buildPrdUserPrompt } from "@/lib/ai/prompts";
import { hasActiveCustomAiKeys } from "@/lib/ai/keyManager";

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
        return NextResponse.json({ error: "DAILY_LIMIT_REACHED", message: `Batas generate harian tercapai. Coba lagi besok atau gunakan Custom API Key sendiri.` }, { status: 429 });
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

    // 2. Check Database (typed ownership)
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
      try { await redis.set(cacheKey, project.prdData); } catch { }
      return NextResponse.json({ markdown: project.prdData });
    }

    const formInputs = project.formInputs ? JSON.parse(project.formInputs) : {};

    const systemPrompt = buildPrdSystemPrompt();
    const userPrompt = buildPrdUserPrompt({
      appName: project.appName,
      appIdea: project.appIdea,
      stacks: formInputs.stacks,
      dynamicQuestions: formInputs.dynamicQuestions,
      dynamicAnswers: formInputs.dynamicAnswers,
      fallbackAnswers: {
        targetUser: formInputs.targetUser,
        platform: formInputs.platform,
        coreFeatures: formInputs.coreFeatures,
        monetization: formInputs.monetization,
        appScale: formInputs.appScale,
        integrations: formInputs.integrations,
        designPreference: formInputs.designPreference,
      },
      integrations: formInputs.integrations,
      strukturData: project.strukturData,
    });

    let response: { text: string } | null = null;
    let success = false;
    let lastError: unknown = null;

    try {
      response = await generateGemini({
        systemPrompt,
        userPrompt,
        userId: session.user.id,
      });
      success = true;
    } catch (err: unknown) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[PRD] All Gemini fallback combinations failed:", msg);
    }

    if (!success || !response) {
      console.error("All fallback combinations failed:", lastError);
      return NextResponse.json({ error: "Failed to generate PRD due to API limits or errors" }, { status: 500 });
    }

    let cleanMarkdown = response.text;
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

    return NextResponse.json({ markdown: cleanMarkdown });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("PRD Generation API Error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}