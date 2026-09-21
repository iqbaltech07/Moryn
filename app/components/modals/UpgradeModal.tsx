"use client";

import { useRouter } from "next/navigation";
import { Sparkles, X, Check, ArrowRight } from "lucide-react";
import { useUiStore } from "@/stores/useUiStore";

const PRO_HIGHLIGHTS = [
  "Export Markdown (.md) & JSON Arsitektur",
  "3 Full Projects per bulan (PRD, Mindmap, Tasks)",
  "20x AI Chat Revision per project (+ Diff Summary)",
  "Multi-Model AI (Gemini 2.5/3.7 & OpenRouter)",
  "High-Quota MCP Agent API untuk IDE (Cursor / Windsurf)",
  "Priority Speed & Zero-Wait Generation Queue",
];

export default function UpgradeModal() {
  const router = useRouter();
  const { showUpgradeModal, setShowUpgradeModal } = useUiStore();

  if (!showUpgradeModal) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(8, 11, 20, 0.85)",
        backdropFilter: "blur(6px)",
        padding: 16,
      }}
      onClick={() => setShowUpgradeModal(false)}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-hairline)",
          borderRadius: "var(--radius-lg)",
          maxWidth: 440,
          width: "100%",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div aria-hidden="true" style={{ height: 2, background: "var(--color-signal)" }} />

        {/* Close Button */}
        <button
          onClick={() => setShowUpgradeModal(false)}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "transparent",
            border: "none",
            color: "var(--fg-muted)",
            cursor: "pointer",
            padding: 4,
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div style={{ padding: "28px 28px 24px" }}>
          {/* Badge Icon */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255, 182, 39, 0.3)",
              background: "rgba(255, 182, 39, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-signal)",
              marginBottom: 16,
            }}
          >
            <Sparkles size={20} />
          </div>

          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--color-signal)",
              marginBottom: 6,
            }}
          >
            Pro Feature Locked
          </div>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              fontWeight: 800,
              color: "var(--fg-primary)",
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            Buka Fitur Pro Moryn
          </h2>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "var(--color-mist)",
              marginBottom: 20,
              lineHeight: 1.6,
            }}
          >
            Fitur ini (termasuk Export Markdown & JSON) khusus untuk pengguna <strong>Pro</strong>. Upgrade paket Anda untuk mendapatkan akses penuh:
          </p>

          {/* Benefits list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 24,
              background: "var(--bg-elevated)",
              padding: "14px 16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-hairline)",
            }}
          >
            {PRO_HIGHLIGHTS.map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Check size={13} strokeWidth={2.5} style={{ color: "var(--color-signal)", flexShrink: 0 }} />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "12px",
                    color: "var(--fg-secondary)",
                    lineHeight: 1.4,
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setShowUpgradeModal(false)}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-strong)",
                background: "transparent",
                color: "var(--fg-secondary)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Nanti Saja
            </button>
            <button
              onClick={() => {
                setShowUpgradeModal(false);
                router.push("/#pricing");
              }}
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-signal)",
                background: "var(--color-signal)",
                color: "#ffffff",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Upgrade Pro <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
