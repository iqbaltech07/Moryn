import { useState } from "react";
import { Position, Handle } from "@xyflow/react";
import {
  ListTodo,
  CheckSquare,
  Loader2,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Check,
  RotateCcw,
  MessageSquareWarning,
} from "lucide-react";
import type { TaskItem } from "./types";

export function TasksGroupNode({ id, data }: { id: string; data: any }) {
  const allTasks: TaskItem[] = data.tasks || [];
  const [expanded, setExpanded] = useState(false);
  const [isEditingRevision, setIsEditingRevision] = useState(false);
  const [revisionNotesInput, setRevisionNotesInput] = useState("");

  // Separate normal implementation tasks from the final checkpoint task
  const normalTasks = allTasks.filter(
    (t) => !t.isCheckpoint && !t.title?.toLowerCase().includes("checkpoint")
  );
  const checkpointTask = allTasks.find(
    (t) => t.isCheckpoint || t.title?.toLowerCase().includes("checkpoint")
  );

  const maxDisplay = 3;
  const displayedTasks = expanded ? normalTasks : normalTasks.slice(0, maxDisplay);

  const checkpointStatus = (checkpointTask?.status || "todo").toLowerCase();
  const isCheckpointDone = checkpointStatus === "done";
  const isNeedsRevision = checkpointStatus === "needs_revision" || checkpointStatus === "error";

  const allNormalDone =
    normalTasks.length > 0 &&
    normalTasks.every((t) => (t.status || "").toLowerCase() === "done");

  const handleApprove = () => {
    if (!checkpointTask) return;
    if (data.onVerifyCheckpoint) {
      data.onVerifyCheckpoint(checkpointTask.id, "done");
    }
  };

  const handleOpenRevision = () => {
    const existing =
      checkpointTask?.notes ||
      data.checkpointNotes?.[checkpointTask?.id || ""] ||
      "";
    setRevisionNotesInput(existing);
    setIsEditingRevision(true);
  };

  const handleSaveRevision = () => {
    if (!checkpointTask) return;
    if (data.onVerifyCheckpoint) {
      data.onVerifyCheckpoint(
        checkpointTask.id,
        "needs_revision",
        revisionNotesInput.trim() || "Perlu perbaikan implementasi sebelum lanjut."
      );
    }
    setIsEditingRevision(false);
  };

  const handleCancelRevision = () => {
    setIsEditingRevision(false);
  };

  const activeNotes =
    checkpointTask?.notes ||
    data.checkpointNotes?.[checkpointTask?.id || ""] ||
    "";

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "var(--color-circuit)",
          border: "2px solid var(--bg-elevated)",
          width: 8,
          height: 8,
          left: -4,
        }}
      />

      <div
        style={{
          background: "var(--bg-elevated)",
          border: isNeedsRevision
            ? "1.5px solid rgba(239, 68, 68, 0.7)"
            : isCheckpointDone
            ? "1.5px solid rgba(16, 185, 129, 0.6)"
            : "1px solid rgba(79, 209, 197, 0.4)",
          borderRadius: 10,
          padding: "14px 16px",
          minWidth: 260,
          maxWidth: 310,
          boxShadow: isNeedsRevision
            ? "0 4px 14px rgba(239, 68, 68, 0.12)"
            : "var(--shadow-raised)",
          position: "relative",
        }}
      >
        {/* Header: Icon + TASKS (Circuit / Cyan theme) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-body)",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "var(--color-circuit)",
              textTransform: "uppercase",
            }}
          >
            <ListTodo size={12} strokeWidth={2.2} color="var(--color-circuit)" />
            <span>TASKS</span>
          </div>

          <span
            style={{
              fontSize: 9,
              fontFamily: "var(--font-mono, monospace)",
              fontWeight: 600,
              color: "var(--fg-muted)",
            }}
          >
            {normalTasks.filter((t) => t.status === "done").length}/{normalTasks.length} Done
          </span>
        </div>

        {/* Tasks List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {displayedTasks.map((t, tIdx) => {
            const st = (t.status || "todo").toLowerCase();
            const isDone = st === "done";
            const isInProgress = st === "in_progress" || st === "current";

            return (
              <div
                key={t.id || tIdx}
                style={{
                  background: isDone
                    ? "rgba(16, 185, 129, 0.08)"
                    : isInProgress
                    ? "rgba(232, 93, 63, 0.08)"
                    : "var(--bg-surface)",
                  border: isDone
                    ? "1px solid rgba(16, 185, 129, 0.3)"
                    : isInProgress
                    ? "1px solid rgba(232, 93, 63, 0.3)"
                    : "1px solid var(--border-hairline)",
                  borderRadius: "var(--radius-sm)",
                  padding: "7px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.15s ease",
                }}
              >
                {/* Status Checkbox Icon */}
                {isDone ? (
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: "#10B981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                    title="Selesai (DONE)"
                  >
                    <CheckSquare size={11} color="#FFFFFF" strokeWidth={3} />
                  </div>
                ) : isInProgress ? (
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      border: "1.5px solid var(--color-signal)",
                      background: "rgba(232, 93, 63, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                    title="Sedang Dikerjakan (IN_PROGRESS)"
                  >
                    <Loader2 size={9} color="var(--color-signal)" className="animate-spin" strokeWidth={2.5} />
                  </div>
                ) : (
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      border: "1.5px solid var(--border-strong)",
                      background: "var(--bg-elevated)",
                      flexShrink: 0,
                    }}
                    title="Belum Dikerjakan (TODO)"
                  />
                )}

                {/* Task Title */}
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 11.5,
                    color: isDone ? "var(--fg-muted)" : isInProgress ? "var(--color-signal)" : "var(--fg-primary)",
                    fontWeight: isInProgress ? 600 : 500,
                    lineHeight: 1.35,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flex: 1,
                  }}
                >
                  {t.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer count toggle */}
        {normalTasks.length > maxDisplay && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              marginTop: 6,
              marginBottom: 4,
              background: "transparent",
              border: "none",
              color: "var(--color-circuit)",
              fontFamily: "var(--font-body)",
              fontSize: 9,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 3,
              padding: 0,
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            <span>{expanded ? "Sembunyikan" : `Lihat semua (${normalTasks.length})`}</span>
            <ChevronRight size={10} />
          </button>
        )}

        {/* ── MANDATORY CHECKPOINT GATE (Akhir Setiap Task) ── */}
        {checkpointTask && (
          <div
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: "1px dashed var(--border-hairline)",
            }}
          >
            <div
              style={{
                background: isNeedsRevision
                  ? "rgba(239, 68, 68, 0.08)"
                  : isCheckpointDone
                  ? "rgba(16, 185, 129, 0.08)"
                  : "rgba(245, 158, 11, 0.08)",
                border: isNeedsRevision
                  ? "1px solid rgba(239, 68, 68, 0.35)"
                  : isCheckpointDone
                  ? "1px solid rgba(16, 185, 129, 0.35)"
                  : "1px solid rgba(245, 158, 11, 0.35)",
                borderRadius: 7,
                padding: "9px 10px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {/* Checkpoint Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {isCheckpointDone ? (
                    <ShieldCheck size={13} color="#10B981" />
                  ) : isNeedsRevision ? (
                    <ShieldAlert size={13} color="#EF4444" />
                  ) : (
                    <ShieldAlert size={13} color="#F59E0B" />
                  )}
                  <span
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: 9.5,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: isCheckpointDone
                        ? "#10B981"
                        : isNeedsRevision
                        ? "#EF4444"
                        : "#F59E0B",
                    }}
                  >
                    CHECKPOINT
                  </span>
                </div>

                {/* Status Badge */}
                <span
                  style={{
                    fontSize: 8.5,
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 9999,
                    background: isCheckpointDone
                      ? "#10B981"
                      : isNeedsRevision
                      ? "rgba(239, 68, 68, 0.18)"
                      : "rgba(245, 158, 11, 0.18)",
                    color: isCheckpointDone ? "#ffffff" : isNeedsRevision ? "#EF4444" : "#D97706",
                  }}
                >
                  {isCheckpointDone
                    ? "DISETUJUI"
                    : isNeedsRevision
                    ? "PERLU PERBAIKAN"
                    : allNormalDone
                    ? "VERIFIKASI"
                    : "MENUNGGU TASK"}
                </span>
              </div>

              {/* Checkpoint Subtitle & Guidance */}
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 10,
                  color: "var(--fg-secondary)",
                  lineHeight: 1.35,
                }}
              >
                {isCheckpointDone
                  ? "Implementasi telah diverifikasi dan disetujui untuk lanjut."
                  : isNeedsRevision
                  ? "Hasil belum sesuai. Lakukan perbaikan terlebih dahulu sebelum melanjutkan."
                  : "Verifikasi hasil implementasi sebelum melanjutkan ke fase berikutnya."}
              </div>

              {/* Revision note box if present */}
              {isNeedsRevision && activeNotes && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    borderRadius: 5,
                    padding: "5px 7px",
                    fontFamily: "var(--font-body)",
                    fontSize: 9.5,
                    color: "#B91C1C",
                    lineHeight: 1.3,
                  }}
                >
                  <strong>Catatan Perbaikan:</strong> {activeNotes}
                </div>
              )}

              {/* Inline Revision Input Form */}
              {isEditingRevision ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
                  <textarea
                    value={revisionNotesInput}
                    onChange={(e) => setRevisionNotesInput(e.target.value)}
                    placeholder="Tuliskan catatan perbaikan yang harus diperbaiki..."
                    rows={2}
                    style={{
                      width: "100%",
                      fontSize: 10,
                      fontFamily: "var(--font-body)",
                      padding: "5px 7px",
                      borderRadius: 4,
                      border: "1px solid var(--border-strong)",
                      background: "var(--bg-surface)",
                      color: "var(--fg-primary)",
                      resize: "none",
                      outline: "none",
                    }}
                  />
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <button
                      onClick={handleCancelRevision}
                      style={{
                        padding: "3px 8px",
                        fontSize: 9,
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        borderRadius: 4,
                        border: "1px solid var(--border-hairline)",
                        background: "transparent",
                        color: "var(--fg-muted)",
                        cursor: "pointer",
                      }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveRevision}
                      style={{
                        padding: "3px 8px",
                        fontSize: 9,
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        borderRadius: 4,
                        border: "none",
                        background: "#EF4444",
                        color: "#FFFFFF",
                        cursor: "pointer",
                      }}
                    >
                      Minta Perbaikan
                    </button>
                  </div>
                </div>
              ) : (
                /* Verification Action Buttons */
                <div style={{ display: "flex", gap: 5, marginTop: 2 }}>
                  {isCheckpointDone ? (
                    <button
                      onClick={handleOpenRevision}
                      title="Perlu perbaikan ulang"
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        padding: "5px 8px",
                        borderRadius: 5,
                        border: "1px solid var(--border-hairline)",
                        background: "var(--bg-elevated)",
                        color: "var(--fg-muted)",
                        fontSize: 9.5,
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <RotateCcw size={10} />
                      <span>Tinjau Ulang</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleOpenRevision}
                        title="Minta perbaikan jika hasil belum sesuai"
                        style={{
                          flex: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          padding: "5px 6px",
                          borderRadius: 5,
                          border: isNeedsRevision
                            ? "1px solid rgba(239, 68, 68, 0.4)"
                            : "1px solid var(--border-hairline)",
                          background: isNeedsRevision ? "rgba(239, 68, 68, 0.12)" : "var(--bg-elevated)",
                          color: isNeedsRevision ? "#DC2626" : "var(--fg-secondary)",
                          fontSize: 9.5,
                          fontFamily: "var(--font-body)",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <MessageSquareWarning size={10} />
                        <span>{isNeedsRevision ? "Ubah Catatan" : "Perbaikan"}</span>
                      </button>

                      <button
                        onClick={handleApprove}
                        title="Setujui implementasi untuk lanjut ke fase berikutnya"
                        style={{
                          flex: 1.2,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          padding: "5px 8px",
                          borderRadius: 5,
                          border: "none",
                          background: "#10B981",
                          color: "#FFFFFF",
                          fontSize: 9.5,
                          fontFamily: "var(--font-body)",
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 1px 3px rgba(16, 185, 129, 0.25)",
                        }}
                      >
                        <Check size={11} strokeWidth={2.8} />
                        <span>Setujui</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

