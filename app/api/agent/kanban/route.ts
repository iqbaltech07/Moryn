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
        status: true,
        taskData: true,
        checkedTasks: true,
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found or unauthorized" }, { status: 404 });
    }

    let tasks: any[] = [];
    let savedStatuses: Record<string, string> = {};

    if (project.taskData) {
      try {
        const parsed = JSON.parse(project.taskData);
        if (Array.isArray(parsed)) {
          tasks = parsed;
        } else if (parsed && Array.isArray(parsed.phases)) {
          tasks = parsed.phases.flatMap((p: any) => p.tasks || []);
        } else if (parsed && Array.isArray(parsed.tasks)) {
          tasks = parsed.tasks;
        }
      } catch {}
    }
    if (project.checkedTasks) {
      try { savedStatuses = JSON.parse(project.checkedTasks); } catch {}
    }

    const columns: Record<string, any[]> = {
      todo: [],
      in_progress: [],
      done: [],
      failed: [],
    };

    tasks.forEach((task: any) => {
      const status = savedStatuses[task.id] || "todo";
      const item = { ...task, status };
      if (columns[status]) {
        columns[status].push(item);
      } else {
        columns.todo.push(item);
      }
    });

    return NextResponse.json({
      success: true,
      projectId: project.id,
      appName: project.appName,
      kanbanStatus: project.status,
      summary: {
        total: tasks.length,
        todo: columns.todo.length,
        in_progress: columns.in_progress.length,
        done: columns.done.length,
        failed: columns.failed.length,
      },
      columns,
    });
  } catch (error: any) {
    console.error("Agent kanban API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
