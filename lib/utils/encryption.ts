import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 12 bytes recommended for GCM

function getEncryptionKey(): Buffer {
  const secret =
    process.env.ENCRYPTION_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.BETTER_AUTH_SECRET ||
    "moryn-secure-fallback-encryption-salt-2026";

  // Hash the secret with SHA-256 to ensure a strict 32-byte key
  return crypto.createHash("sha256").update(secret).digest();
}

export interface EncryptedPayload {
  encrypted: string; // hex
  iv: string; // hex
  tag: string; // hex
}

/**
 * Encrypts a string using AES-256-GCM.
 */
export function encryptText(plaintext: string): EncryptedPayload {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  };
}

/**
 * Decrypts an AES-256-GCM encrypted payload.
 */
export function decryptText(payload: EncryptedPayload): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(payload.iv, "hex");
  const tag = Buffer.from(payload.tag, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(payload.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Masks an API key for safe UI display (e.g., AIzaSy...xxxx or sk-or-...xxxx).
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || typeof apiKey !== "string") return "••••••••••••••••";
  const trimmed = apiKey.trim();
  if (trimmed.length <= 8) {
    return "••••••••";
  }
  const prefixLen = Math.min(6, Math.floor(trimmed.length / 4));
  const suffixLen = Math.min(4, Math.floor(trimmed.length / 4));
  const prefix = trimmed.slice(0, prefixLen);
  const suffix = trimmed.slice(-suffixLen);
  return `${prefix}${"•".repeat(12)}${suffix}`;
}
