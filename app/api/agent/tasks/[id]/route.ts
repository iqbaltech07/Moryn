import { NextRequest, NextResponse } from "next/server";
import { authenticateAgentRequest } from "@/lib/auth/agentAuth";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateAgentRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.statusCode || 401 });
    }

    const { id: taskId } = await params;
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ success: false, error: "Missing projectId parameter" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id_userId: { id: projectId, userId: authResult.user.id } },
      select: { id: true, appName: true, taskData: true, checkedTasks: true },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found or unauthorized" }, { status: 404 });
    }

    let tasks: any[] = [];
    let savedStatuses: Record<string, string> = {};
    if (project.taskData) {
      try { tasks = JSON.parse(project.taskData); } catch {}
    }
    if (project.checkedTasks) {
      try { savedStatuses = JSON.parse(project.checkedTasks); } catch {}
    }

    const task = tasks.find((t: any) => String(t.id) === String(taskId));
    if (!task) {
      return NextResponse.json({ success: false, error: `Task #${taskId} not found` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      projectId: project.id,
      appName: project.appName,
      task: {
        ...task,
        status: savedStatuses[taskId] || "todo",
      },
    });
  } catch (error: any) {
    console.error("Task GET API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
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
    const newStatus = body.status;

    if (!projectId || !newStatus) {
      return NextResponse.json({ success: false, error: "Missing projectId or status" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: {
        id_userId: {
          id: projectId,
          userId: authResult.user.id,
        },
      },
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
    savedStatuses[taskId] = newStatus;

    await prisma.project.update({
      where: {
        id_userId: {
          id: projectId,
          userId: authResult.user.id,
        },
      },
      data: { checkedTasks: JSON.stringify(savedStatuses) },
    });

    try {
      await redis.set(`project:${projectId}:taskStatus`, savedStatuses);
    } catch {}

    return NextResponse.json({
      success: true,
      taskId,
      previousStatus,
      status: newStatus,
    });
  } catch (error: any) {
    console.error("Task PATCH API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
