# Moryn CLI & Visual Governance Engine (v2.13.0)

Official CLI & Agent Skill package for **Moryn** — AI PRD Generator, System Architecture Tracker, & Anti-Slop Visual Governance Engine.

[![npm version](https://img.shields.io/npm/v/moryn.svg)](https://www.npmjs.com/package/moryn)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ⚡ What's New in v2.13.0

- **🚀 Lossless Context Densification Engine**: Reduces context payload by **~65%** via dense constraint syntax, unified UI governance (`<ui_governance>`), minified JSON, and active task windowing without losing 100% full context.
- **🎨 Dedicated Frontend Design Thinking Skill (`frontend-design`)**: Separated foundational studio design mindset (`.agents/skills/frontend/SKILL.md`) from modular taste skills to guide AI agents with grounded subject intent, distinctive typography, meaningful structure, and deliberate motion.
- **⚡ Dual-Skill Automatic Provisioning**: `npx moryn init` automatically installs both `moryn` workflow skill and `frontend` design thinking skill into `.agents/skills/`.
- **🛡️ Mandatory AH-019 Gate**: Added mandatory rule `AH-019` to enforce loading `frontend-design` thinking before modifying any frontend UI/UX component.
- **💎 Dynamic Real-Time API Key Sync**: Instant plaintext resolution and zero-friction copying in MCP Connect Modal & Developer Profile.

---

## ⚡ Quick Start

Run directly via `npx` (Zero Installation Required):

```bash
npx moryn --help
```

### 1. Authenticate
Authenticate using your API key from Moryn Settings:

```bash
npx moryn login --token <YOUR_MORYN_API_KEY>
```

### 2. Connect Project & Install Agent Skills
Run inside your codebase workspace:

```bash
npx moryn init [--target web|mobile|iot|backend]
```

This automatically:
- Links your workspace to your Moryn Project.
- Generates Lossless Dense Context (`.moryn/context.md`).
- Generates 10ms native execution scripts (`.moryn/sync`).
- Installs **Moryn Agent Skill** (`.agents/skills/moryn/SKILL.md`).
- Installs **Frontend Design Skill** (`.agents/skills/frontend/SKILL.md`).

### 3. Check Status
Verify your connection and active project:

```bash
npx moryn status
```

---

## 🎨 Anti-Slop Visual Governance & Tooling

Moryn CLI enforces automated visual governance to ensure 100% human-designed aesthetics with zero AI slop:

### 1. Live Design Context & Tokens
Fetch live design tokens (colors, typography rules, radius hierarchy) directly from Moryn API:

```bash
npx moryn design
```

### 2. AST Static Analysis Anti-Slop Linter
Scan source code without runtime overhead for visual slop (gradient headlines, over-nested cards >2 levels, forbidden slop colors `bg-slate-900`/`bg-black`, icon container syndrome, indiscriminate `rounded-2xl`, slow motion latencies):

```bash
npx moryn validate-ui
```

### 3. On-Demand Taste Skill Fetcher
Fetch full design tokens and implementation guidelines on-demand when writing UI components:

```bash
npx moryn project taste-skill
```

### 4. Modular Theme Presets Generator
Generate Tailwind CSS preset (`moryn.preset.js`) and CSS variables (`.moryn/theme.css`):

```bash
npx moryn init-theme
```

### 5. Multi-Archetype Component Generator
Scaffold 100% Anti-Slop compliant UI components for 6 UI archetypes (`card`, `hero`, `table`, `form`, `modal`, `bento`):

```bash
npx moryn generate hero LandingHero
npx moryn generate table AuditTable
npx moryn generate form ProjectForm
```

### 6. Automated CI/CD & Git Guardrail Hooks
Install Git Pre-Commit Hook (`.git/hooks/pre-commit`) and NPM Pre-Build Script (`"prebuild"` in `package.json`) to block bad commits/builds automatically:

```bash
npx moryn hook
```

---

## 🛠️ CLI Command Reference Matrix

| Command | Category | Description |
| :--- | :--- | :--- |
| `npx moryn login --token <t>` | Auth | Authenticate CLI with Bearer API token |
| `npx moryn init [--target <t>]` | Project Setup | Initialize workspace, context.md, and install Agent Skills |
| `npx moryn status` | Health | Display connection status and project health |
| `npx moryn design` | Visual Governance | Fetch live design context and color tokens |
| `npx moryn project taste-skill` | Taste Skill | Fetch active Taste Skill specification on-demand |
| `npx moryn validate-ui` | Quality QA | Run AST Anti-Slop Linter on workspace source files |
| `npx moryn init-theme` | Theme | Generate Tailwind preset and CSS variables |
| `npx moryn generate [type] <Name>` | Scaffolding | Scaffold Anti-Slop UI component (card, hero, table, form, modal, bento) |
| `npx moryn hook` | CI/CD QA | Install Git pre-commit and NPM pre-build guardrails |
| `npx moryn project context` | Agent API | Fetch lossless dense project context payload |
| `npx moryn task start <id>` | Kanban Lifecycle | Claim and mark Kanban task as IN_PROGRESS (10ms) |
| `npx moryn task complete <id>` | Kanban Lifecycle | Mark Kanban task as DONE (10ms) |
| `npx moryn kanban` | Task Board | Query complete active Kanban board state |

---

## 📋 License

MIT © [Moryn](https://moryn.vercel.app)
