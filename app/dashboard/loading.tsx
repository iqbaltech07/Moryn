import DashboardSidebar from "./components/DashboardSidebar";
import {
  DashboardHeaderSkeleton,
  DashboardOverviewSkeleton,
} from "@/app/components/shared/Skeletons";

export default function DashboardLoading() {
  return (
    <div className="min-h-[100dvh] bg-[#FCFBF8] text-neutral-900 font-sans selection:bg-[#E05A38]/15 selection:text-neutral-900 flex">
      {/* ── Left Sidebar (Static shell with overview selected) ── */}
      <DashboardSidebar currentTab="overview" />

      {/* ── Main Workspace Content ── */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeaderSkeleton />

        <main className="flex-1 max-w-[1240px] w-full mx-auto px-6 sm:px-10 lg:px-14 py-6 sm:py-8">
          <DashboardOverviewSkeleton />
        </main>
      </div>
    </div>
  );
}
