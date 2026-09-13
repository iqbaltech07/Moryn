import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import DashboardClient from "../DashboardClient";

export const metadata: Metadata = {
  title: "Setup Project - Moryn Workspace",
  description: "Define project concept, tech stack, and personalization guidelines for your new project.",
};

export default async function NewProjectPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    redirect("/login");
  }

  // Instead of a separate page, we render the DashboardClient but pass a flag or 
  // rely on the query parameter/url to show the setup screen.
  // Actually, since we want to remove the old route and just use a state in DashboardClient,
  // we can redirect to /dashboard and let the client handle it, OR we can just return DashboardClient 
  // with a prop indicating to show the setup initially.
  
  return (
    <DashboardClient
      userName={session.user.name}
      userImage={session.user.image}
      initialShowSetup={true}
    />
  );
}
