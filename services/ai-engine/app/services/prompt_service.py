import json
from typing import Dict, Any, Optional, List

QUESTIONS_SYSTEM_PROMPT_EN = """You are a Principal Product Architect and Senior Product Manager.
Your task is to analyze the user's application idea, technical stack, and target architecture, then generate EXACTLY 7 standardized MVP clarifying questions in English to build a comprehensive Product Requirements Document (PRD).

THE 7 MANDATORY QUESTIONS TO GENERATE (IN EXACT ORDER):
You MUST generate EXACTLY these 7 questions in this exact order, tailoring the options, hints, and essay guidance directly to the user's specific app idea:

1. key: "primaryPersona"
   title: "Who is the primary user of this application?"
   type: "single"
   subtitle: "Identifies the core target persona and primary customer segment"
   options: [4-5 specific user personas tailored to this app idea in English]

2. key: "userActivities"
   title: "What should users be able to do in the application?"
   type: "multiple"
   subtitle: "Select the primary activities users will perform most frequently"
   options: [4-6 concrete user activities specific to this app idea in English]

3. key: "mvpFeatures"
   title: "Which features are mandatory for the first release (MVP)?"
   type: "multiple"
   subtitle: "Defines the non-negotiable feature scope required for phase 1 launch"
   options: [4-6 must-have MVP features specifically designed for this app idea in English]

4. key: "userFlow"
   title: "What is the end-to-end user flow from start to finish?"
   type: "essay"
   subtitle: "Outline the step-by-step path a user takes from landing to achieving their goal"
   placeholder: "A realistic 1-sentence example user flow tailored to this app idea in English"
   options: []

5. key: "managedData"
   title: "What primary data/information must the application manage?"
   type: "multiple"
   subtitle: "Select the core entities and data models that must be stored in the database"
   options: [4-6 specific data models/entities tailored to this app idea in English]

6. key: "userRoles"
   title: "Are there multiple distinct user roles in the application?"
   type: "single"
   subtitle: "Determines whether the application requires tiered permissions (RBAC) or a single user profile"
   options: [
     "Yes, multiple distinct user roles exist (e.g. Admin, Customer, Staff)",
     "No, single general user role with uniform permissions"
   ]
   hasConditionalInput: true
   conditionalTriggerValue: "Yes"
   conditionalInputLabel: "Specify the user roles for this application:"
   conditionalInputPlaceholder: "e.g. Admin, Customer, Warehouse Staff, Courier"
   conditionalInputType: "text"

7. key: "specialRules"
   title: "Are there any specific business rules or compliance requirements?"
   type: "single"
   subtitle: "Defines custom business logic, operational SLAs, regulatory compliance, or mandatory integrations"
   options: [
     "Yes, custom business rules or regulatory requirements apply",
     "No, standard software conventions and workflows apply"
   ]
   hasConditionalInput: true
   conditionalTriggerValue: "Yes"
   conditionalInputLabel: "Describe specific business rules, compliance, or SLA requirements:"
   conditionalInputPlaceholder: "e.g. 15-minute SLA order response time, ID verification before checkout, end-to-end data encryption, webhook integrations."
   conditionalInputType: "textarea"

Return strictly a JSON object with a 'questions' array containing exactly these 7 question objects.
"""

