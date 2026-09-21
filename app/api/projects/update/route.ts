import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      projectId, prdData, strukturData, appName, appIdea,
      formInputs, taskData, status, checkedTasks,
    } = body;
    let tasksOutdated: boolean = body.tasksOutdated ?? false;

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id_userId: { id: projectId, userId: session.user.id } },
      select: {
        id: true,
        userId: true,
        appName: true,
        appIdea: true,
        formInputs: true,
        strukturData: true,
        prdData: true,
        taskData: true,
        designData: true,
        status: true,
        checkedTasks: true,
        finishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    const updateData: any = {};

    if (appName !== undefined) {
      updateData.appName = appName;

      // Update formInputs.appName if exists
      if (project.formInputs) {
        try {
          const formInputsObj = JSON.parse(project.formInputs);
          formInputsObj.appName = appName;
          updateData.formInputs = JSON.stringify(formInputsObj);
        } catch {}
      }

      // Update title in strukturData if exists and not explicitly passed
      if (project.strukturData && strukturData === undefined) {
        try {
          const strukturObj = JSON.parse(project.strukturData);
          strukturObj.title = appName;
          updateData.strukturData = JSON.stringify(strukturObj);
        } catch {}
      }
    }

    if (appIdea !== undefined) {
      updateData.appIdea = appIdea;

      // Update appIdea in formInputs if exists
      if (project.formInputs && appName === undefined) {
        try {
          const formInputsObj = JSON.parse(updateData.formInputs || project.formInputs);
          formInputsObj.appIdea = appIdea;
          updateData.formInputs = JSON.stringify(formInputsObj);
        } catch {}
      }
    }

    if (formInputs !== undefined) {
      updateData.formInputs = typeof formInputs === "string" ? formInputs : JSON.stringify(formInputs);
    }

    if (prdData !== undefined) {
      updateData.prdData = prdData;
      tasksOutdated = true;
      // Update redis cache for PRD & invalidate tasks cache
      try {
        await redis.set(`project:${projectId}:prd`, prdData);
        await redis.del(`project:${projectId}:tasks`);
      } catch (e) { console.warn("Redis PRD update error", e); }
    }

    if (strukturData !== undefined) {
      // Expecting raw JSON string or object
      const strukturStr = typeof strukturData === 'string' ? strukturData : JSON.stringify(strukturData);
      updateData.strukturData = strukturStr;
      tasksOutdated = true;
      // Update redis cache for Struktur & invalidate tasks cache
      try {
        await redis.set(`project:${projectId}:struktur`, typeof strukturData === 'string' ? JSON.parse(strukturData) : strukturData);
        await redis.del(`project:${projectId}:tasks`);
      } catch (e) { console.warn("Redis Struktur update error", e); }
    }

    if (taskData !== undefined) {
      updateData.taskData = typeof taskData === "string" ? taskData : JSON.stringify(taskData);
      tasksOutdated = false;
      try {
        await redis.set(`project:${projectId}:tasks`, typeof taskData === "string" ? JSON.parse(taskData) : taskData);
      } catch (e) { console.warn("Redis TaskData update error", e); }
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (checkedTasks !== undefined) {
      updateData.checkedTasks = typeof checkedTasks === "string" ? checkedTasks : JSON.stringify(checkedTasks);
      try {
        await redis.set(`project:${projectId}:taskStatus`, typeof checkedTasks === "string" ? JSON.parse(checkedTasks) : checkedTasks);
        await redis.del(`project:${projectId}:tasks`);
      } catch (e) { console.warn("Redis TaskStatus update error", e); }
    }

    if (body.designData !== undefined) {
      updateData.designData = body.designData;
    }

    if (tasksOutdated) {
      // Inject _tasksOutdated flag into formInputs without needing Prisma schema migration
      const formInputsObj = project.formInputs ? JSON.parse(project.formInputs) : {};
      formInputsObj._tasksOutdated = true;
      updateData.formInputs = JSON.stringify(formInputsObj);
    }

    if (Object.keys(updateData).length > 0) {
      await (prisma.project as any).update({
        where: { id: projectId },
        data: updateData,
        select: { id: true },
      });
      // Invalidate project info and structure cache in Redis
      try {
        await redis.del(`project:${projectId}:info`);
        if (appName !== undefined) {
          await redis.del(`project:${projectId}:struktur`);
        }
      } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
