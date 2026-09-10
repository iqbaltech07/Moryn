import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/db/redis";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { getAiChatLimit } from "@/lib/analytics/planQuota";
import { parseBody, editPrdSchema } from "@/lib/utils/validation";
import { fixMermaidBlocks } from "@/lib/utils/mermaidFix";
import { hasActiveCustomAiKeys } from "@/lib/ai/keyManager";
import { FastApiClient } from "@/lib/ai/fastapiClient";
import {
  retrieveRelevantChunks,
  formatRetrievedContext,
  chunkPrdMarkdown,
  storeProjectChunks,
} from "@/lib/ai/rag";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseBody(req, editPrdSchema);
    const { projectId, currentPrd, prompt } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isCustomKeysActive = await hasActiveCustomAiKeys(session.user.id);
    const chatLimit = isCustomKeysActive ? Infinity : getAiChatLimit(user.tier, user.email);

    // Track chat count per project in Redis
    const chatKey = projectId ? `project:${projectId}:chats:${session.user.id}` : `user:${session.user.id}:chats`;
    let currentChats = 0;
    try {
      const val = await redis.get<number>(chatKey);
      currentChats = val ? Number(val) : 0;
    } catch (e) {
      console.warn("Redis get chat count warn:", e);
    }

    if (!isCustomKeysActive && currentChats >= chatLimit) {
      return NextResponse.json(
        {
          error: `Batas chat tercapai (${currentChats}/${chatLimit}). User ${user.tier} hanya mendapatkan ${
            chatLimit === Infinity ? "unlimited" : chatLimit
          }x chat AI. Masukkan Custom API Key sendiri di Profile untuk akses unlimited!`,
          chatLimitReached: true,
          chatCount: currentChats,
          chatLimit,
          tier: user.tier,
        },
        { status: 403 }
      );
    }

    const isEditIntent = /(tambah|ubah|ganti|update|edit|hapus|masukkan|terapkan|buatkan|revisi|sesuaikan|add|remove|change|insert|delete|append|modify|fix|perbaiki)/i.test(
      prompt
    );

    // Retrieve semantic context via RAG
    let augmentedInstruction = prompt;
    if (projectId) {
      try {
        const retrieved = await retrieveRelevantChunks(projectId, prompt, { topK: 5, minSimilarity: 0.48 });
        if (retrieved.length > 0) {
          const ragSummary = formatRetrievedContext(retrieved);
          augmentedInstruction = `${prompt}\n\n=== GROUNDED ARCHITECTURE & USER CONTEXT (RAG) ===\n${ragSummary}`;
        }
      } catch (ragErr) {
        console.warn("[EditPRD] RAG retrieval warning:", ragErr);
      }
    }

    // Call FastAPI AI Engine
    const res = await FastApiClient.editPrd({
      currentPrd,
      instruction: augmentedInstruction,
      isEditIntent,
    });

    let updatedMarkdown = res.updatedMarkdown || "";

    // Auto fix mermaid syntax if PRD was updated
    if (res.isPrdUpdated && updatedMarkdown) {
      updatedMarkdown = await fixMermaidBlocks(updatedMarkdown);

      // Save to Database & Redis if projectId is provided
      if (projectId) {
        try {
          const project = await prisma.project.findUnique({
            where: {
              id_userId: {
                id: projectId,
                userId: session.user.id,
              },
            },
            select: { formInputs: true },
          });

          const updateData: { prdData: string; formInputs?: string } = { prdData: updatedMarkdown };

          if (project?.formInputs) {
            try {
              const formInputsObj = JSON.parse(project.formInputs);
              formInputsObj._tasksOutdated = true;
              updateData.formInputs = JSON.stringify(formInputsObj);
            } catch {}
          }

          await prisma.project.update({
            where: {
              id_userId: {
                id: projectId,
                userId: session.user.id,
              },
            },
            data: updateData,
            select: { id: true },
          });

          const cacheKey = `project:${projectId}:prd`;
          await redis.set(cacheKey, updatedMarkdown);
          await redis.del(`project:${projectId}:tasks`);

          // Re-embed updated PRD sections into persistent vector store
          const prdChunks = chunkPrdMarkdown(updatedMarkdown);
          storeProjectChunks(projectId, prdChunks).catch(() => {});
        } catch (e) {
          console.warn("Database/Redis update warn:", e);
        }
      }
    }

    // Increment chat count in Redis upon successful response
    try {
      await redis.set(chatKey, currentChats + 1);
    } catch (e) {
      console.warn("Redis set chat count warn:", e);
    }

    return NextResponse.json({
      reply: res.reply,
      isPrdUpdated: res.isPrdUpdated,
      markdown: res.isPrdUpdated ? updatedMarkdown : null,
      chatCount: currentChats + 1,
      chatLimit: chatLimit === Infinity ? null : chatLimit,
    });
  } catch (error: unknown) {
    console.error("Error editing/brainstorming PRD:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}