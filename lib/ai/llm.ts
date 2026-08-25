import { GoogleGenAI, Type } from "@google/genai";
import { redis } from "@/lib/db/redis";
import { incrementUsage, AIProvider } from "@/lib/analytics/usageTracker";
import { generateWithGeminiContextCache } from "@/lib/ai/geminiCache";
import { getUserDecryptedKeys, markKeyCooldown } from "@/lib/ai/keyManager";

/** Shared default fallback chain used across all AI routes. */
export const GEMINI_FALLBACK_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-pro-preview",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

export const DEFAULT_OPENROUTER_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

interface AiSettings {
  geminiModel?: string;
  openRouterModel?: string;
}

let cachedAiSettings: AiSettings | null = null;
let lastAiSettingsFetch = 0;

export async function getAiSettings(): Promise<AiSettings> {
  const now = Date.now();
  if (cachedAiSettings && now - lastAiSettingsFetch < 30_000) {
    return cachedAiSettings;
  }
  try {
    const raw = await redis.get<AiSettings>("app:settings");
    cachedAiSettings = raw || {};
    lastAiSettingsFetch = now;
    return cachedAiSettings;
  } catch {
    return cachedAiSettings || {};
  }
}

export function getSystemGeminiKeys(): string[] {
  return [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_SECONDARY,
  ].filter((k): k is string => Boolean(k));
}

export function hasGeminiKeys(): boolean {
  return getSystemGeminiKeys().length > 0;
}

function pickSystemProvider(apiKey: string): AIProvider {
  return apiKey === process.env.GEMINI_API_KEY ? "gemini_key_1" : "gemini_key_2";
}

/** Dedupe while keeping the configured model first. */
function orderedModels(preferred?: string): string[] {
  return Array.from(new Set([preferred || "gemini-3.7-flash", ...GEMINI_FALLBACK_MODELS]));
}

export interface GeminiKeyCandidate {
  apiKey: string;
  isCustom: boolean;
  id?: string;
  label?: string;
  preferredModel?: string;
}

/**
 * Resolves all available Gemini keys in priority order:
 * User Custom Key #1 -> User Custom Key #2 ... -> System Keys
 */
export async function resolveGeminiKeys(userId?: string): Promise<GeminiKeyCandidate[]> {
  const candidates: GeminiKeyCandidate[] = [];

  if (userId) {
    try {
      const userKeys = await getUserDecryptedKeys(userId, "gemini");
      for (const k of userKeys) {
        candidates.push({
          apiKey: k.rawKey,
          isCustom: true,
          id: k.id,
          label: k.label,
          preferredModel: k.preferredModel,
        });
      }
    } catch (err) {
      console.warn("[resolveGeminiKeys] Error fetching user keys:", err);
    }
  }

  // Append system fallback keys
  for (const sysKey of getSystemGeminiKeys()) {
    // Prevent duplicate if user added the exact same key
    if (!candidates.some((c) => c.apiKey === sysKey)) {
      candidates.push({
        apiKey: sysKey,
        isCustom: false,
        label: "System Gemini Key",
      });
    }
  }

  return candidates;
}

export interface GeminiGenerateResult {
  text: string;
  model: string;
  provider: AIProvider;
  keyLabel?: string;
}

function isRateLimitError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  const status = (err as { status?: number })?.status;
  return (
    status === 429 ||
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("QuotaExceeded") ||
    msg.includes("quota") ||
    msg.includes("rate limit")
  );
}

/**
 * Runs a prompt through Gemini using every configured user/system key × fallback model.
 * Returns the first successful result or throws the last error.
 */
