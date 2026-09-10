import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

interface FormattedModel {
  id: string;
  name: string;
  contextLength?: number;
  isFree?: boolean;
}

interface RawOpenRouterModel {
  id: string;
  name?: string;
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

// Non-text output keywords and image generation keywords to strictly exclude
const NON_TEXT_KEYWORDS = [
  "flux",
  "stable-diffusion",
  "dall-e",
  "midjourney",
  "imagen",
  "recraft",
  "ideogram",
  "sdxl",
  "image-gen",
  "text-to-image",
  "lyria",
  "whisper",
  "embedding",
  "embed",
  "tts",
  "stt",
  "music",
  "audio",
  "voice",
  "speech",
  "text-to-audio",
  "text-to-speech",
  "text-to-music",
  "realtime",
];

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/models", {
      next: { revalidate: 3600 }, // Cache 1 hour
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API responded with status: ${response.status}`);
    }

    const data = (await response.json()) as { data?: RawOpenRouterModel[] };
    const rawList: RawOpenRouterModel[] = Array.isArray(data.data) ? data.data : [];

    const freeChatModels: FormattedModel[] = [];
    const top20RankedModels: FormattedModel[] = [];

    for (const model of rawList) {
      const id = (model.id || "").toLowerCase();
      const name = (model.name || "").toLowerCase();
      const arch = model.architecture || {};
      const modality = (arch.modality || "").toLowerCase();
      const outputModalities = Array.isArray(arch.output_modalities)
        ? arch.output_modalities.map((m) => String(m).toLowerCase())
        : [];

      // 1. Check if model outputs text and does NOT output image
      let outputsText = false;
      let outputsImage = false;

      if (outputModalities.length > 0) {
        outputsText = outputModalities.includes("text");
        outputsImage = outputModalities.includes("image");
      } else if (modality.includes("->")) {
        const outputPart = modality.split("->")[1];
        outputsText = outputPart.includes("text");
        outputsImage = outputPart.includes("image");
      } else {
        outputsText = true;
      }

      // Must support generated text
      if (!outputsText) continue;

      // DO NOT display models that generate images
      if (outputsImage) continue;

      // Exclude models with image-generation or non-text keywords
      const hasNonTextKeyword = NON_TEXT_KEYWORDS.some(
        (kw) => id.includes(kw) || name.includes(kw)
      );
      if (hasNonTextKeyword) continue;

      // Exclude image generation endpoint suffixes
      if (id.endsWith("-image") || id.includes("-image-") || id.endsWith("/image") || id.includes("-image-preview")) {
        continue;
      }

      // Exclude batch endpoints as they are not for interactive chat
      if (id.includes(":batch")) continue;

      const isFree =
        (model.pricing &&
          (model.pricing.prompt === "0" || model.pricing.prompt === 0) &&
          (model.pricing.completion === "0" || model.pricing.completion === 0)) ||
        id.endsWith(":free") ||
        id === "openrouter/free";

      const formatted: FormattedModel = {
        id: model.id,
        name: model.name || model.id,
        contextLength: model.context_length || 0,
        isFree,
      };

      if (isFree) {
        freeChatModels.push(formatted);
      } else if (top20RankedModels.length < 20) {
        // Collect top 20 best text-generation models based on OpenRouter API ranking
        top20RankedModels.push(formatted);
      }
    }

    // Sort free models alphabetically by name
    freeChatModels.sort((a, b) => a.name.localeCompare(b.name));

    // Combined: All free models + Top 20 ranked models
    const combinedModels = [...freeChatModels, ...top20RankedModels];

    return NextResponse.json({
      models: combinedModels,
      freeModels: freeChatModels,
      popularModels: top20RankedModels,
      topRankedModels: top20RankedModels,
      allCount: combinedModels.length,
      freeCount: freeChatModels.length,
      rankedCount: top20RankedModels.length,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error fetching OpenRouter models:", errMessage);
    // Graceful fallback with known top 20 ranked models + free models
    const fallbackFree = [
      { id: "inclusionai/ling-3.0-flash-sante:free", name: "Ling 3.0 Flash Sante", isFree: true },
      { id: "dots-studio/dots-3-note-preview:free", name: "Dots 3 Note Preview", isFree: true },
      { id: "liquid/lfm-2.5-2.6b:free", name: "Liquid LFM 2.5 2.6B", isFree: true },
      { id: "nvidia/nemotron-3.5-lightning:free", name: "NVIDIA Nemotron 3.5 Lightning", isFree: true },
      { id: "google/gemma-4-31b-it:free", name: "Google Gemma 4 31B", isFree: true },
      { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B Instruct", isFree: true },
      { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 Reasoning", isFree: true },
      { id: "openrouter/free", name: "Free Models Router", isFree: true },
    ];
    const fallbackTop20 = [
      { id: "openai/gpt-6-astra", name: "OpenAI: GPT-6 Astra", isFree: false },
      { id: "openai/gpt-6-astra-pro", name: "OpenAI: GPT-6 Astra Pro", isFree: false },
      { id: "qwen/qwen3.8-max-0902", name: "Qwen: Qwen3.8 Max", isFree: false },
      { id: "anthropic/claude-fable-5.1", name: "Anthropic: Claude Fable 5.1", isFree: false },
      { id: "inception/mercury-2.5-preview", name: "Inception: Mercury 2.5 Preview", isFree: false },
      { id: "ibm-granite/granite-4.2-8b", name: "IBM: Granite 4.2 8B", isFree: false },
      { id: "tencent/hy4-preview", name: "Tencent: Hy4 Preview", isFree: false },
      { id: "inclusionai/ling-3.0-flash-fin", name: "inclusionAI: Ling 3.0 Flash Fin", isFree: false },
      { id: "~z-ai/glm-flash-latest", name: "Z.ai: GLM Flash Latest", isFree: false },
      { id: "qwen/qwen3.8-flash", name: "Qwen: Qwen3.8 Flash", isFree: false },
      { id: "z-ai/glm-5.3-flash", name: "Z.ai: GLM 5.3 Flash", isFree: false },
      { id: "deepseek/deepseek-v4-flash-vision-exp", name: "DeepSeek: DeepSeek V4 Flash Vision Exp", isFree: false },
      { id: "tencent/hy-mt2-1.8b", name: "Tencent: Hy-MT2 1.8B", isFree: false },
      { id: "tencent/hy-mt2-30b-a3b", name: "Tencent: Hy-MT2 30B", isFree: false },
      { id: "~z-ai/glm-latest", name: "Z.ai: GLM Latest", isFree: false },
      { id: "tencent/hy-mt2-7b", name: "Tencent: Hy-MT2 7B", isFree: false },
      { id: "z-ai/glm-5.3", name: "Z.ai: GLM 5.3", isFree: false },
      { id: "qwen/qwen3.8-27b", name: "Qwen: Qwen3.8 27B", isFree: false },
      { id: "bytedance-seed/seed-2-1-turbo", name: "ByteDance Seed: Seed 2.1 Turbo", isFree: false },
      { id: "qwen/qwen3.8-2.4t-a95b", name: "Qwen: Qwen3.8 2.4T", isFree: false },
    ];
    return NextResponse.json({
      models: [...fallbackFree, ...fallbackTop20],
      freeModels: fallbackFree,
      popularModels: fallbackTop20,
      topRankedModels: fallbackTop20,
      allCount: fallbackFree.length + fallbackTop20.length,
      freeCount: fallbackFree.length,
      rankedCount: fallbackTop20.length,
      isFallback: true,
    });
  }
}
