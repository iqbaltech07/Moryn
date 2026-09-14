import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis";
import { checkRateLimit, RateLimitWindows } from "@/lib/db/rateLimit";
import { getDailyAiCallLimit } from "@/lib/analytics/planQuota";
import { hasActiveCustomAiKeys } from "@/lib/ai/keyManager";
import { FastApiClient } from "@/lib/ai/fastapiClient";
import { incrementUsage } from "@/lib/analytics/usageTracker";

export const maxDuration = 60;

export interface GeneratedQuestion {
  key: string;
  title: string;
  subtitle: string;
  type: "single" | "multiple" | "essay";
  options: string[];
  placeholder?: string;
  hasConditionalInput?: boolean;
  conditionalTriggerValue?: string;
  conditionalInputLabel?: string;
  conditionalInputPlaceholder?: string;
  conditionalInputType?: "text" | "textarea";
}

function getContextualFallbackQuestions({
  appIdea,
  stacks,
  language = "en",
}: {
  appName?: string;
  appIdea: string;
  stacks?: { frontend?: string; backend?: string; database?: string; deployment?: string };
  language?: "en" | "id";
}): GeneratedQuestion[] {
  const isMobile = /mobile|android|ios|flutter|react native|smartphone|apk/i.test(appIdea + (stacks?.frontend || ""));
  const isEcommerce = /store|shop|toko|jual|beli|ecommerce|e-commerce|checkout|payment|midtrans/i.test(appIdea);
  const isSaaS = /saas|b2b|subscription|multi-tenant|workspace|dashboard|crm/i.test(appIdea);

  if (language === "id") {
    return [
      {
        key: "primaryPersona",
        title: "Siapa pengguna utama aplikasi ini?",
        subtitle: "Menentukan persona target utama dan segmen pengguna prioritas",
        type: "single",
        options: isEcommerce
          ? [
              "Pembeli Online / Konsumen Langsung (B2C)",
              "Pemilik Toko & Pengelola Merchant (Penjual)",
              "Reseller, Dropshipper & Agen Penjualan",
              "Pembeli Grosir / Korporasi (B2B)",
            ]
          : isSaaS
          ? [
              "Tim Internal Perusahaan & Staf Operasional",
              "Manajer, Team Lead & Pengambil Keputusan",
              "Freelancer, Konsultan & Kreator Mandiri",
              "Klien Eksternal & Mitra Bisnis",
            ]
          : isMobile
          ? [
              "Pengguna Smartphone Aktif Harian (B2C)",
              "Petugas Lapangan & Agen Bergerak",
              "Komunitas Berbasis Lokasi & Pengguna Sosial",
              "Profesional Muda & Kreator Konten Mobile",
            ]
          : [
              "Konsumen Individu / Masyarakat Umum (B2C)",
              "Profesional, Pekerja Lepas & Kreator",
              "Usaha Kecil & Menengah (UKM/SMB)",
              "Perusahaan Korporat & Organisasi (B2B)",
            ],
      },
      {
        key: "userActivities",
        title: "Apa yang ingin pengguna lakukan di aplikasi?",
        subtitle: "Pilih aktivitas utama yang akan paling sering dilakukan pengguna",
        type: "multiple",
        options: isEcommerce
          ? [
              "Menjelajahi katalog produk, opsi varian, dan ulasan pembeli",
              "Memasukkan barang ke keranjang belanja dan menyelesaikan checkout",
              "Membayar otomatis via Payment Gateway (Kartu Kredit, QRIS, E-wallet)",
              "Melacak status pengiriman dan update kurir secara real-time",
              "Mengelola pesanan masuk, inventaris stok, dan laporan penjualan",
            ]
          : isSaaS
          ? [
              "Memasukkan, memperbarui, dan mengelola catatan kerja operasional harian",
              "Memantau metrik performa KPI dengan dashboard interaktif real-time",
              "Berkolaborasi dengan tim, mendelegasikan tugas, dan berbagi dokumen",
              "Mengonfigurasi otomatisasi alur kerja dan webhook eksternal",
              "Mengekspor laporan terjadwal ke format PDF atau Excel",
            ]
          : [
              "Mencari, memfilter, dan melihat katalog konten / layanan terstruktur",
              "Menyelesaikan transaksi, pemesanan, atau reservasi online",
              "Mengelola profil pengguna, riwayat aktivitas, dan progres",
              "Berkomunikasi, bertukar pesan, atau berkolaborasi secara real-time",
              "Melihat ringkasan metrik dashboard dan notifikasi transaksional",
            ],
      },
      {
        key: "mvpFeatures",
        title: "Fitur apa yang wajib ada di versi pertama (MVP)?",
        subtitle: "Menentukan ruang lingkup fitur yang tidak bisa ditawar untuk peluncuran fase 1",
        type: "multiple",
        options: isEcommerce
          ? [
              "Autentikasi Akun Pembeli & Penjual (Login/Register)",
              "Katalog Produk Dinamis dengan Pencarian Cepat & Filter Kategori",
              "Keranjang Belanja Terintegrasi & Alur Checkout Mulus",
              "Integrasi Payment Gateway Otomatis (Midtrans / Stripe / QRIS)",
              "Notifikasi Status Pesanan Otomatis (Email / WhatsApp)",
            ]
          : isSaaS
          ? [
              "Autentikasi Aman & Manajemen Profil Tim Multi-Pengguna",
              "Dashboard Ringkasan Utama dengan Metrik KPI Operasional",
              "Manajemen CRUD Entitas Inti dengan Pencarian Cepat & Filter",
              "Manajemen Hak Akses Bertingkat (RBAC) & Perizinan",
              "Fitur Ekspor Data (CSV/Excel/PDF) & Log Audit Aktivitas",
            ]
          : [
              "Autentikasi Pengguna Aman (Email/Password & Social OAuth)",
              "CRUD Entitas Inti Aplikasi dengan Validasi Input",
              "Mesin Pencarian, Filter Multi-Faset, dan Tampilan Detail",
              "Notifikasi & Peringatan Acara Transaksional Real-Time",
              "Dashboard Ringkasan Aktivitas dengan Metrik Kunci",
            ],
      },
      {
        key: "userFlow",
        title: "Bagaimana alur pengguna dari awal sampai selesai?",
        subtitle: "Uraikan langkah perjalanan pengguna mulai dari pertama masuk hingga mencapai tujuan",
        type: "essay",
        placeholder: isEcommerce
          ? "Contoh alur: Pengguna mendaftar -> menjelajahi katalog produk -> menambahkan barang ke keranjang -> mengisi alamat pengiriman -> menyelesaikan pembayaran via gateway -> menerima konfirmasi otomatis -> melacak pengiriman hingga barang diterima."
          : isSaaS
          ? "Contoh alur: Admin membuat workspace -> mengundang anggota tim -> menghubungkan sumber data -> sistem memproses telemetri -> dashboard menampilkan metrik KPI -> tim mengekspor laporan mingguan."
          : "Contoh alur: Pengguna membuka aplikasi -> membuat akun -> memilih layanan / memasukkan parameter -> sistem memproses output seketika -> pengguna meninjau hasil dan menerima konfirmasi.",
        options: [],
      },
      {
        key: "managedData",
        title: "Data/informasi apa yang perlu dikelola aplikasi?",
        subtitle: "Pilih entitas data inti yang harus disimpan dalam database",
        type: "multiple",
        options: isEcommerce
          ? [
              "Akun Pengguna, Alamat Pengiriman & Profil Pelanggan",
              "Master Katalog Produk, Varian, Foto, Harga & Stok",
              "Transaksi Pesanan, Invoice, Bukti Pembayaran & Kuitansi",
              "Data Logistik, Nomor Resi & Pembaruan Status Pengiriman",
              "Ulasan Pelanggan, Rating Produk & Kupon Promosi",
            ]
          : isSaaS
          ? [
              "Akun Pengguna, Organisasi, Tim & Peran Hak Akses (RBAC)",
              "Entitas Bisnis Inti & Catatan Riwayat Aktivitas Pengguna",
              "Konfigurasi Alur Kerja, Aturan Bisnis Kustom & Endpoint Webhook",
              "Audit Log Sistem, Riwayat Perubahan & Telemetri Keamanan",
              "Paket Berlangganan, Siklus Penagihan & Riwayat Pembayaran",
            ]
          : [
              "Identitas & Profil Pengguna (Kredensial, Pengaturan)",
              "Entitas Domain Inti / Data Master Layanan",
              "Riwayat Transaksi, Catatan Aktivitas & Detail Penagihan",
              "Aset Media yang Diunggah, Lampiran Berkas & Dokumen",
              "Antrean Notifikasi Sistem & Riwayat Log Audit",
            ],
      },
      {
        key: "userRoles",
        title: "Apakah ada beberapa role/peran pengguna yang berbeda di aplikasi?",
        subtitle: "Menentukan apakah aplikasi membutuhkan pembagian hak akses (RBAC) atau profil tunggal",
        type: "single",
        options: [
          "Ya, ada beberapa peran pengguna yang berbeda (misal: Admin, Customer, Staf)",
          "Tidak, hanya ada satu peran pengguna umum dengan hak akses seragam",
        ],
        hasConditionalInput: true,
        conditionalTriggerValue: "Ya",
        conditionalInputLabel: "Sebutkan peran pengguna untuk aplikasi ini:",
        conditionalInputPlaceholder: "misal: Admin, Pelanggan, Manajer Toko, Kurir",
        conditionalInputType: "text",
      },
      {
        key: "specialRules",
        title: "Apakah ada aturan bisnis khusus atau persyaratan kepatuhan?",
        subtitle: "Menentukan logika bisnis khusus, SLA operasional, atau integrasi wajib",
        type: "single",
        options: [
          "Ya, terdapat aturan bisnis khusus atau persyaratan kepatuhan",
          "Tidak, berlaku standar dan konvensi umum perangkat lunak",
        ],
        hasConditionalInput: true,
        conditionalTriggerValue: "Ya",
        conditionalInputLabel: "Jelaskan aturan bisnis, kepatuhan, atau SLA khusus:",
        conditionalInputPlaceholder: "misal: SLA respon pesanan 15 menit, verifikasi KTP sebelum checkout, enkripsi data, integrasi webhook.",
        conditionalInputType: "textarea",
      },
    ];
  }

  return [
    {
      key: "primaryPersona",
      title: "Who is the primary user of this application?",
      subtitle: "Identifies the core target persona and primary customer segment",
      type: "single",
      options: isEcommerce
        ? [
            "Online Shoppers / Direct Consumers (B2C)",
            "Store Owners & Merchant Managers (Sellers)",
            "Resellers, Dropshippers & Sales Agents",
            "Wholesale / Corporate Buyers (B2B)",
          ]
        : isSaaS
        ? [
            "Internal Corporate Teams & Operational Staff",
            "Managers, Team Leads & Decision Makers",
            "Freelancers, Consultants & Independent Creators",
            "External Clients & Business Partners",
          ]
        : isMobile
        ? [
            "Active Daily Mobile Smartphone Users (End-user B2C)",
            "Field Personnel & On-the-go Mobile Agents",
            "Location-based Communities & Social Users",
            "Young Professionals & Mobile Content Creators",
          ]
        : [
            "Individual Consumers / General Public (B2C)",
            "Professionals, Freelancers & Independent Creators",
            "Small & Medium Businesses (SMB)",
            "Corporate Enterprises & Organizations (B2B)",
          ],
    },
    {
      key: "userActivities",
      title: "What should users be able to do in the application?",
      subtitle: "Select the primary activities users will perform most frequently",
      type: "multiple",
      options: isEcommerce
        ? [
            "Browse product catalogs, variant options, and customer reviews",
            "Add items to shopping cart and complete instant checkout",
            "Pay automatically via Payment Gateway (Credit Card, QRIS, E-wallet)",
            "Track delivery order status and shipment updates in real-time",
            "Manage incoming orders, product inventory, and sales reports",
          ]
        : isSaaS
        ? [
            "Input, update, and organize daily operational workflow records",
            "Monitor KPI performance metrics with interactive real-time dashboards",
            "Collaborate with team members, delegate tasks, and share documents",
            "Configure workflow automations and external webhook triggers",
            "Export scheduled reports to PDF or Excel formats",
          ]
        : [
            "Search, filter, and view structured catalog items / content",
            "Complete online transactions, bookings, or reservations",
            "Manage user profiles, record logs, and track activity progress",
            "Communicate, message, or collaborate in real-time with others",
            "View summary metric dashboards and transactional notifications",
          ],
    },
    {
      key: "mvpFeatures",
      title: "Which features are mandatory for the first release (MVP)?",
      subtitle: "Defines the non-negotiable feature scope required for phase 1 launch",
      type: "multiple",
      options: isEcommerce
        ? [
            "Buyer & Seller Account Authentication (Login/Register)",
            "Dynamic Product Catalog with Fast Search & Category Filtering",
            "Integrated Shopping Cart & Frictionless Checkout Flow",
            "Automated Payment Gateway Integration (Stripe / Bank / QRIS)",
            "Automated Order Status Alerts (Email / WhatsApp Notifications)",
          ]
        : isSaaS
        ? [
            "Secure Authentication & Multi-User Team Profile Management",
            "Main Overview Dashboard with Core Operational KPI Metrics",
            "Core Entity CRUD Management with Fast Search & Filtering",
            "Role-based Access Control (RBAC) & Permission Tiers",
            "Data Export Capabilities (CSV/Excel/PDF) & Activity Audit Logs",
          ]
        : [
            "Secure User Authentication (Email/Password & Social OAuth)",
            "Core Application Entity CRUD with Input Validation",
            "Search Engine, Multi-Facet Filters, and Detailed Item Views",
            "Real-time Transactional Alerts and Event Notifications",
            "Activity Summary Dashboard with Core Insights",
          ],
    },
    {
      key: "userFlow",
      title: "What is the end-to-end user flow from start to finish?",
      subtitle: "Outline the step-by-step path a user takes from landing to achieving their goal",
      type: "essay",
      placeholder: isEcommerce
        ? "Example flow: User signs up -> browses product catalog -> adds items to cart -> enters delivery address -> completes payment via payment gateway -> receives automated confirmation -> tracks courier delivery through to completion."
        : isSaaS
        ? "Example flow: Admin creates a workspace -> invites team members -> connects data source -> system parses telemetry -> dashboard renders KPI metrics -> team exports weekly operational report."
        : "Example flow: User opens application -> creates an account -> selects desired service / inputs parameters -> system processes output instantly -> user reviews result and receives confirmation.",
      options: [],
    },
    {
      key: "managedData",
      title: "What primary data/information must the application manage?",
      subtitle: "Select the core entities and data models that must be stored in the database",
      type: "multiple",
      options: isEcommerce
        ? [
            "User Accounts, Shipping Addresses & Customer Profiles",
            "Master Product Catalog, Variants, Imagery, Pricing & Stock",
            "Order Transactions, Invoices, Proof of Payment & Receipts",
            "Logistics Data, Tracking Numbers & Delivery Status Updates",
            "Customer Reviews, Product Ratings & Promotional Coupons",
          ]
        : isSaaS
        ? [
            "User Accounts, Organizations, Teams & RBAC Permission Roles",
            "Core Business Entities & User Activity Event Records",
            "Workflow Configurations, Custom Business Rules & Webhook Endpoints",
            "System Audit Logs, Change Histories & Security Telemetry",
            "Subscription Plans, Billing Cycles & Payment Histories",
          ]
        : [
            "User Identity & Profile Records (Credentials, Preferences)",
            "Core Domain Entities / Primary Service Catalog Records",
            "Transactional Histories, Activity Records & Billing Details",
            "Uploaded Media Assets, File Attachments & Documents",
            "System Notification Queue & Historical Audit Logs",
          ],
    },
    {
      key: "userRoles",
      title: "Are there multiple distinct user roles in the application?",
      subtitle: "Determines whether the application requires tiered permissions (RBAC) or a single user profile",
      type: "single",
      options: [
        "Yes, multiple distinct user roles exist (e.g. Admin, Customer, Staff)",
        "No, single general user role with uniform permissions",
      ],
      hasConditionalInput: true,
      conditionalTriggerValue: "Yes",
      conditionalInputLabel: "Specify the user roles for this application:",
      conditionalInputPlaceholder: "e.g. Admin, Customer, Store Manager, Courier",
      conditionalInputType: "text",
    },
    {
      key: "specialRules",
      title: "Are there any specific business rules or compliance requirements?",
      subtitle: "Defines custom business logic, operational SLAs, regulatory compliance, or mandatory integrations",
      type: "single",
      options: [
        "Yes, custom business rules or regulatory requirements apply",
        "No, standard software conventions and workflows apply",
      ],
      hasConditionalInput: true,
      conditionalTriggerValue: "Yes",
      conditionalInputLabel: "Describe specific business rules, compliance, or SLA requirements:",
      conditionalInputPlaceholder: "e.g. 15-minute SLA order response time, ID verification before checkout, end-to-end data encryption, webhook integrations.",
      conditionalInputType: "textarea",
    },
  ];
}

