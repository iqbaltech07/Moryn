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

    // Verify sequential phase locking and checkpoint approval
    if (project.taskData) {
      try {
        const parsed = JSON.parse(project.taskData);
        if (parsed && Array.isArray(parsed.phases)) {
          const phases: any[] = parsed.phases;
          const targetPhaseIdx = phases.findIndex((p: any) =>
            p.tasks && p.tasks.some((t: any) => String(t.id) === String(taskId))
          );

          if (targetPhaseIdx > 0) {
            // Check that all prior phases have their checkpoint completed ('done')
            for (let i = 0; i < targetPhaseIdx; i++) {
              const prevPhase = phases[i];
              const prevTasks: any[] = prevPhase.tasks || [];
              const prevCp =
                prevTasks.find((t: any) => t.isCheckpoint || (t.title && t.title.toLowerCase().includes("checkpoint"))) ||
                prevTasks[prevTasks.length - 1];

              const prevCpId = prevCp ? prevCp.id : `cp-phase-${prevPhase.id || i + 1}`;
              if (savedStatuses[prevCpId] !== "done") {
                return NextResponse.json(
                  {
                    success: false,
                    error: "PHASE_LOCKED",
                    message: `Fase '${phases[targetPhaseIdx]?.name}' masih terkunci. Checkpoint fase '${prevPhase?.name}' harus diverifikasi dan disetujui terlebih dahulu.`,
                  },
                  { status: 403 }
                );
              }
            }
          }

          // If the task itself is a checkpoint, make sure all other tasks in the phase are done
          if (targetPhaseIdx >= 0) {
            const currentPhase = phases[targetPhaseIdx];
            const currentPhaseTasks: any[] = currentPhase.tasks || [];
            const taskObj = currentPhaseTasks.find((t: any) => String(t.id) === String(taskId));
            const isCp = taskObj?.isCheckpoint || (taskObj?.title && taskObj.title.toLowerCase().includes("checkpoint"));

            if (isCp) {
              const pendingRegularTasks = currentPhaseTasks.filter(
                (t: any) => String(t.id) !== String(taskId) && savedStatuses[t.id] !== "done"
              );
              if (pendingRegularTasks.length > 0) {
                return NextResponse.json(
                  {
                    success: false,
                    error: "TASKS_INCOMPLETE",
                    message: "Semua task dalam fase ini harus diselesaikan terlebih dahulu sebelum checkpoint verifikasi dapat dijalankan.",
                  },
                  { status: 400 }
                );
              }
            }
          }
        }
      } catch (err) {
        console.warn("Failed to check phase lock state:", err);
      }
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
