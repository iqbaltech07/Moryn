import { prisma } from "@/lib/db/prisma";
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
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const vectorStr = `[${embeddings[i].join(",")}]`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO "project_knowledge_chunk" ("id", "projectId", "category", "title", "content", "embedding", "metadata", "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5::vector, $6, NOW(), NOW())`,
        projectId,
        chunk.category,
        chunk.title,
        chunk.content,
        vectorStr,
        chunk.metadata ? JSON.stringify(chunk.metadata) : null
      );
    }

    // 3. Invalidate Redis vector cache so next retrieval hits fresh DB data
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

    // 2. Perform native vector search with cosine distance (<=>) in PostgreSQL
    const vectorStr = `[${queryVector.join(",")}]`;
    let queryRaw = `
      SELECT "id", "category", "title", "content",
             (1 - ("embedding" <=> $1::vector))::float as similarity
      FROM "project_knowledge_chunk"
      WHERE "projectId" = $2
    `;
    const params: unknown[] = [vectorStr, projectId];

    if (options?.category) {
      queryRaw += ` AND "category" = $3`;
      params.push(options.category);
    }

    queryRaw += ` AND (1 - ("embedding" <=> $1::vector)) >= ${minSimilarity}`;
    queryRaw += ` ORDER BY similarity DESC LIMIT ${topK}`;

    const rows = await prisma.$queryRawUnsafe<Array<{
      id: string;
      category: string;
      title: string;
      content: string;
      similarity: number;
    }>>(queryRaw, ...params);

    return rows;
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
