"use client";

import { useEffect, useState, useRef } from "react";
import { X, FileText } from "lucide-react";
import MarkdownRenderer, { TocItem } from "../shared/MarkdownRenderer";
import { PRD_TEMPLATE } from "./examplePrdTemplate";

export default function ExamplePrdModal({ onClose }: { onClose: () => void }) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeTocId, setActiveTocId] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  /* Scroll spy */
  useEffect(() => {
    const container = contentRef.current;
    if (!container || toc.length === 0) return;
    const onScroll = () => {
      const scrollTop = container.scrollTop;
      const containerRect = container.getBoundingClientRect();
      let active = toc[0].id;
      for (const item of toc) {
        const el = container.querySelector<HTMLElement>(`#${item.id}`);
        if (!el) continue;
        const relTop = el.getBoundingClientRect().top - containerRect.top + scrollTop;
        if (relTop <= scrollTop + 100) active = item.id;
        else break;
      }
      setActiveTocId(active);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [toc]);

  const scrollToHeading = (id: string) => {
    const container = contentRef.current;
    if (!container) return;
    const el = container.querySelector<HTMLElement>(`#${id}`);
    if (!el) return;
    const relTop = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    container.scrollTo({ top: relTop - 24, behavior: "smooth" });
    setActiveTocId(id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Example PRD Preview"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(8, 11, 20, 0.85)",
        backdropFilter: "blur(4px)",
        padding: "16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          height: "85vh",
          background: "var(--bg-base)",
          border: "1px solid var(--border-hairline)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderBottom: "1px solid var(--border-hairline)",
            background: "var(--bg-elevated)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-hairline)",
                background: "var(--bg-base)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-signal)",
              }}
              aria-hidden="true"
            >
              <FileText size={14} />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--fg-primary)",
                  margin: 0,
                }}
              >
                Example PRD Preview
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--fg-muted)",
                  margin: 0,
                  letterSpacing: "0.06em",
                }}
              >
                REF: PRD-2024-0042 · TaskFlow · 7 sections
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: "transparent",
              border: "1px solid var(--border-hairline)",
              color: "var(--fg-secondary)",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "var(--color-mist)";
              el.style.color = "var(--fg-primary)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "var(--border-hairline)";
              el.style.color = "var(--fg-secondary)";
            }}
          >
            <X size={16} />
          </button>
        </header>

        {/* Body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* TOC Sidebar */}
          <aside
            style={{
              width: "210px",
              flexShrink: 0,
              borderRight: "1px solid var(--border-hairline)",
              background: "var(--bg-base)",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
            aria-label="Table of contents"
          >
            <div
              style={{
                padding: "16px 14px 8px",
                borderBottom: "1px solid var(--border-hairline)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: "var(--fg-muted)",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Contents
              </p>
            </div>
            <nav style={{ flex: 1, overflowY: "auto", padding: "8px 8px 16px" }}>
              {toc.map((item) => {
                const isActive = activeTocId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToHeading(item.id)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      lineHeight: 1.4,
                      padding: "7px 10px",
                      borderRadius: "var(--radius-sm)",
                      background: isActive ? "var(--bg-elevated)" : "transparent",
                      color: isActive ? "var(--color-signal)" : "var(--fg-muted)",
                      fontWeight: isActive ? 600 : 400,
                      border: "none",
                      borderLeft: isActive
                        ? "2px solid var(--color-signal)"
                        : "2px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.1s ease",
                      marginBottom: 2,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {item.text}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Document content */}
          <div
            ref={contentRef}
            style={{
              flex: 1,
              padding: "32px 44px",
              overflowY: "auto",
              background: "var(--bg-base)",
            }}
          >
            <MarkdownRenderer
              content={PRD_TEMPLATE}
              onTocUpdate={(newToc) => {
                const filtered = newToc.filter((item) => /^\d+\./.test(item.text));
                setToc(filtered);
                if (filtered.length > 0 && !activeTocId) {
                  setActiveTocId(filtered[0].id);
                }
              }}
              idPrefix="exh-"
              className="markdown-preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
