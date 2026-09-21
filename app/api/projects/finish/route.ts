import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";
import { EXP_PER_PROJECT, getRank } from "@/lib/analytics/gamification";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, checkedTasks } = body as {
      projectId: string;
      checkedTasks: Record<string, boolean>;
    };

    if (!projectId || !checkedTasks) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // ── 1. Load project and verify ownership ──────────────────────────────
    const project = await prisma.project.findUnique({
      where: { id_userId: { id: projectId, userId: session.user.id } },
      select: {
        id: true,
        userId: true,
        appName: true,
        appIdea: true,
        taskData: true,
        status: true,
        checkedTasks: true,
        finishedAt: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      );
    }

    // ── 2. Guard: already finished ────────────────────────────────────────
    if (project.status === "FINISHED") {
      return NextResponse.json(
        { error: "Project is already finished. Points are awarded only once." },
        { status: 409 }
      );
    }

    // ── 3. Validate task completion server-side ───────────────────────────
    // Parse the taskData that was stored by the AI generation step
    if (!project.taskData) {
      return NextResponse.json(
        { error: "Task data is not yet available for this project." },
        { status: 400 }
      );
    }

    let taskData: { phases: { tasks: { id: string }[] }[] };
    try {
      taskData = JSON.parse(project.taskData);
    } catch {
      return NextResponse.json({ error: "Task data is corrupted." }, { status: 500 });
    }

    // Collect all task IDs from the authoritative server-side data
    const allTaskIds = taskData.phases.flatMap((phase) =>
      phase.tasks.map((t) => t.id)
    );

    if (allTaskIds.length === 0) {
      return NextResponse.json(
        { error: "Project has no tasks." },
        { status: 400 }
      );
    }

    // Every task must be checked true in the client submission
    const allDone = allTaskIds.every((id) => checkedTasks[id] === true);

    if (!allDone) {
      return NextResponse.json(
        {
          error: `Not all tasks are completed. Complete ${allTaskIds.filter((id) => !checkedTasks[id]).length} more tasks.`,
        },
        { status: 422 }
      );
    }

    // ── 4. Award EXP and mark project as FINISHED (atomic transaction) ────
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { exp: { increment: EXP_PER_PROJECT } },
      }),
      prisma.project.update({
        where: { id: projectId },
        data: {
          status: "FINISHED",
          checkedTasks: JSON.stringify(checkedTasks),
          finishedAt: new Date(),
        },
        select: { id: true, status: true, finishedAt: true },
      }),
    ]);

    const newExp = updatedUser.exp;
    const rank = getRank(newExp);

    return NextResponse.json({
      success: true,
      expGained: EXP_PER_PROJECT,
      newExp,
      rank: {
        id: rank.id,
        name: rank.name,
        icon: rank.icon,
        color: rank.color,
      },
    });
  } catch (error) {
    console.error("Finish Project Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
