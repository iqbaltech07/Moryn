"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Kanban,
  Zap,
  CheckCircle2,
  Share2,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

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

        {/* ── Signature Product Showcase Window Mockup ("Geobet.link") ── */}
        <motion.div
          id="showcase"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-[1020px] mx-auto bg-[#f6f3eb] p-3 sm:p-5 md:p-7 rounded-[26px] sm:rounded-[32px] border border-[#141817]/8 shadow-[0_24px_60px_rgba(20,24,23,0.06)]"
        >
          {/* Inner App Chrome Frame */}
          <div className="bg-white rounded-2xl sm:rounded-[22px] border border-[#141817]/8 shadow-sm overflow-hidden text-left">
            
            {/* Window Topbar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#141817]/6 bg-[#fbfaf6]">
              {/* Traffic dots & Project Name */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
                </div>
                <div className="h-4 w-[1px] bg-[#141817]/10 mx-1 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs sm:text-sm text-[#141817] tracking-tight">
                    Geobet.link
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[10px] font-mono text-[#065f46] font-medium hidden sm:inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    In Progress
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block px-3 py-1 rounded-md bg-white border border-[#141817]/10 text-[11px] font-mono text-[#57575c]">
                  v2.4.0-verified
                </span>
                <Link
                  href="/dashboard"
                  className="px-3.5 py-1.5 rounded-full bg-[#e85d3f] hover:bg-[#d84d2f] text-white text-xs font-semibold shadow-xs transition"
                >
                  Generate PRD
                </Link>
              </div>
            </div>

            {/* Window Interior Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
              
              {/* Left Sub-Sidebar */}
              <div className="md:col-span-3 border-r border-[#141817]/6 p-4 bg-[#fcfbf9] hidden md:block">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#85858a] font-semibold mb-3">
                  Workspace
                </div>
                <div className="space-y-1">
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#141817]/8 text-xs font-semibold text-[#141817] shadow-xs text-left">
                    <span className="flex items-center gap-2">
                      <FileText size={13} className="text-[#e85d3f]" />
                      PRD Overview
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e85d3f]" />
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#57575c] hover:bg-white hover:text-[#141817] transition text-left">
                    <Cpu size={13} />
                    System Architecture
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#57575c] hover:bg-white hover:text-[#141817] transition text-left">
                    <Layers size={13} />
                    Data Flow & APIs
                  </button>
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#57575c] hover:bg-white hover:text-[#141817] transition text-left">
                    <span className="flex items-center gap-2">
                      <Kanban size={13} />
                      Kanban Tasks
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-[#f0ede4] text-[10px] font-mono">18</span>
                  </button>
                </div>

                <div className="mt-8 pt-4 border-t border-[#141817]/6">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#85858a] font-semibold mb-2">
                    Validation Health
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#141817]/6">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#57575c]">Spec Score</span>
                      <span className="font-bold text-[#059669]">98%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f0ede4] rounded-full overflow-hidden">
                      <div className="w-[98%] h-full bg-[#059669] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Main Content (PRD Document) */}
              <div className="md:col-span-6 p-5 sm:p-6 bg-white overflow-y-auto">
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#85858a] mb-2">
                  <span>SPEC ID: PRD-2026-GEO</span>
                  <span>•</span>
                  <span>Last synced 3m ago</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-[#141817] mb-3 tracking-tight">
                  Decentralized Prediction Market Engine
                </h4>
                <p className="text-xs sm:text-[13px] text-[#57575c] leading-relaxed mb-5">
                  High-throughput settlement protocol with automated market makers and real-time oracle aggregation.
                </p>

                {/* Specs Box */}
                <div className="space-y-3 mb-5">
                  <div className="p-3.5 rounded-xl bg-[#faf8f4] border border-[#141817]/6">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#141817]">
                        01. User Authentication & Wallet Connect
                      </span>
                      <span className="text-[10px] font-mono text-[#059669] font-medium bg-[#ecfdf5] px-2 py-0.5 rounded-full">
                        Ready
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737b78] leading-normal m-0">
                      Multi-chain support for Solana, EVM, and Passkey biometric signatures.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#faf8f4] border border-[#141817]/6">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#141817]">
                        02. Orderbook & Liquidity Pools
                      </span>
                      <span className="text-[10px] font-mono text-[#e85d3f] font-medium bg-[#fff2ee] px-2 py-0.5 rounded-full">
                        Agent Sync
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737b78] leading-normal m-0">
                      Hybrid off-chain orderbook with sub-second execution and on-chain batching.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#fff9f0] border border-[#f59e0b]/20 text-[11px] text-[#92400e]">
                  <Sparkles size={14} className="text-[#f59e0b] shrink-0" />
                  <span>Agent Directive: All endpoints compiled for Cursor &amp; Windsurf execution.</span>
                </div>
              </div>

              {/* Right Details Panel */}
              <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-[#141817]/6 p-4 sm:p-5 bg-[#fcfbf9]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#85858a] font-semibold mb-3">
                  Architecture Stack
                </div>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {["Next.js", "TypeScript", "Tailwind", "Prisma", "Postgres", "Redis"].map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-md bg-white border border-[#141817]/8 text-[11px] font-mono text-[#141817]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-[10px] font-mono uppercase tracking-wider text-[#85858a] font-semibold mb-3">
                  Assigned Agents
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-[#141817]">
                    <div className="w-6 h-6 rounded-full bg-[#e85d3f] text-white flex items-center justify-center font-bold text-[10px]">
                      AG
                    </div>
                    <div className="truncate">
                      <div className="font-medium">Antigravity AI</div>
                      <div className="text-[10px] text-[#737b78]">Lead Architect</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#141817]">
                    <div className="w-6 h-6 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[10px]">
                      CU
                    </div>
                    <div className="truncate">
                      <div className="font-medium">Cursor Daemon</div>
                      <div className="text-[10px] text-[#737b78]">Task Executor</div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-[#f5f2ea] border border-[#141817]/10 text-xs font-semibold text-[#141817] shadow-2xs transition"
                >
                  <span>Open Full Blueprint</span>
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
