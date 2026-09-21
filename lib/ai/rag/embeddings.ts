import { FastApiClient } from "@/lib/ai/fastapiClient";

const GEMINI_EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

/**
 * Generates 768-dimensional semantic embeddings using the official Google Gemini gemini-embedding-001 model.
 * Uses FastAPI AI Engine first, with direct fallback to Google Generative Language API.
 */
export async function generateGeminiEmbeddings(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) return [];

  // 1. Try FastAPI AI Engine
  try {
    const res = await FastApiClient.generateEmbeddings({
      texts,
      model: GEMINI_EMBEDDING_MODEL,
    });
    if (res && Array.isArray(res.embeddings) && res.embeddings.length > 0) {
      return res.embeddings;
    }
  } catch (err) {
    console.warn("[RAG Embedding] FastAPI embedding failed, trying direct Google API fallback:", err);
  }

  // 2. Direct Google Generative Language API Fallback (High-Speed Parallel Requests)
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY_SECONDARY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("No Gemini API key available for official gemini-embedding-001 model.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${apiKey}`;

  const fetchSingleVector = async (text: string): Promise<number[]> => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${GEMINI_EMBEDDING_MODEL}`,
        content: {
          parts: [{ text: text.slice(0, 4000) }],
        },
        outputDimensionality: 768,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Google Gemini Embedding API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const values = data.embedding?.values;
    if (!Array.isArray(values) || values.length === 0) {
      throw new Error("Invalid embedding vector returned by Google Gemini API.");
    }
    return values;
  };

  return await Promise.all(texts.map((text) => fetchSingleVector(text)));
}

/**
 * Convenience helper to embed a single text string.
 */
export async function generateSingleEmbedding(text: string): Promise<number[]> {
  const [vector] = await generateGeminiEmbeddings([text]);
  return vector;
}