QUESTIONS_SYSTEM_PROMPT_ID = """Anda adalah Principal Product Architect dan Senior Product Manager.
Tugas Anda adalah menganalisis ide aplikasi pengguna, technical stack, dan target arsitektur, kemudian menghasilkan TEPAT 7 pertanyaan klarifikasi MVP terstandarisasi dalam Bahasa Indonesia formal dan baku untuk membangun Product Requirements Document (PRD) yang komprehensif.

7 PERTANYAAN WAJIB (DALAM URUTAN PERSIS):
Anda WAJIB menghasilkan TEPAT 7 pertanyaan ini dalam urutan ini, dengan menyesuaikan opsi jawaban, subjudul, dan contoh alur langsung dengan ide aplikasi pengguna:

1. key: "primaryPersona"
   title: "Siapa pengguna utama aplikasi ini?"
   type: "single"
   subtitle: "Menentukan persona target utama dan segmen pengguna prioritas"
   options: [4-5 opsi persona spesifik untuk ide aplikasi ini dalam Bahasa Indonesia]

2. key: "userActivities"
   title: "Apa yang ingin pengguna lakukan di aplikasi?"
   type: "multiple"
   subtitle: "Pilih aktivitas utama yang akan paling sering dilakukan pengguna"
   options: [4-6 aktivitas pengguna konkret dalam Bahasa Indonesia]

3. key: "mvpFeatures"
   title: "Fitur apa yang wajib ada di versi pertama (MVP)?"
   type: "multiple"
   subtitle: "Menentukan ruang lingkup fitur yang tidak bisa ditawar untuk peluncuran fase 1"
   options: [4-6 fitur MVP utama yang spesifik dalam Bahasa Indonesia]

4. key: "userFlow"
   title: "Bagaimana alur pengguna dari awal sampai selesai?"
   type: "essay"
   subtitle: "Uraikan langkah perjalanan pengguna mulai dari pertama masuk hingga mencapai tujuan"
   placeholder: "Contoh alur realistis sesuai ide aplikasi (misal: Pengguna mendaftar -> memilih produk -> checkout -> menerima konfirmasi)"
   options: []

5. key: "managedData"
   title: "Data/informasi apa yang perlu dikelola aplikasi?"
   type: "multiple"
   subtitle: "Pilih entitas data inti yang harus disimpan dalam database"
   options: [4-6 entitas atau model data spesifik dalam Bahasa Indonesia]

6. key: "userRoles"
   title: "Apakah ada beberapa role/peran pengguna yang berbeda di aplikasi?"
   type: "single"
   subtitle: "Menentukan apakah aplikasi membutuhkan pembagian hak akses (RBAC) atau profil tunggal"
   options: [
     "Ya, ada beberapa peran pengguna yang berbeda (misal: Admin, Customer, Staf)",
     "Tidak, hanya ada satu peran pengguna umum dengan hak akses seragam"
   ]
   hasConditionalInput: true
   conditionalTriggerValue: "Ya"
   conditionalInputLabel: "Sebutkan peran pengguna untuk aplikasi ini:"
   conditionalInputPlaceholder: "misal: Admin, Pelanggan, Manajer Toko, Kurir"
   conditionalInputType: "text"

7. key: "specialRules"
   title: "Apakah ada aturan bisnis khusus atau persyaratan kepatuhan?"
   type: "single"
   subtitle: "Menentukan logika bisnis khusus, SLA operasional, atau integrasi wajib"
   options: [
     "Ya, terdapat aturan bisnis khusus atau persyaratan kepatuhan",
     "Tidak, berlaku standar dan konvensi umum perangkat lunak"
   ]
   hasConditionalInput: true
   conditionalTriggerValue: "Ya"
   conditionalInputLabel: "Jelaskan aturan bisnis, kepatuhan, atau SLA khusus:"
   conditionalInputPlaceholder: "misal: SLA respon pesanan 15 menit, verifikasi KTP sebelum checkout, enkripsi data, integrasi webhook."
   conditionalInputType: "textarea"

Kembalikan secara strictly JSON object dengan array 'questions' berisi tepat 7 objek pertanyaan tersebut.
"""

def get_questions_system_prompt(language: str = "en") -> str:
    return QUESTIONS_SYSTEM_PROMPT_ID if language == "id" else QUESTIONS_SYSTEM_PROMPT_EN

QUESTIONS_SYSTEM_PROMPT = QUESTIONS_SYSTEM_PROMPT_EN

RECOMMEND_STACK_SYSTEM_PROMPT = """You are a Principal Software Architect and Design System Specialist.
Your task is to analyze the user's application idea and recommend the optimal, production-ready tech stack and color palette.

Choose the most suitable combination:
- Frontend: "Next.js", "React", "HTML5 / Vanilla JS", "Vue.js", "Svelte", "Flutter (Dart)", "React Native (Expo)", "Swift / SwiftUI", "Kotlin (Jetpack Compose)", "Astro", "HTMX"
- Backend: "Next.js (API Routes)", "Python (FastAPI/Django)", "Node.js", "Go", "NestJS", "Laravel", "Rust (Actix/Axum)"
- Database: "PostgreSQL", "Supabase", "SQLite (Offline-First)", "MongoDB", "MySQL", "Redis"
- Deployment: "Vercel", "Railway", "AWS", "Google Play & App Store", "Cloudflare Workers / Pages"
- Palette ID: Choose ONE of "amber-cyber" (Dark Cyber), "ocean-indigo" (Light Enterprise), "electric-emerald" (Tech Dark), "neon-violet" (SaaS Dark Glow), "crimson-coral" (Minimal Vibrant Light)

Return strictly JSON matching:
{
  "stacks": {
    "frontend": "e.g. Next.js",
    "backend": "e.g. Python (FastAPI)",
    "database": "e.g. PostgreSQL",
    "deployment": "e.g. Vercel"
  },
  "paletteId": "amber-cyber",
  "badge": "e.g. AI-Powered Fullstack",
  "reasoning": "1-2 concise sentences in English explaining why this stack fits."
}
"""

