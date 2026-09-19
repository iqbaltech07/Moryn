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
import {
  Send,
  Bot,
  Loader2,
  Lightbulb,
  Scale,
  PenLine,
  Database,
  Trash2,
  ArrowRight,
  Pencil,
  Copy,
  Download,
  Check,
  FileText,
  BookOpen,
  Users,
  Folder,
  Clock,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/utils/apiClient";
import { useChatStore, ChatAction } from "@/stores/useChatStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { useUiStore } from "@/stores/useUiStore";
import { isTextGenerationModel, type AiModelOption } from "@/lib/ai/models";

function getTocIcon(text: string, index: number) {
  const t = text.toLowerCase();
  if (t.includes("overview") || t.includes("objective") || t.includes("ringkasan")) return BookOpen;
  if (t.includes("user") || t.includes("pain") || t.includes("pengguna") || t.includes("persona")) return Users;
  if (t.includes("flow") || t.includes("alur") || t.includes("journey") || t.includes("arsitektur")) return Folder;
  if (t.includes("requirement") || t.includes("fungsional") || t.includes("kebutuhan") || t.includes("fitur")) return Clock;
  if (t.includes("tech") || t.includes("konteks") || t.includes("stack") || t.includes("data") || t.includes("context")) return TrendingUp;
  const defaults = [BookOpen, Users, Folder, Clock, TrendingUp];
  return defaults[index % defaults.length] || FileText;
}

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
  const [projectInfo, setProjectInfo] = useState<{ appName: string; appIdea: string } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Dynamic Gemini Models State (Fetched 100% dynamically from API)
  const [geminiModels, setGeminiModels] = useState<AiModelOption[]>([]);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);

  // Dynamic OpenRouter Models State (Top 20 Ranked + Free Models, matching API Key Settings)
  const [openRouterFreeModels, setOpenRouterFreeModels] = useState<Array<{ id: string; name: string; isFree?: boolean }>>([]);
  const [openRouterRankedModels, setOpenRouterRankedModels] = useState<Array<{ id: string; name: string; isFree?: boolean }>>([]);
  const [isOpenRouterLoading, setIsOpenRouterLoading] = useState(false);

  const {
    chatMessages,
    addMessage,
    aiPrompt,
    setAiPrompt,
    isAiEditing,
    setIsAiEditing,
    selectedModel,
    setSelectedModel,
    setCurrentProjectId,
    clearChat,
  } = useChatStore();
  const { updateProjectLocally } = useProjectStore();
  const { setShowUpgradeModal } = useUiStore();

  // Load project details for header card & metadata
  useEffect(() => {
    if (!projectId) return;
    apiClient.projects
      .get(projectId)
      .then((data) => {
        if (data) {
          setProjectInfo({
            appName: data.appName || data.title || "Project",
            appIdea: data.appIdea || "",
          });
        }
      })
      .catch(() => {});

    const handleProjectUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setProjectInfo((prev) => ({
          appName: customEvent.detail.appName || prev?.appName || "Project",
          appIdea: customEvent.detail.appIdea || prev?.appIdea || "",
        }));
      }
    };
    window.addEventListener("projectUpdated", handleProjectUpdated);
    return () => window.removeEventListener("projectUpdated", handleProjectUpdated);
  }, [projectId]);

  // Synchronize active project for persistent localStorage chat history
  useEffect(() => {
    if (projectId) {
      setCurrentProjectId(projectId);
    }
  }, [projectId, setCurrentProjectId]);

  useEffect(() => {
    // 1. Dynamic fetch Gemini models from API (same pattern as settings)
    setIsGeminiLoading(true);
    apiClient.gemini
      .getModels()
      .then((res) => {
        if (res.models && res.models.length > 0) {
          const textOnly = res.models.filter(isTextGenerationModel);
          setGeminiModels(textOnly);
          if (!selectedModel && textOnly.length > 0) {
            setSelectedModel(textOnly[0].id);
          }
        }
      })
      .catch((err: unknown) => {
        console.warn("Failed to fetch Gemini models:", err);
      })
      .finally(() => {
        setIsGeminiLoading(false);
      });

    // 2. Dynamic fetch OpenRouter models from API (same pattern as settings)
    setIsOpenRouterLoading(true);
    apiClient.openrouter
      .getModels()
      .then((res) => {
        if (res.freeModels && res.freeModels.length > 0) {
          setOpenRouterFreeModels(res.freeModels.filter(isTextGenerationModel));
        }
        if (res.popularModels && res.popularModels.length > 0) {
          setOpenRouterRankedModels(res.popularModels.filter(isTextGenerationModel));
        }
      })
      .catch((err: unknown) => {
        console.warn("Failed to fetch OpenRouter models:", err);
      })
      .finally(() => {
        setIsOpenRouterLoading(false);
      });
  }, [selectedModel, setSelectedModel]);

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, isAiEditing]);

  const handleAiSubmit = async (promptText?: string) => {
    const textToSubmit = promptText || aiPrompt;
    if (!projectId || !textToSubmit.trim() || isAiEditing) return;
    const query = textToSubmit.trim();
    if (!promptText) setAiPrompt("");
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Multi-turn conversation context: extract recent turns before appending the new query
    const history = chatMessages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    addMessage({ id: Date.now().toString(), role: "user", content: query, timestamp: ts });
    setIsAiEditing(true);
    try {
      const data = await apiClient.generate.editPrd({
        projectId,
        currentPrd: markdown,
        prompt: query,
        selectedModel,
        history,
      });
      const newMd = data.updatedMarkdown || (data as any).markdown;
      if (newMd && (data as any).isPrdUpdated) {
        setMarkdown(newMd);
        setEditContent(newMd);
        updateProjectLocally({ prdData: newMd });
        toast.success("PRD berhasil diperbarui!");
        try {
          window.dispatchEvent(new CustomEvent("prdUpdated", { detail: { prdData: newMd } }));
        } catch {}
      }
      let reply = (data as any).reply || data.diffSummary || "Done.";
      if (typeof reply === "string" && reply.trim().startsWith("{") && reply.includes('"reply"')) {
        try {
          const m = reply.match(/"reply"\s*:\s*"([\s\S]*?)"/);
          if (m?.[1]) reply = m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
        } catch (_) {}
      }
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actions: (data as any).actions || undefined,
      });
    } catch (err: any) {
      addMessage({ id: (Date.now() + 1).toString(), role: "assistant", content: `❌ ${err.message}`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
    } finally { setIsAiEditing(false); }
  };

  const handleActionClick = (action: ChatAction) => {
    if (isAiEditing) return;
    if (action.actionType === "send_prompt" && action.prompt) {
      handleAiSubmit(action.prompt);
    } else if (action.actionType === "copy_text" && action.payload) {
      navigator.clipboard.writeText(action.payload);
      toast.success("Disalin ke clipboard!");
    }
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

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.success("PRD copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [markdown]);

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

  const handleContinueToDesign = () => router.push(`/design${projectId ? `?projectId=${projectId}` : ""}`);
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

  const wordCount = markdown ? markdown.trim().split(/\s+/).filter(Boolean).length : 0;
  const currentProjectName = projectInfo?.appName || "GerobakLink";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--color-background)", color: "var(--fg-primary)" }}>

      {/* ── Topbar ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 56, flexShrink: 0,
        borderBottom: "1px solid var(--border-hairline, #e5e7eb)",
        background: "rgba(252, 251, 248, 0.95)", backdropFilter: "blur(12px)",
        position: "relative", zIndex: 50,
      }}>
        {/* Left: Brand + Project dropdown */}
        <ProjectHeaderBrand projectId={projectId} />

        {/* Center: Workflow step badges */}
        <StepNavbar currentStep="prd" projectId={projectId} />

        {/* Right: ONLY Next Step button */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <button
            onClick={handleContinueToDesign}
            disabled={isGenerating}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: "8px",
              background: "#e15b39",
              color: "#ffffff",
              border: "none",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.02em",
              cursor: isGenerating ? "not-allowed" : "pointer",
              opacity: isGenerating ? 0.4 : 1,
              transition: "opacity 0.15s, transform 0.1s",
            }}
          >
            <span>Next Step</span>
            <ArrowRight size={14} strokeWidth={2.2} />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left Sidebar: Document Header, Actions & TOC ── */}
        <aside style={{
          width: 250,
          flexShrink: 0,
          borderRight: "1px solid var(--border-hairline, #e5e7eb)",
          background: "var(--bg-surface, #fcfbf9)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}>
          {/* Top Document Header Card */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 16px 14px" }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: "rgba(225, 91, 57, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#e15b39",
              flexShrink: 0,
            }}>
              <FileText size={20} strokeWidth={2} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#e15b39",
                fontFamily: "var(--font-mono, monospace)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.25,
              }}>
                {currentProjectName}
              </div>
              <div style={{
                fontSize: 11,
                color: "var(--fg-muted, #71717a)",
                fontWeight: 500,
                marginTop: 2,
              }}>
                PRD Documentation
              </div>
            </div>
          </div>

          {/* Action Buttons: Edit Mode & Copy/Download */}
          <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {isEditing ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(248,113,113,0.35)",
                    background: "rgba(248,113,113,0.08)",
                    color: "#f87171",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "none",
                    background: "#e15b39",
                    color: "#ffffff",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: isSaving ? "not-allowed" : "pointer",
                  }}
                >
                  {isSaving ? "Saving…" : "Save PRD"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setEditContent(markdown); setIsEditing(true); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  padding: "9px 16px",
                  borderRadius: 8,
                  background: "#e15b39",
                  color: "#ffffff",
                  border: "none",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
              >
                <Pencil size={13} strokeWidth={2.2} />
                <span>Edit Mode</span>
              </button>
            )}

            {/* Side-by-side Copy & Download buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button
                type="button"
                onClick={handleCopy}
                disabled={isEditing}
                title={copied ? "Copied to clipboard!" : "Copy markdown"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                  borderRadius: 8,
                  border: "1px solid var(--border-hairline, #e5e7eb)",
                  background: "var(--bg-elevated, #ffffff)",
                  color: copied ? "#16a34a" : "var(--fg-secondary, #4b5563)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                title="Download .md"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                  borderRadius: 8,
                  border: "1px solid var(--border-hairline, #e5e7eb)",
                  background: "var(--bg-elevated, #ffffff)",
                  color: "var(--fg-secondary, #4b5563)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <Download size={16} />
              </button>
            </div>
          </div>

          {/* CONTENTS Header */}
          <div style={{
            padding: "8px 16px 6px",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--fg-muted, #9ca3af)",
          }}>
            CONTENTS
          </div>

          {/* TOC Items */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 10px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}>
            {toc.length === 0 && isGenerating && (
              <div style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)" }}>
                Generating contents…
              </div>
            )}
            {toc.map((item, idx) => {
              const isActive = activeTocId === item.id;
              const Icon = getTocIcon(item.text, idx);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToHeading(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    width: "100%",
                    textAlign: "left",
                    padding: "7px 12px",
                    borderRadius: 8,
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "11px",
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: "0.02em",
                    color: isActive ? "#ffffff" : "var(--fg-secondary, #4b5563)",
                    background: isActive ? "#e15b39" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <Icon size={14} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.75 }} />
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.text.replace(/^[0-9]+(\.[0-9]+)*\s*/, "")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer Info */}
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--border-hairline, #e5e7eb)",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "10px",
            color: "var(--fg-muted, #9ca3af)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}>
            <span>{toc.length} sections</span>
            <span>•</span>
            <span>{wordCount.toLocaleString()} words</span>
          </div>
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
                    border: "1px solid #e15b39", background: "rgba(225,91,57,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "spin 0.8s linear infinite",
                  }}>
                    <Loader2 size={20} style={{ color: "#e15b39" }} strokeWidth={2} />
                  </div>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)", letterSpacing: "0.06em" }}>
                    Writing Product Requirements Document…
                  </p>
                </div>
              ) : (
                <>
                  {/* Top Document Header from mockup */}
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: "var(--bg-elevated, #f3f4f6)",
                        border: "1px solid var(--border-hairline, #e5e7eb)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        color: "var(--fg-muted, #71717a)",
                        textTransform: "uppercase",
                      }}>
                        DRAFT
                      </span>
                      <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--fg-muted, #9ca3af)",
                      }}>
                        Last edited recently
                      </span>
                    </div>

                    <h1 style={{
                      fontSize: "36px",
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                      color: "var(--fg-primary, #111827)",
                      margin: "0 0 16px",
                      lineHeight: 1.15,
                    }}>
                      {currentProjectName}
                    </h1>

                    {projectInfo?.appIdea && (
                      <div style={{
                        borderLeft: "3px solid #e15b39",
                        paddingLeft: "16px",
                        color: "var(--fg-secondary, #4b5563)",
                        fontSize: "15px",
                        lineHeight: 1.6,
                        margin: "16px 0 28px",
                      }}>
                        {projectInfo.appIdea}
                      </div>
                    )}
                  </div>

                  <MarkdownRenderer
                    content={markdown}
                    onTocUpdate={(newToc) => { setToc(newToc); if (newToc.length > 0 && !activeTocId) setActiveTocId(newToc[0].id); }}
                    className="markdown-preview"
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* ── AI Chat Sidebar ── */}
        <aside style={{
          width: 380, flexShrink: 0,
          borderLeft: "1px solid var(--border-hairline, #e5e7eb)",
          background: "var(--bg-surface, #fcfbf9)",
          display: "flex", flexDirection: "column", height: "100%",
          position: "relative", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-hairline, #e5e7eb)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: "none", background: "rgba(225,91,57,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#e15b39",
                }}>
                  <Bot size={16} />
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--fg-primary)", margin: 0 }}>Moryn AI</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#16a34a", margin: 0, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>● CONTEXT READY</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {chatMessages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Hapus seluruh riwayat chat untuk proyek ini?")) {
                        clearChat();
                        toast.success("Riwayat percakapan dibersihkan");
                      }
                    }}
                    title="Bersihkan riwayat percakapan"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 7px",
                      borderRadius: "var(--radius-xs)",
                      border: "1px solid var(--border-hairline)",
                      background: "transparent",
                      color: "var(--color-mist)",
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "var(--color-error)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(198, 61, 61, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "var(--color-mist)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hairline)";
                    }}
                  >
                    <Trash2 size={10} />
                    <span>Clear</span>
                  </button>
                )}
                <Sparkles size={14} style={{ color: "var(--fg-muted, #9ca3af)" }} />
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
            {chatMessages.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Suggested actions from mockup */}
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--fg-muted, #9ca3af)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  SUGGESTED ACTIONS
                </div>

                <button
                  type="button"
                  onClick={() => handleAiSubmit("Review for missing edge cases in this PRD")}
                  disabled={isAiEditing}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#e15b39",
                    color: "#ffffff",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: "0 1px 2px rgba(225,91,57,0.2)",
                  }}
                >
                  <span>Review for missing edge cases</span>
                  <ArrowRight size={13} strokeWidth={2.2} />
                </button>

                <button
                  type="button"
                  onClick={() => handleAiSubmit("Generate technical constraints and architectural boundaries")}
                  disabled={isAiEditing}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#e15b39",
                    color: "#ffffff",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: "0 1px 2px rgba(225,91,57,0.2)",
                  }}
                >
                  <span>Generate technical constraints</span>
                  <ArrowRight size={13} strokeWidth={2.2} />
                </button>

                {/* Additional quick prompts */}
                <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { icon: <Lightbulb size={12} />, label: "Brainstorm", text: "Apa ide fitur gamifikasi yang menarik untuk app ini?" },
                    { icon: <PenLine size={12} />, label: "Edit PRD", text: "Tambahkan section FAQ dan Troubleshooting ke PRD" },
                  ].map((p, i) => (
                    <button key={i} onClick={() => handleAiSubmit(p.text)} disabled={isAiEditing} style={{
                      textAlign: "left", padding: "8px 12px",
                      border: "1px solid var(--border-hairline, #e5e7eb)",
                      borderRadius: "8px",
                      background: "var(--bg-elevated, #ffffff)",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                      transition: "border-color 0.12s",
                    }}>
                      <div style={{ color: "#e15b39", flexShrink: 0 }}>
                        {p.icon}
                      </div>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--fg-secondary)", lineHeight: 1.4 }}>{p.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <MessageRenderer
                  key={msg.id}
                  message={msg}
                  onActionClick={handleActionClick}
                  isAiEditing={isAiEditing}
                />
              ))
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
              <select
                value={selectedModel || "gemini-2.5-flash"}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isAiEditing}
                style={{
                  padding: "2px 0",
                  border: "none",
                  background: "transparent",
                  color: "var(--fg-secondary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  outline: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  WebkitAppearance: "none",
                  appearance: "none",
                }}
              >
                <optgroup label="Google Gemini">
                  {geminiModels.length > 0 ? (
                    geminiModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))
                  ) : (
                    <option value={selectedModel || "gemini-2.5-flash"}>
                      {isGeminiLoading ? "Memuat model Gemini..." : (selectedModel || "gemini-2.5-flash")}
                    </option>
                  )}
                </optgroup>

                {openRouterFreeModels.length > 0 && (
                  <optgroup label={`Free Models (${openRouterFreeModels.length})`}>
                    {openRouterFreeModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (Free)
                      </option>
                    ))}
                  </optgroup>
                )}

                {openRouterRankedModels.length > 0 && (
                  <optgroup label={`Top 20 Ranked Models (${openRouterRankedModels.length})`}>
                    {openRouterRankedModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </optgroup>
                )}

                {openRouterFreeModels.length === 0 && openRouterRankedModels.length === 0 && isOpenRouterLoading && (
                  <optgroup label="OpenRouter">
                    <option value="" disabled>
                      Memuat model OpenRouter…
                    </option>
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
