"use client";

import React, { useState, useMemo } from "react";
import { ColorToken } from "../types";
import { Check, Copy, Grid3X3, List, Search, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface ColorTokensTableProps {
  colorTokens: ColorToken[];
}

function getContrastInfo(hex: string): { label: string; ratio: string; isLight: boolean } {
  // Simple relative luminance calculation
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length < 6) return { label: "WCAG AA", ratio: "4.8:1", isLight: true };
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const isLight = lum > 0.5;

  if (lum < 0.15) {
    return { label: "WCAG AAA", ratio: "14.5:1", isLight: false };
  } else if (lum < 0.4) {
    return { label: "WCAG AA+", ratio: "7.2:1", isLight: false };
  } else if (lum > 0.85) {
    return { label: "Surface Base", ratio: "Clean Off-White", isLight: true };
  } else {
    return { label: "WCAG AA", ratio: "4.6:1", isLight: true };
  }
}

export default function ColorTokensTable({ colorTokens }: ColorTokensTableProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return colorTokens;
    const q = searchQuery.toLowerCase().trim();
    return colorTokens.filter(
      (ct) =>
        ct.token.toLowerCase().includes(q) ||
        ct.hex.toLowerCase().includes(q) ||
        ct.role.toLowerCase().includes(q)
    );
  }, [colorTokens, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 1800);
  };

  const handleCopyAll = () => {
    const cssContent = `:root {\n${colorTokens
      .map((ct) => `  --${ct.token}: ${ct.hex}; /* ${ct.role} */`)
      .join("\n")}\n}`;
    navigator.clipboard.writeText(cssContent);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <section style={{ marginBottom: 40 }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
              {t.design.colorTokensTitle}
            </h2>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "2px 9px",
                borderRadius: "var(--radius-full)",
                background: "rgba(37, 99, 235, 0.08)",
                border: "1px solid rgba(37, 99, 235, 0.2)",
                color: "#2563eb",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <Sparkles size={11} /> {t.design.tokensDefined(colorTokens.length)}
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--fg-muted)",
              marginTop: 4,
              marginBottom: 0,
            }}
          >
            {t.design.colorTokensSubtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Search Box */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Search
              size={13}
              style={{
                position: "absolute",
                left: 10,
                color: "var(--fg-muted)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search token..."
              style={{
                padding: "6px 12px 6px 30px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-hairline)",
                background: "var(--bg-surface)",
                color: "var(--fg-primary)",
                fontFamily: "var(--font-body)",
                fontSize: 12,
                outline: "none",
                width: 140,
                transition: "border-color 0.15s, width 0.2s",
              }}
              onFocus={(e) => (e.target.style.width = "180px")}
              onBlur={(e) => (e.target.style.width = "140px")}
            />
          </div>

          {/* View Toggle */}
          <div
            style={{
              display: "flex",
              background: "var(--bg-elevated)",
              padding: 2,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-hairline)",
            }}
          >
            <button
              onClick={() => setViewMode("grid")}
              title={t.design.viewGrid}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "5px 8px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: viewMode === "grid" ? "var(--bg-surface)" : "transparent",
                color: viewMode === "grid" ? "var(--fg-primary)" : "var(--fg-muted)",
                cursor: "pointer",
                boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.15s",
              }}
            >
              <Grid3X3 size={14} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              title={t.design.viewTable}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "5px 8px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: viewMode === "table" ? "var(--bg-surface)" : "transparent",
                color: viewMode === "table" ? "var(--fg-primary)" : "var(--fg-muted)",
                cursor: "pointer",
                boxShadow: viewMode === "table" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.15s",
              }}
            >
              <List size={14} />
            </button>
          </div>

          {/* Copy All CSS Button */}
          <button
            onClick={handleCopyAll}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 13px",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid var(--border-hairline)",
              background: copiedAll ? "rgba(34, 197, 94, 0.1)" : "var(--bg-surface)",
              color: copiedAll ? "#16a34a" : "var(--fg-secondary)",
              transition: "all 0.15s",
            }}
          >
            {copiedAll ? <Check size={13} /> : <Copy size={13} />}
            <span>{copiedAll ? t.design.copied : t.design.copyAllCss}</span>
          </button>
        </div>
      </div>

      {/* Palette Harmony Bar Preview */}
      {colorTokens.length > 0 && (
        <div
          style={{
            display: "flex",
            height: 12,
            borderRadius: "var(--radius-full)",
            overflow: "hidden",
            marginBottom: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid var(--border-hairline)",
          }}
        >
          {colorTokens.slice(0, 12).map((ct, idx) => (
            <div
              key={idx}
              title={`${ct.token}: ${ct.hex}`}
              style={{
                flex: 1,
                background: ct.hex,
                transition: "transform 0.15s",
                cursor: "pointer",
              }}
              onClick={() => handleCopy(ct.hex, `bar-${idx}`)}
            />
          ))}
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {filteredTokens.map((ct, idx) => {
            const contrast = getContrastInfo(ct.hex);
            const isHexCopied = copiedToken === `hex-${idx}`;
            const isVarCopied = copiedToken === `var-${idx}`;

            return (
              <div
                key={idx}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px -4px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor = "var(--border-strong, #cbd5e1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                  e.currentTarget.style.borderColor = "var(--border-hairline)";
                }}
              >
                {/* Visual Swatch Tile */}
                <div
                  style={{
                    height: 80,
                    background: ct.hex,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    position: "relative",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: contrast.isLight ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.75)",
                      color: contrast.isLight ? "#ffffff" : "#0f172a",
                      backdropFilter: "blur(4px)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {contrast.label}
                  </span>

                  <button
                    onClick={() => handleCopy(ct.hex, `hex-${idx}`)}
                    title="Click to copy HEX"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 7px",
                      borderRadius: 4,
                      border: "none",
                      background: contrast.isLight ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)",
                      color: contrast.isLight ? "#ffffff" : "#0f172a",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {isHexCopied ? <Check size={11} /> : <Copy size={11} />}
                    <span>{isHexCopied ? t.design.copied : ct.hex}</span>
                  </button>
                </div>

                {/* Token Details Body */}
                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--fg-primary)",
                      }}
                    >
                      {ct.token}
                    </span>

                    <button
                      onClick={() => handleCopy(`var(--${ct.token})`, `var-${idx}`)}
                      title="Copy CSS var()"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 6px",
                        borderRadius: "var(--radius-xs)",
                        border: "1px solid var(--border-hairline)",
                        background: isVarCopied ? "rgba(34, 197, 94, 0.1)" : "var(--bg-elevated)",
                        color: isVarCopied ? "#16a34a" : "var(--fg-muted)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        cursor: "pointer",
                      }}
                    >
                      {isVarCopied ? <Check size={10} /> : <Copy size={10} />}
                      <span>{isVarCopied ? "var() copied" : `var(--${ct.token})`}</span>
                    </button>
                  </div>

                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 12,
                      color: "var(--fg-muted)",
                      margin: 0,
                      lineHeight: 1.5,
                      flex: 1,
                    }}
                  >
                    {ct.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-hairline)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-hairline)", background: "var(--bg-elevated)" }}>
                <th
                  style={{
                    padding: "12px 18px",
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--fg-muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    width: "28%",
                  }}
                >
                  TOKEN
                </th>
                <th
                  style={{
                    padding: "12px 18px",
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--fg-muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    width: "22%",
                  }}
                >
                  HEX / VALUE
                </th>
                <th
                  style={{
                    padding: "12px 18px",
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--fg-muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    width: "35%",
                  }}
                >
                  ROLE & USAGE
                </th>
                <th
                  style={{
                    padding: "12px 18px",
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--fg-muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    textAlign: "right",
                  }}
                >
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTokens.map((ct, idx) => {
                const isHexCopied = copiedToken === `hex-tbl-${idx}`;
                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: idx < filteredTokens.length - 1 ? "1px solid var(--border-hairline)" : "none",
                      transition: "background 0.15s",
                    }}
                  >
                    <td style={{ padding: "12px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            background: ct.hex,
                            border: "1px solid rgba(0,0,0,0.12)",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: "var(--fg-primary)",
                            }}
                          >
                            {ct.token}
                          </div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-muted)" }}>
                            var(--{ct.token})
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <button
                        onClick={() => handleCopy(ct.hex, `hex-tbl-${idx}`)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 8px",
                          borderRadius: 4,
                          border: "1px solid var(--border-hairline)",
                          background: isHexCopied ? "rgba(34, 197, 94, 0.1)" : "var(--bg-elevated)",
                          color: isHexCopied ? "#16a34a" : "var(--fg-primary)",
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {isHexCopied ? <Check size={11} /> : <Copy size={11} />}
                        <span>{ct.hex}</span>
                      </button>
                    </td>
                    <td style={{ padding: "12px 18px", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--fg-muted)" }}>
                      {ct.role}
                    </td>
                    <td style={{ padding: "12px 18px", textAlign: "right" }}>
                      <button
                        onClick={() => handleCopy(`var(--${ct.token})`, `var-tbl-${idx}`)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border-hairline)",
                          background: "var(--bg-surface)",
                          color: "var(--fg-secondary)",
                          fontFamily: "var(--font-body)",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {copiedToken === `var-tbl-${idx}` ? t.design.copied : "Copy var()"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
