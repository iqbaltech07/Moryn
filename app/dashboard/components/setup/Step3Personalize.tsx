"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Loader2,
  Users,
  FileText,
  HelpCircle,
  Layers,
} from "lucide-react";
import { FormData } from "./types";
import { useLanguageStore } from "@/stores/useLanguageStore";

export type LanguageMode = "en" | "id";

export interface PersonalizeOption {
  label: string;
  enLabel?: string;
  idLabel?: string;
  badge?: string;
  badgeType?: "recommended" | "neutral";
  desc?: string;
}

export interface BilingualOptionDef {
  enLabel: string;
  idLabel: string;
  enBadge?: string;
  idBadge?: string;
  badgeType?: "recommended" | "neutral";
  enDesc?: string;
  idDesc?: string;
}

export interface BilingualQuestionDef {
  id: string;
  topicTag: { en: string; id: string };
  question: { en: (name: string) => string; id: (name: string) => string };
  hint: { en: string; id: string };
  selectionType: "single" | "multiple" | "essay";
  placeholder?: { en: string; id: string };
  hasConditionalInput?: boolean;
  conditionalTriggerValue?: { en: string; id: string };
  conditionalInputLabel?: { en: string; id: string };
  conditionalInputPlaceholder?: { en: string; id: string };
  conditionalInputType?: "text" | "textarea";
  roleSuggestions?: { en: string[]; id: string[] };
  ruleSuggestions?: { en: string[]; id: string[] };
  options: BilingualOptionDef[];
}

