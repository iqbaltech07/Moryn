"use client";

import Link from "next/link";
import { Folder } from "lucide-react";

export interface DashboardProjectItem {
  id: string;
  appName: string;
  appIdea: string;
  status: string; // "FINISHED" | "IN_PROGRESS" | "Finish" | "Unfinish"
  createdAt?: Date | string;
  href?: string;
}

export default function DashboardProjectCard({ project }: { project: DashboardProjectItem }) {
  const isFinished =
    project.status === "FINISHED" || project.status.toLowerCase() === "finish";

  const badgeText = isFinished ? "Finish" : "Unfinish";
  const targetHref = project.href || `/detail?projectId=${project.id}`;

  return (
    <Link
      href={targetHref}
      className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:border-neutral-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between min-h-[160px] group text-decoration-none"
    >
      {/* Top row: Folder Icon + Status Badge */}
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-xl bg-neutral-100/90 border border-neutral-200/70 flex items-center justify-center text-neutral-600 group-hover:text-[#E05A38] group-hover:bg-[#FAF3F0] group-hover:border-[#E05A38]/30 transition-all duration-200 shadow-2xs">
          <Folder size={22} strokeWidth={1.8} />
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-tight ${
            isFinished
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              : "bg-neutral-100 text-neutral-600 border border-neutral-200/60"
          }`}
        >
          {badgeText}
        </span>
      </div>

      {/* Content: Title & Description */}
      <div className="mt-4">
        <h3 className="text-[17px] font-bold text-neutral-900 tracking-tight group-hover:text-[#E05A38] transition-colors truncate m-0">
          {project.appName}
        </h3>
        <p className="text-[13px] text-neutral-500 line-clamp-2 mt-1.5 mb-0 leading-relaxed">
          {project.appIdea}
        </p>
      </div>
    </Link>
  );
}