export async function generateGemini(opts: {
  systemPrompt: string;
  userPrompt: string;
  userId?: string;
  preferredModel?: string;
  jsonObject?: boolean;
  /** Extra per-request Gemini config, e.g. responseMimeType/responseSchema. */
  geminiConfig?: {
    responseMimeType?: string;
    responseSchema?: { type?: string; items?: unknown; properties?: Record<string, unknown>; enum?: string[]; required?: string[] };
  };
}): Promise<GeminiGenerateResult> {
  const keyCandidates = await resolveGeminiKeys(opts.userId);
  if (keyCandidates.length === 0) {
    throw new Error("No Gemini API Keys configured. Please add an API Key in your Profile or configure server ENV.");
  }

  let lastError: Error | unknown = null;

  const geminiConfig = {
    ...opts.geminiConfig,
    ...(opts.jsonObject ? { responseMimeType: "application/json" } : {}),
  };

  for (const candidate of keyCandidates) {
    const { apiKey, isCustom, id: keyId, label: keyLabel, preferredModel } = candidate;
    const models = orderedModels(opts.preferredModel || preferredModel);

    for (const model of models) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await generateWithGeminiContextCache({
          ai,
          model,
          systemInstruction: opts.systemPrompt,
          userPrompt: opts.userPrompt,
          geminiConfig,
        });
        const text = response.text ?? "";
        if (text.length === 0) throw new Error("Empty Gemini response");

        const provider: AIProvider = isCustom ? "custom_key" : pickSystemProvider(apiKey);
        await incrementUsage(provider);

        return {
          text,
          model,
          provider,
          keyLabel,
        };
      } catch (err: unknown) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        const masked = `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
        console.warn(`[Gemini] key=${masked} (${keyLabel || "unnamed"}) model=${model}:`, msg);

        // If rate limit encountered on a custom key, mark it in cooldown (5 mins) and skip directly to next key
        if (isRateLimitError(err) && isCustom && keyId && opts.userId) {
          console.warn(`[Gemini] Rate limit hit on user key ${keyId}. Setting cooldown and falling back to next key...`);
          await markKeyCooldown(opts.userId, keyId, 300);
          break; // Break model loop for this key, move to next key
        }
      }
    }
  }

  const errorMsg = lastError instanceof Error ? lastError.message : "All Gemini keys/models failed";
  throw new Error(errorMsg);
}

/**
 * Runs a prompt through OpenRouter (user custom keys first, then system fallback).
 */
export async function generateOpenRouter(opts: {
  systemPrompt: string;
  userPrompt: string;
  userId?: string;
  model?: string;
  /** When true, requests JSON output and retries without json_object if unsupported. */
  jsonObject?: boolean;
}): Promise<{ text: string; model: string; provider: AIProvider; keyLabel?: string }> {
  // Check user custom OpenRouter keys
  let openRouterKeys: Array<{ key: string; isCustom: boolean; id?: string; label?: string; preferredModel?: string }> = [];

  if (opts.userId) {
    try {
      const customOrKeys = await getUserDecryptedKeys(opts.userId, "openrouter");
      for (const k of customOrKeys) {
        openRouterKeys.push({
          key: k.rawKey,
          isCustom: true,
          id: k.id,
          label: k.label,
          preferredModel: k.preferredModel,
        });
      }
    } catch (e) {
      console.warn("[generateOpenRouter] Failed to fetch custom keys:", e);
    }
  }

  if (process.env.OPENROUTER_API_KEY) {
    openRouterKeys.push({
      key: process.env.OPENROUTER_API_KEY,
      isCustom: false,
      label: "System OpenRouter Key",
    });
  }

  if (openRouterKeys.length === 0) {
    throw new Error("OpenRouter API Key not configured");
  }

  const { default: OpenAI } = await import("openai");
  let lastError: unknown = null;

  for (const item of openRouterKeys) {
    const model = opts.model || item.preferredModel || DEFAULT_OPENROUTER_MODEL;
    const messages: Array<{ role: "system" | "user"; content: string }> = [
      { role: "system", content: opts.systemPrompt },
      { role: "user", content: opts.userPrompt },
    ];

    try {
      const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: item.key,
      });

      let completion: unknown;
      try {
        completion = await openai.chat.completions.create({
          model,
          messages,
          ...(opts.jsonObject ? { response_format: { type: "json_object" as const } } : {}),
        });
      } catch (e: unknown) {
        const errObj = e as { status?: number; message?: string };
        if (opts.jsonObject && (errObj.status === 400 || errObj.message?.includes("json_object"))) {
          console.log("Model doesn't support json_object, retrying without it...");
          completion = await openai.chat.completions.create({ model, messages });
        } else {
          throw e;
        }
      }

      const comp = completion as { choices?: Array<{ message?: { content?: string } }> };
      const text = comp?.choices?.[0]?.message?.content?.trim() ?? "";
      if (!text) throw new Error("Empty response from OpenRouter");

      const provider: AIProvider = item.isCustom ? "custom_key" : "openrouter";
      await incrementUsage(provider);
      return { text, model, provider, keyLabel: item.label };
    } catch (err: unknown) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[OpenRouter] key (${item.label}) failed:`, msg);

      if (isRateLimitError(err) && item.isCustom && item.id && opts.userId) {
        await markKeyCooldown(opts.userId, item.id, 300);
      }
    }
  }

  const errMsg = lastError instanceof Error ? lastError.message : "OpenRouter call failed";
  throw new Error(errMsg);
}

