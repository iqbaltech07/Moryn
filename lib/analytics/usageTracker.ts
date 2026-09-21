import { redis } from "@/lib/db/redis";

export type AIProvider = "gemini_key_1" | "gemini_key_2" | "openrouter" | "custom_key";

/**
 * Gets the Redis key for a specific provider for today
 */
function getDailyKey(provider: AIProvider): string {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return `api_usage:${provider}:${today}`;
}

/**
 * Increments the usage count for a specific provider
 */
export async function incrementUsage(provider: AIProvider) {
  try {
    const key = getDailyKey(provider);
    
    // Increment the counter
    const current = await redis.incr(key);
    
    // Set expiration to 48 hours to clean up old keys automatically
    if (current === 1) {
      await redis.expire(key, 60 * 60 * 48);
    }
    
    return current;
  } catch (error) {
    console.error(`Failed to increment usage for ${provider}:`, error);
    return 0;
  }
}

/**
 * Gets the current daily usage for all providers
 */
export async function getDailyUsage() {
  try {
    const gemini1Key = getDailyKey("gemini_key_1");
    const gemini2Key = getDailyKey("gemini_key_2");
    const openrouterKey = getDailyKey("openrouter");

    const [gemini1, gemini2, openrouter] = await Promise.all([
      redis.get(gemini1Key),
      redis.get(gemini2Key),
      redis.get(openrouterKey),
    ]);

    return {
      gemini_key_1: parseInt(gemini1 as string || "0", 10),
      gemini_key_2: parseInt(gemini2 as string || "0", 10),
      openrouter: parseInt(openrouter as string || "0", 10),
    };
  } catch (error) {
    console.error("Failed to fetch daily usage:", error);
    return {
      gemini_key_1: 0,
      gemini_key_2: 0,
      openrouter: 0,
    };
  }
}
