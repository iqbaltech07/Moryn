import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { getMonthlyProjectLimit } from "@/lib/analytics/planQuota";
import { Suspense } from "react";
import SettingsClient from "./SettingsClient";
import SettingsLoading from "./loading";

export const metadata: Metadata = {
  title: "Settings - Moryn Workspace",
  description: "Configure your Moryn API keys, custom AI providers, and account settings.",
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/login");
  }

  const [userDb, projects] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        tier: true,
        exp: true,
        prdCount: true,
        createdAt: true,
      },
    }),
    prisma.project.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const tier = userDb?.tier || "FREE";
  const finishedCount = projects.filter((p) => p.status === "FINISHED").length;
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthCount = projects.filter((p) => new Date(p.createdAt) >= firstOfMonth).length;
  const prdLimit = getMonthlyProjectLimit(tier, session.user.email);
  const isUnlimited = prdLimit === Infinity;

  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsClient
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          tier,
          exp: userDb?.exp ?? 0,
          prdCount: userDb?.prdCount ?? 0,
          createdAt: userDb?.createdAt ?? new Date(),
          totalProjects: projects.length,
          completedProjects: finishedCount,
          monthlyUsage: isUnlimited ? "∞" : `${thisMonthCount} / ${prdLimit}`,
        }}
      />
    </Suspense>
  );
}
