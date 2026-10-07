import DashboardSidebar from "../components/DashboardSidebar";
import {
  DashboardHeaderSkeleton,
  DashboardProjectsSkeleton,
} from "@/app/components/shared/Skeletons";

export default function ProjectsLoading() {
  return (
    <div className="min-h-[100dvh] bg-[#FCFBF8] text-neutral-900 font-sans selection:bg-[#E05A38]/15 selection:text-neutral-900 flex">
      {/* ── Left Sidebar (Static shell with projects selected) ── */}
      <DashboardSidebar currentTab="projects" />

      {/* ── Main Workspace Content ── */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeaderSkeleton />

        <main className="flex-1 max-w-[1240px] w-full mx-auto px-6 sm:px-10 lg:px-14 py-8">
          <DashboardProjectsSkeleton />
        </main>
      </div>
    </div>
  );
}
