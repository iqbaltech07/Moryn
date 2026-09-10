import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, RateLimitWindows } from "@/lib/db/rateLimit";
import { getDailyAiCallLimit } from "@/lib/analytics/planQuota";
import { hasActiveCustomAiKeys } from "@/lib/ai/keyManager";
import { FastApiClient } from "@/lib/ai/fastapiClient";

export const maxDuration = 60;

function getContextualFallbackQuestions({
  appIdea,
  stacks,
}: {
  appName?: string;
  appIdea: string;
  stacks?: { frontend?: string; backend?: string; database?: string; deployment?: string };
}) {
  const isMobile = /mobile|android|ios|flutter|react native|smartphone|apk/i.test(appIdea + (stacks?.frontend || ""));
  const isEcommerce = /store|shop|toko|jual|beli|ecommerce|e-commerce|checkout|payment|midtrans/i.test(appIdea);
  const isSaaS = /saas|b2b|subscription|multi-tenant|workspace|dashboard|crm/i.test(appIdea);

  return [
    {
      key: "targetAudience",
      title: "Siapa target audiens utama aplikasi ini?",
      subtitle: "Menentukan gaya antarmuka, bahasa, dan kompleksitas alur produk",
      type: "single" as const,
      options: [
        "Pengguna Umum / Konsumen Individu (B2C)",
        "Profesional, Freelancer & Kreator Independen",
        "Bisnis Kecil & Menengah (UMKM / SMB)",
        "Perusahaan Korporat / Enterprise B2B",
      ],
    },
    {
      key: "primaryPlatform",
      title: "Platform rilis awal yang menjadi fokus utama?",
      subtitle: "Menentukan arsitektur antarmuka dan adaptasi viewport",
      type: "single" as const,
      options: isMobile
        ? ["Aplikasi Mobile Native (iOS & Android)", "Aplikasi Android Khusus", "Cross-Platform Mobile + Web Dashboard", "PWA (Progressive Web App)"]
        : ["Aplikasi Web Responsif (Desktop & Mobile Browser)", "Desktop Dashboard Khusus", "Cross-Platform Web + Mobile", "PWA (Progressive Web App)"],
    },
    {
      key: "coreValueProposition",
      title: "Nilai utama atau keunggulan spesifik aplikasi ini?",
      subtitle: "Fitur pembeda yang paling penting untuk segera diselesaikan",
      type: "single" as const,
      options: isEcommerce
        ? ["Katalog Produk Instan & Checkout Kilat", "Integrasi Payment Gateway Otomatis (Midtrans/Xendit)", "Manajemen Stok & Notifikasi WhatsApp", "Program Loyalitas & Diskon Otomatis"]
        : isSaaS
        ? ["Automasi Workflow & Penghemat Waktu Operasional", "Visualisasi Data & Dashboard Analitik Realtime", "Kolaborasi Tim & Manajemen Akses Bertingkat (RBAC)", "Integrasi API Pihak Ketiga & Webhook Otonom"]
        : ["Kecepatan Eksekusi & Antarmuka Sederhana (Minimalis)", "Otomatisasi Berbasis AI yang Memangkas Pekerjaan Manual", "Privasi Data Tinggi & Offline-First Mode", "Pelacakan Progres & Gamifikasi Interaktif"],
    },
    {
      key: "authMethod",
      title: "Metode otentikasi pengguna yang diinginkan?",
      subtitle: "Menentukan skema keamanan akun dan session handler",
      type: "single" as const,
      options: [
        "Social Login Cepat (Google & GitHub OAuth)",
        "Email & Password Tradisional dengan Verifikasi OTP",
        "Tanpa Login / Akses Anonim Terlebih Dahulu (Guest Mode)",
        "Single Sign-On (SSO / SAML) Korporat",
      ],
    },
    {
      key: "dataStorageStrategy",
      title: "Kebutuhan penyimpanan data & interaksi pengguna?",
      subtitle: "Menentukan model database dan frekuensi transaksi data",
      type: "single" as const,
      options: [
        "Database Relasional Standar (Data Akun, Transaksi, & Riwayat)",
        "Penyimpanan File Media (Upload Gambar, Dokumen, atau PDF)",
        "Realtime Sync & Notifikasi Instan (Websocket / SSE)",
        "Offline-First / Local Storage dengan Sinkronisasi Cloud Berkala",
      ],
    },
    {
      key: "monetizationModel",
      title: "Model monetisasi atau sasaran bisnis?",
      subtitle: "Mempengaruhi fitur billing, subscription, atau checkout",
      type: "single" as const,
      options: [
        "Langganan Bulanan / Tahunan (SaaS Subscription)",
        "Transaksi Per-Item / Biaya Layanan (One-Time Payment)",
        "Gratis Sepenuhnya / Internal Tool Tanpa Pembayaran",
        "Freemium dengan Fitur Ekstra Berbayar",
      ],
    },
    {
      key: "visualAesthetic",
      title: "Gaya visual dan atmosfer antarmuka yang diinginkan?",
      subtitle: "Menentukan design system token dan palet tema",
      type: "single" as const,
      options: [
        "Minimalis Modern & Clean (Tipografi Tegas, Whitespace Luas)",
        "Dark Cyber Brutalist (Aksen Kontras, High-Tech Feels)",
        "Corporate Enterprise (Nuansa Biru/Slate Profesional & Terstruktur)",
        "Vibrant & Energetic (Warna Cerah, Ilustrasi Menarik, Micro-Interactions)",
      ],
    },
  ];
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
            message: "Batas generate harian tercapai. Coba lagi besok atau gunakan Custom API Key sendiri.",
          },
          { status: 429 }
        );
      }
    }

    const body = await req.json().catch(() => ({}));
    const { appName, appIdea, stacks } = body as {
      appName?: string;
      appIdea?: string;
      stacks?: { frontend?: string; backend?: string; database?: string; deployment?: string };
    };

    if (!appIdea || typeof appIdea !== "string" || appIdea.trim().length < 10) {
      return NextResponse.json({ error: "Missing or invalid appIdea" }, { status: 400 });
    }

    // Call FastAPI AI Engine directly
    try {
      const res = await FastApiClient.generateQuestions({ appName, appIdea, stacks });
      if (res && Array.isArray(res.questions) && res.questions.length > 0) {
        return NextResponse.json({ questions: res.questions });
      }
    } catch (err: unknown) {
      console.warn("[Questions] FastAPI AI Engine call failed, using smart fallback:", err);
    }

    // Smart contextual fallback guarantee
    const fallbackQuestions = getContextualFallbackQuestions({ appName, appIdea, stacks });
    return NextResponse.json({ questions: fallbackQuestions });
  } catch (error: unknown) {
    console.error("Error generating questions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}