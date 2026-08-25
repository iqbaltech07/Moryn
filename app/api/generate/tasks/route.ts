import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/db/redis";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { generateText, parseAndRepairJson } from "@/lib/ai/llm";
import { getOwnedProject } from "@/lib/utils/projectHelpers";
import { checkRateLimit, RateLimitWindows } from "@/lib/db/rateLimit";
import { getDailyAiCallLimit } from "@/lib/analytics/planQuota";
import { parseBody, projectIdSchema, tasksSchema } from "@/lib/utils/validation";
import {
  TASKS_BASE_SYSTEM_PROMPT,
  TASKS_SYNC_SYSTEM_PROMPT,
  buildTasksUserPrompt,
  buildTasksSyncUserPrompt,
  buildTasksRetryPrompt,
} from "@/lib/ai/prompts";
import { hasActiveCustomAiKeys } from "@/lib/ai/keyManager";

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
        return NextResponse.json({ error: "DAILY_LIMIT_REACHED", message: `Batas generate harian tercapai. Coba lagi besok atau gunakan Custom API Key sendiri.` }, { status: 429 });
      }
    }

    // 1. Check Redis Cache (Bypassed if forceSync or tasksOutdated)
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

    // 2. Check Database (typed ownership)
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
        try { savedStatus = JSON.parse(project.checkedTasks); } catch { }
      }
      const responseData = { ...data, savedStatus };
      try { await redis.set(cacheKey, responseData); } catch { }
      return NextResponse.json(responseData);
    }

    const prdMarkdown = project.prdData || "";

    const strukturSummary = project.strukturData
      ? (() => {
        try {
          const s = JSON.parse(project.strukturData);
          if (s.nodes && Array.isArray(s.nodes)) {
            return s.nodes.map((n: { label?: string; phase?: number; children?: Array<{ label?: string }> }, idx: number) => {
              const children = Array.isArray(n.children)
                ? n.children.map((c: { label?: string }, cIdx: number) => `    - Sub-feature ${idx + 1}.${cIdx + 1}: ${c.label}`).join("\n")
                : "";
              return `• Category ${idx + 1}: ${n.label || "Category"} (Phase ${n.phase || 1})${children ? "\n" + children : ""}`;
            }).join("\n");
          }
        } catch { }
        return "";
      })()
      : "";

    const designSnippet = project.designData
      ? project.designData.slice(0, 1500)
      : "";

    const integrations = Array.isArray(form?.integrations)
      ? form.integrations.filter((i: string) => i !== "None").join(", ")
      : "N/A";

    let systemPrompt = TASKS_BASE_SYSTEM_PROMPT;
    let userPrompt = buildTasksUserPrompt({
      appName: form?.appName,
      appIdea: form?.appIdea,
      stacks: form?.stacks,
      coreFeatures: form?.coreFeatures,
      integrations,
      strukturSummary,
      designSnippet,
      prdMarkdown,
    });

    if (project.taskData && isOutdated) {
      systemPrompt = TASKS_SYNC_SYSTEM_PROMPT;
      userPrompt = buildTasksSyncUserPrompt({
        prdMarkdown,
        strukturData: project.strukturData,
        designSnippet,
        currentTaskData: project.taskData,
      });
    }

    // Core generation (Gemini → OpenRouter fallback handled inside generateText)
    let result: Awaited<ReturnType<typeof generateText>> | null = null;
    try {
      result = await generateText({
        systemPrompt,
        userPrompt,
        userId: session.user.id,
        jsonObject: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[Tasks] generation failed:", msg);
    }

    let parsed = result ? parseAndValidateTasks(result.text) : null;

    // Auto-retry if fewer than 6 phases returned
    if (!parsed || parsed.phases.length < 6) {
      console.warn(`[Tasks] Got ${parsed?.phases?.length ?? 0} phases, expected 6. Auto-retrying...`);

      const retryPrompt = buildTasksRetryPrompt(userPrompt, parsed?.phases?.length ?? 0);

      try {
        const retry = await generateText({
          systemPrompt,
          userPrompt: retryPrompt,
          userId: session.user.id,
          jsonObject: true,
        });
        const retryParsed = parseAndValidateTasks(retry.text);
        if (retryParsed && retryParsed.phases.length >= 6) {
          parsed = retryParsed;
          console.log(`[Tasks] Retry succeeded with ${retryParsed.phases.length} phases.`);
        } else if (retryParsed && retryParsed.phases.length > parsed!.phases.length) {
          parsed = retryParsed;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("[Tasks] Retry failed:", msg);
      }
    }

    if (!parsed) {
      console.error("Failed to parse tasks JSON:", result?.text ?? "no output");
      return NextResponse.json({ error: "Invalid JSON from AI" }, { status: 500 });
    }

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

/** Parses & validates the AI task-list JSON; returns null on any failure. */
function parseAndValidateTasks(raw: string): { phases: Array<unknown> } | null {
  const parsedData = parseAndRepairJson(raw);
  if (!parsedData) return null;
  try {
    const parsed = tasksSchema.parse(parsedData);
    if (!parsed.phases || !Array.isArray(parsed.phases)) return null;
    return parsed as unknown as { phases: Array<unknown> };
  } catch {
    return null;
  }
}