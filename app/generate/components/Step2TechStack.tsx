import React, { useState, useRef, useEffect } from "react";
import { StackCategory, FormData } from "../types";
import { TECH_CATEGORIES, POPULAR_STACK_PRESETS, COLOR_PALETTE_PRESETS } from "../constants";
import { DESIGN_TEMPLATES_METADATA, DesignTemplateMetadata } from "@/lib/design/designTemplates";
import { apiClient } from "@/lib/utils/apiClient";
import { Check, ChevronDown, Bot, Construction, Plus, X, Search, Zap, Palette, Upload, FileText, Sparkles, CheckCircle2, Layers, Layout, Globe, Loader2, ShieldCheck } from "lucide-react";

interface Step2TechStackProps {
  stackMode: FormData["stackMode"];
  stacks: FormData["stacks"];
  designData?: string;
  appName?: string;
  appIdea?: string;
  setStackMode: (mode: FormData["stackMode"]) => void;
  setStack: (category: StackCategory, label: string) => void;
  setDesignData?: (val: string) => void;
}

function generatePaletteMarkdown(palette: typeof COLOR_PALETTE_PRESETS[0]): string {
  return `# Design Guidelines & System Specifications: ${palette.name} (${palette.theme})

## 1. Aesthetic Direction & Theme Lock
- **Theme Name**: ${palette.name} (${palette.theme})
- **Design Read**: Modern high-contrast interface tailored for optimal readability and user experience.

## 2. Design Tokens & Color System (HEX / HSL)

| Token Name | HEX / HSL Value | Role & Purpose |
| :--- | :--- | :--- |
| \`bg-base\` | \`${palette.bg}\` | Primary page background surface |
| \`bg-surface\` | \`${palette.surface}\` | Card, sidebar, and container background surface |
| \`accent-primary\` | \`${palette.primary}\` | Primary action buttons & active indicator accents |
| \`border-subtle\` | \`${palette.border}\` | Crisp subtle hairline container borders |
| \`fg-primary\` | \`${palette.text}\` | High emphasis text & main headings |
| \`fg-muted\` | \`${palette.muted}\` | Muted secondary copy & metadata labels |

## 3. Typography & UI Consistency
- **Heading Font**: Plus Jakarta Sans / Outfit (Weight: 700-800)
- **Body Font**: Inter / System-UI (Weight: 400-500)
- **Code Font**: JetBrains Mono (Weight: 500)
`;
}

