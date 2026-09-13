import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redis } from "@/lib/db/redis";

import { isTextGenerationModel } from "@/lib/ai/models";

const REDIS_OPENROUTER_CACHE_KEY = "cache:catalog:openrouter:models:text-v3";
const REDIS_LEGACY_CACHE_KEY = "cache:catalog:openrouter:models";

interface FormattedModel {
  id: string;
  name: string;
  contextLength?: number;
  isFree?: boolean;
}

interface RawOpenRouterModel {
  id: string;
  name?: string;
  description?: string;
  context_length?: number;
  architecture?: {
    modality?: string;
    input_modalities?: string[];
    output_modalities?: string[];
  };
  pricing?: {
    prompt?: string | number;
    completion?: string | number;
  };
}

export async function GET() {
  try {
    // Purge old unfiltered cache key if present
    redis.del(REDIS_LEGACY_CACHE_KEY).catch(() => null);

    // Optional session check (OpenRouter model catalog is public metadata and cached)
    await auth.api.getSession({
      headers: await headers(),
    }).catch(() => null);

    const response = await fetch("https://openrouter.ai/api/v1/models", {
      next: { revalidate: 3600 }, // Cache 1 hour in Next.js ISR
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API responded with status: ${response.status}`);
    }

    const data = (await response.json()) as { data?: RawOpenRouterModel[] };
    const rawList: RawOpenRouterModel[] = Array.isArray(data.data) ? data.data : [];

    const freeChatModels: FormattedModel[] = [];
    const top20RankedModels: FormattedModel[] = [];

    for (const model of rawList) {
      const arch = model.architecture || {};
      const outputModalities = Array.isArray(arch.output_modalities)
        ? arch.output_modalities.map((m) => String(m).toLowerCase())
        : [];

      // 1. Must output text ONLY (Strict AI Generated Text filter: no image, audio, video)
      if (outputModalities.length === 0) continue;
      if (!outputModalities.every((m) => m === "text")) continue;

      // 2. Validate via shared text-generation filter helper
      const isValidTextGen = isTextGenerationModel({
        id: model.id,
        name: model.name,
        description: model.description,
        outputModalities,
        modality: arch.modality,
      });
      if (!isValidTextGen) continue;

      const isFree =
        (model.pricing &&
          (model.pricing.prompt === "0" || model.pricing.prompt === 0) &&
          (model.pricing.completion === "0" || model.pricing.completion === 0)) ||
        model.id.toLowerCase().endsWith(":free") ||
        model.id.toLowerCase() === "openrouter/free";

      const formatted: FormattedModel = {
        id: model.id,
        name: model.name || model.id,
        contextLength: model.context_length || 0,
        isFree,
      };

      if (isFree) {
        freeChatModels.push(formatted);
      } else if (top20RankedModels.length < 20) {
        // Collect top 20 best text-generation models based on OpenRouter API live ranking
        top20RankedModels.push(formatted);
      }
    }

    // Sort free models alphabetically by name
    freeChatModels.sort((a, b) => a.name.localeCompare(b.name));

    // Combined: All free models + Top 20 ranked models
    const combinedModels = [...freeChatModels, ...top20RankedModels];

    const resultPayload = {
      models: combinedModels,
      freeModels: freeChatModels,
      popularModels: top20RankedModels,
      topRankedModels: top20RankedModels,
      allCount: combinedModels.length,
      freeCount: freeChatModels.length,
      rankedCount: top20RankedModels.length,
      isFallback: false,
    };

    // Store real response in Redis cache (persisted for 24 hours to survive API downtime)
    try {
      await redis.set(REDIS_OPENROUTER_CACHE_KEY, JSON.stringify(resultPayload), { ex: 86400 });
    } catch (redisErr) {
      console.warn("Failed to cache OpenRouter models in Redis:", redisErr);
    }

    return NextResponse.json(resultPayload);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error fetching live OpenRouter models:", errMessage);

    // Retrieve last known live models from Redis cache (Zero hardcoded fake models)
    try {
      const cached = await redis.get<string | object>(REDIS_OPENROUTER_CACHE_KEY);
      if (cached) {
        const cachedData = typeof cached === "string" ? JSON.parse(cached) : cached;
        return NextResponse.json({
          ...cachedData,
          isCached: true,
        });
      }
    } catch (cacheErr) {
      console.warn("Failed to retrieve OpenRouter models from Redis cache:", cacheErr);
    }

    return NextResponse.json(
      {
        models: [],
        freeModels: [],
        popularModels: [],
        topRankedModels: [],
        allCount: 0,
        freeCount: 0,
        rankedCount: 0,
        isFallback: false,
        error: "Gagal memuat katalog model OpenRouter dari API maupun cache.",
      },
      { status: 503 }
    );
  }
}
