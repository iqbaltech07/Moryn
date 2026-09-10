import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Moryn - Dashboard Workspace",
  description: "AI-powered product planning and engineering workspace",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch user projects
  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      appName: true,
      appIdea: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <DashboardClient
      userName={session.user.name}
      userImage={session.user.image}
      projects={projects}
    />
  );
}
