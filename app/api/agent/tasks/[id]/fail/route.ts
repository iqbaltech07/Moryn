import { NextRequest, NextResponse } from "next/server";
import { authenticateAgentRequest } from "@/lib/auth/agentAuth";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateAgentRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.statusCode || 401 });
    }

    const { id: taskId } = await params;
    const body = await req.json().catch(() => ({}));
    const projectId = body.projectId || new URL(req.url).searchParams.get("projectId");
    const reason = body.reason || "Task implementation or verification failed.";

    if (!projectId) {
      return NextResponse.json({ success: false, error: "Missing projectId parameter or body" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id_userId: { id: projectId, userId: authResult.user.id } },
      select: { id: true, checkedTasks: true },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found or unauthorized" }, { status: 404 });
    }

    let savedStatuses: Record<string, string> = {};
    if (project.checkedTasks) {
      try { savedStatuses = JSON.parse(project.checkedTasks); } catch {}
    }

    const previousStatus = savedStatuses[taskId] || "todo";
    savedStatuses[taskId] = "failed";

    await prisma.project.update({
      where: { id: projectId },
      data: { checkedTasks: JSON.stringify(savedStatuses) },
    });

    try {
      await redis.set(`project:${projectId}:taskStatus`, savedStatuses);
    } catch {}

    return NextResponse.json({
      success: true,
      taskId,
      previousStatus,
      status: "failed",
      reason,
      message: `Task ${taskId} marked as 'failed'.`,
    });
  } catch (error: any) {
    console.error("Task fail API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
