import React from "react";
import { ColorToken } from "../types";

interface ColorTokensTableProps {
  colorTokens: ColorToken[];
}

export default function ColorTokensTable({ colorTokens }: ColorTokensTableProps) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--fg-muted)" }}>
          COLOR TOKENS
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-circuit)" }}>
          {colorTokens.length} Tokens Defined
        </span>
      </div>

      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-hairline)", background: "rgba(255,255,255,0.02)" }}>
              <th style={{ padding: "12px 18px", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>TOKEN</th>
              <th style={{ padding: "12px 18px", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>HEX</th>
              <th style={{ padding: "12px 18px", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>ROLE</th>
            </tr>
          </thead>
          <tbody>
            {colorTokens.map((ct, idx) => (
              <tr key={idx} style={{ borderBottom: idx < colorTokens.length - 1 ? "1px solid var(--border-hairline)" : "none" }}>
                <td style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      background: ct.hex,
                      border: "1px solid rgba(255,255,255,0.15)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--fg-primary)" }}>
                    {ct.token}
                  </span>
                </td>
                <td style={{ padding: "12px 18px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-signal)" }}>
                  {ct.hex}
                </td>
                <td style={{ padding: "12px 18px", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-mist)" }}>
                  {ct.role}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
