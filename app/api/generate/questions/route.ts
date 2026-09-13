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
  type: "single" | "multiple";
  options: string[];
}

function getContextualFallbackQuestions({
  appIdea,
  stacks,
}: {
  appName?: string;
  appIdea: string;
  stacks?: { frontend?: string; backend?: string; database?: string; deployment?: string };
}): GeneratedQuestion[] {
  const isMobile = /mobile|android|ios|flutter|react native|smartphone|apk/i.test(appIdea + (stacks?.frontend || ""));
  const isEcommerce = /store|shop|toko|jual|beli|ecommerce|e-commerce|checkout|payment|midtrans/i.test(appIdea);
  const isSaaS = /saas|b2b|subscription|multi-tenant|workspace|dashboard|crm/i.test(appIdea);

  return [
    {
      key: "targetAudience",
      title: "Siapa target pengguna utama aplikasi ini?",
      subtitle: "Bisa memilih lebih dari satu segmen pengguna yang menjadi fokus produk",
      type: "multiple",
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
      type: "single",
      options: isMobile
        ? ["Aplikasi Mobile Native (iOS & Android)", "Aplikasi Android Khusus", "Cross-Platform Mobile + Web Dashboard", "PWA (Progressive Web App)"]
        : ["Aplikasi Web Responsif (Desktop & Mobile Browser)", "Desktop Dashboard Khusus", "Cross-Platform Web + Mobile", "PWA (Progressive Web App)"],
    },
    {
      key: "coreValueProposition",
      title: "Fitur inti dan kapabilitas utama yang wajib hadir di MVP?",
      subtitle: "Pilih kapabilitas terpenting yang akan dimasukkan ke dalam spesifikasi PRD fase 1",
      type: "multiple",
      options: isEcommerce
        ? [
            "Katalog Produk & Checkout Kilat",
            "Integrasi Payment Gateway Otomatis (Midtrans/Xendit/QRIS)",
            "Manajemen Stok & Notifikasi WhatsApp Realtime",
            "Program Loyalitas, Kupon & Diskon Otomatis",
          ]
        : isSaaS
        ? [
            "Automasi Workflow & Penghemat Waktu Operasional",
            "Visualisasi Data & Dashboard Analitik Realtime",
            "Kolaborasi Tim & Manajemen Akses Bertingkat (RBAC)",
            "Integrasi Webhook & REST API Publik",
          ]
        : [
            "Kecepatan Eksekusi & Antarmuka Sederhana (Minimalis)",
            "Otomatisasi Berbasis AI yang Memangkas Pekerjaan Manual",
            "Privasi Data Tinggi & Offline-First Mode",
            "Pelacakan Progres & Notifikasi Transaksional",
          ],
    },
    {
      key: "authMethod",
      title: "Metode otentikasi utama yang ingin digunakan?",
      subtitle: "Pilih skema keamanan akun dan session handler utama",
      type: "single",
      options: [
        "Social Login Cepat (Google & GitHub OAuth)",
        "Email & Password Tradisional dengan Verifikasi OTP",
        "Tanpa Login / Akses Anonim Terlebih Dahulu (Guest Mode)",
        "Single Sign-On (SSO / SAML) Korporat",
      ],
    },
    {
      key: "integrationsAndServices",
      title: "Integrasi pihak ketiga & layanan eksternal yang dibutuhkan?",
      subtitle: "Pilih layanan pendukung yang akan dihubungkan dengan backend aplikasi",
      type: "multiple",
      options: [
        "Payment Gateway (Midtrans, Xendit, Stripe, atau QRIS)",
        "Notifikasi Pesan (WhatsApp Business API / Twilio / Telegram)",
        "Email Transaksional (Resend / SendGrid)",
        "Penyimpanan File Media Cloud (Upload Dokumen, Gambar, PDF)",
        "Pelacak Event & Analitik Produk (PostHog / Google Analytics)",
      ],
    },
    {
      key: "monetizationModel",
      title: "Model monetisasi atau skema pendapatan produk?",
      subtitle: "Mempengaruhi struktur modul billing, subscription, atau checkout",
      type: "multiple",
      options: [
        "Langganan Bulanan / Tahunan (SaaS Subscription)",
        "Transaksi Per-Item / Biaya Layanan (One-Time Payment)",
        "Freemium dengan Fitur Tambahan Berbayar (Add-ons)",
        "Gratis Sepenuhnya / Internal Tool Tanpa Pembayaran",
      ],
    },
    {
      key: "visualAesthetic",
      title: "Gaya visual dan atmosfer antarmuka yang diinginkan?",
      subtitle: "Menentukan panduan estetika design system dan tone of voice UI",
      type: "single",
      options: [
        "Minimalis Modern & Clean (Tipografi Tegas, Whitespace Luas)",
        "Dark Mode High-Contrast (Fokus Data & Developer/AI Vibe)",
        "Corporate Enterprise (Nuansa Biru/Slate Profesional & Kredibel)",
        "Vibrant & Energetic (Aksen Cerah & Interaksi Dinamis)",
      ],
    },
  ];
}

