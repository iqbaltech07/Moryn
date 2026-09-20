"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle, useMemo, useId, memo } from "react";
import { createRoot, Root } from "react-dom/client";
import ZoomableDiagram from "../ai/ZoomableDiagram";
import { marked, Renderer } from "marked";
import mermaid from "mermaid";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
  onTocUpdate?: (toc: TocItem[]) => void;
  idPrefix?: string;
}

let mermaidInitialized = false;

function sanitizeMermaidDiagram(code: string): string {
  if (!code) return "";
  let clean = code.trim();

  // Fix broken LLM arrows
  clean = clean.replace(/([A-Za-z0-9_\]\)\}]|")\s+->\s+([A-Za-z0-9_\[\(\{]|")/g, "$1 --> $2");
  clean = clean.replace(/([A-Za-z0-9_\]\)\}]|")\s+->\|(.*?)\|\s+([A-Za-z0-9_\[\(\{]|")/g, "$1 -->|$2| $3");
  clean = clean.replace(/→/g, "-->");

  // Fix collapsed newlines
  clean = clean.replace(/(\]|\)|\}|"|[A-Za-z0-9_])\s+([A-Za-z0-9_]+(\[.*?\]|\(.*?\)|{.*?}|".*?")?\s*-->)/g, "$1\n$2");

  // Fix `-- Klik "Tambah Tugas Baru" -->` into `-->|Klik Tambah Tugas Baru|`
  clean = clean.replace(/--\s*([^-\n>]+?)\s*-->/g, (_match, label) => {
    const safeLabel = label.replace(/["']/g, "").replace(/[\(\)]/g, "").replace(/\s+/g, " ").trim();
    return `-->|${safeLabel}|`;
  });

  // Clean pipe link labels like -->|Laporan & Visualisasi Data (Radar/Line)|
  clean = clean.replace(/\|([^|\n]*?)\|/g, (_match, edgeLabel) => {
    const safeLabel = edgeLabel.replace(/["']/g, "").replace(/[\(\)]/g, "").replace(/\s+/g, " ").trim();
    return `|${safeLabel}|`;
  });

  // Auto-quote flowchart node labels
  const lines = clean.split("\n");
  return lines.map((line, idx) => {
    if (idx === 0 || line.trim().startsWith("%%")) return line;
    line = line.replace(/([A-Za-z0-9_]+)\[(?!["\[(\//])([^\]\n"]+)\]/g, (_m, id, label) => `${id}["${label}"]`);
    line = line.replace(/([A-Za-z0-9_]+)\{(?!["\{])([^}\n"]+)\}/g, (_m, id, label) => `${id}{"${label}"}`);
    line = line.replace(/([A-Za-z0-9_]+)\((?!["\(\[])([^)\n"]+)\)/g, (_m, id, label) => `${id}("${label}")`);
    return line;
  }).join("\n");
}

function preprocessMarkdown(content: string): string {
  if (!content) return "";

  const mermaidKeywords = 'flowchart|graph|sequenceDiagram|gantt|classDiagram|stateDiagram|pie|journey|mindmap|timeline|erDiagram';

  const regex = new RegExp(
    '(```mermaid[\\s\\S]*?```)|(?:^|\\n)([ ]*)(?:(' + mermaidKeywords + ')(?:[ ]+([^\\n]*))?((?:\\n[ ]*(?!#|\\d+\\.|-|\\*|```)[^\\n]+)*))',
    'gi'
  );

  return content.replace(regex, (match, codeBlock, indent, keyword, firstLineRest, subsequentLines) => {
    if (codeBlock) {
      return codeBlock;
    }

    const rawDiagramText = (keyword + (firstLineRest ? ' ' + firstLineRest : '') + (subsequentLines || '')).trim();
    return `\n\n\`\`\`mermaid\n${rawDiagramText}\n\`\`\`\n\n`;
  });
}

function parseMarkdown(
  content: string,
  idPrefix: string
): { html: string; tocItems: TocItem[]; hasMermaid: boolean } {
  if (!content) return { html: "", tocItems: [], hasMermaid: false };

  const cleanContent = preprocessMarkdown(content);

  let headingIdx = 0;
  const tocItems: TocItem[] = [];
  let hasMermaid = false;
  let codeCalled = false;

  const renderer = new Renderer();
  renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
    const id = `${idPrefix}${headingIdx++}`;
    const cleanText = text.replace(/<[^>]*>/g, "").trim();
    const isMainNumberedSection = /^\s*\d+\.\s/.test(cleanText);
    const isStandardMainSection = depth === 2 && (
      isMainNumberedSection ||
      /^(overview|requirements|core features|user flow|architecture|database schema|tech stack|api endpoints|ringkasan|kebutuhan|spesifikasi|alur|arsitektur|skema|teknologi|endpoint)/i.test(cleanText)
    );
    const isPhaseSubSection = /^(fase|phase|fitur|feature)\s*\d+/i.test(cleanText);
    const isSubNumberedSection = /^\s*\d+\.\d+\s/.test(cleanText);

    if (isStandardMainSection) {
      tocItems.push({ id, text: cleanText, level: 2 });
    } else if (depth === 3 && (isPhaseSubSection || isSubNumberedSection)) {
      tocItems.push({ id, text: cleanText, level: 3 });
    }
    return `<h${depth} id="${id}">${text}</h${depth}>\n`;
  };

  const originalCode = renderer.code.bind(renderer);
  renderer.code = function (token) {
    codeCalled = true;
    const lang = token.lang?.trim().toLowerCase();
    const isMermaidLang = lang === "mermaid";

    const text = token.text?.trim() || "";
    const isMermaidContent = !lang && (
      text.startsWith("flowchart") ||
      text.startsWith("graph") ||
      text.startsWith("sequenceDiagram") ||
      text.startsWith("gantt") ||
      text.startsWith("classDiagram") ||
      text.startsWith("stateDiagram") ||
      text.startsWith("pie") ||
      text.startsWith("journey") ||
      text.startsWith("mindmap") ||
      text.startsWith("timeline") ||
      text.startsWith("erDiagram")
    );

    if (isMermaidLang || isMermaidContent) {
      hasMermaid = true;
      let source = sanitizeMermaidDiagram(token.text);

      source = source
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      return `<div class="not-prose">\n    <div class="mermaid" style="color: #ffffff !important; background: #1a1c23;">\n${source}\n    </div>\n</div>`;
    }
    return originalCode(token);
  };

  const originalParagraph = renderer.paragraph.bind(renderer);
  renderer.paragraph = function (token) {
    const text = token.text?.trim() || "";
    const isMermaidContent =
      text.startsWith("flowchart") ||
      text.startsWith("graph") ||
      text.startsWith("sequenceDiagram") ||
      text.startsWith("gantt") ||
      text.startsWith("classDiagram") ||
      text.startsWith("stateDiagram") ||
      text.startsWith("pie") ||
      text.startsWith("journey") ||
      text.startsWith("mindmap") ||
      text.startsWith("timeline") ||
      text.startsWith("erDiagram");

    if (isMermaidContent) {
      hasMermaid = true;
      let source = sanitizeMermaidDiagram(text);

      source = source
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      return `<div class="not-prose">\n    <div class="mermaid">\n${source}\n    </div>\n</div>`;
    }
    return originalParagraph(token);
  };

  const html = marked(cleanContent, { renderer, gfm: true, breaks: true }) as string;

  const looksLikeMermaid =
    content.includes("flowchart") ||
    content.includes("graph ") ||
    content.includes("sequenceDiagram");

  /*
  if (!codeCalled && looksLikeMermaid) {
    console.log(
      "[MarkdownRenderer] WARNING: No code blocks were parsed, but the content contains diagram keywords like 'flowchart'. The raw Markdown received by this component is:\n",
      content
    );
  }
  */

  return { html, tocItems, hasMermaid };
}

let mermaidRenderQueue: Promise<void> = Promise.resolve();

const InnerMarkdownRenderer = forwardRef<HTMLDivElement, MarkdownRendererProps>(
  (
    {
      content,
      className = "prose prose-invert max-w-none prd-content",
      onTocUpdate,
      idPrefix = "heading-",
    },
    forwardedRef
  ) => {
    const divRef = useRef<HTMLDivElement>(null);
    const activeRoots = useRef<Root[]>([]);
    useImperativeHandle(forwardedRef, () => divRef.current!);

    const rawId = useId();
    const wrapperId = useMemo(() => `md-${rawId.replace(/[^a-zA-Z0-9-]/g, "")}`, [rawId]);

    const onTocUpdateRef = useRef(onTocUpdate);
    useEffect(() => {
      onTocUpdateRef.current = onTocUpdate;
    });

    const { html, tocItems, hasMermaid } = useMemo(
      () => parseMarkdown(content, idPrefix),
      [content, idPrefix]
    );

    useEffect(() => {
      onTocUpdateRef.current?.(tocItems);
    }, [tocItems]);

    useEffect(() => {
      if (!hasMermaid || !divRef.current) return;

      if (!mermaidInitialized) {
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          securityLevel: "loose",
          fontFamily: "var(--font-body, var(--font-plus-jakarta-sans), sans-serif)",
          themeVariables: {
            darkMode: true,
            background: "#1a1c23",
            mainBkg: "#232732",
            primaryColor: "#232732",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#525c6e",
            lineColor: "#94a3b8",
            secondaryColor: "#1e222b",
            tertiaryColor: "#1a1d26",
            textColor: "#ffffff",
            nodeBorder: "#525c6e",
            nodeTextColor: "#ffffff",
            edgeLabelBackground: "#1e222b",
            clusterBkg: "#14171f",
            clusterBorder: "#3b4252",
            defaultLinkColor: "#94a3b8",
            titleColor: "#ffffff",
          },
        });
        mermaidInitialized = true;
      }

      let ignore = false;

      mermaidRenderQueue = mermaidRenderQueue.then(() => {
        return new Promise<void>((resolve) => {
          setTimeout(async () => {
            if (ignore || !divRef.current) {
              resolve();
              return;
            }
            try {
              // Pass a CSS selector instead of raw nodes to prevent Mermaid's internal getAttribute errors.
              // Enqueued sequentially to prevent Mermaid internal sandbox race conditions.
              const selector = `#${wrapperId} .mermaid`;
              const foundNodes = divRef.current.querySelectorAll(selector);
              // console.log("[MarkdownRenderer] hasMermaid:", hasMermaid);
              // console.log("[MarkdownRenderer] Selector used:", selector);
              // console.log("[MarkdownRenderer] Elements found in DOM:", foundNodes.length);

              if (foundNodes.length > 0) {
                // Clear any leftover data-processed attributes so Mermaid is forced to re-render them
                foundNodes.forEach(node => {
                  node.removeAttribute('data-processed');
                });

                // console.log("[MarkdownRenderer] DOM before mermaid.run():", Array.from(foundNodes).map(n => n.outerHTML));
                try {
                  await mermaid.run({ querySelector: selector });
                } catch (e) {
                  console.warn("[MarkdownRenderer] mermaid.run non-fatal warning:", e);
                }

                if (!ignore && divRef.current) {
                  foundNodes.forEach((node) => {
                    let svgHtml = node.innerHTML;
                    node.innerHTML = ""; // clear node for React portal
                    const root = createRoot(node);
                    activeRoots.current.push(root);

                    // Post-process svgHtml to guarantee 100% crisp pure white text in all nodes & labels
                    svgHtml = svgHtml
                      .replace(/<foreignObject([^>]*)>([\s\S]*?)<\/foreignObject>/gi, (_match, attrs, content) => {
                        const styledContent = content
                          .replace(/<div([^>]*)style="([^"]*)"/gi, '<div$1style="$2; color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;"')
                          .replace(/<div((?!style)[^>]*)>/gi, '<div$1 style="color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;">')
                          .replace(/<span([^>]*)style="([^"]*)"/gi, '<span$1style="$2; color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;"')
                          .replace(/<span((?!style)[^>]*)>/gi, '<span$1 style="color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;">')
                          .replace(/<p((?!style)[^>]*)>/gi, '<p$1 style="color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;">');
                        return `<foreignObject${attrs}>${styledContent}</foreignObject>`;
                      })
                      .replace(/fill="currentColor"/gi, 'fill="#ffffff"')
                      .replace(/<text\b(?![^>]*\bfill=)([^>]*)>/gi, '<text fill="#ffffff" $1>')
                      .replace(/<tspan\b(?![^>]*\bfill=)([^>]*)>/gi, '<tspan fill="#ffffff" $1>');
                    
                    root.render(
                      <ZoomableDiagram
                        svgHtml={svgHtml}
                        wrapperClassName="mermaid-diagram-viewer relative group w-full h-full min-h-[400px] border border-neutral-800 rounded-xl overflow-hidden bg-[#1a1c23]"
                        contentClassName="w-full flex justify-center items-center cursor-grab active:cursor-grabbing p-4 min-h-[400px]"
                        wrapperStyle={{ width: "100%", height: "100%", minHeight: "400px" }}
                        minScale={0.2}
                        maxScale={6}
                      />
                    );
                  });
                }
              } else {
                // console.log("[MarkdownRenderer] No elements matched the selector, skipping mermaid.run()");
              }
            } catch (err) {
              if (!ignore) {
                // console.error("[MarkdownRenderer] mermaid.run() failed:", err);
              }
            }
            resolve();
          }, 100);
        });
      });

      return () => {
        ignore = true;
        activeRoots.current.forEach((r) => {
          setTimeout(() => r.unmount(), 0);
        });
        activeRoots.current = [];
      };
    }, [html, hasMermaid, wrapperId]);

    return (
      <div
        id={wrapperId}
        ref={divRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
);

InnerMarkdownRenderer.displayName = "MarkdownRenderer";

const MarkdownRenderer = memo(
  InnerMarkdownRenderer,
  (prevProps, nextProps) => {
    return (
      prevProps.content === nextProps.content &&
      prevProps.className === nextProps.className &&
      prevProps.idPrefix === nextProps.idPrefix
    );
  }
);

export default MarkdownRenderer;
