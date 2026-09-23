# Moryn CLI & Visual Governance Engine (v3.0.1)

Official CLI & Agent Skill package for **Moryn** — AI PRD Generator, System Architecture Tracker, & Anti-Slop Visual Governance Engine.

[![npm version](https://img.shields.io/npm/v/moryn-cli.svg)](https://www.npmjs.com/package/moryn-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ⚡ What's New in v3.0.1

- **🌐 Official Production Endpoint**: Direct connection to `https://moryn.web.id` out of the box with zero additional parameters required.
- **☁️ Cloud FastAPI Microservice Integration**: Direct compatibility with Moryn Cloud AI Engine backend with automatic retry and rate-limit recovery.
- **⚡ Resilient Authentication**: Supports both `--token` and `--key` flags, plus native `sync` and `login` command aliases.
- **🚀 Lossless Context Densification Engine**: Dense constraint syntax, unified UI governance (`<ui_governance>`), and active task windowing.
- **🎨 Dual-Skill Auto-Provisioning**: `npx moryn-cli init` provisions both workflow skill (`moryn`) and design thinking skill (`frontend`).
- **🛡️ AST Anti-Slop Linter**: Static code analysis engine (`npx moryn-cli validate-ui`) blocking AI slop visual patterns.

---

## ⚡ Quick Start

Run directly via `npx` (Zero Installation Required):

```bash
npx moryn-cli --help
```

### 1. Authenticate
Authenticate using your API key from Moryn Settings:

```bash
npx moryn-cli login --token <YOUR_MORYN_API_KEY>
```

### 2. Connect Project & Install Agent Skills
Run inside your codebase workspace:

```bash
npx moryn-cli init [--target web|mobile|iot|backend]
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
npx moryn-cli status
```

---

## 🎨 Anti-Slop Visual Governance & Tooling

Moryn CLI enforces automated visual governance to ensure 100% human-designed aesthetics with zero AI slop:

### 1. Live Design Context & Tokens
Fetch live design tokens (colors, typography rules, radius hierarchy) directly from Moryn API:

```bash
npx moryn-cli design
```

### 2. AST Static Analysis Anti-Slop Linter
Scan source code without runtime overhead for visual slop (gradient headlines, over-nested cards >2 levels, forbidden slop colors `bg-slate-900`/`bg-black`, icon container syndrome, indiscriminate `rounded-2xl`, slow motion latencies):

```bash
npx moryn-cli validate-ui
```

### 3. On-Demand Taste Skill Fetcher
Fetch full design tokens and implementation guidelines on-demand when writing UI components:

```bash
npx moryn-cli project taste-skill
```

### 4. Modular Theme Presets Generator
Generate Tailwind CSS preset (`moryn.preset.js`) and CSS variables (`.moryn/theme.css`):

```bash
npx moryn-cli init-theme
```

### 5. Multi-Archetype Component Generator
Scaffold 100% Anti-Slop compliant UI components for 6 UI archetypes (`card`, `hero`, `table`, `form`, `modal`, `bento`):

```bash
npx moryn-cli generate hero LandingHero
npx moryn-cli generate table AuditTable
npx moryn-cli generate form ProjectForm
```

### 6. Automated CI/CD & Git Guardrail Hooks
Install Git Pre-Commit Hook (`.git/hooks/pre-commit`) and NPM Pre-Build Script (`"prebuild"` in `package.json`) to block bad commits/builds automatically:

```bash
npx moryn-cli hook
```

---

## 🛠️ CLI Command Reference Matrix

| Command | Category | Description |
| :--- | :--- | :--- |
| `npx moryn-cli login --token <t>` | Auth | Authenticate CLI with Bearer API token |
| `npx moryn-cli init [--target <t>]` | Project Setup | Initialize workspace, context.md, and install Agent Skills |
| `npx moryn-cli status` | Health | Display connection status and project health |
| `npx moryn-cli design` | Visual Governance | Fetch live design context and color tokens |
| `npx moryn-cli project taste-skill` | Taste Skill | Fetch active Taste Skill specification on-demand |
| `npx moryn-cli validate-ui` | Quality QA | Run AST Anti-Slop Linter on workspace source files |
| `npx moryn-cli init-theme` | Theme | Generate Tailwind preset and CSS variables |
| `npx moryn-cli generate [type] <Name>` | Scaffolding | Scaffold Anti-Slop UI component (card, hero, table, form, modal, bento) |
| `npx moryn-cli hook` | CI/CD QA | Install Git pre-commit and NPM pre-build guardrails |
| `npx moryn-cli project context` | Agent API | Fetch lossless dense project context payload |
| `npx moryn-cli task start <id>` | Kanban Lifecycle | Claim and mark Kanban task as IN_PROGRESS (10ms) |
| `npx moryn-cli task complete <id>` | Kanban Lifecycle | Mark Kanban task as DONE (10ms) |
| `npx moryn-cli kanban` | Task Board | Query complete active Kanban board state |

---

## 📋 License

MIT © [Moryn](https://moryn.web.id)

