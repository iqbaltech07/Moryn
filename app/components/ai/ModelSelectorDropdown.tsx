"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Sparkles, Cpu, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiModelOption } from "@/lib/ai/models";

export interface ModelSelectorDropdownProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  geminiModels: AiModelOption[];
  openRouterFreeModels: Array<{ id: string; name: string; isFree?: boolean }>;
  openRouterRankedModels: Array<{ id: string; name: string; isFree?: boolean }>;
  isGeminiLoading?: boolean;
  isOpenRouterLoading?: boolean;
  disabled?: boolean;
}

export const ModelSelectorDropdown: React.FC<ModelSelectorDropdownProps> = ({
  selectedModel,
  onSelectModel,
  geminiModels,
  openRouterFreeModels,
  openRouterRankedModels,
  isGeminiLoading = false,
  isOpenRouterLoading = false,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Determine current display label
  const currentModelName = (() => {
    if (!selectedModel) return "Gemini 2.5 Flash";
    const foundGemini = geminiModels.find((m) => m.id === selectedModel);
    if (foundGemini) return foundGemini.name;
    const foundFree = openRouterFreeModels.find((m) => m.id === selectedModel);
    if (foundFree) return foundFree.name;
    const foundRanked = openRouterRankedModels.find((m) => m.id === selectedModel);
    if (foundRanked) return foundRanked.name;
    return selectedModel.replace(/^models\//, "");
  })();

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "inline-flex items-center gap-1 text-[11px] font-bold text-[#e15b39] hover:text-[#c44827] transition-colors py-0.5 outline-none cursor-pointer select-none",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        title="Pilih Model AI"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="max-w-[220px] truncate">{currentModelName}</span>
        <ChevronDown
          size={13}
          strokeWidth={2.5}
          className={cn("shrink-0 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {/* Dropdown Menu (Pops Upward because trigger sits at bottom of panel) */}
      {open && (
        <div
          className={cn(
            "absolute left-0 bottom-full mb-2 w-72 sm:w-80 rounded-xl overflow-hidden z-50",
            "bg-white/95 backdrop-blur-xl border border-zinc-200/90 shadow-xl",
            "max-h-[320px] overflow-y-auto animate-fade-in text-xs"
          )}
          role="listbox"
        >
          {/* Section: Google Gemini */}
          <div className="py-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50/70 border-b border-zinc-100">
              <Sparkles size={11} className="text-[#e15b39]" />
              <span>Google Gemini</span>
            </div>
            {geminiModels.length > 0 ? (
              geminiModels.map((m) => {
                const isSelected = (selectedModel || "gemini-2.5-flash") === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onSelectModel(m.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-left transition-colors",
                      isSelected
                        ? "bg-[#e15b39]/10 text-[#e15b39] font-semibold"
                        : "text-zinc-700 hover:bg-zinc-100/70 hover:text-zinc-900"
                    )}
                  >
                    <span className="truncate pr-2">{m.name}</span>
                    {isSelected && <Check size={14} className="text-[#e15b39] shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-zinc-400 italic">
                {isGeminiLoading ? "Memuat model Gemini..." : "Gemini 2.5 Flash"}
              </div>
            )}
          </div>

          {/* Section: OpenRouter Free Models */}
          {openRouterFreeModels.length > 0 && (
            <div className="py-1 border-t border-zinc-100">
              <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50/70 border-b border-zinc-100">
                <div className="flex items-center gap-1.5">
                  <Cpu size={11} className="text-emerald-500" />
                  <span>Free Models</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-50 text-emerald-600 rounded font-semibold">
                  {openRouterFreeModels.length}
                </span>
              </div>
              {openRouterFreeModels.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onSelectModel(m.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-left transition-colors",
                      isSelected
                        ? "bg-[#e15b39]/10 text-[#e15b39] font-semibold"
                        : "text-zinc-700 hover:bg-zinc-100/70 hover:text-zinc-900"
                    )}
                  >
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <span className="truncate">{m.name}</span>
                      <span className="text-[9px] px-1 bg-zinc-100 text-zinc-500 rounded font-medium shrink-0">
                        Free
                      </span>
                    </div>
                    {isSelected && <Check size={14} className="text-[#e15b39] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Section: Top 20 Ranked Models */}
          {openRouterRankedModels.length > 0 && (
            <div className="py-1 border-t border-zinc-100">
              <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50/70 border-b border-zinc-100">
                <div className="flex items-center gap-1.5">
                  <Layers size={11} className="text-indigo-500" />
                  <span>Top Ranked Models</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 bg-indigo-50 text-indigo-600 rounded font-semibold">
                  {openRouterRankedModels.length}
                </span>
              </div>
              {openRouterRankedModels.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onSelectModel(m.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-left transition-colors",
                      isSelected
                        ? "bg-[#e15b39]/10 text-[#e15b39] font-semibold"
                        : "text-zinc-700 hover:bg-zinc-100/70 hover:text-zinc-900"
                    )}
                  >
                    <span className="truncate pr-2">{m.name}</span>
                    {isSelected && <Check size={14} className="text-[#e15b39] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {openRouterFreeModels.length === 0 && openRouterRankedModels.length === 0 && isOpenRouterLoading && (
            <div className="p-3 text-center text-zinc-400 italic">
              Memuat model OpenRouter...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
