"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Monitor,
  Server,
  Database,
  Cloud,
  Check,
  ChevronDown,
  Loader2,
  Sparkles,
  RefreshCw,
  Bot,
  AlertCircle,
  Palette,
  Layers,
} from "lucide-react";
import { StackCategory, FormData } from "./types";
import { apiClient } from "@/lib/utils/apiClient";

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
  children?: React.ReactNode;
}

export interface AiRecommendationData {
  stacks: {
    frontend: string;
    backend: string;
    database: string;
    deployment: string;
  };
  paletteId: string;
  paletteName?: string;
  designStyle?: string;
  badge: string;
  reasoning: string;
  designReasoning?: string;
  modelUsed?: string;
}

export default function Step2TechStack({
  stackMode,
  stacks,
  appName = "your project",
  appIdea = "",
  setStackMode,
  setStack,
  setDesignData,
  children,
}: Step2TechStackProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("next-postgres");
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>("editorial-tech");
  const [openDropdown, setOpenDropdown] = useState<StackCategory | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<AiRecommendationData | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const selectedCount = Object.values(stacks).filter(Boolean).length;

  const handleSelectPalette = useCallback(
    (palette: (typeof COLOR_PALETTES)[0]) => {
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
    },
    [setDesignData]
  );

  const handleSelectPreset = useCallback(
    (preset: TechPreset) => {
      setSelectedPresetId(preset.id);
      setStack("frontend", preset.stacks.frontend);
      setStack("backend", preset.stacks.backend);
      setStack("database", preset.stacks.database);
      setStack("deployment", preset.stacks.deployment);
    },
    [setStack]
  );

  const handleFetchAiRecommendation = useCallback(async () => {
    if (!appIdea || appIdea.trim().length < 5) {
      setAiError("Mohon lengkapi deskripsi ide proyek di Langkah 1 agar AI dapat merekomendasikan tech stack.");
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const res = await apiClient.generate.recommendStack({
        appName: appName || "Unnamed Project",
        appIdea: appIdea.trim(),
      });

      if (res && res.success && res.recommendation) {
        const rec = res.recommendation as AiRecommendationData;
        setAiRecommendation(rec);

        if (rec.stacks) {
          if (rec.stacks.frontend) setStack("frontend", rec.stacks.frontend);
          if (rec.stacks.backend) setStack("backend", rec.stacks.backend);
          if (rec.stacks.database) setStack("database", rec.stacks.database);
          if (rec.stacks.deployment) setStack("deployment", rec.stacks.deployment);
        }

        if (rec.paletteId) {
          const matched = COLOR_PALETTES.find((p) => p.id === rec.paletteId);
          if (matched) {
            handleSelectPalette(matched);
          }
        }

        const matchingPreset = CURATED_PRESETS.find(
          (p) =>
            p.stacks.frontend === rec.stacks.frontend &&
            p.stacks.backend === rec.stacks.backend &&
            p.stacks.database === rec.stacks.database
        );
        if (matchingPreset) {
          setSelectedPresetId(matchingPreset.id);
        } else {
          setSelectedPresetId("custom-ai");
        }
      }
    } catch (err: unknown) {
      console.error("AI recommendation failed:", err);
      setAiError("Gagal memuat rekomendasi AI. Anda dapat mencoba lagi atau memilih tech stack secara manual.");
    } finally {
      setAiLoading(false);
    }
  }, [appIdea, appName, setStack, handleSelectPalette]);

  useEffect(() => {
    if (stackMode === "ai" && !aiRecommendation && !aiLoading && appIdea && appIdea.trim().length >= 5) {
      handleFetchAiRecommendation();
    }
  }, [stackMode, aiRecommendation, aiLoading, appIdea, handleFetchAiRecommendation]);

  const layerItems: Array<{
    id: StackCategory;
    title: string;
    subtitle: string;
    icon: React.ElementType;
  }> = [
    {
      id: "frontend",
      title: "Frontend",
      subtitle: "Web & UI Framework",
      icon: Monitor,
    },
    {
      id: "backend",
      title: "Backend",
      subtitle: "API & Server Runtime",
      icon: Server,
    },
    {
      id: "database",
      title: "Database",
      subtitle: "Data Storage & ORM",
      icon: Database,
    },
    {
      id: "deployment",
      title: "Deployment",
      subtitle: "Hosting & Infrastructure",
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
              Choose the frameworks, database, and design theme for {appName || "your project"}.
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
                if (!aiRecommendation && !aiLoading) {
                  handleFetchAiRecommendation();
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                stackMode === "ai"
                  ? "bg-white text-[#E05A38] shadow-2xs border border-neutral-200/60"
                  : "text-neutral-500 hover:text-[#E05A38]"
              }`}
            >
              {aiLoading ? (
                <Loader2 size={12} className="animate-spin text-[#E05A38]" />
              ) : (
                <Sparkles size={12} className={stackMode === "ai" ? "text-[#E05A38]" : "text-neutral-400"} />
              )}
              <span>AI Recommended</span>
            </button>
          </div>
        </div>

        {/* AI Recommendation Highlight Card (when AI Mode is Active) */}
        {stackMode === "ai" && (
          <div className="mb-8">
            {aiLoading && (
              <div className="p-5 rounded-2xl border border-orange-200/80 bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-white flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-[#E05A38]/10 border border-[#E05A38]/20 flex items-center justify-center shrink-0 text-[#E05A38]">
                  <Loader2 size={20} className="animate-spin" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">
                      Analyzing Project with OpenRouter AI...
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-[#E05A38] font-medium">
                      Developer Engine
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5 truncate">
                    Selecting optimal frameworks, runtime, and database for {appName || "your project"}.
                  </p>
                </div>
              </div>
            )}

            {aiError && !aiLoading && (
              <div className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} className="text-rose-600 shrink-0" />
                  <p className="text-xs text-rose-800">{aiError}</p>
                </div>
                <button
                  type="button"
                  onClick={handleFetchAiRecommendation}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition cursor-pointer self-start sm:self-auto shrink-0"
                >
                  Retry Analysis
                </button>
              </div>
            )}

            {aiRecommendation && !aiLoading && (
              <div className="p-5 sm:p-6 rounded-2xl border border-[#E05A38]/30 bg-gradient-to-br from-[#FCFAF8] via-white to-[#FAF8F5] ring-1 ring-[#E05A38]/15 shadow-2xs">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-orange-100/70">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E05A38] text-white flex items-center justify-center shadow-xs shrink-0">
                      <Bot size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-neutral-900">
                          AI Recommendation: {aiRecommendation.badge}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-neutral-200/80 text-neutral-600 font-medium">
                          OpenRouter
                        </span>
                        {aiRecommendation.modelUsed && (
                          <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
                            ({aiRecommendation.modelUsed.split("/").pop()})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Matched specifically to your project requirements, user persona, and target visual style.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFetchAiRecommendation}
                    disabled={aiLoading}
                    className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200/80 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={aiLoading ? "animate-spin" : ""} />
                    <span>Re-analyze</span>
                  </button>
                </div>

                {/* Dual Pillars: Tech Stack & Design System */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                  {/* Pillar 1: Architecture Stack */}
                  <div className="p-4 rounded-xl bg-white border border-neutral-200/70 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-md bg-orange-100/80 text-[#E05A38] flex items-center justify-center">
                          <Layers size={13} />
                        </div>
                        <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                          1. Architecture Stack
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed italic mb-3">
                        &ldquo;{aiRecommendation.reasoning}&rdquo;
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-100 text-xs">
                      <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200/50">
                        <span className="text-[10px] text-neutral-400 uppercase font-semibold">Frontend</span>
                        <p className="font-semibold text-neutral-900 mt-0.5 truncate">{aiRecommendation.stacks.frontend}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200/50">
                        <span className="text-[10px] text-neutral-400 uppercase font-semibold">Backend</span>
                        <p className="font-semibold text-neutral-900 mt-0.5 truncate">{aiRecommendation.stacks.backend}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200/50">
                        <span className="text-[10px] text-neutral-400 uppercase font-semibold">Database</span>
                        <p className="font-semibold text-neutral-900 mt-0.5 truncate">{aiRecommendation.stacks.database}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200/50">
                        <span className="text-[10px] text-neutral-400 uppercase font-semibold">Deployment</span>
                        <p className="font-semibold text-neutral-900 mt-0.5 truncate">{aiRecommendation.stacks.deployment}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pillar 2: Design System & Visual Palette */}
                  <div className="p-4 rounded-xl bg-white border border-neutral-200/70 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-orange-100/80 text-[#E05A38] flex items-center justify-center">
                            <Palette size={13} />
                          </div>
                          <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                            2. Design &amp; Palette
                          </span>
                        </div>
                        {aiRecommendation.designStyle && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200/50 text-[#E05A38] font-semibold">
                            {aiRecommendation.designStyle}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed italic mb-3">
                        &ldquo;{aiRecommendation.designReasoning || "Palet ini dipilih untuk menghadirkan kontras harmonis, keterbacaan tinggi, dan kenyamanan visual maksimal."}&rdquo;
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200/50 pt-3 border-t border-neutral-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-neutral-900">
                          {aiRecommendation.paletteName || (COLOR_PALETTES.find(p => p.id === aiRecommendation.paletteId)?.name ?? "Editorial Tech")}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">
                          {COLOR_PALETTES.find(p => p.id === aiRecommendation.paletteId)?.sub ?? "Active Theme"}
                        </span>
                      </div>
                      {/* Live Swatches Strip */}
                      <div className="flex h-5 rounded-md overflow-hidden border border-black/10 gap-0.5">
                        {(COLOR_PALETTES.find(p => p.id === aiRecommendation.paletteId)?.swatches ?? ["#141817", "#f5f2ea", "#e85d3f"]).map((color, idx) => (
                          <div
                            key={idx}
                            className="flex-1 h-full relative"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 1: Curated Architecture Presets */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11px] font-bold tracking-widest text-neutral-700 uppercase">
              Popular Stack Presets
            </span>
            <span className="text-xs text-neutral-400">
              Pre-configured templates
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
              Technology Layers
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              {selectedCount} of 4 configured
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
              Design Theme &amp; Palette
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              Applied to UI specifications
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

        {children}
      </div>

      {/* Right Column: Tech Stack Guidelines */}
      <div className="lg:col-span-4 space-y-5">
        {/* Card 1: TECH STACK GUIDELINES */}
        <div className="bg-[#FAF9F6] border border-neutral-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-2 text-neutral-800 mb-2">
            <span className="text-[11px] font-bold tracking-widest uppercase">
              TECH STACK GUIDELINES
            </span>
          </div>

          <p className="text-xs text-neutral-500 leading-relaxed pb-4 mb-5 border-b border-neutral-200/70">
            Recommendations to help you pick the right architecture for your project goals.
          </p>

          <div className="space-y-4">
            {/* Guide 1: SaaS & Web Apps */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#FAF3F0] text-[#E05A38] flex items-center justify-center shrink-0 mt-0.5">
                <Monitor size={13} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  SaaS &amp; Web Apps
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                  Choose <strong className="font-semibold text-neutral-800">Next.js + PostgreSQL</strong> for SaaS, dashboards, and apps that need structured relational data and strong SEO.
                </p>
              </div>
            </div>

            {/* Guide 2: Fast MVPs */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#FAF3F0] text-[#E05A38] flex items-center justify-center shrink-0 mt-0.5">
                <Database size={13} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  Fast MVPs &amp; Realtime
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                  Choose <strong className="font-semibold text-neutral-800">Next.js + Supabase</strong> if you want ready-to-use authentication, realtime data sync, and instant database APIs.
                </p>
              </div>
            </div>

            {/* Guide 3: AI & Python */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#FAF3F0] text-[#E05A38] flex items-center justify-center shrink-0 mt-0.5">
                <Server size={13} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  AI &amp; Data Services
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                  Choose <strong className="font-semibold text-neutral-800">FastAPI + React</strong> if you plan to build Python-based AI agents, model endpoints, or heavy data pipelines.
                </p>
              </div>
            </div>

            {/* Guide 4: Mobile */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#FAF3F0] text-[#E05A38] flex items-center justify-center shrink-0 mt-0.5">
                <Cloud size={13} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  Mobile &amp; Multi-platform
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                  Choose <strong className="font-semibold text-neutral-800">React Native + Expo</strong> if your primary target is an iOS &amp; Android app with a shared codebase.
                </p>
              </div>
            </div>
          </div>

          {/* Quick recommendation callout */}
          <div className="mt-5 p-3.5 rounded-xl bg-white border border-neutral-200/80">
            <h5 className="text-[11px] font-bold text-neutral-900 mb-1">
              Unsure what to pick?
            </h5>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Start with <span className="text-[#E05A38] font-semibold">Next.js + PostgreSQL</span>. It is the most versatile and production-tested foundation for modern software products.
            </p>
          </div>
        </div>

        {/* Card 2: DESIGN & PALETTE GUIDELINES */}
        <div className="bg-[#FAF9F6] border border-neutral-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-2 text-neutral-800 mb-2">
            <span className="text-[11px] font-bold tracking-widest uppercase">
              DESIGN &amp; PALETTE GUIDELINES
            </span>
          </div>

          <p className="text-xs text-neutral-500 leading-relaxed pb-4 mb-5 border-b border-neutral-200/70">
            Select a design system theme that reflects your product persona and target audience.
          </p>

          <div className="space-y-4">
            {/* Palette 1: Editorial Tech */}
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1 shrink-0 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#141817]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#f5f2ea] border border-neutral-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#e85d3f]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  Editorial Tech (Amber-Rust)
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                  Best for <strong className="font-semibold text-neutral-800">SaaS, Knowledge &amp; Content</strong>. Warm off-white surfaces with high-impact editorial rust accents.
                </p>
              </div>
            </div>

            {/* Palette 2: Clean Product */}
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1 shrink-0 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0f172a]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#f1f5f9] border border-neutral-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  Clean Product (Slate/Cyan)
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                  Best for <strong className="font-semibold text-neutral-800">B2B SaaS, Health &amp; Education</strong>. Ultra-clean slate canvas, high accessibility, and friendly cyan focus.
                </p>
              </div>
            </div>

            {/* Palette 3: Swiss Grid */}
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1 shrink-0 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#141817]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#737b78]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  Swiss Grid (Neutral/Blue)
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                  Best for <strong className="font-semibold text-neutral-800">Enterprise, Fintech &amp; DevTools</strong>. Structured grid hierarchy, trusted royal blue, and zero visual noise.
                </p>
              </div>
            </div>

            {/* Palette 4: Electric Minimal */}
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1 shrink-0 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#09090b]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27272a]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  Electric Minimal (Dark/Emerald)
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                  Best for <strong className="font-semibold text-neutral-800">AI Agents, Web3 &amp; Consoles</strong>. Deep obsidian dark canvas with vivid emerald focus.
                </p>
              </div>
            </div>

            {/* Palette 5: Amber Signal */}
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1 shrink-0 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#18181b]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#fef3c7] border border-neutral-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  Amber Signal (Warm Amber)
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                  Best for <strong className="font-semibold text-neutral-800">Operations, Realtime &amp; Tracking</strong>. Energetic amber highlights critical status and pending tasks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Customization Note */}
        <div className="bg-[#FAF9F6] border border-neutral-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold tracking-widest text-neutral-700 uppercase">
              Need Fine Tuning?
            </span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Even with AI Recommended, you can freely change individual layers or select another design theme palette below.
          </p>
        </div>
      </div>
    </div>
  );
}
