"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Loader2, FileText, ChevronRight } from "lucide-react";
import { useGenerateForm } from "./hooks/useGenerateForm";
import ProgressBar from "./components/ProgressBar";
import Step1Idea from "./components/Step1Idea";
import Step2TechStack from "./components/Step2TechStack";
import SidebarPanel from "./components/SidebarPanel";
import { getDynamicStep3Questions } from "./components/Step3Questions";
import { Step } from "./types";
import { apiClient, ApiError } from "@/lib/utils/apiClient";
import { useUiStore } from "@/stores/useUiStore";
import { UpgradeModal } from "../components/modals";

/* ── Button tokens ── */
const btnPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "9px 20px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-accent)",
  background: "var(--color-accent)",
  color: "#fff",
  fontFamily: "var(--font-mono)",
  fontWeight: 700,
  fontSize: "10px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "opacity 0.15s",
  whiteSpace: "nowrap",
};

const btnOutlined: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "9px 18px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-foreground-secondary)",
  fontFamily: "var(--font-mono)",
  fontWeight: 600,
  fontSize: "10px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "border-color 0.15s, color 0.15s",
  whiteSpace: "nowrap",
};

const btnGhost: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "9px 16px",
  borderRadius: "var(--radius-md)",
  border: "1px solid transparent",
  background: "transparent",
  color: "var(--color-foreground-muted)",
  fontFamily: "var(--font-mono)",
  fontWeight: 600,
  fontSize: "10px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "color 0.15s",
  whiteSpace: "nowrap",
};

/* ── Step metadata ── */
const STEP_LABELS: Record<number, string> = {
  1: "Define Project Concept",
  2: "Tech Stack & Architecture",
  3: "Personalize Project Blueprint",
};

