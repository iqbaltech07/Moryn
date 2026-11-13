import { NextRequest, NextResponse } from "next/server";
import { authenticateAgentRequest } from "@/lib/auth/agentAuth";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateAgentRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.statusCode || 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ success: false, error: "Missing projectId parameter" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: {
        id_userId: {
          id: projectId,
          userId: authResult.user.id,
        },
      },
      select: {
        id: true,
        appName: true,
        taskData: true,
        checkedTasks: true,
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found or unauthorized" }, { status: 404 });
    }

    let phases: any[] = [];
    let savedStatuses: Record<string, string> = {};

    if (project.taskData) {
      try {
        const parsed = JSON.parse(project.taskData);
        if (parsed && Array.isArray(parsed.phases)) {
          phases = parsed.phases;
        } else if (Array.isArray(parsed)) {
          // If flat array, group into single phase or treat as flat
          phases = [{ id: "phase-1", name: "Implementation", tasks: parsed }];
        } else if (parsed && Array.isArray(parsed.tasks)) {
          phases = [{ id: "phase-1", name: "Implementation", tasks: parsed.tasks }];
        }
      } catch {}
    }
    if (project.checkedTasks) {
      try { savedStatuses = JSON.parse(project.checkedTasks); } catch {}
    }

    // Process phases sequentially
    let currentTask: any = null;
    let lockedPhaseName: string | null = null;

    for (let pIdx = 0; pIdx < phases.length; pIdx++) {
      const phase = phases[pIdx];
      const phaseTasks: any[] = phase.tasks || [];
      if (phaseTasks.length === 0) continue;

      const cpIndex = phaseTasks.findIndex((t: any) =>
        t.isCheckpoint || (t.title && t.title.toLowerCase().includes("checkpoint"))
      );
      const checkpointTask = cpIndex >= 0 ? phaseTasks[cpIndex] : null;
      const regularTasks = cpIndex >= 0
        ? phaseTasks.filter((_, idx) => idx !== cpIndex)
        : phaseTasks;

      // Check regular tasks status
      const inProgressTask = regularTasks.find((t: any) => savedStatuses[t.id] === "in_progress");
      if (inProgressTask) {
        currentTask = {
          ...inProgressTask,
          phaseId: phase.id,
          phaseName: phase.name,
          phaseIndex: pIdx,
          status: "in_progress",
        };
        break;
      }

      const todoTask = regularTasks.find((t: any) => {
        const s = savedStatuses[t.id] || "todo";
        return s === "todo" || s === "needs_revision" || s === "error";
      });
      if (todoTask) {
        currentTask = {
          ...todoTask,
          phaseId: phase.id,
          phaseName: phase.name,
          phaseIndex: pIdx,
          status: savedStatuses[todoTask.id] || "todo",
          notes: savedStatuses[`${todoTask.id}_notes`] || undefined,
        };
        break;
      }

      // If all regular tasks are done, check phase checkpoint
      if (checkpointTask) {
        const cpStatus = savedStatuses[checkpointTask.id] || "todo";
        if (cpStatus !== "done") {
          currentTask = {
            ...checkpointTask,
            isCheckpoint: true,
            phaseId: phase.id,
            phaseName: phase.name,
            phaseIndex: pIdx,
            status: cpStatus,
            notes: savedStatuses[`${checkpointTask.id}_notes`] || undefined,
            checkpointRequired: true,
            message: cpStatus === "needs_revision" || cpStatus === "error"
              ? "Checkpoint memerlukan perbaikan spesifikasi dari user sebelum fase berikutnya dapat dibuka."
              : "Semua task dalam fase ini telah selesai. Menunggu verifikasi dan persetujuan checkpoint oleh user.",
          };
          break;
        }
      }
    }

    if (!currentTask) {
      return NextResponse.json({
        success: true,
        projectId: project.id,
        appName: project.appName,
        message: "No active or pending tasks found in project. All phases and checkpoints completed.",
        task: null,
      });
    }

    return NextResponse.json({
      success: true,
      projectId: project.id,
      appName: project.appName,
      task: currentTask,
    });
  } catch (error: any) {
    console.error("Agent current task API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
