import React from "react";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { AccordionSection, ColorToken } from "../types";
import { renderStructuredAccordionContent } from "../utils/parser";

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
  const colorMap: Record<string, string> = {};
  colorTokens.forEach((ct) => {
    colorMap[ct.token] = ct.hex;
    colorMap[`colors.${ct.token}`] = ct.hex;
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--fg-muted)" }}>
          DESIGN SPECIFICATIONS & GUIDELINES
        </span>
        {projectId && (
          <a
            href={`/api/projects/raw-design?projectId=${projectId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--color-circuit)",
              textDecoration: "none",
            }}
          >
            View Raw .md <ExternalLink size={10} />
          </a>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sections.map((sec) => {
          const isOpen = !!openAccordions[sec.id];
          return (
            <div
              key={sec.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-hairline)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                transition: "border-color 0.15s",
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
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--fg-primary)", margin: 0 }}>
                  {sec.title}
                </h3>
                {isOpen ? (
                  <ChevronDown size={18} style={{ color: "var(--color-signal)" }} />
                ) : (
                  <ChevronRight size={18} style={{ color: "var(--fg-muted)" }} />
                )}
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: "0 20px 20px",
                    borderTop: "1px solid var(--border-hairline)",
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    color: "var(--color-mist)",
                    lineHeight: 1.65,
                    whiteSpace: "pre-line",
                  }}
                >
                  {renderStructuredAccordionContent(sec.content, colorMap)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
