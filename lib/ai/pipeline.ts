import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis";
import { FastApiClient } from "@/lib/ai/fastapiClient";
import { fixMermaidBlocks } from "@/lib/utils/mermaidFix";
import {
  chunkUserInput,
  chunkStructureData,
  chunkPrdMarkdown,
  chunkTaskData,
  storeProjectChunks,
  retrieveRelevantChunks,
  formatRetrievedContext,
} from "./rag";

export interface PipelineProgress {
  status: "idle" | "in_progress" | "struktur_done" | "prd_done" | "all_done" | "error";
  currentStage?: "struktur" | "prd" | "tasks";
  error?: string;
  updatedAt: number;
}

interface StrukturNodeItem {
  id?: string;
  label?: string;
  phase?: number;
  children?: Array<{ label?: string } | string>;
}

interface StrukturPayload {
  title?: string;
  description?: string;
  nodes?: StrukturNodeItem[];
}

/**
 * Formats a StrukturData object into a concise, high-signal structural markdown summary
 * to be fed as context into PRD and Tasks generation.
 */
export function formatStructureSummary(strukturData: unknown): string {
  if (!strukturData) return "";
  try {
    const data = (typeof strukturData === "string" ? JSON.parse(strukturData) : strukturData) as StrukturPayload;
    const lines: string[] = [];

    if (data.title) lines.push(`Project Title: ${data.title}`);
    if (data.description) lines.push(`Summary: ${data.description}`);
    lines.push("\nFeature & Module Hierarchy by Rollout Phase (FROM ARCHITECTURE BLUEPRINT):");

    if (Array.isArray(data.nodes) && data.nodes.length > 0) {
      // Group by phase in ascending order (Phase 1, Phase 2, Phase 3...)
      const phaseMap: Record<number, StrukturNodeItem[]> = {};
      data.nodes.forEach((node) => {
        const p = typeof node.phase === "number" && !isNaN(node.phase) ? node.phase : 1;
        if (!phaseMap[p]) phaseMap[p] = [];
        phaseMap[p].push(node);
      });

      const sortedPhases = Object.keys(phaseMap).map(Number).sort((a, b) => a - b);
      sortedPhases.forEach((p) => {
        lines.push(`\n=== FASE ${p} MODULES ===`);
        phaseMap[p].forEach((node, nodeIdx) => {
          lines.push(`- Module ${p}.${nodeIdx + 1}: ${node.label || "Untitled"}`);
          if (Array.isArray(node.children) && node.children.length > 0) {
            node.children.forEach((c) => {
              const label = typeof c === "string" ? c : c.label || "";
              if (label) lines.push(`   * Sub-feature: ${label}`);
            });
          }
        });
      });

      lines.push(
        "\nCRITICAL DIRECTIVE FOR PRD SECTION 3 (CORE FEATURES):\n" +
        "You MUST organize Section 3 (Core Features) strictly according to these phases and modules above.\n" +
        "Use exact H3 headers for each phase (e.g. '### Fase 1 — [Module Name]', '### Fase 2 — [Module Name]').\n" +
        "Include the exact sub-features listed under each module so the PRD and Structure Blueprint are 100% identical, coherent, and unambiguous."
      );
    }

    return lines.join("\n");
  } catch {
    return "";
  }
}

/**
 * Executes the unified, 3-stage sequential generation cascade in the background
 * with official Gemini gemini-embedding-001 Vector Ingestion and RAG Context Retrieval:
 *
 * Stage 0: Chunk & Embed User Inputs into Persistent Vector Store
 * Stage 1: Generate Structure -> Chunk & Embed into Vector Store
 * Stage 2: RAG Retrieve Structure + User Answers -> Generate PRD -> Chunk & Embed into Vector Store
 * Stage 3: RAG Retrieve PRD + Structure -> Generate Tasks -> Chunk & Embed into Vector Store
 */
