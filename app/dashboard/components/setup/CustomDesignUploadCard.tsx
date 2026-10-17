"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileCode,
  CheckCircle2,
  Trash2,
  Eye,
  RefreshCw,
  Sparkles,
  AlertCircle,
  FileText,
  X,
  ExternalLink,
} from "lucide-react";
import { parseDesignMarkdown } from "@/lib/design/designParser";
import { CustomDesignMeta } from "./types";
import { useTranslation } from "@/lib/i18n";

interface CustomDesignUploadCardProps {
  customMeta?: CustomDesignMeta | null;
  onParsed: (rawMarkdown: string, meta: CustomDesignMeta) => void;
  onClear: () => void;
  onAutoTitleDetected?: (title: string) => void;
  compact?: boolean;
}

export default function CustomDesignUploadCard({
  customMeta,
  onParsed,
  onClear,
  onAutoTitleDetected,
  compact = false,
}: CustomDesignUploadCardProps) {
  const { t, isId } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = useCallback(
    async (file: File) => {
      setErrorMsg(null);

      // Validate extension
      const validExtensions = [".md", ".markdown", ".txt"];
      const hasValidExt = validExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );

      if (!hasValidExt) {
        setErrorMsg(
          isId
            ? "Format file harus berformat .md, .markdown, atau .txt"
            : "File format must be .md, .markdown, or .txt"
        );
        return;
      }

      // Validate size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(
          isId
            ? "Ukuran file melebihi batas 5MB"
            : "File size exceeds 5MB limit"
        );
        return;
      }

      setIsReading(true);
      try {
        const text = await file.text();

        if (!text || !text.trim()) {
          setErrorMsg(
            isId
              ? "File kosong. Harap unggah file yang berisi teks markdown."
              : "File is empty. Please upload a file containing markdown text."
          );
          setIsReading(false);
          return;
        }

        // Parse markdown into tokens & sections
        const parsed = parseDesignMarkdown(text);

        // Try extracting project name if there's a title header
        const titleMatch = text.match(/^#\s+(?:Design Guidelines(?:\s*&\s*System Specifications)?:\s*)?([^\n\r]+)/i);
        if (titleMatch && titleMatch[1] && onAutoTitleDetected) {
          const detectedTitle = titleMatch[1].trim().replace(/^[`"']|[`"']$/g, "");
          if (detectedTitle.length >= 2 && !detectedTitle.toLowerCase().includes("guidelines")) {
            onAutoTitleDetected(detectedTitle);
          }
        }

        const meta: CustomDesignMeta = {
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          tokenCount: parsed.colorTokens.length,
          sectionCount: parsed.sections.length,
          tokensSample: parsed.colorTokens.slice(0, 8),
          sectionsSample: parsed.sections.slice(0, 6).map((s) => ({
            id: s.id,
            title: s.title,
          })),
          rawMarkdown: text,
        };

        onParsed(text, meta);
      } catch (err: unknown) {
        console.error("Error reading design markdown:", err);
        setErrorMsg(
          isId
            ? "Gagal membaca file markdown. Pastikan encoding UTF-8 valid."
            : "Failed to read markdown file. Ensure valid UTF-8 encoding."
        );
      } finally {
        setIsReading(false);
      }
    },
    [isId, onParsed, onAutoTitleDetected]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleProcessFile(file);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleProcessFile(file);
      // Reset input value so same file can be re-selected if needed
      e.target.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW: IF FILE IS ALREADY UPLOADED & ATTACHED
  // ──────────────────────────────────────────────────────────────────────────
  if (customMeta) {
    return (
      <>
        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 ring-1 ring-emerald-500/20 shadow-2xs transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Icon & File Meta */}
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                <FileCode size={22} strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-neutral-900 truncate">
                    {customMeta.fileName}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-300/50 text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-emerald-600" />
                    <span>{t.setup.customSchemaAttached}</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    ({formatFileSize(customMeta.fileSize)})
                  </span>
                </div>

                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {t.setup.appliedToPipeline}
                </p>

                {/* Badges: Tokens & Sections */}
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200/60">
                    {customMeta.tokenCount} {t.setup.tokensDetected}
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200/60">
                    {customMeta.sectionCount} {t.setup.sectionsDetected}
                  </span>

                  {/* Sample Color Swatches */}
                  {customMeta.tokensSample && customMeta.tokensSample.length > 0 && (
                    <div className="flex items-center gap-1 ml-1 py-0.5 px-2 bg-white rounded-lg border border-neutral-200/60">
                      {customMeta.tokensSample.slice(0, 5).map((tok, i) => (
                        <div
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                          style={{ backgroundColor: tok.hex }}
                          title={`${tok.token}: ${tok.hex} (${tok.role})`}
                        />
                      ))}
                      {customMeta.tokenCount > 5 && (
                        <span className="text-[10px] text-neutral-400 font-medium pl-0.5">
                          +{customMeta.tokenCount - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200/80 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                title="View preview of parsed schema"
              >
                <Eye size={13} />
                <span>{t.setup.viewPreview}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200/80 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                title="Change or re-upload file"
              >
                <RefreshCw size={13} />
                <span>{t.setup.changeFile}</span>
              </button>

              <button
                type="button"
                onClick={onClear}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100/70 text-rose-700 text-xs font-semibold transition cursor-pointer"
                title="Remove custom schema and return to preset palette"
              >
                <Trash2 size={13} />
                <span>{t.setup.removeFile}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hidden Input for Replace */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Modal: Full Preview */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-[#FAF9F6]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                    <FileCode size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      {customMeta.fileName}
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-medium">
                      {customMeta.tokenCount} {t.setup.tokensDetected} • {customMeta.sectionCount} {t.setup.sectionsDetected}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-neutral-200/60 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* Color Tokens Table */}
                {customMeta.tokensSample && customMeta.tokensSample.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                      Detected Color Tokens ({customMeta.tokenCount})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {customMeta.tokensSample.map((tok, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-neutral-50 border border-neutral-200/70"
                        >
                          <div
                            className="w-5 h-5 rounded-md border border-black/15 shrink-0"
                            style={{ backgroundColor: tok.hex }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-mono font-semibold text-neutral-900 truncate">
                              {tok.token}
                            </p>
                            <p className="text-[10px] text-neutral-400 truncate">
                              {tok.hex} • {tok.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Markdown Excerpt */}
                <div>
                  <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                    Raw Markdown Content
                  </h4>
                  <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-72 select-text">
                    {customMeta.rawMarkdown || "No raw markdown cached."}
                  </pre>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 border-t border-neutral-100 bg-neutral-50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-white hover:bg-neutral-900 text-xs font-semibold transition cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW: COMPACT UPLOAD BANNER (FOR STEP 1)
  // ──────────────────────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-4 rounded-xl border transition-all ${
          isDragging
            ? "border-[#E05A38] bg-orange-50/60 ring-2 ring-[#E05A38]/30 shadow-xs"
            : "border-neutral-200/90 bg-[#FAF9F6] hover:border-neutral-300 hover:bg-neutral-50/70"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100/80 text-[#E05A38] border border-[#E05A38]/20 flex items-center justify-center shrink-0">
              <Upload size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-neutral-900">
                  {t.setup.uploadSchemaTitle}
                </h4>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white border border-neutral-200 text-[#E05A38] font-semibold">
                  .md / .txt
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                {isId
                  ? "Unggah file markdown desain Anda agar AI memprioritaskan spesifikasi UI kustom Anda."
                  : "Upload your markdown design specs so AI prioritizes your custom UI specifications."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              disabled={isReading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
            >
              {isReading ? (
                <RefreshCw size={12} className="animate-spin text-[#E05A38]" />
              ) : (
                <Upload size={12} className="text-[#E05A38]" />
              )}
              <span>{isReading ? "Reading..." : t.setup.uploadSchemaButton}</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-lg">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW: FULL DROPZONE (FOR STEP 2)
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center transition-all ${
          isDragging
            ? "border-[#E05A38] bg-orange-50/70 ring-4 ring-[#E05A38]/20 shadow-md scale-[1.005]"
            : "border-neutral-200 bg-[#FAF9F6]/80 hover:border-neutral-300 hover:bg-[#FAF9F6]"
        }`}
      >
        {/* Center Icon */}
        <div className="w-13 h-13 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-center mx-auto mb-3.5 text-[#E05A38]">
          {isReading ? (
            <RefreshCw size={24} className="animate-spin" />
          ) : (
            <Upload size={24} strokeWidth={2.2} />
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-neutral-900 mb-1">
          {t.setup.uploadSchemaTitle}
        </h4>

        {/* Description */}
        <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed mb-4">
          {t.setup.uploadSchemaDesc}
        </p>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            disabled={isReading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E05A38] hover:bg-[#d04a28] text-white text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            {isReading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            <span>{isReading ? "Parsing file..." : t.setup.uploadSchemaButton}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200/80 text-neutral-700 text-xs font-medium transition cursor-pointer"
          >
            <Sparkles size={13} className="text-[#E05A38]" />
            <span>{isId ? "Format Template Contoh" : "View Example Format"}</span>
          </button>
        </div>

        {/* Hint footer */}
        <p className="text-[11px] text-neutral-400 mt-3 font-medium">
          {t.setup.uploadSchemaDropzone} • <span className="font-mono">.md, .txt (max 5MB)</span>
        </p>

        {/* Error message if any */}
        {errorMsg && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 py-2 px-4 rounded-xl max-w-md mx-auto">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Modal: Template Structure Guide */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-[#FAF9F6]">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#E05A38]" />
                <h3 className="text-sm font-bold text-neutral-900">
                  {isId ? "Struktur Standar File design.md" : "Standard design.md File Structure"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-neutral-200/60 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <p className="text-neutral-600 leading-relaxed">
                {isId
                  ? "AI Pipeline Moryn akan secara otomatis mengekstrak tabel token warna (#hex), hierarki tipografi, dan aturan Do's & Don'ts dari file markdown Anda:"
                  : "Moryn's AI Pipeline will automatically parse color token tables (#hex), typography hierarchy, and Do's & Don'ts from your markdown file:"}
              </p>

              <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-[11px] leading-relaxed overflow-x-auto select-text">
{`# Design Guidelines & System Specifications: [Nama Proyek]

## 1. Aesthetic Direction & Brief Inference
- Design Read: Modern Clean Light Mode
- The Three Dials: DESIGN_VARIANCE: 8, MOTION_INTENSITY: 6, VISUAL_DENSITY: 4

## 2. Design Tokens & Color System (HSL / HEX)
| Token Name | HEX / HSL Value | Role & Purpose |
| :--- | :--- | :--- |
| \`bg-base\` | \`#f8fafc\` | Page background surface |
| \`bg-surface\` | \`#ffffff\` | Card & container surface |
| \`accent-primary\` | \`#e05a38\` | Main brand action color |
| \`fg-primary\` | \`#0f172a\` | High-emphasis body text |

## 3. Typography & Font Pairing
- Display Font: Plus Jakarta Sans (Headings)
- Body Font: Inter (Readable body text)

## 4. Do's and Don'ts
### Do
- Maintain consistent 8px rounded corners for inputs and buttons.
- Use high WCAG AA contrast for text on card surfaces.

### Don't
- Do not use harsh gradient text headlines.
- Do not use arbitrary unapproved libraries.`}
              </pre>
            </div>

            <div className="px-6 py-3.5 border-t border-neutral-100 bg-neutral-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
