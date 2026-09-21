import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";
import { getMonthlyProjectLimit } from "@/lib/analytics/planQuota";

export async function POST() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
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

  return NextResponse.json({ success: true, projectsThisMonth, prdLimit });
}