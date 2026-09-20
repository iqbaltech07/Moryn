"use client";

import React from "react";
import { FileText, Upload, ExternalLink, Palette, Layers } from "lucide-react";
import { ProjectDetailData } from "../types";
import { PaletteInfo } from "../utils/parser";
import { useTranslation } from "@/lib/i18n";

interface ProjectHeaderCardProps {
  project: ProjectDetailData | null;
  formInputs: Record<string, unknown> & { stacks?: Record<string, string> };
  isUploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  paletteInfo?: PaletteInfo | null;
}

export default function ProjectHeaderCard({
  project,
  formInputs,
  isUploading,
  onFileUpload,
  paletteInfo,
}: ProjectHeaderCardProps) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-hairline)",
        borderRadius: "var(--radius-lg)",
        padding: "28px 32px",
        marginBottom: 32,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div style={{ flex: "1 1 500px" }}>
          {/* Eyebrow badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "4px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(225, 91, 57, 0.2)",
              background: "rgba(225, 91, 57, 0.06)",
              color: "#e15b39",
              fontFamily: "var(--font-body)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#e15b39",
                boxShadow: "0 0 8px rgba(225, 91, 57, 0.6)",
              }}
            />
            <FileText size={12} strokeWidth={2.2} />
            <span>Project Overview & Design Specs</span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              fontWeight: 800,
              color: "var(--fg-primary)",
              marginBottom: 8,
              letterSpacing: "-0.025em",
              lineHeight: 1.2,
            }}
          >
            {project?.appName || "Project Workspace"}
          </h1>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--fg-muted)",
              lineHeight: 1.6,
              maxWidth: 760,
              marginBottom: 0,
            }}
          >
            {project?.appIdea || "No project description provided."}
          </p>
        </div>

        {/* Action Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {project?.id && (
            <a
              href={`/api/projects/raw-design?projectId=${project.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-hairline)",
                background: "var(--bg-elevated)",
                color: "var(--fg-secondary)",
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <ExternalLink size={12} />
              <span>{t.design.viewRawMd}</span>
            </a>
          )}

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(37, 99, 235, 0.3)",
              background: isUploading ? "var(--bg-elevated)" : "rgba(37, 99, 235, 0.08)",
              color: isUploading ? "var(--fg-muted)" : "#2563eb",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 600,
              cursor: isUploading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            <Upload size={12} />
            <span>{isUploading ? t.design.uploading : t.design.reuploadDesign}</span>
            <input
              type="file"
              accept=".md,.txt"
              onChange={onFileUpload}
              disabled={isUploading}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      {/* Palette & Tech Stack Information Strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
          marginTop: 22,
          paddingTop: 18,
          borderTop: "1px solid var(--border-hairline)",
        }}
      >
        {/* Active Palette Preview */}
        {paletteInfo && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-hairline)",
            }}
          >
            <Palette size={12} style={{ color: "var(--fg-muted)" }} />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--fg-primary)",
              }}
            >
              {paletteInfo.paletteName}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: 2 }}>
              {paletteInfo.swatches.map((sw, sIdx) => (
                <span
                  key={sIdx}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: sw,
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                  title={sw}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack Pills */}
        {formInputs?.stacks && Object.keys(formInputs.stacks).length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "var(--font-body)",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--fg-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <Layers size={11} /> Stack:
            </span>
            {Object.entries(formInputs.stacks).map(([key, val]) =>
              val ? (
                <span
                  key={key}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    fontWeight: 500,
                    padding: "3px 9px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-hairline)",
                    background: "var(--bg-elevated)",
                    color: "var(--fg-secondary)",
                  }}
                >
                  <span style={{ color: "var(--fg-muted)", textTransform: "capitalize" }}>{key}: </span>
                  <strong style={{ color: "var(--fg-primary)", fontWeight: 600 }}>{val as string}</strong>
                </span>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}
