import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis";
import { generateGeminiEmbeddings, generateSingleEmbedding } from "./embeddings";
import type { RawKnowledgeChunk } from "./chunker";

export interface RetrievedChunk {
  id: string;
  category: string;
  title: string;
  content: string;
  similarity: number;
}

/**
 * Calculates cosine similarity between two numeric vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Ingests, embeds, and persistently stores knowledge chunks for a project
 * in both PostgreSQL (persistent storage) and Upstash Redis (fast vector cache).
 */
export async function storeProjectChunks(
  projectId: string,
  chunks: RawKnowledgeChunk[]
): Promise<void> {
  if (!chunks || chunks.length === 0) return;

  try {
    const contents = chunks.map((c) => c.content);
    const embeddings = await generateGeminiEmbeddings(contents);

    if (!embeddings || embeddings.length !== chunks.length) {
      throw new Error(`Embedding count mismatch: expected ${chunks.length}, got ${embeddings?.length}`);
    }

    // 1. Delete previous chunks of the same categories to keep data idempotent
    const categoriesToReplace = Array.from(new Set(chunks.map((c) => c.category)));
    await prisma.projectKnowledgeChunk.deleteMany({
      where: {
        projectId,
        category: { in: categoriesToReplace },
      },
    });

    // 2. Persist to PostgreSQL via Prisma
    const chunkRecords = chunks.map((chunk, idx) => ({
      projectId,
      category: chunk.category,
      title: chunk.title,
      content: chunk.content,
      embedding: JSON.stringify(embeddings[idx]),
      metadata: chunk.metadata ? JSON.stringify(chunk.metadata) : null,
    }));

    await prisma.projectKnowledgeChunk.createMany({
      data: chunkRecords,
    });

    // 3. Cache vectors in Redis for fast semantic lookup
    try {
      const allChunks = await prisma.projectKnowledgeChunk.findMany({
        where: { projectId },
        select: {
          id: true,
          category: true,
          title: true,
          content: true,
          embedding: true,
        },
      });

      await redis.set(`project:${projectId}:vectors`, allChunks);
    } catch (redisErr) {
      console.warn("[VectorStore] Redis cache update warning:", redisErr);
    }

    console.log(
      `[VectorStore] Successfully embedded and saved ${chunks.length} chunks for project ${projectId}.`
    );
  } catch (error) {
    console.error(`[VectorStore] Failed to store chunks for project ${projectId}:`, error);
  }
}

/**
 * Semantic RAG Retrieval:
 * Embeds the query with Gemini gemini-embedding-001, performs cosine similarity against
 * the persistent vector store, and returns the top-K most relevant chunks.
 */
export async function retrieveRelevantChunks(
  projectId: string,
  query: string,
  options?: {
    category?: "user_input" | "structure" | "prd" | "task";
    topK?: number;
    minSimilarity?: number;
  }
): Promise<RetrievedChunk[]> {
  const topK = options?.topK ?? 5;
  const minSimilarity = options?.minSimilarity ?? 0.48;

  try {
    // 1. Generate query embedding vector
    const queryVector = await generateSingleEmbedding(query);
    if (!queryVector || queryVector.length === 0) return [];

    // 2. Fetch project chunks from Redis cache or PostgreSQL
    let storedChunks: Array<{
      id: string;
      category: string;
      title: string;
      content: string;
      embedding: string;
    }> | null = null;

    try {
      storedChunks = await redis.get(`project:${projectId}:vectors`);
    } catch {}

    if (!storedChunks || !Array.isArray(storedChunks) || storedChunks.length === 0) {
      storedChunks = await prisma.projectKnowledgeChunk.findMany({
        where: {
          projectId,
          ...(options?.category ? { category: options.category } : {}),
        },
        select: {
          id: true,
          category: true,
          title: true,
          content: true,
          embedding: true,
        },
      });
    } else if (options?.category) {
      storedChunks = storedChunks.filter((c) => c.category === options.category);
    }

    if (!storedChunks || storedChunks.length === 0) return [];

    // 3. Compute cosine similarity for each chunk
    const scored: RetrievedChunk[] = [];

    for (const chunk of storedChunks) {
      try {
        const vec = JSON.parse(chunk.embedding) as number[];
        const sim = cosineSimilarity(queryVector, vec);

        if (sim >= minSimilarity) {
          scored.push({
            id: chunk.id,
            category: chunk.category,
            title: chunk.title,
            content: chunk.content,
            similarity: sim,
          });
        }
      } catch {}
    }

    // 4. Rank descending by similarity score
    scored.sort((a, b) => b.similarity - a.similarity);

    return scored.slice(0, topK);
  } catch (error) {
    console.error(`[VectorStore] Semantic retrieval failed for project ${projectId}:`, error);
    return [];
  }
}

/**
 * Formats retrieved chunks into high-signal grounded context for AI prompts.
 */
export function formatRetrievedContext(chunks: RetrievedChunk[]): string {
  if (!chunks || chunks.length === 0) return "";

  const sections = chunks.map((c, idx) => {
    return `--- RELEVANT KNOWLEDGE CHUNK ${idx + 1} [Score: ${(c.similarity * 100).toFixed(1)}%] (${c.title}) ---\n${c.content}`;
  });

  return sections.join("\n\n");
}
