import { NextRequest, NextResponse } from "next/server";
import { authenticateAgentRequest } from "@/lib/auth/agentAuth";
import { prisma } from "@/lib/db/prisma";
import { SYSTEM_DIRECTIVES } from "@/lib/ai/systemDirectives";
import { TASTE_SKILL_DIRECTIVES, getFilteredTasteSkill } from "@/lib/design/tasteSkill";
import { parseDesignMarkdown } from "@/lib/design/designParser";
import { serializeContextToHybrid } from "@/lib/ai/contextSerializer";

/**
 * Parse stored designData — which may be a raw markdown string OR a JSON
 * wrapper ({ rawMarkdown, colorTokens, sections }) — into a normalized shape.
 * Single implementation shared by section=design and section=context so the
 * two can never drift apart.
 */
function parseStoredDesign(stored: string) {
  let rawText = stored || "";
  let structured: any = null;

  if (rawText.startsWith("{") && rawText.includes("rawMarkdown")) {
    try {
      structured = JSON.parse(rawText);
      rawText = structured.rawMarkdown || rawText;
    } catch {}
  }

  if (!structured) {
    structured = parseDesignMarkdown(rawText);
  }

  return {
    rawText,
    design: {
      colorTokens: structured.colorTokens || [],
      sections: structured.sections || [],
      rawMarkdown: structured.rawMarkdown || rawText || "",
    },
  };
}

/** Best-effort parse of formInputs (JSON string) into an object. */
function parseFormInputs(stored: string | null): Record<string, unknown> | null {
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateAgentRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.statusCode || 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const section = searchParams.get("section") || "overview";
    const requestedSkill = searchParams.get("skill") || undefined;

    // If no projectId provided, return user's projects list
    if (!projectId) {
      const projects = await prisma.project.findMany({
        where: { userId: authResult.user.id },
        select: {
          id: true,
          appName: true,
          appIdea: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 20,
      });

      return NextResponse.json({
        success: true,
        projects,
      });
    }

    const project = await prisma.project.findUnique({
      where: { id_userId: { id: projectId, userId: authResult.user.id } },
      select: {
        id: true,
        userId: true,
        appName: true,
        appIdea: true,
        formInputs: true,
        strukturData: true,
        prdData: true,
        taskData: true,
        designData: true,
        status: true,
        checkedTasks: true,
        finishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found or unauthorized" }, { status: 404 });
    }

    // Parse JSON fields safely
    let tasks = [];
    let savedStatus = {};
    let structure = null;

    if (project.taskData) {
      try { tasks = JSON.parse(project.taskData); } catch {}
    }
    if (project.checkedTasks) {
      try { savedStatus = JSON.parse(project.checkedTasks); } catch {}
    }
    if (project.strukturData) {
      try { structure = JSON.parse(project.strukturData); } catch {}
    }

    if (section === "prd") {
      return NextResponse.json({
        success: true,
        projectId: project.id,
        appName: project.appName,
        prd: project.prdData || "",
      });
    }

    if (section === "mindmap") {
      return NextResponse.json({
        success: true,
        projectId: project.id,
        appName: project.appName,
        structure,
      });
    }

    if (section === "directives") {
      return NextResponse.json({
        success: true,
        systemDirectives: SYSTEM_DIRECTIVES.systemDirectives,
        tasteSkill: TASTE_SKILL_DIRECTIVES,
      });
    }

    if (section === "taste-skill") {
      const { rawText } = parseStoredDesign(project.designData || "");
      const formInputs = parseFormInputs(project.formInputs);
      const routingText = [
        rawText,
        formInputs?.designPreference,
        (formInputs?.dynamicAnswers as Record<string, unknown> | undefined)?.designPreference,
      ]
        .filter((v): v is string => typeof v === "string" && Boolean(v))
        .join("\n\n");
      const filteredSkill = getFilteredTasteSkill(routingText, requestedSkill);
      return NextResponse.json({
        success: true,
        tasteSkill: filteredSkill,
      });
    }

    if (section === "design") {
      const { design } = parseStoredDesign(project.designData || "");
      return NextResponse.json({
        success: true,
        design,
      });
    }

    if (section === "context") {
      const { rawText, design } = parseStoredDesign(project.designData || "");
      const formInputs = parseFormInputs(project.formInputs);

      // SELECTIVE TASTE SKILL PAYLOAD REDUCTION
      // Filter tasteSkill to include ONLY the 1 matching skill for this project,
      // and embed only an EXCERPT of it (fullContent:false) so .moryn/context.md
      // stays token-efficient (the default skill file is ~89 KB). The agent can
      // fetch the complete skill on demand via section=taste-skill&skill=<key>.
      const routingText = [
        rawText,
        formInputs?.designPreference,
        (formInputs?.dynamicAnswers as Record<string, unknown> | undefined)?.designPreference,
      ]
        .filter((v): v is string => typeof v === "string" && Boolean(v))
        .join("\n\n");
      const selectiveTasteSkill = getFilteredTasteSkill(routingText, requestedSkill, { fullContent: false });

      const contextPayload = {
        project: {
          id: project.id,
          appName: project.appName,
          appIdea: project.appIdea,
          status: project.status,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
        formInputs,
        structure,
        prd: project.prdData || "",
        design,
        tasks,
        taskStatuses: savedStatus,
        directives: {
          antiHallucinationRules: SYSTEM_DIRECTIVES.systemDirectives.antiHallucinationRules,
          codeQuality: SYSTEM_DIRECTIVES.systemDirectives.codeQuality,
          tasteSkill: selectiveTasteSkill,
        },
      };

      // Backward compatibility: ?format=json returns the legacy pure JSON
      const format = searchParams.get("format");
      if (format === "json") {
        return NextResponse.json({ success: true, ...contextPayload });
      }

      // Default: Hybrid format (XML + Markdown + JSON) for optimal AI Agent consumption
      const hybridOutput = serializeContextToHybrid(contextPayload as any);
      return new NextResponse(hybridOutput, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // Default: Overview
    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        appName: project.appName,
        appIdea: project.appIdea,
        status: project.status,
        taskCount: tasks.length,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Agent project API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
