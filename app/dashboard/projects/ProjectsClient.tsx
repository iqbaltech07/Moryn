"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Folder, Trash2, Calendar, FolderOpen, ArrowRight } from "lucide-react";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardHeader from "../components/DashboardHeader";
import { apiClient } from "@/lib/utils/apiClient";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

export interface ProjectItem {
  id: string;
  appName: string;
  appIdea: string;
  status: string;
  createdAt: Date | string;
}

interface ProjectsClientProps {
  userName?: string | null;
  userImage?: string | null;
  initialProjects: ProjectItem[];
}

export default function ProjectsClient({
  userName,
  userImage,
  initialProjects,
}: ProjectsClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "finished" | "in_progress">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { t, isId } = useTranslation();

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(t.projectsPage.deleteConfirm(name))) return;

    setDeletingId(id);
    try {
      await apiClient.projects.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success(t.projectsPage.deletedSuccess);
      router.refresh();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || t.projectsPage.deleteError);
    } finally {
      setDeletingId(null);
    }
  };

  const finishedCount = projects.filter((p) => p.status === "FINISHED").length;
  const inProgressCount = projects.filter((p) => p.status !== "FINISHED").length;

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.appIdea.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "finished") return project.status === "FINISHED";
    if (statusFilter === "in_progress") return project.status !== "FINISHED";
    return true;
  });

  return (
    <div className="min-h-[100dvh] bg-[#FCFBF8] text-neutral-900 font-sans selection:bg-[#E05A38]/15 selection:text-neutral-900 flex">
      {/* ── Left Sidebar ── */}
      <DashboardSidebar
        currentTab="projects"
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* ── Main Content Area ── */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          userName={userName}
          userImage={userImage}
          onOpenMobile={() => setMobileOpen(true)}
          onSearch={setSearchQuery}
        />

        <main className="flex-1 max-w-[1240px] w-full mx-auto px-6 sm:px-10 lg:px-14 py-8">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-[34px] font-bold text-neutral-900 tracking-[-0.03em] leading-tight">
                {t.projectsPage.title}
              </h1>
              <p className="text-base text-neutral-500 font-normal mt-1 leading-relaxed">
                {t.projectsPage.subtitle}
              </p>
            </div>

            <Link
              href="/dashboard/new-project"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#E05A38] hover:bg-[#CF4D2C] active:bg-[#B83E1F] text-white text-sm font-medium tracking-tight shadow-xs transition-all duration-150 sm:self-center shrink-0"
            >
              <Plus size={17} strokeWidth={2.2} />
              <span>{t.projectsPage.newProjectBtn}</span>
            </Link>
          </div>

          {/* Controls: Search and Status Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200/60">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-100/80 rounded-xl border border-neutral-200/60 w-fit">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === "all"
                    ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {t.projectsPage.allFilter} ({projects.length})
              </button>
              <button
                onClick={() => setStatusFilter("finished")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === "finished"
                    ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {t.projectsPage.finishedFilter} ({finishedCount})
              </button>
              <button
                onClick={() => setStatusFilter("in_progress")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === "in_progress"
                    ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {t.projectsPage.inProgressFilter} ({inProgressCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.projectsPage.searchPlaceholder}
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition"
              />
            </div>
          </div>

          {/* Project List / Grid */}
          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200/70 bg-white p-12 text-center my-6">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
                <FolderOpen size={24} />
              </div>
              <h3 className="text-lg font-bold text-neutral-800 mb-1">
                {searchQuery || statusFilter !== "all"
                  ? t.projectsPage.noProjectsFound
                  : (isId ? "Belum ada project yang dibuat" : "No projects created yet")}
              </h3>
              <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">
                {searchQuery || statusFilter !== "all"
                  ? t.projectsPage.noProjectsFoundDesc
                  : (isId ? "Mulai rancang ide pertama Anda menjadi PRD, arsitektur, dan Kanban task terstruktur." : "Turn your first idea into a structured PRD, architecture, and Kanban board.")}
              </p>
              <Link
                href="/dashboard/new-project"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E05A38] text-white text-sm font-medium hover:bg-[#CF4D2C] transition shadow-xs"
              >
                <Plus size={16} />
                <span>{t.dashboard.createProjectBtn}</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const isFinished = project.status === "FINISHED";
                const createdDate = new Date(project.createdAt);
                const createdFormatted = createdDate.toLocaleDateString(isId ? "id-ID" : "en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <Link
                    key={project.id}
                    href={`/design?projectId=${project.id}`}
                    className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:border-neutral-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between min-h-[190px] group text-decoration-none relative"
                  >
                    {/* Top Row: Folder Icon + Status Pill + Delete */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-neutral-100/90 border border-neutral-200/70 flex items-center justify-center text-neutral-600 group-hover:text-[#E05A38] group-hover:bg-[#FAF3F0] group-hover:border-[#E05A38]/30 transition-all duration-200 shadow-2xs">
                          <Folder size={22} strokeWidth={1.8} />
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-tight ${
                              isFinished
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                : "bg-neutral-100 text-neutral-600 border border-neutral-200/60"
                            }`}
                          >
                            {isFinished ? t.dashboard.finished : t.dashboard.unfinished}
                          </span>

                          <button
                            onClick={(e) =>
                              handleDelete(e, project.id, project.appName)
                            }
                            disabled={deletingId === project.id}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Project"
                            aria-label="Delete Project"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-[17px] font-bold text-neutral-900 tracking-tight group-hover:text-[#E05A38] transition-colors truncate m-0">
                        {project.appName}
                      </h3>
                      <p className="text-[13px] text-neutral-500 line-clamp-2 mt-1.5 mb-0 leading-relaxed">
                        {project.appIdea}
                      </p>
                    </div>

                    {/* Bottom row: Date metadata & action link */}
                    <div className="mt-5 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {createdFormatted}
                      </span>
                      <span className="text-neutral-500 font-medium group-hover:text-[#E05A38] group-hover:translate-x-0.5 transition-all inline-flex items-center gap-1">
                        {t.projectsPage.openWorkspace}
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
