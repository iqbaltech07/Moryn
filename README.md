# 🚀 Moryn — AI PRD Architect & System Architecture Tracking Platform (v2.13.0)

**Moryn** is an AI-powered platform for generating **Product Requirements Documents (PRDs)**, tracking System Architecture, and enforcing Anti-Slop Visual Governance for AI Agents and software developers.

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.3-black.svg)](https://nextjs.org/)
[![CLI Version](https://img.shields.io/npm/v/moryn.svg)](https://www.npmjs.com/package/moryn)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ⚡ Key Platform Features

- 📝 **AI PRD Generator**: Synthesize structured PRDs with tech stack recommendations powered by Google Gemini 3.7 Flash.
- 🗺️ **Visual Architecture Mindmap**: Interactive graph canvas with `@xyflow/react` for visual-to-JSON system structure.
- 🪝 **Moryn CLI v2.13.0**: Autonomous Agent Skill & CLI package for 10ms realtime Kanban task sync (`npx moryn`).
- 🛡️ **AST Anti-Slop Linter**: Static code analysis engine (`npx moryn validate-ui`) blocking AI slop visual patterns.
- 🎨 **Multi-Archetype Component Generator**: Scaffold 100% Anti-Slop UI components (`card`, `hero`, `table`, `form`, `modal`, `bento`).
- 🔒 **Automated Guardrail Hooks**: Git pre-commit & NPM pre-build hooks via `npx moryn hook`.

---

## 🛠️ Development & Local Setup

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore Moryn.

---

## 📦 Moryn CLI & Agent Skill Usage

```bash
# Authenticate CLI
npx moryn login --token <YOUR_TOKEN>

# Connect workspace to project
npx moryn init [--target web|mobile|iot|backend]

# Fetch live design tokens
npx moryn design

# Run AST Anti-Slop Linter
npx moryn validate-ui

# Scaffold Anti-Slop UI component
npx moryn generate hero LandingHero

# Install automated Git pre-commit & build guardrails
npx moryn hook
```

---

## 📋 License

MIT © [Moryn](https://moryn.vercel.app)