const QUESTIONS_SYSTEM_PROMPT_EN = `You are a Principal Product Architect and Senior Product Manager.
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
   conditionalInputPlaceholder: "e.g. Admin, Customer, Manager"
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
   conditionalInputPlaceholder: "e.g. SLA response time, data compliance, third-party integrations"
   conditionalInputType: "textarea"

Return strictly valid JSON matching this schema:
{
  "questions": [
    {
      "key": "primaryPersona",
      "title": "Who is the primary user of this application?",
      "subtitle": "...",
      "type": "single",
      "options": ["..."]
    },
    {
      "key": "userActivities",
      "title": "What should users be able to do in the application?",
      "subtitle": "...",
      "type": "multiple",
      "options": ["..."]
    },
    {
      "key": "mvpFeatures",
      "title": "Which features are mandatory for the first release (MVP)?",
      "subtitle": "...",
      "type": "multiple",
      "options": ["..."]
    },
    {
      "key": "userFlow",
      "title": "What is the end-to-end user flow from start to finish?",
      "subtitle": "...",
      "type": "essay",
      "placeholder": "...",
      "options": []
    },
    {
      "key": "managedData",
      "title": "What primary data/information must the application manage?",
      "subtitle": "...",
      "type": "multiple",
      "options": ["..."]
    },
    {
      "key": "userRoles",
      "title": "Are there multiple distinct user roles in the application?",
      "subtitle": "...",
      "type": "single",
      "options": ["Yes, multiple distinct user roles exist (e.g. Admin, Customer, Staff)", "No, single general user role with uniform permissions"],
      "hasConditionalInput": true,
      "conditionalTriggerValue": "Yes",
      "conditionalInputLabel": "Specify the user roles for this application:",
      "conditionalInputPlaceholder": "...",
      "conditionalInputType": "text"
    },
    {
      "key": "specialRules",
      "title": "Are there any specific business rules or compliance requirements?",
      "subtitle": "...",
      "type": "single",
      "options": ["Yes, custom business rules or regulatory requirements apply", "No, standard software conventions and workflows apply"],
      "hasConditionalInput": true,
      "conditionalTriggerValue": "Yes",
      "conditionalInputLabel": "Describe specific business rules, compliance, or SLA requirements:",
      "conditionalInputPlaceholder": "...",
      "conditionalInputType": "textarea"
    }
  ]
}`;

