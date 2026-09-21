"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { COMPONENTS_REGISTRY, ComponentItem } from "@/lib/components/componentsRegistry";
import {
  ShowcaseTab,
  ViewportWidth,
  CopiedType,
  StudioHeader,
  StudioSidebar,
  StudioBreadcrumbsHeader,
  StudioPanelToolbar,
  StudioPanelBody,
  StudioIntegrationCards,
} from "./showcase";

export default function ComponentsShowcasePage() {
  const [selectedId, setSelectedId] = useState<string>(COMPONENTS_REGISTRY[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("preview");
  const [viewportWidth, setViewportWidth] = useState<ViewportWidth>("100%");
  const [previewKey, setPreviewKey] = useState(0);
  const [copiedType, setCopiedType] = useState<CopiedType>(null);

  // Filtered sidebar items
  const filteredComponents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return COMPONENTS_REGISTRY;
    return COMPONENTS_REGISTRY.filter((comp) => {
      return (
        comp.name.toLowerCase().includes(q) ||
        comp.category.toLowerCase().includes(q) ||
        comp.description.toLowerCase().includes(q) ||
        comp.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [searchQuery]);

  // Current active component
  const currentComponent: ComponentItem = useMemo(() => {
    const found = COMPONENTS_REGISTRY.find((c) => c.id === selectedId);
    return found || filteredComponents[0] || COMPONENTS_REGISTRY[0];
  }, [selectedId, filteredComponents]);

  // Group components by category for sidebar tree
  const groupedComponents = useMemo(() => {
    const groups: Record<string, ComponentItem[]> = {};
    filteredComponents.forEach((comp) => {
      if (!groups[comp.category]) {
        groups[comp.category] = [];
      }
      groups[comp.category].push(comp);
    });
    return groups;
  }, [filteredComponents]);

  const handleCopy = (text: string, type: "code" | "prompt" | "cli" | "npm") => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    if (type === "code") toast.success("React Code copied to clipboard!");
    if (type === "prompt") toast.success("AI Agent Prompt copied to clipboard!");
    if (type === "cli") toast.success("CLI scaffold command copied!");
    if (type === "npm") toast.success("Install command copied!");

    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  const handleSelectComponent = (id: string) => {
    setSelectedId(id);
    setPreviewKey((k) => k + 1);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0A0F1D] text-slate-100 flex flex-col font-sans selection:bg-[#6366F1]/30 selection:text-[#6366F1]">
      {/* Top Studio Bar */}
      <StudioHeader />

      {/* Studio Split View (Left Sidebar + Right Workbench) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <StudioSidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          groupedComponents={groupedComponents}
          filteredCount={filteredComponents.length}
          selectedId={currentComponent.id}
          onSelectComponent={handleSelectComponent}
        />

        {/* Main Studio Workbench */}
        <main className="flex-1 overflow-y-auto bg-[#0A0F1D] p-6 lg:p-8 space-y-6 custom-scrollbar">
          {/* Breadcrumbs & Metadata Header */}
          <StudioBreadcrumbsHeader
            component={currentComponent}
            copiedType={copiedType}
            onCopyCli={(cmd) => handleCopy(cmd, "cli")}
          />

          {/* Studio Interactive Panel */}
          <div className="rounded-xl border border-white/15 bg-[#10182B] shadow-2xl overflow-hidden">
            <StudioPanelToolbar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              viewportWidth={viewportWidth}
              onViewportChange={setViewportWidth}
              onReloadPreview={() => setPreviewKey((k) => k + 1)}
              copiedType={copiedType}
              onCopyCode={(code) => handleCopy(code, "code")}
              onCopyPrompt={(prompt) => handleCopy(prompt, "prompt")}
              rawCode={currentComponent.rawCode}
              aiPrompt={currentComponent.aiPrompt}
            />

            <StudioPanelBody
              activeTab={activeTab}
              currentComponent={currentComponent}
              viewportWidth={viewportWidth}
              previewKey={previewKey}
              copiedType={copiedType}
              onCopyCli={(cmd) => handleCopy(cmd, "cli")}
            />
          </div>

          {/* Integration Tips Footer Cards */}
          <StudioIntegrationCards cliCommand={currentComponent.cliCommand} />
        </main>
      </div>
    </div>
  );
}
