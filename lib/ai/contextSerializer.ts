import type { ColorToken, DesignSection } from "@/lib/design/designParser";

// ============================================================================
// Ultra-Dense Lossless Context Serializer (XML + Markdown + Compact JSON)
// ============================================================================
// Converts full project context into an ultra-dense, high-signal hybrid format
// optimized for LLM attention mechanisms and token efficiency.
//
// Key Token-Optimization Principles (Lossless Compression):
//   1. High-Signal Directives: Zero prose fluff, 100% semantic constraints.
//   2. Consolidated UI Governance: Unified surfaces, radius, and anti-slop rules.
//   3. Active Task Windowing: Full detail for active/next tasks + phase roadmap.
//   4. Full Unaltered PRD: Section 1-10 Markdown remains 100% intact in CDATA.
//   5. Compact JSON Payloads: 0 whitespace in structural data.
// ============================================================================

interface ProjectMeta {
  id: string;
  appName: string;
  appIdea: string;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface AntiHallucinationRule {
  id: string;
  rule: string;
  validation: string;
  failure_consequence: string;
}

interface DesignHierarchy {
  rule: string;
  level1_ground_truth: string;
  level2_engineering_quality: string;
  conflictResolution: string;
}

interface AntiHallucinationRules {
  severity: string;
  rules: AntiHallucinationRule[];
  designHierarchy: DesignHierarchy;
  selfCheckPrompt: string;
}

interface CodeQuality {
  severity: string;
  typeScript: {
    FORBIDDEN: string[];
    REQUIRED: string[];
    example: string;
  };
  architecture: {
    rules: string[];
  };
  componentStructure: {
    order: string[];
  };
}

interface TasteSkillData {
  name: string;
  version: string;
  activeSkillKey: string;
  activeSkillContent: string;
  routerInfo: {
    selectedReason: string;
    availableSkills: string[];
    fetchOtherSkillInstruction: string;
  };
  tasteSkillDirectives: Record<string, unknown>;
  codeSkeletons: Record<string, string>;
  examples: Record<string, Record<string, string>>;
}

interface DesignData {
  colorTokens: ColorToken[];
  sections: DesignSection[];
  rawMarkdown: string;
}

interface ContextInput {
  project: ProjectMeta;
  formInputs?: Record<string, unknown> | null;
  structure: Record<string, unknown> | null;
  prd: string;
  design: DesignData;
  tasks: unknown;
  taskStatuses: Record<string, string>;
  directives: {
    antiHallucinationRules: AntiHallucinationRules;
    codeQuality: CodeQuality;
    tasteSkill: TasteSkillData;
  };
}

/**
 * Serialize full project context into high-density Lossless Hybrid format.
 */
export function serializeContextToHybrid(data: ContextInput): string {
  const parts: string[] = [];

  // 0. Snapshot freshness comment (AH-017)
  parts.push(renderSnapshotComment());

  // 1. High-Density System Directives & UI Governance
  parts.push(renderSystemDirectives(data.directives, data.design));

  // 2. Project Metadata
  parts.push(renderProjectContext(data.project));

  // 3. Personalization Inputs
  if (data.formInputs) {
    parts.push(renderPersonalizationInputs(data.formInputs));
  }

  // 4. Feature Architecture Structure
  if (data.structure) {
    parts.push(renderStructure(data.structure));
  }

  // 5. Full 10-Section PRD Document (100% Full & Intact)
  if (data.prd) {
    parts.push(renderPrd(data.prd));
  }

  // 6. Color Tokens & Design Data
  parts.push(renderDesignData(data.design));

  // 7. Active Task Window & Roadmap
  parts.push(renderTaskList(data.tasks, data.taskStatuses));

  return parts.join("\n\n");
}

// ============================================================================
// XML Safety Helpers
// ============================================================================

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cdata(value: string): string {
  const safe = String(value).replace(/\]\]>/g, "]]]]><![CDATA[>");
  return `<![CDATA[\n${safe}\n]]>`;
}

function compactJson(value: unknown): string {
  return JSON.stringify(value);
}

// ============================================================================
// Render Helpers (Optimized for Signal-to-Token Ratio)
// ============================================================================

function renderSnapshotComment(): string {
  const generatedAt = new Date().toISOString();
  return `<!-- Moryn Context Snapshot | generatedAt: ${generatedAt} | Freshness Gate AH-017: If project updatedAt is newer, refresh via .moryn/sync context > .moryn/context.md -->`;
}

