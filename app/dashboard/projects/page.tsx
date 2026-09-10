import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import ProjectsClient from "./ProjectsClient";

export const metadata: Metadata = {
  title: "Projects - Moryn Workspace",
  description: "Manage, inspect, and organize all your product planning workspaces in Moryn.",
};

export default async function ProjectsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/login");
  }

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
    <ProjectsClient
      userName={session.user.name}
      userImage={session.user.image}
      initialProjects={projects}
    />
  );
}
