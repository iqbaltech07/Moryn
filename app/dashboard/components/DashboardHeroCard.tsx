"use client";

import Link from "next/link";
import { FolderPlus, Plus } from "lucide-react";

export default function DashboardHeroCard() {
  return (
    <section className="mb-12">
      <span className="text-[11px] font-bold tracking-[0.14em] text-neutral-400 uppercase mb-3 block">
        START SOMETHING NEW
      </span>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 lg:p-9 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8 relative overflow-hidden group">
        {/* Left text & action */}
        <div className="flex-1 max-w-md">
          <h2 className="text-2xl sm:text-[26px] font-bold text-neutral-900 tracking-[-0.02em] leading-tight mb-2">
            Create a new product
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed mb-6">
            Turn an idea into structured product context with Moryn.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 text-sm font-semibold tracking-tight shadow-2xs transition-all duration-150"
          >
            <Plus size={16} strokeWidth={2.2} className="text-neutral-500" />
            <span>Create Project</span>
          </Link>
        </div>

        {/* Right Folder Icon Container */}
        <div className="w-full sm:w-auto sm:min-w-[220px] md:min-w-[260px] h-[150px] sm:h-[160px] rounded-2xl border border-neutral-200/60 bg-[#FAF9F6] flex items-center justify-center relative shrink-0 shadow-2xs overflow-hidden">
          {/* Subtle architectural dot grid */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#d4d4d4 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          />

          {/* Folder Icon badge */}
          <div className="w-20 h-20 rounded-2xl bg-white border border-neutral-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-center text-[#E05A38] group-hover:scale-105 group-hover:border-[#E05A38]/30 transition-all duration-200 relative z-10">
            <FolderPlus size={36} strokeWidth={1.7} />
          </div>
        </div>
      </div>
    </section>
  );
}
