"use client";

import { useEffect, useState, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Sprout, Compass, PenLine, LayoutList, Lightbulb,
  Map, Timer, Telescope, Trophy, Wrench,
  CheckCircle2, PartyPopper, Award, ArrowRight, Check,
  Plus, MoreHorizontal, LayoutGrid, List, Cpu, RefreshCw, RotateCw, Download,
  Terminal, PanelsTopLeft, Server, Layers, ShieldCheck, AlertCircle, X, ChevronRight,
  Database
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { StepNavbar, ProjectHeaderBrand } from "../components/layout";
import { McpConnectModal, UpgradeModal } from "../components/modals";
import { TaskKanbanSkeleton } from "../components/shared";
import { apiClient } from "@/lib/utils/apiClient";
import { useKanbanStore, ColumnId } from "@/stores/useKanbanStore";
import { useUiStore } from "@/stores/useUiStore";
import { useTranslation } from "@/lib/i18n";

/* ─── Types ─── */
interface Task {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low" | "blocker";
  estimasi: string;
  tags: string[];
  status?: ColumnId;
  code?: string;
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
  savedStatus?: Record<string, any>;
  error?: string;
}

interface FinishResult {
  expGained: number;
  newExp: number;
  rank: { id: number; name: string; icon: string; color: string };
}

interface KanbanColumn {
  id: ColumnId;
  title: string;
  dotColor: string;
  countBg: string;
  countText: string;
  isErrorCol?: boolean;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "todo",        title: "TO DO",       dotColor: "#71717a", countBg: "bg-neutral-200/70", countText: "text-neutral-700" },
  { id: "in_progress", title: "IN PROGRESS", dotColor: "#e15b39", countBg: "bg-orange-100",    countText: "text-[#e15b39]" },
  { id: "done",        title: "COMPLETE",    dotColor: "#10b981", countBg: "bg-emerald-100",   countText: "text-emerald-700" },
  { id: "error",       title: "ERROR",       dotColor: "#ef4444", countBg: "bg-rose-100",      countText: "text-rose-700", isErrorCol: true },
];

const RANK_ICONS: Record<string, LucideIcon> = { Sprout, Compass, PenLine, LayoutList, Lightbulb, Map, Timer, Telescope, Trophy, Wrench };

/* ─── Helper: Format Task ID Code (e.g. ENV-101, FE-102) ─── */
function getTaskCode(phaseName: string, phaseIndex: number, taskIndex: number, customCode?: string): string {
  if (customCode && /^[A-Z]{2,4}-\d+$/i.test(customCode)) {
    return customCode.toUpperCase();
  }
  const clean = phaseName.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  let prefix = "TSK";
  if (words.length >= 2) {
    prefix = (words[0].slice(0, 2) + words[1].slice(0, 1)).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 3) {
    prefix = words[0].slice(0, 3).toUpperCase();
  }
  return `${prefix}-${(phaseIndex + 1) * 100 + (taskIndex + 1)}`;
}



