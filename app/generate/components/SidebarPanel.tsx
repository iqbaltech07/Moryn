import React from "react";
import { Step } from "../types";
import { Lightbulb, Cpu, Sparkles, ChevronRight } from "lucide-react";

interface SidebarItem {
  text: string;
  highlight?: boolean;
}

interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

interface SidebarConfig {
  icon: React.ReactNode;
  heading: string;
  accent: string;
  sections: SidebarSection[];
}

const SIDEBAR_CONTENT: Record<number, SidebarConfig> = {
  1: {
    icon: <Lightbulb size={12} />,
    heading: "BLUEPRINT GUIDELINES",
    accent: "var(--color-accent)",
    sections: [
      {
        label: "WHAT MAKES A GOOD CONCEPT",
        items: [
          { text: "State the core problem being solved in one sentence" },
          { text: "Name your target user clearly (e.g. freelancers, students)" },
          { text: "Describe the unique value — what's different about your solution?" },
          { text: "Keep the idea focused: one primary use-case is stronger than many", highlight: true },
        ],
      },
      {
        label: "TIPS FOR BETTER RESULTS",
        items: [
          { text: "Mention any key workflow the user will follow" },
          { text: "Include rough scale: personal project, startup, or enterprise" },
          { text: "The more context you give, the richer the PRD output" },
        ],
      },
    ],
  },
  2: {
    icon: <Cpu size={12} />,
    heading: "STACK RECOMMENDATIONS",
    accent: "var(--color-info)",
    sections: [
      {
        label: "ARCHITECTURE PATTERNS",
        items: [
          { text: "Next.js Fullstack is best for web apps needing SSR + API in one codebase", highlight: true },
          { text: "Separate Frontend + Backend works well for teams or complex APIs" },
          { text: "Flutter + Firebase is the fastest path to cross-platform mobile" },
          { text: "Use AI mode if you're unsure — the model picks optimal defaults" },
        ],
      },
      {
        label: "VISUAL DESIGN TIPS",
        items: [
          { text: "Choose a color palette that matches your target audience's expectations" },
          { text: "Dark palettes suit developer tools and SaaS dashboards" },
          { text: "Light palettes work well for consumer apps and marketplaces" },
        ],
      },
    ],
  },
  3: {
    icon: <Sparkles size={12} />,
    heading: "AI ANALYSIS CONTEXT",
    accent: "#10b981",
    sections: [
      {
        label: "WHY THESE QUESTIONS",
        items: [
          { text: "Each answer tailors the PRD to match your specific use case", highlight: true },
          { text: "Operational architecture affects which infra and patterns are recommended" },
          { text: "Monetization strategy shapes the feature priority and data model" },
        ],
      },
      {
        label: "FLAT / FLAT CORE",
        items: [
          { text: "Defining a primary operational pattern helps the AI generate accurate system diagrams" },
          { text: "For Marketing: simple static content with contact forms and CMS integration" },
          { text: "For Hybrid Distributed Node Pipeline: async queue + worker pattern is recommended" },
        ],
      },
    ],
  },
};

export default function SidebarPanel({
  step,
  currentQuestion,
}: {
  step: Step;
  currentQuestion?: { title: string; subtitle: string } | null;
}) {
  const config = SIDEBAR_CONTENT[step] ?? SIDEBAR_CONTENT[1];

  return (
    <aside
      style={{
        position: "sticky",
        top: 56,
        height: "calc(100vh - 56px)",
        overflowY: "auto",
        borderLeft: "1px solid var(--color-border-subtle)",
        background: "var(--color-surface)",
        padding: "28px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* Step 3: show current question context at top */}
      {step === 3 && currentQuestion && (
        <div
          style={{
            padding: "14px 16px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: config.accent,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {config.icon}
            CURRENT QUESTION
          </div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--color-foreground)",
              marginBottom: 4,
              lineHeight: 1.5,
            }}
          >
            {currentQuestion.title}
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              color: "var(--color-foreground-muted)",
              lineHeight: 1.6,
            }}
          >
            {currentQuestion.subtitle}
          </p>
        </div>
      )}

      {/* Main sections */}
      {config.sections.map((section, sIdx) => (
        <div key={sIdx}>
          {/* Section label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 12,
            }}
          >
            {sIdx === 0 && (
              <span
                style={{
                  color: config.accent,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {config.icon}
              </span>
            )}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: sIdx === 0 ? config.accent : "var(--color-foreground-muted)",
              }}
            >
              {sIdx === 0 ? config.heading : section.label}
            </span>
          </div>

          {sIdx > 0 && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-foreground-subtle)",
                marginBottom: 8,
                marginTop: -4,
              }}
            >
              {section.label}
            </div>
          )}

          {/* Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {section.items.map((item, iIdx) => (
              <div
                key={iIdx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: item.highlight ? "8px 10px" : "0",
                  borderRadius: item.highlight ? "var(--radius-sm)" : 0,
                  background: item.highlight
                    ? `${config.accent}10`
                    : "transparent",
                  border: item.highlight
                    ? `1px solid ${config.accent}25`
                    : "none",
                }}
              >
                <ChevronRight
                  size={10}
                  style={{
                    color: item.highlight ? config.accent : "var(--color-foreground-subtle)",
                    marginTop: 3,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11.5px",
                    color: item.highlight
                      ? "var(--color-foreground)"
                      : "var(--color-foreground-secondary)",
                    lineHeight: 1.55,
                    fontWeight: item.highlight ? 500 : 400,
                  }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Divider between sections */}
          {sIdx < config.sections.length - 1 && (
            <div
              style={{
                borderTop: "1px solid var(--color-border-subtle)",
                marginTop: 20,
              }}
            />
          )}
        </div>
      ))}
    </aside>
  );
}
