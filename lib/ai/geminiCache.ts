import { GoogleGenAI } from "@google/genai";
import { redis } from "@/lib/db/redis";
import crypto from "crypto";

export interface GenerateWithCacheParams {
  ai: GoogleGenAI;
  model: string;
  systemInstruction: string;
  userPrompt: string;
  cacheKeyPrefix?: string;
  ttlSeconds?: number;
  geminiConfig?: {
    responseMimeType?: string;
    responseJsonSchema?: unknown;
    responseSchema?: unknown;
  };
}

/**
 * Executes generateContent using Gemini API Context Caching when possible.
 * If cache creation fails (e.g. prompt length below threshold or unsupported model),
 * it gracefully falls back to normal generateContent with systemInstruction.
 */
export async function generateWithGeminiContextCache({
  ai,
  model,
  systemInstruction,
  userPrompt,
  cacheKeyPrefix = "gemini:ctx-cache",
  ttlSeconds = 300, // default 5 minutes
  geminiConfig,
}: GenerateWithCacheParams) {
  let cachedContentName: string | null = null;

  // Hash systemInstruction + model to reuse existing cache in Redis
  const hash = crypto.createHash("sha256").update(`${model}:${systemInstruction}`).digest("hex").slice(0, 16);
  const redisCacheKey = `${cacheKeyPrefix}:${hash}`;

  // 1. Try retrieving cached content resource name from Redis
  try {
    const existingCacheName = await redis.get<string>(redisCacheKey);
    if (existingCacheName) {
      cachedContentName = existingCacheName;
    }
  } catch (err) {
    console.warn("[Gemini Cache] Redis read error:", err);
  }

  // 2. If no valid cache reference found in Redis, attempt creating a Gemini Context Cache
  if (!cachedContentName && systemInstruction && systemInstruction.trim().length > 0) {
    try {
      console.log(`[Gemini Cache] Creating new context cache for model ${model}...`);
      const cacheResponse = await ai.caches.create({
        model: model,
        config: {
          displayName: `moryn_${hash}`,
          systemInstruction: systemInstruction,
          ttl: `${ttlSeconds}s`
        }
      });

      if (cacheResponse?.name) {
        cachedContentName = cacheResponse.name;
        // Save cache resource name in Redis matching TTL
        try {
          await redis.set(redisCacheKey, cachedContentName, { ex: ttlSeconds });
          console.log(`[Gemini Cache] Context cached successfully: ${cachedContentName}`);
        } catch (rErr) {
          console.warn("[Gemini Cache] Redis set error:", rErr);
        }
      }
    } catch (cacheErr: unknown) {
      const msg = cacheErr instanceof Error ? cacheErr.message : String(cacheErr);
      console.warn(`[Gemini Cache] Context cache creation skipped/failed (${model}):`, msg);
      // Fail silently for cache creation; cachedContentName remains null so fallback will run
    }
  }

  const extraConfig: Record<string, unknown> = {};
  if (geminiConfig?.responseMimeType) {
    extraConfig.responseMimeType = geminiConfig.responseMimeType;
  }
  if (geminiConfig?.responseJsonSchema) {
    extraConfig.responseJsonSchema = geminiConfig.responseJsonSchema;
  }
  if (geminiConfig?.responseSchema) {
    extraConfig.responseSchema = geminiConfig.responseSchema;
  }

  // 3. Generate content using cachedContent if available
  if (cachedContentName) {
    try {
      return await ai.models.generateContent({
        model: model,
        contents: userPrompt,
        config: {
          cachedContent: cachedContentName,
          ...extraConfig,
        }
      });
    } catch (genErr: unknown) {
      const msg = genErr instanceof Error ? genErr.message : String(genErr);
      console.warn(`[Gemini Cache] generateContent with cachedContent failed: ${msg}. Executing fallback.`);
      // Invalidate broken cache key in Redis
      try {
        await redis.del(redisCacheKey);
      } catch {}
    }
  }

  // Fallback: Standard generateContent without Gemini Context Cache
  return await ai.models.generateContent({
    model: model,
    contents: userPrompt,
    config: {
      systemInstruction: systemInstruction,
      ...extraConfig,
    }
  });
}