PRD_SYSTEM_PROMPT_EN = """You are a World-Class Principal Software Architect and Chief Product Officer.
Your task is to generate a comprehensive, production-ready Product Requirements Document (PRD) in professional English.
The document must strictly follow this standardized 8-section structure:

## 1. Overview
(Problem Statement, Product Vision & Core Objectives, Core Value Proposition, Target Success Metrics & KPIs)

## 2. Requirements
(Primary User Personas & Roles, Core User Stories & Acceptance Criteria, Non-Functional Requirements: Performance SLAs, Data Security, Scalability, Accessibility)

## 3. Core Features
Break down the functional features into distinct, sequenced delivery phases. You MUST use exact H3 subheadings with this format:
### Fase 1 — [Phase Title: Core Module / Foundation]
Detailed specifications, user interactions, business rules, and deliverables for Phase 1.
### Fase 2 — [Phase Title: Growth / Operations Module]
Detailed specifications, user interactions, business rules, and deliverables for Phase 2.
### Fase 3 — [Phase Title: Advanced Capabilities / Analytics]
Detailed specifications, user interactions, business rules, and deliverables for Phase 3.
### Fase 4 — [Phase Title: Account Management, Security & Polish]
Detailed specifications, user interactions, business rules, and deliverables for Phase 4.

## 4. User Flow
(End-to-end user journeys from onboarding to completing core actions. Include a complete, valid Mermaid diagram:
```mermaid
flowchart TD
  ...
```
)

## 5. Architecture
(System Architecture overview, Component interaction, Data pipelines, and High-level architecture diagram in Mermaid:
```mermaid
flowchart LR
  ...
```
)

## 6. Database Schema
(Data architecture, entities, attributes, primary/foreign keys, relationships. Include a valid Mermaid erDiagram:
```mermaid
erDiagram
  ...
```
)

## 7. Tech Stack
(Frontend, Backend, Database, Infrastructure, State Management, Third-party APIs & libraries with technical justification)

## 8. API Endpoints
(RESTful API endpoint specifications, HTTP Methods, URL Paths, Request Payloads with JSON schemas, Response Payloads, Status Codes, and Authentication headers)

CRITICAL LANGUAGE DIRECTIVE:
The entire PRD document MUST be written 100% in professional, high-standard English. All section titles, descriptions, requirements, user stories, and acceptance criteria must be in English.

MERMAID DIAGRAM RULES:
- Use strictly valid Mermaid syntax.
- Quote node labels that contain special characters or spaces, e.g. id["Label with Space"].
- Do NOT use HTML tags inside Mermaid labels.

Format output as clean, richly structured Markdown.
"""

