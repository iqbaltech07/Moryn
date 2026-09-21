---
name: moryn
description: Automated PRD, Architecture Blueprint, Kanban Synchronization, and Task Execution Workflow for Moryn.
---

# 🚀 Moryn Agent Skill

Moryn is an AI PRD Generator & System Architecture Tracking Platform. This skill guides AI Agents to read product blueprints, execute Kanban tasks step-by-step, and automatically sync task status with the Moryn backend without manual user intervention.

## 📌 Single Source of Truth (SSOT) Priority Rules

To prevent AI Agent cognitive overload or token duplication confusion, follow this strict SSOT reading order:
1. **Primary Ground Truth**: `.moryn/context.md` (Contains XML+Markdown top-pinned design locks, layout governance, PRD, and task status in 1 unified snapshot).
2. **Live Remote Design Refresh**: `npx moryn design` (Use ONLY if user specifies they just updated design tokens on the Moryn Web App).
3. **Helper Files**: `.moryn/tokens.json` & `.moryn/anti_slop_rules.md` are programmatic helper caches for CLI commands/linters. AI Agents DO NOT need to read them separately if `.moryn/context.md` has already been read.

---

## 🛠️ Direct Native Commands (Ultra-Fast 10ms Execution)

The Moryn CLI (`npx moryn init`) pre-generates lightweight 10ms native helper scripts (`.moryn/sync` or `.moryn/sync.cmd`) and local blueprint file `.moryn/context.md` for zero-latency execution:

| Action | Native Command (10ms Execution) | Fallback NPX Command |
| :--- | :--- | :--- |
| **Read Project Blueprint & Context** | Read `.moryn/context.md` (0ms) | `npx moryn project context --json` |
| **Fetch Design Context & Tokens** | Read `.moryn/tokens.json` | `npx moryn design` |
| **Get Active Task** | `.moryn/sync current` | `npx moryn task current --json` |
| **Start Task (`IN_PROGRESS`)** | `.moryn/sync start <id>` | `npx moryn task start <id>` |
| **Complete Task (`DONE`)** | `.moryn/sync complete <id>` | `npx moryn task complete <id>` |
| **Record Task Failure (`FAILED`)** | `.moryn/sync fail <id> "<reason>"` | `npx moryn task fail <id> --reason "<r>"` |
| **Fetch Complete Taste Skill** | `.moryn/sync taste <skill-key>` | `npx moryn project taste-skill --skill <skill-key>` |
| **Fetch Modular Design Tokens** | Read `.moryn/tokens.json` | `npx moryn project tokens` |
| **Fetch Anti-Slop Rules** | Read `.moryn/anti_slop_rules.md` | `npx moryn project rules` |
| **Run AST Anti-Slop Linter** | `.moryn/sync validate` | `npx moryn validate-ui` |
| **Generate Theme Boilerplate** | `.moryn/sync theme` | `npx moryn init-theme` |
| **Scaffold Anti-Slop Component** | N/A | `npx moryn scaffold <Name> --type=<hero\|bento\|card\|table\|form\|modal>` |
| **Install Guardrail Hooks** | N/A | `npx moryn hook` |

---

## 📋 Core Workflow Lifecycle

```text
Read Local Context ──► Start Task (10ms) ──► Inspect & Code ──► Local Verification ──► Complete Task (10ms)
 (.moryn/               (.moryn/sync                       (npm run lint/build)      (.moryn/sync
  context.md)             start <id>)                                                  complete <id>)
```

Follow these exact steps when working on a Moryn project:

### Step 1: Read Blueprint in Order (Personalization ──► Structure ──► PRD ──► Design ──► Active Task)
- Read local blueprint file `.moryn/context.md` using `view_file` (0ms token-efficient reading).
- **FRESHNESS GATE (AH-017)**: Bandingkan `generatedAt` di komentar header `<!-- Moryn Context Snapshot -->` dengan `<project_context>.updatedAt`. Jika `updatedAt` LEBIH BARU dari `generatedAt`, konteks sudah basi — refresh dulu:
  ```bash
  .moryn/sync context > .moryn/context.md
  ```
  lalu baca ulang file tersebut.
- Digest the project blueprint in this exact hierarchical sequence:
  1. **`<personalization_inputs>`**: Jawaban 7-step personalization & tech stack (target user, platform, core features, monetisasi, skala, integrasi, design preference).
  2. **`<structure>`**: Visual feature hierarchy, mindmap nodes, dan architectural components.
  3. **`<prd_document>`**: Product Requirements Document (specs, user flow, data flow, API contracts).
  4. **`<design_data>`**: Color tokens, typography, layout rules, dan UI anti-slop guidelines.
  5. **`<task_list>`**: Current task ID, acceptance criteria, dan status.
- Query active task:
  ```bash
  .moryn/sync current
  ```

### Step 2: Start the Task
Before starting code modifications, update the Kanban status to `IN_PROGRESS`:
```bash
.moryn/sync start <task-id>
```

