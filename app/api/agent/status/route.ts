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

    let projectInfo = null;
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id_userId: { id: projectId, userId: authResult.user.id } },
        select: {
          id: true,
          appName: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (project) {
        projectInfo = project;
      }
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: authResult.user.id,
        name: authResult.user.name,
        email: authResult.user.email,
      },
      project: projectInfo,
      api: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Agent status API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
