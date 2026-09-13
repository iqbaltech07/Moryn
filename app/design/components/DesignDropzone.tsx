import React from "react";
import { Upload, Sparkles, Layout, Globe, ShieldCheck } from "lucide-react";

interface DesignDropzoneProps {
  isDragging: boolean;
  isUploading: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onApplyTemplate?: (templateId: string) => void;
}

export default function DesignDropzone({
  isDragging,
  isUploading,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileUpload,
  onApplyTemplate,
}: DesignDropzoneProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        background: isDragging ? "rgba(255,182,39,0.06)" : "var(--bg-surface)",
        border: `2px dashed ${isDragging ? "var(--color-signal)" : "var(--border-hairline)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "48px 32px",
        textAlign: "center",
        transition: "all 0.2s ease",
        marginTop: 24,
        boxShadow: isDragging ? "0 0 24px rgba(255,182,39,0.15)" : "none",
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "rgba(255,182,39,0.08)",
          border: "1px solid rgba(255,182,39,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <Upload size={26} style={{ color: "var(--color-signal)" }} />
      </div>

      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, color: "var(--fg-primary)", marginBottom: 8 }}>
        Belum Ada File design.md yang Diunggah
      </h3>

      <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--color-mist)", maxWidth: 560, margin: "0 auto 24px", lineHeight: 1.6 }}>
        Unggah file <code style={{ color: "var(--color-signal)", fontFamily: "var(--font-mono)" }}>design.md</code> atau pilih template desain bawaan agar AI Agent (Antigravity/Cursor/Windsurf) dapat membaca token warna, typography, layout, dan aturan komponen UI secara otomatis.
      </p>

      {/* 🌟 1-Click Template Selection */}
      {onApplyTemplate && (
        <div style={{ maxWidth: 640, margin: "0 auto 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Sparkles size={12} style={{ color: "var(--color-signal)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, color: "var(--color-signal)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Preset Template Desain Bawaan (100% Full Spec)
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => onApplyTemplate("saas-webapp")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
                gap: 6,
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(79, 107, 255, 0.3)",
                background: "rgba(79, 107, 255, 0.06)",
                cursor: isUploading ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 700, color: "var(--fg-primary)" }}>
                  SaaS Web App Design System
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px", background: "rgba(79, 107, 255, 0.2)", color: "#818cf8" }}>
                  FULL PRODUCT
                </span>
              </div>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "10.5px", color: "var(--fg-muted)", lineHeight: 1.3 }}>
                App Shell, Sidebar, TanStack Table, cmdk (⌘K), Toasts & Skeletons.
              </span>
            </button>

            <button
              type="button"
              disabled={isUploading}
              onClick={() => onApplyTemplate("landing-page")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
                gap: 6,
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(255, 182, 39, 0.3)",
                background: "rgba(255, 182, 39, 0.06)",
                cursor: isUploading ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 700, color: "var(--fg-primary)" }}>
                  Landing Page Design System
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px", background: "rgba(255, 182, 39, 0.2)", color: "var(--color-signal)" }}>
                  MARKETING
                </span>
              </div>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "10.5px", color: "var(--fg-muted)", lineHeight: 1.3 }}>
                Hero mockup, Asymmetric Bento Grid, Logo Cloud & Motion tokens.
              </span>
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, borderTop: "1px dashed var(--border-hairline)", paddingTop: 16 }}>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 22px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-signal)",
            background: "var(--color-signal)",
            color: "#ffffff",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: isUploading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px rgba(255,182,39,0.2)",
          }}
        >
          <Upload size={13} /> {isUploading ? "Uploading / Applying..." : "Atau Pilih File design.md Sendiri (.md, .txt)"}
          <input type="file" accept=".md,.txt" onChange={onFileUpload} style={{ display: "none" }} disabled={isUploading} />
        </label>

        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-muted)" }}>
          atau tarik & lepas file ke dalam area kotak di atas
        </span>
      </div>
    </div>
  );
}
