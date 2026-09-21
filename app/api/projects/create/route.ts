import { NextRequest, NextResponse, after } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";
import { generateDefaultDesignData } from "@/lib/design/defaultDesignTemplate";
import { parseDesignMarkdown } from "@/lib/design/designParser";
import { getMonthlyProjectLimit } from "@/lib/analytics/planQuota";
import { parseBody, createProjectSchema } from "@/lib/utils/validation";
import { runSequentialGenerationPipeline } from "@/lib/ai/pipeline";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseBody(req, createProjectSchema);
    const { appName, appIdea } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const projectsThisMonth = await prisma.project.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    const prdLimit = getMonthlyProjectLimit(user.tier, user.email);

    if (projectsThisMonth >= prdLimit) {
      return NextResponse.json({ error: "LIMIT_REACHED", message: `Plan ${user.tier} hanya bisa membuat ${prdLimit === Infinity ? "unlimited" : prdLimit} project per bulan.` }, { status: 403 });
    }

    let finalDesignData = "";
    if (body.designData && typeof body.designData === "string" && body.designData.trim()) {
      if (body.designData.startsWith("{") && body.designData.includes("rawMarkdown")) {
        finalDesignData = body.designData;
      } else {
        const structured = parseDesignMarkdown(body.designData);
        finalDesignData = JSON.stringify(structured);
      }
    } else {
      const designPref = body.dynamicAnswers?.designPreference || body.designPreference;
      finalDesignData = generateDefaultDesignData(appName, appIdea, typeof designPref === "string" ? designPref : undefined);
    }

    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        appName: appName,
        appIdea: appIdea,
        formInputs: JSON.stringify(body),
        designData: finalDesignData,
      },
      select: { id: true },
    });

    // Trigger background sequential cascade pipeline (Structure -> PRD -> Tasks)
    after(async () => {
      await runSequentialGenerationPipeline(project.id);
    });

    return NextResponse.json({ projectId: project.id });
  } catch (error: unknown) {
    console.error("Project Create Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
