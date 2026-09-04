"use client";

import { motion } from "framer-motion";
import {
  GitBranch,
  PenTool,
  MessageSquareCode,
  SquareKanban,
  FileText,
  Code2,
  Terminal,
  Workflow,
  Globe,
  Send,
} from "lucide-react";
import { useState } from "react";

interface ToolItem {
  id: string;
  name: string;
  category: string;
  icon: typeof GitBranch;
  color: string;
  bg: string;
}

const ROW_ONE: ToolItem[] = [
  { id: "github", name: "GitHub", category: "Version Control", icon: GitBranch, color: "#24292f", bg: "#f0f2f5" },
  { id: "figma", name: "Figma", category: "UI/UX Design", icon: PenTool, color: "#ea4c89", bg: "#fdf0f5" },
  { id: "slack", name: "Slack", category: "Collaboration", icon: MessageSquareCode, color: "#4a154b", bg: "#f7f1f7" },
  { id: "jira", name: "Jira", category: "Sprint Backlog", icon: SquareKanban, color: "#0052cc", bg: "#edf4fe" },
  { id: "notion", name: "Notion", category: "Docs & Specs", icon: FileText, color: "#141817", bg: "#f5f3ef" },
];

const ROW_TWO: ToolItem[] = [
  { id: "vscode", name: "VS Code", category: "IDE Sync", icon: Code2, color: "#007acc", bg: "#ebf5fb" },
  { id: "cursor", name: "Cursor", category: "AI Coding Agent", icon: Terminal, color: "#e85d3f", bg: "#fef3f0" },
  { id: "linear", name: "Linear", category: "Issue Engine", icon: Workflow, color: "#5e6ad2", bg: "#f1f2fc" },
  { id: "vercel", name: "Vercel", category: "Cloud Deploy", icon: Globe, color: "#000000", bg: "#f4f4f4" },
  { id: "postman", name: "Postman", category: "API Testing", icon: Send, color: "#ff6c37", bg: "#fff3ee" },
];

