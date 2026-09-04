"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";

const FREE_FEATURES = [
  "1 Active Project (PRD, Architecture, Tasks)",
  "Interactive Visual Mindmap (React Flow)",
  "6-Phase Kanban Task Tracker",
  "MCP Agent Integration (Cursor, Windsurf, Claude)",
  "5x AI Model revisions per blueprint",
];

const PRO_FEATURES = [
  "Unlimited Projects & Arch Blueprints",
  "Priority Multi-Model AI (Gemini 2.5/3.7 & OpenRouter)",
  "Autonomous CLI Sync (npx moryn sync)",
  "Interactive Visual Mindmaps & Schema Exports",
  "High-Quota Agent IDE Integration & Memory Hooks",
  "Markdown (.md) & JSON Full Export",
  "Team Collaboration & Shared Workspace",
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 px-4 md:px-8 bg-[#fcfbf8] relative">
      <div className="max-w-[960px] mx-auto">

        {/* Section Header */}
        <div className="text-center max-w-[720px] mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f2ea] border border-[#141817]/6 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#e85d3f] mb-4">
            Pricing
          </div>
          <h2 className="font-serif text-[34px] sm:text-[44px] md:text-[50px] font-bold text-[#141817] tracking-[-0.025em] leading-[1.12] mb-4">
            Simple pricing plans
          </h2>
          <p className="text-base sm:text-lg text-[#57575c] leading-relaxed mb-8">
            Start building for free, or upgrade to Pro to unlock unlimited autonomous agent workflows.
          </p>

          {/* Monthly / Annual Toggle Switch */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-[#f5f2ea] border border-[#141817]/6">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${!annual ? "bg-white text-[#141817] shadow-xs" : "text-[#737b78] hover:text-[#141817]"
                }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${annual ? "bg-white text-[#141817] shadow-xs" : "text-[#737b78] hover:text-[#141817]"
                }`}
            >
              <span>Annual billing</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#fff2ee] text-[10px] font-mono text-[#e85d3f] font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* ── 2 Pricing Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

          {/* Free Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[28px] p-8 border border-[#141817]/8 shadow-sm flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#141817] mb-1">Free Plan</h3>
                <p className="text-xs text-[#737b78]">For solo developers and experimenters.</p>
              </div>

              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="font-mono text-4xl sm:text-5xl font-bold text-[#141817]">0</span>
                <span className="font-mono text-xl font-bold text-[#141817]">Rp</span>
                <span className="text-sm text-[#737b78] font-mono">/ month</span>
              </div>

              <Link
                href="/generate"
                className="w-full inline-flex items-center justify-center py-3 px-6 rounded-full bg-white hover:bg-[#f5f2ea] text-[#141817] text-sm font-semibold border border-[#141817]/12 shadow-xs transition mb-8"
              >
                Get started
              </Link>

              <div className="space-y-3 pt-6 border-t border-[#141817]/6">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#85858a] font-semibold mb-3">
                  What&apos;s included:
                </div>
                {FREE_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-xs text-[#57575c]">
                    <div className="w-4 h-4 rounded-full bg-[#f5f2ea] flex items-center justify-center text-[#737b78] shrink-0 mt-0.5">
                      <Check size={11} strokeWidth={2.5} />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Pro Plan Card (Highlighted) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[28px] p-8 border-2 border-[#e85d3f] shadow-[0_12px_36px_rgba(232,93,63,0.12)] flex flex-col justify-between relative hover:shadow-[0_16px_48px_rgba(232,93,63,0.18)] transition"
          >
            {/* Most Popular Badge */}
            <div className="absolute -top-3 right-8 px-3 py-1 rounded-full bg-[#e85d3f] text-white text-[11px] font-mono font-bold tracking-wide uppercase shadow-xs">
              Most Popular
            </div>

            <div>
              <div className="mb-6">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#e85d3f] mb-1">
                  <Sparkles size={13} />
                  <span>Pro Plan</span>
                </div>
                <p className="text-xs text-[#737b78]">For growing teams and serious builders.</p>
              </div>

              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="font-mono text-4xl sm:text-5xl font-bold text-[#141817]">
                  {annual ? "39000" : "49000"}
                </span>
                <span className="font-mono text-xl font-bold text-[#e85d3f]">Rp</span>
                <span className="text-sm text-[#737b78] font-mono">/ month</span>
              </div>

              <Link
                href="/generate"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#e85d3f] hover:bg-[#d84d2f] text-white text-sm font-semibold shadow-[0_4px_16px_rgba(232,93,63,0.28)] hover:shadow-[0_6px_22px_rgba(232,93,63,0.36)] transition mb-8"
              >
                <span>Start with Pro</span>
                <ArrowRight size={15} />
              </Link>

              <div className="space-y-3 pt-6 border-t border-[#141817]/6">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#85858a] font-semibold mb-3">
                  Everything in Free, plus:
                </div>
                {PRO_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-xs text-[#141817] font-medium">
                    <div className="w-4 h-4 rounded-full bg-[#fff2ee] flex items-center justify-center text-[#e85d3f] shrink-0 mt-0.5">
                      <Check size={11} strokeWidth={2.8} />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
