"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderOpen, CheckCircle2, Calendar, Award, Trash2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/utils/apiClient";

type Project = { id: string; appName: string; appIdea: string; status: string; createdAt: Date; };

export default function ProfileProjects({ projects }: { projects: Project[] }) {
  const router  = useRouter();
  const [filter,   setFilter]  = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm("Delete this project?")) return;
    setDeleting(id);
    try {
      await apiClient.projects.delete(id);
      toast.success("Project deleted");
      router.refresh();
    } catch (err: any) { toast.error(err.message); }
    finally { setDeleting(null); }
  };

  const finished   = projects.filter(p => p.status === "FINISHED");
  const inProgress = projects.filter(p => p.status !== "FINISHED");
  const displayed  = filter === "all" ? projects : filter === "finished" ? finished : inProgress;

  const tabs = [
    { id: "all",         label: `All (${projects.length})` },
    { id: "finished",    label: `Finished (${finished.length})` },
    { id: "in_progress", label: `In Progress (${inProgress.length})` },
  ];

  return (
    <div>
      {/* ── Section header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 14,
      }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
          letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--fg-muted)",
        }}>
          My Projects
        </span>
        <Link href="/generate" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "7px 14px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-signal)",
          background: "var(--color-signal)",
          color: "#ffffff",
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none",
        }}>
          + New Project
        </Link>
      </div>

      {/* ── Filter tabs ── */}
      {projects.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id)} style={{
              padding: "5px 13px",
              borderRadius: "var(--radius-xs)",
              fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              border: filter === tab.id
                ? "1px solid var(--color-signal)"
                : "1px solid var(--border-hairline)",
              background: filter === tab.id ? "rgba(255,182,39,0.08)" : "var(--bg-elevated)",
              color: filter === tab.id ? "var(--color-signal)" : "var(--fg-muted)",
              cursor: "pointer", transition: "all 0.12s",
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {displayed.length === 0 && (
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-hairline)",
          borderRadius: "var(--radius-lg)",
          padding: "56px 32px",
          textAlign: "center",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-hairline)", background: "var(--bg-elevated)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
          }}>
            <FolderOpen size={22} style={{ color: "var(--fg-muted)" }} />
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--fg-primary)", marginBottom: 6 }}>
            No Projects Yet
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-mist)", maxWidth: 320, margin: "0 auto 20px", lineHeight: 1.6 }}>
            Start planning your first app and earn your first Points!
          </p>
          <Link href="/generate" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 18px", borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-signal)", background: "var(--color-signal)",
            color: "#ffffff", fontFamily: "var(--font-mono)", fontSize: 10,
            fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none",
          }}>
            Generate PRD Now <ChevronRight size={11} />
          </Link>
        </div>
      )}

      {/* ── Project grid ── */}
      {displayed.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 12,
        }}>
          {displayed.map((project) => {
            const isFinished = project.status === "FINISHED";
            const preview    = project.appIdea.length > 110
              ? project.appIdea.slice(0, 110) + "…"
              : project.appIdea;

            return (
              <Link
                key={project.id}
                href={`/detail?projectId=${project.id}`}
                style={{ textDecoration: "none", display: "flex" }}
              >
                <div style={{
                  flex: 1,
                  display: "flex", flexDirection: "column",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: "var(--radius-lg)",
                  padding: "18px 20px",
                  position: "relative",
                  transition: "background 0.12s, border-color 0.12s",
                  /* left accent */
                  borderLeft: `3px solid ${isFinished ? "var(--color-circuit)" : "var(--border-hairline)"}`,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "var(--bg-elevated)";
                  el.style.borderColor = isFinished ? "var(--color-circuit)" : "var(--color-mist)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "var(--bg-surface)";
                  el.style.borderColor = isFinished ? "var(--color-circuit)" : "var(--border-hairline)";
                }}
                >
                  {/* ── Top row: icon + status + delete ── */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* Status icon */}
                      <div style={{
                        width: 30, height: 30,
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-hairline)",
                        background: "var(--bg-elevated)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: isFinished ? "var(--color-circuit)" : "var(--color-mist)",
                        flexShrink: 0,
                      }}>
                        {isFinished
                          ? <CheckCircle2 size={14} strokeWidth={2} />
                          : <FolderOpen size={14} strokeWidth={2} />
                        }
                      </div>
                      {/* Status label */}
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: "var(--radius-xs)",
                        border: "1px solid var(--border-hairline)",
                        color: isFinished ? "var(--color-circuit)" : "var(--color-mist)",
                      }}>
                        {isFinished ? "Finished" : "In Progress"}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDelete(e, project.id)}
                      disabled={deleting === project.id}
                      aria-label="Delete project"
                      style={{
                        width: 26, height: 26,
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-hairline)",
                        background: "transparent",
                        color: "var(--fg-muted)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: deleting === project.id ? "not-allowed" : "pointer",
                        opacity: deleting === project.id ? 0.4 : 1,
                        transition: "all 0.12s",
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget;
                        el.style.color = "#f87171";
                        el.style.borderColor = "rgba(248,113,113,0.45)";
                        el.style.background = "rgba(248,113,113,0.07)";
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget;
                        el.style.color = "var(--fg-muted)";
                        el.style.borderColor = "var(--border-hairline)";
                        el.style.background = "transparent";
                      }}
                    >
                      <Trash2 size={12} strokeWidth={2} />
                    </button>
                  </div>

                  {/* ── Body: title + description ── */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700,
                      color: "var(--fg-primary)", marginBottom: 6, lineHeight: 1.3,
                    }}>
                      {project.appName}
                    </h3>
                    <p style={{
                      fontFamily: "var(--font-body)", fontSize: 12,
                      color: "var(--color-mist)", lineHeight: 1.6,
                    }}>
                      {preview}
                    </p>
                  </div>

                  {/* ── Footer: date + points ── */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    borderTop: "1px solid var(--border-hairline)", paddingTop: 12, marginTop: 14,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Calendar size={11} style={{ color: "var(--fg-muted)" }} />
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: 9,
                        color: "var(--fg-muted)", letterSpacing: "0.04em",
                      }}>
                        {new Date(project.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    {isFinished && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Award size={11} style={{ color: "var(--color-signal)" }} />
                        <span style={{
                          fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
                          color: "var(--color-signal)", letterSpacing: "0.06em",
                        }}>
                          +100 pts
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