export const BILINGUAL_PERSONALIZE_QUESTIONS: BilingualQuestionDef[] = [
  {
    id: "primaryPersona",
    topicTag: { en: "01 · PRIMARY PERSONA", id: "01 · PERSONA UTAMA" },
    question: {
      en: (name) => `Who is the primary user of ${name}?`,
      id: (name) => `Siapa pengguna utama dari ${name}?`,
    },
    hint: {
      en: "Identifies the core target persona and primary customer segment for the application.",
      id: "Menentukan target persona utama dan segmen pelanggan inti untuk aplikasi ini.",
    },
    selectionType: "single",
    options: [
      {
        enLabel: "Individual Consumers / General Public (B2C)",
        idLabel: "Konsumen Individu / Masyarakat Umum (B2C)",
        enBadge: "B2C",
        idBadge: "B2C",
        badgeType: "recommended",
        enDesc: "Direct consumers using the app for personal daily needs and self-service tasks.",
        idDesc: "Pengguna langsung yang memakai aplikasi untuk kebutuhan pribadi dan layanan mandiri.",
      },
      {
        enLabel: "Professionals, Freelancers & Independent Creators",
        idLabel: "Profesional, Freelancer & Kreator Independen",
        enBadge: "Prosumer",
        idBadge: "Prosumer",
        badgeType: "neutral",
        enDesc: "Solo operators prioritizing fast execution, workflow efficiency, and portability.",
        idDesc: "Profesional mandiri yang mengutamakan eksekusi cepat, efisiensi alur kerja, dan portabilitas.",
      },
      {
        enLabel: "Small & Medium Businesses (SMB)",
        idLabel: "Usaha Kecil & Menengah (UKM / SMB)",
        enBadge: "Recommended for SaaS",
        idBadge: "Rekomendasi SaaS",
        badgeType: "recommended",
        enDesc: "Local businesses or small teams seeking operational automation and structured tracking.",
        idDesc: "Bisnis lokal atau tim kecil yang membutuhkan otomatisasi operasional dan pelacakan terstruktur.",
      },
      {
        enLabel: "Enterprise / Corporate Organizations (B2B)",
        idLabel: "Perusahaan / Organisasi Korporat (B2B)",
        enBadge: "Enterprise",
        idBadge: "Enterprise",
        badgeType: "neutral",
        enDesc: "Large organizations requiring multi-tier permissions, audit logging, and strict compliance.",
        idDesc: "Organisasi besar yang membutuhkan hak akses bertingkat, audit log, dan kepatuhan regulasi ketat.",
      },
    ],
  },
  {
    id: "userActivities",
    topicTag: { en: "02 · CORE USER ACTIVITIES", id: "02 · AKTIVITAS UTAMA PENGGUNA" },
    question: {
      en: (name) => `What should users be able to do in ${name}?`,
      id: (name) => `Apa yang ingin pengguna lakukan di ${name}?`,
    },
    hint: {
      en: "Select the primary activities users will perform most frequently within the app.",
      id: "Pilih aktivitas-aktivitas utama yang paling sering dilakukan pengguna di dalam aplikasi.",
    },
    selectionType: "multiple",
    options: [
      {
        enLabel: "Browse, filter, and search product or content catalog",
        idLabel: "Menjelajahi, memfilter, dan mencari katalog produk atau konten",
        enBadge: "Discovery",
        idBadge: "Eksplorasi",
        badgeType: "recommended",
        enDesc: "Explore items with instant search, structured categories, and multi-facet filtering.",
        idDesc: "Eksplorasi item dengan pencarian instan, kategori terstruktur, dan filter multi-segi.",
      },
      {
        enLabel: "Place orders, make reservations, or complete online payments",
        idLabel: "Membuat pesanan, melakukan reservasi, atau pembayaran online",
        enBadge: "Transaction",
        idBadge: "Transaksi",
        badgeType: "recommended",
        enDesc: "Frictionless checkout integrated with automated payment gateway verification.",
        idDesc: "Alur checkout lancar terintegrasi dengan verifikasi payment gateway otomatis.",
      },
      {
        enLabel: "Manage records, input data, and upload documents / media",
        idLabel: "Mengelola data, memasukkan input, dan mengunggah dokumen / media",
        enBadge: "Management",
        idBadge: "Manajemen",
        badgeType: "neutral",
        enDesc: "Create, update, and track status lifecycles with cloud file attachment support.",
        idDesc: "Buat, perbarui, dan lacak siklus status data dengan dukungan lampiran file cloud.",
      },
      {
        enLabel: "Interact in real-time, message, or collaborate with team members",
        idLabel: "Berinteraksi real-time, bertukar pesan, atau berkolaborasi dengan tim",
        enBadge: "Collaboration",
        idBadge: "Kolaborasi",
        badgeType: "neutral",
        enDesc: "Two-way communication, live channels, or shared workspace collaboration.",
        idDesc: "Komunikasi dua arah, saluran live chat, atau kolaborasi ruang kerja bersama.",
      },
      {
        enLabel: "View performance analytics, metric dashboards, and exported reports",
        idLabel: "Melihat analitik performa, dashboard metrik, dan laporan ekspor",
        enBadge: "Insights",
        idBadge: "Wawasan",
        badgeType: "neutral",
        enDesc: "Visual KPI summaries and interactive charts tracking activity trends.",
        idDesc: "Ringkasan KPI visual dan diagram interaktif untuk melacak tren aktivitas.",
      },
    ],
  },
  {
    id: "mvpFeatures",
    topicTag: { en: "03 · MVP MUST-HAVE SCOPE", id: "03 · CAKUPAN MVP FASE 1" },
    question: {
      en: (name) => `Which features are mandatory for the first release (MVP) of ${name}?`,
      id: (name) => `Fitur apa yang wajib ada di versi pertama (MVP) ${name}?`,
    },
    hint: {
      en: "Defines the non-negotiable feature scope required for phase 1 launch.",
      id: "Menentukan ruang lingkup fitur non-negotiable yang wajib tersedia pada peluncuran fase 1.",
    },
    selectionType: "multiple",
    options: [
      {
        enLabel: "User Authentication & Profile Management (Login/Register)",
        idLabel: "Autentikasi Pengguna & Profil Akun (Login/Register)",
        enBadge: "Must Have",
        idBadge: "Wajib Ada",
        badgeType: "recommended",
        enDesc: "Secure account onboarding with OAuth, credentials, and protected session state.",
        idDesc: "Onboarding akun yang aman dengan OAuth, kredensial, dan proteksi sesi pengguna.",
      },
      {
        enLabel: "Core Domain CRUD with Fast Search & Category Filtering",
        idLabel: "CRUD Entitas Utama dengan Pencarian Cepat & Filter Kategori",
        enBadge: "Core Engine",
        idBadge: "Mesin Utama",
        badgeType: "recommended",
        enDesc: "The primary business engine to create, read, update, and filter central entities.",
        idDesc: "Mesin bisnis utama untuk membuat, membaca, memperbarui, dan memfilter entitas pusat.",
      },
      {
        enLabel: "Automated Payment Processing / Instant Checkout Workflow",
        idLabel: "Pemrosesan Pembayaran Otomatis / Checkout Instan",
        enBadge: "Monetization",
        idBadge: "Monetisasi",
        badgeType: "neutral",
        enDesc: "Integrated payment gateways (Stripe/QRIS/Bank) with automated invoice generation.",
        idDesc: "Integrasi payment gateway (Stripe/QRIS/Bank) dengan pembuatan faktur otomatis.",
      },
      {
        enLabel: "Transactional Alerts & Real-time Notifications (Email / In-app / Webhook)",
        idLabel: "Notifikasi Transaksional & Pemberitahuan Real-time (Email / In-app / Webhook)",
        enBadge: "Engagement",
        idBadge: "Interaksi",
        badgeType: "neutral",
        enDesc: "Instant status updates delivered directly to users upon key system events.",
        idDesc: "Pembaruan status instan yang dikirim langsung ke pengguna saat ada event sistem penting.",
      },
      {
        enLabel: "Activity Summary Dashboard & Multi-Level Role Access Control",
        idLabel: "Dashboard Ringkasan Aktivitas & Manajemen Hak Akses Multi-Level",
        enBadge: "Control Panel",
        idBadge: "Panel Kontrol",
        badgeType: "neutral",
        enDesc: "Central control hub summarizing key metrics and role permissions.",
        idDesc: "Pusat kendali utama yang merangkum metrik penting dan izin hak akses.",
      },
    ],
  },
  {
    id: "userFlow",
    topicTag: { en: "04 · END-TO-END USER FLOW", id: "04 · ALUR PENGGUNA END-TO-END" },
    question: {
      en: () => "What is the user flow from start to finish?",
      id: () => "Bagaimana alur pengguna dari awal sampai selesai?",
    },
    hint: {
      en: "User journeys are unique to each app. Outline the step-by-step path a user takes from landing to achieving their goal.",
      id: "Perjalanan pengguna unik untuk setiap aplikasi. Uraikan alur langkah demi langkah dari pengguna pertama masuk hingga tujuan utamanya tercapai.",
    },
    selectionType: "essay",
    placeholder: {
      en: "Example flow: User registers -> searches or selects a service -> enters requirement details -> completes checkout -> receives instant confirmation -> tracks execution progress through to completion.",
      id: "Contoh alur: Pengguna mendaftar -> mencari atau memilih layanan -> mengisi detail kebutuhan -> menyelesaikan pembayaran -> menerima konfirmasi instan -> melacak progres eksekusi hingga tuntas.",
    },
    options: [],
  },
  {
    id: "managedData",
    topicTag: { en: "05 · MANAGED DATA & STORAGE", id: "05 · KELOLA DATA & PENYIMPANAN" },
    question: {
      en: (name) => `What data/information must ${name} manage?`,
      id: (name) => `Data/informasi apa yang perlu dikelola oleh ${name}?`,
    },
    hint: {
      en: "Select the core entities and data models that need to be stored in the database.",
      id: "Pilih entitas data dan model inti yang perlu disimpan di dalam database.",
    },
    selectionType: "multiple",
    options: [
      {
        enLabel: "User Accounts & Profiles (Credentials, preferences, session tokens)",
        idLabel: "Akun Pengguna & Profil (Kredensial, preferensi, token sesi)",
        enBadge: "Identity",
        idBadge: "Identitas",
        badgeType: "recommended",
        enDesc: "Identity records, contact info, authentication credentials, and permission scopes.",
        idDesc: "Data identitas, info kontak, kredensial login, dan cakupan izin akses.",
      },
      {
        enLabel: "Core Domain Master Entities / Services & Product Catalogs",
        idLabel: "Entitas Master Utama / Katalog Produk & Layanan",
        enBadge: "Domain Master",
        idBadge: "Master Domain",
        badgeType: "recommended",
        enDesc: "Central business catalog items, pricing, categories, and inventory specs.",
        idDesc: "Item katalog bisnis utama, harga, kategori, dan spesifikasi inventaris.",
      },
      {
        enLabel: "Orders, Transactions, Invoices & Payment Audit Trails",
        idLabel: "Pesanan, Transaksi, Faktur & Rekam Jejak Pembayaran",
        enBadge: "Financial",
        idBadge: "Finansial",
        badgeType: "recommended",
        enDesc: "Billing history, payment status verification, and financial records.",
        idDesc: "Riwayat penagihan, verifikasi status pembayaran, dan rekam audit keuangan.",
      },
      {
        enLabel: "Uploaded Media Assets, Documents & Images (Cloud Storage)",
        idLabel: "Unggahan Aset Media, Dokumen & Gambar (Cloud Storage)",
        enBadge: "Media Store",
        idBadge: "Media Store",
        badgeType: "neutral",
        enDesc: "Binary assets, user-generated images, PDFs, and media attachments.",
        idDesc: "Aset biner, gambar unggahan pengguna, PDF, dan lampiran file.",
      },
      {
        enLabel: "System Activity Logs, Audit Trails & Event Telemetry",
        idLabel: "Log Aktivitas Sistem, Audit Trail & Telemetri Event",
        enBadge: "System Logs",
        idBadge: "Log Sistem",
        badgeType: "neutral",
        enDesc: "Audit event chronologies, user interaction telemetry, and security logs.",
        idDesc: "Kronologi event audit, telemetri interaksi pengguna, dan log keamanan.",
      },
    ],
  },
  {
    id: "userRoles",
    topicTag: { en: "06 · USER ROLES & PERMISSIONS", id: "06 · PERAN PENGGUNA & HAK AKSES" },
    question: {
      en: (name) => `Are there multiple distinct user roles in ${name}?`,
      id: (name) => `Apakah ada beberapa peran/role pengguna yang berbeda di ${name}?`,
    },
    hint: {
      en: "Yes/No → if Yes, specify the distinct user roles and permission levels.",
      id: "Ya/Tidak → Jika Ya, tentukan peran pengguna dan pembagian hak aksesnya.",
    },
    selectionType: "single",
    hasConditionalInput: true,
    conditionalTriggerValue: { en: "Yes", id: "Ya" },
    conditionalInputLabel: {
      en: "Specify the user roles for this application:",
      id: "Sebutkan peran pengguna dalam aplikasi ini:",
    },
    conditionalInputPlaceholder: {
      en: "e.g. Admin, Customer, Warehouse Staff, Field Courier",
      id: "misal: Admin, Pelanggan, Staf Gudang, Kurir Lapangan",
    },
    conditionalInputType: "text",
    roleSuggestions: {
      en: ["Admin", "Customer", "Operations Staff", "Store Manager", "Field Agent"],
      id: ["Admin", "Pelanggan", "Staf Operasional", "Manajer Toko", "Petugas Lapangan"],
    },
    options: [
      {
        enLabel: "Yes, multiple distinct user roles exist (e.g. Admin, Customer, Staff)",
        idLabel: "Ya, ada beberapa peran pengguna berbeda (misal: Admin, Pelanggan, Staf)",
        enBadge: "Multi-Role RBAC",
        idBadge: "Multi-Role RBAC",
        badgeType: "recommended",
        enDesc: "The app requires tiered authorization levels and custom interfaces per persona.",
        idDesc: "Aplikasi membutuhkan otorisasi bertingkat dan antarmuka khusus per persona.",
      },
      {
        enLabel: "No, single general user role with uniform permissions",
        idLabel: "Tidak, hanya satu jenis pengguna umum dengan hak akses seragam",
        enBadge: "Single Role",
        idBadge: "Single Role",
        badgeType: "neutral",
        enDesc: "All users share uniform access and features without separate operational roles.",
        idDesc: "Semua pengguna memiliki hak akses dan fitur yang sama tanpa pemisahan operasional.",
      },
    ],
  },
  {
    id: "specialRules",
    topicTag: {
      en: "07 · SPECIAL REQUIREMENTS & BUSINESS RULES",
      id: "07 · ATURAN BISNIS & KEPATUHAN KHUSUS",
    },
    question: {
      en: (name) => `Are there any specific business rules or compliance requirements for ${name}?`,
      id: (name) => `Apakah ada aturan bisnis khusus atau kebutuhan kepatuhan untuk ${name}?`,
    },
    hint: {
      en: "Yes/No → if Yes, describe any custom business logic, SLAs, regulations, or mandatory integrations.",
      id: "Ya/Tidak → Jika Ya, jelaskan logika bisnis khusus, SLA, regulasi kepatuhan, atau integrasi wajib.",
    },
    selectionType: "single",
    hasConditionalInput: true,
    conditionalTriggerValue: { en: "Yes", id: "Ya" },
    conditionalInputLabel: {
      en: "Describe specific business rules, compliance, or SLA requirements:",
      id: "Jelaskan aturan bisnis khusus, kepatuhan, atau ketentuan SLA:",
    },
    conditionalInputPlaceholder: {
      en: "e.g. 15-minute SLA order response time, ID verification before checkout, end-to-end medical data encryption, mandatory bank webhook integration.",
      id: "misal: SLA waktu respons pesanan 15 menit, verifikasi KTP sebelum checkout, enkripsi data medis end-to-end, integrasi webhook bank otomatis.",
    },
    conditionalInputType: "textarea",
    ruleSuggestions: {
      en: [
        "15-Minute SLA Response Time",
        "Identity Verification / KYC",
        "End-to-End Data Encryption",
        "Mandatory Webhook Notifications",
      ],
      id: [
        "SLA Waktu Respons 15 Menit",
        "Verifikasi Identitas / KYC",
        "Enkripsi Data End-to-End",
        "Notifikasi Webhook Wajib",
      ],
    },
    options: [
      {
        enLabel: "Yes, custom business rules or regulatory requirements apply",
        idLabel: "Ya, berlaku aturan bisnis khusus atau persyaratan regulasi kepatuhan",
        enBadge: "Custom Rules",
        idBadge: "Aturan Khusus",
        badgeType: "recommended",
        enDesc: "Strict compliance regulations, operational SLAs, or mandatory custom integrations.",
        idDesc: "Regulasi kepatuhan ketat, batasan SLA operasional, atau integrasi kustom wajib.",
      },
      {
        enLabel: "No, standard software conventions and workflows apply",
        idLabel: "Tidak, gunakan standar alur kerja aplikasi modern pada umumnya",
        enBadge: "Standard Flow",
        idBadge: "Alur Standar",
        badgeType: "neutral",
        enDesc: "Follow standard modern software patterns without complex compliance mandates.",
        idDesc: "Mengikuti pola perangkat lunak standar tanpa kewajiban regulasi rumit.",
      },
    ],
  },
];

