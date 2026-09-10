"use client";

import Link from "next/link";

export type WorkflowStep = "struktur" | "prd" | "design" | "task";

const STEPS: { id: WorkflowStep; label: string; path: string }[] = [
  { id: "struktur", label: "Structure", path: "/structure" },
  { id: "prd",      label: "PRD",       path: "/preview" },
  { id: "design",   label: "Design",    path: "/detail" },
  { id: "task",     label: "Task",      path: "/task" },
];

export default function StepNavbar({
  currentStep,
  projectId,
}: {
  currentStep: WorkflowStep;
  projectId: string | null;
}) {
  const currentIdx = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {STEPS.map((step, i) => {
        const isDone = i < currentIdx;
        const isActive = step.id === currentStep;
        const href = `${step.path}${projectId ? `?projectId=${projectId}` : ""}`;
        const clickable = !!projectId;

        return (
          <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
            <Link
              href={clickable ? href : "#"}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                pointerEvents: clickable ? "auto" : "none",
                opacity: isActive ? 1 : isDone ? 0.9 : 0.75,
                transition: "all 0.15s ease",
              }}
            >
              {/* Step circle */}
              <div style={{
                width: 18, height: 18,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "9px", fontWeight: 700,
                flexShrink: 0,
                background: isActive ? "var(--color-signal)" : isDone ? "rgba(255,182,39,0.2)" : "transparent",
                color: isActive ? "#ffffff" : isDone ? "var(--color-signal)" : "var(--fg-muted)",
                border: isActive ? "none" : isDone ? "1px solid var(--color-signal)" : "1px solid var(--border-hairline)",
                boxSizing: "border-box",
              }}>
                {isDone ? "✓" : i + 1}
              </div>
              {/* Label */}
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px", fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.06em", textTransform: "uppercase",
                color: isActive ? "var(--fg-primary)" : isDone ? "var(--color-signal)" : "var(--fg-secondary)",
              }}>
                {step.label}
              </span>
            </Link>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div style={{
                width: 24, height: 1, flexShrink: 0,
                background: isDone ? "var(--color-signal)" : "var(--border-hairline)",
                transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
