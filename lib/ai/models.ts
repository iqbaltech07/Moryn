/**
 * AI Model Type Definitions
 * Models are fetched 100% dynamically from live official APIs (Google Gemini & OpenRouter)
 * and persisted in Redis cache without hardcoded static lists.
 */

export const REDIS_GEMINI_CACHE_KEY = "cache:catalog:gemini:models:text-v3";

export interface RawGeminiModel {
  name: string;
  version?: string;
  displayName?: string;
  description?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  supportedGenerationMethods?: string[];
  temperature?: number;
}

export interface AiModelOption {
  id: string;
  name: string;
  isFree?: boolean;
  description?: string;
  inputTokenLimit?: number;
}

const GEMINI_EXCLUDE_KEYWORDS = [
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
  "live",
  "learnlm",
];

/**
 * Strict regex for excluding non-text, image generation, audio/music/voice/speech,
 * video generation, embeddings, rerankers, moderation/guardrails, and safety classifiers.
 */
export const NON_TEXT_MODEL_REGEX = /(flux|stable-diffusion|sdxl|dall-e|midjourney|imagen|recraft|ideogram|image-gen|text-to-image|text-to-video|veo|video|sora|runway|(^|[^a-z])kling(-|\/|$)|luma|banana|lyria|whisper|tts|stt|transcribe|music|audio|voice|speech|sound|text-to-audio|text-to-speech|text-to-music|realtime|embedding|embed|rerank|reranker|content-safety|safeguard|llama-guard|shieldgemma|moderation|guardrail|safety-guard|reward|judge|evaluator)/i;

/**
 * Validates that a model is exclusively an interactive AI text-generation model.
 */
export function isTextGenerationModel(model: {
  id: string;
  name?: string;
  description?: string;
  outputModalities?: string[];
  modality?: string;
}): boolean {
  const id = (model.id || "").toLowerCase();
  const name = (model.name || "").toLowerCase();

  // Exclude offline batch processing endpoints
  if (id.includes(":batch")) return false;

  // Exclude explicit image or audio route suffixes
  if (id.endsWith("-image") || id.includes("-image-") || id.endsWith("/image") || id.includes("-image-preview")) return false;
  if (id.endsWith("-audio") || id.includes("-audio-") || id.endsWith("/audio") || id.includes("-audio-preview")) return false;

  // Modality checks if available
  if (model.outputModalities && model.outputModalities.length > 0) {
    if (!model.outputModalities.every((m) => m.toLowerCase() === "text")) {
      return false;
    }
  }

  if (model.modality && model.modality.includes("->")) {
    const outputSide = model.modality.split("->")[1].trim().toLowerCase();
    if (outputSide !== "text") return false;
  }

  // Exclude non-text keywords by id and name (not description, since text models often mention multimodal inputs)
  if (NON_TEXT_MODEL_REGEX.test(id) || NON_TEXT_MODEL_REGEX.test(name)) {
    return false;
  }

  return true;
}

const PRIORITY_GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite",
];

/**
 * Extracts and prioritizes interactive Gemini text-generation models from the raw Google AI API response.
 */
export function extractGeminiTextModels(rawList: RawGeminiModel[]): AiModelOption[] {
  const textModels: AiModelOption[] = [];

  for (const model of rawList) {
    // 1. Must support generateContent (text generation)
    if (!model.supportedGenerationMethods?.includes("generateContent")) {
      continue;
    }

    const rawId = (model.name || "").replace(/^models\//, "");
    const lowerId = rawId.toLowerCase();
    const lowerDisplayName = (model.displayName || "").toLowerCase();

    // 2. Must be a Gemini core text model (starts with gemini-)
    if (!lowerId.startsWith("gemini-")) {
      continue;
    }

    // 3. Exclude non-text / specialized keywords in ID or display name
    const isExcluded = GEMINI_EXCLUDE_KEYWORDS.some(
      (kw) => lowerId.includes(kw) || lowerDisplayName.includes(kw)
    );
    if (isExcluded) continue;

    if (!isTextGenerationModel({ id: rawId, name: model.displayName })) {
      continue;
    }

    textModels.push({
      id: rawId,
      name: model.displayName || rawId,
      description: model.description,
      inputTokenLimit: model.inputTokenLimit,
    });
  }

  textModels.sort((a, b) => {
    const idxA = PRIORITY_GEMINI_MODELS.indexOf(a.id);
    const idxB = PRIORITY_GEMINI_MODELS.indexOf(b.id);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });

  return textModels;
}

