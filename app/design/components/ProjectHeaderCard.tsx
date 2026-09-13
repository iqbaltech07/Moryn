import React from "react";
import { FileText, Upload } from "lucide-react";
import { ProjectDetailData } from "../types";

interface ProjectHeaderCardProps {
  project: ProjectDetailData | null;
  formInputs: Record<string, unknown> & { stacks?: Record<string, string> };
  isUploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProjectHeaderCard({
  project,
  formInputs,
  isUploading,
  onFileUpload,
}: ProjectHeaderCardProps) {
  const btnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    border: "1px solid var(--border-hairline)",
    background: "var(--bg-elevated)",
    color: "var(--fg-secondary)",
    transition: "all 0.15s",
  };

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-hairline)",
        borderRadius: "var(--radius-lg)",
        padding: "28px 32px",
        marginBottom: 28,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 10px",
              borderRadius: "var(--radius-xs)",
              border: "1px solid var(--border-hairline)",
              background: "rgba(255,182,39,0.08)",
              color: "var(--color-signal)",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            <FileText size={11} /> Project Overview & Design Specs
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.8rem",
              fontWeight: 800,
              color: "var(--fg-primary)",
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            {project?.appName}
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-mist)", lineHeight: 1.6, maxWidth: 720 }}>
            {project?.appIdea}
          </p>
        </div>

        <label
          style={{
            ...btnStyle,
            background: isUploading ? "var(--bg-elevated)" : "rgba(79,209,197,0.1)",
            borderColor: "rgba(79,209,197,0.35)",
            color: "var(--color-circuit)",
            cursor: "pointer",
          }}
        >
          <Upload size={12} /> {isUploading ? "Uploading..." : "Re-upload design.md"}
          <input type="file" accept=".md,.txt" onChange={onFileUpload} style={{ display: "none" }} />
        </label>
      </div>

      {formInputs?.stacks && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20, paddingTop: 16, borderTop: "1px dashed var(--border-hairline)" }}>
          {Object.entries(formInputs.stacks).map(([key, val]) =>
            val ? (
              <span
                key={key}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--border-hairline)",
                  background: "var(--bg-elevated)",
                  color: "var(--fg-secondary)",
                }}
              >
                <span style={{ color: "var(--fg-muted)", textTransform: "uppercase" }}>{key}:</span> {val as string}
              </span>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
