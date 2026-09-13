"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { FormData } from "./types";

export interface PersonalizeOption {
  label: string;
  badge?: string;
  badgeType?: "recommended" | "neutral";
  desc?: string;
}

export interface PersonalizeQuestion {
  id: string;
  topicTag: string;
  question: (appName: string) => string;
  hint: string;
  selectionType: "single" | "multiple";
  options: PersonalizeOption[];
}

export const DEFAULT_PERSONALIZE_QUESTIONS: PersonalizeQuestion[] = [
  {
    id: "arch_topology",
    topicTag: "01 · ARCHITECTURE TOPOLOGY",
    question: (name) =>
      `What is the primary operational architecture pattern for ${name}'s telemetry ingestion?`,
    hint: "Moryn uses this to structure your initial PRD data models, queue topology, and service boundaries.",
    selectionType: "single",
    options: [
      {
        label: "Modular Monolith (Next.js Server Actions + Node)",
        badge: "Recommended for MVP",
        badgeType: "recommended",
        desc: "Unified deployable codebase with domain-driven modular boundaries for lower dev overhead.",
      },
      {
        label: "Event-Driven Microservices (Kafka / RabbitMQ)",
        badge: "High Scale",
        badgeType: "neutral",
        desc: "Decoupled asynchronous worker nodes processing high-throughput telemetry streams independently.",
      },
      {
        label: "Serverless Edge Functions (Vercel Edge + Redis Queues)",
        badge: "Low Ops",
        badgeType: "neutral",
        desc: "Low-latency regional ingress with stateless burst workers parsing telemetry buffers.",
      },
      {
        label: "Hybrid Distributed Node Pipeline",
        badge: "Advanced",
        badgeType: "neutral",
        desc: "Edge proxies for fast handshakes paired with persistent compute nodes for heavy graph synthesis.",
      },
    ],
  },
  {
    id: "data_persistence",
    topicTag: "02 · DATA PERSISTENCE & CACHING",
    question: (name) =>
      `How should ${name} handle real-time streaming state and temporal queries?`,
    hint: "Pilih satu atau lebih strategi penyimpanan data yang akan diintegrasikan dalam PRD.",
    selectionType: "multiple",
    options: [
      {
        label: "Relational PostgreSQL Persistence",
        badge: "Core DB",
        badgeType: "recommended",
        desc: "Primary structured relational database for accounts, entities, and transactions.",
      },
      {
        label: "In-Memory Redis Cache & Pub/Sub",
        badge: "Recommended",
        badgeType: "recommended",
        desc: "Fast in-memory cache for live telemetry state and session tokens.",
      },
      {
        label: "Dedicated Time-Series Storage (TimescaleDB / InfluxDB)",
        badge: "High Throughput",
        badgeType: "neutral",
        desc: "Specialized chunks for high-frequency logs and rapid temporal aggregations.",
      },
      {
        label: "Vector Embedded Store (pgvector / Pinecone)",
        badge: "AI Native",
        badgeType: "neutral",
        desc: "Vector embeddings stored alongside relational entity links for deep semantic queries.",
      },
    ],
  },
  {
    id: "auth_access",
    topicTag: "03 · AUTHENTICATION & ACCESS CONTROL",
    question: (name) =>
      `What tenancy and role authorization model is required for ${name}?`,
    hint: "Shapes the Prisma schema foreign keys and session validation middleware.",
    selectionType: "single",
    options: [
      {
        label: "Multi-tenant Workspace with RBAC",
        badge: "Recommended for SaaS",
        badgeType: "recommended",
        desc: "Workspace organizations with Owner, Admin, and Developer permission tiers.",
      },
      {
        label: "Single User Personal Account",
        badge: "Simple",
        badgeType: "neutral",
        desc: "Streamlined individual developer account with personal API key authentication.",
      },
      {
        label: "Enterprise SSO & SCIM Directory Sync",
        badge: "Enterprise",
        badgeType: "neutral",
        desc: "SAML 2.0 / Okta enterprise integration with granular audit trails.",
      },
    ],
  },
  {
    id: "api_style",
    topicTag: "04 · API CONTRACT & INTERFACE",
    question: (name) =>
      `Which API protocol will clients use to communicate with ${name}?`,
    hint: "Sets OpenAPI contract generation and client SDK template scaffolds.",
    selectionType: "single",
    options: [
      {
        label: "RESTful JSON + Server-Sent Events (SSE)",
        badge: "Standard",
        badgeType: "recommended",
        desc: "Standard HTTP endpoints with unidirectional SSE streams for real-time telemetry updates.",
      },
      {
        label: "Full Duplex WebSockets",
        badge: "Bidirectional",
        badgeType: "neutral",
        desc: "Persistent low-latency bidirectional socket connections for live control loops.",
      },
      {
        label: "GraphQL API with Subscriptions",
        badge: "Flexible Schema",
        badgeType: "neutral",
        desc: "Client-specified queries with subscription channels for graph mutation tracking.",
      },
    ],
  },
  {
    id: "deployment_target",
    topicTag: "05 · INFRASTRUCTURE & CI/CD",
    question: (name) =>
      `What is the primary infrastructure target for deploying ${name}?`,
    hint: "Configures Dockerfiles, GitHub Actions workflows, and environmental profiles.",
    selectionType: "single",
    options: [
      {
        label: "Managed Cloud (Vercel / Railway / Neon)",
        badge: "Zero DevOps",
        badgeType: "recommended",
        desc: "Push-to-deploy workflow with automatic edge network provisioning and preview URLs.",
      },
      {
        label: "Containerized Orchestration (Docker / Kubernetes / ECS)",
        badge: "Portability",
        badgeType: "neutral",
        desc: "Multi-stage Docker builds with reproducible runtime manifests for self-hosted clouds.",
      },
      {
        label: "Serverless Micro-VMs (Cloudflare Workers / Fly.io)",
        badge: "Global Edge",
        badgeType: "neutral",
        desc: "Sub-millisecond cold starts across 300+ edge points with geo-distributed routing.",
      },
    ],
  },
];

