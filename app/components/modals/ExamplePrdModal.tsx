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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/45 backdrop-blur-xs"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[1060px] h-[88vh] bg-[#fcfbf8] border border-[#141817]/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-left">
        {/* Modal Header */}
        <header className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-[#141817]/8 bg-[#fcfbf8]/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#e15b39]/12 flex items-center justify-center text-[#e15b39] shrink-0">
              <FileText size={16} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#141817] m-0">
                  Example PRD Preview
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[10px] font-mono text-[#065f46] font-medium hidden sm:inline-flex">
                  Production Verified
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#71717a] m-0 mt-0.5 tracking-tight">
                REF: PRD-2026-MORYN · 10-Section Anti-Drift Architecture · 10ms Sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg border border-[#141817]/10 bg-white text-[#71717a] hover:text-[#141817] hover:bg-[#f5f2ea] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* TOC Sidebar */}
          <aside
            className="w-[220px] shrink-0 border-r border-[#141817]/8 bg-[#fcfbf9] overflow-y-auto flex flex-col hidden sm:flex"
            aria-label="Table of contents"
          >
            <div className="px-4 py-3 border-b border-[#141817]/6">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#85858a] m-0">
                Contents
              </p>
            </div>
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
              {toc.map((item) => {
                const isActive = activeTocId === item.id;
                const isSub = item.level === 3;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToHeading(item.id)}
                    className={`block w-full text-left text-xs transition-all duration-100 rounded-md cursor-pointer ${
                      isSub ? "pl-5 pr-2 py-1 text-[11px]" : "px-2.5 py-1.5 font-medium"
                    } ${
                      isActive
                        ? "bg-[#e15b39]/10 text-[#e15b39] font-bold border-l-2 border-[#e15b39]"
                        : "text-[#57575c] hover:text-[#141817] hover:bg-[#141817]/[0.03]"
                    }`}
                  >
                    <span className="truncate block">{item.text}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Document content */}
          <div
            ref={contentRef}
            className="flex-1 px-6 sm:px-10 py-8 overflow-y-auto bg-[#fcfbf8]"
          >
            <MarkdownRenderer
              content={PRD_TEMPLATE}
              onTocUpdate={(newToc) => {
                setToc(newToc);
                if (newToc.length > 0 && !activeTocId) {
                  setActiveTocId(newToc[0].id);
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
