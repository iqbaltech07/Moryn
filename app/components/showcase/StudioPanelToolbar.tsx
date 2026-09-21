import React from "react";
import {
  Eye,
  Code2,
  Bot,
  Package,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";
import { StudioPanelToolbarProps } from "./types";

export function StudioPanelToolbar({
  activeTab,
  onTabChange,
  viewportWidth,
  onViewportChange,
  onReloadPreview,
  copiedType,
  onCopyCode,
  onCopyPrompt,
  rawCode,
  aiPrompt,
}: StudioPanelToolbarProps) {
  return (
    <div className="p-3 border-b border-white/10 bg-[#141C30] flex flex-wrap items-center justify-between gap-3">
      {/* Tabs Switcher */}
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#0D1527] border border-white/10">
        <button
          onClick={() => onTabChange("preview")}
          className={`px-3 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === "preview"
              ? "bg-[#6366F1] text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Eye size={12} />
          <span>Preview</span>
        </button>

        <button
          onClick={() => onTabChange("code")}
          className={`px-3 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === "code"
              ? "bg-[#6366F1] text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Code2 size={12} />
          <span>Code (TSX)</span>
        </button>

        <button
          onClick={() => onTabChange("prompt")}
          className={`px-3 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === "prompt"
              ? "bg-[#6366F1] text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Bot size={12} />
          <span>AI Agent Prompt</span>
        </button>

        <button
          onClick={() => onTabChange("install")}
          className={`px-3 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === "install"
              ? "bg-[#6366F1] text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Package size={12} />
          <span>Scaffold</span>
        </button>
      </div>

      {/* Viewport Width Controls & Actions */}
      <div className="flex items-center gap-2">
        {activeTab === "preview" && (
          <div className="hidden sm:flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
            <button
              onClick={() => onViewportChange("100%")}
              className={`p-1.5 rounded transition-colors ${viewportWidth === "100%" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
              title="Desktop Width (100%)"
            >
              <Monitor size={13} />
            </button>
            <button
              onClick={() => onViewportChange("768px")}
              className={`p-1.5 rounded transition-colors ${viewportWidth === "768px" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
              title="Tablet Width (768px)"
            >
              <Tablet size={13} />
            </button>
            <button
              onClick={() => onViewportChange("375px")}
              className={`p-1.5 rounded transition-colors ${viewportWidth === "375px" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
              title="Mobile Width (375px)"
            >
              <Smartphone size={13} />
            </button>
            <button
              onClick={onReloadPreview}
              className="p-1.5 rounded text-slate-500 hover:text-slate-300 transition-colors ml-1"
              title="Reload State"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        )}

        {/* Primary Action Button */}
        {activeTab === "code" && (
          <button
            onClick={() => onCopyCode(rawCode)}
            className="px-3 py-1 rounded-md bg-[#6366F1] hover:bg-[#4F46E5] text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
          >
            {copiedType === "code" ? <Check size={12} /> : <Copy size={12} />}
            <span>{copiedType === "code" ? "Copied Code!" : "Copy Code"}</span>
          </button>
        )}

        {activeTab === "prompt" && (
          <button
            onClick={() => onCopyPrompt(aiPrompt)}
            className="px-3 py-1 rounded-md bg-[#6366F1] hover:bg-[#4F46E5] text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
          >
            {copiedType === "prompt" ? <Check size={12} /> : <Bot size={12} />}
            <span>{copiedType === "prompt" ? "Copied Prompt!" : "Copy AI Prompt"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