// Fallback lookup dictionary for domain options generated by AI (SaaS, E-Commerce, Mobile)
const DOMAIN_OPTIONS_TRANSLATION_MAP: Record<string, string> = {
  // E-commerce Persona
  "Online Shoppers / Direct Consumers (B2C)": "Pembeli Online / Konsumen Langsung (B2C)",
  "Store Owners & Merchant Managers (Sellers)": "Pemilik Toko & Pengelola Merchant (Penjual)",
  "Resellers, Dropshippers & Sales Agents": "Reseller, Dropshipper & Agen Penjualan",
  "Wholesale / Corporate Buyers (B2B)": "Pembeli Grosir / Korporat (B2B)",

  // SaaS Persona
  "Internal Corporate Teams & Operational Staff": "Tim Internal Korporat & Staf Operasional",
  "Managers, Team Leads & Decision Makers": "Manajer, Team Lead & Pengambil Keputusan",
  "Freelancers, Consultants & Independent Creators": "Freelancer, Konsultan & Kreator Independen",
  "External Clients & Business Partners": "Klien Eksternal & Mitra Bisnis",

  // Mobile Persona
  "Active Daily Mobile Smartphone Users (End-user B2C)": "Pengguna Smartphone Harian Aktif (End-user B2C)",
  "Field Personnel & On-the-go Mobile Agents": "Personel Lapangan & Agen Mobile On-the-go",
  "Location-based Communities & Social Users": "Komunitas Berbasis Lokasi & Pengguna Sosial",
  "Young Professionals & Mobile Content Creators": "Profesional Muda & Kreator Konten Mobile",

  // E-commerce Activities
  "Browse product catalogs, variant options, and customer reviews": "Menjelajahi katalog produk, opsi varian, dan ulasan pelanggan",
  "Add items to shopping cart and complete instant checkout": "Menambahkan item ke keranjang dan checkout instan",
  "Pay automatically via Payment Gateway (Credit Card, QRIS, E-wallet)": "Membayar otomatis via Payment Gateway (Kartu Kredit, QRIS, E-wallet)",
  "Track delivery order status and shipment updates in real-time": "Melacak status pesanan pengiriman dan pembaruan kurir secara real-time",
  "Manage incoming orders, product inventory, and sales reports": "Mengelola pesanan masuk, inventaris produk, dan laporan penjualan",

  // SaaS Activities
  "Input, update, and organize daily operational workflow records": "Menginput, memperbarui, dan mengorganisasi catatan alur kerja operasional harian",
  "Monitor KPI performance metrics with interactive real-time dashboards": "Memantau metrik performa KPI dengan dashboard real-time interaktif",
  "Collaborate with team members, delegate tasks, and share documents": "Berkolaborasi dengan anggota tim, mendelegasikan tugas, dan berbagi dokumen",
  "Configure workflow automations and external webhook triggers": "Mengonfigurasi otomatisasi alur kerja dan pemicu webhook eksternal",
  "Export scheduled reports to PDF or Excel formats": "Mengekspor laporan terjadwal ke format PDF atau Excel",

  // General Activities
  "Search, filter, and view structured catalog items / content": "Mencari, memfilter, dan melihat katalog item / konten terstruktur",
  "Complete online transactions, bookings, or reservations": "Menyelesaikan transaksi online, pemesanan, atau reservasi",
  "Manage user profiles, record logs, and track activity progress": "Mengelola profil pengguna, catatan log, dan melacak progres aktivitas",
  "Communicate, message, or collaborate in real-time with others": "Berkomunikasi, mengirim pesan, atau berkolaborasi real-time",
  "View summary metric dashboards and transactional notifications": "Melihat dashboard metrik ringkasan dan notifikasi transaksional",

  // E-commerce Features
  "Buyer & Seller Account Authentication (Login/Register)": "Autentikasi Akun Pembeli & Penjual (Login/Register)",
  "Dynamic Product Catalog with Fast Search & Category Filtering": "Katalog Produk Dinamis dengan Pencarian Cepat & Filter Kategori",
  "Integrated Shopping Cart & Frictionless Checkout Flow": "Keranjang Belanja Terintegrasi & Alur Checkout Mulus",
  "Automated Payment Gateway Integration (Stripe / Bank / QRIS)": "Integrasi Payment Gateway Otomatis (Stripe / Bank / QRIS)",
  "Automated Order Status Alerts (Email / WhatsApp Notifications)": "Pemberitahuan Status Pesanan Otomatis (Notifikasi Email / WhatsApp)",

  // SaaS Features
  "Secure Authentication & Multi-User Team Profile Management": "Autentikasi Aman & Manajemen Profil Tim Multi-Pengguna",
  "Main Overview Dashboard with Core Operational KPI Metrics": "Dashboard Ikhtisar Utama dengan Metrik KPI Operasional Inti",
  "Core Entity CRUD Management with Fast Search & Filtering": "Manajemen CRUD Entitas Inti dengan Pencarian Cepat & Filter",
  "Role-based Access Control (RBAC) & Permission Tiers": "Kontrol Akses Berbasis Peran (RBAC) & Tingkat Izin",
  "Data Export Capabilities (CSV/Excel/PDF) & Activity Audit Logs": "Kemampuan Ekspor Data (CSV/Excel/PDF) & Log Audit Aktivitas",

  // General Features
  "Secure User Authentication (Email/Password & Social OAuth)": "Autentikasi Pengguna Aman (Email/Password & Social OAuth)",
  "Core Application Entity CRUD with Input Validation": "CRUD Entitas Aplikasi Inti dengan Validasi Input",
  "Search Engine, Multi-Facet Filters, and Detailed Item Views": "Mesin Pencari, Filter Multi-Segi, dan Tampilan Detail Item",
  "Real-time Transactional Alerts and Event Notifications": "Pemberitahuan Transaksional Real-time dan Notifikasi Event",
  "Activity Summary Dashboard with Core Insights": "Dashboard Ringkasan Aktivitas dengan Wawasan Utama",

  // Data
  "User Accounts, Shipping Addresses & Customer Profiles": "Akun Pengguna, Alamat Pengiriman & Profil Pelanggan",
  "Master Product Catalog, Variants, Imagery, Pricing & Stock": "Katalog Produk Master, Varian, Gambar, Harga & Stok",
  "Order Transactions, Invoices, Proof of Payment & Receipts": "Transaksi Pesanan, Faktur, Bukti Pembayaran & Kuitansi",
  "Logistics Data, Tracking Numbers & Delivery Status Updates": "Data Logistik, Nomor Resi Pelacakan & Status Pengiriman",
  "Customer Reviews, Product Ratings & Promotional Coupons": "Ulasan Pelanggan, Rating Produk & Kupon Promosi",
  "User Accounts, Organizations, Teams & RBAC Permission Roles": "Akun Pengguna, Organisasi, Tim & Peran Izin RBAC",
  "Core Business Entities & User Activity Event Records": "Entitas Bisnis Inti & Catatan Peristiwa Aktivitas Pengguna",
  "Workflow Configurations, Custom Business Rules & Webhook Endpoints": "Konfigurasi Alur Kerja, Aturan Bisnis Kustom & Endpoint Webhook",
  "System Audit Logs, Change Histories & Security Telemetry": "Log Audit Sistem, Riwayat Perubahan & Telemetri Keamanan",
  "Subscription Plans, Billing Cycles & Payment Histories": "Paket Langganan, Siklus Penagihan & Riwayat Pembayaran",
  "User Identity & Profile Records (Credentials, Preferences)": "Identitas Pengguna & Catatan Profil (Kredensial, Preferensi)",
  "Core Domain Entities / Primary Service Catalog Records": "Entitas Domain Inti / Rekam Katalog Layanan Utama",
  "Transactional Histories, Activity Records & Billing Details": "Riwayat Transaksi, Catatan Aktivitas & Detail Penagihan",
  "Uploaded Media Assets, File Attachments & Documents": "Aset Media Unggahan, Lampiran Berkas & Dokumen",
  "System Notification Queue & Historical Audit Logs": "Antrean Notifikasi Sistem & Log Audit Historis",
};

