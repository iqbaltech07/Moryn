export const SYSTEM_DIRECTIVES = {
  systemDirectives: {
    antiHallucinationRules: {
      severity: "CRITICAL",
      rules: [
        {
          id: "AH-001",
          rule: "ZERO INVENTION: Never add unapproved libraries, frameworks, or dependencies outside explicit PRD specs.",
          validation: "Cross-check imports with PRD tech stack before writing.",
          failure_consequence: "Build failure, security vulnerability, dependency bloat."
        },
        {
          id: "AH-002",
          rule: "ZERO ASSUMPTION: Never assume database schemas, API contracts, response shapes, or undocumented business logic.",
          validation: "Verify from PRD & existing code first. If missing, flag explicitly.",
          failure_consequence: "Data mismatch, runtime errors, silent failure."
        },
        {
          id: "AH-003",
          rule: "STATUS SYNC: Update task status to 'in_progress' on start and 'done' upon verified completion via .moryn/sync.",
          validation: "Execute .moryn/sync start <id> and .moryn/sync complete <id>.",
          failure_consequence: "Broken Kanban tracking, desynchronized workflow."
        },
        {
          id: "AH-004",
          rule: "REALITY CHECK: Flag missing backend/API dependencies as blockers; never silent mock unverified endpoints.",
          validation: "Add inline blocker notice if dependent service is unavailable.",
          failure_consequence: "False progress, broken downstream integration."
        },
        {
          id: "AH-005",
          rule: "DESIGN SYSTEM SYNC: Verify design tokens in <design_data> before generating frontend components.",
          validation: "Adhere to specified design tokens (colors, typography, radius).",
          failure_consequence: "Inconsistent UI aesthetics (AI slop)."
        },
        {
          id: "AH-006",
          rule: "CHECKPOINT HONOR: Stop and await user confirmation when encountering tasks marked [CHECKPOINT] or isCheckpoint: true.",
          validation: "Summarize progress to user and wait for confirmation before proceeding.",
          failure_consequence: "Skipped user approval and architectural drift."
        },
        {
          id: "AH-007",
          rule: "DESIGN TOKEN GROUND TRUTH: Use exact HEX colors and typography from <design_data>; never invent arbitrary colors.",
          validation: "Match all background, surface, border, and accent colors to token table.",
          failure_consequence: "Visual inconsistency and unapproved palette drift."
        },
        {
          id: "AH-008",
          rule: "ZERO DUMMY DATA IN PRODUCTION: Replace all mock/dummy static arrays with real API and database seed data in Phase 6.",
          validation: "Ensure frontend components bind to real backend data contracts.",
          failure_consequence: "Application displays fake static data in production."
        },
        {
          id: "AH-009",
          rule: "MODERN CONVENTIONS VERIFICATION: Verify official latest framework conventions (Next.js 16 App Router, Turbopack, Better-Auth) before writing files.",
          validation: "Check official documentation via MCP Context7/Web.",
          failure_consequence: "Deprecated file conventions and compilation failures."
        },
        {
          id: "AH-010",
          rule: "DEFINITION OF DONE: Strictly verify task completion criteria and acceptance criteria before marking done.",
          validation: "Run local verification checks (lint, typecheck, build) to confirm.",
          failure_consequence: "Premature task completion with hidden regressions."
        },
        {
          id: "AH-011",
          rule: "DESIGN SKILL ROUTING: Activate and align with the specified taste skill key in <system_directives>.",
          validation: "Apply active skill rules during frontend component engineering.",
          failure_consequence: "Incorrect visual archetype implementation."
        },
        {
          id: "AH-012",
          rule: "AUTONOMOUS COMPONENT DISCOVERY & BESPOKE SYNTHESIS: Autonomously research and synthesize modern UI components, motion physics, and visual metaphors via web docs (React Bits, 21st.dev, Framer Motion, Magic UI) tailored to the product domain. Strictly forbid repetitive default-template anchoring.",
          validation: "Conduct autonomous discovery before UI coding and cite researched docs/URLs in <skill_comprehension>.",
          failure_consequence: "Repetitive, uninspired generic UI slop across projects."
        },
        {
          id: "AH-013",
          rule: "ON-DEMAND TASTE SKILL: Fetch full taste skill via .moryn/sync taste <key> for complex UI scaffolding.",
          validation: "Ensure complete design guidelines are digested before large frontend refactors.",
          failure_consequence: "Generic boilerplate UI."
        },
        {
          id: "AH-014",
          rule: "ZERO-SLOP VISUAL QUALITY: Ensure premium agency-grade aesthetics. Forbid default #0F172A navy, #000000 pure black, and uniform rounded-2xl.",
          validation: "Use Obsidian surfaces (#090A0C, #121318) and proportional radius hierarchy.",
          failure_consequence: "Generic amateur appearance."
        },
        {
          id: "AH-015",
          rule: "CONTEXT PERSISTENCE: Re-verify .moryn/context.md before starting new tasks to maintain 100% project memory.",
          validation: "Read local context file snapshot at the beginning of task execution.",
          failure_consequence: "Context loss during long chat sessions."
        },
        {
          id: "AH-016",
          rule: "CHUNK-READ FOR LARGE FILES: Use chunked reading (StartLine/EndLine) for files >800 lines to ensure zero truncated context.",
          validation: "Read large documentation and source files completely across chunks.",
          failure_consequence: "Truncated instructions and missed critical constraints."
        },
        {
          id: "AH-017",
          rule: "CONTEXT FRESHNESS: If project updatedAt is newer than snapshot generatedAt, refresh via .moryn/sync context > .moryn/context.md.",
          validation: "Verify freshness timestamp before executing tasks.",
          failure_consequence: "Working on outdated requirements."
        },
        {
          id: "AH-018",
          rule: "COMPREHENSIVE DESIGN COMPLIANCE: 100% adherence to design tokens, layout hierarchy, and typography constraints.",
          validation: "Apply exact specified HEX codes, tracking, and spacing.",
          failure_consequence: "Visual design rejected by quality linter."
        },
        {
          id: "AH-019",
          rule: "MANDATORY FRONTEND DESIGN THINKING & CREATIVE THESIS [CRITICAL]: Sebelum membuat atau mengubah komponen UI/UX Frontend, AI Agent WAJIB melakukan Autonomous Discovery (mencari referensi docs/web komponen modern), serta merumuskan tesis desain di blok '<design_plan>' (1. Product Visual Metaphor, 2. Bespoke Interaction Recipes, 3. Intentionally Rejected Clichés). Dilarang keras jatuh ke bias heuristik aman.",
          validation: "Pastikan pemikiran desain frontend-design dimuat dan diterapkan pada setiap komponen visual.",
          failure_consequence: "Desain UI terlihat generik, templated, dan kehilangan karakter produk."
        },
        {
          id: "AH-021",
          rule: "SHADCN/UI COMPONENT MANDATE: Use shadcn/ui primitives (@/components/ui/*) for all UI components. Never create raw unstyled HTML buttons/inputs.",
          validation: "Import UI elements from @/components/ui/*.",
          failure_consequence: "Non-standardized UI primitives."
        },
        {
          id: "AH-022",
          rule: "ZERO NO-OP STUBS & INTERACTIVE RUNTIME FIDELITY: Every interactive element (button, link, form, modal trigger, tab) MUST have a functional runtime handler, real state mutation, or working destination URL. Strictly prohibit empty 'onClick={() => {}}', placeholder 'console.log', dead 'href=\"#\"', or dummy alert() as deliverables.",
          validation: "Verify all buttons and form submissions trigger real state changes, modals, or API calls.",
          failure_consequence: "Broken, non-functional cosmetic UI stubs delivered to users."
        },
        {
          id: "AH-023",
          rule: "AGGRESSIVE DEAD-CODE CLEANUP & REFACTORING HYGIENE: When updating, refactoring, or switching themes, AI Agent MUST aggressively delete dead components, obsolete variables, unused imports, and commented-out code blocks. Never append new code without pruning dead code.",
          validation: "Ensure zero orphaned code blocks or bloated dead files remain after edits.",
          failure_consequence: "Severe code bloat, technical debt, and context window pollution."
        }
      ],
      designHierarchy: {
        rule: "HIERARCHY: design.md (WHAT to build) > Taste Skill (HOW to build)",
        level1_ground_truth: "design.md / <design_data>: Ground truth for specific HEX tokens, fonts, and layout.",
        level2_engineering_quality: "Taste Skill: Standards for spacing, spring motion (150-250ms), and contrast.",
        conflictResolution: "Use design.md exact tokens with Taste Skill engineering precision."
      },
      selfCheckPrompt: "Did I use exact HEX tokens from design.md? Are all acceptance criteria met? Did I run local lint/build?"
    },

    codeQuality: {
      severity: "HIGH",
      typeScript: {
        FORBIDDEN: [
          "Type 'any' (unless strictly necessary with inline comment)",
          "Redundant type assertions (e.g. `as string` when inferred)",
          "Unexplained // @ts-ignore"
        ],
        REQUIRED: [
          "Strict typing for all function parameters and returns",
          "Explicit interfaces/types for API payloads and data models"
        ],
        example: "interface ProjectData { id: string; name: string; }"
      },
      architecture: {
        rules: [
          "Co-locate components with their subcomponents",
          "Custom hooks for complex UI state management",
          "Centralized API client for all network requests"
        ]
      },
      componentStructure: {
        order: ["Imports", "Interfaces/Types", "Component", "Subcomponents", "Styles"]
      }
    }
  }
};