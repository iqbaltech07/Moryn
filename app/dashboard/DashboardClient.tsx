"use client";

import { useState } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";
import DashboardGreeting from "./components/DashboardGreeting";
import DashboardHeroCard from "./components/DashboardHeroCard";
import DashboardProjectCard, { DashboardProjectItem } from "./components/DashboardProjectCard";
import NewProjectSetup from "./components/NewProjectSetup";
import { useTranslation } from "@/lib/i18n";

interface DashboardClientProps {
  userName?: string | null;
  userImage?: string | null;
  projects?: Array<{
    id: string;
    appName: string;
    appIdea: string;
    status: string;
    createdAt?: Date | string;
  }>;
  initialShowSetup?: boolean;
}

// Fallback showcase items matching the reference photo
const SHOWCASE_PROJECTS: DashboardProjectItem[] = [
  {
    id: "showcase-1",
    appName: "Moryn",
    appIdea: "AI-powered product planning workspace",
    status: "Finish",
    href: "/dashboard/new-project",
  },
  {
    id: "showcase-2",
    appName: "GerobakLink",
    appIdea: "Digital operating system for local merchants",
    status: "Unfinish",
    href: "/dashboard/new-project",
  },
  {
    id: "showcase-3",
    appName: "Claimora",
    appIdea: "AI-powered JKN claim investigation",
    status: "Finish",
    href: "/dashboard/new-project",
  },
];

export default function DashboardClient({
  userName,
  userImage,
  projects = [],
  initialShowSetup = false,
}: DashboardClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewProject, setShowNewProject] = useState(initialShowSetup);
  const { t, isId } = useTranslation();

  // Determine items to display
  let itemsToDisplay: DashboardProjectItem[] = [];

  if (projects.length > 0) {
    itemsToDisplay = projects.map((p) => ({
      id: p.id,
      appName: p.appName,
      appIdea: p.appIdea,
      status: p.status === "FINISHED" ? t.dashboard.finished : t.dashboard.unfinished,
      href: `/design?projectId=${p.id}`,
    }));
  } else {
    itemsToDisplay = SHOWCASE_PROJECTS;
  }

  // Filter if searching
  if (searchQuery.trim()) {
    itemsToDisplay = itemsToDisplay.filter(
      (item) =>
        item.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.appIdea.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FCFBF8] text-neutral-900 font-sans selection:bg-[#E05A38]/15 selection:text-neutral-900 flex">
      {/* ── Left Sidebar ── */}
      <DashboardSidebar
        currentTab={activeTab}
        onTabChange={setActiveTab}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* ── Main Workspace Content ── */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Utilities */}
        <DashboardHeader
          userName={userName}
          userImage={userImage}
          onOpenMobile={() => setMobileOpen(true)}
          onSearch={setSearchQuery}
          onNewProject={() => setShowNewProject(true)}
        />

        {/* Inner Page Viewport */}
        <main className="flex-1 max-w-[1240px] w-full mx-auto px-6 sm:px-10 lg:px-14 py-6 sm:py-8">
          {showNewProject ? (
            <NewProjectSetup onBack={() => setShowNewProject(false)} />
          ) : (
            <>
              {/* Greeting Section */}
              <DashboardGreeting userName={userName} />

              {/* Section: START SOMETHING NEW */}
              <DashboardHeroCard onNewProject={() => setShowNewProject(true)} />

              {/* Section: YOUR PROJECTS */}
              <section className="mb-16">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold tracking-[0.14em] text-neutral-400 uppercase">
                    {t.dashboard.allProjects.toUpperCase()}
                  </span>
                  {projects.length > 0 && (
                    <span className="text-xs text-neutral-400 font-medium">
                      {itemsToDisplay.length} {isId ? "project" : (itemsToDisplay.length === 1 ? "project" : "projects")}
                    </span>
                  )}
                </div>

                {itemsToDisplay.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-neutral-200/70 p-12 text-center">
                    <p className="text-base font-semibold text-neutral-800">
                      {searchQuery
                        ? (isId ? `Tidak ada project yang cocok dengan "${searchQuery}"` : `No projects matching "${searchQuery}"`)
                        : t.dashboard.emptyProjects}
                    </p>
                    <p className="text-sm text-neutral-400 mt-1">
                      {searchQuery
                        ? (isId ? "Coba cari dengan kata kunci lain atau bersihkan filter pencarian." : "Try searching for another keyword or clear the search filter.")
                        : t.dashboard.emptyProjectsDesc}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {itemsToDisplay.map((project) => (
                      <DashboardProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
