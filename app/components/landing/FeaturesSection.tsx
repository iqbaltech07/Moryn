"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Kanban,
  Zap,
  ExternalLink,
  Sparkles,
  ChevronDown,
  Pencil,
  Copy,
  Download,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const CHALLENGES = [
  {
    icon: FileText,
    title: "Centralize your product documentation",
    description:
      "Consolidate user stories, PRDs, and system architecture in one unified single source of truth.",
  },
  {
    icon: Kanban,
    title: "Keep track of features and backlogs",
    description:
      "Structure multi-phase backlogs with auto-generated Kanban tasks synced to AI agent tools.",
  },
  {
    icon: Zap,
    title: "Validate ideas and start coding faster",
    description:
      "Go from raw product concept to executable codebase in seconds with zero AI architectural drift.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 md:px-8 bg-[#fcfbf8] relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-[720px] mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f2ea] border border-[#141817]/6 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#e85d3f] mb-4">
            Features
          </div>
          <h2 className="font-serif text-[34px] sm:text-[44px] md:text-[50px] font-bold text-[#141817] tracking-[-0.025em] leading-[1.12] mb-4">
            Solve your team&apos;s <br className="hidden sm:inline" />
            biggest challenges
          </h2>
          <p className="text-base sm:text-lg text-[#57575c] leading-relaxed">
            Eliminate documentation friction and align your entire team from ideation to deployment.
          </p>
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-20">
          {CHALLENGES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-200 hover:bg-white hover:shadow-[0_8px_24px_rgba(20,24,23,0.04)]"
              >
                <div className="w-13 h-13 rounded-2xl bg-[#fff2ee] border border-[#e85d3f]/20 flex items-center justify-center text-[#e85d3f] mb-5 shadow-xs">
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <h3 className="text-lg font-bold text-[#141817] mb-2.5 tracking-[-0.01em]">
                  {item.title}
                </h3>
                <p className="text-sm text-[#57575c] leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* ── Signature Product Showcase Window Mockup (Moryn PRD & Architecture Engine) ── */}
        <motion.div
          id="showcase"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-[1060px] mx-auto bg-[#f6f3eb] p-3 sm:p-5 md:p-6 rounded-[28px] border border-[#141817]/8 shadow-[0_24px_60px_rgba(20,24,23,0.06)]"
        >
          {/* Inner App Chrome Frame */}
          <div className="bg-[#fcfbf8] rounded-2xl sm:rounded-[22px] border border-[#141817]/8 shadow-sm overflow-hidden text-left flex flex-col">
            
            {/* Window Topbar — Modeled directly after /prd header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#141817]/8 bg-[#fcfbf8]/95 backdrop-blur-md">
              {/* Traffic dots & Moryn Breadcrumb */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
                </div>
                <div className="h-4 w-[1px] bg-[#141817]/10 mx-1 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Image
                    src="/logo/Moryn-Light-Mode.webp"
                    alt="Moryn"
                    width={180}
                    height={57}
                    className="h-[19px] w-auto object-contain select-none"
                    priority
                  />
                  <span className="text-[#9ca3af] text-sm select-none">/</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e15b39]/[0.06] text-xs font-semibold text-[#141817]">
                    <span>Moryn Cloud Engine</span>
                    <ChevronDown size={12} className="text-[#71717a]" />
                  </div>
                </div>
              </div>

              {/* Center Stepper Badges (1 STRUCTURE - 2 PRD [Active] - 3 DESIGN - 4 TASK) */}
              <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono">
                <span className="text-[#71717a] flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full border border-[#71717a]/30 flex items-center justify-center text-[10px]">1</span>
                  STRUCTURE
                </span>
                <span className="text-[#141817]/20">―</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e15b39]/10 border border-[#e15b39]/30 text-[#e15b39] font-bold shadow-2xs">
                  <span className="w-4 h-4 rounded-full bg-[#e15b39] text-white flex items-center justify-center text-[10px]">2</span>
                  PRD
                </span>
                <span className="text-[#141817]/20">―</span>
                <span className="text-[#71717a] flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full border border-[#71717a]/30 flex items-center justify-center text-[10px]">3</span>
                  DESIGN
                </span>
                <span className="text-[#141817]/20">―</span>
                <span className="text-[#71717a] flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full border border-[#71717a]/30 flex items-center justify-center text-[10px]">4</span>
                  TASK
                </span>
              </div>

              {/* Next Step Action Button */}
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#e15b39] hover:bg-[#d84d2f] active:bg-[#c93e21] text-white text-xs font-bold shadow-xs transition"
                >
                  <span>Next Step</span>
                  <ArrowRight size={13} strokeWidth={2.2} />
                </Link>
              </div>
            </div>

            {/* Window Interior Grid — Modeled directly after /prd body */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
              
              {/* Left TOC Sidebar (Matches /prd aside) */}
              <div className="md:col-span-3 border-r border-[#141817]/6 p-4 bg-[#fcfbf9] hidden md:flex flex-col justify-between">
                <div>
                  {/* Document Card */}
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#141817]/6 mb-3 shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-[#e15b39]/12 flex items-center justify-center text-[#e15b39] shrink-0">
                      <FileText size={16} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-[#e15b39] truncate leading-tight">
                        Moryn Cloud Engine
                      </div>
                      <div className="text-[10px] text-[#71717a] font-medium mt-0.5">
                        Technical Documentation
                      </div>
                    </div>
                  </div>

                  {/* Edit Mode & Quick Actions */}
                  <div className="space-y-1.5 mb-4">
                    <button className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#e15b39] text-white text-xs font-bold shadow-xs transition">
                      <Pencil size={12} strokeWidth={2.2} />
                      <span>Edit Mode</span>
                    </button>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white border border-[#141817]/8 text-[11px] font-medium text-[#4b5563] hover:bg-[#f5f2ea] transition shadow-2xs">
                        <Copy size={12} />
                        <span>Copy</span>
                      </button>
                      <button className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white border border-[#141817]/8 text-[11px] font-medium text-[#4b5563] hover:bg-[#f5f2ea] transition shadow-2xs">
                        <Download size={12} />
                        <span>.md</span>
                      </button>
                    </div>
                  </div>

                  {/* Contents Header & List */}
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#85858a] font-bold mb-2 px-1">
                    Contents
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center px-2.5 py-1.5 rounded-lg border-l-2 border-[#e15b39] bg-[#e15b39]/10 text-xs font-semibold text-[#e15b39]">
                      1. Overview
                    </div>
                    <div className="px-2.5 py-1 text-xs text-[#57575c] hover:text-[#141817] transition cursor-pointer">
                      2. Requirements
                    </div>
                    <div className="px-2.5 py-1 text-xs text-[#57575c] hover:text-[#141817] transition cursor-pointer">
                      3. Core Features
                    </div>
                    <div className="px-2.5 py-1 text-xs text-[#57575c] hover:text-[#141817] transition cursor-pointer">
                      4. User Flow
                    </div>
                    <div className="px-2.5 py-1 text-xs text-[#57575c] hover:text-[#141817] transition cursor-pointer">
                      5. Architecture
                    </div>
                    <div className="px-2.5 py-1 text-xs text-[#57575c] hover:text-[#141817] transition cursor-pointer">
                      6. Database Schema
                    </div>
                    <div className="px-2.5 py-1 text-xs text-[#57575c] hover:text-[#141817] transition cursor-pointer">
                      7. Tech Stack
                    </div>
                    <div className="px-2.5 py-1 text-xs text-[#57575c] hover:text-[#141817] transition cursor-pointer">
                      8. API Endpoints
                    </div>
                  </div>
                </div>

                {/* Validation Status Card */}
                <div className="mt-4 p-2.5 bg-white rounded-xl border border-[#141817]/6 shadow-2xs">
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="text-[#57575c] font-medium">Blueprint Health</span>
                    <span className="font-bold text-[#059669]">100% Synced</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#f0ede4] rounded-full overflow-hidden">
                    <div className="w-full h-full bg-[#059669] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Center Main Content (PRD Document Canvas) */}
              <div className="md:col-span-6 p-5 sm:p-7 bg-white overflow-y-auto">
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#85858a] mb-2.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#f5f2ea] text-[#e15b39] font-semibold">
                    SPEC ID: PRD-2026-MORYN
                  </span>
                  <span>•</span>
                  <span>10-Section Anti-Drift</span>
                  <span>•</span>
                  <span className="text-[#059669] font-medium">10ms Sync</span>
                </div>

                <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#141817] mb-2 tracking-tight">
                  Moryn — AI PRD Generator &amp; Architecture Engine
                </h4>
                <p className="text-xs sm:text-[13.5px] text-[#57575c] leading-relaxed mb-6 pb-4 border-b border-[#141817]/8">
                  Platform otomasi rekayasa perangkat lunak yang mengubah ide produk mentah menjadi 10-Nomor PRD, visual architecture tree, dan 6-Phase atomic Kanban tasks dengan nol halusinasi teknis.
                </p>

                {/* Section 1 Overview */}
                <div className="mb-6">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#e15b39] mb-2">
                    1. Overview &amp; Problem Statement
                  </div>
                  <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#141817]/6 space-y-2">
                    <div className="text-xs font-bold text-[#141817]">
                      Deterministic Contextual Chaining Pipeline
                    </div>
                    <p className="text-xs text-[#57575c] leading-relaxed m-0">
                      Menghilangkan architectural drift pada AI coding assistants (Cursor, Windsurf, Antigravity) melalui standarisasi kontrak data terikat: Personalization Wizard ➔ 10-Section PRD ➔ Visual Tree ➔ 6-Phase Kanban.
                    </p>
                  </div>
                </div>

                {/* Section 3 Core Features Preview */}
                <div className="mb-6">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#e15b39] mb-2">
                    3. Core Feature Matrix
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-white border border-[#141817]/8 shadow-2xs flex items-start gap-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#fff2ee] text-[10px] font-mono font-bold text-[#e15b39] shrink-0">
                        FR-01
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#141817]">Interactive Multi-Step Generator</div>
                        <div className="text-[11px] text-[#737b78] mt-0.5">Wizard 3-langkah dengan auto-save lokal dan rekomendasi 4 pilar tech stack otomatis.</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-[#141817]/8 shadow-2xs flex items-start gap-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#ecfdf5] text-[10px] font-mono font-bold text-[#059669] shrink-0">
                        FR-02
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#141817]">Autonomous Agent IDE Synchronization</div>
                        <div className="text-[11px] text-[#737b78] mt-0.5">Integrasi zero-friction via NPX CLI (`npx moryn init`) yang menyinkronkan task ke browser dalam 10ms.</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Directive Banner */}
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#fff9f0] border border-[#f59e0b]/25 text-xs text-[#92400e]">
                  <Sparkles size={15} className="text-[#f59e0b] shrink-0" />
                  <span><strong>Agent Directive:</strong> Context snapshot siap dieksekusi oleh Antigravity &amp; Cursor tanpa halusinasi arsitektur.</span>
                </div>
              </div>

              {/* Right Details Panel (AI Chat & Architecture Stack) */}
              <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-[#141817]/6 p-4 sm:p-5 bg-[#fcfbf9] flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#85858a] font-bold mb-3">
                    Architecture Stack
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {["Next.js 16", "FastAPI", "TypeScript", "Postgres", "Prisma", "Redis", "Better-Auth"].map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-white border border-[#141817]/8 text-[10.5px] font-mono text-[#141817]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#85858a] font-bold mb-3">
                    AI Revision Assistant
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#141817]/8 shadow-2xs space-y-2 mb-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#141817] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                        Gemini 2.5 Flash
                      </span>
                      <span className="text-[10px] font-mono text-[#71717a]">Active</span>
                    </div>
                    <p className="text-[11px] text-[#71717a] leading-relaxed m-0">
                      Menganalisis draf PRD, merekomendasikan restrukturisasi database, dan memvalidasi integrasi API.
                    </p>
                  </div>

                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#85858a] font-bold mb-2">
                    Assigned Agents
                  </div>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-[#141817]">
                      <div className="w-5 h-5 rounded-full bg-[#e85d3f] text-white flex items-center justify-center font-bold text-[9px]">
                        AG
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-[11px]">Antigravity AI</div>
                        <div className="text-[10px] text-[#737b78]">Lead Architect</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#141817]">
                      <div className="w-5 h-5 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[9px]">
                        CU
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-[11px]">Cursor Daemon</div>
                        <div className="text-[10px] text-[#737b78]">Task Executor</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-[#f5f2ea] border border-[#141817]/10 text-xs font-semibold text-[#141817] shadow-2xs transition"
                >
                  <span>Open Moryn Studio</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
