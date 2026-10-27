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
    const force = body.force || new URL(req.url).searchParams.get("force") === "true";

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

    // Validate checkpoint verification: checkpoints must be approved by user
    if (project.taskData && !force) {
      try {
        const parsed = JSON.parse(project.taskData);
        let allTasks: any[] = [];
        if (parsed && Array.isArray(parsed.phases)) {
          allTasks = parsed.phases.flatMap((p: any) => p.tasks || []);
        } else if (Array.isArray(parsed)) {
          allTasks = parsed;
        } else if (parsed && Array.isArray(parsed.tasks)) {
          allTasks = parsed.tasks;
        }
        const currentTask = allTasks.find((t: any) => String(t.id) === String(taskId));
        const isCp = currentTask?.isCheckpoint || (currentTask?.title && currentTask.title.toLowerCase().includes("checkpoint"));
        if (isCp) {
          return NextResponse.json({
            success: false,
            error: {
              code: "CHECKPOINT_REQUIRES_USER_APPROVAL",
              message: `Task ${taskId} adalah checkpoint verifikasi implementasi yang wajib diverifikasi dan disetujui langsung oleh user pada antarmuka Moryn.`,
            },
          }, { status: 403 });
        }
      } catch (err) {
        console.warn("Failed to parse taskData in complete route:", err);
      }
    }

    // Validate state transition
    if (previousStatus === "todo" && !force) {
      return NextResponse.json({
        success: false,
        error: {
          code: "ILLEGAL_STATE_TRANSITION",
          message: `Task ${taskId} must be started (status: 'in_progress') before it can be completed. Use force flag if required.`,
        },
      }, { status: 400 });
    }

    savedStatuses[taskId] = "done";

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
      status: "done",
      message: `Task ${taskId} successfully completed and marked as 'done'.`,
    });
  } catch (error: any) {
    console.error("Task complete API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