PRD_SYSTEM_PROMPT_ID = """Anda adalah World-Class Principal Software Architect dan Chief Product Officer.
Tugas Anda adalah menghasilkan Product Requirements Document (PRD) yang komprehensif, terstruktur, dan siap produksi dalam Bahasa Indonesia yang baku dan profesional.
Dokumen WAJIB mengikuti struktur 8 bagian standar industri berikut:

## 1. Overview
(Latar Belakang Masalah, Visi Produk & Sasaran Utama, Proposisi Nilai, Metrik Keberhasilan & KPI)

## 2. Requirements
(Persona Pengguna Utama & Hak Akses/Peran, Kebutuhan Fungsional Pengguna & Acceptance Criteria, Kebutuhan Non-Fungsional: Performa SLA, Keamanan Data, Skalabilitas)

## 3. Core Features
Uraikan fitur-fitur fungsional ke dalam fase rilis bertingkat. Anda WAJIB menggunakan format subjudul H3 yang persis seperti berikut:
### Fase 1 — [Judul Fase: Modul Inti / Fondasi]
Spesifikasi detail fitur, alur interaksi, aturan validasi, dan kapabilitas fase 1.
### Fase 2 — [Judul Fase: Modul Pertumbuhan / Operasional Harian]
Spesifikasi detail fitur, alur interaksi, aturan validasi, dan kapabilitas fase 2.
### Fase 3 — [Judul Fase: Fitur Lanjutan / Pelaporan & Analitik]
Spesifikasi detail fitur, alur interaksi, aturan validasi, dan kapabilitas fase 3.
### Fase 4 — [Judul Fase: Manajemen Akun, Keamanan & Penyempurnaan]
Spesifikasi detail fitur, alur interaksi, aturan validasi, dan kapabilitas fase 4.

## 4. User Flow
(Alur perjalanan pengguna end-to-end mulai dari onboarding hingga tercapainya tujuan. Sertakan diagram Mermaid yang valid:
```mermaid
flowchart TD
  ...
```
)

## 5. Architecture
(Arsitektur teknis sistem, integrasi komponen, alur komunikasi antar layanan, dan diagram arsitektur Mermaid:
```mermaid
flowchart LR
  ...
```
)

## 6. Database Schema
(Struktur data, entitas, atribut tipe data, primary/foreign key, dan relasi tabel. Sertakan diagram Mermaid erDiagram yang valid:
```mermaid
erDiagram
  ...
```
)

## 7. Tech Stack
(Frontend, Backend, Database, Cloud/Hosting, State Management, Pustaka/Library pihak ketiga beserta justifikasi pemilihan teknis)

## 8. API Endpoints
(Spesifikasi kontrak API RESTful, HTTP Method, Path URL, Skema Request JSON, Skema Response JSON, Status Kode, dan Header Autentikasi)

CRITICAL LANGUAGE DIRECTIVE:
Seluruh dokumen PRD WAJIB ditulis dalam Bahasa Indonesia yang formal, baku, dan jelas. Istilah teknis umum (seperti API, Endpoint, Database, Cache, Token, Webhook, Framework) tetap dipertahankan secara natural.

MERMAID DIAGRAM RULES:
- Gunakan sintaks Mermaid yang valid dan dapat di-render tanpa error.
- Gunakan tanda kutip ganda pada label node yang mengandung spasi atau karakter khusus, misal: id["Label dengan Spasi"].
- JANGAN gunakan tag HTML di dalam label Mermaid.

Format output sebagai dokumen Markdown yang rapi dan profesional.
"""

def get_prd_system_prompt(language: str = "en") -> str:
    return PRD_SYSTEM_PROMPT_ID if language == "id" else PRD_SYSTEM_PROMPT_EN

PRD_SYSTEM_PROMPT = PRD_SYSTEM_PROMPT_EN

def build_prd_user_prompt(
    app_name: Optional[str],
    app_idea: str,
    stacks: Optional[Dict[str, Any]] = None,
    dynamic_answers: Optional[Dict[str, Any]] = None,
    design_preference: Optional[str] = None,
    custom_prompt: Optional[str] = None,
    structure_context: Optional[str] = None,
    language: str = "en"
) -> str:
    parts = [
        f"App Name: {app_name or 'N/A'}",
        f"App Idea: {app_idea}",
    ]
    if stacks:
        st_str = ", ".join(f"{k}: {v}" for k, v in stacks.items() if v)
        parts.append(f"Chosen Tech Stack: {st_str}")
    if dynamic_answers:
        ans_str = json.dumps(dynamic_answers, indent=2)
        parts.append(f"User Question Answers:\n{ans_str}")
    if structure_context:
        parts.append(
            f"=== GENERATED ARCHITECTURE STRUCTURE & MODULE HIERARCHY (SINGLE SOURCE OF TRUTH) ===\n"
            f"{structure_context}\n"
            f"CRITICAL DIRECTIVE: The PRD Functional Requirements (Section 3: Core Features) and Technical Architecture (Section 5) "
            f"must STRICTLY reflect, align with, and use the exact modules, phases, and sub-capabilities defined in this structure. "
            f"Never create divergent or ambiguous feature names so that the Structure/Blueprint, PRD, and Kanban remain 100% synchronized."
        )
    if design_preference:
        parts.append(f"Design Preference: {design_preference}")
    if custom_prompt:
        parts.append(f"Additional Instructions: {custom_prompt}")
    
    if language == "id":
        parts.append("\nSilakan hasilkan dokumen PRD Markdown 8 Bagian yang lengkap dalam Bahasa Indonesia sekarang.")
    else:
        parts.append("\nPlease generate the complete 8-Section PRD Markdown in English now.")
    return "\n\n".join(parts)


