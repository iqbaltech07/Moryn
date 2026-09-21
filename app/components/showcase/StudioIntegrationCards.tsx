import React from "react";
import { Terminal, Bot } from "lucide-react";
import { StudioIntegrationCardsProps } from "./types";

export function StudioIntegrationCards({ cliCommand }: StudioIntegrationCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 rounded-xl bg-[#10182B] border border-white/10 space-y-1.5">
        <div className="text-[11px] font-mono font-bold text-[#818CF8] uppercase tracking-wider flex items-center gap-1.5">
          <Terminal size={13} />
          <span>Moryn CLI Scaffolder</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Jalankan <code className="text-slate-200">{cliCommand}</code> di terminal project Anda
          untuk langsung men-generate template ini secara otomatis.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-[#10182B] border border-white/10 space-y-1.5">
        <div className="text-[11px] font-mono font-bold text-[#10B981] uppercase tracking-wider flex items-center gap-1.5">
          <Bot size={13} />
          <span>Zero-Slop Architectural Rules</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Template ini mematuhi aturan Anti-Slop Moryn: spatial whitespace yang proporsional,
          solid typography, dan tanpa efek gradient/glow berlebihan.
        </p>
      </div>
    </div>
  );
}
