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
    const statusFilter = searchParams.get("status");
    const taskIdParam = searchParams.get("taskId");

    if (!projectId) {
      return NextResponse.json({ success: false, error: "Missing projectId parameter" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id_userId: { id: projectId, userId: authResult.user.id } },
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

    let tasks: any[] = [];
    let savedStatuses: Record<string, string> = {};

    if (project.taskData) {
      try { tasks = JSON.parse(project.taskData); } catch {}
    }
    if (project.checkedTasks) {
      try { savedStatuses = JSON.parse(project.checkedTasks); } catch {}
    }

    // Annotate tasks with current status
    const annotatedTasks = tasks.map((task: any) => ({
      ...task,
      status: savedStatuses[task.id] || "todo",
    }));

    if (taskIdParam) {
      const task = annotatedTasks.find((t: any) => String(t.id) === String(taskIdParam));
      if (!task) {
        return NextResponse.json({ success: false, error: `Task #${taskIdParam} not found` }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        projectId: project.id,
        appName: project.appName,
        task,
      });
    }

    let filteredTasks = annotatedTasks;
    if (statusFilter) {
      filteredTasks = annotatedTasks.filter((t: any) => t.status === statusFilter);
    }

    return NextResponse.json({
      success: true,
      projectId: project.id,
      appName: project.appName,
      totalCount: annotatedTasks.length,
      tasks: filteredTasks,
    });
  } catch (error: any) {
    console.error("Agent tasks API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
