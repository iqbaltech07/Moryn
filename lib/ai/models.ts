/**
 * AI Model Type Definitions
 * Models are fetched 100% dynamically from live official APIs (Google Gemini & OpenRouter)
 * and persisted in Redis cache without hardcoded static lists.
 */

export interface AiModelOption {
  id: string;
  name: string;
  isFree?: boolean;
  description?: string;
  inputTokenLimit?: number;
}

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
  const desc = (model.description || "").toLowerCase();

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

  // Exclude non-text keywords
  if (NON_TEXT_MODEL_REGEX.test(id) || NON_TEXT_MODEL_REGEX.test(name) || NON_TEXT_MODEL_REGEX.test(desc)) {
    return false;
  }

  return true;
}