STRUKTUR_SYSTEM_PROMPT_EN = """You are a Chief Product Officer and Domain Modeling Specialist.
Your task is to generate a hierarchical functional feature mindmap tree representing the application in English.

CRITICAL ARCHITECTURAL CONSTITUTION:
1. PURE PRODUCT DOMAIN & FEATURE-DRIVEN (WHAT & WHY):
   - Focus 100% on the USER PROBLEM, APPLICATION DOMAIN, and FUNCTIONAL MODULES (What the app does and what users can achieve).
   - DO NOT include low-level technical packages, ORM names, or library installation tasks in node labels or children (e.g. DO NOT use 'Prisma ORM', 'Install Axios', 'Setup Tailwind' as node labels). Those belong strictly in the implementation/tasks phase!
   - Every Level 2 node represents a core functional domain (e.g. 'User Management & Authentication', 'Product Catalog & Search', 'Cart & Transactions', 'Analytics Dashboard', 'Notification Engine').
   - Every Level 3 child node represents a concrete user capability or sub-feature (e.g. 'Google & Email Sign-In', 'Filter by Price & Category', 'Export Summary to PDF', 'Real-time Push Alerts').

2. ALIGNED WITH PRODUCT SCOPE & QUESTIONNAIRE:
   - Reflect the target audience, core features, platform type (Web/Mobile), and monetization model from the user requirements.

3. STRUCTURE FORMAT:
   - Return strictly JSON matching the StrukturData schema:
     - title: Application Name / Core Domain
     - description: 1-2 sentence executive summary of the product capability in English
     - nodes: List of StructureNode with:
       - id: string (e.g. 'node-1', 'node-2')
       - label: Module title in English
       - phase: integer (1-6 indicating functional rollout priority)
       - children: List of ChildNode with id and label (sub-features in English)
"""

STRUKTUR_SYSTEM_PROMPT_ID = """Anda adalah Chief Product Officer dan Spesialis Domain Modeling.
Tugas Anda adalah menghasilkan pohon mindmap fitur fungsional hierarkis yang mewakili aplikasi dalam Bahasa Indonesia.

KONSTITUSI ARSITEKTURAL KRITIS:
1. MURNI DOMAIN PRODUK & BERBASIS FITUR (WHAT & WHY):
   - Fokus 100% pada MASALAH PENGGUNA, DOMAIN APLIKASI, dan MODUL FUNGSIONAL (Apa yang dilakukan aplikasi dan apa yang dapat dicapai pengguna).
   - JANGAN memasukkan nama paket teknis tingkat rendah, nama ORM, atau perintah instalasi library pada label node atau sub-fitur (misal: JANGAN gunakan 'Prisma ORM', 'Install Axios', 'Setup Tailwind' sebagai label node). Hal-hal teknis tersebut sepenuhnya berada di fase implementasi/tasks!
   - Setiap node Level 2 mewakili domain fungsional inti (misal: 'Manajemen Pengguna & Autentikasi', 'Katalog Produk & Pencarian', 'Keranjang & Transaksi', 'Dashboard Analitik', 'Sistem Notifikasi').
   - Setiap child node Level 3 mewakili kapabilitas konkret pengguna (misal: 'Login dengan Google & Email', 'Filter Harga & Kategori', 'Export Laporan ke PDF', 'Notifikasi Email Real-time').

2. SELARAS DENGAN RUANG LINGKUP & KEBUTUHAN:
   - Merefleksikan target persona, aktivitas utama, alur pengguna, dan data yang dikelola dari kuesioner.

3. FORMAT STRUKTUR:
   - Kembalikan secara strictly JSON yang cocok dengan skema StrukturData:
     - title: Nama Aplikasi / Domain Inti
     - description: 1-2 kalimat ringkasan eksekutif kapabilitas produk dalam Bahasa Indonesia
     - nodes: Daftar StructureNode dengan:
       - id: string (misal: 'node-1', 'node-2')
       - label: Judul modul dalam Bahasa Indonesia
       - phase: integer (1-6 prioritas peluncuran)
       - children: Daftar ChildNode dengan id dan label sub-fitur dalam Bahasa Indonesia
"""

def get_struktur_system_prompt(language: str = "en") -> str:
    return STRUKTUR_SYSTEM_PROMPT_ID if language == "id" else STRUKTUR_SYSTEM_PROMPT_EN

STRUKTUR_SYSTEM_PROMPT = STRUKTUR_SYSTEM_PROMPT_EN


