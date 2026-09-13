import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redis } from "@/lib/db/redis";
import { incrementUsage } from "@/lib/analytics/usageTracker";

export const maxDuration = 45;

const VALID_PALETTES = [
  "swiss-grid",
  "editorial-tech",
  "amber-signal",
  "clean-product",
  "electric-minimal",
];

const PALETTE_METADATA: Record<string, { name: string; style: string; defaultReasoning: string }> = {
  "swiss-grid": {
    name: "Swiss Grid",
    style: "Neutral & Structured Blue",
    defaultReasoning: "Gaya Swiss Grid dengan aksen biru netral mengutamakan hierarki data presisi dan kredibilitas tinggi, sangat cocok untuk sistem enterprise dan fintech.",
  },
  "editorial-tech": {
    name: "Editorial Tech",
    style: "Warm Editorial & Amber Rust",
    defaultReasoning: "Aksen rust hangat berpadu kanvas warm off-white memberikan identitas visual kuat, berbobot, dan estetik bagi produk SaaS modern dan creator platforms.",
  },
  "amber-signal": {
    name: "Amber Signal",
    style: "High-Visibility Warm Amber",
    defaultReasoning: "Warna amber berenergi tinggi memfokuskan atensi pengguna pada task krusial, indikator operasional, dan dashboard produktivitas secara tajam.",
  },
  "clean-product": {
    name: "Clean Product",
    style: "Approachable Slate & Cyan",
    defaultReasoning: "Palet bernuansa slate dengan sentuhan aksen cyan cerah menghadirkan pengalaman antarmuka yang bersih, mudah dipahami, dan nyaman digunakan dalam waktu lama.",
  },
  "electric-minimal": {
    name: "Electric Minimal",
    style: "Dark Canvas & Electric Emerald",
    defaultReasoning: "Kanvas gelap pekat dengan aksen emerald elektrik memaksimalkan kontras dan fokus visual pada alur kerja data, kode, dan otomasi AI modern.",
  },
};

const VALID_FRONTENDS = [
  "Next.js",
  "React",
  "Vue.js",
  "Svelte",
  "Astro",
  "React Native (Expo)",
  "Flutter (Dart)",
  "HTML5 / Vanilla JS",
];

const VALID_BACKENDS = [
  "Next.js (API Routes)",
  "Node.js",
  "Python (FastAPI/Django)",
  "NestJS",
  "Go",
  "Supabase (Edge Functions)",
  "None (Client-Side Only)",
];

const VALID_DATABASES = [
  "PostgreSQL",
  "Supabase",
  "SQLite (Offline-First)",
  "MongoDB",
  "MySQL",
  "Redis",
];

const VALID_DEPLOYMENTS = [
  "Vercel",
  "Railway",
  "AWS",
  "Docker",
  "Cloudflare Workers / Pages",
  "EAS (Expo)",
];

interface RecommendationPayload {
  stacks: {
    frontend: string;
    backend: string;
    database: string;
    deployment: string;
  };
  paletteId: string;
  paletteName: string;
  designStyle: string;
  badge: string;
  reasoning: string;
  designReasoning: string;
  modelUsed?: string;
}

