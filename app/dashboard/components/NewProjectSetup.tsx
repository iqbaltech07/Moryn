"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
import { useWizardStore } from "@/stores/useWizardStore";
import { apiClient, ApiError } from "@/lib/utils/apiClient";
import { useUiStore } from "@/stores/useUiStore";
import { UpgradeModal } from "@/app/components/modals";
import Step2TechStack from "./setup/Step2TechStack";
import Step3Personalize from "./setup/Step3Personalize";

interface NewProjectSetupProps {
  onBack: () => void;
}

export default function NewProjectSetup({ onBack }: NewProjectSetupProps) {
  const router = useRouter();

  const {
    step,
    setStep,
    subStep,
    setSubStep,
    loading,
    setLoading,
    questionsLoading,
    form,
    setStack,
    setAppName,
    setAppIdea,
    setStackMode,
    setDesignData,
    setDynamicAnswer,
    resetWizard,
  } = useWizardStore();

  const { setShowUpgradeModal } = useUiStore();

  const canProceedStep1 = form.appName.trim().length >= 2 && form.appIdea.trim().length >= 20;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await apiClient.projects.create(form);
      resetWizard();
      router.push(`/structure?projectId=${data.projectId}`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          router.push("/login");
          return;
        }
        if (
          err.data &&
          typeof err.data === "object" &&
          (err.data as Record<string, unknown>).error === "LIMIT_REACHED"
        ) {
          setShowUpgradeModal(true);
          setLoading(false);
          return;
        }
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <UpgradeModal />

      {/* Top Breadcrumbs & Page Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {/* Back arrow button */}
          <button
            onClick={() => {
              if (step > 1) {
                setStep((step - 1) as 1 | 2 | 3);
              } else {
                onBack();
              }
            }}
            className="w-10 h-10 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 shadow-2xs flex items-center justify-center text-neutral-700 transition cursor-pointer shrink-0"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-medium mb-1">
              <button
                onClick={onBack}
                className="text-neutral-400 hover:text-neutral-700 transition text-decoration-none cursor-pointer"
              >
                Overview
              </button>
              <span className="text-neutral-300">/</span>
              <span className="text-[#E05A38] font-semibold">
                New Project Setup
              </span>
            </div>
            {/* Main Header Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Setup Project
            </h1>
          </div>
        </div>

        {/* Wizard Steps Pills */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-neutral-200/80 rounded-2xl shadow-2xs self-start sm:self-auto">
          {/* Step 1 Pill */}
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              step === 1
                ? "bg-[#E05A38] text-white shadow-2xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 1 ? "bg-white/25 text-white" : "bg-neutral-200 text-neutral-600"
              }`}
            >
              1
            </span>
            <span>Concept</span>
          </button>

          <ChevronRight size={14} className="text-neutral-300" />

          {/* Step 2 Pill */}
          <button
            onClick={() => canProceedStep1 && setStep(2)}
            disabled={!canProceedStep1}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              step === 2
                ? "bg-[#E05A38] text-white shadow-2xs cursor-pointer"
                : canProceedStep1
                ? "text-neutral-500 hover:text-neutral-900 cursor-pointer"
                : "text-neutral-300 cursor-not-allowed"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 2 ? "bg-white/25 text-white" : "bg-neutral-200 text-neutral-600"
              }`}
            >
              2
            </span>
            <span>Tech Stack</span>
          </button>

          <ChevronRight size={14} className="text-neutral-300" />

          {/* Step 3 Pill */}
          <button
            onClick={() => {
              if (canProceedStep1) {
                setStep(3);
                // Need to fetch questions if empty
                if (form.dynamicQuestions.length === 0) {
                   useWizardStore.getState().fetchDynamicQuestions();
                }
              }
            }}
            disabled={!canProceedStep1}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              step === 3
                ? "bg-[#E05A38] text-white shadow-2xs cursor-pointer"
                : canProceedStep1
                ? "text-neutral-500 hover:text-neutral-900 cursor-pointer"
                : "text-neutral-300 cursor-not-allowed"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 3 ? "bg-white/25 text-white" : "bg-neutral-200 text-neutral-600"
              }`}
            >
              3
            </span>
            <span>Personalize</span>
          </button>
        </div>
      </div>

      {/* ── STEP 1: DEFINE CONCEPT ── */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-8 bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
              01. Project Details
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mt-2 mb-8">
              Name your project and describe what you want to build. This context helps generate your PRD, system architecture, and roadmap.
            </p>

            <div className="space-y-6">
              {/* Input 1: PROJECT NAME */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold tracking-widest text-neutral-700 uppercase">
                    Project Name
                  </label>
                  <span className="text-[11px] text-neutral-400 font-medium">
                    Required
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Acme Dashboard, EventHub, TaskFlow"
                  value={form.appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] border border-neutral-200 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 focus:bg-white transition"
                />
              </div>

              {/* Input 2: PROJECT DESCRIPTION */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold tracking-widest text-neutral-700 uppercase">
                    What are you building?
                  </label>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {form.appIdea.length} / 500
                  </span>
                </div>
                <textarea
                  rows={5}
                  maxLength={500}
                  placeholder="e.g. A lightweight customer support platform for e-commerce stores that aggregates emails, live chat, and returns into a single shared inbox for support agents."
                  value={form.appIdea}
                  onChange={(e) => setAppIdea(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] border border-neutral-200 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 focus:bg-white transition leading-relaxed resize-none"
                />

                {/* Helpful prompt hints */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500">
                  <span className="font-semibold text-neutral-600 mr-1">Include:</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-neutral-200/80 text-neutral-600">
                    Target audience
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-neutral-200/80 text-neutral-600">
                    Problem &amp; core value
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-neutral-200/80 text-neutral-600">
                    2-3 key features
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-neutral-100">
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => {}}
                  className="px-4 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 font-semibold text-xs transition cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-[#E05A38] hover:bg-[#d04a28] text-white font-semibold text-xs shadow-2xs transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Continue to Tech Stack</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Blueprint Guidelines Card */}
          <div className="lg:col-span-4 bg-[#FAF9F6] border border-neutral-200/80 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center gap-2 text-neutral-800 mb-2">
              <span className="text-[11px] font-bold tracking-widest uppercase">
                WRITING GUIDELINES
              </span>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed pb-4 mb-5 border-b border-neutral-200/70">
              Clear requirements produce more accurate user stories, data schemas, and API routes.
            </p>

            <div className="space-y-4">
              {/* Guideline 1 */}
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={16}
                  className="text-[#E05A38] shrink-0 mt-0.5"
                />
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    Define the core problem
                  </h4>
                  <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                    Describe who experiences the problem and what outcome they achieve with your app.
                  </p>
                </div>
              </div>

              {/* Guideline 2 */}
              <div className="flex items-start gap-3">
                <SlidersHorizontal
                  size={16}
                  className="text-[#E05A38] shrink-0 mt-0.5"
                />
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    Outline primary workflows
                  </h4>
                  <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                    Mention the 2-3 most important actions users will take inside the product.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: TECH STACK ── */}
      {step === 2 && (
        <Step2TechStack
          stackMode={form.stackMode}
          stacks={form.stacks}
          appName={form.appName}
          appIdea={form.appIdea}
          designData={form.designData}
          setStackMode={setStackMode}
          setStack={setStack}
          setDesignData={setDesignData}
        >
          <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs transition cursor-pointer"
            >
              &larr; Back to Concept
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(3);
                if (form.dynamicQuestions.length === 0) {
                  useWizardStore.getState().fetchDynamicQuestions();
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-[#E05A38] hover:bg-[#d04a28] text-white font-semibold text-xs shadow-2xs transition flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to Personalize</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </Step2TechStack>
      )}

      {/* ── STEP 3: PERSONALIZE & GENERATE ── */}
      {step === 3 && (
        <Step3Personalize
          appName={form.appName}
          form={form}
          subStep={subStep}
          setSubStep={setSubStep}
          setDynamicAnswer={setDynamicAnswer}
          onBack={() => setStep(2)}
          onGenerate={handleGenerate}
          loading={loading}
          questionsLoading={questionsLoading}
        />
      )}
    </div>
  );
}
