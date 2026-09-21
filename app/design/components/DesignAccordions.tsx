"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ChevronsUpDown,
} from "lucide-react";
import { AccordionSection, ColorToken } from "../types";
import { renderStructuredAccordionContent } from "../utils/parser";
import { useTranslation } from "@/lib/i18n";

interface DesignAccordionsProps {
  projectId: string | null;
  sections: AccordionSection[];
  colorTokens: ColorToken[];
  openAccordions: Record<string, boolean>;
  onToggleAccordion: (id: string) => void;
}

export default function DesignAccordions({
  projectId,
  sections,
  colorTokens,
  openAccordions,
  onToggleAccordion,
}: DesignAccordionsProps) {
  const { t } = useTranslation();
  const [allExpanded, setAllExpanded] = useState(false);

  const colorMap: Record<string, string> = {};
  colorTokens.forEach((ct) => {
    colorMap[ct.token] = ct.hex;
    colorMap[`colors.${ct.token}`] = ct.hex;
  });

  const handleToggleAll = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    sections.forEach((s) => {
      if (openAccordions[s.id] !== nextState) {
        onToggleAccordion(s.id);
      }
    });
  };

  return (
    <section style={{ marginBottom: 48 }}>
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 800,
              color: "var(--fg-primary)",
              margin: 0,
              letterSpacing: "-0.015em",
            }}
          >
            {t.design.specsAndGuidelines}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--fg-muted)",
              marginTop: 4,
              marginBottom: 0,
            }}
          >
            {t.design.specsSubtitle}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={handleToggleAll}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-hairline)",
              background: "var(--bg-surface)",
              color: "var(--fg-secondary)",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <ChevronsUpDown size={13} />
            <span>{allExpanded ? t.design.collapseAll : t.design.expandAll}</span>
          </button>

          {projectId && (
            <a
              href={`/api/projects/raw-design?projectId=${projectId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-hairline)",
                background: "var(--bg-surface)",
                color: "#2563eb",
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <span>{t.design.viewRawMd}</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Accordion List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sections.map((sec, idx) => {
          const isOpen = !!openAccordions[sec.id] || allExpanded;
          const isTypography = sec.id.includes("typography") || sec.title.toLowerCase().includes("typography");

          return (
            <div
              key={sec.id || idx}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-hairline)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                boxShadow: isOpen ? "0 4px 14px -2px rgba(0,0,0,0.05)" : "0 1px 3px rgba(0,0,0,0.03)",
                transition: "box-shadow 0.15s, border-color 0.15s",
              }}
            >
              <button
                onClick={() => onToggleAccordion(sec.id)}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--fg-primary)",
                      margin: 0,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {sec.title}
                  </h3>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--fg-muted)",
                    }}
                  >
                    {isOpen ? "Hide" : "Show"}
                  </span>
                  {isOpen ? (
                    <ChevronDown size={17} style={{ color: "#2563eb" }} />
                  ) : (
                    <ChevronRight size={17} style={{ color: "var(--fg-muted)" }} />
                  )}
                </div>
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: "0 20px 22px",
                    borderTop: "1px solid var(--border-hairline)",
                    background: "rgba(255, 255, 255, 0.01)",
                  }}
                >
                  {/* Live Typography Specimen Preview */}
                  {isTypography && (
                    <div
                      style={{
                        marginTop: 16,
                        marginBottom: 16,
                        padding: 16,
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-hairline)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: 22,
                            fontWeight: 800,
                            color: "var(--fg-primary)",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          Display Font Specimen
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-muted)" }}>
                          Plus Jakarta Sans / Outfit • 800
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--fg-secondary)", lineHeight: 1.5 }}>
                          Body Font — High legibility neutral type with balanced x-height for complex dashboards.
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-muted)" }}>
                          Inter • 400
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <code
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            color: "#2563eb",
                            background: "rgba(37,99,235,0.08)",
                            padding: "3px 8px",
                            borderRadius: 4,
                          }}
                        >
                          const tokens = &#123; accent: &quot;#2563eb&quot;, radius: &quot;8px&quot; &#125;;
                        </code>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-muted)" }}>
                          JetBrains Mono • 500
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Render Structured Content */}
                  {renderStructuredAccordionContent(sec.content, colorMap)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