function getFallbackRecommendation(appIdea: string): RecommendationPayload {
  const isMobile = /mobile|android|ios|flutter|react native|smartphone|apk/i.test(appIdea);
  const isIot = /iot|esp32|arduino|sensor|hardware|mqtt|device/i.test(appIdea);
  const isVanilla = /vanilla|html|css|javascript|no db|simple web|tugas kuliah/i.test(appIdea);
  const isAi = /ai|llm|agent|rag|machine learning|nlp|vision|bot/i.test(appIdea);

  if (isMobile) {
    return {
      stacks: {
        frontend: "React Native (Expo)",
        backend: "Node.js",
        database: "Supabase",
        deployment: "EAS (Expo)",
      },
      paletteId: "clean-product",
      paletteName: "Clean Product",
      designStyle: "Modern Touch-Friendly Mobile",
      badge: "Mobile Cross-Platform",
      reasoning: "React Native dengan Expo dan Supabase mempermudah build aplikasi mobile cepat dengan backend database & auth terkelola.",
      designReasoning: "Palet Clean Product dengan aksen slate & cyan menghadirkan tampilan UI yang jernih, lega, dan nyaman disentuh pada layar smartphone.",
    };
  }

  if (isIot) {
    return {
      stacks: {
        frontend: "React",
        backend: "Python (FastAPI/Django)",
        database: "PostgreSQL",
        deployment: "Docker",
      },
      paletteId: "amber-signal",
      paletteName: "Amber Signal",
      designStyle: "High-Visibility Telemetry & Ops",
      badge: "IoT & Telemetry",
      reasoning: "Python FastAPI dan Docker sangat efisien menangani throughput data sensor latensi rendah dengan Postgres sebagai database reliabel.",
      designReasoning: "Aksen amber hangat memberikan hierarki visual kontras tinggi untuk memonitor metrik sensor dan peringatan status sistem secara cepat.",
    };
  }

  if (isVanilla) {
    return {
      stacks: {
        frontend: "HTML5 / Vanilla JS",
        backend: "None (Client-Side Only)",
        database: "SQLite (Offline-First)",
        deployment: "Cloudflare Workers / Pages",
      },
      paletteId: "swiss-grid",
      paletteName: "Swiss Grid",
      designStyle: "Neutral Structured Minimalist",
      badge: "Lightweight Client-Only",
      reasoning: "Arsitektur client-side ringan tanpa server backend berat, cocok untuk prototipe cepat atau utility apps.",
      designReasoning: "Gaya Swiss Grid dengan aksen biru netral menjaga kesederhanaan prototipe tanpa distraksi elemen grafis berlebih.",
    };
  }

  if (isAi) {
    return {
      stacks: {
        frontend: "Next.js",
        backend: "Python (FastAPI/Django)",
        database: "PostgreSQL",
        deployment: "Railway",
      },
      paletteId: "electric-minimal",
      paletteName: "Electric Minimal",
      designStyle: "Dark Mode AI & Data Canvas",
      badge: "AI Fullstack",
      reasoning: "Next.js untuk UI dinamis dipadukan dengan Python FastAPI untuk pipeline AI/LLM orchestration dan PostgreSQL dengan pgvector.",
      designReasoning: "Latar gelap dengan aksen emerald elektrik sangat populer untuk antarmuka AI dan developer tools, memberikan fokus maksimal pada teks prompt dan hasil pemodelan.",
    };
  }

  return {
    stacks: {
      frontend: "Next.js",
      backend: "Next.js (API Routes)",
      database: "PostgreSQL",
      deployment: "Vercel",
    },
    paletteId: "editorial-tech",
    paletteName: "Editorial Tech",
    designStyle: "Warm Modern SaaS & Knowledge",
    badge: "Modern Fullstack",
    reasoning: "Next.js App Router dengan PostgreSQL dan deployment Vercel memberikan performa SSR cepat, SEO optimal, dan skalabilitas tinggi.",
    designReasoning: "Nuansa warm off-white dengan aksen rust/amber memberikan identitas visual premium, berkarakter kuat, dan estetik tanpa terasa kaku.",
  };
}

const SYSTEM_PROMPT = `You are a Principal Software Architect and Senior Product Design Director.
Your task is to analyze the user's application idea and recommend BOTH:
1. The optimal production-ready Tech Stack & Architecture.
2. The optimal Visual Design Theme, Aesthetic Style, and Color Palette.

Allowed Tech Options (You MUST choose the most suitable exact option from these lists):
- Frontend: ${VALID_FRONTENDS.map((v) => `"${v}"`).join(", ")}
- Backend: ${VALID_BACKENDS.map((v) => `"${v}"`).join(", ")}
- Database: ${VALID_DATABASES.map((v) => `"${v}"`).join(", ")}
- Deployment: ${VALID_DEPLOYMENTS.map((v) => `"${v}"`).join(", ")}

Allowed Design Palettes (Choose ONE that best fits the audience, domain, and emotional feel of the product):
- "swiss-grid" (Swiss Grid: Neutral/Blue - Enterprise, Fintech, Data Systems, High Trust)
- "editorial-tech" (Editorial Tech: Active Theme/Amber-Rust - Modern SaaS, Knowledge, Content Creators, Warm Editorial)
- "amber-signal" (Amber Signal: Warm Amber - Dashboards, Ops, Realtime Monitoring, Task-Focused Productivity)
- "clean-product" (Clean Product: Slate/Cyan - B2B SaaS, Education, Healthcare, Collaboration, Crisp Accessibility)
- "electric-minimal" (Electric Minimal: Dark/Emerald - AI Agents, DevTools, Web3, Terminal/Console, High Contrast Dark)

Return strictly valid JSON matching this schema:
{
  "stacks": {
    "frontend": "string",
    "backend": "string",
    "database": "string",
    "deployment": "string"
  },
  "paletteId": "string",
  "paletteName": "string",
  "designStyle": "Short design aesthetic direction (e.g. Modern Minimalist SaaS, High-Trust Fintech, Dark Canvas AI Workspace)",
  "badge": "Short badge (e.g. Modern Fullstack & Clean Design, Realtime SaaS & Operations)",
  "reasoning": "1-2 concise sentences in Indonesian explaining why this tech stack fits the project.",
  "designReasoning": "1-2 concise sentences in Indonesian explaining why this visual design theme and color palette suits the target users, domain, and product experience."
}`;

