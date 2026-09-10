"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Sprout, Compass, PenLine, LayoutList, Lightbulb,
  Map, Timer, Telescope, Trophy, Wrench,
  CheckCircle2, PartyPopper, Award, ArrowRight, Check, Loader2,
  Plus, MoreHorizontal, LayoutGrid, List, Cpu, RefreshCw
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { StepNavbar, ProjectHeaderBrand } from "../components/layout";
import { McpConnectModal, UpgradeModal } from "../components/modals";
import { TaskKanbanSkeleton } from "../components/shared";
import { apiClient } from "@/lib/utils/apiClient";
import { useKanbanStore } from "@/stores/useKanbanStore";
import { useUiStore } from "@/stores/useUiStore";

/* ─── Types ─── */
interface Task {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimasi: string;
  tags: string[];
  status?: "todo" | "in_progress" | "done";
}

interface Phase {
  id: string;
  name: string;
  icon: string;
  description: string;
  tasks: Task[];
}

interface TaskData {
  phases: Phase[];
}

interface FinishResult {
  expGained: number;
  newExp: number;
  rank: { id: number; name: string; icon: string; color: string };
}

type ColumnId = "todo" | "in_progress" | "done";

interface KanbanColumn {
  id: ColumnId;
  title: string;
  color: string;
  borderColor: string;
  bgDot: string;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "todo",        title: "To Do",       color: "var(--fg-secondary)",   borderColor: "var(--border-strong)",         bgDot: "#8B93A7" },
  { id: "in_progress", title: "In Progress", color: "var(--color-signal)",   borderColor: "rgba(255,182,39,0.35)",        bgDot: "#FFB627" },
  { id: "done",        title: "Completed",   color: "var(--color-circuit)",  borderColor: "rgba(79,209,197,0.35)",       bgDot: "#4FD1C5" },
];

const RANK_ICONS: Record<string, LucideIcon> = { Sprout, Compass, PenLine, LayoutList, Lightbulb, Map, Timer, Telescope, Trophy, Wrench };

const PRIORITY: Record<string, { label: string; color: string; borderColor: string; bg: string }> = {
  high:   { label: "High",   color: "#f87171", borderColor: "rgba(248,113,113,0.35)", bg: "rgba(248,113,113,0.08)" },
  medium: { label: "Medium", color: "var(--color-signal)", borderColor: "rgba(255,182,39,0.35)", bg: "rgba(255,182,39,0.08)" },
  low:    { label: "Low",    color: "var(--color-circuit)", borderColor: "rgba(79,209,197,0.35)", bg: "rgba(79,209,197,0.08)" },
};