export default function IntegrationsSection() {
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  return (
    <section id="integrations" className="py-24 px-4 md:px-8 bg-[#fcfbf8] relative overflow-hidden">
      <div className="max-w-[1140px] mx-auto text-center">
        
        {/* Section Header */}
        <div className="max-w-[720px] mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f2ea] border border-[#141817]/6 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#e85d3f] mb-4">
            Integrations
          </div>
          <h2 className="font-serif text-[34px] sm:text-[44px] md:text-[50px] font-bold text-[#141817] tracking-[-0.025em] leading-[1.12] mb-4">
            Connect integrations <br className="hidden sm:inline" />
            you use every day
          </h2>
          <p className="text-base sm:text-lg text-[#57575c] leading-relaxed">
            Moryn acts as the central intelligence layer, seamlessly connecting requirements and architectures across your development toolchain.
          </p>
        </div>

        {/* ── Interconnected Architecture Network ── */}
        <div className="relative flex flex-col items-center">
          
          {/* Central Root Moryn Node */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="relative z-20 p-3 rounded-2xl bg-white border border-[#141817]/10 shadow-[0_4px_24px_rgba(20,24,23,0.08)] mb-2"
          >
            <div className="grid grid-cols-2 gap-1 w-8 h-8">
              <div className="rounded-[4px] bg-[#e85d3f]" />
              <div className="rounded-[4px] bg-[#f59e0b]" />
              <div className="rounded-[4px] bg-[#0d9488]" />
              <div className="rounded-[4px] bg-[#3b82f6]" />
            </div>
          </motion.div>

          {/* Vertical Stem from Moryn into Network */}
          <div className="w-[1.5px] h-8 bg-gradient-to-b from-[#141817]/20 to-[#d9ddd9] z-10" />

          {/* ── Desktop & Tablet Interconnected Node Mesh ── */}
          <div className="relative w-full max-w-[960px] pt-4 pb-2">
            
            {/* SVG Connector Bus Grid (Desktop) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
              preserveAspectRatio="none"
              viewBox="0 0 960 380"
              fill="none"
            >
              {/* Top Central Drop from Moryn */}
              <line x1="480" y1="0" x2="480" y2="70" stroke="#d9ddd9" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Horizontal Bus connecting Row 1 (centers: x=96, 288, 480, 672, 864, y=70) */}
              <line x1="96" y1="70" x2="864" y2="70" stroke="#d9ddd9" strokeWidth="1.5" />

              {/* Vertical Droppers connecting Row 1 to Row 2 (y=70 to y=270) */}
              <line x1="96" y1="70" x2="96" y2="270" stroke="#d9ddd9" strokeWidth="1.5" />
              <line x1="288" y1="70" x2="288" y2="270" stroke="#d9ddd9" strokeWidth="1.5" />
              <line x1="480" y1="70" x2="480" y2="270" stroke="#d9ddd9" strokeWidth="1.5" />
              <line x1="672" y1="70" x2="672" y2="270" stroke="#d9ddd9" strokeWidth="1.5" />
              <line x1="864" y1="70" x2="864" y2="270" stroke="#d9ddd9" strokeWidth="1.5" />

              {/* Horizontal Bus connecting Row 2 (centers: y=270) */}
              <line x1="96" y1="270" x2="864" y2="270" stroke="#d9ddd9" strokeWidth="1.5" />

              {/* Junction Dots at all intersections */}
              {[
                { x: 96, y: 70 }, { x: 288, y: 70 }, { x: 480, y: 70 }, { x: 672, y: 70 }, { x: 864, y: 70 },
                { x: 96, y: 270 }, { x: 288, y: 270 }, { x: 480, y: 270 }, { x: 672, y: 270 }, { x: 864, y: 270 },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="3.5" fill="#fcfbf8" stroke="#e85d3f" strokeWidth="1.5" />
                  <circle cx={pt.x} cy={pt.y} r="1.5" fill="#e85d3f" />
                </g>
              ))}
            </svg>

            {/* Row 1 Nodes (5 items) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 relative z-10 mb-8 md:mb-14">
              {ROW_ONE.map((tool, idx) => {
                const Icon = tool.icon;
                const isHovered = hoveredTool === tool.id;
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    onMouseEnter={() => setHoveredTool(tool.id)}
                    onMouseLeave={() => setHoveredTool(null)}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`bg-white p-4 rounded-2xl border transition-all duration-200 flex flex-col items-center text-center cursor-pointer shadow-xs ${
                      isHovered
                        ? "border-[#e85d3f] shadow-[0_8px_24px_rgba(232,93,63,0.14)]"
                        : "border-[#141817]/8 hover:border-[#141817]/18 hover:shadow-md"
                    }`}
                  >
                    {/* Tool Icon */}
                    <div
                      style={{ backgroundColor: tool.bg, color: tool.color }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-2.5 transition-transform duration-200 group-hover:scale-105 shadow-2xs"
                    >
                      <Icon size={22} strokeWidth={2.2} />
                    </div>
                    <div className="font-semibold text-xs text-[#141817] mb-0.5">
                      {tool.name}
                    </div>
                    <div className="text-[10px] font-medium text-[#737b78] truncate w-full">
                      {tool.category}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Row 2 Nodes (5 items) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 relative z-10">
              {ROW_TWO.map((tool, idx) => {
                const Icon = tool.icon;
                const isHovered = hoveredTool === tool.id;
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.25 + idx * 0.05 }}
                    onMouseEnter={() => setHoveredTool(tool.id)}
                    onMouseLeave={() => setHoveredTool(null)}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`bg-white p-4 rounded-2xl border transition-all duration-200 flex flex-col items-center text-center cursor-pointer shadow-xs ${
                      isHovered
                        ? "border-[#e85d3f] shadow-[0_8px_24px_rgba(232,93,63,0.14)]"
                        : "border-[#141817]/8 hover:border-[#141817]/18 hover:shadow-md"
                    }`}
                  >
                    {/* Tool Icon */}
                    <div
                      style={{ backgroundColor: tool.bg, color: tool.color }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-2.5 transition-transform duration-200 group-hover:scale-105 shadow-2xs"
                    >
                      <Icon size={22} strokeWidth={2.2} />
                    </div>
                    <div className="font-semibold text-xs text-[#141817] mb-0.5">
                      {tool.name}
                    </div>
                    <div className="text-[10px] font-medium text-[#737b78] truncate w-full">
                      {tool.category}
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>

          {/* Connection Status Indicator */}
          <div className="mt-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#141817]/8 text-xs text-[#57575c] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
            <span className="font-mono text-[11px]">10 Interconnected Toolchain Nodes</span>
          </div>

        </div>

      </div>
    </section>
  );
}
