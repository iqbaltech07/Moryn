import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

interface RawGeminiModel {
  name: string;
  version?: string;
  displayName?: string;
  description?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  supportedGenerationMethods?: string[];
  temperature?: number;
}

interface FormattedGeminiModel {
  id: string;
  name: string;
  description?: string;
  inputTokenLimit?: number;
}

// Non-text, image-generating (including Google's Nano Banana codename), audio, preview, and specialized keywords to strictly exclude
const EXCLUDE_MODEL_KEYWORDS = [
  "preview", // Exclude experimental preview models
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
];

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const customKey = searchParams.get("key");
    const apiKey =
      customKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY_SECONDARY;

    if (!apiKey) {
      return NextResponse.json({
        models: getFallbackGeminiModels(),
        count: getFallbackGeminiModels().length,
        isFallback: true,
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`,
      {
        next: { revalidate: 3600 }, // Cache 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API responded with status: ${response.status}`);
    }

    const data = (await response.json()) as { models?: RawGeminiModel[] };
    const rawList: RawGeminiModel[] = Array.isArray(data.models) ? data.models : [];

    const textModels: FormattedGeminiModel[] = [];

    for (const model of rawList) {
      // 1. Must support generateContent (text generation)
      if (!model.supportedGenerationMethods?.includes("generateContent")) {
        continue;
      }

      const rawId = (model.name || "").replace(/^models\//, "");
      const lowerId = rawId.toLowerCase();
      const lowerDisplayName = (model.displayName || "").toLowerCase();
      const lowerDescription = (model.description || "").toLowerCase();

      // 2. Must be a Gemini core text model (starts with gemini-)
      if (!lowerId.startsWith("gemini-")) {
        continue;
      }

      // 3. Exclude image generation, audio/tts, and non-text keywords in ID, name, or description
      const isExcluded = EXCLUDE_MODEL_KEYWORDS.some(
        (kw) => lowerId.includes(kw) || lowerDisplayName.includes(kw) || lowerDescription.includes(kw)
      );
      if (isExcluded) continue;

      textModels.push({
        id: rawId,
        name: model.displayName || rawId,
        description: model.description,
        inputTokenLimit: model.inputTokenLimit,
      });
    }

    return NextResponse.json({
      models: textModels.length > 0 ? textModels : getFallbackGeminiModels(),
      count: textModels.length > 0 ? textModels.length : getFallbackGeminiModels().length,
      isFallback: textModels.length === 0,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error fetching Gemini models:", errMessage);

    const fallback = getFallbackGeminiModels();
    return NextResponse.json({
      models: fallback,
      count: fallback.length,
      isFallback: true,
    });
  }
}

function getFallbackGeminiModels(): FormattedGeminiModel[] {
  return [
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite" },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash" },
    { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash" },
    { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash" },
    { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite" },
    { id: "gemini-flash-latest", name: "Gemini Flash Latest" },
    { id: "gemini-flash-lite-latest", name: "Gemini Flash-Lite Latest" },
    { id: "gemini-pro-latest", name: "Gemini Pro Latest" },
  ];
}