function TechStackCombobox({
  category,
  value,
  onChange,
  defaultOptions,
  title,
}: {
  category: StackCategory;
  value: string;
  onChange: (val: string) => void;
  defaultOptions: string[];
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleCustomAdd = () => {
    const trimmed = searchTerm.trim();
    if (trimmed) {
      onChange(trimmed);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = searchTerm.trim();
      if (!trimmed) return;

      const exactMatch = defaultOptions.find(
        (opt) => opt.toLowerCase() === trimmed.toLowerCase()
      );
      if (exactMatch) {
        handleSelect(exactMatch);
      } else {
        handleCustomAdd();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const filteredOptions = defaultOptions.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasExactMatch = defaultOptions.some(
    (opt) => opt.toLowerCase() === searchTerm.trim().toLowerCase()
  );

  const isCustomValue = Boolean(value && !defaultOptions.includes(value));

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* Combobox Trigger */}
      <div
        onClick={() => {
          setIsOpen((prev) => !prev);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        style={{
          width: "100%",
          padding: "10px 32px 10px 14px",
          borderRadius: "var(--radius-md)",
          background: "var(--bg-base)",
          border: `1px solid ${isOpen ? "var(--color-signal)" : "var(--border-hairline)"}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
          transition: "border-color 0.15s, background-color 0.15s",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: value ? 600 : 400,
            color: value ? "var(--fg-primary)" : "var(--fg-muted)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {value || `Select or type ${title}...`}
          {isCustomValue && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                padding: "1px 5px",
                borderRadius: "var(--radius-xs)",
                background: "rgba(255, 182, 39, 0.15)",
                color: "var(--color-signal)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Custom
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: "var(--fg-muted)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
            flexShrink: 0,
            marginLeft: 8,
          }}
        />
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-hairline)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: "260px",
          }}
        >
          {/* Search Box */}
          <div
            style={{
              padding: "8px 10px",
              borderBottom: "1px solid var(--border-hairline)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--bg-elevated)",
            }}
          >
            <Search size={12} style={{ color: "var(--fg-muted)", flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              placeholder={`Search or type custom ${title}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                color: "var(--fg-primary)",
              }}
            />
            {searchTerm && (
              <X
                size={12}
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm("");
                }}
                style={{ color: "var(--fg-muted)", cursor: "pointer", flexShrink: 0 }}
              />
            )}
          </div>

          {/* Options List */}
          <div style={{ overflowY: "auto", flex: 1, padding: "4px" }}>
            {filteredOptions.map((option) => {
              const isSelected = value === option;
              return (
                <div
                  key={option}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option);
                  }}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "var(--radius-xs)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    background: isSelected ? "rgba(255, 182, 39, 0.1)" : "transparent",
                    color: isSelected ? "var(--color-signal)" : "var(--fg-primary)",
                    fontFamily: "var(--font-body)",
                    fontSize: "12px",
                    fontWeight: isSelected ? 600 : 400,
                    transition: "background 0.1s",
                  }}
                >
                  <span>{option}</span>
                  {isSelected && <Check size={12} style={{ color: "var(--color-signal)" }} />}
                </div>
              );
            })}

            {/* Custom Input Add Trigger */}
            {searchTerm.trim() && !hasExactMatch && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleCustomAdd();
                }}
                style={{
                  padding: "8px 10px",
                  borderRadius: "var(--radius-xs)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  background: "rgba(79, 209, 197, 0.1)",
                  color: "var(--color-circuit)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  marginTop: "4px",
                  borderTop: "1px dashed var(--border-hairline)",
                }}
              >
                <Plus size={12} />
                <span>Use custom: "{searchTerm.trim()}"</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Step2TechStack({
  stackMode,
  stacks,
  designData,
  appName,
  appIdea,
  setStackMode,
  setStack,
  setDesignData,
}: Step2TechStackProps) {
  const selectedCount = Object.values(stacks).filter((v) => v !== "").length;
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>("saas-webapp");
  const [showCustomMarkdown, setShowCustomMarkdown] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{
    stacks: Record<StackCategory, string>;
    paletteId: string;
    badge: string;
    reasoning: string;
  } | null>(null);
  const [aiApplied, setAiApplied] = useState(false);

  const handleTemplateSelect = (template: DesignTemplateMetadata) => {
    if (selectedTemplateId === template.id && designData) {
      setSelectedTemplateId(null);
      if (setDesignData) setDesignData("");
      return;
    }

    setSelectedTemplateId(template.id);
    setSelectedPaletteId(null);

    // Instant in-memory assignment — 0ms latency, zero API calls
    if (template.rawMarkdown && setDesignData) {
      setDesignData(template.rawMarkdown);
    }
  };

  // Auto-populate default template on mount if designData is empty
  useEffect(() => {
    if (!designData && selectedTemplateId) {
      const defaultTpl = DESIGN_TEMPLATES_METADATA.find((t) => t.id === selectedTemplateId);
      if (defaultTpl) {
        handleTemplateSelect(defaultTpl);
      }
    }
  }, []);

  const fetchAiRecommendation = async () => {
    if (!appIdea) return;
    setAiLoading(true);
    try {
      const json: any = await apiClient.generate.recommendStack({ appName: appName || "", appIdea });
      const rec = json?.recommendation || (json?.stacks ? json : null);
      if (rec && rec.stacks) {
        setAiRecommendation(rec);
        Object.entries(rec.stacks).forEach(([cat, label]) => {
          setStack(cat as StackCategory, label as string);
        });
        if (rec.paletteId) {
          const pal = COLOR_PALETTE_PRESETS.find((p) => p.id === rec.paletteId);
          if (pal && setDesignData) {
            setSelectedPaletteId(pal.id);
            setSelectedTemplateId(null);
            setDesignData(generatePaletteMarkdown(pal));
          }
        }
        setAiApplied(true);
      }
    } catch (e) {
      console.warn("AI recommendation failed:", e);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (stackMode === "ai" && !aiRecommendation && !aiLoading && appIdea) {
      fetchAiRecommendation();
    }
  }, [stackMode, appIdea]);

  const handleApplyRecommendation = () => {
    if (!aiRecommendation) return;
    if (aiRecommendation.stacks) {
      Object.entries(aiRecommendation.stacks).forEach(([cat, label]) => {
        setStack(cat as StackCategory, label as string);
      });
    }
    if (aiRecommendation.paletteId) {
      const pal = COLOR_PALETTE_PRESETS.find(p => p.id === aiRecommendation.paletteId);
      if (pal && setDesignData) {
        setSelectedPaletteId(pal.id);
        setSelectedTemplateId(null);
        setDesignData(generatePaletteMarkdown(pal));
      }
    }
    setAiApplied(true);
  };

  const handlePresetSelect = (preset: typeof POPULAR_STACK_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    Object.entries(preset.stacks).forEach(([cat, label]) => {
      setStack(cat as StackCategory, label);
    });
  };

  const handlePaletteSelect = (palette: typeof COLOR_PALETTE_PRESETS[0]) => {
    if (selectedPaletteId === palette.id) {
      setSelectedPaletteId(null);
      if (setDesignData) setDesignData("");
    } else {
      setSelectedPaletteId(palette.id);
      setSelectedTemplateId(null);
      if (setDesignData) {
        setDesignData(generatePaletteMarkdown(palette));
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && setDesignData) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          setSelectedPaletteId(null);
          setSelectedTemplateId(null);
          setDesignData(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      {/* Step badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 10px",
          borderRadius: "var(--radius-xs)",
          background: "rgba(65,107,141,0.1)",
          border: "1px solid rgba(65,107,141,0.2)",
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--color-info)",
          marginBottom: 16,
        }}
      >
        02. Tech Stack & Architecture
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.6rem",
          fontWeight: 800,
          color: "var(--color-foreground)",
          marginBottom: 6,
          letterSpacing: "-0.02em",
          lineHeight: 1.25,
        }}
      >
        Tech Stack & Architecture
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          color: "var(--color-foreground-muted)",
          marginBottom: 24,
          lineHeight: 1.6,
        }}
      >
        Configure the tools to visualize, title, search, and configure your system for
        Product Architecture.
      </p>

      {/* Mode selector */}
      <div
        style={{
          display: "flex",
          border: "1px solid var(--border-hairline)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        {(["manual", "ai"] as const).map((mode, i) => (
          <button
            key={mode}
            id={`stack-mode-${mode}`}
            onClick={() => setStackMode(mode)}
            style={{
              flex: 1,
              padding: "10px 16px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              background: stackMode === mode ? "var(--color-signal)" : "var(--bg-elevated)",
              color: stackMode === mode ? "#ffffff" : "var(--fg-muted)",
              border: "none",
              borderLeft: i > 0 ? "1px solid var(--border-hairline)" : "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.15s",
            }}
          >
            {mode === "ai" && <Bot size={12} />}
            {mode === "manual" ? "Manual / Presets" : "AI Recommend"}
          </button>
        ))}
      </div>

      {stackMode === "manual" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          
          {/* ⚡ 1-Click Popular Stack Presets */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Zap size={14} style={{ color: "var(--color-signal)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-primary)" }}>
                  Popular Stack Presets
                </span>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-muted)", letterSpacing: "0.04em" }}>
                1-Click Auto-Fill
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 8 }}>
              {POPULAR_STACK_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "var(--radius-md)",
                      border: `1px solid ${isSelected ? "var(--color-signal)" : "var(--border-hairline)"}`,
                      background: isSelected ? "rgba(255, 182, 39, 0.08)" : "var(--bg-elevated)",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 700, color: isSelected ? "var(--color-signal)" : "var(--fg-primary)" }}>
                        {preset.label}
                      </span>
                      {isSelected && <Check size={12} style={{ color: "var(--color-signal)" }} />}
                    </div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--fg-muted)", margin: "0 0 6px", lineHeight: 1.3 }}>
                      {preset.desc}
                    </p>
                    <span
                      style={{
                        display: "inline-block",
                        fontFamily: "var(--font-mono)",
                        fontSize: "8px",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "var(--radius-xs)",
                        background: isSelected ? "var(--color-signal)" : "rgba(255, 255, 255, 0.05)",
                        color: isSelected ? "#ffffff" : "var(--fg-muted)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {preset.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Granular Stack Layer Grid ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--fg-secondary)" }}>
                4-Layer Tech Breakdown
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: selectedCount === 4 ? "var(--color-signal)" : "var(--fg-muted)",
                  letterSpacing: "0.08em",
                }}
              >
                {selectedCount}/4 selected
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="layer-grid">
              {TECH_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    background: "var(--bg-elevated)",
                    border: `1px solid ${stacks[cat.id] ? "var(--color-circuit)" : "var(--border-hairline)"}`,
                    borderRadius: "var(--radius-lg)",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    transition: "border-color 0.15s",
                  }}
                >
                  {/* Category header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-hairline)",
                        background: "var(--bg-base)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-circuit)",
                      }}
                    >
                      {cat.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "var(--fg-primary)",
                          marginBottom: 1,
                        }}
                      >
                        {cat.title}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "9px",
                          color: "var(--fg-muted)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {cat.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Combobox with Custom Input */}
                  <TechStackCombobox
                    category={cat.id}
                    value={stacks[cat.id]}
                    onChange={(val) => {
                      setSelectedPresetId(null);
                      setStack(cat.id, val);
                    }}
                    defaultOptions={cat.options}
                    title={cat.title}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 🎨 Dedicated Section: Design System & Architecture Presets (design.md) */}
          <div
            style={{
              padding: "20px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-hairline)",
              background: "var(--bg-elevated)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(79, 209, 197, 0.1)",
                    border: "1px solid rgba(79, 209, 197, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-circuit)",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <Palette size={16} />
                </div>
                <div>
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 700, color: "var(--fg-primary)", margin: "0 0 2px" }}>
                    Design System & Presets (<code style={{ color: "var(--color-signal)", fontFamily: "var(--font-mono)" }}>design.md</code>)
                  </h4>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "11.5px", color: "var(--color-mist)", margin: 0, lineHeight: 1.5 }}>
                    Pilih template spesifikasi desain siap pakai berstandar industri (100% full spec), preset swatch warna, atau unggah file kustom.
                  </p>
                </div>
              </div>

              <label
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "5px 12px",
                  borderRadius: "var(--radius-xs)",
                  background: "rgba(79, 209, 197, 0.1)",
                  color: "var(--color-circuit)",
                  cursor: "pointer",
                  border: "1px solid rgba(79, 209, 197, 0.3)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                }}
              >
                <Upload size={11} />
                Upload .md
                <input
                  type="file"
                  accept=".md,.txt"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {/* 🌟 Design System Presets & Swatches */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Flagship Templates */}
              <div>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, color: "var(--color-signal)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Design System Templates (100% Full Spec):
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
                  {DESIGN_TEMPLATES_METADATA.map((template) => {
                    const isSelected = selectedTemplateId === template.id;
                    return (
                      <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "var(--radius-md)",
                          border: `1px solid ${isSelected ? "var(--color-signal)" : "var(--border-hairline)"}`,
                          background: isSelected ? "rgba(255, 182, 39, 0.08)" : "var(--bg-base)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {/* Swatches dots */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 14, height: 14, borderRadius: "50%", background: template.primary, border: "1px solid rgba(255,255,255,0.2)" }} />
                            <span style={{ width: 12, height: 12, borderRadius: "50%", background: template.bg, border: "1px solid var(--border-hairline)" }} />
                            <span style={{ width: 12, height: 12, borderRadius: "50%", background: template.surface, border: "1px solid var(--border-hairline)" }} />
                          </div>
                          {isSelected && <CheckCircle2 size={12} style={{ color: "var(--color-signal)" }} />}
                        </div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, color: isSelected ? "var(--color-signal)" : "var(--fg-primary)" }}>
                          {template.name}
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--fg-muted)", letterSpacing: "0.04em" }}>
                          {template.theme}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Color Swatches */}
              <div style={{ borderTop: "1px dashed var(--border-hairline)", paddingTop: 10 }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, color: "var(--fg-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Atau Pilih Quick Color Swatch:
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
                  {COLOR_PALETTE_PRESETS.map((palette) => {
                    const isSelected = selectedPaletteId === palette.id;
                    return (
                      <div
                        key={palette.id}
                        onClick={() => handlePaletteSelect(palette)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "var(--radius-md)",
                          border: `1px solid ${isSelected ? "var(--color-signal)" : "var(--border-hairline)"}`,
                          background: isSelected ? "rgba(255, 182, 39, 0.08)" : "var(--bg-base)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 14, height: 14, borderRadius: "50%", background: palette.primary, border: "1px solid rgba(255,255,255,0.2)" }} />
                            <span style={{ width: 12, height: 12, borderRadius: "50%", background: palette.bg, border: "1px solid var(--border-hairline)" }} />
                            <span style={{ width: 12, height: 12, borderRadius: "50%", background: palette.surface, border: "1px solid var(--border-hairline)" }} />
                          </div>
                          {isSelected && <CheckCircle2 size={12} style={{ color: "var(--color-signal)" }} />}
                        </div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, color: isSelected ? "var(--color-signal)" : "var(--fg-primary)" }}>
                          {palette.name}
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--fg-muted)", letterSpacing: "0.04em" }}>
                          {palette.theme}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Custom design.md Textarea toggle */}
            <div style={{ borderTop: "1px dashed var(--border-hairline)", paddingTop: 10 }}>
              <button
                type="button"
                onClick={() => setShowCustomMarkdown(!showCustomMarkdown)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--fg-muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: 0,
                }}
              >
                <FileText size={11} />
                {showCustomMarkdown ? "Hide Custom design.md Editor" : `Lihat / Edit Raw design.md Markdown (${designData ? `${designData.length.toLocaleString()} chars` : "Kosong"})`}
              </button>

              {showCustomMarkdown && (
                <textarea
                  rows={6}
                  placeholder="Paste custom design.md markdown content here..."
                  value={designData || ""}
                  onChange={(e) => {
                    setSelectedPaletteId(null);
                    setSelectedTemplateId(null);
                    if (setDesignData) setDesignData(e.target.value);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "11.5px",
                    fontFamily: "var(--font-mono)",
                    outline: "none",
                    resize: "vertical",
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-hairline)",
                    color: "var(--fg-primary)",
                    lineHeight: 1.5,
                    boxSizing: "border-box",
                    marginTop: 8,
                  }}
                />
              )}
            </div>

            {/* Active Status Indicator */}
            {designData ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: "9.5px", color: "var(--color-circuit)", background: "rgba(79, 209, 197, 0.06)", padding: "6px 10px", borderRadius: "var(--radius-xs)", border: "1px solid rgba(79, 209, 197, 0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={12} />
                  <span>
                    {selectedTemplateId
                      ? `Preset Aktif: ${DESIGN_TEMPLATES_METADATA.find(t => t.id === selectedTemplateId)?.name} (100% Unmodified Spec • ${designData.length.toLocaleString()} chars)`
                      : selectedPaletteId
                      ? `Swatch Aktif: ${COLOR_PALETTE_PRESETS.find(p => p.id === selectedPaletteId)?.name} (${designData.length} chars)`
                      : `Custom design.md Aktif (${designData.length.toLocaleString()} chars)`}
                  </span>
                </div>
                <span style={{ color: "var(--fg-muted)", fontSize: "8.5px" }}>design.md lock active</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--fg-muted)" }}>
                <Sparkles size={11} style={{ color: "var(--color-signal)" }} />
                <span>Default high-end SaaS design system template (100% full spec) will be automatically applied.</span>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div
          style={{
            padding: "24px",
            border: "1px solid var(--border-hairline)",
            borderRadius: "var(--radius-lg)",
            background: "var(--bg-elevated)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {aiLoading ? (
            <div style={{ padding: "40px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-signal)",
                  background: "rgba(255, 182, 39, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "spin 0.8s linear infinite",
                }}
              >
                <Bot size={22} style={{ color: "var(--color-signal)" }} />
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700, color: "var(--fg-primary)", margin: "0 0 4px" }}>
                  Menganalisis Ide & Arsitektur Produk…
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-mist)", margin: 0 }}>
                  AI sedang merancang kombinasi tech stack, database, dan palette warna yang paling optimal.
                </p>
              </div>
            </div>
          ) : aiRecommendation ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Header Badge & Title */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "var(--radius-md)", background: "rgba(255,182,39,0.12)", border: "1px solid rgba(255,182,39,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Bot size={15} style={{ color: "var(--color-signal)" }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 800, color: "var(--fg-primary)" }}>
                        Rekomendasi AI Terpilih
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "var(--radius-xs)", background: "rgba(79, 209, 197, 0.15)", color: "var(--color-circuit)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {aiRecommendation.badge || "AI Tailored"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={fetchAiRecommendation}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "5px 10px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-hairline)",
                    background: "var(--bg-base)", color: "var(--fg-muted)",
                    fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🔄 Analisis Ulang
                </button>
              </div>

              {/* Reasoning */}
              {aiRecommendation.reasoning && (
                <div style={{ padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "var(--bg-base)" }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--fg-primary)", lineHeight: 1.6, margin: 0 }}>
                    💡 <span style={{ color: "var(--color-signal)", fontWeight: 600 }}>Alasan AI: </span>
                    {aiRecommendation.reasoning}
                  </p>
                </div>
              )}

              {/* 4 Layer Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                {([
                  { label: "Frontend", val: stacks.frontend || aiRecommendation.stacks?.frontend, color: "#3b82f6" },
                  { label: "Backend", val: stacks.backend || aiRecommendation.stacks?.backend, color: "#10b981" },
                  { label: "Database", val: stacks.database || aiRecommendation.stacks?.database, color: "#eab308" },
                  { label: "Deployment", val: stacks.deployment || aiRecommendation.stacks?.deployment, color: "#a855f7" },
                ]).map((layer, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-hairline)",
                      background: "var(--bg-base)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: layer.color }}>
                      {layer.label}
                    </span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 700, color: "var(--fg-primary)" }}>
                      {layer.val || "Recommended"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Palette Recommendation Preview */}
              {selectedPaletteId && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-hairline)", background: "var(--bg-base)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Palette size={14} style={{ color: "var(--color-circuit)" }} />
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color: "var(--fg-primary)" }}>
                      Theme: {COLOR_PALETTE_PRESETS.find(p => p.id === selectedPaletteId)?.name || "Cyber Slate"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {COLOR_PALETTE_PRESETS.find(p => p.id === selectedPaletteId) && (
                      <>
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: COLOR_PALETTE_PRESETS.find(p => p.id === selectedPaletteId)?.primary }} />
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: COLOR_PALETTE_PRESETS.find(p => p.id === selectedPaletteId)?.bg, border: "1px solid var(--border-hairline)" }} />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Active Application Notice */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "var(--radius-md)", background: "rgba(79, 209, 197, 0.08)", border: "1px solid rgba(79, 209, 197, 0.25)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={14} style={{ color: "var(--color-circuit)" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, color: "var(--color-circuit)" }}>
                    Rekomendasi tech stack & desain telah otomatis diterapkan ke formulir.
                  </span>
                </div>
                <button
                  onClick={() => setStackMode("manual")}
                  style={{
                    padding: "4px 8px", borderRadius: "var(--radius-xs)",
                    border: "none", background: "transparent",
                    color: "var(--color-circuit)", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700,
                    cursor: "pointer", textDecoration: "underline",
                  }}
                >
                  Ubah di Mode Manual →
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "30px 20px" }}>
              <Bot size={28} style={{ color: "var(--color-signal)", margin: "0 auto 12px" }} />
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700, color: "var(--fg-primary)", marginBottom: 6 }}>
                AI Tech Stack & Design Recommendation
              </h4>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-mist)", maxWidth: 440, margin: "0 auto 18px", lineHeight: 1.6 }}>
                Biarkan AI menganalisis ide produk Anda dan memilihkan arsitektur teknologi, database, serta tema visual yang paling pas.
              </p>
              <button
                onClick={fetchAiRecommendation}
                style={{
                  padding: "10px 20px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-signal)",
                  background: "var(--color-signal)",
                  color: "#ffffff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Bot size={13} />
                Analisis & Rekomendasikan Stack Sekarang
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