export interface GenerateResult {
  text: string;
  provider: AIProvider;
  model: string;
  keyLabel?: string;
}

/**
 * High-level unified generation with multi-key pool and fallback ordering.
 * - `priority: "gemini"` (default) → Gemini keys/models first, OpenRouter fallback.
 * - `priority: "openrouter"` → OpenRouter first, Gemini fallback.
 * Always returns text on success; throws a descriptive error if everything fails.
 */
export async function generateText(opts: {
  systemPrompt: string;
  userPrompt: string;
  userId?: string;
  preferredModel?: string;
  openRouterModel?: string;
  priority?: "gemini" | "openrouter";
  jsonObject?: boolean;
}): Promise<GenerateResult> {
  const { priority = "gemini", userId } = opts;
  const settings = await getAiSettings();
  const geminiModel = opts.preferredModel || settings.geminiModel;
  const orModel = opts.openRouterModel || settings.openRouterModel;

  let lastError: Error | unknown = null;

  const tryGemini = async (): Promise<GenerateResult | null> => {
    try {
      const res = await generateGemini({
        systemPrompt: opts.systemPrompt,
        userPrompt: opts.userPrompt,
        userId,
        preferredModel: geminiModel,
        jsonObject: opts.jsonObject,
      });
      return { text: res.text, provider: res.provider, model: res.model, keyLabel: res.keyLabel };
    } catch (err: unknown) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[generateText] Gemini failed:", msg);
      return null;
    }
  };

  const tryOpenRouter = async (): Promise<GenerateResult | null> => {
    try {
      const res = await generateOpenRouter({
        systemPrompt: opts.systemPrompt,
        userPrompt: opts.userPrompt,
        userId,
        model: orModel,
        jsonObject: opts.jsonObject,
      });
      return { text: res.text, provider: res.provider, model: res.model, keyLabel: res.keyLabel };
    } catch (err: unknown) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[generateText] OpenRouter failed:", msg);
      return null;
    }
  };

  let result: GenerateResult | null = null;
  if (priority === "openrouter") {
    result = (await tryOpenRouter()) || (await tryGemini());
  } else {
    result = (await tryGemini()) || (await tryOpenRouter());
  }

  if (!result) {
    const errMsg = lastError instanceof Error ? lastError.message : "All AI providers failed";
    throw new Error(errMsg);
  }
  return result;
}

export interface ParseJsonOptions {
  expectArray?: boolean;
}

/**
 * Robustly parses and repairs JSON from LLM output.
 * Handles:
 * 1. Markdown code fences (` ```json ... ``` `) and trailing markdown text.
 * 2. Unbracketed comma-separated JSON objects (e.g. `{...}, {...}` -> `[{...}, {...}]`).
 * 3. Trailing commas before `}` or `]`.
 * 4. Arrays wrapped inside objects (e.g. `{ "questions": [...] }`).
 * 5. Extracting JSON sub-strings via regex.
 */