export default function GeneratePage() {
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
    fetchDynamicQuestions,
    setDynamicAnswer,
    resetWizard,
  } = useGenerateForm();

  const { showUpgradeModal, setShowUpgradeModal } = useUiStore();

  const selectedStacksCount = Object.values(form.stacks).filter((v) => v !== "").length;
  const canProceedStep1 = form.appIdea.length >= 20 && form.appName.length >= 2;
  const canProceedStep2 = form.stackMode === "ai" || selectedStacksCount === 4;

  const step3Questions = getDynamicStep3Questions(form, setDynamicAnswer);
  const currentQ = step3Questions.length > 0 ? step3Questions[subStep] : null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await apiClient.projects.create(form);
      resetWizard();
      router.push(`/structure?projectId=${data.projectId}`);
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          router.push("/login");
          return;
        }
        if (
          err.data &&
          typeof err.data === "object" &&
          (err.data as any).error === "LIMIT_REACHED"
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
    <div
      style={{ minHeight: "100vh", background: "var(--color-background)" }}
      className="bg-grid"
    >
      {/* ── Top nav ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          borderBottom: "1px solid var(--color-border-subtle)",
          background: "rgba(252,251,248,0.94)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Left: Logo + breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <Link
            href="/"
            id="gen-back-home"
            style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
          >
            <Image
              src="/logo/Moryn-Light-Mode.webp"
              alt="Moryn"
              width={800}
              height={200}
              style={{ height: "24px", width: "auto" }}
            />
          </Link>

          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginLeft: 16,
              paddingLeft: 16,
              borderLeft: "1px solid var(--color-border-subtle)",
            }}
          >
            <Link
              href="/projects"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--color-foreground-muted)",
                letterSpacing: "0.06em",
                textDecoration: "none",
              }}
            >
              Dashboard
            </Link>
            <ChevronRight size={11} style={{ color: "var(--color-foreground-subtle)" }} />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--color-foreground-muted)",
                letterSpacing: "0.06em",
              }}
            >
              New Project Setup
            </span>
            <ChevronRight size={11} style={{ color: "var(--color-foreground-subtle)" }} />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--color-foreground)",
                letterSpacing: "0.06em",
              }}
            >
              {STEP_LABELS[step]}
            </span>
          </div>
        </div>

        {/* Right: step counter + action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--color-foreground-muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Step {step} / 3
          </span>
        </div>
      </div>

      {/* ── Two-panel grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          minHeight: "100vh",
          paddingTop: 56,
        }}
        className="gen-layout"
      >
        {/* ── LEFT: Main form ── */}
        <div
          style={{
            padding: "40px 48px 80px",
            overflowY: "auto",
          }}
        >
          {/* Progress bar */}
          <ProgressBar step={step} />

          {/* ── Page title ── */}
          {!loading && !questionsLoading && (
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.85rem",
                fontWeight: 800,
                color: "var(--color-foreground)",
                letterSpacing: "-0.025em",
                marginBottom: 28,
                lineHeight: 1.2,
              }}
            >
              {STEP_LABELS[step]}
            </h1>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <Step1Idea
              appName={form.appName}
              appIdea={form.appIdea}
              setAppName={setAppName}
              setAppIdea={setAppIdea}
            />
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <Step2TechStack
              stackMode={form.stackMode}
              stacks={form.stacks}
              designData={form.designData}
              appName={form.appName}
              appIdea={form.appIdea}
              setStackMode={setStackMode}
              setStack={setStack}
              setDesignData={setDesignData}
            />
          )}

          {/* STEP 3 */}
          {step === 3 && !loading && !questionsLoading && currentQ && (
            <div>
              {/* Sub-step progress segments */}
              <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
                {step3Questions.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 2,
                      flex: 1,
                      borderRadius: 1,
                      background:
                        i < subStep
                          ? "var(--color-accent)"
                          : i === subStep
                            ? "var(--color-foreground)"
                            : "var(--color-border-subtle)",
                      transition: "background 0.3s",
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--color-foreground-muted)",
                  marginBottom: 20,
                  letterSpacing: "0.06em",
                }}
              >
                Question {subStep + 1} of {step3Questions.length}
              </div>

              {/* Step badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 10px",
                  borderRadius: "var(--radius-xs)",
                  background: "rgba(47,125,92,0.1)",
                  border: "1px solid rgba(47,125,92,0.2)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--color-success)",
                  marginBottom: 12,
                }}
              >
                03. Personalize
              </div>

              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "var(--color-foreground)",
                  marginBottom: 6,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.3,
                }}
              >
                {currentQ.title}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  color: "var(--color-foreground-muted)",
                  marginBottom: 24,
                  lineHeight: 1.6,
                }}
              >
                {currentQ.subtitle}
              </p>
              {currentQ.render()}
            </div>
          )}

          {/* ── Loading state ── */}
          {(loading || questionsLoading) && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "80px 0",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-accent-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  animation: "spin 0.8s linear infinite",
                }}
              >
                <Loader2 size={22} style={{ color: "var(--color-accent)" }} strokeWidth={2} />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "var(--color-foreground)",
                  marginBottom: 6,
                }}
              >
                {questionsLoading ? "Analyzing your idea…" : "Generating your PRD…"}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  color: "var(--color-foreground-muted)",
                }}
              >
                {questionsLoading
                  ? "AI is preparing tailored questions"
                  : "AI is crafting your personalized document"}
              </p>
            </div>
          )}

          {/* ── Nav buttons ── */}
          {!loading && !questionsLoading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 40,
                paddingTop: 24,
                borderTop: "1px solid var(--color-border-subtle)",
              }}
            >
              {/* Left: Cancel + Back */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  id="btn-cancel"
                  onClick={() => router.push("/projects")}
                  style={btnGhost}
                >
                  Cancel
                </button>

                {step > 1 && (
                  <button
                    id="btn-back"
                    onClick={() => {
                      if (step === 3 && subStep > 0) {
                        setSubStep((s: number) => s - 1);
                        return;
                      }
                      setStep((s: number) => (s - 1) as Step);
                      if (step === 3) setSubStep(0);
                    }}
                    style={btnOutlined}
                  >
                    ← Back
                  </button>
                )}
              </div>

              {/* Right: Save Draft + Continue/Generate */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button id="btn-save-draft" style={btnOutlined} onClick={() => { }}>
                  Save Draft
                </button>

                {step < 3 && (
                  <button
                    id="btn-next"
                    disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                    onClick={async () => {
                      if (step === 2) await fetchDynamicQuestions();
                      setStep((s: number) => (s + 1) as Step);
                    }}
                    style={{
                      ...btnPrimary,
                      opacity:
                        (step === 1 ? !canProceedStep1 : !canProceedStep2) ? 0.35 : 1,
                      cursor:
                        (step === 1 ? !canProceedStep1 : !canProceedStep2)
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    Continue to {step === 1 ? "Tech Stack" : "Personalize"} →
                  </button>
                )}

                {step === 3 && subStep < step3Questions.length - 1 && (
                  <button
                    id="btn-next-q"
                    disabled={!currentQ?.canProceed()}
                    onClick={() => setSubStep((s: number) => s + 1)}
                    style={{
                      ...btnPrimary,
                      opacity: !currentQ?.canProceed() ? 0.35 : 1,
                      cursor: !currentQ?.canProceed() ? "not-allowed" : "pointer",
                    }}
                  >
                    Next Question →
                  </button>
                )}

                {step === 3 && subStep === step3Questions.length - 1 && (
                  <button
                    id="btn-generate"
                    disabled={!currentQ?.canProceed()}
                    onClick={handleGenerate}
                    style={{
                      ...btnPrimary,
                      opacity: !currentQ?.canProceed() ? 0.35 : 1,
                      cursor: !currentQ?.canProceed() ? "not-allowed" : "pointer",
                    }}
                  >
                    <FileText size={12} strokeWidth={2.5} />
                    Generate PRD
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Sticky sidebar panel ── */}
        <SidebarPanel
          step={step}
          currentQuestion={
            step === 3 && currentQ
              ? { title: currentQ.title, subtitle: (currentQ as any).subtitle ?? "" }
              : null
          }
        />
      </div>

      {/* ── Upgrade Modal ── */}
      <UpgradeModal />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder {
          color: var(--color-foreground-subtle);
          font-family: var(--font-body);
        }
        input:focus, textarea:focus {
          border-color: var(--color-accent) !important;
          outline: none;
        }
        select:focus { outline: none; }
        select option { background: var(--color-surface-raised); color: var(--color-foreground); }

        /* Responsive: stack panels on small screens */
        @media (max-width: 900px) {
          .gen-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
