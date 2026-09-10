import React from "react";
import { Step } from "../types";
import { Check } from "lucide-react";

const STEPS = [
  { n: 1 as Step, label: "Your Idea" },
  { n: 2 as Step, label: "Tech Stack" },
  { n: 3 as Step, label: "Personalize" },
];

export default function ProgressBar({ step }: { step: Step }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 32,
        position: "relative",
      }}
    >
      {STEPS.map((s, i) => {
        const isDone = step > s.n;
        const isActive = step === s.n;
        const isPending = step < s.n;

        return (
          <React.Fragment key={s.n}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
                width: 72,
              }}
            >
              {/* Step Circle */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: "12px",
                  transition: "all 0.3s ease",
                  background: isDone
                    ? "var(--color-accent)"
                    : isActive
                    ? "var(--color-foreground)"
                    : "var(--color-surface-raised)",
                  color: isDone
                    ? "#fff"
                    : isActive
                    ? "var(--color-primary-foreground)"
                    : "var(--color-foreground-muted)",
                  border: isPending
                    ? "1px solid var(--color-border)"
                    : "none",
                  boxShadow: isActive
                    ? "0 2px 8px rgba(20,24,23,0.12)"
                    : "none",
                }}
              >
                {isDone ? <Check size={14} strokeWidth={3} /> : s.n}
              </div>

              {/* Step Label */}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  color: isPending
                    ? "var(--color-foreground-subtle)"
                    : "var(--color-foreground)",
                  transition: "color 0.3s",
                }}
              >
                {s.label}
              </span>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  margin: "15px 6px 0",
                  background: step > s.n
                    ? "var(--color-accent)"
                    : "var(--color-border-subtle)",
                  transition: "background 0.5s",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