const QUESTIONS_SYSTEM_PROMPT_ID = `Anda adalah Principal Product Architect dan Senior Product Manager.
Tugas Anda adalah menganalisis ide aplikasi pengguna, technical stack, dan target arsitektur, kemudian menghasilkan TEPAT 7 pertanyaan klarifikasi MVP terstandarisasi dalam Bahasa Indonesia formal untuk membangun Product Requirements Document (PRD).

7 PERTANYAAN WAJIB (DALAM URUTAN PERSIS):
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
   options: [4-6 fitur MVP utama dalam Bahasa Indonesia]

4. key: "userFlow"
   title: "Bagaimana alur pengguna dari awal sampai selesai?"
   type: "essay"
   subtitle: "Uraikan langkah perjalanan pengguna mulai dari pertama masuk hingga mencapai tujuan"
   placeholder: "Contoh alur realistis sesuai ide aplikasi dalam Bahasa Indonesia"
   options: []

5. key: "managedData"
   title: "Data/informasi apa yang perlu dikelola aplikasi?"
   type: "multiple"
   subtitle: "Pilih entitas data inti yang harus disimpan dalam database"
   options: [4-6 entitas data spesifik dalam Bahasa Indonesia]

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
   conditionalInputPlaceholder: "misal: SLA respon pesanan 15 menit, verifikasi KTP, enkripsi data, integrasi webhook"
   conditionalInputType: "textarea"

Kembalikan secara strictly JSON object dengan array 'questions' berisi tepat 7 objek pertanyaan tersebut.`;