export function parseAndRepairJson<T = unknown>(raw: string, options?: ParseJsonOptions): T | null {
  if (!raw || typeof raw !== "string") return null;

  const tryParse = (str: string): unknown => {
    try {
      return JSON.parse(str);
    } catch {
      const cleanedCommas = str.replace(/,\s*([\}\]])/g, "$1");
      try {
        return JSON.parse(cleanedCommas);
      } catch {
        return null;
      }
    }
  };

  const extractArrayFromObject = (obj: unknown): unknown[] | null => {
    if (Array.isArray(obj)) return obj;
    if (obj && typeof obj === "object") {
      const rec = obj as Record<string, unknown>;
      const keys = ["questions", "data", "items", "results", "phases", "nodes", "list", "tasks"];
      for (const k of keys) {
        const val = rec[k];
        if (Array.isArray(val)) return val;
      }
      const objectKeys = Object.keys(rec);
      if (objectKeys.length === 1) {
        const firstVal = rec[objectKeys[0]];
        if (Array.isArray(firstVal)) return firstVal;
      }
      for (const key of objectKeys) {
        const val = rec[key];
        if (Array.isArray(val)) return val;
      }
    }
    return null;
  };

  // Step 1: Basic cleaning of markdown fences & whitespace
  let cleaned = raw
    .trim()
    .replace(/^```(?:json|markdown)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  // Remove potential introductory header text before the first [ or { if present
  const firstBrace = cleaned.search(/[\{\[]/);
  if (firstBrace > 0) {
    const prefix = cleaned.substring(0, firstBrace).trim();
    if (!prefix.startsWith("{") && !prefix.startsWith("[")) {
      cleaned = cleaned.substring(firstBrace);
    }
  }

  // Step 2: Direct parse attempt
  const parsed = tryParse(cleaned);
  if (parsed !== null) {
    if (options?.expectArray) {
      const arr = extractArrayFromObject(parsed);
      if (arr) return arr as T;
    } else {
      return parsed as T;
    }
  }

  // Step 3: Check for unbracketed comma-separated objects (e.g. `{ "a": 1 }, { "b": 2 }`)
  if (cleaned.includes("}") && cleaned.includes("{")) {
    const wrappedArrayAttempt = tryParse(`[${cleaned}]`);
    if (wrappedArrayAttempt !== null && Array.isArray(wrappedArrayAttempt)) {
      if (options?.expectArray) {
        return wrappedArrayAttempt as T;
      } else {
        return wrappedArrayAttempt as T;
      }
    }
  }

  // Step 4: Regex Extraction
  if (options?.expectArray) {
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      const p = tryParse(arrayMatch[0]);
      if (p !== null && Array.isArray(p)) return p as T;
    }

    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      const pObj = tryParse(objectMatch[0]);
      if (pObj !== null) {
        const arr = extractArrayFromObject(pObj);
        if (arr) return arr as T;
      }
      const wrappedMatch = tryParse(`[${objectMatch[0]}]`);
      if (wrappedMatch !== null && Array.isArray(wrappedMatch)) {
        return wrappedMatch as T;
      }
    }
  } else {
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      const pObj = tryParse(objectMatch[0]);
      if (pObj !== null) return pObj as T;
    }

    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      const pArr = tryParse(arrayMatch[0]);
      if (pArr !== null) return pArr as T;
    }
  }

  return null;
}

/**
 * Strips code fences and extracts/repairs valid JSON from LLM output.
 * Returns valid JSON string or null if unparseable.
 */
export function extractJson(raw: string): string | null {
  const parsed = parseAndRepairJson(raw);
  if (parsed !== null) {
    return JSON.stringify(parsed);
  }
  return null;
}

export function toGeminiSchema(schema: unknown) {
  return schema;
}

export const GeminiType = Type;

export { generateWithGeminiContextCache };