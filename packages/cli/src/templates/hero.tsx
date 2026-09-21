"use client";

import React from "react";

export interface HeroSectionProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

export function HeroSection({
  eyebrow = "MORYN / SYSTEM ENGINE",
  title = "Turn product ideas into systems you can actually build.",
  subtitle = "Generate structured PRDs, architecture decisions, feature dependencies, and execution-ready workflows from one product brief.",
  primaryCtaText = "Start Building",
  secondaryCtaText = "Explore the System",
  onPrimaryClick,
  onSecondaryClick,
}: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-[#090A0C] text-[#F3F4F6] font-sans rounded-xl border border-[#1B2522]">
      {/* Structural frame */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#285A48]/50" />

      {/* Hero header metadata */}
      <div className="flex min-h-12 items-center justify-between border-b border-[#1B2522] px-5 text-[9px] uppercase tracking-[0.18em] text-[#6F817B] font-mono">
        <span>{eyebrow}</span>
        <span className="hidden sm:block">PRD → SYSTEM → EXECUTION</span>
      </div>

      {/* Main composition */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Narrative column */}
        <div className="relative flex flex-col justify-between p-6 sm:p-8 lg:border-r border-[#1B2522]">
          <div className="max-w-xl">
            {/* Editorial index */}
            <div className="mb-6 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.16em] text-[#408A71]">
              <span className="text-[#6F817B]">01</span>
              <span className="h-px w-8 bg-[#285A48]" />
              <span>Product Intelligence</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#F3F4F6]">
              {title}
            </h1>

            <p className="mt-5 max-w-lg border-l border-[#408A71] pl-3 text-xs sm:text-sm leading-relaxed text-[#9CA3AF]">
              {subtitle}
            </p>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button
                onClick={onPrimaryClick}
                className="group inline-flex h-10 items-center justify-between gap-6 border border-[#408A71] bg-[#285A48] px-4 text-xs font-medium text-[#F3F4F6] transition-all hover:bg-[#408A71]"
              >
                <span>{primaryCtaText}</span>
                <span className="transition-transform group-hover:translate-x-0.5">↗</span>
              </button>

              <button
                onClick={onSecondaryClick}
                className="inline-flex h-10 items-center gap-2 border border-[#28332F] bg-transparent px-4 text-xs font-medium text-[#C3CCC8] transition-colors hover:border-[#408A71] hover:text-white"
              >
                <span className="font-mono text-[#408A71]">02</span>
                <span>{secondaryCtaText}</span>
              </button>
            </div>
          </div>

          {/* Bottom metadata */}
          <div className="mt-8 grid grid-cols-3 border-t border-[#1B2522] pt-3 text-[9px] font-mono uppercase tracking-[0.14em] text-[#65746F]">
            <div>
              <span className="block text-[#408A71]">Input</span>
              Product Brief
            </div>
            <div>
              <span className="block text-[#408A71]">Output</span>
              System Blueprint
            </div>
            <div>
              <span className="block text-[#408A71]">Mode</span>
              Structured
            </div>
          </div>
        </div>

        {/* Product visualization column */}
        <div className="relative min-h-70 sm:min-h-80 overflow-hidden bg-[#0C100F] flex flex-col justify-between p-6">
          <div className="pointer-events-none absolute inset-0 opacity-20 bg-[linear-gradient(#285A48_1px,transparent_1px),linear-gradient(90deg,#285A48_1px,transparent_1px)] bg-size-[28px_28px]" />

          <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#52635D] z-10">
            SYS / 001
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-2 my-auto items-center">
            <div className="border border-[#285A48] bg-[#101613] p-2.5 rounded-sm space-y-1">
              <div className="flex items-center justify-between text-[8px] font-mono">
                <span className="text-[#408A71]">INPUT</span>
                <span className="text-[#52635D]">01</span>
              </div>
              <div className="text-[11px] font-semibold text-[#DCE4E0]">Brief</div>
              <div className="text-[8px] text-[#697873]">Goals / users</div>
            </div>

            <div className="border border-[#408A71] bg-[#101613] p-2.5 rounded-sm space-y-1 shadow-lg">
              <div className="flex items-center justify-between text-[8px] font-mono">
                <span className="text-[#B0E4CC]">ENGINE</span>
                <span className="text-[#52635D]">02</span>
              </div>
              <div className="text-[11px] font-bold text-[#F3F4F6]">Structure</div>
              <div className="space-y-0.5 font-mono text-[7px] text-[#697873]">
                <div className="flex justify-between"><span>reqs</span><span className="text-[#408A71]">OK</span></div>
                <div className="flex justify-between"><span>deps</span><span className="text-[#408A71]">OK</span></div>
              </div>
            </div>

            <div className="border border-[#285A48] bg-[#101613] p-2.5 rounded-sm space-y-1">
              <div className="flex items-center justify-between text-[8px] font-mono">
                <span className="text-[#408A71]">OUTPUT</span>
                <span className="text-[#52635D]">03</span>
              </div>
              <div className="text-[11px] font-semibold text-[#DCE4E0]">Plan</div>
              <div className="text-[8px] text-[#697873]">Tasks / phases</div>
            </div>
          </div>

          <div className="border-t border-[#1B2522] bg-[#0A0E0D]/90 pt-2 font-mono text-[8px] uppercase tracking-[0.14em] text-[#65746F] flex justify-between z-10">
            <span>Architecture Graph</span>
            <span className="text-[#408A71]">SYSTEM READY</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