const UI_COPY = {
  en: {
    project: "Project",
    mvpScope: "MVP Scope",
    questionOf: (sub: number, total: number) => `QUESTION ${sub} OF ${total}`,
    completed: (pct: number) => `${pct}% completed`,
    essayBadge: "ESSAY / USER FLOW",
    multipleBadge: "MULTIPLE CHOICE",
    singleBadge: "SINGLE CHOICE",
    essayPill: "Outline the step-by-step user journey",
    multiplePill: "Select one or more options",
    singlePill: "Select the primary option",
    selectedCount: (cnt: number) => `${cnt} selected`,
    essayGuidance: "Clear flows enable accurate architecture models, sequence diagrams, and API endpoints.",
    characters: (cnt: number) => `${cnt} characters`,
    needInspiration: "Need inspiration on journey formatting?",
    useTemplate: "Use Example Template",
    customSelection: "Custom Selection:",
    addCustomOptionMultiple: "Add custom option or requirement",
    addCustomOptionSingle: "Write custom option",
    customPlaceholderMultiple: "e.g. Enterprise single sign-on with internal corporate directory",
    customPlaceholderSingle: "e.g. Offline-first field operator mode",
    add: "Add",
    cancel: "Cancel",
    additionalDetails: "Additional Details:",
    additionalDetailsSub: "This information will be directly synthesized into the RBAC architecture and PRD specifications.",
    quickSuggestions: "Quick Suggestions:",
    previous: "Previous",
    skipQuestion: "Skip question",
    nextQuestion: "Next Question",
    generateBlueprint: "Generate Blueprint",
    generatingBlueprint: "Generating Blueprint...",
    calibratingSpecs: "CALIBRATING MVP SPECIFICATIONS",
    preparingSpecs: "Preparing Project Specifications...",
    preparingDesc: (name: string) => `Tailoring architecture options and MVP scope based on your concept for ${name}.`,
  },
  id: {
    project: "Proyek",
    mvpScope: "Ruang Lingkup MVP",
    questionOf: (sub: number, total: number) => `PERTANYAAN ${sub} DARI ${total}`,
    completed: (pct: number) => `${pct}% selesai`,
    essayBadge: "ESAI / ALUR PENGGUNA",
    multipleBadge: "PILIHAN GANDA",
    singleBadge: "PILIHAN TUNGGAL",
    essayPill: "Uraikan langkah perjalanan pengguna dari awal hingga akhir",
    multiplePill: "Pilih satu atau beberapa opsi",
    singlePill: "Pilih opsi utama",
    selectedCount: (cnt: number) => `${cnt} dipilih`,
    essayGuidance: "Alur yang jelas menghasilkan diagram sekuens, model arsitektur, dan endpoint API yang presisi.",
    characters: (cnt: number) => `${cnt} karakter`,
    needInspiration: "Butuh inspirasi format alur pengguna?",
    useTemplate: "Gunakan Contoh Template",
    customSelection: "Pilihan Kustom:",
    addCustomOptionMultiple: "Tambah opsi atau kebutuhan kustom",
    addCustomOptionSingle: "Tulis opsi kustom",
    customPlaceholderMultiple: "misal: Single sign-on enterprise dengan direktori internal",
    customPlaceholderSingle: "misal: Mode operator lapangan offline-first",
    add: "Tambah",
    cancel: "Batal",
    additionalDetails: "Detail Tambahan:",
    additionalDetailsSub: "Informasi ini akan langsung disintesis ke dalam arsitektur RBAC dan spesifikasi PRD.",
    quickSuggestions: "Rekomendasi Cepat:",
    previous: "Sebelumnya",
    skipQuestion: "Lewati pertanyaan",
    nextQuestion: "Pertanyaan Selanjutnya",
    generateBlueprint: "Generate Blueprint",
    generatingBlueprint: "Sedang Menghasilkan Blueprint...",
    calibratingSpecs: "KALIBRASI SPESIFIKASI MVP",
    preparingSpecs: "Menyiapkan Spesifikasi Proyek...",
    preparingDesc: (name: string) => `Menyesuaikan opsi arsitektur dan cakupan MVP berdasarkan konsep untuk ${name}.`,
  },
};

