"use client";

import { motion } from "framer-motion";
import {
  FileText,
  BarChart3,
  CheckCircle2,
  Clock,
  Check,
  TrendingUp,
  Sparkles,
  Layers,
} from "lucide-react";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4 md:px-8 bg-[#fcfbf8] relative">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-[720px] mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f2ea] border border-[#141817]/6 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#e85d3f] mb-4">
            Platform Overview
          </div>
          <h2 className="font-serif text-[34px] sm:text-[44px] md:text-[50px] font-bold text-[#141817] tracking-[-0.025em] leading-[1.12] mb-4">
            Keep everything in one place
          </h2>
          <p className="text-base sm:text-lg text-[#57575c] leading-relaxed">
            Focus on what matters most to build great products.
          </p>
        </div>

        {/* ── 4-Item Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Bento Card 1: Centralized Documentation (5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-5 bg-[#f6f3eb] rounded-[28px] p-6 sm:p-8 border border-[#141817]/8 shadow-sm flex flex-col justify-between hover:shadow-[0_12px_36px_rgba(20,24,23,0.06)] transition-all duration-300 group"
          >
            {/* Visual preview: Stacked document mockup */}
            <div className="relative h-44 mb-6 flex items-center justify-center">
              {/* Back card */}
              <div className="absolute w-[80%] h-28 bg-white/70 rounded-2xl border border-[#141817]/6 top-2 transform -rotate-4 transition-transform group-hover:-rotate-6" />
              {/* Mid card */}
              <div className="absolute w-[85%] h-28 bg-white/85 rounded-2xl border border-[#141817]/6 top-5 transform rotate-2 transition-transform group-hover:rotate-4" />
              {/* Front main card */}
              <div className="relative w-[90%] bg-white rounded-2xl p-4 border border-[#141817]/8 shadow-md">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-5 h-5 rounded-md bg-[#fff2ee] text-[#e85d3f] flex items-center justify-center">
                    <FileText size={12} />
                  </div>
                  <span className="text-xs font-semibold text-[#141817] truncate">
                    Core Specs & Architecture
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-[#f0ede4] rounded-full" />
                  <div className="h-2 w-4/5 bg-[#f0ede4] rounded-full" />
                  <div className="h-2 w-2/3 bg-[#e85d3f]/25 rounded-full" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#141817] mb-2 tracking-tight">
                Centralized documentation
              </h3>
              <p className="text-sm text-[#57575c] leading-relaxed m-0">
                Consolidate PRDs, system architectures, and engineering scopes into one single accessible location.
              </p>
            </div>
          </motion.div>

          {/* Bento Card 2: Time Measurement Tool (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-7 bg-[#f6f3eb] rounded-[28px] p-6 sm:p-8 border border-[#141817]/8 shadow-sm flex flex-col justify-between hover:shadow-[0_12px_36px_rgba(20,24,23,0.06)] transition-all duration-300 group"
          >
            {/* Visual preview: Bar chart & analytics card */}
            <div className="bg-white rounded-2xl p-5 border border-[#141817]/8 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Mini bar chart */}
              <div className="flex items-end gap-2.5 h-24 pt-2">
                {[
                  { day: "M", height: "45%" },
                  { day: "T", height: "70%" },
                  { day: "W", height: "90%", active: true },
                  { day: "T", height: "60%" },
                  { day: "F", height: "80%" },
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="w-6 h-18 bg-[#f5f2ea] rounded-lg flex items-end justify-center p-1 overflow-hidden">
                      <div
                        style={{ height: bar.height }}
                        className={`w-full rounded-md transition-all duration-500 ${
                          bar.active ? "bg-[#141817]" : "bg-[#141817]/30"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-[#85858a]">{bar.day}</span>
                  </div>
                ))}
              </div>

              {/* Stats readout */}
              <div className="sm:border-l border-[#141817]/8 sm:pl-5 space-y-2 text-left w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#e85d3f]" />
                  <span className="text-xs text-[#737b78] font-medium">Sprint Velocity</span>
                </div>
                <div className="text-2xl font-bold font-mono text-[#141817]">
                  &lt; 3 Min
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#059669] bg-[#ecfdf5] px-2 py-0.5 rounded-full">
                  <TrendingUp size={11} />
                  <span>3.8x faster delivery</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#141817] mb-2 tracking-tight">
                Time Measurement Tool
              </h3>
              <p className="text-sm text-[#57575c] leading-relaxed m-0">
                Track how fast your team turns abstract requirements into verified system implementations with autonomous agents.
              </p>
            </div>
          </motion.div>

          {/* Bento Card 3: Automated Task Tracking (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-7 bg-[#f6f3eb] rounded-[28px] p-6 sm:p-8 border border-[#141817]/8 shadow-sm flex flex-col justify-between hover:shadow-[0_12px_36px_rgba(20,24,23,0.06)] transition-all duration-300 group"
          >
            {/* Visual preview: Dynamic Status Pills & Switchers */}
            <div className="bg-white rounded-2xl p-5 border border-[#141817]/8 shadow-sm mb-6 space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8f4] border border-[#141817]/6">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#ecfdf5] text-[#059669] flex items-center justify-center text-xs">
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-medium text-[#141817]">
                    Frontend UI Component Scaffold
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#141817] text-white text-[10px] font-mono">
                  DONE
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fff9f0] border border-[#f59e0b]/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#e85d3f] animate-ping" />
                  <span className="text-xs font-semibold text-[#141817]">
                    Database Schema Migration &amp; Seed
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#e85d3f] text-white text-[10px] font-mono font-semibold">
                  IN PROGRESS
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#141817] mb-2 tracking-tight">
                Automated Task Tracking
              </h3>
              <p className="text-sm text-[#57575c] leading-relaxed m-0">
                6-phase Kanban task boards auto-populate from your PRD and synchronize bidirectionally with local IDEs.
              </p>
            </div>
          </motion.div>

          {/* Bento Card 4: Our Team's Performance (5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-5 bg-[#f6f3eb] rounded-[28px] p-6 sm:p-8 border border-[#141817]/8 shadow-sm flex flex-col justify-between hover:shadow-[0_12px_36px_rgba(20,24,23,0.06)] transition-all duration-300 group"
          >
            {/* Visual preview: Metric Score Card */}
            <div className="bg-white rounded-2xl p-5 border border-[#141817]/8 shadow-sm mb-6 flex items-center justify-center">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-[#f0ede4] border-t-[#e85d3f] flex items-center justify-center">
                    <span className="font-mono text-2xl font-bold text-[#141817]">
                      98%
                    </span>
                  </div>
                </div>
                <div className="text-xs font-semibold text-[#141817] mt-2">
                  System Precision Score
                </div>
                <div className="text-[11px] text-[#737b78]">
                  Zero hallucination drift
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#141817] mb-2 tracking-tight">
                Our team&apos;s Performance
              </h3>
              <p className="text-sm text-[#57575c] leading-relaxed m-0">
                Evaluate requirement completeness, architecture soundness, and developer execution fidelity in real-time.
              </p>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