const QUESTIONS_SYSTEM_PROMPT = `You are a Principal Product Architect and Senior Product Manager.
Your task is to analyze the user's application idea, technical stack, and target architecture, then generate EXACTLY 5 to 7 sharp, high-impact clarifying questions to build a comprehensive Product Requirements Document (PRD).

CRITICAL REQUIREMENT - SELECTION TYPE ("single" vs "multiple"):
For each question, you MUST determine whether it should be "single" or "multiple" choice based on the nature of the decision:
- Use "single" when the choices are mutually exclusive, foundational architectural paradigms, or primary workflows.
  Examples: Primary Deployment Target, Core Architecture Paradigm, Primary Target Platform, Main Authentication Flow, Primary Navigation Layout.
- Use "multiple" when the user can legitimately choose multiple simultaneous features, integrations, supported channels, user roles, or payment methods.
  Examples: Key Features to Build in Phase 1 (MVP), Third-Party Integrations & Services, Target User Personas, Notification Channels, Export Formats, Security Safeguards.

Return strictly valid JSON matching this schema:
{
  "questions": [
    {
      "key": "camelCaseKey (e.g. primaryPlatform, coreFeatures, authMethod, externalIntegrations, monetizationPlan)",
      "title": "Clear, direct question in Indonesian (e.g. Fitur inti apa saja yang wajib hadir pada versi MVP?)",
      "subtitle": "Helpful 1-sentence guidance in Indonesian explaining how this shapes the PRD specifications",
      "type": "single" or "multiple",
      "options": ["Array of 4 to 6 specific, realistic options tailored directly to the app idea"]
    }
  ]
}`;

async function callOpenRouterQuestions(
  apiKey: string,
  model: string,
  appName?: string,
  appIdea?: string,
  stacks?: { frontend?: string; backend?: string; database?: string; deployment?: string }
): Promise<GeneratedQuestion[] | null> {
  const userPrompt = `Project Name: ${appName || "Unnamed Project"}
Project Idea & Requirements: ${appIdea || ""}
Tech Stack: ${JSON.stringify(stacks || {})}`;

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
        { role: "system", content: QUESTIONS_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1400,
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
    const type: "single" | "multiple" = rawType === "multiple" ? "multiple" : "single";

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

    return {
      key: typeof q.key === "string" && q.key.trim() ? q.key.trim() : `question_${idx + 1}`,
      title: typeof q.title === "string" && q.title.trim() ? q.title.trim() : `Pertanyaan ${idx + 1}`,
      subtitle:
        typeof q.subtitle === "string" && q.subtitle.trim()
          ? q.subtitle.trim()
          : type === "multiple"
          ? "Pilih satu atau lebih opsi yang sesuai dengan kebutuhan produk"
          : "Pilih salah satu opsi utama untuk menentukan alur arsitektur",
      type,
      options: options.length > 0 ? options : ["Opsi Standar A", "Opsi Standar B", "Opsi Standar C"],
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
            stacks
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
      const res = await FastApiClient.generateQuestions({ appName, appIdea, stacks });
      if (res && Array.isArray(res.questions) && res.questions.length > 0) {
        return NextResponse.json({ questions: res.questions });
      }
    } catch (err: unknown) {
      console.warn("[Questions] FastAPI AI Engine call failed, using contextual fallback:", err);
    }

    // 3. Smart contextual fallback guarantee with single/multiple differentiation
    const fallbackQuestions = getContextualFallbackQuestions({ appName, appIdea, stacks });
    return NextResponse.json({ questions: fallbackQuestions });
  } catch (error: unknown) {
    console.error("Error generating questions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}