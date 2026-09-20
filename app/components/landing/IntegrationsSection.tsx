"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Terminal,
  Sparkles,
  Bot,
  Cpu,
  Workflow,
  Code2,
  Check,
  Copy,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface AgentPlatform {
  id: string;
  name: string;
  category: string;
  protocol: string;
  icon: typeof Terminal;
  color: string;
  bg: string;
}

const ROW_ONE: AgentPlatform[] = [
  {
    id: "cursor",
    name: "Cursor",
    category: "AI Coding Agent",
    protocol: ".cursorrules & Agent Skills",
    icon: Terminal,
    color: "#e85d3f",
    bg: "#fef3f0",
  },
  {
    id: "windsurf",
    name: "Windsurf",
    category: "Cascade AI Agent",
    protocol: "Global & Workspace Rules",
    icon: Sparkles,
    color: "#0d9488",
    bg: "#f0fdfa",
  },
  {
    id: "claude-code",
    name: "Claude Code",
    category: "Anthropic CLI Agent",
    protocol: "CLAUDE.md & Custom Skills",
    icon: Bot,
    color: "#d97706",
    bg: "#fffbeb",
  },
];

const ROW_TWO: AgentPlatform[] = [
  {
    id: "antigravity",
    name: "Google Antigravity",
    category: "AGY Coding Agent",
    protocol: ".agents/skills & AGENTS.md",
    icon: Cpu,
    color: "#4f46e5",
    bg: "#eef2ff",
  },
  {
    id: "cline",
    name: "Cline / Roo Code",
    category: "Autonomous Agent",
    protocol: "Autonomous Task Execution",
    icon: Workflow,
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    category: "Agent Mode Workspace",
    protocol: "Copilot Instructions Sync",
    icon: Code2,
    color: "#24292f",
    bg: "#f6f8fa",
  },
];

