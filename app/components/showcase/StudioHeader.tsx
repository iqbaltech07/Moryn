import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export function StudioHeader() {
  return (
    <header className="h-13 shrink-0 border-b border-white/10 bg-[#10182B] px-5 flex items-center justify-between z-20">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 text-decoration-none group">
          <Image
            src="/logo/Moryn-Light-Mode.webp"
            alt="Moryn"
            width={120}
            height={26}
            className="h-6 w-auto"
            priority
          />
        </Link>

        <span className="text-slate-600">/</span>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold tracking-wider text-[#6366F1] uppercase">
            CLI Template Studio
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
            packages/cli/src/templates
          </span>
        </div>
      </div>

      {/* Right Studio Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400 mr-2">
          <span className="text-emerald-400 font-semibold">● Anti-Slop Compliant</span>
          <span className="text-slate-600">·</span>
          <span>TypeScript + Tailwind</span>
        </div>

        <Link
          href="/dashboard"
          className="px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-[#6366F1]/20"
        >
          <Sparkles size={13} />
          <span>Generate Full App</span>
        </Link>
      </div>
    </header>
  );
}
