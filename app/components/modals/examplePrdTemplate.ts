/**
 * Static Example PRD Template markdown used solely for UI preview in ExamplePrdModal.
 */
export const PRD_TEMPLATE = `# Product Requirements Document (PRD)

## Moryn — AI-Powered PRD & Architecture Engine

---

## 1. Overview

### 1.1 Product Summary
**Moryn** adalah platform otomasi rekayasa perangkat lunak yang mengubah ide produk mentah menjadi **Product Requirements Document (PRD)**, diagram arsitektur interaktif (*React Flow Architecture Tree*), spesifikasi desain (*design.md*), dan daftar tugas teknis (*6-Phase Kanban Tasks*) yang presisi dan siap dieksekusi tanpa halusinasi.

### 1.2 Core Problem & Solution
* **Problem**: Menyusun dokumentasi teknis, memetakan arsitektur file, dan memecahnya menjadi daftar task siap eksekusi membutuhkan waktu berhari-hari. Generator AI generik sering berhalusinasi dan menghasilkan spesifikasi yang tidak konsisten antar komponen.
* **Solution**: Pipeline berantai 4 tahap terikat (*Contextual Chaining Pipeline*): Kuesioner Personal $\\rightarrow$ PRD $\\rightarrow$ Visual Tree $\\rightarrow$ 6-Phase Task List.

### 1.3 Success Metrics (KPIs)
* Waktu generasi end-to-end $< 3$ menit per project.
* $\\ge 95\\%$ konsistensi konteks antara PRD, struktur folder/diagram, dan daftar tugas Kanban.
* Zero build errors pada scaffold kode dan integrasi MCP Agent.

---

## 2. Requirements

### 2.1 Target Personas & Pain Points
* **Software Engineers / Solo Developers**:
  * *Pain Point*: Dokumentasi teknis memakan waktu; kesulitan memecah PRD abstrak menjadi task teknis atomik.
  * *Solusi*: Auto-scaffolding arsitektur folder, visual tree, dan breakdown task 6 fase yang langsung sinkron dengan MCP Agent di IDE.
* **Product Managers & Technical Founders**:
  * *Pain Point*: Kesulitan mengomunikasikan ide bisnis abstrak menjadi arsitektur teknis bagi developer.
  * *Solusi*: Editor PRD interaktif dengan auto-save draf lokal dan visual mindmap.

### 2.2 Non-Functional Requirements & Security Guidelines
* **Performance SLAs**: Initial page load $\\le 1.5$ detik; navigasi 0ms berkat memory cache Zustand.
* **Security & Access Control**: Autentikasi sesi ketat, row-level tenant isolation, dan rate-limiting per user via Redis.

---

## 3. Core Features

### Fase 1 — Fondasi: Multi-Step Generator & Contextual AI
* **FR-01 (Multi-Step Generator)**: Wizard pembuatan project interaktif bertahap dengan auto-save draf lokal via Zustand persist.
* **FR-02 (7-Step Contextual AI)**: Analisis cerdas terhadap ide produk pengguna yang menghasilkan 7 pertanyaan terarah spesifik domain.

### Fase 2 — Operasional: Interactive PRD Editor & Visual Architecture Tree
* **FR-03 (Interactive PRD Editor)**: Antarmuka viewer PRD Markdown live dengan Table of Contents (TOC) otomatis dan asisten AI chat revisi real-time.
* **FR-04 (Visual Architecture Tree)**: Mindmap arsitektur hierarkis berbasis React Flow yang memetakan modul aplikasi dan sub-fitur.

### Fase 3 — Skalabilitas: Smart Task Synchronizer & Reactive Kanban Board
* **FR-05 (Smart Task Synchronizer)**: Pemecahan modul arsitektur menjadi tugas-tugas teknis modular 6-fase terstruktur.
* **FR-06 (Reactive Kanban Board)**: Papan kerja Kanban drag-and-drop instan (Todo, In Progress, Done) dengan status persistensi.

### Fase 4 — Keamanan & Integrasi: MCP Agent Server, Gamification & Anti-Slop Studio
* **FR-07 (MCP Agent Server)**: Endpoint Model Context Protocol (/api/mcp) untuk koneksi IDE AI Agent (Cursor, Windsurf, Antigravity).
* **FR-08 (Gamification & EXP Engine)**: Sistem reward penghargaan (+100 EXP per project) dan pembaruan ranking leaderboard publik.
* **FR-09 (CLI Template Studio)**: Workbench interaktif untuk menginspeksi template kode Anti-Slop dengan preview multi-viewport.

---

## 4. User Flow

\`\`\`mermaid
flowchart TD
    A["1. Input Ide & Nama App"] --> B{"2. Pilih Tech Stack & Template Desain"}
    B -->|"Preset Manual"| C["Pilih 4 Layer Stack"]
    B -->|"AI Recommendation"| D["Rekomendasi Cerdas AI"]
    C --> E["3. Jawab 7 Pertanyaan Spesifikasi AI"]
    D --> E
    E --> F["4. Generate PRD & Live Viewer"]
    F --> G{"Perlu Revisi PRD?"}
    G -->|"Ya"| H["Chat Prompt Revisi AI"]
    H --> F
    G -->|"Tidak"| I["5. Generate Visual Architecture Tree"]
    I --> J["6. Sync 6-Phase Kanban Tasks"]
    J --> K["7. Hubungkan MCP Agent / Eksekusi Task"]
    K --> L["8. Selesaikan Project & Klaim EXP"]
\`\`\`

---

## 5. Architecture

\`\`\`mermaid
flowchart LR
    subgraph Client ["Client Layer (Next.js 16 + Zustand)"]
        UI["React 19 UI Components"]
        Store["Zustand 5-Store Suite"]
        SDK["Centralized apiClient.ts"]
    end

    subgraph Server ["Server Layer (Next.js App Router API)"]
        Auth["Better-Auth Session Guard"]
        ProjectAPI["Projects & Tasks Controller"]
        LLMEngine["LLM Context Pipeline"]
        AgentAPI["MCP Agent Endpoints"]
    end

    subgraph Data ["Data & External Layer"]
        DB[("PostgreSQL Prisma ORM")]
        Cache[("Upstash Redis Caching")]
        Gemini["Google Gemini / OpenRouter"]
    end

    UI --> Store
    Store --> SDK
    SDK --> ProjectAPI
    AgentAPI --> Auth
    ProjectAPI --> Auth
    ProjectAPI --> DB
    ProjectAPI --> Cache
    ProjectAPI --> LLMEngine
    LLMEngine --> Gemini
\`\`\`

---

## 6. Database Schema

\`\`\`mermaid
erDiagram
    USER ||--o{ PROJECT : "owns"
    USER ||--o{ SESSION : "has"
    USER ||--o{ ACCOUNT : "links"

    USER {
        string id PK "Unique CUID"
        string email UK "User email"
        string name "User full name"
        string tier "FREE | PRO"
        int exp "Leaderboard EXP points"
        string apiKey UK "Agent MCP Auth Key"
        datetime createdAt
    }

    PROJECT {
        string id PK "Unique CUID"
        string userId FK "Owner reference"
        string appName "Application title"
        string appIdea "Problem & feature description"
        string formInputs "JSON: Tech stacks & questionnaire"
        string prdData "Markdown: Full PRD content"
        string strukturData "JSON: Node & category hierarchy"
        string taskData "JSON: 6-Phase modular tasks"
        string designData "Markdown: Design tokens & guidelines"
        string status "IN_PROGRESS | FINISHED"
        string checkedTasks "JSON: Record<taskId, status>"
        datetime finishedAt "Completion timestamp"
        datetime createdAt
        datetime updatedAt
    }
\`\`\`

---

## 7. Tech Stack

* **Core Framework**: Next.js 16 (Turbopack, App Router), React 19, TypeScript.
* **Component Architecture**: Modular architecture dipisahkan dalam \`layout/\`, \`landing/\`, \`modals/\`, \`shared/\`, \`ai/\`, dan \`showcase/\`.
* **Global State Management**: Zustand 5-Store Suite (\`useProjectStore\`, \`useChatStore\`, \`useWizardStore\`, \`useKanbanStore\`, \`useUiStore\`).
* **Database & ORM**: PostgreSQL dengan Prisma ORM v6 (composite indexing & tenant isolation).
* **Caching & Rate Limiting**: Upstash Redis (Fail-open sliding window rate limiting).
* **AI & LLM Services**: Google GenAI SDK (\`@google/genai\` Gemini 2.5/3.7) & OpenRouter API.
* **Authentication**: Better-Auth (HTTP-Only Secure Cookie Session).

---

## 8. API Endpoints

| Method | Endpoint Path | Request Payload Schema | Expected 200 Response Schema |
| :--- | :--- | :--- | :--- |
| \`POST\` | \`/api/projects/create\` | \`{ appName, appIdea, stacks, dynamicAnswers }\` | \`{ projectId: string }\` |
| \`GET\` | \`/api/projects/detail\` | \`?projectId=string\` | \`{ project: ProjectDetailData }\` |
| \`POST\` | \`/api/projects/update\` | \`{ projectId, prdData?, strukturData?, taskData? }\` | \`{ success: boolean }\` |
| \`POST\` | \`/api/generate/prd\` | \`{ projectId: string }\` | \`{ markdown: string }\` |
| \`POST\` | \`/api/generate/edit-prd\`| \`{ projectId, currentPrd, prompt, selectedModel? }\`| \`{ updatedMarkdown, diffSummary }\` |
| \`POST\` | \`/api/generate/struktur\`| \`{ projectId: string }\` | \`{ title, description, nodes }\` |
| \`POST\` | \`/api/generate/tasks\` | \`{ projectId, forceSync? }\` | \`{ phases, savedStatus }\` |
| \`POST\` | \`/api/projects/finish\` | \`{ projectId, checkedTasks }\` | \`{ success, expGained, newExp }\` |
| \`POST\` | \`/api/mcp\` | \`{ method, params }\` | \`{ result: object }\` |
`;
