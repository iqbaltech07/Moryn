"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { FormData } from "../types";

export interface PersonalizeOption {
  label: string;
  badge?: string;
  badgeType?: "recommended" | "neutral";
  desc: string;
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
        label: "Event-Driven Microservices (Kafka / RabbitMQ)",
        badge: "High Scale",
        badgeType: "neutral",
        desc: "Decoupled asynchronous worker nodes processing high-throughput telemetry streams independently.",
      },
      {
        label: "Modular Monolith (Next.js Server Actions + Node)",
        badge: "Recommended for MVP",
        badgeType: "recommended",
        desc: "Unified deployable codebase with domain-driven modular boundaries for lower dev overhead.",
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
    hint: "Determines database index strategy, time-series tables, and cold storage archival.",
    selectionType: "single",
    options: [
      {
        label: "Relational + In-Memory Redis Cache",
        badge: "Recommended",
        badgeType: "recommended",
        desc: "Fast in-memory cache for live telemetry state with PostgreSQL persistence.",
      },
      {
        label: "Dedicated Time-Series Database (TimescaleDB)",
        badge: "High Throughput",
        badgeType: "neutral",
        desc: "Specialized chunks for high-frequency logs and rapid temporal aggregations.",
      },
      {
        label: "Vector Embedded Graph Store",
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
        desc: "Serverless deployments with automated Git preview environments and zero server maintenance.",
      },
      {
        label: "Containerized Kubernetes Cluster (EKS / GKE)",
        badge: "Enterprise",
        badgeType: "neutral",
        desc: "Helm charts and container manifests for deployment into private VPC clouds.",
      },
      {
        label: "Single Docker Compose Instance",
        badge: "Self-Hosted",
        badgeType: "neutral",
        desc: "Portable docker-compose bundle ideal for on-premise developer staging.",
      },
    ],
  },
  {
    id: "observability",
    topicTag: "06 · OBSERVABILITY & TELEMETRY",
    question: (name) =>
      `How should system metrics and errors be collected in ${name}?`,
    hint: "Injects logger middleware and error boundary tracking hooks.",
    selectionType: "single",
    options: [
      {
        label: "OpenTelemetry + Structured JSON Logging",
        badge: "Modern Standard",
        badgeType: "recommended",
        desc: "Vendor-agnostic distributed tracing compatible with Datadog, Grafana, and PostHog.",
      },
      {
        label: "Sentry + Lightweight Console Metrics",
        badge: "Quick Setup",
        badgeType: "neutral",
        desc: "Real-time exception capture and stack traces with minimal latency impact.",
      },
    ],
  },
  {
    id: "compliance_testing",
    topicTag: "07 · TESTING & RELIABILITY",
    question: (name) =>
      `What testing pipeline should be pre-configured for ${name}?`,
    hint: "Generates initial unit tests, end-to-end spec scaffolds, and mock factories.",
    selectionType: "single",
    options: [
      {
        label: "Vitest Unit Tests + Playwright E2E Integration",
        badge: "Comprehensive",
        badgeType: "recommended",
        desc: "Lightning fast unit coverage paired with headless browser end-to-end verification.",
      },
      {
        label: "Contract Testing with Mock Service Worker (MSW)",
        badge: "API Focused",
        badgeType: "neutral",
        desc: "Strict type-safe network mocks for isolated frontend-backend parallel development.",
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
}: Step3PersonalizeProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");

  const totalQuestions = DEFAULT_PERSONALIZE_QUESTIONS.length;
  const currentQ = DEFAULT_PERSONALIZE_QUESTIONS[subStep] || DEFAULT_PERSONALIZE_QUESTIONS[0];

  const currentAnswer = form.dynamicAnswers[currentQ.id];
  const isSelected = (label: string) => {
    if (Array.isArray(currentAnswer)) {
      return currentAnswer.includes(label);
    }
    return currentAnswer === label;
  };

  const hasSelection = Boolean(
    (Array.isArray(currentAnswer) && currentAnswer.length > 0) ||
      (typeof currentAnswer === "string" && currentAnswer.trim().length > 0)
  );

  const handleSelectOption = (label: string) => {
    setDynamicAnswer(currentQ.id, label, currentQ.selectionType);
  };

  const handleAddCustom = () => {
    if (!customText.trim()) return;
    setDynamicAnswer(currentQ.id, customText.trim(), currentQ.selectionType);
    setCustomText("");
    setShowCustomInput(false);
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

  const progressPercent = Math.round(((subStep + 1) / totalQuestions) * 100);

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
        {currentQ.question(appName || "Stratum AI")}
      </h2>

      {/* Hint / Subtitle */}
      <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed mb-6">
        {currentQ.hint}
      </p>

      {/* Select Header */}
      <div className="flex items-center justify-between mb-3.5 pt-2 border-t border-neutral-100">
        <span className="text-[11px] font-bold tracking-widest text-neutral-600 uppercase">
          SELECT PRIMARY PATTERN ({currentQ.selectionType.toUpperCase()} CHOICE)
        </span>
        <span
          className={`text-xs font-medium ${
            hasSelection ? "text-[#E05A38]" : "text-neutral-400"
          }`}
        >
          {hasSelection ? "1 selected" : "0 selected"}
        </span>
      </div>

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
              {/* Radio Indicator */}
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                  selected
                    ? "border-[#E05A38] bg-[#E05A38]"
                    : "border-neutral-300 bg-white"
                }`}
              >
                {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>

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
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {opt.desc}
                </p>
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
            <span>Add your own custom architectural constraint</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF9F6] border border-neutral-200">
            <input
              type="text"
              placeholder="e.g. Must support multi-region failover and HIPAA compliance"
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
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowCustomInput(false)}
              className="px-2 py-1.5 text-neutral-400 hover:text-neutral-700 text-xs cursor-pointer"
            >
              Cancel
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
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2.5 rounded-xl text-neutral-500 hover:text-neutral-800 font-semibold text-xs transition cursor-pointer"
          >
            Skip for now
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
                <span>Next Question</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
