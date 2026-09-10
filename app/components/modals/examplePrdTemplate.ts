/**
 * Static Example PRD Template markdown used solely for UI preview in ExamplePrdModal.
 */
export const PRD_TEMPLATE = `# Product Requirements Document (PRD)

## Moryn — AI-Powered PRD & Architecture Engine

---

## 1. Overview & Objectives

### 1.1 Product Summary
**Moryn** adalah platform otomasi rekayasa perangkat lunak yang mengubah ide produk mentah menjadi **Product Requirements Document (PRD)**, diagram arsitektur interaktif (*React Flow Architecture Tree*), spesifikasi desain (*design.md*), dan daftar tugas teknis (*6-Phase Kanban Tasks*) yang presisi dan siap dieksekusi tanpa halusinasi.

### 1.2 Core Problem & Solution
* **Problem**: Menyusun dokumentasi teknis, memetakan arsitektur file, dan memecahnya menjadi daftar task siap eksekusi membutuhkan waktu berhari-hari.
* **Solution**: Pipeline berantai 4 tahap terikat (*Contextual Chaining Pipeline*): Kuesioner Personal -> PRD -> Visual Tree -> 6-Phase Task List.

---

## 2. User Personas & Pain Points

### 2.1 Software Engineers / Solo Developers
* **Pain Point**: Dokumentasi teknis memakan waktu; kesulitan memecah PRD abstrak menjadi task teknis atomik.
* **Solution**: Auto-scaffolding arsitektur folder, visual tree, dan breakdown task 6 fase.

---

## 3. End-to-End User Flow & Journey

\`\`\`mermaid
flowchart TD
    A["1. Input Ide & Nama App"] --> B{"2. Pilih Tech Stack & Template Desain"}
    B -->|"Preset Manual"| C["Pilih 4 Layer Stack"]
    B -->|"AI Recommendation"| D["Rekomendasi Cerdas AI"]
    C --> E["3. Jawab 7 Pertanyaan Spesifikasi AI"]
    D --> E
    E --> F["4. Generate PRD & Live Viewer"]
\`\`\`

---

## 4. Functional Requirements & Feature Matrix

| ID | Modul Fitur | User Story & Fungsionalitas | Kriteria Keberhasilan |
| :--- | :--- | :--- | :--- |
| **FR-01** | **Multi-Step Generator** | Sebagai user, saya ingin mengisi ide produk bertahap. | Draf tersimpan otomatis. |
| **FR-02** | **Contextual AI** | Sebagai user, saya ingin menjawab 7 pertanyaan terarah. | Output AI sesuai konteks domain. |

---

## 5. System Architecture

\`\`\`mermaid
flowchart LR
    subgraph Client ["Client Layer (Next.js 16)"]
        UI["React 19 UI Components"]
        Store["Zustand Store"]
    end
    subgraph Server ["Server Layer"]
        FastAPI["Python FastAPI AI Engine"]
        DB[("PostgreSQL")]
    end
    UI --> FastAPI
    FastAPI --> DB
\`\`\`
`;
