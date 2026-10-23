export interface RawKnowledgeChunk {
  category: "user_input" | "structure" | "prd" | "task";
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

/**
 * Chunks user project basic info, chosen tech stacks, and 7 question answers.
 */
export function chunkUserInput(
  appName: string,
  appIdea: string,
  formInputs: Record<string, unknown>
): RawKnowledgeChunk[] {
  const chunks: RawKnowledgeChunk[] = [];

  // 1. Core Vision & Idea
  const stacks = (formInputs.stacks as Record<string, string>) || {};
  const stackSummary = Object.entries(stacks)
    .filter(([, v]) => Boolean(v))
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  chunks.push({
    category: "user_input",
    title: `App Overview & Vision: ${appName}`,
    content: `Application Name: ${appName}\nCore Vision & Idea:\n${appIdea}\nTarget Tech Stacks: ${stackSummary || "AI Recommended"}`,
    metadata: { appName, type: "overview" },
  });

  // 2. Individual Question Answers
  const dynamicAnswers = (formInputs.dynamicAnswers as Record<string, unknown>) || {};
  for (const [key, value] of Object.entries(dynamicAnswers)) {
    if (!value) continue;
    const formattedValue =
      Array.isArray(value) ? value.join(", ") : typeof value === "object" ? JSON.stringify(value) : String(value);

    chunks.push({
      category: "user_input",
      title: `User Requirement Specification: ${key}`,
      content: `Question Key: ${key}\nUser Selection & Specification: ${formattedValue}`,
      metadata: { key, type: "question_answer" },
    });
  }

  return chunks;
}

/**
 * Chunks feature structure mindmap nodes into atomic architecture modules.
 */
export function chunkStructureData(strukturData: unknown): RawKnowledgeChunk[] {
  const chunks: RawKnowledgeChunk[] = [];
  if (!strukturData) return chunks;

  try {
    const data = (typeof strukturData === "string" ? JSON.parse(strukturData) : strukturData) as {
      title?: string;
      description?: string;
      nodes?: Array<{ id: string; label: string; phase: number; children?: Array<{ label: string }> }>;
    };

    // Global Structure Summary
    if (data.title || data.description) {
      chunks.push({
        category: "structure",
        title: `Architecture Blueprint: ${data.title || "Feature Map"}`,
        content: `Architecture Overview:\n${data.description || ""}\nTotal Modules: ${data.nodes?.length || 0}`,
        metadata: { type: "structure_root" },
      });
    }

    // Individual Modules
    if (Array.isArray(data.nodes)) {
      data.nodes.forEach((node) => {
        const childrenList = (node.children || []).map((c) => `- ${c.label}`).join("\n");
        chunks.push({
          category: "structure",
          title: `Architecture Module [Phase ${node.phase}]: ${node.label}`,
          content: `Module: ${node.label}\nImplementation Phase: Phase ${node.phase}\nKey Capabilities & Features:\n${childrenList || "Core baseline"}`,
          metadata: { nodeId: node.id, phase: node.phase, type: "module" },
        });
      });
    }
  } catch (err) {
    console.warn("[Chunker] Failed to chunk structureData:", err);
  }

  return chunks;
}

/**
 * Chunks a 10-section PRD markdown into individual structural sections.
 */
export function chunkPrdMarkdown(prdMarkdown: string): RawKnowledgeChunk[] {
  const chunks: RawKnowledgeChunk[] = [];
  if (!prdMarkdown || !prdMarkdown.trim()) return chunks;

  // Split by top-level or secondary Markdown headers (# or ##)
  const sections = prdMarkdown.split(/(?=\n##?\s+[0-9A-Za-z])/g);

  sections.forEach((sec, idx) => {
    const trimmed = sec.trim();
    if (!trimmed) return;

    // Extract title
    const headerMatch = trimmed.match(/^##?\s+(.+)/m);
    const title = headerMatch ? headerMatch[1].trim() : `PRD Specification Section ${idx + 1}`;

    chunks.push({
      category: "prd",
      title: `PRD: ${title}`,
      content: trimmed.slice(0, 3500),
      metadata: { sectionIndex: idx + 1, sectionTitle: title },
    });
  });

  return chunks;
}

/**
 * Chunks Kanban tasks into phase groups and milestone tickets.
 */
export function chunkTaskData(taskData: unknown): RawKnowledgeChunk[] {
  const chunks: RawKnowledgeChunk[] = [];
  if (!taskData) return chunks;

  try {
    const data = (typeof taskData === "string" ? JSON.parse(taskData) : taskData) as {
      phases?: Array<{
        id: string;
        name: string;
        description?: string;
        tasks?: Array<{
          id: string;
          title: string;
          description?: string;
          isCheckpoint?: boolean;
          definitionOfDone?: string;
        }>;
      }>;
    };

    if (Array.isArray(data.phases)) {
      data.phases.forEach((phase, pIdx) => {
        const taskTitles = (phase.tasks || [])
          .map((t) => `[${t.id}] ${t.title}${t.isCheckpoint ? " (MILESTONE)" : ""}`)
          .join("\n");

        chunks.push({
          category: "task",
          title: `Kanban Roadmap: ${phase.name}`,
          content: `Phase: ${phase.name}\nDescription: ${phase.description || ""}\nTasks:\n${taskTitles}`,
          metadata: { phaseIndex: pIdx + 1, phaseId: phase.id },
        });
      });
    }
  } catch (err) {
    console.warn("[Chunker] Failed to chunk taskData:", err);
  }

  return chunks;
}

/**
 * Chunks custom user design schema markdown into searchable RAG knowledge chunks.
 */
export function chunkDesignData(designData: unknown): RawKnowledgeChunk[] {
  const chunks: RawKnowledgeChunk[] = [];
  if (!designData) return chunks;

  try {
    let rawMarkdown = "";
    let colorTokens: Array<{ token: string; hex: string; role: string }> = [];

    if (typeof designData === "string") {
      if (designData.startsWith("{") && designData.includes("rawMarkdown")) {
        const parsed = JSON.parse(designData);
        rawMarkdown = parsed.rawMarkdown || "";
        colorTokens = parsed.colorTokens || [];
      } else {
        rawMarkdown = designData;
      }
    } else if (typeof designData === "object" && designData !== null) {
      const obj = designData as Record<string, unknown>;
      rawMarkdown = (obj.rawMarkdown as string) || "";
      colorTokens = (obj.colorTokens as Array<{ token: string; hex: string; role: string }>) || [];
    }

    if (!rawMarkdown && colorTokens.length === 0) return chunks;

    // 1. Color Tokens & Palette Chunk
    if (colorTokens.length > 0) {
      const tokenList = colorTokens
        .map((tok) => `- \`${tok.token}\`: ${tok.hex} (${tok.role})`)
        .join("\n");

      chunks.push({
        category: "user_input",
        title: "User Custom Design System: Color Tokens & Palette",
        content: `Custom UI Palette & Color Tokens:\n${tokenList}`,
        metadata: { type: "custom_design_tokens", tokenCount: colorTokens.length },
      });
    }

    // 2. Sections of Markdown
    if (rawMarkdown) {
      const sections = rawMarkdown.split(/(?=\n##?\s+[0-9A-Za-z])/g);
      sections.forEach((sec, idx) => {
        const trimmed = sec.trim();
        if (!trimmed) return;

        const headerMatch = trimmed.match(/^##?\s+(.+)/m);
        const title = headerMatch ? headerMatch[1].trim() : `Design Specification Part ${idx + 1}`;

        chunks.push({
          category: "user_input",
          title: `User Design Spec: ${title}`,
          content: trimmed.slice(0, 3000),
          metadata: { type: "custom_design_section", sectionIndex: idx + 1 },
        });
      });
    }
  } catch (err) {
    console.warn("[Chunker] Failed to chunk designData:", err);
  }

  return chunks;
}

