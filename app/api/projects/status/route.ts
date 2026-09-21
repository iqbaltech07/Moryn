import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    // 1. Try Redis cache for instant <10ms lookup
    try {
      const cached = await redis.get(`project:${projectId}:taskStatus`);
      if (cached) {
        return NextResponse.json({ taskStatus: cached });
      }
    } catch (e) {
      console.warn("Redis taskStatus get error:", e);
    }

    // 2. Database lookup fallback
    const project = await prisma.project.findUnique({
      where: { id_userId: { id: projectId, userId: session.user.id } },
      select: { checkedTasks: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    let savedStatus = {};
    if (project.checkedTasks) {
      try {
        savedStatus = JSON.parse(project.checkedTasks);
      } catch {}
    }

    // Warm Redis cache
    try {
      await redis.set(`project:${projectId}:taskStatus`, savedStatus);
    } catch {}

    return NextResponse.json({ taskStatus: savedStatus });
  } catch (error) {
    console.error("Error fetching project task status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
