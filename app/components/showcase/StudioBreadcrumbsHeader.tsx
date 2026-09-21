import React from "react";
import { ChevronRight, Terminal, Copy, Check } from "lucide-react";
import { StudioBreadcrumbsHeaderProps } from "./types";

export function StudioBreadcrumbsHeader({
  component,
  copiedType,
  onCopyCli,
}: StudioBreadcrumbsHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
        <span>packages/cli/src/templates</span>
        <ChevronRight size={11} />
        <span className="text-[#818CF8]">{component.category}</span>
        <ChevronRight size={11} />
        <span className="text-slate-300 font-semibold">{component.name}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <span>{component.name}</span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#6366F1]/15 border border-[#6366F1]/40 text-[#818CF8]">
              {component.type}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {component.description}
          </p>
        </div>

        {/* Quick CLI Scaffold Chip */}
        <button
          onClick={() => onCopyCli(component.cliCommand)}
          className="px-3 py-1.5 rounded-lg bg-[#141C30] border border-white/15 hover:border-white/30 text-xs font-mono text-slate-200 flex items-center gap-2 transition-all shadow-sm group"
          title="Click to copy CLI scaffold command"
        >
          <Terminal size={13} className="text-[#818CF8]" />
          <span>{component.cliCommand}</span>
          {copiedType === "cli" ? (
            <Check size={13} className="text-emerald-400 ml-1" />
          ) : (
            <Copy size={13} className="text-slate-500 group-hover:text-slate-300 ml-1" />
          )}
        </button>
      </div>
    </div>
  );
}