interface Step3PersonalizeProps {
  appName?: string;
  form: FormData;
  subStep: number;
  setSubStep: (val: number | ((prev: number) => number)) => void;
  setDynamicAnswer: (
    key: string,
    value: string | string[],
    type: "single" | "multiple"
  ) => void;
  onBack: () => void;
  onGenerate: () => void;
  loading: boolean;
  questionsLoading?: boolean;
}

export default function Step3Personalize({
  appName = "Stratum AI",
  form,
  subStep,
  setSubStep,
  setDynamicAnswer,
  onBack,
  onGenerate,
  loading,
  questionsLoading = false,
}: Step3PersonalizeProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");

  const hasDynamicQuestions = Boolean(form.dynamicQuestions && form.dynamicQuestions.length > 0);

  // Normalize questions from AI dynamic questions or default fallback
  const normalizedQuestions = hasDynamicQuestions
    ? form.dynamicQuestions.map((q, idx) => ({
        id: q.key,
        topicTag: `0${idx + 1} · ${q.key.replace(/([A-Z])/g, " $1").toUpperCase()}`,
        question: q.title,
        hint: q.subtitle,
        selectionType: (q.type === "multiple" ? "multiple" : "single") as "single" | "multiple",
        options: q.options.map((opt, oIdx) => {
          const isStr = typeof opt === "string";
          const optObj = !isStr && typeof opt === "object" && opt !== null ? (opt as Record<string, unknown>) : null;
          const label = isStr ? opt : String(optObj?.label || opt);
          const desc = isStr ? "" : String(optObj?.desc || "");
          const badge = isStr ? (oIdx === 0 ? "Recommended" : undefined) : optObj?.badge ? String(optObj.badge) : undefined;
          return {
            label,
            desc,
            badge,
            badgeType: oIdx === 0 ? ("recommended" as const) : ("neutral" as const),
          };
        }),
      }))
    : DEFAULT_PERSONALIZE_QUESTIONS.map((q) => ({
        id: q.id,
        topicTag: q.topicTag,
        question: q.question(appName || "your project"),
        hint: q.hint,
        selectionType: q.selectionType,
        options: q.options,
      }));

  const totalQuestions = normalizedQuestions.length;
  const currentQ = normalizedQuestions[subStep] || normalizedQuestions[0];
  const isMultiple = currentQ?.selectionType === "multiple";

  const rawAnswer = form.dynamicAnswers[currentQ?.id];
  const selectedArr = Array.isArray(rawAnswer)
    ? rawAnswer
    : typeof rawAnswer === "string" && rawAnswer
    ? [rawAnswer]
    : [];

  const isSelected = (label: string) => {
    if (isMultiple) {
      return selectedArr.includes(label);
    }
    return rawAnswer === label;
  };

  const selectedCount = isMultiple ? selectedArr.length : rawAnswer ? 1 : 0;
  const hasSelection = selectedCount > 0;

  const handleSelectOption = (label: string) => {
    setDynamicAnswer(currentQ.id, label, currentQ.selectionType);
  };

  const handleAddCustom = () => {
    const trimmed = customText.trim();
    if (!trimmed) return;
    setDynamicAnswer(currentQ.id, trimmed, currentQ.selectionType);
    setCustomText("");
    setShowCustomInput(false);
  };

  const customMultipleAnswers = isMultiple
    ? selectedArr.filter((item) => !currentQ.options.some((opt) => opt.label === item))
    : [];

  const handleRemoveCustomAnswer = (tag: string) => {
    setDynamicAnswer(currentQ.id, tag, "multiple");
  };

  const handleNext = () => {
    if (subStep < totalQuestions - 1) {
      setSubStep(subStep + 1);
      setShowCustomInput(false);
    } else {
      onGenerate();
    }
  };

  const handlePrev = () => {
    if (subStep > 0) {
      setSubStep(subStep - 1);
      setShowCustomInput(false);
    } else {
      onBack();
    }
  };

  const progressPercent = Math.round(((subStep + 1) / Math.max(totalQuestions, 1)) * 100);

  // Loading Screen while AI generates clarifying questions
  if (questionsLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white border border-neutral-200/80 rounded-2xl p-8 sm:p-14 shadow-[0_2px_12px_rgba(0,0,0,0.02)] text-center">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center mx-auto mb-4 text-[#E05A38]">
          <Loader2 size={24} className="animate-spin" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3F0] text-[#E05A38] text-[11px] font-mono font-bold tracking-wider mb-2">
          <Sparkles size={13} />
          <span>OPENROUTER AI SYNTHESIS</span>
        </div>
        <h3 className="text-xl font-bold text-neutral-900 tracking-tight mb-2">
          Menyusun Pertanyaan Personalisasi Blueprint...
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed">
          AI sedang menganalisis ide proyek <strong className="text-neutral-800">{appName || "Anda"}</strong> dan tech stack terpilih untuk merumuskan pertanyaan arsitektur yang terkalibrasi (single &amp; multiple choice).
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-9 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {/* Top AI Banner */}
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#FAF9F6] border border-neutral-200/80 mb-7 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-[#E05A38] font-bold tracking-wider">
          <Sparkles size={14} />
          <span>AI CONTEXT SYNTHESIZER</span>
        </div>
        <span className="text-neutral-300">•</span>
        <span className="text-neutral-400 uppercase tracking-widest text-[11px]">
          TARGETING:
        </span>
        <span className="font-bold text-neutral-900">{appName || "Stratum AI"}</span>
      </div>

      {/* Progress header & bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-[11px] font-bold tracking-widest text-[#E05A38] uppercase">
            QUESTION {subStep + 1} OF {totalQuestions}
          </span>
          <span className="text-neutral-400 font-medium">{progressPercent}% completed</span>
        </div>
        <div className="w-full h-1 bg-[#F5F2EA] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E05A38] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Topic Tag */}
      <div className="inline-block px-2.5 py-1 rounded-md bg-[#FAF9F6] border border-neutral-200/60 text-[10px] font-mono font-bold tracking-widest text-neutral-600 uppercase mb-3">
        {currentQ.topicTag}
      </div>

      {/* Main Question Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight leading-snug mb-2">
        {currentQ.question}
      </h2>

      {/* Hint / Subtitle */}
      <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed mb-6">
        {currentQ.hint}
      </p>

      {/* Select Header: Clearly indicate Single vs Multiple choice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pt-2 border-t border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-widest text-neutral-600 uppercase">
            {isMultiple ? "MULTIPLE CHOICE" : "SINGLE CHOICE"}
          </span>
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
              isMultiple
                ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                : "bg-orange-50 text-[#E05A38] border border-orange-200/60"
            }`}
          >
            {isMultiple ? "Bisa pilih lebih dari satu jawaban" : "Pilih salah satu jawaban utama"}
          </span>
        </div>
        <span
          className={`text-xs font-semibold ${
            hasSelection ? "text-[#E05A38]" : "text-neutral-400"
          }`}
        >
          {selectedCount} selected
        </span>
      </div>

      {/* Custom Multiple Choice Selected Badges */}
      {isMultiple && customMultipleAnswers.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-4 p-3 bg-neutral-50 border border-neutral-200/70 rounded-xl">
          <span className="text-[11px] text-neutral-500 font-medium">Jawaban Kustom:</span>
          {customMultipleAnswers.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-[#E05A38] border border-orange-200/60 text-xs font-medium"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveCustomAnswer(tag)}
                className="hover:text-red-700 cursor-pointer"
                title="Hapus pilihan kustom"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Options List */}
      <div className="space-y-3 mb-5">
        {currentQ.options.map((opt) => {
          const selected = isSelected(opt.label);

          return (
            <div
              key={opt.label}
              onClick={() => handleSelectOption(opt.label)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 text-left ${
                selected
                  ? "border-[#E05A38] bg-[#FCFAF8] ring-1 ring-[#E05A38]/30 shadow-2xs"
                  : "border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/50"
              }`}
            >
              {/* Indicator: Checkbox for Multiple, Radio for Single */}
              {isMultiple ? (
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                    selected
                      ? "border-[#E05A38] bg-[#E05A38] text-white shadow-2xs"
                      : "border-neutral-300 bg-white"
                  }`}
                >
                  {selected && <Check size={11} strokeWidth={3} />}
                </div>
              ) : (
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                    selected
                      ? "border-[#E05A38] bg-[#E05A38]"
                      : "border-neutral-300 bg-white"
                  }`}
                >
                  {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              )}

              {/* Text & Badges */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug">
                    {opt.label}
                  </h4>
                  {opt.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        opt.badgeType === "recommended"
                          ? "bg-[#FAF3F0] text-[#E05A38] border border-[#E05A38]/20"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {opt.badge}
                    </span>
                  )}
                </div>
                {opt.desc && (
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {opt.desc}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Constraint */}
      <div className="mb-8">
        {!showCustomInput ? (
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E05A38] hover:text-[#c44728] transition cursor-pointer"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>
              {isMultiple
                ? "Tambah opsi atau batasan kustom tambahan"
                : "Tulis opsi atau batasan arsitektur kustom sendiri"}
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF9F6] border border-neutral-200">
            <input
              type="text"
              placeholder={
                isMultiple
                  ? "Contoh: Integrasi WhatsApp Gateway dan webhook Telegram"
                  : "Contoh: Menggunakan arsitektur offline-first dengan sinkronisasi periodik"
              }
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustom();
                }
              }}
              className="flex-1 px-3 py-1.5 bg-transparent text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddCustom}
              className="px-3 py-1.5 rounded-lg bg-[#E05A38] text-white text-xs font-semibold hover:bg-[#d04a28] cursor-pointer shrink-0"
            >
              Tambah
            </button>
            <button
              type="button"
              onClick={() => setShowCustomInput(false)}
              className="px-2 py-1.5 text-neutral-400 hover:text-neutral-700 text-xs cursor-pointer"
            >
              Batal
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation Actions */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-neutral-100">
        <button
          type="button"
          onClick={handlePrev}
          className="px-5 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>Sebelumnya</span>
        </button>

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2.5 rounded-xl text-neutral-500 hover:text-neutral-800 font-semibold text-xs transition cursor-pointer"
          >
            Lewati pertanyaan
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-[#E05A38] hover:bg-[#d04a28] text-white font-semibold text-xs shadow-2xs transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Generating Blueprint...</span>
              </>
            ) : subStep === totalQuestions - 1 ? (
              <>
                <Sparkles size={14} />
                <span>Generate Blueprint</span>
              </>
            ) : (
              <>
                <span>Pertanyaan Selanjutnya</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
