export type Category = "all" | "feat" | "improvement" | "fix";

export interface ReleaseItem {
  type: "feat" | "improvement" | "fix";
  title: string;
  description: string;
  tags?: string[];
}

export interface Release {
  version: string;
  date: string;
  title: string;
  badge?: string;
  summary: string;
  highlights: ReleaseItem[];
  codeSnippet?: {
    language: string;
    code: string;
  };
}

export const RELEASES: Release[] = [
  {
    version: "v2.14.0",
    date: "24 Agustus 2026",
    title: "Custom Multi-API Key Pool & Intelligent Fallback Cascade (BYOK)",
    badge: "Latest Release",
    summary:
      "Dukungan kustomisasi Bring Your Own Key (BYOK) yang memungkinkan pengguna memasukkan lebih dari satu API Key (Google Gemini & OpenRouter) dengan sistem Multi-Tier Fallback Cascade otomatis untuk mencegah kegagalan akibat limit kuota / rate limits.",
    highlights: [
      {
        type: "feat",
        title: "Multi-API Key Pool & Fallback Cascade",
        description:
          "Pengguna dapat mendaftarkan beberapa API Key dengan urutan prioritas fallback (#1, #2, #3...). Jika Key #1 terkena 429 atau kuota habis, sistem secara instan dan mulus beralih ke Key #2 dan seterusnya.",
        tags: ["BYOK", "AI Engine", "Fault Tolerance", "Multi-Key"],
      },
      {
        type: "feat",
        title: "Automatic 429 Rate-Limit Cooldown & Recovery",
        description:
          "Sistem mendeteksi error kuota / rate limit dan otomatis menandai key dalam status cooldown 5 menit di Redis agar request berikutnya langsung melompati key yang limit tanpa membuang latency.",
        tags: ["Redis", "Performance", "Optimization"],
      },
      {
        type: "feat",
        title: "Zero-Leak AES-256-GCM Military Grade Encryption",
        description:
          "Seluruh secret key pengguna dienkripsi di level aplikasi sebelum disimpan ke database, dengan sensor tampilan masked di UI.",
        tags: ["Security", "Cryptography", "AES-256-GCM"],
      },
      {
        type: "feat",
        title: "BYOK Unlimited Quota Bypass",
        description:
          "Pengguna yang menggunakan Custom API Key miliknya sendiri otomatis dibebaskan dari batas kuota harian platform Moryn.",
        tags: ["Fair Use", "Quota Waiver"],
      },
    ],
  },
  {
    version: "v2.13.0",
    date: "16 Agustus 2026",
    title: "Lossless Context Densification, Dedicated Frontend Design Skill, & Pro Export Protection",
    summary:
      "Pembaruan arsitektur untuk densifikasi konteks lossless (~65% token reduction), penambahan skill pemikiran desain frontend terdedikasi (frontend-design), proteksi ekspor dokumen Pro-only, transisi instan 0ms dengan streaming skeletons, dan resolusi API key real-time.",
    highlights: [
      {
        type: "feat",
        title: "Lossless Context Densification Engine (~65% Token Reduction)",
        description:
          "Memadatkan payload konteks proyek secara drastis melalui dense constraint syntax (AH-001..AH-021), konsolidasi tata kelola UI (<ui_governance>), dan active task windowing tanpa memotong 100% full context PRD dan desain.",
        tags: ["Context Engine", "Token Optimization", "Performance", "Anti-Hallucination"],
      },
      {
        type: "feat",
        title: "Dedicated Frontend Design Thinking Skill (frontend-design)",
        description:
          "Menghadirkan skill pemikiran desain fondasional (.agents/skills/frontend/SKILL.md) yang terpisah dari Taste Skill modular untuk memandu AI agent menghasilkan visual unik berkarakter, hierarki tipografi intensional, dan bebas dari template klise.",
        tags: ["Design System", "Frontend Skill", "UI/UX", "Anti-Slop"],
      },
      {
        type: "feat",
        title: "Automatic Dual-Skill Provisioning via CLI",
        description:
          "Perintah `npx moryn init` kini secara otomatis memasang kedua skill utama (`moryn` workflow & `frontend` design thinking) langsung ke folder `.agents/skills/` di workspace pengguna.",
        tags: ["CLI", "Automation", "Agent Skill"],
      },
      {
        type: "feat",
        title: "Pro-Tier Export Protection & Upgrade Modal",
        description:
          "Memproteksi fitur download file Markdown (.md) dan JSON cetak biru khusus untuk pengguna Pro dengan verifikasi session real-time dan modal upgrade responsif.",
        tags: ["Monetization", "Security", "Pro Tier"],
      },
      {
        type: "improvement",
        title: "Instant 0ms Page Navigation & Streaming Skeletons",
        description:
          "Menghapus seluruh artificial delay dan mengimplementasikan Next.js 16 streaming skeleton loaders (loading.tsx) serta animasi shimmer di seluruh halaman (/structure, /preview, /detail, /task, /profile).",
        tags: ["Next.js 16", "Turbopack", "Skeletons", "UX"],
      },
      {
        type: "fix",
        title: "Real-Time Dynamic API Key Resolution in Modals",
        description:
          "Modal integrasi MCP dan halaman profile kini menyelesaikan API key plaintext secara dinamis tanpa delay masking, memungkinkan copy-paste 1-klik instan untuk perintah CLI setup.",
        tags: ["API Key", "Security", "UX", "Modals"],
      },
    ],
  },
  {
    version: "v2.12.0",
    date: "14 Agustus 2026",
    title: "Tri-Combo Zero-Redundancy Context Engine, Gemini 3.7 Flash, & AI Tech Stack Advisor",
    summary:
      "Pembaruan arsitektur besar untuk optimasi token context hingga 84%, integrasi model Gemini 3.7 Flash, engine rekomendasi tech stack otomatis oleh AI, preset stack Vanilla Web/Mobile/IoT, dan parser PRD multi-tier tangguh.",
    highlights: [
      {
        type: "feat",
        title: "Tri-Combo Zero-Redundancy Context Engine (84% Token Reduction)",
        description:
          "Memangkas ukuran context payload dari 1050+ baris (~32KB) menjadi ~165 baris (~4.5KB) melalui lazy-loaded Taste Skill pointers (`npx moryn project taste-skill`), minified 1-line Anti-Hallucination tags (AH-001..AH-021), dan windowing task queue.",
        tags: ["Token Reduction", "Zero Redundancy", "Performance", "Context Engine"],
      },
      {
        type: "feat",
        title: "Gemini 3.7 Flash Engine Integration",
        description:
          "Dukungan penuh untuk model reasoning tinggi Google Gemini 3.7 Flash sebagai model default pada pembuatan PRD, chat modifier, dan engine rekomendasi arsitektur.",
        tags: ["Gemini 3.7 Flash", "AI Engine", "LLM"],
      },
      {
        type: "feat",
        title: "AI Tech Stack & Color Palette Auto-Recommend",
        description:
          "Fitur rekomendasi otomatis cerdas yang menganalisis ide produk secara instan dan mengisi seluruh 4 layer teknologi (frontend, backend, database, deployment) serta tema visual dalam satu klik.",
        tags: ["AI Recommendation", "Architecture", "Design System"],
      },
      {
        type: "feat",
        title: "Preset Baru: Vanilla Web, Flutter Mobile, & IoT ESP32",
        description:
          "Menambahkan pilihan preset bawaan untuk Vanilla HTML+CSS+JS (Zero DB, LocalStorage), Flutter Mobile App cross-platform, IoT Hardware (ESP32/MQTT Broker), dan React Native Expo.",
        tags: ["Presets", "Vanilla JS", "Flutter", "IoT ESP32"],
      },
      {
        type: "improvement",
        title: "Adaptive React Bits Component Directives (reactbits.dev)",
        description:
          "AI Agent secara adaptif mengintegrasikan komponen interaktif, aurora animated background, spotlight cards, dan magnet buttons dari reactbits.dev agar antarmuka web app hidup, modern, dan bebas AI slop.",
        tags: ["React Bits", "UI/UX", "Anti-Slop", "Modern Design"],
      },
      {
        type: "fix",
        title: "Multi-Tier Resilient PRD Chat Modifier & Live Kanban Sync",
        description:
          "Memperbaiki parser chat AI pada preview PRD dengan format XML tagged delimiter `<updated_prd>` dan auto-repair JSON, serta sinkronisasi cascading otomatis lintas PRD, mindmap struktur, dan kanban task.",
        tags: ["Bug Fix", "PRD Chat", "Live Kanban Sync"],
      },
    ],
    codeSnippet: {
      language: "bash",
      code: `# Initialize Tri-Combo Zero-Redundancy Context
npx moryn init

# Fetch full Taste Skill on-demand (10ms)
npx moryn project taste-skill

# Run AST Anti-Slop Linter
npx moryn validate-ui`,
    },
  },
  {
    version: "v2.7.0",
    date: "13 Agustus 2026",
    title: "AST Anti-Slop Linter Engine, Multi-Archetype Generators, & Live Design Context Router",
    summary:
      "Perombakan arsitektur besar Moryn CLI v2.7 dengan 5 perintah baru (design, validate-ui, init-theme, generate, hook), AST Anti-Slop Linter, Multi-Domain target adapter, 6 scaffold archetype UI, Git/NPM guardrail hooks, dan direktif AH-018.",
    highlights: [
      {
        type: "feat",
        title: "AST Static Analysis Anti-Slop Linter (validate-ui)",
        description:
          "Memindai source code tanpa runtime overhead untuk mendeteksi gradient headlines, over-nested cards >2 level, warna slop navy/black, icon container syndrome, dan indiscriminate rounded-2xl.",
        tags: ["AST Linter", "Anti-Slop", "Visual Governance"],
      },
      {
        type: "feat",
        title: "Live Design Context Router & SSOT Hierarchy (npx moryn design)",
        description:
          "Memanggil live remote API untuk mengambil token warna dan aturan desain paling baru dari server Web App, dilengkapi fallback lokal .moryn/tokens.json dan hirarki SSOT.",
        tags: ["Design Context", "SSOT", "Remote API First"],
      },
      {
        type: "feat",
        title: "Multi-Archetype Component Generator (npx moryn generate)",
        description:
          "Menghasilkan berkas komponen UI Anti-Slop modular 1 file per archetype dengan 6 pilihan pola UI: card, hero, table, form, modal, dan bento.",
        tags: ["Component Scaffolding", "Multi-Archetype", "Clean Code"],
      },
      {
        type: "feat",
        title: "Automated Pre-Commit & Pre-Build Guardrail Hooks (npx moryn hook)",
        description:
          "Memasang Git Pre-Commit Hook (.git/hooks/pre-commit) dan NPM Pre-Build Step (package.json prebuild script) yang otomatis membatalkan commit/build jika ada pelanggaran Anti-Slop.",
        tags: ["CI/CD Guardrails", "Git Hook", "Automated QA"],
      },
      {
        type: "improvement",
        title: "Mandatory Design Context Gate (AH-018 Mandate)",
        description:
          "Penegakan hukum aturan AH-018 yang memwajibkan AI Agent membaca 100% Konteks Desain sebelum membuat/mengubah komponen UI tanpa ada satu pun token/aturan yang terabaikan.",
        tags: ["AH-018", "System Directives", "Mandatory Gate"],
      },
    ],
    codeSnippet: {
      language: "bash",
      code: `# Fetch live design context & tokens
npx moryn design

# Run AST Anti-Slop Linter on workspace
npx moryn validate-ui

# Scaffold component archetype
npx moryn generate hero LandingHero

# Install automated pre-commit & build guardrails
npx moryn hook`,
    },
  },
  {
    version: "v2.2.3",
    date: "11 Agustus 2026",
    title: "Hybrid Context XML, Token Optimization, & Lazy Loaded Taste Skill",
    summary:
      "Memperkenalkan format konteks baru (Hybrid XML + Markdown + CDATA) yang memangkas penggunaan token secara drastis, serta optimasi Taste Skill dengan mekanisme On-Demand Fetching via CLI.",
    highlights: [
      {
        type: "feat",
        title: "Hybrid Context Serialization",
        description:
          "Semua JSON stringified payloads pada PRD dan Design kini dikonversi menjadi format XML CDATA + Compact JSON. Ini menghilangkan masalah escape characters dan memangkas penggunaan token hingga 20-30%.",
        tags: ["Token Optimization", "XML", "CDATA"],
      },
      {
        type: "feat",
        title: "Lazy Loading Taste Skill (AH-013 Update)",
        description:
          "Taste Skill kini tidak lagi di-embed penuh di context.md, melainkan dipotong (truncate) menjadi maksimal 140 baris. AI Agent diwajibkan (Mandatory Critical Gate) untuk memanggil npx moryn project taste-skill sebelum melakukan UI coding.",
        tags: ["Lazy Load", "CLI Fetch", "Anti-Hallucination"],
      },
      {
        type: "improvement",
        title: "Personalization Inputs & Freshness Marker",
        description:
          "Menambahkan data jawaban pengguna (Personalization Inputs) ke dalam payload konteks, serta penanda Snapshot Freshness (AH-017) untuk mendeteksi apakah context yang dibaca AI sudah basi atau belum.",
        tags: ["Personalization", "AH-017"],
      },
      {
        type: "improvement",
        title: "Centralized System Directives",
        description:
          "Seluruh aturan AH-00x (Anti-Hallucination) yang sebelumnya di-hardcode pada SKILL.md kini dipindahkan ke backend systemDirectives.ts agar dapat di-inject secara dinamis ke context.md.",
        tags: ["Refactoring", "Clean Code"],
      },
    ],
  },
  {
    version: "v2.2.0",
    date: "10 Agustus 2026",
    title: "100% Zero-Slop Mandate, AH-016 Chunk-Read, & Full GSAP Kinetic Restoration",
    summary:
      "Penegakan hukum visual mutlak (Zero-Slop & Zero-Hallucination) via AH-014, perlindungan lupa konteks dengan Mandatory Chunk-Read (AH-016), dan pemulihan 100% kemampuan animasi Advanced GSAP Motion pada gptTaste tanpa kompromi.",
    highlights: [
      {
        type: "feat",
        title: "Full GSAP Motion Restoration in gptTaste",
        description:
          "Memulihkan superpower asli gptTaste (Scroll Pinning, Text Scrubbing, Card Stacking, True Randomization Python RNG, Gapless Bento Grid) sambil tetap mengunci ketat warna & gaya ke token design.md.",
        tags: ["GSAP", "Taste Skill", "Awwwards"],
      },
      {
        type: "feat",
        title: "Zero-Slop & Zero-Hallucination Visual Quality Mandate (AH-014)",
        description:
          "Deklarasi pemblokiran total (BANNED FOREVER) terhadap ciri khas web AI murahan: Navy Blue #0F172A containers, Neon Purple-Blue Glows, Hairline Dividers, dan Meta-Labels murah. Diwajibkan di setiap komponen.",
        tags: ["Anti-Slop", "Visual Quality", "AH-014"],
      },
      {
        type: "improvement",
        title: "Mandatory Skill Focus Gate (AH-013)",
        description:
          "AI Agent diwajibkan menulis <skill_comprehension> dan <design_plan> sebelum mengeluarkan 1 baris pun kode UI untuk memastikan fokus 100% dan tidak melewatkan/mengabaikan Taste Skill yang aktif.",
        tags: ["Skill Comprehension", "AI Gate"],
      },
      {
        type: "improvement",
        title: "Context Persistence & Mandatory Chunk-Read (AH-015 & AH-016)",
        description:
          "Mencegah AI lupa konteks saat percakapan panjang dengan mewajibkan pemanggilan view_file pada context.md sebelum setiap task, serta mewajibkan pembacaan bertahap (chunk-read) untuk file >800 baris.",
        tags: ["Memory Persistence", "No-Loss Context"],
      },
    ],
  },
  {
    version: "v2.1.0",
    date: "9 Agustus 2026",
    title: "Modular Taste Skill Library, Selective Payload Delivery & Design Hierarchy",
    badge: "Latest Release",
    summary:
      "Integrasi 100% Taste Skill tanpa potongan dari Knowledge OS Second Brain, pengiriman payload selektif hemat 90% token, hirarki sinergi design.md vs Taste Skill, serta pembagian file modular.",
    highlights: [
      {
        type: "feat",
        title: "Unabridged Modular Taste Skill Library",
        description:
          "Integrasi 8 Taste Skill utuh (designTasteFrontend, highEndVisualDesign, minimalistUi, redesignExistingProjects, gptTaste, stitchDesignTaste, fullOutputEnforcement, findSkills) beserta canonical code skeletons (GSAP StickyStack, HorizontalPan, Motion RevealStagger, Apple Liquid Glass Web CSS).",
        tags: ["Taste Skill", "Design System", "Anti-Slop"],
      },
      {
        type: "feat",
        title: "Selective Taste Skill Payload Reduction (On-Demand Delivery)",
        description:
          "Pengurangan beban context JSON sebesar 90% (163KB -> 12KB) dengan mendeteksi vibe project dan hanya melampirkan 1 skill aktif. Menyediakan endpoint API & CLI taste-skill --skill <name> secara on-demand.",
        tags: ["Performance", "Context API", "Payload 90% Reduced"],
      },
      {
        type: "improvement",
        title: "Design Hierarchy of Authority (design.md vs Taste Skill)",
        description:
          "Penetapan tegas Level 1 Ground Truth (design.md menentukan WHAT to build) vs Level 2 Engineering Quality (Taste Skill menentukan HOW to build with excellence). Eliminasi total bentrok token warna & font.",
        tags: ["Hierarchy", "Design Synergy", "Anti-Hallucination"],
      },
      {
        type: "improvement",
        title: "Hidden Background Skill Injection & English Console Logs",
        description:
          "Taste Skill dan direktif sistem disuntikkan secara tersembunyi (hidden) di latar belakang melalui .moryn/context.md & .agents/skills/ tanpa mengotori tampilan terminal/UI manusia. Seluruh CLI log distandarisasi ke Bahasa Inggris.",
        tags: ["CLI", "UX", "Hidden Directives"],
      },
    ],
    codeSnippet: {
      language: "bash",
      code: `# Fetch specific taste skill on-demand
npx moryn project taste-skill --skill minimalistUi --json

# Automatic Project Context with 90% Reduced Payload
npx moryn project context --json`,
    },
  },
  {
    version: "v1.2.0",
    date: "9 Agustus 2026",
    title: "NPX CLI, Agent Skill & 10ms Realtime Autonomous Sync",
    summary:
      "Transformasi penuh integrasi AI Agent dari legacy MCP ke Zero-Friction NPX CLI, native Agent Skill (.agents/skills/moryn/SKILL.md), serta instant Upstash Redis sync engine (<10ms).",
    highlights: [
      {
        type: "feat",
        title: "Zero-Friction NPX CLI Provisioning",
        description:
          "Autentikasi dan inisialisasi ruang kerja serba otomatis dengan perintah 'npx moryn login' dan 'npx moryn init'. Otomatis menyuntikkan Agent Skill ke dalam .agents/skills/moryn/SKILL.md.",
        tags: ["CLI", "Agent Skill", "DX"],
      },
      {
        type: "feat",
        title: "10ms Native Realtime Autonomous Sync",
        description:
          "AI Agent mengklaim (start), mengeksekusi, menguji, dan menyelesaikan (complete) tugas langsung dari terminal. Papan Kanban web ter-update secara otomatis tanpa rotasi kartu manual.",
        tags: ["Realtime", "Redis", "Kanban"],
      },
      {
        type: "improvement",
        title: "Upgrade Core AI Engine ke Gemini 3.6 Flash",
        description:
          "Sintesis Product Requirements Document (PRD), mindmap arsitektur visual, dan rincian tugas 10x lebih cepat dengan presisi struktur tinggi.",
        tags: ["AI Engine", "Gemini 3.6 Flash"],
      },
      {
        type: "improvement",
        title: "Enforced Reading Order & Directive Context API",
        description:
          "Menegakkan urutan penelusuran wajib (Structure -> PRD -> Design -> Task) pada SKILL.md dan context API payload untuk eliminasi total AI hallucination.",
        tags: ["Anti-Hallucination", "Context API"],
      },
    ],
    codeSnippet: {
      language: "bash",
      code: `# Login & Inisialisasi Proyek dalam 1 Langkah
npx moryn login --token piar_live_7667e783d8a93539758e2c8eb8f8dad0
npx moryn init --project cmshkki2x0001l104vdj6hnfc

# Klaim & Selesaikan Tugas secara Otonom
npx moryn task start clx9988776655
npx moryn task complete clx9988776655`,
    },
  },
  {
    version: "v1.1.0",
    date: "6 Agustus 2026",
    title: "Modular Detail Architecture & Live Color Swatch Parser",
    summary:
      "Refactoring total halaman detail proyek menjadi sub-komponen modular, perbaikan parser markdown untuk tag HTML semantik, dan render sampel warna desain token secara langsung.",
    highlights: [
      {
        type: "feat",
        title: "Live Color Tokens Swatches",
        description:
          "Parser otomatis yang membaca token warna Hex dalam dokumen desain dan menampilkan visual color swatch interaktif pada tabel warna proyek.",
        tags: ["Design System", "UI Parser"],
      },
      {
        type: "improvement",
        title: "Modular Sub-Component Refactoring",
        description:
          "Memecah monolith detail page menjadi ColorTokensTable, DesignAccordions, DesignDropzone, dan ProjectHeaderCard untuk performa dan kemudahan pemeliharaan.",
        tags: ["Refactoring", "Clean Code"],
      },
      {
        type: "fix",
        title: "Semantic HTML Escaping pada Markdown Format",
        description:
          "Mengatasi isu perenderan tag HTML seperti <header>, <main>, <section>, dan <article> agar tidak terpotong saat diparsing dari dokumen PRD.",
        tags: ["Markdown Parser", "Bugfix"],
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "1 Agustus 2026",
    title: "Peluncuran Perdana AI PRD Architect & System Directives",
    summary:
      "Rilis resmi Moryn — platform pembangkit PRD cerdas berbasis AI dengan wizard 7 langkah anti-halusinasi dan papan Kanban terintegrasi.",
    highlights: [
      {
        type: "feat",
        title: "7-Step Anti-Hallucination Blueprint Wizard",
        description:
          "Sistem kuesioner terstruktur 7 langkah yang mengunci batasan teknis, fitur utama, dan aturan AH-001 hingga AH-010 sebelum pembuatan PRD.",
        tags: ["PRD Wizard", "System Directives"],
      },
      {
        type: "feat",
        title: "Visual Architecture Mindmap Canvas",
        description:
          "Visualisasi hirarki proyek dalam bentuk diagram graph interaktif yang dapat diedit inline dan tersinkronisasi balik ke struktur JSON.",
        tags: ["Interactive Graph", "Architecture"],
      },
      {
        type: "feat",
        title: "Automated Kanban Task Generation",
        description:
          "Ekstraksi kebutuhan PRD menjadi kartu-kartu tugas Kanban yang siap dikerjakan oleh developer maupun AI Agent.",
        tags: ["Kanban", "Project Management"],
      },
    ],
  },
];