/* ─── Kanban Card Component ─── */
function KanbanTaskCard({
  task,
  index,
  phaseName,
  phaseIndex,
  onToggleStatus,
}: {
  task: Task;
  index: number;
  phaseName: string;
  phaseIndex: number;
  onToggleStatus: (taskId: string, newStatus: ColumnId) => void;
}) {
  const isDone = task.status === "done";
  const isInProgress = task.status === "in_progress";
  const isError = task.status === "error";

  const taskCode = getTaskCode(phaseName, phaseIndex, index, task.code);
  const isBlocker = task.priority === "blocker" || task.tags?.includes("blocker");
  const isHigh = task.priority === "high";

  // Card status quick-switcher menu state
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3 select-none outline-none group/card"
          style={provided.draggableProps.style}
        >
          <div
            className={`relative p-3.5 sm:p-4 rounded-xl transition-all duration-150 cursor-grab active:cursor-grabbing bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${
              snapshot.isDragging
                ? "shadow-lg scale-[1.02] border-[#e15b39] ring-2 ring-[#e15b39]/20"
                : isInProgress
                ? "border-2 border-[#e15b39]"
                : isError
                ? "border border-rose-300 bg-rose-50/20"
                : "border border-neutral-200/90 hover:border-neutral-300"
            }`}
          >
            {/* Top Row: Task Code & Priority Badge */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                {isDone && (
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                )}
                <span className="font-mono text-[10px] font-semibold text-neutral-600 bg-neutral-100/90 border border-neutral-200 px-1.5 py-0.5 rounded tracking-tight">
                  {taskCode}
                </span>
              </div>

              {/* Priority / Status Tag */}
              <div className="flex items-center gap-1.5">
                {isDone ? (
                  <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/80">
                    Merged
                  </span>
                ) : isBlocker ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    Blocker
                  </span>
                ) : isHigh ? (
                  <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    High
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                    Normal
                  </span>
                )}

                {/* Quick Status Toggle Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(!menuOpen);
                    }}
                    className="opacity-0 group-hover/card:opacity-100 p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-opacity"
                    title="Move status"
                  >
                    <MoreHorizontal size={13} />
                  </button>

                  {menuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                        }}
                      />
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-6 z-40 w-36 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 text-xs"
                      >
                        <div className="px-2 py-1 text-[10px] font-bold text-neutral-400 uppercase font-mono border-b border-neutral-100">
                          Move to
                        </div>
                        {KANBAN_COLUMNS.map((col) => (
                          <button
                            key={col.id}
                            onClick={() => {
                              onToggleStatus(task.id, col.id);
                              setMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between text-[11px] hover:bg-neutral-50 ${
                              task.status === col.id ? "font-bold text-[#e15b39]" : "text-neutral-700"
                            }`}
                          >
                            <span>{col.title}</span>
                            {task.status === col.id && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <h4
              className={`font-sans text-[13px] font-bold text-neutral-900 leading-snug mb-1.5 ${
                isDone ? "line-through text-neutral-400" : ""
              }`}
            >
              {task.title}
            </h4>

            {/* Description */}
            <p className="font-sans text-[11px] text-neutral-500 leading-relaxed line-clamp-3 mb-2.5">
              {task.description}
            </p>

            {/* Tags (if any) */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500"
                  >
                    #{tag}
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
  const { t } = useTranslation();
  const RankIcon = RANK_ICONS[result.rank.icon] ?? Award;
  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-200 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="h-1 bg-[#e15b39]" />
        <div className="p-8 text-center">
          <PartyPopper size={44} strokeWidth={1.5} className="text-[#e15b39] mx-auto mb-4" />
          <div className="font-mono text-[10px] font-bold tracking-wider uppercase text-[#e15b39] mb-2">
            {t.task.projectComplete}
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2 font-display">
            {t.task.projectComplete}
          </h2>
          <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
            {t.task.projectCompleteDesc}
          </p>

          <div className="inline-flex items-center gap-2 border border-neutral-200 rounded-xl px-5 py-2.5 mb-5 bg-neutral-50">
            <Award size={18} className="text-[#e15b39]" />
            <span className="font-mono text-xl font-bold text-[#e15b39]">
              +{result.expGained} {result.expGained === 1 ? "Point" : "Points"}
            </span>
          </div>

          <div className="flex items-center gap-3 border border-neutral-200 rounded-xl p-3 mb-6 bg-neutral-50 text-left">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white"
              style={{ background: result.rank.color }}
            >
              <RankIcon size={18} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono mb-0.5">{t.task.currentRank}</p>
              <p className="text-sm font-bold text-neutral-900">{result.rank.name}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono mb-0.5">{t.task.totalPoints}</p>
              <p className="font-mono text-sm font-bold text-[#e15b39]">{result.newExp.toLocaleString("id-ID")}</p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors"
            >
              {t.task.close}
            </button>
            <Link
              href="/dashboard/settings?tab=account"
              className="flex-1 py-2 rounded-lg bg-[#e15b39] text-white text-xs font-semibold hover:bg-[#c44827] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{t.task.viewAccount}</span>
              <ArrowRight size={12} />
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
  const { t, isId } = useTranslation();
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
  const [celebration, setCelebration] = useState<FinishResult | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showMcpModal, setShowMcpModal] = useState(false);

  // Priority Scope Filter: null = all, or "blocker" | "high" | "normal"
  const [priorityFilter, setPriorityFilter] = useState<"blocker" | "high" | "normal" | null>(null);

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

  // Smart Real-Time Auto-Sync: Adaptive polling to prevent log flooding
  useEffect(() => {
    if (!projectId || !data) return;

    let timeoutId: NodeJS.Timeout;
    let currentInterval = 15000;
    let isSubscribed = true;

    const pollTaskStatus = async () => {
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
          currentInterval = 15000;
        } else {
          currentInterval = Math.min(currentInterval + 5000, 45000);
        }
      } catch {
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
    
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/projects/update", blob);
      if (sent) {
        isDirtyRef.current = false;
        return;
      }
    }
    
    apiClient.projects.update({ projectId, checkedTasks: latestTaskStatusRef.current })
      .then(() => {
        isDirtyRef.current = false;
      })
      .catch((e) => console.warn("Failed to sync kanban status on leave:", e));
  };

  useEffect(() => {
    const handleBeforeUnload = () => syncToDatabase();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") syncToDatabase();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      syncToDatabase();
    };
  }, [projectId]);

  // Local-First update handler
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

  const allTasks = useMemo(() => {
    if (!data) return [];
    return data.phases.flatMap((p) => p.tasks);
  }, [data]);

  const progress = useMemo(() => {
    if (allTasks.length === 0) return { done: 0, total: 0, remaining: 0, pct: 0 };
    const done = allTasks.filter((t) => taskStatus[t.id] === "done").length;
    const total = allTasks.length;
    const remaining = Math.max(total - done, 0);
    const pct = Math.round((done / total) * 100);
    return { done, total, remaining, pct };
  }, [allTasks, taskStatus]);

  // Priority count aggregations for sidebar
  const priorityCounts = useMemo(() => {
    let blocker = 0;
    let high = 0;
    let normal = 0;

    allTasks.forEach((t) => {
      if (t.priority === "blocker" || t.tags?.includes("blocker")) blocker++;
      else if (t.priority === "high") high++;
      else normal++;
    });

    return { blocker, high, normal };
  }, [allTasks]);

  const activePhaseIndex = useMemo(() => {
    if (!data || !activePhase) return 0;
    const idx = data.phases.findIndex((p) => p.id === activePhase);
    return idx >= 0 ? idx : 0;
  }, [data, activePhase]);

  const activePhaseData = useMemo(() => {
    if (!data) return null;
    return data.phases[activePhaseIndex] || data.phases[0] || null;
  }, [data, activePhaseIndex]);

  // Filter tasks in active phase by priority if priorityFilter is active
  const filteredPhaseTasks = useMemo(() => {
    if (!activePhaseData) return [];
    if (!priorityFilter) return activePhaseData.tasks;

    return activePhaseData.tasks.filter((t) => {
      const isBlk = t.priority === "blocker" || t.tags?.includes("blocker");
      if (priorityFilter === "blocker") return isBlk;
      if (priorityFilter === "high") return t.priority === "high" && !isBlk;
      if (priorityFilter === "normal") return t.priority !== "high" && !isBlk;
      return true;
    });
  }, [activePhaseData, priorityFilter]);

  const allDone = progress.total > 0 && progress.pct === 100;

  const handleFinish = async () => {
    if (!projectId || !data || isFinishing) return;
    setIsFinishing(true);
    const checkedMap: Record<string, boolean> = {};
    Object.keys(taskStatus).forEach((id) => {
      checkedMap[id] = taskStatus[id] === "done";
    });

    try {
      const json = await apiClient.projects.finish({ projectId, checkedTasks: checkedMap });
      setIsFinished(true);
      setCelebration(json);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyelesaikan project.");
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
        md += `## ${i + 1}. ${ph.name}\n\n`;
        ph.tasks.forEach((t) => {
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

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#FCFBF8] text-neutral-900 flex flex-col font-sans">
      {celebration && <CelebrationModal result={celebration} onClose={() => setCelebration(null)} />}
      {showMcpModal && projectId && (
        <McpConnectModal
          projectId={projectId}
          appName={data?.phases?.[0]?.name}
          onClose={() => setShowMcpModal(false)}
        />
      )}

      {/* ── Topbar (Preserved exactly as requested) ── */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: 56,
          borderBottom: "1px solid var(--border-hairline)",
          background: "rgba(252, 251, 248, 0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        <ProjectHeaderBrand projectId={projectId} />
        <StepNavbar currentStep="task" projectId={projectId} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
          {/* Sync PRD Button */}
          <button
            onClick={() => fetchTasks(true)}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Sync tasks with latest PRD and Structure changes"
          >
            <RefreshCw size={12} className={isSyncing ? "animate-spin text-[#e15b39]" : "text-neutral-500"} />
            <span>{isSyncing ? t.task.syncing : t.task.syncPrd}</span>
          </button>

          {/* Connect AI Button */}
          <button
            onClick={() => setShowMcpModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer shadow-2xs"
            title="Connect MCP AI Agent"
          >
            <Cpu size={12} className="text-neutral-500" />
            <span>{t.task.connectAi}</span>
          </button>

          {/* Export Kanban */}
          <button
            onClick={handleExport}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 text-xs font-medium hover:bg-neutral-50 transition-colors cursor-pointer shadow-2xs"
            title="Export Kanban as Markdown"
          >
            <Download size={12} className="text-neutral-400" />
            <span className="hidden xl:inline">{t.task.export}</span>
          </button>

          <Link
            href="/dashboard"
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
              textDecoration: "none",
              transition: "opacity 0.15s, transform 0.1s",
            }}
          >
            <span>{t.task.newProject}</span>
          </Link>
        </div>
      </header>

      {/* ── Main Layout Body ── */}
      <div className="pt-14 flex flex-1 overflow-hidden h-full">
        
        {/* ── Left Sidebar: Categories, Progress & Priority Scope ── */}
        <aside className="w-64 sm:w-72 shrink-0 border-r border-neutral-200/80 bg-white/70 backdrop-blur-sm flex flex-col overflow-y-auto">
          <div className="p-4 flex flex-col gap-5">
            
            {/* 1. Sprint Foundation Progress Widget */}
            <div className="p-3.5 rounded-xl bg-white border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  {t.task.sprintFoundation}
                </span>
                <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/80">
                  {progress.pct}% {t.task.completed}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-[#e15b39] rounded-full transition-all duration-300"
                  style={{ width: `${progress.pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                <span>{t.task.tasksDone(progress.done, progress.total)}</span>
                <span className="text-neutral-400">{t.task.remaining(progress.remaining)}</span>
              </div>
            </div>

            {/* 2. Categories / Modules Navigation */}
            <div>
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  {t.task.categories}
                </span>
                <span className="text-[11px] text-neutral-400 font-medium">
                  {t.task.modules(data?.phases?.length || 0)}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-9 rounded-lg bg-neutral-100/70 animate-pulse mb-1" />
                  ))
                ) : (
                  data?.phases.map((phase, idx) => {
                    const isActive = activePhase === phase.id;
                    const phaseTaskCount = phase.tasks.length;
                    const rawName = phase.name.replace(/^\d+[\.\)]\s*/, "");
                    const displayName = `${idx + 1}. ${rawName}`;

                    return (
                      <button
                        key={phase.id}
                        onClick={() => setActivePhase(phase.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-all duration-150 text-[12px] select-none ${
                          isActive
                            ? "bg-[#e15b39]/8 border border-[#e15b39]/25 text-[#e15b39] font-semibold shadow-xs"
                            : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/60 border border-transparent font-medium"
                        }`}
                      >
                        <span className="truncate pr-2">{displayName}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                            isActive
                              ? "bg-[#e15b39]/15 text-[#e15b39] font-bold"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {phaseTaskCount}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3. Priority Scope Filter Pills */}
            <div>
              <div className="px-1 mb-2">
                <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  {t.task.priorityScope}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPriorityFilter(priorityFilter === "blocker" ? null : "blocker")}
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md border transition-all ${
                      priorityFilter === "blocker"
                        ? "bg-rose-100 text-rose-700 border-rose-400 font-bold shadow-xs"
                        : "bg-rose-50/70 text-rose-600 border-rose-200/80 hover:bg-rose-100/60"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>{t.task.blocker} ({priorityCounts.blocker})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriorityFilter(priorityFilter === "high" ? null : "high")}
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md border transition-all ${
                      priorityFilter === "high"
                        ? "bg-amber-100 text-amber-800 border-amber-400 font-bold shadow-xs"
                        : "bg-amber-50/70 text-amber-700 border-amber-200/80 hover:bg-amber-100/60"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{t.task.high} ({priorityCounts.high})</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPriorityFilter(priorityFilter === "normal" ? null : "normal")}
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md border transition-all ${
                      priorityFilter === "normal"
                        ? "bg-slate-200 text-slate-800 border-slate-400 font-bold shadow-xs"
                        : "bg-neutral-100/80 text-neutral-600 border-neutral-200 hover:bg-neutral-200/60"
                    }`}
                  >
                    <span>{t.task.normal} ({priorityCounts.normal})</span>
                  </button>

                  {priorityFilter && (
                    <button
                      type="button"
                      onClick={() => setPriorityFilter(null)}
                      className="text-[10px] text-neutral-400 hover:text-neutral-700 underline underline-offset-2 ml-1"
                    >
                      {isId ? "Bersihkan" : "Clear"}
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* ── Main Kanban Workspace Area (Zero Page-Level Scroll) ── */}
        <main className="flex-1 min-w-0 overflow-hidden flex flex-col p-4 sm:p-6 bg-[#FCFBF8]">
          
          {/* Error Banner */}
          {error && !isLoading && (
            <div className="max-w-md mx-auto text-center py-6 bg-white border border-rose-200 rounded-2xl p-6 shadow-xs mb-4 shrink-0">
              <AlertCircle size={32} className="text-rose-500 mx-auto mb-2" />
              <p className="text-xs text-neutral-800 font-medium mb-3">{error}</p>
              <button
                onClick={() => { setHasStarted(false); setError(null); }}
                className="px-3.5 py-1.5 rounded-lg bg-[#e15b39] text-white text-xs font-semibold hover:bg-[#c44827] transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* All Done Completion Banner */}
          {allDone && !isFinished && !isLoading && (
            <div className="flex items-center justify-between p-3.5 rounded-xl mb-4 border border-teal-300 bg-teal-50/50 shadow-xs shrink-0">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-teal-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-teal-900 mb-0.5">Semua task pada project ini telah selesai!</p>
                  <p className="text-[11px] text-teal-700">Klaim poin reputasi Anda sekarang untuk menyelesaikan project.</p>
                </div>
              </div>
              <button
                onClick={handleFinish}
                disabled={isFinishing}
                className="px-3.5 py-1.5 rounded-lg bg-[#e15b39] text-white text-xs font-bold hover:bg-[#c44827] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Award size={13} />
                <span>{isFinishing ? "Memproses..." : "Finish & Claim +100 Points"}</span>
              </button>
            </div>
          )}

          {/* Active Phase Header & Subtitle */}
          {activePhaseData && (
            <div className="mb-4 shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 font-display tracking-tight mb-0.5">
                {activePhaseData.name}
              </h2>
              <p className="text-xs text-neutral-500 max-w-2xl leading-relaxed">
                {activePhaseData.description || "Sprint foundation, repository architecture, and infrastructure configuration tasks"}
              </p>
            </div>
          )}

          {/* 4-Column Drag & Drop Board (Full Width, Zero Page Scroll) */}
          {activePhaseData && (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex-1 min-h-0 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch w-full h-full">
                  {KANBAN_COLUMNS.map((col) => {
                    const columnTasks = filteredPhaseTasks.filter(
                      (t) => (taskStatus[t.id] || "todo") === col.id
                    );

                    return (
                      <div
                        key={col.id}
                        className={`w-full flex flex-col rounded-2xl p-3 sm:p-3.5 transition-colors border h-full overflow-hidden ${
                          col.isErrorCol
                            ? "bg-[#FFF9F9] border-rose-200/80"
                            : "bg-[#F7F6F2] border-neutral-200/80"
                        }`}
                      >
                        {/* Column Header */}
                        <div className="flex items-center justify-between px-1 mb-2.5 shrink-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: col.dotColor }}
                            />
                            <span className="font-mono text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                              {col.title}
                            </span>
                            <span
                              className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ${col.countBg} ${col.countText}`}
                            >
                              {columnTasks.length}
                            </span>
                          </div>

                          {/* Column Action Button (Plus or Refresh) */}
                          {col.isErrorCol ? (
                            <button
                              type="button"
                              onClick={() => {
                                toast.info("Memeriksa error pada task...");
                              }}
                              className="p-1 rounded text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Retry error tasks"
                            >
                              <RotateCw size={13} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                toast.info(`Tambah task baru ke ${col.title}`);
                              }}
                              className="p-1 rounded text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                              title="Add task"
                            >
                              <Plus size={14} />
                            </button>
                          )}
                        </div>

                        {/* Droppable Column Area with Internal Vertical Scrolling */}
                        <Droppable droppableId={col.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`flex flex-col flex-1 overflow-y-auto pr-1 rounded-xl transition-colors p-1 kanban-column-scroll min-h-0 ${
                                snapshot.isDraggingOver
                                  ? "bg-neutral-200/40"
                                  : ""
                              }`}
                            >
                              {columnTasks.map((task, idx) => (
                                <KanbanTaskCard
                                  key={task.id}
                                  task={task}
                                  index={idx}
                                  phaseName={activePhaseData.name}
                                  phaseIndex={activePhaseIndex}
                                  onToggleStatus={handleStatusChange}
                                />
                              ))}
                              {provided.placeholder}

                              {/* Empty column hint */}
                              {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-neutral-200/90 rounded-xl p-6 text-center text-neutral-400">
                                  <span className="text-[11px] font-medium">No tasks in {col.title.toLowerCase()}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
                </div>
              </div>
            </DragDropContext>
          )}

        </main>
      </div>

      <style>{`
        .kanban-column-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
        }
        .kanban-column-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .kanban-column-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .kanban-column-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 9999px;
        }
        .kanban-column-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.28);
        }
      `}</style>
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