async function callOpenRouter(
  apiKey: string,
  model: string,
  appName: string,
  appIdea: string
): Promise<RecommendationPayload | null> {
  const userPrompt = `Project Name: ${appName || "Unnamed Project"}\nProject Concept & Requirements:\n${appIdea}`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.BETTER_AUTH_URL || "https://moryn.dev",
      "X-Title": "Moryn Tech Stack & Design Intelligence",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(25_000),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`OpenRouter HTTP ${res.status}: ${errorText.slice(0, 200)}`);
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error("Empty response from OpenRouter");
  }

  // Parse JSON (stripping code fences if present)
  const cleaned = rawContent
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  const frontend = VALID_FRONTENDS.includes(parsed.stacks?.frontend)
    ? parsed.stacks.frontend
    : "Next.js";
  const backend = VALID_BACKENDS.includes(parsed.stacks?.backend)
    ? parsed.stacks.backend
    : "Next.js (API Routes)";
  const database = VALID_DATABASES.includes(parsed.stacks?.database)
    ? parsed.stacks.database
    : "PostgreSQL";
  const deployment = VALID_DEPLOYMENTS.includes(parsed.stacks?.deployment)
    ? parsed.stacks.deployment
    : "Vercel";
  const paletteId = VALID_PALETTES.includes(parsed.paletteId)
    ? parsed.paletteId
    : "editorial-tech";

  const paletteMeta = PALETTE_METADATA[paletteId] || PALETTE_METADATA["editorial-tech"];

  const paletteName =
    typeof parsed.paletteName === "string" && parsed.paletteName.trim()
      ? parsed.paletteName.trim()
      : paletteMeta.name;

  const designStyle =
    typeof parsed.designStyle === "string" && parsed.designStyle.trim()
      ? parsed.designStyle.trim()
      : paletteMeta.style;

  const designReasoning =
    typeof parsed.designReasoning === "string" && parsed.designReasoning.trim()
      ? parsed.designReasoning.trim()
      : paletteMeta.defaultReasoning;

  return {
    stacks: {
      frontend,
      backend,
      database,
      deployment,
    },
    paletteId,
    paletteName,
    designStyle,
    badge: typeof parsed.badge === "string" ? parsed.badge : "AI Recommended",
    reasoning:
      typeof parsed.reasoning === "string" && parsed.reasoning.trim()
        ? parsed.reasoning.trim()
        : "Kombinasi stack ini memberikan performa andal, arsitektur modular, dan kecepatan deployment optimal untuk ide proyek Anda.",
    designReasoning,
    modelUsed: model,
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { appName = "", appIdea = "" } = body;

    if (!appIdea || appIdea.trim().length < 5) {
      return NextResponse.json(
        { error: "Deskripsi ide proyek minimal 5 karakter untuk dianalisis oleh AI." },
        { status: 400 }
      );
    }

    // Developer OpenRouter API Key
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
          const recommendation = await callOpenRouter(developerApiKey, model, appName, appIdea);
          if (recommendation) {
            // Track developer OpenRouter usage
            await incrementUsage("openrouter").catch(() => {});

            return NextResponse.json({
              success: true,
              recommendation,
            });
          }
        } catch (err) {
          console.warn(`[RecommendStack] OpenRouter model ${model} failed:`, err);
        }
      }
    } else {
      console.warn("[RecommendStack] OPENROUTER_API_KEY is not configured in .env");
    }

    // Graceful rule-based architectural and design fallback if external AI attempts fail
    const fallback = getFallbackRecommendation(appIdea);
    return NextResponse.json({
      success: true,
      recommendation: fallback,
    });
  } catch (error: unknown) {
    console.error("Error in recommend-stack route:", error);
    const msg = error instanceof Error ? error.message : "Failed to recommend stack and design";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
