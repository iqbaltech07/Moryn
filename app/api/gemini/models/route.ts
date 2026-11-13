import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redis } from "@/lib/db/redis";
import {
  extractGeminiTextModels,
  REDIS_GEMINI_CACHE_KEY,
} from "@/lib/ai/models";
import { getStoredCustomKeys } from "@/lib/ai/keyManager";
import { decryptText } from "@/lib/utils/encryption";

const REDIS_LEGACY_CACHE_KEY = "cache:catalog:gemini:models";

interface RawGeminiApiResponse {
  models?: Parameters<typeof extractGeminiTextModels>[0];
}

export async function GET(req: NextRequest) {
  const customKey = req.nextUrl.searchParams.get("key")?.trim() || undefined;

  try {
    // Purge old unfiltered cache key if present
    redis.del(REDIS_LEGACY_CACHE_KEY).catch(() => null);

    // Optional session check (model catalog metadata is public and cached)
    const session = await auth.api.getSession({
      headers: await headers(),
    }).catch(() => null);

    let userGeminiKey: string | undefined;
    if (!customKey && session?.user?.id) {
      try {
        const storedKeys = await getStoredCustomKeys(session.user.id);
        const geminiKeys = storedKeys
          .filter((k) => k.provider === "gemini")
          .sort((a, b) => {
            if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
            return (a.priority ?? 0) - (b.priority ?? 0);
          });

        for (const keyItem of geminiKeys) {
          try {
            const decrypted = decryptText({
              encrypted: keyItem.encrypted,
              iv: keyItem.iv,
              tag: keyItem.tag,
            }).trim();
            if (decrypted) {
              userGeminiKey = decrypted;
              break;
            }
          } catch {
            // Skip undecryptable key and check next stored key
          }
        }
      } catch (keyErr) {
        console.warn("Failed to resolve stored user Gemini key:", keyErr);
      }
    }

    const apiKey =
      customKey ||
      userGeminiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY_SECONDARY;

    if (!apiKey) {
      // Check Redis cache if no key available
      try {
        const cached = await redis.get<string | object>(REDIS_GEMINI_CACHE_KEY);
        if (cached) {
          const cachedData = typeof cached === "string" ? JSON.parse(cached) : cached;
          if (Array.isArray(cachedData?.models) && cachedData.models.length > 0) {
            return NextResponse.json({ ...cachedData, isCached: true });
          }
        }
      } catch {}
      return NextResponse.json(
        { models: [], count: 0, error: "API Key Gemini belum dikonfigurasi." },
        { status: 503 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`,
      customKey
        ? { cache: "no-store" }
        : { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error(`Gemini API responded with status: ${response.status}`);
    }

    const data = (await response.json()) as RawGeminiApiResponse;
    const rawList = Array.isArray(data.models) ? data.models : [];
    const textModels = extractGeminiTextModels(rawList);

    const resultPayload = {
      models: textModels,
      count: textModels.length,
      isFallback: false,
    };

    // Store real response in Redis cache only when non-empty (persisted for 24 hours)
    if (textModels.length > 0) {
      try {
        await redis.set(REDIS_GEMINI_CACHE_KEY, JSON.stringify(resultPayload), { ex: 86400 });
      } catch (redisErr) {
        console.warn("Failed to cache Gemini models in Redis:", redisErr);
      }
    }

    return NextResponse.json(resultPayload);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error fetching live Gemini models:", errMessage);

    // Retrieve last known live models from Redis cache when not testing a specific custom key
    if (!customKey) {
      try {
        const cached = await redis.get<string | object>(REDIS_GEMINI_CACHE_KEY);
        if (cached) {
          const cachedData = typeof cached === "string" ? JSON.parse(cached) : cached;
          if (Array.isArray(cachedData?.models) && cachedData.models.length > 0) {
            return NextResponse.json({
              ...cachedData,
              isCached: true,
            });
          }
        }
      } catch (cacheErr) {
        console.warn("Failed to retrieve Gemini models from Redis cache:", cacheErr);
      }
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
