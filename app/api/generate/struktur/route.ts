import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { generateText, parseAndRepairJson } from "@/lib/ai/llm";
import { getOwnedProject } from "@/lib/utils/projectHelpers";
import { checkRateLimit, RateLimitWindows } from "@/lib/db/rateLimit";
import { getDailyAiCallLimit } from "@/lib/analytics/planQuota";
import { parseBody, projectIdSchema, strukturSchema } from "@/lib/utils/validation";
import { fixMermaidBlocks } from "@/lib/utils/mermaidFix";
import {
  STRUKTUR_SYSTEM_PROMPT,
  buildStrukturUserPrompt,
  buildPrdSystemPrompt,
  buildPrdUserPrompt,
} from "@/lib/ai/prompts";
import { hasActiveCustomAiKeys } from "@/lib/ai/keyManager";

// Allow execution up to 60 seconds on Vercel
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
        return NextResponse.json({ error: "DAILY_LIMIT_REACHED", message: `Batas generate harian tercapai. Coba lagi besok atau gunakan Custom API Key sendiri.` }, { status: 429 });
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

    // 2. Check Database (typed ownership)
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
      try { await redis.set(cacheKeyStruktur, data); } catch {}
      return NextResponse.json(data);
    }

    const formInputs = project.formInputs ? JSON.parse(project.formInputs) : {};

    // 3. Build Prompts via Centralized Registry
    const strukturSystemPrompt = STRUKTUR_SYSTEM_PROMPT;
    const strukturUserPrompt = buildStrukturUserPrompt({
      appName: project.appName,
      appIdea: project.appIdea,
      targetUser: formInputs.targetUser,
      platform: formInputs.platform,
      coreFeatures: formInputs.coreFeatures,
      monetization: formInputs.monetization,
      appScale: formInputs.appScale,
      integrations: formInputs.integrations,
      stacks: formInputs.stacks,
      designPreference: formInputs.designPreference,
      prdData: project.prdData,
    });

    const prdSystemPrompt = buildPrdSystemPrompt();
    const prdUserPrompt = buildPrdUserPrompt({
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

    // 4. PARALLEL EXECUTION (Gemini → OpenRouter fallback)
    console.log("Starting parallel generation of Struktur and PRD...");
    const [strukturResult, prdResult] = await Promise.all([
      generateText({
        systemPrompt: strukturSystemPrompt,
        userPrompt: strukturUserPrompt,
        userId: session.user.id,
        jsonObject: true,
      }).catch((err) => { console.error("[Struktur] generation failed:", err); return null; }),
      generateText({
        systemPrompt: prdSystemPrompt,
        userPrompt: prdUserPrompt,
        userId: session.user.id,
      }).catch((err) => { console.error("[PRD] generation failed:", err); return null; }),
    ]);

    if (!prdResult || !strukturResult) {
      return NextResponse.json({ error: "Failed to generate project structure/PRD" }, { status: 500 });
    }
    console.log("Parallel generation complete.");

    // Process Struktur (extract + validate JSON)
    const rawStrukturObj = parseAndRepairJson(strukturResult.text);
    if (!rawStrukturObj) {
      console.error("Failed to extract/repair struktur JSON:", strukturResult.text);
      return NextResponse.json({ error: "Invalid JSON from AI" }, { status: 500 });
    }
    let parsedStruktur;
    try {
      parsedStruktur = strukturSchema.parse(rawStrukturObj);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Failed to parse/validate struktur JSON:", msg);
      return NextResponse.json({ error: "Invalid JSON from AI" }, { status: 500 });
    }

    // Process PRD (clean up code blocks + auto-fix mermaid)
    let prdText = prdResult.text;
    if (prdText.startsWith("```markdown")) {
      prdText = prdText.replace(/^```markdown\n?/, "").replace(/\n?```$/, "");
    }
    prdText = await fixMermaidBlocks(prdText);

    // Save both to Database
    await prisma.project.update({
      where: { id: projectId },
      data: {
        strukturData: JSON.stringify(parsedStruktur),
        prdData: prdText,
      },
      select: { id: true },
    });

    // Save both to Redis Cache
    try {
      await redis.set(cacheKeyStruktur, parsedStruktur);
      await redis.set(`project:${projectId}:prd`, prdText);
    } catch (err) {
      console.warn("Redis set error:", err);
    }

    return NextResponse.json(parsedStruktur);
  } catch (error: unknown) {
    console.error("Parallel generation error:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}