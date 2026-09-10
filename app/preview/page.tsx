"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MarkdownRenderer, { TocItem } from "../components/shared/MarkdownRenderer";
import { MessageRenderer } from "../components/ai/MessageRenderer";
import { StepNavbar, ProjectHeaderBrand } from "../components/layout";
import { UpgradeModal } from "../components/modals";
import { PrdPreviewSkeleton } from "../components/shared";
import { Send, Bot, Loader2, Lightbulb, Scale, PenLine, Database } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/utils/apiClient";
import { useChatStore } from "@/stores/useChatStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { useUiStore } from "@/stores/useUiStore";

function PreviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [markdown, setMarkdown] = useState<string>("");
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeTocId, setActiveTocId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [appName] = useState("PRD");
  const contentRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [freeModels, setFreeModels] = useState<any[]>([]);

  const {
    chatMessages,
    addMessage,
    aiPrompt,
    setAiPrompt,
    isAiEditing,
    setIsAiEditing,
    selectedModel,
    setSelectedModel,
  } = useChatStore();
  const { updateProjectLocally } = useProjectStore();
  const { setShowUpgradeModal } = useUiStore();

  const [popularModels, setPopularModels] = useState<any[]>([]);

  const GEMINI_MODELS = [
    { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash (Default)" },
    { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash" },
    { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash" },
    { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite" },
    { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
  ];

  useEffect(() => {
    apiClient.openrouter
      .getModels()
      .then((d) => {
        setFreeModels(d.freeModels || d.models || []);
        setPopularModels(d.popularModels || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, isAiEditing]);

  const handleAiSubmit = async (promptText?: string) => {
    const textToSubmit = promptText || aiPrompt;
    if (!projectId || !textToSubmit.trim() || isAiEditing) return;
    const query = textToSubmit.trim();
    if (!promptText) setAiPrompt("");
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    addMessage({ id: Date.now().toString(), role: "user", content: query, timestamp: ts });
    setIsAiEditing(true);
    try {
      const data = await apiClient.generate.editPrd({ projectId, currentPrd: markdown, prompt: query, selectedModel });
      if (data.updatedMarkdown) {
        setMarkdown(data.updatedMarkdown);
        setEditContent(data.updatedMarkdown);
        updateProjectLocally({ prdData: data.updatedMarkdown });
        toast.success("PRD berhasil diperbarui!");
        try {
          window.dispatchEvent(new CustomEvent("prdUpdated", { detail: { prdData: data.updatedMarkdown } }));
        } catch {}
      }
      let reply = (data as any).reply || data.diffSummary || "Done.";
      if (typeof reply === "string" && reply.trim().startsWith("{") && reply.includes('"reply"')) {
        try {
          const m = reply.match(/"reply"\s*:\s*"([\s\S]*?)"/);
          if (m?.[1]) reply = m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
        } catch (_) {}
      }
      addMessage({ id: (Date.now()+1).toString(), role: "assistant", content: reply, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
    } catch (err: any) {
      addMessage({ id: (Date.now()+1).toString(), role: "assistant", content: `❌ ${err.message}`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
    } finally { setIsAiEditing(false); }
  };

  useEffect(() => {
    if (hasStarted || !projectId) return;
    setHasStarted(true);
    const go = async () => {
      setIsGenerating(true); setMarkdown("");
      try {
        const data = await apiClient.generate.prd(projectId);
        setMarkdown(data.markdown || "");
        setEditContent(data.markdown || "");
      } catch (err: any) {
        setMarkdown(`# Error\n\n${err?.message || "Failed to generate PRD."}`);
      } finally {
        setIsGenerating(false);
      }
    };
    go();
  }, [hasStarted, projectId]);

  useEffect(() => {
    const container = contentRef.current;
    if (!container || toc.length === 0) return;
    const onScroll = () => {
      const st = container.scrollTop; const cr = container.getBoundingClientRect();
      let active = toc[0]?.id || "";
      for (const item of toc) { const el = container.querySelector<HTMLElement>(`#${item.id}`); if (!el) continue; const rt = el.getBoundingClientRect().top - cr.top + st; if (rt <= st + 100) active = item.id; else break; }
      setActiveTocId(active);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    setTimeout(onScroll, 100);
    return () => container.removeEventListener("scroll", onScroll);
  }, [toc]);

  const handleCopy = useCallback(async () => { await navigator.clipboard.writeText(markdown); setCopied(true); setTimeout(() => setCopied(false), 2000); }, [markdown]);
  const handleDownload = useCallback(async () => {
    try {
      const { user } = await apiClient.user.me();
      if (!user.isPro) {
        toast.error("Fitur Download Markdown (.md) terkunci khusus untuk pengguna Pro.");
        setShowUpgradeModal(true);
        return;
      }
      const b = new Blob([markdown], { type: "text/markdown" });
      const u = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = u;
      a.download = "PRD.md";
      a.click();
      URL.revokeObjectURL(u);
    } catch {
      toast.error("Silakan login untuk mengunduh dokumen PRD.");
    }
  }, [markdown, setShowUpgradeModal]);
  const handleContinueToDesign = () => router.push(`/detail${projectId ? `?projectId=${projectId}` : ""}`);
  const scrollToHeading = (id: string) => { const c = contentRef.current; if (!c) return; const el = c.querySelector<HTMLElement>(`#${id}`); if (!el) return; c.scrollTo({ top: el.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop - 24, behavior: "smooth" }); };
  const handleSave = async () => {
    if (!projectId) return; setIsSaving(true);
    try {
      await apiClient.projects.update({ projectId, prdData: editContent, tasksOutdated: true });
      setMarkdown(editContent);
      updateProjectLocally({ prdData: editContent });
      setIsEditing(false);
      toast.success("PRD saved!");
    } catch {
      toast.error("Failed to save PRD.");
    } finally {
      setIsSaving(false);
    }
  };

  /* Shared small button style */
  const btn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "5px 10px", borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700,
    letterSpacing: "0.08em", textTransform: "uppercase",
    cursor: "pointer", border: "1px solid var(--border-hairline)",
    background: "var(--bg-elevated)", color: "var(--fg-secondary)",
    transition: "opacity 0.15s",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--color-background)", color: "var(--fg-primary)" }}>

      {/* ── Topbar ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: 52, flexShrink: 0,
        borderBottom: "1px solid var(--border-hairline)",
        background: "rgba(252, 251, 248, 0.92)", backdropFilter: "blur(12px)",
        position: "relative", zIndex: 50,
      }}>
        <ProjectHeaderBrand projectId={projectId} />

        <StepNavbar currentStep="prd" projectId={projectId} />

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} style={{ ...btn, color: "#f87171", borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.07)" }}>Cancel</button>
              <button onClick={handleSave} disabled={isSaving} style={{ ...btn, color: "var(--color-circuit)", borderColor: "rgba(79,209,197,0.3)", background: "rgba(79,209,197,0.07)" }}>
                {isSaving ? "Saving…" : "Save PRD"}
              </button>
            </>
          ) : (
            <button onClick={() => { setEditContent(markdown); setIsEditing(true); }} style={{ ...btn, color: "var(--color-mist)" }}>Edit Mode</button>
          )}
          <button onClick={handleCopy} disabled={isEditing} style={btn}>{copied ? "✓ Copied" : "Copy"}</button>
          <button onClick={handleDownload} style={btn}>↓ .md</button>
          <button
            onClick={handleContinueToDesign} disabled={isGenerating}
            style={{ ...btn, background: "var(--color-signal)", color: "#ffffff", borderColor: "var(--color-signal)", opacity: isGenerating ? 0.4 : 1, cursor: isGenerating ? "not-allowed" : "pointer", padding: "5px 14px" }}
          >
            Continue to Design →
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* TOC Sidebar */}
        <aside style={{ width: 220, flexShrink: 0, borderRight: "1px solid var(--border-hairline)", background: "var(--bg-surface)", overflowY: "auto", padding: "16px 0" }}>
          <div style={{ padding: "0 14px 10px", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--fg-muted)" }}>
            Contents
          </div>
          {toc.length === 0 && isGenerating && (
            <div style={{ padding: "0 14px", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-muted)" }}>Generating…</div>
          )}
          {toc.map((item) => (
            <button key={item.id} onClick={() => scrollToHeading(item.id)} style={{
              display: "block", width: "100%", textAlign: "left",
              padding: item.level === 2 ? "6px 14px" : "4px 22px",
              fontFamily: "var(--font-mono)", fontSize: item.level === 2 ? 11 : 10,
              fontWeight: item.level === 2 ? 600 : 400,
              letterSpacing: "0.04em",
              color: activeTocId === item.id ? "var(--color-signal)" : "var(--fg-muted)",
              background: activeTocId === item.id ? "rgba(255,182,39,0.07)" : "transparent",
              border: "none", cursor: "pointer", transition: "all 0.12s",
              borderLeft: activeTocId === item.id ? "2px solid var(--color-signal)" : "2px solid transparent",
              lineHeight: 1.4,
            }}>
              {item.text}
            </button>
          ))}
        </aside>

        {/* ── Main document area ── */}
        <div ref={contentRef} style={{ flex: 1, minWidth: 0, height: "100%", overflowY: "auto", position: "relative" }}>
          {isEditing ? (
            <div style={{ padding: 32, height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Markdown edit — saved changes sync with task list
              </p>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                spellCheck={false}
                style={{
                  flex: 1, width: "100%", resize: "none", outline: "none",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--fg-primary)",
                  fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.65,
                  padding: 20,
                }}
              />
            </div>
          ) : (
            <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 36px 120px" }}>
              {isGenerating ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400, gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-signal)", background: "rgba(255,182,39,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "spin 0.8s linear infinite",
                  }}>
                    <Loader2 size={20} style={{ color: "var(--color-signal)" }} strokeWidth={2} />
                  </div>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)", letterSpacing: "0.06em" }}>
                    Writing Product Requirements Document…
                  </p>
                </div>
              ) : (
                <MarkdownRenderer
                  content={markdown}
                  onTocUpdate={(newToc) => { setToc(newToc); if (newToc.length > 0 && !activeTocId) setActiveTocId(newToc[0].id); }}
                  className="markdown-preview"
                />
              )}
            </div>
          )}
        </div>

        {/* ── AI Chat Sidebar ── */}
        <aside style={{
          width: 420, flexShrink: 0,
          borderLeft: "1px solid var(--border-hairline)",
          background: "var(--bg-surface)",
          display: "flex", flexDirection: "column", height: "100%",
          position: "relative", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-hairline)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-hairline)", background: "var(--bg-elevated)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--color-circuit)",
                }}>
                  <Bot size={13} />
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--fg-primary)", margin: 0 }}>AI Assistant</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-circuit)", margin: 0, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Brainstorm · Edit PRD</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-xs)", background: "var(--bg-elevated)" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-mist)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Live</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
            {chatMessages.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Welcome */}
                <div style={{ padding: "14px", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-md)", background: "var(--bg-elevated)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                    <Bot size={13} style={{ color: "var(--color-signal)" }} />
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "var(--fg-primary)" }}>Halo! Saya AI-mu.</span>
                  </div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-mist)", lineHeight: 1.65, margin: 0 }}>
                    Brainstorm ide, tanya hal teknis, atau instruksikan saya untuk merevisi PRD ini langsung.
                  </p>
                </div>
                {/* Preset label */}
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 0" }}>
                  Quick prompts
                </div>
                {[
                  { icon: <Lightbulb size={12} />, label: "Brainstorm", text: "Apa ide fitur gamifikasi yang menarik untuk app ini?", accent: "var(--color-signal)" },
                  { icon: <Scale size={12} />, label: "Analysis",   text: "Apa kelebihan & kekurangan tech stack yang dipilih?", accent: "var(--color-circuit)" },
                  { icon: <PenLine size={12} />, label: "Edit PRD",  text: "Tambahkan section FAQ dan Troubleshooting ke PRD",   accent: "var(--color-circuit)" },
                  { icon: <Database size={12} />, label: "Technical", text: "Detailkan skema database untuk modul autentikasi",   accent: "var(--color-signal)" },
                ].map((p, i) => (
                  <button key={i} onClick={() => handleAiSubmit(p.text)} disabled={isAiEditing} style={{
                    textAlign: "left", padding: "9px 12px",
                    border: "1px solid var(--border-hairline)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-elevated)",
                    cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 9,
                    transition: "border-color 0.12s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: p.accent, flexShrink: 0, marginTop: 1 }}>
                      {p.icon}
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{p.label}</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-mist)", lineHeight: 1.5 }}>{p.text}</span>
                  </button>
                ))}
              </div>
            ) : (
              chatMessages.map((msg) => <MessageRenderer key={msg.id} message={msg} />)
            )}
            {isAiEditing && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "var(--radius-md)", border: "1px solid var(--border-hairline)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Bot size={11} style={{ color: "var(--color-circuit)" }} />
                </div>
                <div style={{ padding: "10px 14px", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", gap: 4 }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-circuit)", display: "inline-block", animation: `dotBounce 1.2s ease-in-out ${d}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input area */}
          <div style={{ padding: "10px 12px 12px", borderTop: "1px solid var(--border-hairline)", flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Model selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-xs)", background: "var(--bg-elevated)", width: "fit-content", maxWidth: "100%" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-circuit)", flexShrink: 0 }} />
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} disabled={isAiEditing} style={{ padding: "2px 0", border: "none", background: "transparent", color: "var(--fg-secondary)", fontFamily: "var(--font-mono)", fontSize: 10, outline: "none", cursor: "pointer", fontWeight: 600, letterSpacing: "0.04em", WebkitAppearance: "none", appearance: "none" }}>
                <optgroup label="Google Gemini">
                  {GEMINI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </optgroup>
                <optgroup label="OpenRouter (Free Tier $0)">
                  {freeModels.length > 0 ? freeModels.map(m => <option key={m.id} value={m.id}>{m.name || m.id}</option>) : <option value="loading">Loading…</option>}
                </optgroup>
                {popularModels.length > 0 && (
                  <optgroup label="OpenRouter (Flagship / Paid)">
                    {popularModels.map(m => <option key={m.id} value={m.id}>{m.name || m.id}</option>)}
                  </optgroup>
                )}
              </select>
            </div>
            {/* Textarea + send */}
            <form onSubmit={(e) => { e.preventDefault(); handleAiSubmit(); }} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiSubmit(); } }}
                placeholder="Brainstorm atau instruksikan edit PRD…"
                disabled={isAiEditing}
                rows={aiPrompt.split("\n").length > 1 || aiPrompt.length > 55 ? Math.min(aiPrompt.split("\n").length, 4) : 1}
                style={{
                  flex: 1, resize: "none", outline: "none",
                  background: "var(--bg-elevated)", border: "1px solid var(--border-hairline)",
                  borderRadius: "var(--radius-md)", color: "var(--fg-primary)",
                  fontFamily: "var(--font-body)", fontSize: 12, lineHeight: 1.5, padding: "8px 12px",
                  maxHeight: 120, overflowY: "auto",
                  transition: "border-color 0.12s",
                }}
                onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-circuit)"; }}
                onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hairline)"; }}
              />
              <button type="submit" disabled={isAiEditing || !aiPrompt.trim()} style={{
                width: 34, height: 34, borderRadius: "var(--radius-md)", flexShrink: 0,
                background: (!isAiEditing && aiPrompt.trim()) ? "var(--color-signal)" : "var(--bg-elevated)",
                border: "1px solid var(--border-hairline)",
                color: (!isAiEditing && aiPrompt.trim()) ? "#ffffff" : "var(--fg-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: isAiEditing || !aiPrompt.trim() ? "not-allowed" : "pointer",
                opacity: isAiEditing || !aiPrompt.trim() ? 0.4 : 1,
                transition: "all 0.15s",
              }}>
                {isAiEditing ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Send size={14} />}
              </button>
            </form>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--fg-muted)", textAlign: "center", letterSpacing: "0.06em" }}>
              Enter to send · Shift+Enter new line
            </p>
          </div>
        </aside>
      </div>

      {/* Status bar */}
      <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px", flexShrink: 0, borderTop: "1px solid var(--border-hairline)", background: "var(--bg-surface)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.04em" }}>
          {markdown.length.toLocaleString()} chars · {markdown.split("\n").length} lines
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.04em" }}>
          {appName} · Moryn
        </span>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dotBounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-5px);opacity:1} }
        aside::-webkit-scrollbar { width: 4px; }
        aside::-webkit-scrollbar-thumb { background: var(--border-hairline); border-radius: 3px; }
        select option, select optgroup { background: var(--bg-elevated); color: var(--fg-primary); }
      `}</style>
      {/* Pro Upgrade Modal */}
      <UpgradeModal />
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<PrdPreviewSkeleton />}>
      <PreviewPageContent />
    </Suspense>
  );
}