/* ─── Kanban Card ─── */
function KanbanTaskCard({
  task,
  index,
  onToggleStatus,
}: {
  task: Task;
  index: number;
  onToggleStatus: (taskId: string, newStatus: ColumnId) => void;
}) {
  const p = PRIORITY[task.priority] || PRIORITY.medium;
  const isDone = task.status === "done";

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            marginBottom: 10,
            userSelect: "none",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "var(--radius-lg)",
              border: `1px solid ${
                snapshot.isDragging
                  ? "var(--color-signal)"
                  : isDone
                  ? "var(--border-subtle)"
                  : "var(--border-hairline)"
              }`,
              background: snapshot.isDragging
                ? "var(--bg-surface)"
                : isDone
                ? "rgba(20,28,48,0.6)"
                : "var(--bg-elevated)",
              boxShadow: snapshot.isDragging
                ? "0 12px 28px rgba(0,0,0,0.45), 0 0 0 1px var(--color-signal)"
                : "var(--shadow-card)",
              opacity: isDone && !snapshot.isDragging ? 0.65 : 1,
              transition: "box-shadow 0.15s, border-color 0.15s, transform 0.15s",
              cursor: "grab",
            }}
          >
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: "var(--radius-xs)",
                    border: `1px solid ${p.borderColor}`,
                    color: p.color,
                    background: p.bg,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {p.label}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.04em" }}>
                  {task.estimasi}
                </span>
              </div>

              {/* Status Move Shortcuts */}
              <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                {task.status !== "todo" && (
                  <button
                    onClick={() => onToggleStatus(task.id, "todo")}
                    title="Move to To Do"
                    style={{
                      padding: "3px 7px",
                      borderRadius: "var(--radius-xs)",
                      border: "1px solid var(--border-hairline)",
                      background: "rgba(255,255,255,0.03)",
                      color: "var(--fg-muted)",
                      fontSize: 9,
                      fontFamily: "var(--font-mono)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    ← Todo
                  </button>
                )}
                {task.status !== "in_progress" && (
                  <button
                    onClick={() => onToggleStatus(task.id, "in_progress")}
                    title="Move to In Progress"
                    style={{
                      padding: "3px 7px",
                      borderRadius: "var(--radius-xs)",
                      border: "1px solid rgba(255,182,39,0.35)",
                      background: "rgba(255,182,39,0.1)",
                      color: "var(--color-signal)",
                      fontSize: 9,
                      fontFamily: "var(--font-mono)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    ⚡ Prog
                  </button>
                )}
                {task.status !== "done" && (
                  <button
                    onClick={() => onToggleStatus(task.id, "done")}
                    title="Mark Done"
                    style={{
                      padding: "3px 7px",
                      borderRadius: "var(--radius-xs)",
                      border: "1px solid rgba(79,209,197,0.35)",
                      background: "rgba(79,209,197,0.1)",
                      color: "var(--color-circuit)",
                      fontSize: 9,
                      fontFamily: "var(--font-mono)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    ✓ Done
                  </button>
                )}
              </div>
            </div>

            {/* Title */}
            <h4
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--fg-primary)",
                textDecoration: isDone ? "line-through" : "none",
                lineHeight: 1.4,
                marginBottom: 6,
              }}
            >
              {task.title}
            </h4>

            {/* Description */}
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                color: "var(--color-mist)",
                lineHeight: 1.55,
                marginBottom: task.tags?.length ? 10 : 0,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {task.description}
            </p>

            {/* Tags */}
            {task.tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      fontWeight: 600,
                      padding: "2px 7px",
                      borderRadius: "var(--radius-xs)",
                      border: "1px solid var(--border-hairline)",
                      color: "var(--color-circuit)",
                      background: "rgba(79,209,197,0.04)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

/* ─── Celebration Modal ─── */
function CelebrationModal({ result, onClose }: { result: FinishResult; onClose: () => void }) {
  const RankIcon = RANK_ICONS[result.rank.icon] ?? Award;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(8,11,20,0.88)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-lg)", maxWidth: 400, width: "100%", overflow: "hidden" }}>
        {/* Signal top rule */}
        <div aria-hidden="true" style={{ height: 2, background: "var(--color-signal)" }} />
        <div style={{ padding: "36px 32px", textAlign: "center" }}>
          <PartyPopper size={44} strokeWidth={1.5} style={{ color: "var(--color-signal)", margin: "0 auto 16px" }} />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-signal)", marginBottom: 8 }}>
            Project Complete
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--fg-primary)", marginBottom: 8, letterSpacing: "-0.02em" }}>
            Project Selesai! 🎉
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-mist)", marginBottom: 28, lineHeight: 1.6 }}>
            Semua task berhasil diselesaikan. Points kamu telah diperbarui.
          </p>
          {/* Points */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-md)", padding: "10px 20px", marginBottom: 20, background: "var(--bg-elevated)" }}>
            <Award size={16} style={{ color: "var(--color-signal)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: "var(--color-signal)", letterSpacing: "-0.02em" }}>
              +{result.expGained} {result.expGained === 1 ? "Point" : "Points"}
            </span>
          </div>
          {/* Rank row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 24, background: "var(--bg-elevated)" }}>
            <div style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: result.rank.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <RankIcon size={18} color="white" strokeWidth={2} />
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--fg-muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 2px" }}>Current Rank</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "var(--fg-primary)", margin: 0 }}>{result.rank.name}</p>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--fg-muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 2px" }}>Total Points</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--color-signal)", margin: 0 }}>{result.newExp.toLocaleString("id-ID")}</p>
            </div>
          </div>
          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: "var(--radius-md)", border: "1px solid var(--border-hairline)", background: "var(--bg-elevated)", color: "var(--fg-secondary)", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
              Tutup
            </button>
            <Link href="/dashboard/settings?tab=account" style={{ flex: 1, padding: "10px 0", borderRadius: "var(--radius-md)", border: "1px solid var(--color-signal)", background: "var(--color-signal)", color: "var(--color-graphite)", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              Lihat Akun <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Content ─── */
function TaskPageContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [data, setData] = useState<TaskData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  
  const {
    taskStatus,
    setTaskStatus,
    activePhase,
    setActivePhase,
  } = useKanbanStore();
  const { setShowUpgradeModal } = useUiStore();
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<FinishResult | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchTasks = async (force = false) => {
    if (!projectId) return;
    if (force) setIsSyncing(true);
    else setIsLoading(true);

    try {
      const json = await apiClient.generate.tasks({ projectId, forceSync: force });
      if (json.error) {
        if (force) toast.error(json.error);
        else setError(json.error);
      } else {
        setData(json);
        if (json.phases?.[0]?.id && !activePhase) setActivePhase(json.phases[0].id);

        const serverSaved = json.savedStatus || {};
        let initialStatuses: Record<string, ColumnId> = {};

        const localKey = `kanban_status_${projectId}`;
        let localStatuses: Record<string, ColumnId> = {};
        try {
          const localSaved = localStorage.getItem(localKey);
          if (localSaved) localStatuses = JSON.parse(localSaved);
        } catch (e) {}

        json.phases.forEach((p: Phase) => {
          p.tasks.forEach((t: Task) => {
            if (serverSaved[t.id]) {
              initialStatuses[t.id] = typeof serverSaved[t.id] === "string" ? serverSaved[t.id] : (serverSaved[t.id] === true ? "done" : "todo");
            } else if (localStatuses[t.id]) {
              initialStatuses[t.id] = localStatuses[t.id];
            } else {
              initialStatuses[t.id] = (t.status as ColumnId) || "todo";
            }
          });
        });

        setTaskStatus(initialStatuses);
        try { localStorage.setItem(localKey, JSON.stringify(initialStatuses)); } catch (e) {}
        if (force) toast.success("Task list berhasil disinkronkan dengan PRD & Struktur!");
      }
    } catch {
      if (force) toast.error("Koneksi gagal saat sinkronisasi.");
      else setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (hasStarted || !projectId) return;
    setHasStarted(true);
    fetchTasks(false);
  }, [hasStarted, projectId]);

  // Track latest taskStatus in ref for zero-latency on-leave sync
  const latestTaskStatusRef = useRef<Record<string, ColumnId>>(taskStatus);
  const isDirtyRef = useRef(false);
  latestTaskStatusRef.current = taskStatus;

  // 🔄 Smart Real-Time Auto-Sync: Adaptive polling to prevent log flooding and conserve server resources
  useEffect(() => {
    if (!projectId || !data) return;

    let timeoutId: NodeJS.Timeout;
    let currentInterval = 15000; // Start at a polite 15s interval instead of flooding at 3s
    let isSubscribed = true;

    const pollTaskStatus = async () => {
      // Don't poll/update if user is on another tab or actively dragging tasks
      if (document.visibilityState !== "visible" || isDirtyRef.current) {
        scheduleNext(currentInterval);
        return;
      }

      try {
        const json = await apiClient.projects.getStatus(projectId);
        const serverStatuses: Record<string, ColumnId> = (json.taskStatus as any) || {};

        let hasChange = false;
        const updated = { ...latestTaskStatusRef.current };

        Object.keys(serverStatuses).forEach((taskId) => {
          const rawStatus = serverStatuses[taskId];
          const normStatus: ColumnId =
            typeof rawStatus === "string"
              ? (rawStatus as ColumnId)
              : rawStatus === true
              ? "done"
              : "todo";

          if (updated[taskId] !== normStatus) {
            updated[taskId] = normStatus;
            hasChange = true;
          }
        });

        if (hasChange) {
          setTaskStatus(updated);
          try {
            localStorage.setItem(`kanban_status_${projectId}`, JSON.stringify(updated));
          } catch (e) {}
          // When change detected: reset to standard 15s cadence
          currentInterval = 15000;
        } else {
          // When idle: gradually back off up to 45s to keep terminal clean & save DB/Redis bandwidth
          currentInterval = Math.min(currentInterval + 5000, 45000);
        }
      } catch (err) {
        // Silent error handling for background polling
        currentInterval = Math.min(currentInterval + 10000, 60000);
      }

      if (isSubscribed) {
        scheduleNext(currentInterval);
      }
    };

    const scheduleNext = (delay: number) => {
      clearTimeout(timeoutId);
      if (isSubscribed) {
        timeoutId = setTimeout(pollTaskStatus, delay);
      }
    };

    // Instant sync when user switches back to this tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        currentInterval = 15000;
        pollTaskStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    scheduleNext(currentInterval);

    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [projectId, data]);

  // Sync to database only when user leaves page or closes tab
  const syncToDatabase = () => {
    if (!projectId || !isDirtyRef.current || Object.keys(latestTaskStatusRef.current).length === 0) return;
    
    const payload = JSON.stringify({ projectId, taskStatus: latestTaskStatusRef.current });
    
    // 1. Try navigator.sendBeacon (ideal for closing tab / navigating away)
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/projects/update", blob);
      if (sent) {
        isDirtyRef.current = false;
        return;
      }
    }
    
    // 2. Fallback using centralized apiClient
    apiClient.projects.update({ projectId, checkedTasks: latestTaskStatusRef.current })
      .then(() => {
        isDirtyRef.current = false;
      })
      .catch((e) => console.warn("Failed to sync kanban status on leave:", e));
  };

  // Attach lifecycle event listeners for On-Leave / On-Unload sync (Skenario A)
  useEffect(() => {
    const handleBeforeUnload = () => {
      syncToDatabase();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        syncToDatabase();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Also sync when component unmounts (React page navigation)
      syncToDatabase();
    };
  }, [projectId]);

  // Fast Local-First update handler (0ms API latency while dragging/clicking)
  const updateTaskStatusLocally = (newStatuses: Record<string, ColumnId>) => {
    setTaskStatus(newStatuses);
    isDirtyRef.current = true;
    if (projectId) {
      try {
        localStorage.setItem(`kanban_status_${projectId}`, JSON.stringify(newStatuses));
      } catch (e) {
        console.warn("Failed to save to localStorage:", e);
      }
    }
  };

  const handleStatusChange = (taskId: string, newStatus: ColumnId) => {
    const next = { ...taskStatus, [taskId]: newStatus };
    updateTaskStatusLocally(next);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    const newStatus = destination.droppableId as ColumnId;
    const next = { ...taskStatus, [draggableId]: newStatus };
    updateTaskStatusLocally(next);
  };

  const getProgress = () => {
    if (!data) return { done: 0, total: 0, pct: 0 };
    const all = data.phases.flatMap(p => p.tasks);
    const done = all.filter(t => taskStatus[t.id] === "done").length;
    return { done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
  };

  const handleFinish = async () => {
    if (!projectId || !data || isFinishing) return;
    setIsFinishing(true); setFinishError(null);
    const checkedMap: Record<string, boolean> = {};
    Object.keys(taskStatus).forEach(id => {
      checkedMap[id] = taskStatus[id] === "done";
    });

    try {
      const json = await apiClient.projects.finish({ projectId, checkedTasks: checkedMap });
      setIsFinished(true);
      setCelebration(json);
    } catch (err: any) {
      setFinishError(err?.message || "Gagal menyelesaikan project.");
    } finally {
      setIsFinishing(false);
    }
  };

  const handleExport = async () => {
    if (!data) return;
    try {
      const { user } = await apiClient.user.me();
      if (!user.isPro) {
        toast.error("Fitur Export Kanban Tasks (.md) terkunci khusus untuk pengguna Pro.");
        setShowUpgradeModal(true);
        return;
      }
      let md = "";
      data.phases.forEach((ph, i) => {
        md += `## ${i+1}. ${ph.name}\n\n`;
        ph.tasks.forEach(t => {
          const statusStr = taskStatus[t.id] === "done" ? "[x]" : "[ ]";
          const stateLabel = (taskStatus[t.id] || "todo").toUpperCase();
          md += `- ${statusStr} **${t.title}** *(${t.estimasi})* — Status: ${stateLabel} | Priority: ${t.priority}\n  ${t.description}\n\n`;
        });
      });
      const b = new Blob([md], { type: "text/markdown" });
      const u = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = u;
      a.download = "kanban-tasks.md";
      a.click();
      URL.revokeObjectURL(u);
    } catch {
      toast.error("Silakan login untuk mengunduh daftar task.");
    }
  };

  const progress = getProgress();
  const activePhaseData = data?.phases.find(p => p.id === activePhase);
  const allDone = progress.total > 0 && progress.pct === 100;

  const btn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "5px 10px", borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700,
    letterSpacing: "0.08em", textTransform: "uppercase",
    cursor: "pointer", border: "1px solid var(--border-hairline)",
    background: "var(--bg-elevated)", color: "var(--fg-secondary)",
    transition: "opacity 0.15s",
  };

  const [showMcpModal, setShowMcpModal] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-ink)", color: "var(--fg-primary)" }}>
      {celebration && <CelebrationModal result={celebration} onClose={() => setCelebration(null)} />}
      {showMcpModal && projectId && (
        <McpConnectModal projectId={projectId} appName={data?.phases?.[0]?.name} onClose={() => setShowMcpModal(false)} />
      )}

      {/* ── Topbar ── */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 52, borderBottom: "1px solid var(--border-hairline)", background: "rgba(16,24,43,0.96)", backdropFilter: "blur(12px)" }}>
        <ProjectHeaderBrand projectId={projectId} />
        <StepNavbar currentStep="task" projectId={projectId} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
          {!isLoading && data && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: "var(--radius-xs)",
                border: "1px solid rgba(79,209,197,0.25)",
                background: "rgba(79,209,197,0.06)",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--color-circuit)",
                letterSpacing: "0.04em",
              }}
              title="Kanban status automatically syncs with AI Agent via NPX CLI & REST API"
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#4FD1C5",
                  boxShadow: "0 0 8px #4FD1C5",
                }}
              />
              Live Sync
            </div>
          )}
          {!isLoading && data && (
            <button
              onClick={() => setShowMcpModal(true)}
              style={{
                ...btn,
                background: "rgba(79,209,197,0.08)",
                borderColor: "rgba(79,209,197,0.35)",
                color: "var(--color-circuit)",
              }}
            >
              <Cpu size={12} style={{ color: "var(--color-circuit)" }} />
              Setup AI Agent CLI
            </button>
          )}
          {!isLoading && data && (
            <button
              onClick={() => fetchTasks(true)}
              disabled={isSyncing}
              style={{
                ...btn,
                background: isSyncing ? "rgba(255,182,39,0.15)" : "var(--bg-elevated)",
                borderColor: isSyncing ? "var(--color-signal)" : "var(--border-hairline)",
                color: isSyncing ? "var(--color-signal)" : "var(--fg-secondary)",
                cursor: isSyncing ? "not-allowed" : "pointer",
              }}
              title="Sync tasks with latest PRD and Structure changes"
            >
              <RefreshCw size={11} className={isSyncing ? "animate-spin" : ""} style={{ color: isSyncing ? "var(--color-signal)" : "var(--fg-muted)" }} />
              {isSyncing ? "Syncing…" : "Sync Tasks"}
            </button>
          )}
          {!isLoading && data && (
            <button onClick={handleExport} style={btn}>↓ Export .md</button>
          )}
          <Link href="/generate" style={{ ...btn, background: "var(--color-signal)", color: "var(--color-graphite)", borderColor: "var(--color-signal)", textDecoration: "none" }}>
            + New Project
          </Link>
        </div>
      </header>

      <div style={{ paddingTop: 52, display: "flex", height: "100vh" }}>

        {/* ── Left sidebar: phase nav ── */}
        <aside style={{ width: 220, flexShrink: 0, borderRight: "1px solid var(--border-hairline)", background: "var(--bg-surface)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {/* Progress */}
          <div style={{ padding: "20px 14px 16px", borderBottom: "1px solid var(--border-hairline)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg-muted)" }}>Progress</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: allDone ? "var(--color-circuit)" : "var(--color-signal)" }}>{progress.pct}%</span>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: "var(--bg-elevated)" }}>
              <div style={{ height: "100%", borderRadius: 2, background: allDone ? "var(--color-circuit)" : "var(--color-signal)", width: `${progress.pct}%`, transition: "width 0.4s ease" }} />
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--fg-muted)", marginTop: 6, letterSpacing: "0.04em" }}>
              {progress.done} / {progress.total} tasks done
            </p>
          </div>

          {/* Finish CTA */}
          {allDone && !isFinished && (
            <div style={{ padding: "10px 10px 0" }}>
              <button onClick={handleFinish} disabled={isFinishing} style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-circuit)", background: "rgba(79,209,197,0.1)", color: "var(--color-circuit)", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: isFinishing ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: isFinishing ? 0.6 : 1 }}>
                <CheckCircle2 size={11} />
                {isFinishing ? "Processing…" : "Finish & Claim Points"}
              </button>
              {finishError && <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#f87171", marginTop: 6, textAlign: "center" }}>{finishError}</p>}
            </div>
          )}
          {isFinished && (
            <div style={{ padding: "10px 10px 0" }}>
              <div style={{ padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid rgba(79,209,197,0.35)", background: "rgba(79,209,197,0.07)", display: "flex", alignItems: "center", gap: 7 }}>
                <CheckCircle2 size={11} style={{ color: "var(--color-circuit)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-circuit)" }}>Complete!</span>
              </div>
            </div>
          )}

          {/* Phase list */}
          <div style={{ padding: "10px 8px", flex: 1 }}>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ height: 36, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", marginBottom: 4, opacity: 0.4 }} />
              ))
            ) : data?.phases.map((phase, idx) => {
              const done = phase.tasks.filter(t => (taskStatus[t.id] || "todo") === "done").length;
              const isActive = activePhase === phase.id;
              return (
                <button key={phase.id} onClick={() => setActivePhase(phase.id)} style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", transition: "all 0.12s", marginBottom: 2, background: isActive ? "rgba(255,182,39,0.08)" : "transparent", borderLeft: isActive ? "2px solid var(--color-signal)" : "2px solid transparent" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: isActive ? "var(--color-signal)" : "var(--fg-muted)" }}>{idx + 1}.</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: isActive ? "var(--fg-primary)" : "var(--fg-secondary)" }}>{phase.name}</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.04em" }}>{done}/{phase.tasks.length}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Main Kanban View ── */}
        <main style={{ flex: 1, overflowX: "auto", overflowY: "auto", padding: "24px 28px 60px" }}>

          {/* Loading */}
          {isLoading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--radius-lg)", border: "1px solid var(--color-signal)", background: "rgba(255,182,39,0.08)", display: "flex", alignItems: "center", justifyContent: "center", animation: "spin 0.8s linear infinite" }}>
                <Loader2 size={20} style={{ color: "var(--color-signal)" }} strokeWidth={2} />
              </div>
              <div style={{ textAlign: "center" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--fg-primary)", marginBottom: 6 }}>Generating Kanban Tasks…</h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-mist)" }}>AI is analyzing the PRD and structuring your interactive board</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ fontFamily: "var(--font-body)", color: "#f87171", marginBottom: 16, fontSize: 13 }}>{error}</p>
              <button onClick={() => { setHasStarted(false); setError(null); }} style={{ padding: "8px 20px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-hairline)", background: "var(--bg-elevated)", color: "var(--fg-secondary)", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                Try Again
              </button>
            </div>
          )}

          {/* All done banner */}
          {allDone && !isFinished && !isLoading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: "var(--radius-lg)", marginBottom: 20, border: "1px solid rgba(79,209,197,0.35)", background: "rgba(79,209,197,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle2 size={18} style={{ color: "var(--color-circuit)", flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: "var(--color-circuit)", margin: "0 0 2px" }}>All tasks completed!</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--color-mist)", margin: 0 }}>Claim your Points now for completing this project.</p>
                </div>
              </div>
              <button onClick={handleFinish} disabled={isFinishing} style={{ padding: "8px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-signal)", background: "var(--color-signal)", color: "var(--color-graphite)", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: isFinishing ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", flexShrink: 0, opacity: isFinishing ? 0.7 : 1 }}>
                <Award size={12} />
                {isFinishing ? "Processing…" : "Finish & Claim +100 Points"}
              </button>
            </div>
          )}

          {/* Phase Kanban View */}
          {activePhaseData && !isLoading && (
            <div>
              {/* Phase header */}
              <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: "var(--color-signal)", lineHeight: 1 }}>
                      {(data?.phases.findIndex(p => p.id === activePhase) ?? 0) + 1}.
                    </span>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800, color: "var(--fg-primary)", letterSpacing: "-0.02em" }}>
                      {activePhaseData.name}
                    </h2>
                  </div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-mist)" }}>
                    {activePhaseData.description}
                  </p>
                </div>

                {/* Phase pagination */}
                <div style={{ display: "flex", gap: 8 }}>
                  {data && data.phases.findIndex(p => p.id === activePhase) > 0 && (
                    <button onClick={() => { const idx = data.phases.findIndex(p => p.id === activePhase); setActivePhase(data.phases[idx - 1].id); }} style={{ padding: "7px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-hairline)", background: "var(--bg-elevated)", color: "var(--fg-secondary)", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                      ← Prev Phase
                    </button>
                  )}
                  {data && data.phases.findIndex(p => p.id === activePhase) < data.phases.length - 1 && (
                    <button onClick={() => { const idx = data.phases.findIndex(p => p.id === activePhase); setActivePhase(data.phases[idx + 1].id); }} style={{ padding: "7px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-signal)", background: "var(--color-signal)", color: "var(--color-graphite)", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                      Next Phase →
                    </button>
                  )}
                </div>
              </div>

              {/* ── Drag & Drop Kanban Columns ── */}
              <DragDropContext onDragEnd={onDragEnd}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(280px, 1fr))", gap: 16, alignItems: "start" }}>
                  {KANBAN_COLUMNS.map(col => {
                    const columnTasks = activePhaseData.tasks.filter(
                      t => (taskStatus[t.id] || "todo") === col.id
                    );

                    return (
                      <div
                        key={col.id}
                        style={{
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-hairline)",
                          borderRadius: "var(--radius-lg)",
                          display: "flex",
                          flexDirection: "column",
                          maxHeight: "calc(100vh - 200px)",
                          minHeight: 400,
                        }}
                      >
                        {/* Column Header */}
                        <div
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid var(--border-hairline)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: col.bgDot,
                                flexShrink: 0,
                              }}
                            />
                            <h3
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: col.color,
                                margin: 0,
                              }}
                            >
                              {col.title}
                            </h3>
                          </div>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: "var(--radius-xs)",
                              border: `1px solid ${col.borderColor}`,
                              color: col.color,
                              background: "var(--bg-elevated)",
                            }}
                          >
                            {columnTasks.length}
                          </span>
                        </div>

                        {/* Droppable Card Area */}
                        <Droppable droppableId={col.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              style={{
                                flex: 1,
                                padding: 12,
                                overflowY: "auto",
                                background: snapshot.isDraggingOver
                                  ? "rgba(255,182,39,0.03)"
                                  : "transparent",
                                transition: "background 0.15s",
                                minHeight: 200,
                              }}
                            >
                              {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                                <div
                                  style={{
                                    height: 120,
                                    border: "1px dashed var(--border-hairline)",
                                    borderRadius: "var(--radius-md)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--fg-muted)",
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 10,
                                    letterSpacing: "0.06em",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  Drag task here
                                </div>
                              )}

                              {columnTasks.map((task, index) => (
                                <KanbanTaskCard
                                  key={task.id}
                                  task={{ ...task, status: taskStatus[task.id] || "todo" }}
                                  index={index}
                                  onToggleStatus={handleStatusChange}
                                />
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
                </div>
              </DragDropContext>

            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        aside::-webkit-scrollbar { width: 4px; }
        aside::-webkit-scrollbar-thumb { background: var(--border-hairline); border-radius: 3px; }
        main::-webkit-scrollbar { height: 6px; width: 6px; }
        main::-webkit-scrollbar-thumb { background: var(--border-hairline); border-radius: 3px; }
      `}</style>
      {/* Pro Upgrade Modal */}
      <UpgradeModal />
    </div>
  );
}

export default function TaskPage() {
  return (
    <Suspense fallback={<TaskKanbanSkeleton />}>
      <TaskPageContent />
    </Suspense>
  );
}
