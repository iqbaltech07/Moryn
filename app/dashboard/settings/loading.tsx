import DashboardSidebar from "../components/DashboardSidebar";
import {
  DashboardHeaderSkeleton,
  DashboardSettingsSkeleton,
} from "@/app/components/shared/Skeletons";

export default function SettingsLoading() {
  return (
    <div className="min-h-[100dvh] bg-[#FCFBF8] text-neutral-900 font-sans selection:bg-[#E05A38]/15 selection:text-neutral-900 flex">
      {/* ── Left Sidebar (Static shell with settings selected) ── */}
      <DashboardSidebar currentTab="settings" />

      {/* ── Main Workspace Content ── */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeaderSkeleton />

        <main className="flex-1 max-w-[1240px] w-full mx-auto px-6 sm:px-10 lg:px-14 py-8">
          <DashboardSettingsSkeleton />
        </main>
      </div>
    </div>
  );
}