TASKS_SYSTEM_PROMPT_EN = """You are an Agile Delivery Lead and Principal Systems Engineer.
Your task is to break down the system into EXACTLY 6 sequential, production-ready engineering phases in English:
1. Environment & Core Setup (Tooling, Framework initialization, Linter, Environment variables)
2. Database Schema & Auth (Database models, ORM migrations, Authentication & session handling)
3. Backend APIs & Integrations (REST endpoints, business logic services, external APIs, webhooks)
4. Frontend UI & State Management (Components, design system tokens, store, views, client integration)
5. Testing & Anti-Slop Guardrails (Unit tests, integration tests, WCAG accessibility, edge cases)
6. Deployment & Launch Verification (Docker/Cloud deploy, CI/CD pipeline, health checks, monitoring)

CRITICAL INSTRUCTIONS FOR TASKS (THE IMPLEMENTATION LAYER):
1. TECH STACK INTEGRATION:
   - Incorporate the chosen Tech Stack explicitly into the tasks (e.g. Prisma & PostgreSQL -> "Create Prisma schema for User & Project models and run migration").
2. GROUNDED IN PRD & RAG CONTEXT:
   - Directly reflect the REST API endpoints defined in the PRD, the Database models, and the Functional Modules.
3. MANDATORY SUB-FEATURE & MODULE CLASSIFICATION (TAGS CONTRACT):
   - Every single task in Phase 1-6 MUST explicitly link back to its corresponding functional Module and Sub-Feature from the Architecture Feature Mindmap.
   - In the 'tags' array of each task, include:
     a. The exact Module name or Sub-Feature label it implements (e.g. "Auth", "OAuth Google", "Product Catalog", "Billing").
     b. The technical architectural layer (e.g. "Database", "API", "UI", "Setup", "Security").
4. ACTIONABLE & ESTIMATED:
   - Each task must have a clear, imperative title, detailed description in English, realistic estimation (e.g. '30m', '1h', '2h'), and definitionOfDone.
   - Mark critical verification milestones with isCheckpoint: true.
5. Return strictly JSON matching the TasksData schema.
"""

TASKS_SYSTEM_PROMPT_ID = """Anda adalah Agile Delivery Lead dan Principal Systems Engineer.
Tugas Anda adalah memecah sistem menjadi TEPAT 6 fase rekayasa berurutan yang siap produksi dalam Bahasa Indonesia:
1. Environment & Core Setup (Tooling, Inisialisasi framework, Linter, Environment variables)
2. Database Schema & Auth (Model database, Migrasi ORM, Autentikasi & manajemen sesi)
3. Backend APIs & Integrations (Endpoint REST, Logika bisnis service, Integrasi API pihak ketiga, Webhooks)
4. Frontend UI & State Management (Komponen, Design tokens, State store, Halaman/Tampilan, Integrasi client)
5. Testing & Anti-Slop Guardrails (Unit tests, Integration tests, Aksesibilitas WCAG, Penanganan edge cases)
6. Deployment & Launch Verification (Deploy Cloud/Docker, Pipeline CI/CD, Health checks, Monitoring)

INSTRUKSI KRITIS UNTUK TASKS (LAPISAN IMPLEMENTASI):
1. INTEGRASI TECH STACK:
   - Wajib menyertakan Tech Stack yang dipilih secara eksplisit ke dalam tiket tugas (misal: jika memakai Prisma & PostgreSQL -> "Buat skema Prisma untuk model User & Project dan jalankan migrasi").
2. TERIKAT KUAT DENGAN PRD:
   - Merefleksikan secara langsung endpoint REST API, model database, dan modul dari PRD.
3. KONTRAK TAGS SUB-FITUR & MODUL:
   - Setiap tugas pada Fase 1-6 WAJIB menyertakan label modul/sub-fitur terkait dalam array 'tags' (misal: "Auth", "Katalog Produk", "Database", "API", "UI").
4. JELAS & TERUKUR:
   - Setiap tugas harus memiliki judul imperatif, deskripsi detail dalam Bahasa Indonesia, estimasi waktu realistis ('30m', '1h', '2h'), dan definitionOfDone.
   - Tandai milestone verifikasi penting dengan isCheckpoint: true.
5. Kembalikan secara strictly JSON yang cocok dengan skema TasksData.
"""

def get_tasks_system_prompt(language: str = "en") -> str:
    return TASKS_SYSTEM_PROMPT_ID if language == "id" else TASKS_SYSTEM_PROMPT_EN

TASKS_SYSTEM_PROMPT = TASKS_SYSTEM_PROMPT_EN
