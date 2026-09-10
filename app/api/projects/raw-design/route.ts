import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return new NextResponse("Missing projectId", { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: {
        id_userId: {
          id: projectId,
          userId: session.user.id,
        },
      },
      select: { designData: true },
    });

    if (!project) {
      return new NextResponse("Project not found or unauthorized", { status: 404 });
    }

    let markdownText = project.designData || "";

    if (markdownText.startsWith("{") && markdownText.includes("rawMarkdown")) {
      try {
        const parsed = JSON.parse(markdownText);
        markdownText = parsed.rawMarkdown || markdownText;
      } catch {}
    }

    return new NextResponse(markdownText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": "inline",
      },
    });
  } catch (error: any) {
    console.error("Error serving raw design.md:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