### Step 3: Implement Changes (with Mandatory Autonomous Component Discovery)

> [!IMPORTANT]
> **AUTONOMOUS COMPONENT DISCOVERY PROTOCOL (Anti-Safe-Heuristic Rule):**
> 1. **Zero-Anchor Mandate**: DILARANG KERAS menggunakan template default secara berulang di setiap project (misal: selalu menaruh AuroraBackground, BlurText, atau MagnetButton di semua web tanpa justifikasi domain).
> 2. **Autonomous Research Loop**: Sebelum koding UI, AI WAJIB menjalankan tool riset (`search_web`, `read_url_content`, MCP `context7`, atau MCP `21st`) untuk mencari inspirasi 2-3 komponen/motion modern yang cocok dengan metafora domain produk ini (dari reactbits.dev, 21st.dev, ui.aceternity.com, motion.dev).
> 3. **Creative Thesis Declaration**: Deklarasikan blok `<skill_comprehension>` (mencantumkan URL/docs yang dipelajari) dan blok `<design_plan>` sebelum koding:
>    - `1. PRODUCT VISUAL METAPHOR` (Karakter estetika spesifik domain produk)
>    - `2. BESPOKE INTERACTION RECIPES` (Interaksi unik yang dipilih beserta alasannya)
>    - `3. INTENTIONALLY REJECTED CLICHES` (Template generik yang sengaja ditolak demi keunikan)
- **MANDATORY DESIGN CONTEXT GATE (AH-018)**: Sebelum menulis/mengubah komponen UI/frontend, AI Agent WAJIB membaca 100% Konteks Desain (`npx moryn design` atau `.moryn/sync design`) TANPA ADA SATUPUN ATURAN/TOKEN YANG TERABAIKAN.
- **MANDATORY SHADCN/UI MANDATE (AH-021)**: AI Agent WAJIB MUTLAK menggunakan `shadcn/ui` primitives (`@/components/ui/*`) untuk seluruh pembuatan dan pengeditan komponen UI (Button, Input, Dialog, Select, Card, Sheet, DropdownMenu, Table, Tabs, Tooltip, Popover, Avatar, Badge). Dilarang mengarang komponen raw HTML polos dari nol.
- **MANDATORY RUNTIME FIDELITY GATE (AH-022)**: Seluruh tombol, link, form, dan modal WAJIB memiliki *runtime handler* aktif (state mutation, toast notification, modal dispatch, atau deep link). DILARANG MENINGGALKAN stub kosong (`onClick={() => {}}`), dead link (`href="#"`), atau `alert()` primitif.
- **MANDATORY DEAD-CODE REFACTORING HYGIENE (AH-023)**: Saat merefaktor atau mengubah kode, AI Agent WAJIB menghapus tuntas kode mati, blok komentar usang, dan import yang tidak terpakai. Dilarang menumpuk kode baru di atas kode lama tanpa *pruning*.
- Inspect the codebase (`grep_search`, `list_dir`, `view_file`).
- Write clean, production-ready code adhering strictly to the PRD specifications.
- Do NOT invent unmentioned libraries, frameworks, or database schemas (**AH-001 Zero Invention**).
- **Complete Taste Skill**: The `<taste_skill>` in `.moryn/context.md` may embed hanya excerpt skill (untuk hemat token). Sebelum pekerjaan UI yang kompleks, fetch skill LENGKAP-nya:
  ```bash
  .moryn/sync taste <active_key>
  ```
  atau `npx moryn project taste-skill --skill <active_key>`.

### Step 4: Local Verification (CRITICAL GATE)
**DO NOT claim completion or mark a task as DONE before running local checks.**
Execute the following in the terminal:
1. `npx moryn validate-ui` (or `.moryn/sync validate`)
2. `npm run lint` (or project linter)
3. `npm run build` (or relevant compiler/type check)

### Step 5: Complete or Fail Task
- **If all verifications pass:**
  ```bash
  .moryn/sync complete <task-id>
  ```
  *The Kanban card will automatically move to DONE on the Moryn web app in real-time.*

- **If implementation or tests fail:**
  ```bash
  .moryn/sync fail <task-id> "Build error in TypeScript compiler"
  ```
  *The task status will update to FAILED with the error context preserved for debugging.*

- **Fetch Next Task:**
  ```bash
  .moryn/sync current
  ```

---

## 🛡️ Anti-Hallucination Directives & Design Hierarchy

> [!IMPORTANT]
> To avoid redundant tokens, all `AH-00x` directives (Zero Invention, Local Verification Gate, Skill Routing, etc.) and the **Hierarchy of Authority** (`design.md` vs Taste Skill) are now injected dynamically into your context.
>
> **You MUST read and strictly obey the `<system_directives>` XML tag located at the very top of `.moryn/context.md`.**
> The rules listed there are non-negotiable and carry the highest execution priority.
