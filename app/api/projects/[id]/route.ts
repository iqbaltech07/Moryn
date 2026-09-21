import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis";
import { headers } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;

    // 1. Try Redis cache first for <10ms lookup
    const cacheKey = `project:${projectId}:info`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    } catch (e) {
      console.warn("Redis project info get error:", e);
    }

    // 2. Database lookup fallback
    const project = await prisma.project.findUnique({
      where: { id_userId: { id: projectId, userId: session.user.id } },
      select: {
        id: true,
        appName: true,
        appIdea: true,
        status: true,
        createdAt: true,
        strukturData: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    const title = project.appName || "Untitled Project";

    const result = {
      id: project.id,
      appName: project.appName,
      appIdea: project.appIdea,
      title,
      status: project.status,
      createdAt: project.createdAt,
    };

    // Cache in Redis
    try {
      await redis.set(cacheKey, result);
    } catch (e) {
      console.warn("Redis project info set error:", e);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch project info:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Check if project belongs to user
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    // Invalidate Redis cache
    try {
      await redis.del(`project:${projectId}:info`);
      await redis.del(`project:${projectId}:struktur`);
      await redis.del(`project:${projectId}:prd`);
      await redis.del(`project:${projectId}:tasks`);
      await redis.del(`project:${projectId}:taskStatus`);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