export default function IntegrationsSection() {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText("npx moryn init");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="integrations" className="py-24 px-4 md:px-8 bg-[#fcfbf8] relative overflow-hidden">
      <div className="max-w-[1140px] mx-auto text-center">

        {/* Section Header */}
        <div className="max-w-[760px] mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f2ea] border border-[#141817]/6 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#e85d3f] mb-4">
            <Zap size={12} className="text-[#e85d3f]" />
            Moryn NPM & AI Agent Ecosystem
          </div>
          <h2 className="font-serif text-[34px] sm:text-[44px] md:text-[50px] font-bold text-[#141817] tracking-[-0.025em] leading-[1.12] mb-4">
            Connect your AI Coding Agents <br className="hidden sm:inline" />
            via Moryn NPM
          </h2>
          <p className="text-base sm:text-lg text-[#57575c] leading-relaxed">
            Run a single command in your local workspace. Moryn automatically injects PRD architectures, anti-slop design guidelines, and live Kanban synchronization directly into your AI coding agents.
          </p>
        </div>

        {/* Quick CLI Command Pill */}
        <div className="flex justify-center mb-14">
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-[#141817]/10 shadow-[0_4px_20px_rgba(20,24,23,0.06)] transition hover:border-[#e85d3f]/40">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#e85d3f]/10 border border-[#e85d3f]/20 text-[#e85d3f] font-mono text-xs font-bold">
              npm
            </div>
            <code className="font-mono text-xs sm:text-sm font-bold text-[#141817] tracking-tight">
              npx moryn init
            </code>
            <button
              onClick={handleCopyCommand}
              className="ml-2 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#f5f2ea] hover:bg-[#ebe7dc] text-[#141817] text-xs font-medium transition cursor-pointer border border-[#141817]/6 active:scale-95"
              title="Copy command to clipboard"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-600" />
                  <span className="text-[11px] font-mono font-semibold text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} className="text-[#737b78]" />
                  <span className="text-[11px] font-mono text-[#57575c]">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Interconnected Architecture Network ── */}
        <div className="relative flex flex-col items-center">

          {/* Central Root Moryn NPM Node */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="relative z-20 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-[#141817]/12 shadow-[0_6px_24px_rgba(20,24,23,0.09)] mb-2"
          >
            <Image
              src="/logo/Moryn-1-1-Light-Transparent.webp"
              alt="Moryn Logo"
              width={28}
              height={28}
              className="w-7 h-7 object-contain shrink-0"
              priority
            />
            <div className="text-left">
              <div className="font-mono font-bold text-xs text-[#141817] tracking-tight flex items-center gap-1.5">
                <span>npx moryn</span>
                <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  CLI Hub
                </span>
              </div>
              <div className="text-[10px] text-[#737b78] font-mono">
                Auto-Skill & Kanban Injection
              </div>
            </div>
          </motion.div>

          {/* Vertical Stem from Moryn into Network */}
          <div className="w-[1.5px] h-8 bg-gradient-to-b from-[#141817]/20 to-[#d9ddd9] z-10" />

          {/* ── Desktop & Tablet Interconnected Node Mesh ── */}
          <div className="relative w-full max-w-[860px] pt-4 pb-2">

            {/* SVG Connector Bus Grid (Desktop) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
              preserveAspectRatio="none"
              viewBox="0 0 860 380"
              fill="none"
            >
              {/* Top Central Drop from Moryn */}
              <line x1="430" y1="0" x2="430" y2="70" stroke="#d9ddd9" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Horizontal Bus connecting Row 1 (centers: x=143, 430, 717, y=70) */}
              <line x1="143" y1="70" x2="717" y2="70" stroke="#d9ddd9" strokeWidth="1.5" />

              {/* Vertical Droppers connecting Row 1 to Row 2 (y=70 to y=265) */}
              <line x1="143" y1="70" x2="143" y2="265" stroke="#d9ddd9" strokeWidth="1.5" />
              <line x1="430" y1="70" x2="430" y2="265" stroke="#d9ddd9" strokeWidth="1.5" />
              <line x1="717" y1="70" x2="717" y2="265" stroke="#d9ddd9" strokeWidth="1.5" />

              {/* Horizontal Bus connecting Row 2 (centers: y=265) */}
              <line x1="143" y1="265" x2="717" y2="265" stroke="#d9ddd9" strokeWidth="1.5" />

              {/* Junction Dots at all intersections */}
              {[
                { x: 143, y: 70 }, { x: 430, y: 70 }, { x: 717, y: 70 },
                { x: 143, y: 265 }, { x: 430, y: 265 }, { x: 717, y: 265 },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="3.5" fill="#fcfbf8" stroke="#e85d3f" strokeWidth="1.5" />
                  <circle cx={pt.x} cy={pt.y} r="1.5" fill="#e85d3f" />
                </g>
              ))}
            </svg>

            {/* Row 1 Nodes (3 AI Agent platforms) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-7 relative z-10 mb-8 md:mb-14">
              {ROW_ONE.map((agent, idx) => {
                const Icon = agent.icon;
                const isHovered = hoveredAgent === agent.id;
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    onMouseEnter={() => setHoveredAgent(agent.id)}
                    onMouseLeave={() => setHoveredAgent(null)}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`bg-white p-5 rounded-2xl border transition-all duration-200 flex flex-col items-center text-center cursor-pointer shadow-xs ${isHovered
                        ? "border-[#e85d3f] shadow-[0_10px_28px_rgba(232,93,63,0.14)]"
                        : "border-[#141817]/8 hover:border-[#141817]/18 hover:shadow-md"
                      }`}
                  >
                    {/* Tool Icon */}
                    <div
                      style={{ backgroundColor: agent.bg, color: agent.color }}
                      className="w-13 h-13 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-105 shadow-2xs"
                    >
                      <Icon size={24} strokeWidth={2.2} />
                    </div>
                    <div className="font-bold text-sm text-[#141817] mb-0.5">
                      {agent.name}
                    </div>
                    <div className="text-[11px] font-medium text-[#737b78] mb-2.5">
                      {agent.category}
                    </div>
                    <div className="w-full pt-2 border-t border-[#141817]/6 flex items-center justify-center">
                      <span className="text-[10px] font-mono text-[#57575c] truncate px-2 py-0.5 rounded bg-[#fcfbf8] border border-[#141817]/6">
                        {agent.protocol}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Row 2 Nodes (3 AI Agent platforms) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-7 relative z-10">
              {ROW_TWO.map((agent, idx) => {
                const Icon = agent.icon;
                const isHovered = hoveredAgent === agent.id;
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + idx * 0.08 }}
                    onMouseEnter={() => setHoveredAgent(agent.id)}
                    onMouseLeave={() => setHoveredAgent(null)}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`bg-white p-5 rounded-2xl border transition-all duration-200 flex flex-col items-center text-center cursor-pointer shadow-xs ${isHovered
                        ? "border-[#e85d3f] shadow-[0_10px_28px_rgba(232,93,63,0.14)]"
                        : "border-[#141817]/8 hover:border-[#141817]/18 hover:shadow-md"
                      }`}
                  >
                    {/* Tool Icon */}
                    <div
                      style={{ backgroundColor: agent.bg, color: agent.color }}
                      className="w-13 h-13 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-105 shadow-2xs"
                    >
                      <Icon size={24} strokeWidth={2.2} />
                    </div>
                    <div className="font-bold text-sm text-[#141817] mb-0.5">
                      {agent.name}
                    </div>
                    <div className="text-[11px] font-medium text-[#737b78] mb-2.5">
                      {agent.category}
                    </div>
                    <div className="w-full pt-2 border-t border-[#141817]/6 flex items-center justify-center">
                      <span className="text-[10px] font-mono text-[#57575c] truncate px-2 py-0.5 rounded bg-[#fcfbf8] border border-[#141817]/6">
                        {agent.protocol}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>

          {/* Connection Status Indicator */}
          <div className="mt-12 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-[#141817]/8 text-xs text-[#57575c] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] font-medium">
              Connected via <span className="text-[#141817] font-semibold">npx moryn init</span> • Automated Skill Injection & Live Kanban Sync
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