export async function runSequentialGenerationPipeline(projectId: string): Promise<void> {
  const pipelineStatusKey = `project:${projectId}:pipeline_status`;

  try {
    // 1. Fetch project and user form inputs
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        appName: true,
        appIdea: true,
        formInputs: true,
        strukturData: true,
        prdData: true,
        taskData: true,
      },
    });

    if (!project) {
      console.warn(`[Pipeline] Project ${projectId} not found.`);
      return;
    }

    const formInputs = (project.formInputs ? JSON.parse(project.formInputs) : {}) as Record<string, unknown>;
    const stacks = formInputs.stacks as Record<string, unknown> | undefined;
    const dynamicAnswers = formInputs.dynamicAnswers as Record<string, unknown> | undefined;
    const designPrefVal = dynamicAnswers?.designPreference || formInputs.designPreference;
    const designPreference = typeof designPrefVal === "string" ? designPrefVal : undefined;
    const language = (formInputs.language === "id" ? "id" : "en") as "en" | "id";

    await redis.set(pipelineStatusKey, {
      status: "in_progress",
      currentStage: "struktur",
      updatedAt: Date.now(),
    } satisfies PipelineProgress);

    // ──────────────────────────────────────────────────────────────────────────
    // STAGE 0: VECTOR INGESTION - USER INPUTS & ANSWERS
    // ──────────────────────────────────────────────────────────────────────────
    try {
      const userChunks = chunkUserInput(project.appName, project.appIdea, formInputs);
      await storeProjectChunks(projectId, userChunks);
      console.log(`[Pipeline] Stage 0 completed: User input chunks embedded in vector store.`);
    } catch (ingestErr) {
      console.warn("[Pipeline] User input vector ingestion warning:", ingestErr);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STAGE 1: STRUCTURE GENERATION & VECTOR INGESTION
    // ──────────────────────────────────────────────────────────────────────────
    let strukturData = project.strukturData ? JSON.parse(project.strukturData) : null;

    if (!strukturData) {
      console.log(`[Pipeline] Stage 1: Generating Structure for ${project.appName}...`);
      const strukturRes = await FastApiClient.generateStruktur({
        appName: project.appName,
        appIdea: project.appIdea,
        stacks,
        dynamicAnswers,
        language,
      });

      if (strukturRes?.data) {
        strukturData = strukturRes.data;
        await prisma.project.update({
          where: { id: projectId },
          data: { strukturData: JSON.stringify(strukturData) },
        });
        await redis.set(`project:${projectId}:struktur`, strukturData);

        // Vector Ingestion for Structure
        const structureChunks = chunkStructureData(strukturData);
        await storeProjectChunks(projectId, structureChunks);
        console.log(`[Pipeline] Stage 1 completed: Structure saved & embedded for ${project.appName}.`);
      } else {
        throw new Error("Failed to generate structure in pipeline Stage 1.");
      }
    } else {
      await redis.set(`project:${projectId}:struktur`, strukturData);
    }

    await redis.set(pipelineStatusKey, {
      status: "struktur_done",
      currentStage: "prd",
      updatedAt: Date.now(),
    } satisfies PipelineProgress);

    const baseStructureSummary = formatStructureSummary(strukturData);

    // ──────────────────────────────────────────────────────────────────────────
    // STAGE 2: PRD GENERATION (RAG Augmented Context: User Answers + Structure)
    // ──────────────────────────────────────────────────────────────────────────
    let cleanPrd = project.prdData || null;

    if (!cleanPrd) {
      console.log(`[Pipeline] Stage 2: Performing RAG & generating PRD for ${project.appName}...`);

      // Semantic RAG retrieval: Find most relevant structure and user requirement chunks
      let ragContext = "";
      try {
        const retrieved = await retrieveRelevantChunks(
          projectId,
          `App concept ${project.appName} ${project.appIdea} core architecture modules requirements`,
          { topK: 8, minSimilarity: 0.48 }
        );
        ragContext = formatRetrievedContext(retrieved);
      } catch (ragErr) {
        console.warn("[Pipeline] RAG retrieval warning for PRD:", ragErr);
      }

      const combinedStructureContext = [
        baseStructureSummary,
        ragContext ? `\n=== GROUNDED VECTOR KNOWLEDGE (RAG) ===\n${ragContext}` : "",
      ].filter(Boolean).join("\n\n");

      const prdRes = await FastApiClient.generatePrd({
        appName: project.appName,
        appIdea: project.appIdea,
        stacks,
        dynamicAnswers,
        designPreference,
        structureContext: combinedStructureContext,
        language,
      });

      if (prdRes?.markdown) {
        cleanPrd = await fixMermaidBlocks(prdRes.markdown);
        await prisma.project.update({
          where: { id: projectId },
          data: { prdData: cleanPrd },
        });
        await redis.set(`project:${projectId}:prd`, cleanPrd);

        // Vector Ingestion for PRD Sections
        const prdChunks = chunkPrdMarkdown(cleanPrd);
        await storeProjectChunks(projectId, prdChunks);
        console.log(`[Pipeline] Stage 2 completed: PRD saved & embedded for ${project.appName}.`);
      } else {
        throw new Error("Failed to generate PRD in pipeline Stage 2.");
      }
    } else {
      await redis.set(`project:${projectId}:prd`, cleanPrd);
    }

    await redis.set(pipelineStatusKey, {
      status: "prd_done",
      currentStage: "tasks",
      updatedAt: Date.now(),
    } satisfies PipelineProgress);

    // ──────────────────────────────────────────────────────────────────────────
    // STAGE 3: KANBAN TASKS GENERATION (RAG Augmented: Full PRD + Structure)
    // ──────────────────────────────────────────────────────────────────────────
    let taskData = project.taskData ? JSON.parse(project.taskData) : null;

    if (!taskData) {
      console.log(`[Pipeline] Stage 3: Performing RAG & generating Kanban Tasks for ${project.appName}...`);

      // Semantic RAG retrieval for Kanban Tasks: query implementation milestones & API specifications
      let tasksRagContext = "";
      try {
        const retrievedForTasks = await retrieveRelevantChunks(
          projectId,
          `Functional specifications, database schema, and technical architecture for tasks breakdown`,
          { topK: 8, minSimilarity: 0.48 }
        );
        tasksRagContext = formatRetrievedContext(retrievedForTasks);
      } catch (ragErr) {
        console.warn("[Pipeline] RAG retrieval warning for Tasks:", ragErr);
      }

      const combinedTasksSummary = [
        baseStructureSummary,
        tasksRagContext ? `\n=== GROUNDED PRD & ARCHITECTURE SPECIFICATIONS (RAG) ===\n${tasksRagContext}` : "",
      ].filter(Boolean).join("\n\n");

      const tasksRes = await FastApiClient.generateTasks({
        appName: project.appName,
        appIdea: project.appIdea,
        prdMarkdown: cleanPrd || undefined,
        strukturSummary: combinedTasksSummary,
        coreFeatures: Array.isArray(formInputs.coreFeatures)
          ? (formInputs.coreFeatures as string[])
          : undefined,
        stacks,
        language,
      });

      if (tasksRes?.data) {
        taskData = tasksRes.data;
        await prisma.project.update({
          where: { id: projectId },
          data: { taskData: JSON.stringify(taskData) },
        });
        await redis.set(`project:${projectId}:tasks`, taskData);

        // Vector Ingestion for Kanban Tasks
        const taskChunks = chunkTaskData(taskData);
        await storeProjectChunks(projectId, taskChunks);
        console.log(`[Pipeline] Stage 3 completed: Tasks saved & embedded for ${project.appName}.`);
      } else {
        throw new Error("Failed to generate Tasks in pipeline Stage 3.");
      }
    } else {
      await redis.set(`project:${projectId}:tasks`, taskData);
    }

    // Mark Pipeline Complete
    await redis.set(pipelineStatusKey, {
      status: "all_done",
      updatedAt: Date.now(),
    } satisfies PipelineProgress);

    console.log(`[Pipeline] Sequential Pipeline & Vector Knowledge finished successfully for project: ${projectId}`);
  } catch (error: unknown) {
    console.error(`[Pipeline Error] Sequential pipeline failed for project ${projectId}:`, error);
    try {
      await redis.set(pipelineStatusKey, {
        status: "error",
        error: error instanceof Error ? error.message : "Pipeline failure",
        updatedAt: Date.now(),
      } satisfies PipelineProgress);
    } catch {}
  }
}

/**
 * Smart wait helper: Polls Redis & DB for a given stage if generation is currently in progress.
 * This prevents duplicate AI calls when a user navigates quickly.
 */
export async function waitForStageResult<T>(
  projectId: string,
  cacheKey: string,
  checkDb: () => Promise<T | null>,
  maxWaitMs: number = 20000,
  intervalMs: number = 1000
): Promise<T | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    // 1. Check Redis
    try {
      const cached = await redis.get<T>(cacheKey);
      if (cached) return cached;
    } catch {}

    // 2. Check Database
    try {
      const dbResult = await checkDb();
      if (dbResult) return dbResult;
    } catch {}

    // 3. Check Pipeline Status
    try {
      const status = await redis.get<PipelineProgress>(`project:${projectId}:pipeline_status`);
      if (status && status.status === "error") {
        return null;
      }
    } catch {}

    // Wait for next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return null;
}
