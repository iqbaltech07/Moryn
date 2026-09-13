"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, Layers, Sparkles, TrendingUp, Cpu } from "lucide-react";

export default function HeroSection({ onSeeExample }: { onSeeExample: () => void }) {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center items-center pt-28 pb-20 px-4 md:px-8 overflow-hidden bg-[#fcfbf8]">
      {/* Background delicate radial accent */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#fceee8]/60 via-[#f8f5ed]/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10"
      />

      <div className="max-w-[1240px] w-full mx-auto relative flex flex-col items-center text-center z-10">
        
        {/* ── Center 4-Square Emblem ── */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 inline-flex p-2.5 rounded-2xl bg-white shadow-[0_2px_12px_rgba(20,24,23,0.06)] border border-[#141817]/6"
        >
          <div className="grid grid-cols-2 gap-1 w-6 h-6">
            <div className="rounded-[3px] bg-[#e85d3f]" />
            <div className="rounded-[3px] bg-[#f59e0b]" />
            <div className="rounded-[3px] bg-[#0d9488]" />
            <div className="rounded-[3px] bg-[#3b82f6]" />
          </div>
        </motion.div>

        {/* ── Main Headline ── */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-[42px] sm:text-[58px] md:text-[72px] font-bold text-[#141817] leading-[1.06] tracking-[-0.03em] max-w-[850px] mb-5"
        >
          Turn ideas into <br />
          <span className="text-[#141817] underline decoration-[#e85d3f]/40 decoration-wavy decoration-2 underline-offset-8">
            structured products
          </span>
        </motion.h1>

        {/* ── Subtitle ── */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg md:text-[19px] text-[#4d5552] max-w-[620px] leading-relaxed mb-8 tracking-[-0.01em]"
        >
          Generate architectures, PRD, and backlogs to validate fast and start coding in seconds.
        </motion.p>

        {/* ── Action Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-3.5 mb-14"
        >
          <Link
            href="/dashboard"
            id="hero-cta-primary"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#e85d3f] hover:bg-[#d84d2f] active:bg-[#c93e21] text-white text-[15px] font-semibold tracking-[-0.01em] shadow-[0_4px_16px_rgba(232,93,63,0.28)] hover:shadow-[0_6px_24px_rgba(232,93,63,0.36)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 min-w-[160px]"
          >
            <span>Get Started</span>
            <ArrowRight size={16} />
          </Link>

          <button
            onClick={onSeeExample}
            id="hero-cta-secondary"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#f5f2ea] text-[#141817] text-[14px] font-medium border border-[#141817]/10 hover:border-[#141817]/20 shadow-sm transition-all duration-150"
          >
            <Sparkles size={15} className="text-[#e85d3f]" />
            <span>See Example PRD</span>
          </button>
        </motion.div>

        {/* ────────────────────────────────────────────────────────────
            4 FLOATING CONTEXT CARDS (Surrounding the hero on desktop)
            ──────────────────────────────────────────────────────────── */}

        {/* Card 1: Top-Left (Sticky note thought card) */}
        <motion.div
          initial={{ opacity: 0, x: -30, y: -20, rotate: -4 }}
          animate={{ opacity: 1, x: 0, y: 0, rotate: -4 }}
          whileHover={{ rotate: 0, scale: 1.03 }}
          transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
          className="hidden lg:block absolute left-0 top-8 xl:-left-6 w-64 bg-[#fffef9] p-4 rounded-2xl border border-[#141817]/8 shadow-[0_12px_30px_rgba(20,24,23,0.06)] text-left"
        >
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#737b78]">
              Product Insight
            </span>
          </div>
          <p className="text-[13px] text-[#141817] font-medium leading-snug italic mb-2">
            &ldquo;Ideas are worthless without execution. Turn thoughts into actionable specs.&rdquo;
          </p>
          <div className="flex items-center justify-between text-[11px] text-[#737b78] pt-1.5 border-t border-[#141817]/6">
            <span>Verified PM Note</span>
            <span className="text-[#e85d3f] font-mono">100% synced</span>
          </div>
        </motion.div>

        {/* Card 2: Top-Right (Active Backlog Checklist) */}
        <motion.div
          initial={{ opacity: 0, x: 30, y: -20, rotate: 3 }}
          animate={{ opacity: 1, x: 0, y: 0, rotate: 3 }}
          whileHover={{ rotate: 0, scale: 1.03 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="hidden lg:block absolute right-0 top-6 xl:-right-6 w-68 bg-white p-4 rounded-2xl border border-[#141817]/8 shadow-[0_12px_30px_rgba(20,24,23,0.06)] text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#141817] flex items-center gap-1.5">
              <Layers size={13} className="text-[#e85d3f]" />
              Active Backlog
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#f5f2ea] text-[10px] font-mono font-medium text-[#4d5552]">
              Sprint 12
            </span>
          </div>
          <ul className="space-y-2 list-none p-0 m-0">
            <li className="flex items-center gap-2 text-xs text-[#4d5552]">
              <CheckCircle2 size={13} className="text-[#0d9488] shrink-0" />
              <span className="truncate">User Auth & Session Flow</span>
            </li>
            <li className="flex items-center gap-2 text-xs text-[#4d5552]">
              <CheckCircle2 size={13} className="text-[#0d9488] shrink-0" />
              <span className="truncate">Payment Gateway Integration</span>
            </li>
            <li className="flex items-center gap-2 text-xs text-[#737b78]">
              <Clock size={13} className="text-[#f59e0b] shrink-0" />
              <span className="truncate">Automated Task Sync</span>
            </li>
          </ul>
        </motion.div>

        {/* Card 3: Bottom-Left (Velocity & Sparkline) */}
        <motion.div
          initial={{ opacity: 0, x: -20, y: 30 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          className="hidden lg:block absolute left-4 bottom-2 xl:-left-4 w-60 bg-white p-4 rounded-2xl border border-[#141817]/8 shadow-[0_10px_26px_rgba(20,24,23,0.05)] text-left"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono text-[#737b78] uppercase tracking-wider">
              PRD Synthesis Speed
            </span>
            <span className="flex items-center text-[11px] font-semibold text-[#0d9488]">
              <TrendingUp size={12} className="mr-0.5" />
              +38%
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-[#141817] mb-2">
            1m 42s
          </div>
          {/* Decorative mini chart line */}
          <div className="w-full h-7">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28" fill="none">
              <path
                d="M 0,22 Q 25,24 45,14 T 80,8 T 100,2"
                stroke="#e85d3f"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="100" cy="2" r="3.5" fill="#e85d3f" />
            </svg>
          </div>
        </motion.div>

        {/* Card 4: Bottom-Right (Architecture Stack badges) */}
        <motion.div
          initial={{ opacity: 0, x: 20, y: 30 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="hidden lg:block absolute right-4 bottom-2 xl:-right-4 w-64 bg-white p-4 rounded-2xl border border-[#141817]/8 shadow-[0_10px_26px_rgba(20,24,23,0.05)] text-left"
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-[#141817] flex items-center gap-1.5">
              <Cpu size={13} className="text-[#3b82f6]" />
              Architecture Stack
            </span>
            <span className="w-2 h-2 rounded-full bg-[#0d9488] animate-pulse" />
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="px-2 py-0.5 bg-[#f5f2ea] rounded-md text-[11px] font-mono text-[#141817]">
              Next.js 16
            </span>
            <span className="px-2 py-0.5 bg-[#f5f2ea] rounded-md text-[11px] font-mono text-[#141817]">
              React 19
            </span>
            <span className="px-2 py-0.5 bg-[#f5f2ea] rounded-md text-[11px] font-mono text-[#141817]">
              Tailwind
            </span>
            <span className="px-2 py-0.5 bg-[#f5f2ea] rounded-md text-[11px] font-mono text-[#141817]">
              Prisma
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#737b78] flex justify-between items-center">
            <span>Agent Skill Ready</span>
            <span className="text-[#0d9488] font-bold">10ms sync</span>
          </div>
        </motion.div>

        {/* Mobile preview cards grid (visible only on small screens) */}
        <div className="grid grid-cols-2 gap-3 w-full lg:hidden mt-4 text-left">
          <div className="bg-white p-3.5 rounded-xl border border-[#141817]/8 shadow-sm">
            <span className="text-[10px] font-mono text-[#737b78] uppercase">Synthesis Speed</span>
            <div className="text-lg font-bold font-mono text-[#141817] mt-0.5">1m 42s</div>
            <span className="text-[11px] text-[#0d9488] font-medium">+38% faster</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#141817]/8 shadow-sm">
            <span className="text-[10px] font-mono text-[#737b78] uppercase">Agent Sync</span>
            <div className="text-lg font-bold font-mono text-[#141817] mt-0.5">10 ms</div>
            <span className="text-[11px] text-[#e85d3f] font-medium">Zero AI drift</span>
          </div>
        </div>

      </div>
    </section>
  );
}
