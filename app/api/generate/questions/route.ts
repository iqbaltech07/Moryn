import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { generateText, generateGemini, parseAndRepairJson, GeminiType } from "@/lib/ai/llm";
import { checkRateLimit, RateLimitWindows } from "@/lib/db/rateLimit";
import { getDailyAiCallLimit } from "@/lib/analytics/planQuota";
import { questionsSchema } from "@/lib/utils/validation";
import {
  QUESTIONS_SYSTEM_PROMPT,
  QUESTIONS_RETRY_SYSTEM_PROMPT,
  buildQuestionsUserPrompt,
} from "@/lib/ai/prompts";
import { hasActiveCustomAiKeys } from "@/lib/ai/keyManager";

export const maxDuration = 60;

const geminiQuestionsSchema = {
  type: GeminiType.ARRAY,
  items: {
    type: GeminiType.OBJECT,
    properties: {
      key: { type: GeminiType.STRING, description: "CamelCase unique identifier for the question" },
      title: { type: GeminiType.STRING, description: "The clear clarifying question" },
      subtitle: { type: GeminiType.STRING, description: "Short descriptive guidance for the question" },
      type: { type: GeminiType.STRING, enum: ["single", "multiple"] },
      options: {
        type: GeminiType.ARRAY,
        items: { type: GeminiType.STRING },
        description: "List of 4 to 7 selectable answer options",
      },
    },
    required: ["key", "title", "subtitle", "type", "options"],
  },
};

function parseAndValidateQuestions(text: string) {
  const parsedData = parseAndRepairJson(text, { expectArray: true });
  if (!parsedData) return null;
  try {
    const validated = questionsSchema.parse(parsedData);
    if (Array.isArray(validated) && validated.length >= 7) {
      return validated.slice(0, 7);
    }
    if (Array.isArray(validated) && validated.length > 0) {
      return validated;
    }
    return null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[Questions] Zod validation failed for parsed JSON:", msg);
    return null;
  }
}

