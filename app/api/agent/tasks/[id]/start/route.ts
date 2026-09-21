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

    if (!projectId) {
      return NextResponse.json({ success: false, error: "Missing projectId parameter or body" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id_userId: { id: projectId, userId: authResult.user.id } },
      select: { id: true, checkedTasks: true, taskData: true },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found or unauthorized" }, { status: 404 });
    }

    let savedStatuses: Record<string, string> = {};
    if (project.checkedTasks) {
      try { savedStatuses = JSON.parse(project.checkedTasks); } catch {}
    }

    const previousStatus = savedStatuses[taskId] || "todo";
    savedStatuses[taskId] = "in_progress";

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
      status: "in_progress",
      message: `Task ${taskId} successfully started and set to 'in_progress'.`,
    });
  } catch (error: any) {
    console.error("Task start API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
