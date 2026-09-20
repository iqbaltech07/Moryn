"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export type WorkflowStep = "struktur" | "prd" | "design" | "task";

export default function StepNavbar({
  currentStep,
  projectId,
}: {
  currentStep: WorkflowStep;
  projectId: string | null;
}) {
  const { t } = useTranslation();

  const steps: { id: WorkflowStep; label: string; path: string }[] = [
    { id: "struktur", label: t.workflow.stepStructure, path: "/structure" },
    { id: "prd",      label: t.workflow.stepPrd,       path: "/prd" },
    { id: "design",   label: t.workflow.stepDesign,    path: "/design" },
    { id: "task",     label: t.workflow.stepTask,      path: "/task" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        zIndex: 10,
        whiteSpace: "nowrap",
      }}
    >
      {steps.map((step, i) => {
        const isActive = step.id === currentStep;
        const href = `${step.path}${projectId ? `?projectId=${projectId}` : ""}`;
        const clickable = !!projectId;

        return (
          <React.Fragment key={step.id}>
            <Link
              href={clickable ? href : "#"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: isActive ? "3px 13px 3px 4px" : "3px 0",
                borderRadius: "9999px",
                background: isActive ? "rgba(225, 91, 57, 0.08)" : "transparent",
                border: isActive ? "1px solid rgba(225, 91, 57, 0.25)" : "1px solid transparent",
                textDecoration: "none",
                pointerEvents: clickable ? "auto" : "none",
                cursor: clickable ? "pointer" : "default",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive && clickable) {
                  (e.currentTarget as HTMLElement).style.opacity = "0.75";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && clickable) {
                  (e.currentTarget as HTMLElement).style.opacity = "1";
                }
              }}
            >
              {/* Step circle */}
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-body), -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "11px",
                  fontWeight: isActive ? 700 : 600,
                  flexShrink: 0,
                  background: isActive ? "#e15b39" : "#ffffff",
                  color: isActive ? "#ffffff" : "#64748b",
                  border: isActive ? "none" : "1px solid #cbd5e1",
                  boxSizing: "border-box",
                }}
              >
                {i + 1}
              </div>

              {/* Label */}
              <span
                style={{
                  fontFamily: "var(--font-body), -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "11px",
                  fontWeight: isActive ? 700 : 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: isActive ? "#e15b39" : "#64748b",
                  lineHeight: 1,
                }}
              >
                {step.label}
              </span>
            </Link>

            {/* Connecting Step Line */}
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 20,
                  height: 1,
                  background: "#e2e8f0",
                  flexShrink: 0,
                  margin: "0 10px",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
