import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";
import { isAdminEmail } from "@/lib/analytics/planQuota";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, image: true, tier: true, exp: true },
  });

  if (!user) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  const isPro = user.tier === "PRO" || isAdminEmail(user.email);

  return NextResponse.json({
    user: {
      ...user,
      isPro,
    },
  });
}
