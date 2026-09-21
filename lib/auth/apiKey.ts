import crypto from "crypto";

/**
 * Generate a new API key. The plaintext value is returned to the user ONCE
 * (at creation/regeneration time). Only the SHA-256 hash is stored in the DB.
 */
export function generateApiKey(): string {
  return `piar_live_${crypto.randomBytes(20).toString("hex")}`;
}

/** Deterministic one-way hash used for both storage and lookup of API keys. */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}
