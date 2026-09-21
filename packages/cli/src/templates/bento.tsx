"use client";

import React from "react";

export interface BentoGridProps {
  title?: string;
}

/**
 * BentoGrid - Asymmetric Feature Grid (Anti-Slop Compliant)
 */
export function BentoGrid({ title = "Architectural Pillars" }: BentoGridProps) {
  return (
    <section className="w-full bg-[#090A0C] text-[#F3F4F6] p-6 space-y-6 font-sans rounded-xl border border-[#222634]">
      <div className="space-y-1 max-w-prose">
        <h2 className="text-xl font-bold tracking-tight text-[#F3F4F6]">{title}</h2>
        <p className="text-xs text-[#9CA3AF]">Designed for high-performance AI agent workflows.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Large Feature Card (2 cols) */}
        <div className="md:col-span-2 bg-[#121318] p-5 rounded-md space-y-3 border border-[#222634]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6366F1]">Pillar 01</span>
          <h3 className="text-base font-bold tracking-tight text-[#F3F4F6]">3-Layer Context Architecture</h3>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            Eliminates context truncation and cognitive overload by keeping static blueprints pinned at 15–25 KB while streaming dynamic schemas via MCP protocol.
          </p>
        </div>

        {/* Small Feature Card (1 col) */}
        <div className="bg-[#121318] p-5 rounded-md space-y-3 border border-[#222634]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#10B981]">Pillar 02</span>
          <h3 className="text-base font-bold tracking-tight text-[#F3F4F6]">AST Linter Engine</h3>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            Static AST code analyzer that rejects gradient headline slop and over-nested cards.
          </p>
        </div>
      </div>
    </section>
  );
}

export default BentoGrid;
