"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { FolderGit2, Lightbulb, Pencil, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/utils/apiClient";
import { useProjectStore } from "@/stores/useProjectStore";

interface ProjectInfo {
  id: string;
  appName: string;
  appIdea: string;
  title?: string;
}

export default function ProjectHeaderBrand({
  projectId,
}: {
  projectId: string | null;
}) {
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { updateProjectLocally } = useProjectStore();

  // Edit Modal State
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editIdea, setEditIdea] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const displayName = project?.appName || project?.title || "Untitled Project";
  const ideaText = project?.appIdea || "";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    apiClient.projects.get(projectId)
      .then((data) => {
        if (isMounted && data) {
          const resolvedName = data.appName || data.title || "Untitled Project";
          setProject({
            ...data,
            appName: resolvedName,
          });
          setEditName(resolvedName);
          setEditIdea(data.appIdea || "");
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const openEditModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentName = project?.appName || project?.title || displayName || "";
    setEditName(currentName === "Untitled Project" ? "" : currentName);
    setEditIdea(project?.appIdea || "");
    setShowTooltip(false);
    setIsEditingModalOpen(true);
  };

  const handleSaveProjectInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !editName.trim() || isSaving) return;

    const finalName = editName.trim();
    const finalIdea = editIdea.trim();

    setIsSaving(true);
    try {
      await apiClient.projects.update({
        projectId,
        appName: finalName,
        appIdea: finalIdea,
      });

      setProject((prev) =>
        prev
          ? {
              ...prev,
              appName: finalName,
              title: finalName,
              appIdea: finalIdea,
            }
          : {
              id: projectId,
              appName: finalName,
              title: finalName,
              appIdea: finalIdea,
            }
      );
      updateProjectLocally({ appName: finalName, appIdea: finalIdea });
      setIsEditingModalOpen(false);
      toast.success("Project info updated successfully!");

      window.dispatchEvent(
        new CustomEvent("projectUpdated", {
          detail: { appName: finalName, appIdea: finalIdea },
        })
      );
    } catch {
      toast.error("Connection error while updating project info");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 12,
          minWidth: 0,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Image
            src="/logo/Moryn-Light-Mode.webp"
            alt="Moryn"
            width={800}
            height={200}
            style={{ height: 28, width: "auto" }}
          />
        </Link>

        {/* Separator / Divider */}
        {projectId && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "14px",
              color: "var(--border-strong)",
              flexShrink: 0,
              userSelect: "none",
            }}
          >
            /
          </span>
        )}

        {/* Project Name & Idea */}
        {projectId && (
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              minWidth: 0,
            }}
            onMouseEnter={() => !isEditingModalOpen && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(255,182,39,0.04)",
                  border: "1px solid var(--border-hairline)",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--color-signal)",
                    animation: "pulse 1.2s infinite ease-in-out",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--fg-muted)",
                  }}
                >
                  Loading project…
                </span>
              </div>
            ) : (
              <div
                onClick={openEditModal}
                title="Click to edit project name or idea"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 10px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(255,182,39,0.06)",
                  border: "1px solid rgba(255,182,39,0.25)",
                  cursor: "pointer",
                  maxWidth: "320px",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Project Icon */}
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    background: "rgba(255,182,39,0.15)",
                    border: "1px solid rgba(255,182,39,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FolderGit2 size={12} style={{ color: "var(--color-signal)" }} />
                </div>

                {/* Title & Idea Preview */}
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--fg-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.25,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {displayName}
                  </span>

                  {ideaText && (
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "10px",
                        color: "var(--fg-muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: 1.2,
                        maxWidth: "200px",
                      }}
                    >
                      {ideaText}
                    </span>
                  )}
                </div>

                {/* Edit Pencil Icon */}
                <div
                  style={{
                    padding: 2,
                    borderRadius: 3,
                    color: "var(--fg-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Pencil size={11} />
                </div>
              </div>
            )}

            {/* Hover Card / Tooltip displaying BOTH Project Name & Idea */}
            {showTooltip && !isEditingModalOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  width: 320,
                  padding: "14px 16px",
                  borderRadius: "var(--radius-lg)",
                  background: "rgba(20,28,48,0.98)",
                  border: "1px solid var(--border-strong)",
                  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 182, 39, 0.25)",
                  backdropFilter: "blur(12px)",
                  zIndex: 100,
                  pointerEvents: "none",
                  animation: "fadeIn 0.15s ease-out",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {/* Section 1: Project Name */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <FolderGit2 size={13} style={{ color: "var(--color-signal)" }} />
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--color-signal)",
                      }}
                    >
                      Project Name
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--fg-primary)",
                      margin: 0,
                    }}
                  >
                    {displayName}
                  </p>
                </div>

                {/* Section 2: Idea Description */}
                {ideaText && (
                  <div style={{ borderTop: "1px solid var(--border-hairline)", paddingTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <Lightbulb size={13} style={{ color: "var(--color-circuit)" }} />
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "var(--color-circuit)",
                        }}
                      >
                        Idea Description
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "12px",
                        color: "var(--fg-secondary)",
                        lineHeight: 1.45,
                        margin: 0,
                        wordBreak: "break-word",
                      }}
                    >
                      {ideaText}
                    </p>
                  </div>
                )}

                {/* Hint Footer */}
                <div style={{ borderTop: "1px dashed var(--border-hairline)", paddingTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <Pencil size={11} style={{ color: "var(--color-signal)" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--fg-muted)", letterSpacing: "0.04em" }}>
                    Click to edit name & idea
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Project Info Modal (Rendered via Portal to document.body for highest z-index) */}
      {isEditingModalOpen &&
        mounted &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999999,
              background: "rgba(10, 16, 30, 0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              padding: "32px 16px",
              overflowY: "auto",
            }}
            onClick={() => setIsEditingModalOpen(false)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 500,
                margin: "auto 0",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 182, 39, 0.35)",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                maxHeight: "calc(100vh - 64px)",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "var(--radius-md)",
                      background: "rgba(255, 182, 39, 0.12)",
                      border: "1px solid rgba(255, 182, 39, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-signal)",
                    }}
                  >
                    <Pencil size={16} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "var(--fg-primary)",
                        margin: 0,
                      }}
                    >
                      Edit Project Information
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        color: "var(--fg-muted)",
                        margin: 0,
                        marginTop: 2,
                      }}
                    >
                      Update project name & core idea description
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditingModalOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--fg-muted)",
                    cursor: "pointer",
                    padding: 4,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveProjectInfo} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Field 1: Project Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--color-signal)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FolderGit2 size={12} />
                    Project / App Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter Project Name (e.g. Moryn)"
                    required
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-base)",
                      border: "1px solid var(--border-hairline)",
                      color: "var(--fg-primary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "13px",
                      fontWeight: 600,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Field 2: Project Idea Description */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--color-circuit)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Lightbulb size={12} />
                    Project Idea Description
                  </label>
                  <textarea
                    value={editIdea}
                    onChange={(e) => setEditIdea(e.target.value)}
                    placeholder="Describe your project idea..."
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-base)",
                      border: "1px solid var(--border-hairline)",
                      color: "var(--fg-primary)",
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      lineHeight: 1.5,
                      outline: "none",
                      resize: "vertical",
                      boxSizing: "border-box",
                      minHeight: "70px",
                      maxHeight: "140px",
                    }}
                  />
                </div>

                {/* Form Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setIsEditingModalOpen(false)}
                    disabled={isSaving}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "var(--radius-md)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      border: "1px solid var(--border-hairline)",
                      background: "var(--bg-elevated)",
                      color: "var(--fg-secondary)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !editName.trim()}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "var(--radius-md)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      cursor: isSaving || !editName.trim() ? "not-allowed" : "pointer",
                      border: "1px solid var(--color-signal)",
                      background: "var(--color-signal)",
                      color: "#ffffff",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      opacity: isSaving || !editName.trim() ? 0.5 : 1,
                    }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Check size={13} strokeWidth={2.5} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
