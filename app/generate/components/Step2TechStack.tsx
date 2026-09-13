"use client";

import React, { useState } from "react";
import {
  Monitor,
  Server,
  Database,
  Cloud,
  Check,
  ChevronDown,
  Sparkles,
  Zap,
  HardDrive,
  GitFork,
  Palette,
} from "lucide-react";
import { StackCategory, FormData } from "../types";

export interface TechPreset {
  id: string;
  name: string;
  desc: string;
  badges: string[];
  recommended?: boolean;
  stacks: {
    frontend: string;
    backend: string;
    database: string;
    deployment: string;
  };
}

export const CURATED_PRESETS: TechPreset[] = [
  {
    id: "next-postgres",
    name: "Next.js + PostgreSQL",
    desc: "Fullstack App Router, Prisma ORM, and Neon cloud database.",
    badges: ["Recommended", "Fullstack"],
    recommended: true,
    stacks: {
      frontend: "Next.js",
      backend: "Next.js (API Routes)",
      database: "PostgreSQL",
      deployment: "Vercel",
    },
  },
  {
    id: "next-supabase",
    name: "Next.js + Supabase",
    desc: "Instant Auth, realtime subscriptions, and managed pgvector.",
    badges: ["SaaS", "Realtime"],
    stacks: {
      frontend: "Next.js",
      backend: "Next.js (API Routes)",
      database: "Supabase",
      deployment: "Vercel",
    },
  },
  {
    id: "t3-stack",
    name: "T3 Stack",
    desc: "End-to-end type safety with Next.js, tRPC, and Prisma.",
    badges: ["Type-Safe", "tRPC"],
    stacks: {
      frontend: "Next.js",
      backend: "Node.js",
      database: "PostgreSQL",
      deployment: "Vercel",
    },
  },
  {
    id: "fastapi-react",
    name: "FastAPI + React",
    desc: "High-speed Python async endpoints with Vite SPA client.",
    badges: ["Python", "Async"],
    stacks: {
      frontend: "React",
      backend: "Python (FastAPI/Django)",
      database: "PostgreSQL",
      deployment: "Docker",
    },
  },
  {
    id: "mern-stack",
    name: "MERN Stack",
    desc: "Traditional decoupled Node.js/Express with MongoDB documents.",
    badges: ["NoSQL", "Classic"],
    stacks: {
      frontend: "React",
      backend: "Node.js",
      database: "MongoDB",
      deployment: "Railway",
    },
  },
  {
    id: "react-native-expo",
    name: "React Native + Expo",
    desc: "Cross-platform mobile & web architecture with Expo Router.",
    badges: ["Mobile", "Universal"],
    stacks: {
      frontend: "React Native (Expo)",
      backend: "Node.js",
      database: "Supabase",
      deployment: "EAS (Expo)",
    },
  },
];

export const TECH_OPTIONS: Record<StackCategory, string[]> = {
  frontend: [
    "Next.js",
    "React",
    "Vue.js",
    "Svelte",
    "Astro",
    "React Native (Expo)",
    "HTML5 / Vanilla JS",
  ],
  backend: [
    "Next.js (API Routes)",
    "Node.js",
    "Python (FastAPI/Django)",
    "NestJS",
    "Go",
    "None (Client-Side Only)",
  ],
  database: [
    "PostgreSQL",
    "Supabase",
    "MongoDB",
    "MySQL",
    "Redis",
    "SQLite (Offline-First)",
  ],
  deployment: [
    "Vercel",
    "Railway",
    "AWS",
    "Docker",
    "Cloudflare Workers / Pages",
    "EAS (Expo)",
  ],
};

export const COLOR_PALETTES = [
  {
    id: "swiss-grid",
    name: "Swiss Grid",
    sub: "Neutral / Blue",
    swatches: ["#141817", "#737b78", "#2563eb"],
  },
  {
    id: "editorial-tech",
    name: "Editorial Tech",
    sub: "Active Theme",
    swatches: ["#141817", "#f5f2ea", "#e85d3f"],
  },
  {
    id: "amber-signal",
    name: "Amber Signal",
    sub: "Warm / Amber",
    swatches: ["#18181b", "#fef3c7", "#f59e0b"],
  },
  {
    id: "clean-product",
    name: "Clean Product",
    sub: "Slate / Cyan",
    swatches: ["#0f172a", "#f1f5f9", "#0ea5e9"],
  },
  {
    id: "electric-minimal",
    name: "Electric Minimal",
    sub: "Dark / Emerald",
    swatches: ["#09090b", "#27272a", "#10b981"],
  },
];