function getQuestionsSystemPrompt(language: "en" | "id" = "en"): string {
  return language === "id" ? QUESTIONS_SYSTEM_PROMPT_ID : QUESTIONS_SYSTEM_PROMPT_EN;
}

async function callOpenRouterQuestions(
  apiKey: string,
  model: string,
  appName?: string,
  appIdea?: string,
  stacks?: { frontend?: string; backend?: string; database?: string; deployment?: string },
  language: "en" | "id" = "en"
): Promise<GeneratedQuestion[] | null> {
  const userPrompt = `Project Name: ${appName || "Unnamed Project"}
Project Idea & Requirements: ${appIdea || ""}
Tech Stack: ${JSON.stringify(stacks || {})}
Language Preference: ${language === "id" ? "Bahasa Indonesia" : "English"}`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.BETTER_AUTH_URL || "https://moryn.dev",
      "X-Title": "Moryn Question Synthesizer",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: getQuestionsSystemPrompt(language) },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1800,
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`OpenRouter Questions HTTP ${res.status}: ${errorText.slice(0, 200)}`);
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error("Empty response from OpenRouter");
  }

  const cleaned = rawContent
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  const questionsRaw = Array.isArray(parsed.questions) ? parsed.questions : [];

  if (questionsRaw.length === 0) {
    return null;
  }

  const validatedQuestions: GeneratedQuestion[] = questionsRaw.map((qItem: unknown, idx: number) => {
    const q = (typeof qItem === "object" && qItem !== null ? qItem : {}) as Record<string, unknown>;
    const rawType = String(q.type || "").toLowerCase();
    const type: "single" | "multiple" | "essay" =
      rawType === "essay" ? "essay" : rawType === "multiple" ? "multiple" : "single";

    const rawOptions = Array.isArray(q.options) ? q.options : [];
    const options: string[] = rawOptions
      .map((opt: unknown) => {
        if (typeof opt === "string") return opt.trim();
        if (typeof opt === "object" && opt !== null && "label" in opt) {
          return String((opt as { label?: unknown }).label || "").trim();
        }
        return String(opt || "").trim();
      })
      .filter((opt: string) => opt.length > 0);

    const isRoleQ = String(q.key || "").toLowerCase().includes("role") || idx === 5;
    const isSpecialRuleQ = String(q.key || "").toLowerCase().includes("rule") || idx === 6;

    const hasConditionalInput =
      typeof q.hasConditionalInput === "boolean"
        ? q.hasConditionalInput
        : isRoleQ || isSpecialRuleQ;

    const defaultOptions =
      language === "id"
        ? isRoleQ
          ? [
              "Ya, ada beberapa peran pengguna yang berbeda (misal: Admin, Customer, Staf)",
              "Tidak, hanya ada satu peran pengguna umum dengan hak akses seragam",
            ]
          : isSpecialRuleQ
          ? [
              "Ya, terdapat aturan bisnis khusus atau persyaratan kepatuhan",
              "Tidak, berlaku standar dan konvensi umum perangkat lunak",
            ]
          : ["Opsi Standar A", "Opsi Standar B", "Opsi Standar C"]
        : isRoleQ
        ? [
            "Yes, multiple distinct user roles exist (e.g. Admin, Customer, Staff)",
            "No, single general user role with uniform permissions",
          ]
        : isSpecialRuleQ
        ? [
            "Yes, custom business rules or regulatory requirements apply",
            "No, standard software conventions and workflows apply",
          ]
        : ["Standard Option A", "Standard Option B", "Standard Option C"];

    return {
      key: typeof q.key === "string" && q.key.trim() ? q.key.trim() : `question_${idx + 1}`,
      title: typeof q.title === "string" && q.title.trim() ? q.title.trim() : `Question ${idx + 1}`,
      subtitle:
        typeof q.subtitle === "string" && q.subtitle.trim()
          ? q.subtitle.trim()
          : type === "essay"
          ? language === "id"
            ? "Uraikan alur pengguna langkah demi langkah"
            : "Describe the detailed user flow step-by-step"
          : type === "multiple"
          ? language === "id"
            ? "Pilih satu atau beberapa opsi yang sesuai kebutuhan produk Anda"
            : "Select one or more options that fit your product requirements"
          : language === "id"
          ? "Pilih opsi utama untuk menentukan alur arsitektur"
          : "Select the primary option to guide architecture flow",
      type,
      options: type === "essay" ? [] : options.length > 0 ? options : defaultOptions,
      placeholder:
        typeof q.placeholder === "string" && q.placeholder.trim()
          ? q.placeholder.trim()
          : undefined,
      hasConditionalInput,
      conditionalTriggerValue:
        typeof q.conditionalTriggerValue === "string"
          ? q.conditionalTriggerValue
          : language === "id"
          ? "Ya"
          : "Yes",
      conditionalInputLabel:
        typeof q.conditionalInputLabel === "string" && q.conditionalInputLabel.trim()
          ? q.conditionalInputLabel.trim()
          : isRoleQ
          ? language === "id"
            ? "Sebutkan peran pengguna untuk aplikasi ini:"
            : "Specify the user roles for this application:"
          : isSpecialRuleQ
          ? language === "id"
            ? "Jelaskan aturan bisnis, kepatuhan, atau SLA khusus:"
            : "Describe specific business rules, compliance, or SLA requirements:"
          : undefined,
      conditionalInputPlaceholder:
        typeof q.conditionalInputPlaceholder === "string" && q.conditionalInputPlaceholder.trim()
          ? q.conditionalInputPlaceholder.trim()
          : isRoleQ
          ? language === "id"
            ? "misal: Admin, Pelanggan, Staf Operasional, Kurir"
            : "e.g. Admin, Customer, Operations Staff, Courier"
          : isSpecialRuleQ
          ? language === "id"
            ? "misal: SLA respon pesanan 15 menit, verifikasi KTP, enkripsi data, integrasi webhook"
            : "e.g. 15-minute SLA order response time, ID verification before checkout, end-to-end data encryption, webhook integrations"
          : undefined,
      conditionalInputType:
        q.conditionalInputType === "textarea" || isSpecialRuleQ ? "textarea" : "text",
    };
  });

  return validatedQuestions;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true, email: true },
    });

    const isCustomKeysActive = await hasActiveCustomAiKeys(session.user.id);
    if (!isCustomKeysActive) {
      const dailyLimit = getDailyAiCallLimit(user?.tier, user?.email);
      const rl = await checkRateLimit({
        userId: session.user.id,
        scope: "generate:questions",
        limit: dailyLimit,
        windowSeconds: RateLimitWindows.DAY,
      });
      if (!rl.allowed) {
        return NextResponse.json(
          {
            error: "DAILY_LIMIT_REACHED",
            message: "Daily generation limit reached. Please try again tomorrow or configure your own Custom API Key.",
          },
          { status: 429 }
        );
      }
    }

    const body = await req.json().catch(() => ({}));
    const { appName, appIdea, stacks, language = "en" } = body as {
      appName?: string;
      appIdea?: string;
      stacks?: { frontend?: string; backend?: string; database?: string; deployment?: string };
      language?: "en" | "id";
    };

    if (!appIdea || typeof appIdea !== "string" || appIdea.trim().length < 5) {
      return NextResponse.json({ error: "Missing or invalid appIdea" }, { status: 400 });
    }

    // 1. Prioritize OpenRouter Developer API Key
    const developerApiKey = process.env.OPENROUTER_API_KEY;
    if (developerApiKey) {
      let configuredModel = "google/gemini-2.5-flash";
      try {
        const appSettings = await redis.get<{ openRouterModel?: string }>("app:settings");
        if (appSettings?.openRouterModel) {
          configuredModel = appSettings.openRouterModel;
        }
      } catch {
        // Ignore redis get failure
      }

      const modelsToTry = [
        configuredModel,
        "google/gemini-2.5-flash",
        "deepseek/deepseek-chat",
        "openrouter/auto",
      ];
      const uniqueModels = Array.from(new Set(modelsToTry));

      for (const model of uniqueModels) {
        try {
          const questions = await callOpenRouterQuestions(
            developerApiKey,
            model,
            appName,
            appIdea,
            stacks,
            language
          );
          if (questions && questions.length > 0) {
            await incrementUsage("openrouter").catch(() => {});
            return NextResponse.json({ questions });
          }
        } catch (err) {
          console.warn(`[Questions] OpenRouter model ${model} failed:`, err);
        }
      }
    }

    // 2. Call FastAPI AI Engine as secondary fallback
    try {
      const res = await FastApiClient.generateQuestions({ appName, appIdea, stacks, language });
      if (res && Array.isArray(res.questions) && res.questions.length > 0) {
        return NextResponse.json({ questions: res.questions });
      }
    } catch (err: unknown) {
      console.warn("[Questions] FastAPI AI Engine call failed, using contextual fallback:", err);
    }

    // 3. Smart contextual fallback guarantee with single/multiple differentiation
    const fallbackQuestions = getContextualFallbackQuestions({ appName, appIdea, stacks, language });
    return NextResponse.json({ questions: fallbackQuestions });
  } catch (error: unknown) {
    console.error("Error generating questions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}