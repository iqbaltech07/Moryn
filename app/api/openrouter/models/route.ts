import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

// Non-text/non-chat model keywords to exclude (audio, music, speech, image-only, embedding, etc.)
const NON_CHAT_KEYWORDS = [
  "lyria",
  "whisper",
  "embedding",
  "embed",
  "tts",
  "stt",
  "stable-diffusion",
  "dall-e",
  "flux",
  "midjourney",
  "sdxl",
  "music",
  "audio",
  "voice",
  "speech",
  "image-gen",
  "text-to-image",
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

    const data = await response.json();
    const rawList = Array.isArray(data.data) ? data.data : [];

    const freeChatModels: any[] = [];
    const paidChatModels: any[] = [];

    for (const model of rawList) {
      const id = (model.id || "").toLowerCase();
      const name = (model.name || "").toLowerCase();
      const modality = (model.architecture?.modality || "").toLowerCase();

      // Exclude non-chat keywords
      const isNonChat = NON_CHAT_KEYWORDS.some(
        (kw) => id.includes(kw) || name.includes(kw) || modality.includes(kw)
      );
      if (isNonChat) continue;

      const isFree =
        model.pricing &&
        model.pricing.prompt === "0" &&
        model.pricing.completion === "0";

      const formatted = {
        id: model.id,
        name: model.name || model.id,
        contextLength: model.context_length || 0,
        isFree,
      };

      if (isFree) {
        freeChatModels.push(formatted);
      } else {
        paidChatModels.push(formatted);
      }
    }

    // Sort free models alphabetically by name
    freeChatModels.sort((a, b) => a.name.localeCompare(b.name));

    // Sort paid / flagship models dynamically by highest context length & capabilities, then cap to Top 10
    paidChatModels.sort((a, b) => {
      if (b.contextLength !== a.contextLength) {
        return b.contextLength - a.contextLength; // Largest context window first
      }
      return a.name.localeCompare(b.name);
    });

    const top10FlagshipModels = paidChatModels.slice(0, 10);

    return NextResponse.json({
      models: freeChatModels, // Backwards compatibility for existing consumers
      freeModels: freeChatModels,
      popularModels: top10FlagshipModels, // Dynamically fetched & capped to Top 10
      allCount: freeChatModels.length + paidChatModels.length,
    });
  } catch (error: any) {
    console.error("Error fetching OpenRouter models:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