interface Step3PersonalizeProps {
  appName?: string;
  form: FormData;
  subStep: number;
  setSubStep: (val: number | ((prev: number) => number)) => void;
  setDynamicAnswer: (
    key: string,
    value: string | string[],
    type?: "single" | "multiple" | "essay"
  ) => void;
  onBack: () => void;
  onGenerate: () => void;
  loading: boolean;
  questionsLoading?: boolean;
}

export default function Step3Personalize({
  appName = "Stratum AI",
  form,
  subStep,
  setSubStep,
  setDynamicAnswer,
  onBack,
  onGenerate,
  loading,
  questionsLoading = false,
}: Step3PersonalizeProps) {
  const lang = useLanguageStore((state) => state.language);

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");

  const t = UI_COPY[lang];

  const hasDynamicQuestions = Boolean(form.dynamicQuestions && form.dynamicQuestions.length > 0);

  // Normalize questions with full bilingual support
  const normalizedQuestions = hasDynamicQuestions
    ? form.dynamicQuestions.map((q, idx) => {
        const bilingualDef = BILINGUAL_PERSONALIZE_QUESTIONS[idx];
        const isRole = q.key === "userRoles" || idx === 5;
        const isRule = q.key === "specialRules" || idx === 6;

        const topicTag =
          lang === "id"
            ? bilingualDef?.topicTag.id || `0${idx + 1} · ${(q.key || `PERTANYAAN_${idx + 1}`).toUpperCase()}`
            : bilingualDef?.topicTag.en || `0${idx + 1} · ${(q.key || `QUESTION_${idx + 1}`).toUpperCase()}`;

        const questionTitle =
          lang === "id"
            ? bilingualDef?.question.id(appName) || q.title || `Pertanyaan ${idx + 1}`
            : bilingualDef?.question.en(appName) || q.title || `Question ${idx + 1}`;

        const hint =
          lang === "id"
            ? bilingualDef?.hint.id || q.subtitle || ""
            : bilingualDef?.hint.en || q.subtitle || "";

        const placeholder =
          lang === "id"
            ? bilingualDef?.placeholder?.id || q.placeholder
            : bilingualDef?.placeholder?.en || q.placeholder;

        const conditionalTriggerValue =
          lang === "id"
            ? bilingualDef?.conditionalTriggerValue?.id || "Ya"
            : bilingualDef?.conditionalTriggerValue?.en || "Yes";

        const conditionalInputLabel =
          lang === "id"
            ? bilingualDef?.conditionalInputLabel?.id ||
              (isRole ? "Sebutkan peran pengguna dalam aplikasi ini:" : "Jelaskan aturan bisnis atau kebutuhan khusus:")
            : bilingualDef?.conditionalInputLabel?.en ||
              (isRole ? "Specify user roles for this application:" : "Describe specific business rules:");

        const conditionalInputPlaceholder =
          lang === "id"
            ? bilingualDef?.conditionalInputPlaceholder?.id ||
              (isRole ? "misal: Admin, Pelanggan, Staf" : "misal: SLA waktu respons, regulasi kepatuhan data")
            : bilingualDef?.conditionalInputPlaceholder?.en ||
              (isRole ? "e.g. Admin, Customer, Staff" : "e.g. SLA response time, compliance requirements");

        const roleSuggestions =
          lang === "id"
            ? bilingualDef?.roleSuggestions?.id || ["Admin", "Pelanggan", "Staf", "Manajer", "Kurir"]
            : bilingualDef?.roleSuggestions?.en || ["Admin", "Customer", "Staff", "Manager", "Courier"];

        const ruleSuggestions =
          lang === "id"
            ? bilingualDef?.ruleSuggestions?.id || [
                "SLA Waktu Respons 15 Menit",
                "Verifikasi Identitas / KYC",
                "Enkripsi Data End-to-End",
              ]
            : bilingualDef?.ruleSuggestions?.en || [
                "15-Minute SLA Response Time",
                "Identity Verification / KYC",
                "End-to-End Data Encryption",
              ];

        const options = (q.options || []).map((opt, oIdx) => {
          const isStr = typeof opt === "string";
          const optObj = !isStr && typeof opt === "object" && opt !== null ? (opt as Record<string, unknown>) : null;
          const rawLabel = isStr ? opt : String(optObj?.label || opt);
          const rawDesc = isStr ? "" : String(optObj?.desc || "");
          const rawBadge = isStr
            ? oIdx === 0
              ? lang === "id"
                ? "Rekomendasi"
                : "Recommended"
              : undefined
            : optObj?.badge
            ? String(optObj.badge)
            : undefined;

          // Check if option matches bilingual default or domain translation dictionary
          const matchedBilingualOpt = bilingualDef?.options?.[oIdx];
          const dictTranslated = DOMAIN_OPTIONS_TRANSLATION_MAP[rawLabel];

          const enLabel = matchedBilingualOpt?.enLabel || rawLabel;
          const idLabel = matchedBilingualOpt?.idLabel || dictTranslated || rawLabel;

          const enDesc = matchedBilingualOpt?.enDesc || rawDesc;
          const idDesc = matchedBilingualOpt?.idDesc || rawDesc;

          const enBadge = matchedBilingualOpt?.enBadge || rawBadge;
          const idBadge = matchedBilingualOpt?.idBadge || (rawBadge === "Recommended" ? "Rekomendasi" : rawBadge);

          return {
            label: lang === "id" ? idLabel : enLabel,
            enLabel,
            idLabel,
            desc: lang === "id" ? idDesc : enDesc,
            badge: lang === "id" ? idBadge : enBadge,
            badgeType: oIdx === 0 ? ("recommended" as const) : ("neutral" as const),
          };
        });

        return {
          id: q.key || bilingualDef?.id || `question_${idx + 1}`,
          topicTag,
          question: questionTitle,
          hint,
          selectionType: (q.type as "single" | "multiple" | "essay") || bilingualDef?.selectionType || "single",
          placeholder,
          hasConditionalInput: q.hasConditionalInput ?? bilingualDef?.hasConditionalInput ?? (isRole || isRule),
          conditionalTriggerValue,
          conditionalInputLabel,
          conditionalInputPlaceholder,
          conditionalInputType:
            q.conditionalInputType || bilingualDef?.conditionalInputType || (isRule ? "textarea" : "text"),
          roleSuggestions,
          ruleSuggestions,
          options,
        };
      })
    : BILINGUAL_PERSONALIZE_QUESTIONS.map((q) => {
        const topicTag = lang === "id" ? q.topicTag.id : q.topicTag.en;
        const questionTitle = lang === "id" ? q.question.id(appName || "proyek Anda") : q.question.en(appName || "your project");
        const hint = lang === "id" ? q.hint.id : q.hint.en;
        const placeholder = lang === "id" ? q.placeholder?.id : q.placeholder?.en;
        const conditionalTriggerValue = lang === "id" ? q.conditionalTriggerValue?.id || "Ya" : q.conditionalTriggerValue?.en || "Yes";
        const conditionalInputLabel = lang === "id" ? q.conditionalInputLabel?.id : q.conditionalInputLabel?.en;
        const conditionalInputPlaceholder =
          lang === "id" ? q.conditionalInputPlaceholder?.id : q.conditionalInputPlaceholder?.en;
        const roleSuggestions = lang === "id" ? q.roleSuggestions?.id : q.roleSuggestions?.en;
        const ruleSuggestions = lang === "id" ? q.ruleSuggestions?.id : q.ruleSuggestions?.en;

        const options = q.options.map((opt) => ({
          label: lang === "id" ? opt.idLabel : opt.enLabel,
          enLabel: opt.enLabel,
          idLabel: opt.idLabel,
          desc: lang === "id" ? opt.idDesc : opt.enDesc,
          badge: lang === "id" ? opt.idBadge : opt.enBadge,
          badgeType: opt.badgeType,
        }));

        return {
          id: q.id,
          topicTag,
          question: questionTitle,
          hint,
          selectionType: q.selectionType,
          placeholder,
          hasConditionalInput: q.hasConditionalInput,
          conditionalTriggerValue,
          conditionalInputLabel,
          conditionalInputPlaceholder,
          conditionalInputType: q.conditionalInputType,
          roleSuggestions,
          ruleSuggestions,
          options,
        };
      });

  const totalQuestions = normalizedQuestions.length;
  const currentQ = normalizedQuestions[subStep] || normalizedQuestions[0];
  const isMultiple = currentQ?.selectionType === "multiple";
  const isEssay = currentQ?.selectionType === "essay";
  const allowCustomOption = !isEssay && !currentQ?.hasConditionalInput;

  const rawAnswer = form.dynamicAnswers[currentQ?.id];
  const selectedArr = Array.isArray(rawAnswer)
    ? rawAnswer
    : typeof rawAnswer === "string" && rawAnswer
    ? [rawAnswer]
    : [];

  // Bidirectional selection matching across EN and ID
  const isSelected = (opt: { enLabel: string; idLabel: string; label: string }) => {
    if (isMultiple) {
      return (
        selectedArr.includes(opt.enLabel) ||
        selectedArr.includes(opt.idLabel) ||
        selectedArr.includes(opt.label)
      );
    }
    return (
      rawAnswer === opt.enLabel ||
      rawAnswer === opt.idLabel ||
      rawAnswer === opt.label
    );
  };

  const selectedCount = isMultiple ? selectedArr.length : rawAnswer ? 1 : 0;
  const hasSelection = selectedCount > 0;

  // Strict affirmative detection for Q6 / Q7 (supports both English and Indonesian answers)
  const isAffirmativeSelection = () => {
    if (!rawAnswer) return false;
    const answerStr = Array.isArray(rawAnswer) ? rawAnswer[0] : String(rawAnswer);
    if (!answerStr) return false;

    const trimmed = answerStr.trim();
    const lower = trimmed.toLowerCase();

    // 1. Definitively reject if matches negative option (No / Tidak)
    if (currentQ?.options?.[1]) {
      const opt1 = currentQ.options[1];
      if (
        answerStr === opt1.label ||
        answerStr === opt1.enLabel ||
        answerStr === opt1.idLabel
      ) {
        return false;
      }
    }

    // 2. Reject negative prefixes (Tidak / No / Bukan)
    if (
      lower.startsWith("tidak") ||
      lower.startsWith("no") ||
      lower.startsWith("bukan")
    ) {
      return false;
    }

    // 3. Definitively accept if matches affirmative option (Yes / Ya)
    if (currentQ?.options?.[0]) {
      const opt0 = currentQ.options[0];
      if (
        answerStr === opt0.label ||
        answerStr === opt0.enLabel ||
        answerStr === opt0.idLabel
      ) {
        return true;
      }
    }

    // 4. Accept affirmative prefixes (Ya / Yes)
    if (
      lower.startsWith("ya") ||
      lower.startsWith("yes")
    ) {
      return true;
    }

    // 5. Trigger value check if explicitly provided
    if (currentQ?.conditionalTriggerValue) {
      const trigVal = currentQ.conditionalTriggerValue.trim().toLowerCase();
      if (lower === trigVal || lower.startsWith(trigVal)) {
        return true;
      }
    }

    return false;
  };

  const isConditionalTriggered = Boolean(
    currentQ?.hasConditionalInput && isAffirmativeSelection()
  );

  const detailKey = `${currentQ?.id}_detail`;
  const detailAnswer = (form.dynamicAnswers[detailKey] as string) || "";

  const handleSelectOption = (opt: { label: string; enLabel: string; idLabel: string }) => {
    if (isMultiple) {
      const isCurrentlySelected =
        selectedArr.includes(opt.enLabel) ||
        selectedArr.includes(opt.idLabel) ||
        selectedArr.includes(opt.label);

      if (isCurrentlySelected) {
        const nextArr = selectedArr.filter(
          (item) => item !== opt.enLabel && item !== opt.idLabel && item !== opt.label
        );
        setDynamicAnswer(currentQ.id, nextArr, "multiple");
      } else {
        setDynamicAnswer(currentQ.id, opt.label, "multiple");
      }
    } else {
      setDynamicAnswer(currentQ.id, opt.label, "single");

      // When selecting negative choice on conditional question, clear stale detail answers
      if (currentQ?.hasConditionalInput) {
        const lower = opt.label.trim().toLowerCase();
        const isNegative =
          lower.startsWith("tidak") ||
          lower.startsWith("no") ||
          lower.startsWith("bukan") ||
          (currentQ.options?.[1] &&
            (opt.label === currentQ.options[1].label ||
              opt.label === currentQ.options[1].enLabel ||
              opt.label === currentQ.options[1].idLabel));

        if (isNegative) {
          setDynamicAnswer(detailKey, "", "single");
        }
      }
    }
  };

  const handleEssayChange = (val: string) => {
    setDynamicAnswer(currentQ.id, val, "essay");
  };

  const handleDetailChange = (val: string) => {
    setDynamicAnswer(detailKey, val, "single");
  };

  const handleAppendSuggestion = (suggestion: string) => {
    if (!detailAnswer) {
      handleDetailChange(suggestion);
    } else if (!detailAnswer.includes(suggestion)) {
      handleDetailChange(`${detailAnswer}, ${suggestion}`);
    }
  };

  const handleAddCustom = () => {
    const trimmed = customText.trim();
    if (!trimmed) return;
    setDynamicAnswer(currentQ.id, trimmed, currentQ.selectionType);
    setCustomText("");
    setShowCustomInput(false);
  };

  const customMultipleAnswers = isMultiple && allowCustomOption
    ? selectedArr.filter(
        (item) =>
          !currentQ.options.some(
            (opt) => opt.enLabel === item || opt.idLabel === item || opt.label === item
          )
      )
    : [];

  const handleRemoveCustomAnswer = (tag: string) => {
    setDynamicAnswer(currentQ.id, tag, "multiple");
  };

  const handleNext = () => {
    if (subStep < totalQuestions - 1) {
      setSubStep(subStep + 1);
      setShowCustomInput(false);
    } else {
      onGenerate();
    }
  };

  const handlePrev = () => {
    if (subStep > 0) {
      setSubStep(subStep - 1);
      setShowCustomInput(false);
    } else {
      onBack();
    }
  };

  const progressPercent = Math.round(((subStep + 1) / Math.max(totalQuestions, 1)) * 100);

  // Loading Screen while generating clarifying questions
  if (questionsLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white border border-neutral-200/80 rounded-2xl p-8 sm:p-14 shadow-[0_2px_12px_rgba(0,0,0,0.02)] text-center">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center mx-auto mb-4 text-[#E05A38]">
          <Loader2 size={24} className="animate-spin" />
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-mono font-medium tracking-wider mb-2">
          <span>{t.calibratingSpecs}</span>
        </div>
        <h3 className="text-xl font-bold text-neutral-900 tracking-tight mb-2">
          {t.preparingSpecs}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed">
          {t.preparingDesc(appName || (lang === "id" ? "proyek Anda" : "your project"))}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-9 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {/* Top Project Context Bar */}
      <div className="flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl bg-[#FAF9F6] border border-neutral-200/80 mb-7 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E05A38]" />
          <span className="text-neutral-400 text-[11px] uppercase tracking-wider font-semibold">
            {t.project}:
          </span>
          <span className="font-bold text-neutral-900">{appName || "Stratum AI"}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-neutral-400 font-mono">
            {t.mvpScope}
          </span>
        </div>
      </div>

      {/* Progress header & bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-[11px] font-bold tracking-widest text-[#E05A38] uppercase">
            {t.questionOf(subStep + 1, totalQuestions)}
          </span>
          <span className="text-neutral-400 font-medium">{t.completed(progressPercent)}</span>
        </div>
        <div className="w-full h-1 bg-[#F5F2EA] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E05A38] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Topic Tag */}
      <div className="inline-block px-2.5 py-1 rounded-md bg-[#FAF9F6] border border-neutral-200/60 text-[10px] font-mono font-bold tracking-widest text-neutral-600 uppercase mb-3">
        {currentQ.topicTag}
      </div>

      {/* Main Question Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight leading-snug mb-2">
        {currentQ.question}
      </h2>

      {/* Hint / Subtitle */}
      <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed mb-6">
        {currentQ.hint}
      </p>

      {/* Header Pill Indicating Input Type */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pt-2 border-t border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-widest text-neutral-600 uppercase">
            {isEssay ? t.essayBadge : isMultiple ? t.multipleBadge : t.singleBadge}
          </span>
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
              isEssay
                ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                : isMultiple
                ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                : "bg-orange-50 text-[#E05A38] border border-orange-200/60"
            }`}
          >
            {isEssay ? t.essayPill : isMultiple ? t.multiplePill : t.singlePill}
          </span>
        </div>
        {!isEssay && (
          <span
            className={`text-xs font-semibold ${
              hasSelection ? "text-[#E05A38]" : "text-neutral-400"
            }`}
          >
            {t.selectedCount(selectedCount)}
          </span>
        )}
      </div>

      {/* ── QUESTION TYPE: ESSAY (Q4) ── */}
      {isEssay ? (
        <div className="space-y-4 mb-6">
          <div className="relative">
            <textarea
              rows={6}
              value={typeof rawAnswer === "string" ? rawAnswer : ""}
              onChange={(e) => handleEssayChange(e.target.value)}
              placeholder={
                currentQ.placeholder ||
                (lang === "id"
                  ? "Jelaskan alur perjalanan pengguna dari pertama masuk, interaksi utama, hingga tujuan tercapai..."
                  : "Describe the user journey from landing, core interaction, to goal completion...")
              }
              className="w-full p-4 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-[#E05A38] focus:ring-2 focus:ring-[#E05A38]/20 transition leading-relaxed resize-y"
            />
            <div className="flex items-center justify-between mt-2 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1 text-neutral-500">
                <FileText size={13} className="text-[#E05A38]" />
                <span>{t.essayGuidance}</span>
              </span>
              <span>
                {t.characters(typeof rawAnswer === "string" ? rawAnswer.length : 0)}
              </span>
            </div>
          </div>

          {/* Quick template button */}
          {!rawAnswer && currentQ.placeholder && (
            <div className="p-3 bg-neutral-50 border border-neutral-200/70 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-neutral-600">
                <HelpCircle size={15} className="text-[#E05A38] shrink-0" />
                <span className="text-[11px]">{t.needInspiration}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (currentQ.placeholder) {
                    handleEssayChange(
                      currentQ.placeholder.replace(/^(Example flow|Contoh alur):\s*/i, "")
                    );
                  }
                }}
                className="px-3 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 text-[#E05A38] font-semibold rounded-lg transition text-[11px] cursor-pointer shrink-0"
              >
                {t.useTemplate}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ── QUESTION TYPE: SINGLE & MULTIPLE CHOICE ── */
        <>
          {/* Custom Multiple Choice Selected Badges */}
          {isMultiple && customMultipleAnswers.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-4 p-3 bg-neutral-50 border border-neutral-200/70 rounded-xl">
              <span className="text-[11px] text-neutral-500 font-medium">{t.customSelection}</span>
              {customMultipleAnswers.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-[#E05A38] border border-orange-200/60 text-xs font-medium"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomAnswer(tag)}
                    className="hover:text-red-700 cursor-pointer"
                    title="Remove custom option"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Options List */}
          <div className="space-y-3 mb-5">
            {currentQ.options.map((opt) => {
              const selected = isSelected(opt);

              return (
                <div
                  key={opt.enLabel || opt.label}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 text-left ${
                    selected
                      ? "border-[#E05A38] bg-[#FCFAF8] ring-1 ring-[#E05A38]/30 shadow-2xs"
                      : "border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/50"
                  }`}
                >
                  {/* Indicator: Checkbox for Multiple, Radio for Single */}
                  {isMultiple ? (
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                        selected
                          ? "border-[#E05A38] bg-[#E05A38] text-white shadow-2xs"
                          : "border-neutral-300 bg-white"
                      }`}
                    >
                      {selected && <Check size={11} strokeWidth={3} />}
                    </div>
                  ) : (
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                        selected
                          ? "border-[#E05A38] bg-[#E05A38]"
                          : "border-neutral-300 bg-white"
                      }`}
                    >
                      {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  )}

                  {/* Text & Badges */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug">
                        {opt.label}
                      </h4>
                      {opt.badge && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            opt.badgeType === "recommended"
                              ? "bg-[#FAF3F0] text-[#E05A38] border border-[#E05A38]/20"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.desc && (
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        {opt.desc}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Custom Option Input (only for non-binary questions without conditional inputs) */}
          {allowCustomOption && (
            <div className="mb-6">
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E05A38] hover:text-[#c44728] transition cursor-pointer"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  <span>
                    {isMultiple ? t.addCustomOptionMultiple : t.addCustomOptionSingle}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF9F6] border border-neutral-200">
                  <input
                    type="text"
                    placeholder={
                      isMultiple ? t.customPlaceholderMultiple : t.customPlaceholderSingle
                    }
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustom();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-transparent text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className="px-3 py-1.5 rounded-lg bg-[#E05A38] text-white text-xs font-semibold hover:bg-[#d04a28] cursor-pointer shrink-0"
                  >
                    {t.add}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="px-2 py-1.5 text-neutral-400 hover:text-neutral-700 text-xs cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── DYNAMIC CONDITIONAL INPUT (Q6 ROLES & Q7 SPECIAL RULES) ── */}
      {isConditionalTriggered && (
        <div className="mb-7 p-5 rounded-2xl bg-[#FCFAF8] border border-[#E05A38]/30 shadow-xs transition-all animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-2 text-[#E05A38]">
            {currentQ.conditionalInputType === "textarea" ? (
              <Layers size={16} />
            ) : (
              <Users size={16} />
            )}
            <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
              {currentQ.conditionalInputLabel || t.additionalDetails}
            </h4>
          </div>

          <p className="text-[11px] text-neutral-500 mb-3">
            {currentQ.id === "userRoles"
              ? lang === "id"
                ? "Tentukan peran pengguna dan ruang lingkup hak akses untuk arsitektur RBAC aplikasi ini."
                : "Specify the user roles and permission scopes for the RBAC architecture."
              : currentQ.id === "specialRules"
              ? lang === "id"
                ? "Ketentuan ini akan disintesis langsung ke dalam aturan bisnis, SLA, dan kepatuhan PRD."
                : "These constraints will be directly synthesized into business validation rules, SLAs, and compliance specs."
              : t.additionalDetailsSub}
          </p>

          {currentQ.conditionalInputType === "textarea" ? (
            <textarea
              rows={3}
              value={detailAnswer}
              onChange={(e) => handleDetailChange(e.target.value)}
              placeholder={
                currentQ.conditionalInputPlaceholder ||
                (lang === "id" ? "Jelaskan kebutuhan atau aturan khusus..." : "Describe specific requirements...")
              }
              className="w-full p-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-[#E05A38] focus:ring-2 focus:ring-[#E05A38]/20 transition leading-relaxed resize-y"
            />
          ) : (
            <input
              type="text"
              value={detailAnswer}
              onChange={(e) => handleDetailChange(e.target.value)}
              placeholder={
                currentQ.conditionalInputPlaceholder ||
                (lang === "id" ? "misal: Admin, Pelanggan, Staf, Kurir" : "e.g. Admin, Customer, Staff, Courier")
              }
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-[#E05A38] focus:ring-2 focus:ring-[#E05A38]/20 transition"
            />
          )}

          {/* Suggested Quick Add Chips */}
          {(currentQ.roleSuggestions || currentQ.ruleSuggestions) && (
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-neutral-400 font-medium mr-1">
                {t.quickSuggestions}
              </span>
              {(currentQ.roleSuggestions || currentQ.ruleSuggestions || []).map((sugg) => (
                <button
                  key={sugg}
                  type="button"
                  onClick={() => handleAppendSuggestion(sugg)}
                  className="px-2 py-0.5 rounded-md bg-white hover:bg-orange-50 border border-neutral-200 hover:border-orange-300 text-neutral-600 hover:text-[#E05A38] text-[10px] font-medium transition cursor-pointer"
                >
                  + {sugg}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation Actions */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-neutral-100">
        <button
          type="button"
          onClick={handlePrev}
          className="px-5 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>{t.previous}</span>
        </button>

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2.5 rounded-xl text-neutral-500 hover:text-neutral-800 font-semibold text-xs transition cursor-pointer"
          >
            {t.skipQuestion}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-[#E05A38] hover:bg-[#d04a28] text-white font-semibold text-xs shadow-2xs transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>{t.generatingBlueprint}</span>
              </>
            ) : subStep === totalQuestions - 1 ? (
              <>
                <span>{t.generateBlueprint}</span>
                <ArrowRight size={14} />
              </>
            ) : (
              <>
                <span>{t.nextQuestion}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
