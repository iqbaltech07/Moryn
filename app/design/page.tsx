"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { StepNavbar, ProjectHeaderBrand } from "../components/layout";
import { ArrowRight } from "lucide-react";
import { McpConnectModal } from "../components/modals";
import { ProjectDetailSkeleton } from "../components/shared";
import { ProjectDetailData } from "./types";
import {
  parseMarkdownSections,
  parseColorTokens,
  parseOrSynthesizeDesignData,
  DEFAULT_COLOR_TOKENS,
  DEFAULT_ACCORDION_SECTIONS,
} from "./utils/parser";
import type { PaletteInfo } from "./utils/parser";
import ProjectHeaderCard from "./components/ProjectHeaderCard";
import ColorTokensTable from "./components/ColorTokensTable";
import DesignAccordions from "./components/DesignAccordions";
import DesignDropzone from "./components/DesignDropzone";
import { DESIGN_TEMPLATES_METADATA } from "@/lib/design/designTemplates";
import { apiClient } from "@/lib/utils/apiClient";
import { useProjectStore } from "@/stores/useProjectStore";
import { useTranslation } from "@/lib/i18n";


function ProjectDetailContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { t } = useTranslation();

  const { project, isLoading, error, fetchProject, setProject } = useProjectStore();
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    "aesthetic-direction": true,
    overview: true,
    dos_and_donts: true,
  });
  const [showMcpModal, setShowMcpModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId, fetchProject]);

  const processUploadedFile = async (file: File) => {
    if (!file || !projectId) return;
    setIsUploading(true);
    try {
      const json = await apiClient.projects.uploadDesignFile(projectId, file);

      setProject((prev) =>
        prev
          ? {
              ...prev,
              designData: json.designData,
            }
          : prev
      );
    } catch (err: unknown) {
      alert("Failed to upload design.md: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyTemplate = async (templateId: string) => {
    if (!projectId) return;
    setIsUploading(true);
    try {
      const template = DESIGN_TEMPLATES_METADATA.find((t) => t.id === templateId);
      const rawMarkdown = template?.rawMarkdown;
      if (!rawMarkdown) throw new Error("Template content is empty");

      const uploadJson = await apiClient.projects.uploadDesign({ projectId, designData: rawMarkdown });

      setProject((prev) =>
        prev
          ? {
              ...prev,
              designData: uploadJson.designData,
            }
          : prev
      );
    } catch (err: unknown) {
      alert("Failed to apply design template: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processUploadedFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processUploadedFile(file);
  };

  const formInputs = useMemo(() => {
    if (!project?.formInputs) return {};
    try {
      return JSON.parse(project.formInputs);
    } catch {
      return {};
    }
  }, [project?.formInputs]);

  // Resilient parsing: synthesizes tokens & sections if DB designData is palette JSON or empty
  const synthesized = useMemo(() => {
    return parseOrSynthesizeDesignData(
      project?.designData || "",
      project?.appName || "Stratum AI",
      project?.appIdea || ""
    );
  }, [project?.designData, project?.appName, project?.appIdea]);

  const { sections, colorTokens, paletteInfo } = synthesized;
  const hasDesignData = useMemo(() => {
    return !!(project?.appName || project?.designData);
  }, [project?.appName, project?.designData]);

  const btn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-body)",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    textTransform: "none",
    cursor: "pointer",
    border: "1px solid var(--border-hairline)",
    background: "var(--bg-elevated)",
    color: "var(--fg-secondary)",
    transition: "all 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)", color: "var(--fg-primary)" }}>
      {showMcpModal && projectId && (
        <McpConnectModal projectId={projectId} appName={project?.appName} onClose={() => setShowMcpModal(false)} />
      )}

      {/* ── Topbar ── */}
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
        <StepNavbar currentStep="design" projectId={projectId} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
          <Link
            href={`/task?projectId=${projectId}`}
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
            <span>{t.design.nextStep}</span>
            <ArrowRight size={14} strokeWidth={2.2} />
          </Link>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "88px 24px 48px" }}>
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: "var(--bg-surface)", padding: 28, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-hairline)" }}>
              <div className="skeleton-shimmer" style={{ width: 140, height: 14, marginBottom: 14 }} />
              <div className="skeleton-shimmer" style={{ width: 340, height: 32, marginBottom: 14 }} />
              <div className="skeleton-shimmer" style={{ width: "80%", height: 18, marginBottom: 20 }} />
              <div style={{ display: "flex", gap: 12 }}>
                <div className="skeleton-shimmer" style={{ width: 100, height: 28 }} />
                <div className="skeleton-shimmer" style={{ width: 100, height: 28 }} />
                <div className="skeleton-shimmer" style={{ width: 100, height: 28 }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ background: "var(--bg-surface)", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-hairline)" }}>
                <div className="skeleton-shimmer" style={{ width: 180, height: 20, marginBottom: 16 }} />
                <div className="skeleton-shimmer" style={{ width: "100%", height: 36, marginBottom: 8 }} />
                <div className="skeleton-shimmer" style={{ width: "100%", height: 36 }} />
              </div>
              <div style={{ background: "var(--bg-surface)", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-hairline)" }}>
                <div className="skeleton-shimmer" style={{ width: 180, height: 20, marginBottom: 16 }} />
                <div className="skeleton-shimmer" style={{ width: "100%", height: 80 }} />
              </div>
            </div>
          </div>
        ) : error ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#f87171" }}>
            <p>{error}</p>
          </div>
        ) : (
          <div>
            {!hasDesignData ? (
              <DesignDropzone
                isDragging={isDragging}
                isUploading={isUploading}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onFileUpload={handleFileUpload}
                onApplyTemplate={handleApplyTemplate}
              />
            ) : (
              <>
                <ProjectHeaderCard
                  project={project}
                  formInputs={formInputs}
                  isUploading={isUploading}
                  onFileUpload={handleFileUpload}
                  paletteInfo={paletteInfo}
                />
                <ColorTokensTable colorTokens={colorTokens} />
                <DesignAccordions
                  projectId={projectId}
                  sections={sections}
                  colorTokens={colorTokens}
                  openAccordions={openAccordions}
                  onToggleAccordion={toggleAccordion}
                />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<ProjectDetailSkeleton />}>
      <ProjectDetailContent />
    </Suspense>
  );
}

