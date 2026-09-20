"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MarkdownRenderer, { TocItem } from "../components/shared/MarkdownRenderer";
import { MessageRenderer } from "../components/ai/MessageRenderer";
import { ModelSelectorDropdown } from "../components/ai/ModelSelectorDropdown";
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
  ArrowUp,
  ChevronDown,
  Pencil,
  Copy,
  Download,
  Check,
  FileText,
  Minimize2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/utils/apiClient";
import { useChatStore, ChatAction } from "@/stores/useChatStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { useUiStore } from "@/stores/useUiStore";
import { isTextGenerationModel, type AiModelOption } from "@/lib/ai/models";
import { useTranslation } from "@/lib/i18n";

const SECTION_TITLE_MAP: Record<number, string> = {
  1: "1. Overview",
  2: "2. Requirements",
  3: "3. Core Features",
  4: "4. User Flow",
  5: "5. Architecture",
  6: "6. Database Schema",
  7: "7. Tech Stack",
  8: "8. API Endpoints",
  9: "9. Testing & CI/CD",
  10: "10. Roadmap",
};

const KEYWORD_MAP: Array<{ regex: RegExp; title: string }> = [
  { regex: /overview|ringkasan|eksekutif|sasaran/i, title: "1. Overview" },
  { regex: /requirement|kebutuhan|persona/i, title: "2. Requirements" },
  { regex: /core feature|fitur inti|fitur utama/i, title: "3. Core Features" },
  { regex: /user flow|alur pengguna/i, title: "4. User Flow" },
  { regex: /architecture|arsitektur/i, title: "5. Architecture" },
  { regex: /database|basis data|skema/i, title: "6. Database Schema" },
  { regex: /tech stack|teknologi/i, title: "7. Tech Stack" },
  { regex: /api|endpoint/i, title: "8. API Endpoints" },
  { regex: /testing|pengujian|ci\/cd|observab/i, title: "9. Testing & CI/CD" },
  { regex: /roadmap|milestone|rencana rilis/i, title: "10. Roadmap" },
];

function getSimplifiedTocTitle(rawText: string, level: number): string {
  if (level === 2) {
    const numMatch = rawText.match(/^\s*(\d+)\./);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      if (SECTION_TITLE_MAP[num]) {
        return SECTION_TITLE_MAP[num];
      }
    }
    for (const item of KEYWORD_MAP) {
      if (item.regex.test(rawText)) {
        return item.title;
      }
    }
    if (numMatch) {
      const num = numMatch[1];
      const rest = rawText.replace(/^\s*\d+\.\s*/, "").trim();
      return `${num}. ${rest.slice(0, 16)}${rest.length > 16 ? "…" : ""}`;
    }
    return rawText.slice(0, 18).trim() + (rawText.length > 18 ? "…" : "");
  }

  // Level 3 (Sub-sections under Core Features, e.g. "Fase 1 — ...")
  return rawText
    .replace(/^#+\s*/, "")
    .replace(/^\s*\d+\.\d+\s*/, "")
    .trim();
}

function PreviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { t, isId } = useTranslation();
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Dynamic auto-expanding input height adjustment (1 line -> fulltext/desc)
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    if (!textarea.value || !textarea.value.includes("\n")) {
      textarea.style.height = "20px";
      return;
    }
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 20), 140);
    textarea.style.height = `${newHeight}px`;
  }, []);

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
    removeActionsFromMessage,
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

  useEffect(() => {
    adjustTextareaHeight();
  }, [aiPrompt, adjustTextareaHeight]);

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
      .catch(() => { });

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
        } catch { }
      }
      let reply = (data as any).reply || data.diffSummary || "Done.";
      if (typeof reply === "string" && reply.trim().startsWith("{") && reply.includes('"reply"')) {
        try {
          const m = reply.match(/"reply"\s*:\s*"([\s\S]*?)"/);
          if (m?.[1]) reply = m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
        } catch (_) { }
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

  const handleActionClick = (action: ChatAction, messageId?: string) => {
    if (isAiEditing) return;

    // Remove action buttons from the message immediately after click
    if (messageId) {
      removeActionsFromMessage(messageId);
    }

    if (action.actionType === "send_prompt" && action.prompt) {
      // Enrich prompt with actual section context to prevent hallucination
      const sectionHeaders = markdown
        .split("\n")
        .filter((line: string) => /^#{1,3}\s/.test(line.trim()));
      const sectionCount = sectionHeaders.filter((h: string) => /^##?\s/.test(h.trim())).length;
      const sectionList = sectionHeaders
        .map((h: string) => h.trim())
        .join(", ");

      const enrichedPrompt = `${action.prompt}\n\n[CONTEXT: PRD saat ini memiliki ${sectionCount} section utama: ${sectionList}. Jangan membuat section baru yang tidak relevan. Jika menambahkan section, nomor berikutnya adalah ${sectionCount + 1}.]`;

      handleAiSubmit(enrichedPrompt);
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
      toast.success(t.prd.savedSuccess);
    } catch {
      toast.error(t.prd.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount = markdown ? markdown.trim().split(/\s+/).filter(Boolean).length : 0;
  const currentProjectName = projectInfo?.appName || "GerobakLink";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--color-background)", color: "var(--fg-primary)" }}>

      {/* â”€â”€ Topbar â”€â”€ */}
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
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.02em",
              cursor: isGenerating ? "not-allowed" : "pointer",
              opacity: isGenerating ? 0.4 : 1,
              transition: "opacity 0.15s, transform 0.1s",
            }}
          >
            <span>{t.prd.nextStep}</span>
            <ArrowRight size={14} strokeWidth={2.2} />
          </button>
        </div>
      </header>

      {/* â”€â”€ Body â”€â”€ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* â”€â”€ Left Sidebar: Document Header, Actions & TOC â”€â”€ */}
        <aside style={{
          width: 250,
          flexShrink: 0,
          borderRight: "1px solid var(--border-hairline, #e5e7eb)",
          background: "var(--bg-surface, #fcfbf9)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          overflowX: "hidden",
          boxSizing: "border-box",
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
                fontFamily: "var(--font-body)",
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
                {t.prd.documentation}
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
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {t.prd.cancel}
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
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: isSaving ? "not-allowed" : "pointer",
                  }}
                >
                  {isSaving ? t.prd.saving : t.prd.savePrd}
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
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
              >
                <Pencil size={13} strokeWidth={2.2} />
                <span>{t.prd.editMode}</span>
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
            fontFamily: "var(--font-body)",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "var(--fg-muted, #71717a)",
            textTransform: "uppercase",
            flexShrink: 0,
          }}>
            {t.prd.contents}
          </div>

          {/* TOC Items */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "0 10px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            width: "100%",
            boxSizing: "border-box",
          }}>
            {toc.length === 0 && isGenerating && (
              <div style={{ padding: "8px 12px", fontFamily: "var(--font-body)", fontSize: 11, color: "var(--fg-muted)" }}>
                Generating contents…
              </div>
            )}
            {toc.map((item) => {
              const isActive = activeTocId === item.id;
              const isMain = item.level === 2;
              const displayTitle = getSimplifiedTocTitle(item.text, item.level);

              if (isMain) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToHeading(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      overflow: "hidden",
                      textAlign: "left",
                      padding: "7px 10px",
                      borderRadius: 6,
                      fontFamily: "var(--font-body)",
                      fontSize: "11px",
                      fontWeight: isActive ? 700 : 500,
                      letterSpacing: "0.01em",
                      color: isActive ? "#ffffff" : "var(--fg-secondary, #4b5563)",
                      background: isActive ? "#e15b39" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.12s",
                      marginTop: 2,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        flexShrink: 0,
                        maxWidth: "calc(100% - 20px)",
                      }}
                    >
                      {displayTitle}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        borderRadius: 1,
                        background: isActive
                          ? "rgba(255, 255, 255, 0.45)"
                          : "var(--border-zinc-soft, #e4e4e7)",
                        marginLeft: 8,
                        minWidth: 8,
                      }}
                    />
                  </button>
                );
              }

              // Sub-sections (Level 3 - Fase 1, Fase 2, etc.)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToHeading(item.id)}
                  style={{
                    display: "block",
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    textAlign: "left",
                    padding: "5px 10px 5px 22px",
                    borderRadius: 6,
                    fontFamily: "var(--font-body)",
                    fontSize: "10.5px",
                    lineHeight: 1.35,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#e15b39" : "var(--fg-muted, #6b7280)",
                    background: isActive ? "rgba(225, 91, 57, 0.08)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.12s",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {displayTitle}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer Info */}
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--border-hairline, #e5e7eb)",
            fontFamily: "var(--font-body)",
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

        {/* â”€â”€ Main document area â”€â”€ */}
        <div ref={contentRef} style={{ flex: 1, minWidth: 0, height: "100%", overflowY: "auto", position: "relative" }}>
          {isEditing ? (
            <div style={{ padding: 32, height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
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
              <MarkdownRenderer
                content={markdown}
                onTocUpdate={(newToc) => { setToc(newToc); if (newToc.length > 0 && !activeTocId) setActiveTocId(newToc[0].id); }}
                className="markdown-preview"
              />
            </div>
          )}
        </div>

        {/* ── AI Chat Sidebar ── */}
        <aside style={{
          width: isChatOpen ? 450 : 0,
          minWidth: isChatOpen ? 450 : 0,
          flexShrink: 0,
          borderLeft: isChatOpen ? "1px solid var(--border-hairline, #e5e7eb)" : "none",
          background: "var(--bg-surface, #fcfbf9)",
          display: "flex", flexDirection: "column", height: "100%",
          position: "relative", overflow: "hidden",
          transition: "width 0.22s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          visibility: isChatOpen ? "visible" : "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-hairline, #e5e7eb)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  border: "none", background: "rgba(225,91,57,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#e15b39",
                }}>
                  <Bot size={17} />
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--fg-primary)", margin: 0 }}>Moryn AI</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "#16a34a", margin: 0, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>● CONTEXT READY</p>
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
                      fontFamily: "var(--font-body)",
                      fontSize: 10,
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
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  title="Sembunyikan panel chat AI"
                  aria-label="Sembunyikan panel chat AI"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 26,
                    height: 26,
                    borderRadius: "var(--radius-xs, 4px)",
                    border: "1px solid transparent",
                    background: "transparent",
                    color: "var(--fg-muted, #9ca3af)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#e15b39";
                    (e.currentTarget as HTMLElement).style.background = "rgba(225, 91, 57, 0.08)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(225, 91, 57, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--fg-muted, #9ca3af)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                  }}
                >
                  <Minimize2 size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
            {chatMessages.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Suggested actions from mockup */}
                <div style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, color: "var(--fg-muted, #9ca3af)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
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
                    fontFamily: "var(--font-body)",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: "0 1px 2px rgba(225,91,57,0.2)",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
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
                    fontFamily: "var(--font-body)",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: "0 1px 2px rgba(225,91,57,0.2)",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  <span>Generate technical constraints</span>
                  <ArrowRight size={13} strokeWidth={2.2} />
                </button>

                {/* Additional quick prompts */}
                <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 6 }}>
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
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(225,91,57,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#e15b39" }}>
                  <Bot size={13} />
                </div>
                <div style={{ padding: "8px 14px", border: "1px solid var(--border-hairline)", borderRadius: "12px", background: "var(--bg-elevated, #ffffff)", display: "flex", alignItems: "center", gap: 4 }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#e15b39", display: "inline-block", animation: `dotBounce 1.2s ease-in-out ${d}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input area */}
          <div style={{ padding: "10px 14px 12px", borderTop: "1px solid var(--border-hairline, #e5e7eb)", flexShrink: 0, display: "flex", flexDirection: "column", gap: 7 }}>
            {/* Model selector dropdown */}
            <ModelSelectorDropdown
              selectedModel={selectedModel || "gemini-2.5-flash"}
              onSelectModel={(modelId) => setSelectedModel(modelId)}
              geminiModels={geminiModels}
              openRouterFreeModels={openRouterFreeModels}
              openRouterRankedModels={openRouterRankedModels}
              isGeminiLoading={isGeminiLoading}
              isOpenRouterLoading={isOpenRouterLoading}
              disabled={isAiEditing}
            />

            {/* Symmetrical Auto-expanding Input Box */}
            {(() => {
              const isMultiLine = Boolean(aiPrompt && (aiPrompt.includes("\n") || (textareaRef.current && textareaRef.current.scrollHeight > 30)));

              return (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleAiSubmit(); }}
                  style={{
                    display: "flex",
                    alignItems: isMultiLine ? "flex-end" : "center",
                    gap: 8,
                    padding: isMultiLine ? "8px 6px 6px 14px" : "6px 6px 6px 14px",
                    borderRadius: "12px",
                    border: isInputFocused ? "1px solid rgba(225, 91, 57, 0.45)" : "1px solid var(--border-hairline, #e5e7eb)",
                    background: "var(--bg-elevated, #ffffff)",
                    boxShadow: isInputFocused ? "0 0 0 2px rgba(225, 91, 57, 0.08)" : "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    minHeight: isMultiLine ? undefined : 44,
                    boxSizing: "border-box",
                  }}
                >
                  <textarea
                    ref={textareaRef}
                    value={aiPrompt}
                    onChange={(e) => {
                      setAiPrompt(e.target.value);
                      adjustTextareaHeight();
                    }}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAiSubmit();
                      }
                    }}
                    placeholder={t.prd.askAiPlaceholder}
                    disabled={isAiEditing}
                    rows={1}
                    style={{
                      flex: 1,
                      resize: "none",
                      outline: "none",
                      border: "none",
                      background: "transparent",
                      color: "var(--fg-primary, #18181b)",
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      lineHeight: "20px",
                      height: isMultiLine ? undefined : "20px",
                      minHeight: "20px",
                      maxHeight: 140,
                      overflowY: aiPrompt.split("\n").length > 3 ? "auto" : "hidden",
                      padding: isMultiLine ? "2px 0" : 0,
                      margin: 0,
                      boxSizing: "border-box",
                      display: "block",
                      verticalAlign: "middle",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isAiEditing || !aiPrompt.trim()}
                    title="Kirim pesan"
                    aria-label="Kirim pesan"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      flexShrink: 0,
                      background: "#e15b39",
                      border: "none",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: isAiEditing || !aiPrompt.trim() ? "not-allowed" : "pointer",
                      opacity: isAiEditing || !aiPrompt.trim() ? 0.35 : 1,
                      transition: "all 0.15s ease",
                      marginBottom: isMultiLine ? 1 : 0,
                    }}
                  >
                    {isAiEditing ? (
                      <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />
                    ) : (
                      <ArrowUp size={15} strokeWidth={2.4} />
                    )}
                  </button>
                </form>
              );
            })()}

            {/* Helper footer text without Attach Context */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--fg-muted, #9ca3af)", letterSpacing: "0.02em" }}>
                Shift + Enter for new line
              </span>
            </div>
          </div>
        </aside>

        {/* Floating Reopen Button when chat is closed */}
        {!isChatOpen && (
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            title="Buka panel chat Moryn AI"
            aria-label="Buka panel chat Moryn AI"
            style={{
              position: "fixed",
              bottom: 50,
              right: 24,
              zIndex: 40,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 9999,
              background: "#ffffff",
              border: "1px solid rgba(225, 91, 57, 0.35)",
              boxShadow: "0 6px 20px rgba(225, 91, 57, 0.16), 0 2px 6px rgba(0,0,0,0.06)",
              color: "#e15b39",
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.02em",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(225, 91, 57, 0.24)";
              (e.currentTarget as HTMLElement).style.background = "#fff8f6";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(225, 91, 57, 0.16), 0 2px 6px rgba(0,0,0,0.06)";
              (e.currentTarget as HTMLElement).style.background = "#ffffff";
            }}
          >
            <Sparkles size={15} />
            <span>Moryn AI</span>
          </button>
        )}
      </div>

      {/* Status bar */}
      <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px", flexShrink: 0, borderTop: "1px solid var(--border-hairline)", background: "var(--bg-surface)" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--fg-muted)" }}>
          {markdown.length.toLocaleString()} chars · {markdown.split("\n").length} lines
        </span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--fg-muted)" }}>
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


