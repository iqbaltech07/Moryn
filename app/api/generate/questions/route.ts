import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { generateText, parseAndRepairJson } from "@/lib/ai/llm";
import { checkRateLimit, RateLimitWindows } from "@/lib/db/rateLimit";
import { getDailyAiCallLimit } from "@/lib/analytics/planQuota";
import { questionsSchema } from "@/lib/utils/validation";
import {
  QUESTIONS_SYSTEM_PROMPT,
  QUESTIONS_RETRY_SYSTEM_PROMPT,
  buildQuestionsUserPrompt,
} from "@/lib/ai/prompts";
import { hasActiveCustomAiKeys } from "@/lib/ai/keyManager";

export const maxDuration = 60;

function parseAndValidateQuestions(text: string) {
  const parsedData = parseAndRepairJson(text, { expectArray: true });
  if (!parsedData) return null;
  try {
    return questionsSchema.parse(parsedData);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[Questions] Zod validation failed for parsed JSON:", msg);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true, email: true },
    });

    const isCustomKeysActive = await hasActiveCustomAiKeys(session.user.id);
    if (!isCustomKeysActive) {
      const dailyLimit = getDailyAiCallLimit(user?.tier, user?.email);
      const rl = await checkRateLimit({
        userId: session.user.id,
        scope: "generate:questions",
        limit: dailyLimit,
        windowSeconds: RateLimitWindows.DAY,
      });
      if (!rl.allowed) {
        return NextResponse.json({ error: "DAILY_LIMIT_REACHED", message: `Batas generate harian tercapai. Coba lagi besok atau gunakan Custom API Key sendiri.` }, { status: 429 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const { appName, appIdea, stacks } = body as {
      appName?: string;
      appIdea?: string;
      stacks?: { frontend?: string; backend?: string; database?: string; deployment?: string };
    };

    if (!appIdea || typeof appIdea !== "string" || appIdea.trim().length < 10) {
      return NextResponse.json({ error: "Missing or invalid appIdea" }, { status: 400 });
    }

    const userPrompt = buildQuestionsUserPrompt({ appName, appIdea, stacks });

    // OpenRouter first, Gemini fallback (with user multi-key pool).
    let result: Awaited<ReturnType<typeof generateText>> | null = null;
    try {
      result = await generateText({
        systemPrompt: QUESTIONS_SYSTEM_PROMPT,
        userPrompt,
        userId: session.user.id,
        priority: "openrouter",
        jsonObject: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[Questions] generation failed:", msg);
    }

    let questions = result ? parseAndValidateQuestions(result.text) : null;

    // Auto-retry once if parsing or validation failed
    if (!questions) {
      console.warn("[Questions] Initial parsing/validation failed. Retrying with explicit repair prompt...");
      try {
        const retryResult = await generateText({
          systemPrompt: QUESTIONS_RETRY_SYSTEM_PROMPT,
          userPrompt,
          userId: session.user.id,
          priority: "openrouter",
          jsonObject: true,
        });
        if (retryResult?.text) {
          questions = parseAndValidateQuestions(retryResult.text);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("[Questions] Retry failed:", msg);
      }
    }

    if (!questions) {
      console.error("Invalid questions JSON from AI after repair & retry:", result?.text ?? "no output");
      return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
    }

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    console.error("Error generating questions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}