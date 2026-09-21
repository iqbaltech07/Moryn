import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { parseDesignMarkdown } from "@/lib/design/designParser";
import { generateDefaultDesignData } from "@/lib/design/defaultDesignTemplate";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

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

    const proj = project as any;
    let designText = proj.designData || "";

    // If designData is completely empty, auto-populate with default AI template
    if (!designText || !designText.trim()) {
      try {
        const formInputs = proj.formInputs ? JSON.parse(proj.formInputs) : {};
        const designPref = formInputs.dynamicAnswers?.designPreference || formInputs.designPreference;
        const defaultData = generateDefaultDesignData(proj.appName, proj.appIdea, designPref);
        await prisma.project.update({
          where: { id: projectId },
          data: { designData: defaultData },
        });
        designText = defaultData;
      } catch (err) {
        console.warn("Failed to auto-populate designData in detail route:", err);
      }
    }

    // If designData is stored as a JSON string from parseDesignMarkdown
    if (designText.startsWith("{") && designText.includes("rawMarkdown")) {
      try {
        const parsed = JSON.parse(designText);
        designText = parsed.rawMarkdown || designText;
      } catch {}
    }

    return NextResponse.json({
      project: {
        ...project,
        designData: designText,
      },
    });

  } catch (error: any) {
    console.error("Error fetching project detail:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
