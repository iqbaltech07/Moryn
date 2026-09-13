import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redis } from "@/lib/db/redis";

import { isTextGenerationModel } from "@/lib/ai/models";

const REDIS_GEMINI_CACHE_KEY = "cache:catalog:gemini:models:text-v3";
const REDIS_LEGACY_CACHE_KEY = "cache:catalog:gemini:models";

interface RawGeminiModel {
  name: string;
  version?: string;
  displayName?: string;
  description?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  supportedGenerationMethods?: string[];
  temperature?: number;
}

interface FormattedGeminiModel {
  id: string;
  name: string;
  description?: string;
  inputTokenLimit?: number;
}

// Non-text, image-generating (including Google's Nano Banana codename), audio, preview, and specialized keywords to strictly exclude
const EXCLUDE_MODEL_KEYWORDS = [
  "preview", // Exclude experimental preview models
  "image",
  "banana", // Google codename for image models (e.g. Nano Banana)
  "imagen",
  "veo",
  "video",
  "tts",
  "transcribe",
  "lyria",
  "music",
  "audio",
  "voice",
  "speech",
  "robotics",
  "computer-use",
  "customtools",
  "deep-research",
  "antigravity",
  "embedding",
  "embed",
  "aqa",
  "omni", // Realtime voice/multimodal stream models
];

export async function GET(req: NextRequest) {
  try {
    // Purge old unfiltered cache key if present
    redis.del(REDIS_LEGACY_CACHE_KEY).catch(() => null);

    // Optional session check (model catalog metadata is public and cached)
    await auth.api.getSession({
      headers: await headers(),
    }).catch(() => null);

    const { searchParams } = new URL(req.url);
    const customKey = searchParams.get("key");
    const apiKey =
      customKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY_SECONDARY;

    if (!apiKey) {
      // Check Redis cache if no key available
      try {
        const cached = await redis.get<string | object>(REDIS_GEMINI_CACHE_KEY);
        if (cached) {
          const cachedData = typeof cached === "string" ? JSON.parse(cached) : cached;
          return NextResponse.json({ ...cachedData, isCached: true });
        }
      } catch {}
      return NextResponse.json(
        { models: [], count: 0, error: "API Key Gemini belum dikonfigurasi." },
        { status: 503 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`,
      {
        next: { revalidate: 3600 }, // Cache 1 hour in Next.js ISR
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API responded with status: ${response.status}`);
    }

    const data = (await response.json()) as { models?: RawGeminiModel[] };
    const rawList: RawGeminiModel[] = Array.isArray(data.models) ? data.models : [];

    const textModels: FormattedGeminiModel[] = [];

    for (const model of rawList) {
      // 1. Must support generateContent (text generation)
      if (!model.supportedGenerationMethods?.includes("generateContent")) {
        continue;
      }

      const rawId = (model.name || "").replace(/^models\//, "");
      const lowerId = rawId.toLowerCase();
      const lowerDisplayName = (model.displayName || "").toLowerCase();
      const lowerDescription = (model.description || "").toLowerCase();

      // 2. Must be a Gemini core text model (starts with gemini-)
      if (!lowerId.startsWith("gemini-")) {
        continue;
      }

      // 3. Exclude image generation, audio/tts, and non-text keywords in ID, name, or description
      const isExcluded = EXCLUDE_MODEL_KEYWORDS.some(
        (kw) => lowerId.includes(kw) || lowerDisplayName.includes(kw) || lowerDescription.includes(kw)
      );
      if (isExcluded) continue;

      if (!isTextGenerationModel({ id: rawId, name: model.displayName, description: model.description })) {
        continue;
      }

      textModels.push({
        id: rawId,
        name: model.displayName || rawId,
        description: model.description,
        inputTokenLimit: model.inputTokenLimit,
      });
    }

    const resultPayload = {
      models: textModels,
      count: textModels.length,
      isFallback: false,
    };

    // Store real response in Redis cache (persisted for 24 hours to survive API downtime)
    try {
      await redis.set(REDIS_GEMINI_CACHE_KEY, JSON.stringify(resultPayload), { ex: 86400 });
    } catch (redisErr) {
      console.warn("Failed to cache Gemini models in Redis:", redisErr);
    }

    return NextResponse.json(resultPayload);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error fetching live Gemini models:", errMessage);

    // Retrieve last known live models from Redis cache (Zero hardcoded fake models)
    try {
      const cached = await redis.get<string | object>(REDIS_GEMINI_CACHE_KEY);
      if (cached) {
        const cachedData = typeof cached === "string" ? JSON.parse(cached) : cached;
        return NextResponse.json({
          ...cachedData,
          isCached: true,
        });
      }
    } catch (cacheErr) {
      console.warn("Failed to retrieve Gemini models from Redis cache:", cacheErr);
    }

    return NextResponse.json(
      {
        models: [],
        count: 0,
        isFallback: false,
        error: "Gagal memuat katalog model Gemini dari API maupun cache.",
      },
      { status: 503 }
    );
  }
}
