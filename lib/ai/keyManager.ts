import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis";
import { encryptText, decryptText, maskApiKey } from "@/lib/utils/encryption";
import { GoogleGenAI } from "@google/genai";

export type AIKeyProvider = "gemini" | "openrouter";

export interface CustomApiKeyData {
  id: string;
  provider: AIKeyProvider;
  label: string;
  encrypted: string;
  iv: string;
  tag: string;
  maskedKey: string;
  isActive: boolean;
  priority: number;
  preferredModel?: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface UserDecryptedKey {
  id: string;
  provider: AIKeyProvider;
  label: string;
  rawKey: string;
  maskedKey: string;
  priority: number;
  preferredModel?: string;
  inCooldown?: boolean;
}

export interface SanitizedApiKey {
  id: string;
  provider: AIKeyProvider;
  label: string;
  maskedKey: string;
  isActive: boolean;
  priority: number;
  preferredModel?: string;
  createdAt: string;
  lastUsedAt?: string;
  inCooldown?: boolean;
}

const CACHE_TTL_SECONDS = 3600; // 1 hour

function getCacheKey(userId: string): string {
  return `user:${userId}:custom_keys`;
}

function getCooldownKey(userId: string, keyId: string): string {
  return `user:${userId}:key:${keyId}:cooldown`;
}

/**
 * Retrieves the stored raw custom keys list for a user from Redis or Postgres DB.
 */
export async function getStoredCustomKeys(userId: string): Promise<CustomApiKeyData[]> {
  if (!userId) return [];

  const cacheKey = getCacheKey(userId);
  try {
    const cached = await redis.get<CustomApiKeyData[]>(cacheKey);
    if (cached && Array.isArray(cached)) {
      return cached;
    }
  } catch (err) {
    console.warn("[KeyManager] Redis get error:", err);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { customAiKeys: true },
    });

    if (!user || !user.customAiKeys) {
      return [];
    }

    const parsed: CustomApiKeyData[] = JSON.parse(user.customAiKeys);
    if (!Array.isArray(parsed)) return [];

    try {
      await redis.set(cacheKey, parsed, { ex: CACHE_TTL_SECONDS });
    } catch (e) {
      console.warn("[KeyManager] Redis set error:", e);
    }

    return parsed;
  } catch (err) {
    console.error("[KeyManager] Error fetching custom keys from DB:", err);
    return [];
  }
}

/**
 * Saves the custom keys list for a user to Postgres DB and updates Redis.
 */
export async function saveStoredCustomKeys(userId: string, keys: CustomApiKeyData[]): Promise<void> {
  if (!userId) return;

  const serialized = JSON.stringify(keys);
  await prisma.user.update({
    where: { id: userId },
    data: { customAiKeys: serialized },
  });

  const cacheKey = getCacheKey(userId);
  try {
    await redis.set(cacheKey, keys, { ex: CACHE_TTL_SECONDS });
  } catch (err) {
    console.warn("[KeyManager] Redis cache update failed:", err);
  }
}

/**
 * Checks if a specific key is currently in cooldown (e.g. due to recent 429 rate limit).
 */
export async function isKeyInCooldown(userId: string, keyId: string): Promise<boolean> {
  try {
    const cd = await redis.get(getCooldownKey(userId, keyId));
    return Boolean(cd);
  } catch {
    return false;
  }
}

/**
 * Marks a key into cooldown for N seconds after encountering a rate limit.
 */
export async function markKeyCooldown(userId: string, keyId: string, seconds: number = 300): Promise<void> {
  try {
    await redis.set(getCooldownKey(userId, keyId), "1", { ex: seconds });
    console.log(`[KeyManager] Key ${keyId} marked in cooldown for ${seconds}s`);
  } catch (e) {
    console.warn("[KeyManager] Failed to set cooldown in Redis:", e);
  }
}

/**
 * Retrieves all decrypted active keys for a user, sorted by priority (non-cooldown first).
 */
export async function getUserDecryptedKeys(
  userId?: string,
  provider?: AIKeyProvider
): Promise<UserDecryptedKey[]> {
  if (!userId) return [];

  const stored = await getStoredCustomKeys(userId);
  if (!stored.length) return [];

  const filtered = stored.filter((k) => k.isActive && (!provider || k.provider === provider));
  if (!filtered.length) return [];

  const decryptedList: UserDecryptedKey[] = [];

  for (const item of filtered) {
    try {
      const rawKey = decryptText({
        encrypted: item.encrypted,
        iv: item.iv,
        tag: item.tag,
      });

      const inCooldown = await isKeyInCooldown(userId, item.id);

      decryptedList.push({
        id: item.id,
        provider: item.provider,
        label: item.label,
        rawKey,
        maskedKey: item.maskedKey,
        priority: item.priority ?? 0,
        preferredModel: item.preferredModel,
        inCooldown,
      });
    } catch (err) {
      console.error(`[KeyManager] Failed to decrypt key ${item.id}:`, err);
    }
  }

  // Sort: non-cooldown keys first by priority, then cooldown keys by priority
  return decryptedList.sort((a, b) => {
    if (a.inCooldown !== b.inCooldown) {
      return a.inCooldown ? 1 : -1;
    }
    return a.priority - b.priority;
  });
}

/**
 * Returns sanitized keys for safe frontend UI display.
 */
export async function getSanitizedUserKeys(userId: string): Promise<SanitizedApiKey[]> {
  const stored = await getStoredCustomKeys(userId);
  const result: SanitizedApiKey[] = [];

  for (const item of stored) {
    const inCooldown = await isKeyInCooldown(userId, item.id);
    result.push({
      id: item.id,
      provider: item.provider,
      label: item.label,
      maskedKey: item.maskedKey,
      isActive: item.isActive,
      priority: item.priority,
      preferredModel: item.preferredModel,
      createdAt: item.createdAt,
      lastUsedAt: item.lastUsedAt,
      inCooldown,
    });
  }

  return result.sort((a, b) => a.priority - b.priority);
}

/**
 * Tests an API Key connection with a lightweight probe call.
 */
export async function testApiKey(
  provider: AIKeyProvider,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  if (!apiKey || typeof apiKey !== "string") {
    return { success: false, error: "API Key is empty" };
  }

  const trimmedKey = apiKey.trim();

  if (provider === "gemini") {
    try {
      const ai = new GoogleGenAI({ apiKey: trimmedKey });
      // Ping with lightweight model and minimal prompt
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Say 'OK' in 1 word",
      });

      const text = response.text?.trim();
      if (text) {
        return { success: true };
      }
      return { success: false, error: "No response received from Gemini API" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  if (provider === "openrouter") {
    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: trimmedKey,
      });

      // Quick models list verification
      const list = await openai.models.list();
      if (list && list.data && list.data.length > 0) {
        return { success: true };
      }
      return { success: false, error: "Could not list OpenRouter models" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  return { success: false, error: `Unsupported provider: ${provider}` };
}

/**
 * Checks if a user has at least one active custom AI key.
 */
export async function hasActiveCustomAiKeys(userId?: string): Promise<boolean> {
  if (!userId) return false;
  const keys = await getStoredCustomKeys(userId);
  return keys.some((k) => k.isActive);
}