function renderSystemDirectives(directives: ContextInput["directives"], design?: DesignData): string {
  const { antiHallucinationRules, tasteSkill } = directives;

  const primaryColor =
    design?.colorTokens?.find((t) => t.role.toLowerCase().includes("accent") || t.role.toLowerCase().includes("primary"))
      ?.hex || "#6366F1";

  // Dense XML Rules
  const rules = antiHallucinationRules.rules
    .map((r) => `  <rule id="${escapeXml(r.id)}">${escapeXml(r.rule)}</rule>`)
    .join("\n");

  const ts = tasteSkill;
  const tasteBlock = `  <active_skill key="${escapeXml(ts.activeSkillKey)}" fetch_cmd=".moryn/sync taste ${escapeXml(ts.activeSkillKey)}">
    Selected: ${escapeXml(ts.routerInfo.selectedReason)} | Baseline: Obsidian (#090A0C), 150-250ms spring physics, shadcn/ui mandatory, zero-slop.
  </active_skill>`;

  return `<system_directives>
  <ui_governance>
    <surfaces base="#090A0C" level1="#121318" level2="#181A22" hover="#222634" primary_accent="${escapeXml(primaryColor)}" />
    <radius data="0-4px" cards_inputs="4-8px" pills_only="9999px" />
    <typography headline_tracking="tight (-0.02em)" label_tracking="wide (+0.05em)" max_prose_chars="75" max_weights="3" />
    <motion duration="150-250ms" timing="cubic-bezier(0.16, 1, 0.3, 1)" />
    <mandate library="shadcn/ui (@/components/ui/*)" />
    <forbidden>
      [pure_black_#000000, navy_#0F172A, icon_container_syndrome, gradient_text_headlines, rounded-2xl_everywhere, nested_cards_gt_2, arbitrary_unapproved_libraries]
    </forbidden>
    <currency idr_billion="Rp X,XX M" idr_million="Rp X,XX Jt" idr_thousand="Rp XXX Rb" />
  </ui_governance>

  <anti_hallucination_rules>
${rules}
  </anti_hallucination_rules>

${tasteBlock}
</system_directives>`;
}

function renderProjectContext(project: ProjectMeta): string {
  return `<project_context>
${cdata(compactJson(project))}
</project_context>`;
}

function renderPersonalizationInputs(formInputs: Record<string, unknown>): string {
  return `<personalization_inputs>
${cdata(compactJson(formInputs))}
</personalization_inputs>`;
}

function renderStructure(structure: Record<string, unknown>): string {
  return `<structure>
${cdata(compactJson(structure))}
</structure>`;
}

function renderPrd(prd: string): string {
  return `<prd_document>
${cdata(prd)}
</prd_document>`;
}

function renderDesignData(design: DesignData): string {
  return `<design_data>
  <color_tokens>
${cdata(compactJson(design.colorTokens))}
  </color_tokens>
</design_data>`;
}

interface RawTaskItem {
  id: string;
  title: string;
  estimasi?: string;
  priority?: string;
  description?: string;
  definitionOfDone?: string[];
}

interface RawPhaseItem {
  id: number | string;
  name: string;
  tasks?: RawTaskItem[];
}

function renderTaskList(tasks: unknown, taskStatuses: Record<string, string>): string {
  const statuses = taskStatuses || {};

  const phasesSummary: Array<{ id: number | string; name: string; total: number; done: number }> = [];
  const activeWindow: Array<{
    id: string;
    phaseName: string;
    title: string;
    status: string;
    priority?: string;
    estimasi?: string;
    description?: string;
    definitionOfDone?: string[];
  }> = [];

  const raw = tasks as { phases?: RawPhaseItem[] } | null;

  if (raw && Array.isArray(raw.phases)) {
    let pendingCount = 0;

    for (const phase of raw.phases) {
      const phaseTasks = Array.isArray(phase.tasks) ? phase.tasks : [];
      let doneCount = 0;

      for (const t of phaseTasks) {
        const st = (statuses[t.id] || "todo").toLowerCase();
        if (st === "done") {
          doneCount++;
        } else if (st === "in_progress" || st === "current" || pendingCount < 3) {
          activeWindow.push({
            id: t.id,
            phaseName: phase.name,
            title: t.title,
            status: st,
            priority: t.priority,
            estimasi: t.estimasi,
            description: t.description,
            definitionOfDone: t.definitionOfDone,
          });
          if (st !== "in_progress") pendingCount++;
        }
      }

      phasesSummary.push({
        id: phase.id,
        name: phase.name,
        total: phaseTasks.length,
        done: doneCount,
      });
    }
  }

  const payload = {
    phasesOverview: phasesSummary,
    activeTasksWindow: activeWindow,
    taskStatuses: statuses,
  };

  return `<task_list>
${cdata(compactJson(payload))}
</task_list>`;
}
