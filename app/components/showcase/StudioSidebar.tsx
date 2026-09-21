import React from "react";
import { Search, ChevronRight } from "lucide-react";
import { StudioSidebarProps } from "./types";

export function StudioSidebar({
  searchQuery,
  onSearchChange,
  groupedComponents,
  filteredCount,
  selectedId,
  onSelectComponent,
}: StudioSidebarProps) {
  return (
    <aside className="w-72 shrink-0 border-r border-white/10 bg-[#0D1527] flex flex-col overflow-hidden">
      {/* Clean Search Header */}
      <div className="p-3.5 border-b border-white/10 bg-[#10182B]/60">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search templates (e.g. hero, table)…"
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#141C30] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#6366F1] transition-colors font-mono"
          />
        </div>
      </div>

      {/* Component Navigation Tree (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {Object.entries(groupedComponents).map(([catName, items]) => (
          <div key={catName}>
            <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500 mb-1.5 px-2 flex items-center justify-between">
              <span>{catName}</span>
              <span className="text-slate-600">{items.length}</span>
            </div>
            <div className="space-y-0.5">
              {items.map((item) => {
                const isCurrent = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectComponent(item.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center justify-between transition-all ${
                      isCurrent
                        ? "bg-[#6366F1]/20 text-[#818CF8] font-bold border border-[#6366F1]/40 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate">{item.name}</span>
                    {isCurrent && <ChevronRight size={12} className="shrink-0 text-[#818CF8]" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {filteredCount === 0 && (
          <div className="py-8 text-center text-xs font-mono text-slate-500">
            No templates found.
          </div>
        )}
      </div>
    </aside>
  );
}
