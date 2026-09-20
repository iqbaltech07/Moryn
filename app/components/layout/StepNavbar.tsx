"use client";

import Link from "next/link";

export type WorkflowStep = "struktur" | "prd" | "design" | "task";

const STEPS: { id: WorkflowStep; label: string; path: string }[] = [
  { id: "struktur", label: "Structure", path: "/structure" },
  { id: "prd",      label: "PRD",       path: "/prd" },
  { id: "design",   label: "Design",    path: "/design" },
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
    <div
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 4,
        zIndex: 10,
        whiteSpace: "nowrap",
      }}
    >
      {STEPS.map((step, i) => {
        const isDone = i < currentIdx;
        const isActive = step.id === currentStep;
        const href = `${step.path}${projectId ? `?projectId=${projectId}` : ""}`;
        const clickable = !!projectId;

        return (
          <Link
            key={step.id}
            href={clickable ? href : "#"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: isActive ? "5px 13px 5px 7px" : "5px 9px",
              borderRadius: "9999px",
              background: isActive ? "#e15b39" : "transparent",
              textDecoration: "none",
              pointerEvents: clickable ? "auto" : "none",
              transition: "all 0.15s ease",
            }}
          >
            {/* Step circle */}
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                fontWeight: 700,
                flexShrink: 0,
                background: isActive ? "#ffffff" : "transparent",
                color: isActive ? "#e15b39" : isDone ? "#e15b39" : "#6b7280",
                border: isActive
                  ? "none"
                  : isDone
                  ? "1.5px solid #e15b39"
                  : "1.5px solid #9ca3af",
                boxSizing: "border-box",
              }}
            >
              {i + 1}
            </div>

            {/* Label */}
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                fontWeight: isActive ? 700 : 600,
                letterSpacing: "-0.01em",
                color: isActive ? "#ffffff" : isDone ? "var(--fg-primary, #111827)" : "#6b7280",
              }}
            >
              {step.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
