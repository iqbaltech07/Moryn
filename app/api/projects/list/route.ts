import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        appName: true,
        createdAt: true,
        status: true,
        finishedAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