interface Step2TechStackProps {
  stackMode: FormData["stackMode"];
  stacks: FormData["stacks"];
  designData?: string;
  appName?: string;
  appIdea?: string;
  setStackMode: (mode: FormData["stackMode"]) => void;
  setStack: (category: StackCategory, label: string) => void;
  setDesignData?: (val: string) => void;
}

export default function Step2TechStack({
  stackMode,
  stacks,
  appName = "Stratum AI",
  appIdea = "",
  setStackMode,
  setStack,
  setDesignData,
}: Step2TechStackProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("next-postgres");
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>("editorial-tech");
  const [openDropdown, setOpenDropdown] = useState<StackCategory | null>(null);

  const selectedCount = Object.values(stacks).filter(Boolean).length;

  const handleSelectPreset = (preset: TechPreset) => {
    setSelectedPresetId(preset.id);
    setStack("frontend", preset.stacks.frontend);
    setStack("backend", preset.stacks.backend);
    setStack("database", preset.stacks.database);
    setStack("deployment", preset.stacks.deployment);
  };

  const handleSelectPalette = (palette: (typeof COLOR_PALETTES)[0]) => {
    setSelectedPaletteId(palette.id);
    if (setDesignData) {
      setDesignData(
        JSON.stringify({
          paletteName: palette.name,
          theme: palette.sub,
          swatches: palette.swatches,
        })
      );
    }
  };

  const layerItems: Array<{
    id: StackCategory;
    title: string;
    subtitle: string;
    icon: React.ElementType;
  }> = [
    {
      id: "frontend",
      title: "Frontend",
      subtitle: "UI & TAMPILAN USER",
      icon: Monitor,
    },
    {
      id: "backend",
      title: "Backend",
      subtitle: "LOGIC & API SERVER",
      icon: Server,
    },
    {
      id: "database",
      title: "Database",
      subtitle: "PENYIMPANAN DATA",
      icon: Database,
    },
    {
      id: "deployment",
      title: "Deployment",
      subtitle: "HOSTING & INFRA",
      icon: Cloud,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form Configuration */}
      <div className="lg:col-span-8 bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* Top Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
              02. Tech Stack &amp; Architecture
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mt-1">
              Configure framework foundation, data stores, and design token preset for {appName || "Stratum AI"}.
            </p>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex items-center p-1 bg-[#FAF9F6] border border-neutral-200/80 rounded-xl self-start shrink-0">
            <button
              type="button"
              onClick={() => setStackMode("manual")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                stackMode === "manual"
                  ? "bg-white text-neutral-900 shadow-2xs border border-neutral-200/60"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => {
                setStackMode("ai");
                handleSelectPreset(CURATED_PRESETS[0]);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                stackMode === "ai"
                  ? "bg-white text-[#E05A38] shadow-2xs border border-neutral-200/60"
                  : "text-neutral-500 hover:text-[#E05A38]"
              }`}
            >
              <Sparkles size={13} />
              <span>AI Recommend</span>
            </button>
          </div>
        </div>

        {/* Section 1: Curated Architecture Presets */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11px] font-bold tracking-widest text-neutral-700 uppercase">
              CURATED ARCHITECTURE PRESETS
            </span>
            <span className="text-xs text-neutral-400">
              Select standard profile
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {CURATED_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between min-h-[135px] ${
                    isSelected
                      ? "border-[#E05A38] bg-[#FCFAF8] ring-1 ring-[#E05A38]/30 shadow-2xs"
                      : "border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/50"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-sm font-bold text-neutral-900 leading-snug">
                        {preset.name}
                      </h4>
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-[#E05A38] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-neutral-300 shrink-0 mt-0.5" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed mb-3">
                      {preset.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {preset.badges.map((badge) => {
                      const isRec = badge === "Recommended";
                      return (
                        <span
                          key={badge}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            isRec
                              ? "bg-[#FAF3F0] text-[#E05A38] border border-[#E05A38]/20"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {badge}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: 4-Layer Tech Breakdown */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11px] font-bold tracking-widest text-neutral-700 uppercase">
              4-Layer Tech Breakdown
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              {selectedCount}/4 selected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {layerItems.map((layer) => {
              const Icon = layer.icon;
              const val = stacks[layer.id];
              const isOpen = openDropdown === layer.id;

              return (
                <div
                  key={layer.id}
                  className="p-4 rounded-xl border border-neutral-200/80 bg-white relative"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FAF3F0] border border-[#E05A38]/20 text-[#E05A38] flex items-center justify-center shrink-0">
                      <Icon size={17} strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 leading-none">
                        {layer.title}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase mt-1 leading-none">
                        {layer.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Dropdown Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(isOpen ? null : layer.id)
                      }
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-neutral-200 text-xs font-medium text-neutral-800 hover:bg-neutral-100/50 transition cursor-pointer"
                    >
                      <span className={val ? "text-neutral-900 font-semibold" : "text-neutral-400"}>
                        {val || `Select or type ${layer.title}...`}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-neutral-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-lg z-30 p-1.5 max-h-48 overflow-y-auto">
                        {TECH_OPTIONS[layer.id].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setStack(layer.id, opt);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                              val === opt
                                ? "bg-[#FAF3F0] text-[#E05A38] font-semibold"
                                : "text-neutral-700 hover:bg-neutral-50"
                            }`}
                          >
                            <span>{opt}</span>
                            {val === opt && <Check size={13} strokeWidth={2.5} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Visual Design System Preset */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11px] font-bold tracking-widest text-neutral-700 uppercase">
              VISUAL DESIGN SYSTEM PRESET
            </span>
            <span className="text-xs font-mono text-neutral-400">
              &lt;&gt; tokens.json
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {COLOR_PALETTES.map((pal) => {
              const isSelected = selectedPaletteId === pal.id;

              return (
                <div
                  key={pal.id}
                  onClick={() => handleSelectPalette(pal)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                    isSelected
                      ? "border-[#E05A38] bg-[#FCFAF8] ring-1 ring-[#E05A38]/30 shadow-2xs"
                      : "border-neutral-200/80 bg-white hover:border-neutral-300"
                  }`}
                >
                  {/* Swatches strip */}
                  <div className="flex h-5 rounded-md overflow-hidden mb-2.5 border border-black/5">
                    {pal.swatches.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex-1 h-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <h5 className="text-xs font-bold text-neutral-900 truncate">
                      {pal.name}
                    </h5>
                    {isSelected && (
                      <Check
                        size={12}
                        strokeWidth={3}
                        className="text-[#E05A38] shrink-0"
                      />
                    )}
                  </div>
                  <p
                    className={`text-[10px] mt-0.5 truncate ${
                      isSelected
                        ? "text-[#E05A38] font-medium"
                        : "text-neutral-400"
                    }`}
                  >
                    {isSelected ? "Active Theme" : pal.sub}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Stack Recommendation & Target Platform */}
      <div className="lg:col-span-4 space-y-5">
        {/* Card 1: STACK RECOMMENDATION */}
        <div className="bg-[#FAF9F6] border border-neutral-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-2 text-[#E05A38] mb-2">
            <Zap size={16} strokeWidth={2.2} />
            <span className="text-[11px] font-bold tracking-widest text-neutral-800 uppercase">
              STACK RECOMMENDATION
            </span>
          </div>

          <p className="text-xs text-neutral-500 leading-relaxed mb-4">
            Analyzed requirements for {appName || "Stratum AI"} (
            {appIdea
              ? appIdea.slice(0, 65) + "..."
              : "autonomous telemetry parser & system architecture graphs"}
            ).
          </p>

          {/* Architecture Confidence Box */}
          <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80 mb-5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-neutral-800">
                Architecture Confidence
              </span>
              <span className="font-bold text-[#E05A38]">94%</span>
            </div>
            {/* Progress track */}
            <div className="w-full h-1.5 bg-[#FAF3F0] rounded-full overflow-hidden mb-2.5">
              <div
                className="h-full bg-[#E05A38] rounded-full transition-all"
                style={{ width: "94%" }}
              />
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Next.js + PostgreSQL selected for fast API streaming &amp; typed
              telemetry schema validation.
            </p>
          </div>

          {/* Recommendation Points */}
          <div className="space-y-4 pt-1">
            {/* Strategy 1 */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#FAF3F0] text-[#E05A38] flex items-center justify-center shrink-0 mt-0.5">
                <HardDrive size={13} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  Database Strategy
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                  PostgreSQL partition tables optimized for high-throughput staged
                  log ingestion.
                </p>
              </div>
            </div>

            {/* Strategy 2 */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#FAF3F0] text-[#E05A38] flex items-center justify-center shrink-0 mt-0.5">
                <GitFork size={13} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  Schema Graphing
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                  Prisma schema generator will link system entity nodes with 0
                  runtime overhead.
                </p>
              </div>
            </div>

            {/* Strategy 3 */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#FAF3F0] text-[#E05A38] flex items-center justify-center shrink-0 mt-0.5">
                <Palette size={13} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  Design Cohesion
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                  Editorial Tech pairs warm neutral backgrounds with high
                  contrast data tables.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: TARGET PLATFORM */}
        <div className="bg-[#FAF9F6] border border-neutral-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-widest text-neutral-700 uppercase">
              TARGET PLATFORM
            </span>
            <span className="text-xs font-mono font-bold text-[#E05A38]">
              Node 20+
            </span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Scaffolding will output a production-ready monorepo with strict
            TypeScript and ESLint pre-configured.
          </p>
        </div>
      </div>
    </div>
  );
}
