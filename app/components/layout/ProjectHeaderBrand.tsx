"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { FolderGit2, Lightbulb, Pencil, X, Check, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/utils/apiClient";
import { useProjectStore } from "@/stores/useProjectStore";
import { useTranslation } from "@/lib/i18n";

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
  const { t } = useTranslation();
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

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
    setIsDropdownOpen(false);
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
      toast.success(t.projectModal.savedSuccess);

      window.dispatchEvent(
        new CustomEvent("projectUpdated", {
          detail: { appName: finalName, appIdea: finalIdea },
        })
      );
    } catch {
      toast.error(t.projectModal.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 12,
          minWidth: 0,
        }}
      >
        {/* Brand: Moryn Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            flexShrink: 0,
          }}
          className="hover:opacity-85 transition-opacity"
        >
          <Image
            src="/logo/Moryn-Light-Mode.webp"
            alt="Moryn"
            width={240}
            height={76}
            priority
            draggable={false}
            style={{
              height: 21,
              width: "auto",
              objectFit: "contain",
              display: "block",
            }}
            className="select-none"
          />
        </Link>

        {/* Separator / Divider */}
        {projectId && (
          <span
            style={{
              fontSize: "14px",
              color: "#9ca3af",
              flexShrink: 0,
              userSelect: "none",
            }}
          >
            /
          </span>
        )}

        {/* Project Name Dropdown Trigger */}
        {projectId && (
          <div
            ref={dropdownRef}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              minWidth: 0,
            }}
          >
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "rgba(225,91,57,0.06)",
                }}
              >
                <Loader2 size={13} className="animate-spin" style={{ color: "#e15b39" }} />
                <span style={{ fontSize: "12px", color: "var(--fg-muted, #71717a)" }}>
                  Loadingâ€¦
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                title="Click for project options"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 6px",
                  borderRadius: "6px",
                  background: isDropdownOpen ? "rgba(0,0,0,0.05)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  maxWidth: "260px",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isDropdownOpen) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (!isDropdownOpen) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--fg-primary, #111827)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.3,
                  }}
                >
                  {displayName}
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    color: "var(--fg-muted, #71717a)",
                    transform: isDropdownOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s ease",
                    flexShrink: 0,
                  }}
                />
              </button>
            )}

            {/* Dropdown Menu when clicking the chevron */}
            {isDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  width: 280,
                  padding: "12px",
                  borderRadius: "10px",
                  background: "var(--bg-elevated, #ffffff)",
                  border: "1px solid var(--border-hairline, #e5e7eb)",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ padding: "4px 6px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg-primary, #111827)", marginBottom: 2 }}>
                    {displayName}
                  </div>
                  {ideaText && (
                    <div style={{ fontSize: 11, color: "var(--fg-muted, #71717a)", lineHeight: 1.4 }}>
                      {ideaText}
                    </div>
                  )}
                </div>

                <div style={{ height: 1, background: "var(--border-hairline, #e5e7eb)", margin: "2px 0" }} />

                {/* Edit Button in Dropdown */}
                <button
                  type="button"
                  onClick={openEditModal}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "none",
                    background: "rgba(225,91,57,0.08)",
                    color: "#e15b39",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(225,91,57,0.14)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(225,91,57,0.08)";
                  }}
                >
                  <Pencil size={13} strokeWidth={2} />
                  <span>{t.projectModal.editDetails}</span>
                </button>
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
                      {t.projectModal.editInfo}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "10px",
                        color: "var(--fg-muted)",
                        margin: 0,
                        marginTop: 2,
                      }}
                    >
                      {t.projectModal.updateSubtitle}
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
                      fontFamily: "var(--font-body)",
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
                    {t.projectModal.nameLabel}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={t.projectModal.namePlaceholder}
                    required
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-base)",
                      border: "1px solid var(--border-hairline)",
                      color: "var(--fg-primary)",
                      fontFamily: "var(--font-body)",
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
                      fontFamily: "var(--font-body)",
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
                    {t.projectModal.ideaLabel}
                  </label>
                  <textarea
                    value={editIdea}
                    onChange={(e) => setEditIdea(e.target.value)}
                    placeholder={t.projectModal.ideaPlaceholder}
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
                      fontFamily: "var(--font-body)",
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
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !editName.trim()}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "var(--radius-md)",
                      fontFamily: "var(--font-body)",
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
                        {t.projectModal.saving}
                      </>
                    ) : (
                      <>
                        <Check size={13} strokeWidth={2.5} />
                        {t.projectModal.saveChanges}
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