function getContextualFallbackQuestions({
  appName,
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
      title: `Siapa target pengguna utama untuk ${appName || "aplikasi ini"}?`,
      subtitle: "Tentukan audiens sasaran agar fitur dan alur disesuaikan dengan kebutuhan mereka.",
      type: "single" as const,
      options: isSaaS
        ? ["B2B Enterprises & Korporasi", "Usaha Kecil & Menengah (UKM)", "Solopreneur & Freelancer", "Tim Startup & Developer"]
        : isEcommerce
        ? ["Konsumen Umum (B2C)", "Reseller & Dropshipper", "Grosir / Distributor (B2B)", "Komunitas / Niche Khusus"]
        : isMobile
        ? ["Pengguna Mobile Aktif Harian", "Mahasiswa & Pelajar", "Profesional / Pekerja Kantoran", "Semua Golongan Usia"]
        : ["Pengguna Umum / Publik", "Komunitas Kreatif & Profesional", "Internal Tim Perusahaan", "Pelaku Bisnis & Startup"],
    },
    {
      key: "primaryFeature",
      title: "Apa fitur inti (killer feature) yang paling krusial pada versi rilis pertama (MVP)?",
      subtitle: "Pilih kapabilitas utama yang memberikan dampak terbesar bagi pengguna.",
      type: "single" as const,
      options: [
        "Sistem Dashboard & Analisis Data Otomatis",
        "Alur Transaksi & Manajemen Pesanan Real-time",
        "Kolaborasi Tim & Multi-Role Permission",
        "Otomatisasi Workflow & Integrasi AI Asisten",
      ],
    },
    {
      key: "authMethod",
      title: "Metode otentikasi & pendaftaran apa yang ingin didukung?",
      subtitle: "Pilih cara pengguna masuk ke dalam sistem.",
      type: "multiple" as const,
      options: [
        "Email & Password Tradisional (OTP / Verifikasi Link)",
        "Google & GitHub Social OAuth",
        "Magic Link (Passwordless Login)",
        "Single Sign-On (SSO / SAML) Enterprise",
      ],
    },
    {
      key: "monetizationModel",
      title: "Bagaimana model monetisasi atau skema operasional aplikasi ini?",
      subtitle: "Menentukan integrasi payment gateway dan skema langganan.",
      type: "single" as const,
      options: isEcommerce
        ? ["Direct Sales & Komisi Transaksi", "Biaya Langganan Toko Bulanan", "Freemium dengan Fitur Iklan", "Gratis / Non-Komersial"]
        : [
            "Model Langganan Bertingkat (Monthly/Annual SaaS Tier)",
            "Freemium (Fitur Dasar Gratis + Add-on Berbayar)",
            "Pay-per-use / Credit Consumption Model",
            "Gratis / Open Source / Internal Enterprise",
          ],
    },
    {
      key: "realtimeNeeds",
      title: "Sejauh mana kebutuhan integrasi real-time dan notifikasi dalam aplikasi?",
      subtitle: "Menentukan arsitektur WebSockets, Server-Sent Events, atau Webhooks.",
      type: "multiple" as const,
      options: [
        "Push Notification Mobile & Browser Alert",
        "Notifikasi Email Transaksional (Resend/Sendgrid)",
        "Notifikasi WhatsApp / Telegram Gateway",
        "Live Data Update (WebSockets / Supabase Realtime)",
      ],
    },
    {
      key: "designVibe",
      title: "Nuansa UI/UX & gaya estetika seperti apa yang diinginkan?",
      subtitle: "Mengarahkan token visual dan arsitektur layout komponen.",
      type: "single" as const,
      options: [
        "Dark Cyber & High-Tech Futuristic (Aksen Neon)",
        "Clean Minimalist & Utilitarian (Linear/Notion Vibe)",
        "Enterprise Modern & Trustworthy (Deep Navy/Indigo)",
        "Vibrant & Dynamic Motion (Glassmorphism & Gradients)",
      ],
    },
    {
      key: "scalePriority",
      title: "Apa prioritas teknis & skalabilitas utama untuk deployment awal?",
      subtitle: "Menentukan konfigurasi caching, database indexing, dan monitoring.",
      type: "multiple" as const,
      options: [
        "Kecepatan Loading Maksimal & Viewport Caching",
        "Keamanan Data Ketat & Enkripsi Multi-Tenant",
        "Audit Logging & Service Observability",
        "Kemudahan Maintenance & Modularity Bersih",
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
        return NextResponse.json({ error: "DAILY_LIMIT_REACHED", message: `Batas generate harian tercapai. Coba lagi besok atau gunakan Custom API Key sendiri.` }, { status: 429 });
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

    const userPrompt = buildQuestionsUserPrompt({ appName, appIdea, stacks });

    const geminiConfig = {
      responseMimeType: "application/json",
      responseJsonSchema: geminiQuestionsSchema,
    };

    // OpenRouter first with strict 4s timeout (4000ms), Gemini 3.7 fallback
    let result: Awaited<ReturnType<typeof generateText>> | null = null;
    try {
      result = await generateText({
        systemPrompt: QUESTIONS_SYSTEM_PROMPT,
        userPrompt,
        userId: session.user.id,
        priority: "openrouter",
        openRouterTimeoutMs: 4000,
        preferredModel: "gemini-3.7-flash",
        jsonObject: true,
        geminiConfig,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[Questions] Primary OpenRouter/Gemini generation failed:", msg);
    }

    let questions = result ? parseAndValidateQuestions(result.text) : null;

    // Auto-retry with Gemini 3.7 directly if initial parse or validation failed
    if (!questions) {
      console.warn("[Questions] Initial generation returned invalid format or timed out. Retrying directly with Gemini 3.7...");
      try {
        const retryResult = await generateGemini({
          systemPrompt: QUESTIONS_RETRY_SYSTEM_PROMPT,
          userPrompt,
          userId: session.user.id,
          preferredModel: "gemini-3.7-flash",
          jsonObject: true,
          geminiConfig,
        });
        if (retryResult?.text) {
          questions = parseAndValidateQuestions(retryResult.text);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("[Questions] Direct Gemini 3.7 retry failed:", msg);
      }
    }

    // Safety fallback: If remote LLM providers fail completely, use smart contextual 7 questions
    if (!questions || questions.length === 0) {
      console.warn("[Questions] Utilizing contextual fallback generator for guaranteed 7 questions.");
      questions = getContextualFallbackQuestions({ appName, appIdea, stacks });
    }

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    console.error("Error generating questions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}