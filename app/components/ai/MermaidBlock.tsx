"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { AlertTriangle } from "lucide-react";
import ZoomableDiagram from "./ZoomableDiagram";

interface MermaidBlockProps {
  chart: string;
}

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const uniqueId = useId().replace(/:/g, "_");

  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      try {
        setLoading(true);
        setError(null);
        const { default: mermaid } = await import("mermaid");

        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "inherit",
          themeVariables: {
            darkMode: true,
            background: "#0f172a",
            primaryColor: "#6366f1",
            primaryTextColor: "#f8fafc",
            primaryBorderColor: "#818cf8",
            lineColor: "#94a3b8",
            secondaryColor: "#a855f7",
            tertiaryColor: "#1e293b",
          },
        });

        function sanitizeChart(text: string): string {
          let clean = text.trim();
          clean = clean.replace(/([A-Za-z0-9_\]\)\}]|")\s+->\s+([A-Za-z0-9_\[\(\{]|")/g, "$1 --> $2");
          clean = clean.replace(/([A-Za-z0-9_\]\)\}]|")\s+->\|(.*?)\|\s+([A-Za-z0-9_\[\(\{]|")/g, "$1 -->|$2| $3");
          clean = clean.replace(/→/g, "-->");
          // Convert `-- label with quotes -->` into safe `-->|label|`
          clean = clean.replace(/--\s*([^-\n>]+?)\s*-->/g, (_m, label) => {
            const safeLabel = label.replace(/["']/g, "").replace(/[\(\)]/g, "").replace(/\s+/g, " ").trim();
            return `-->|${safeLabel}|`;
          });
          clean = clean.replace(/\|([^|\n]*?)\|/g, (_m, label) => `|${label.replace(/["']/g, "").replace(/[\(\)]/g, "").replace(/\s+/g, " ").trim()}|`);
          const lines = clean.split("\n");
          return lines.map((line, idx) => {
            if (idx === 0 || line.trim().startsWith("%%")) return line;
            line = line.replace(/([A-Za-z0-9_]+)\[(?!["\[(\/\/])([^\]\n"]+)\]/g, (_m, id, label) => `${id}["${label}"]`);
            line = line.replace(/([A-Za-z0-9_]+)\{(?!["\{])([^}\n"]+)\}/g, (_m, id, label) => `${id}{"${label}"}`);
            line = line.replace(/([A-Za-z0-9_]+)\((?!["\(\[])([^)\n"]+)\)/g, (_m, id, label) => `${id}("${label}")`);
            return line;
          }).join("\n");
        }

        const cleanChart = sanitizeChart(chart);
        const id = `mermaid_${uniqueId}_${Math.floor(Math.random() * 10000)}`;
        const { svg } = await mermaid.render(id, cleanChart);

        if (isMounted) {
          setSvgContent(svg);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn("Mermaid render error:", err);
          setError(err.message || "Failed to render Mermaid diagram.");
          setLoading(false);
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart, uniqueId]);

  if (error) {
    return (
      <div className="my-4 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-amber-200">
        <div className="flex items-center gap-2 mb-2 font-semibold text-xs text-amber-400">
          <AlertTriangle className="w-4 h-4" />
          <span>Diagram Render Warning</span>
        </div>
        <p className="text-xs text-amber-300/80 mb-3 font-mono">{error}</p>
        <pre className="text-[11px] font-mono bg-[#121318]/80 p-3 rounded-lg border border-slate-800 text-slate-300 overflow-x-auto">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div className="group relative my-5 rounded-xl border border-indigo-500/20 bg-slate-950/80 shadow-2xl overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center p-8 text-xs text-indigo-300 gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
          <span>Rendering diagram...</span>
        </div>
      ) : (
        <ZoomableDiagram
          svgHtml={svgContent || ""}
          containerRef={containerRef}
          minScale={0.3}
          maxScale={4}
        />
      )}
    </div>
  );
};
