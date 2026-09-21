import React from "react";
import { Sparkles, Check, Copy } from "lucide-react";
import { StudioPanelBodyProps } from "./types";
import { StudioPreviewRenderer } from "./StudioPreviewRenderer";

export function StudioPanelBody({
  activeTab,
  currentComponent,
  viewportWidth,
  previewKey,
  copiedType,
  onCopyCli,
}: StudioPanelBodyProps) {
  return (
    <div className="bg-[#090A0C] min-h-95 flex flex-col justify-center">
      {activeTab === "preview" && (
        <div className="p-6 md:p-8 flex items-center justify-center relative overflow-hidden bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[16px_16px]">
          <div
            key={previewKey}
            style={{ maxWidth: viewportWidth }}
            className="w-full transition-all duration-300 mx-auto"
          >
            <StudioPreviewRenderer componentId={currentComponent.id} />
          </div>
        </div>
      )}

      {activeTab === "code" && (
        <div className="relative p-5 max-h-125 overflow-y-auto custom-scrollbar">
          <pre className="p-4 rounded-xl bg-[#121318] border border-[#222634] text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
            <code>{currentComponent.rawCode}</code>
          </pre>
        </div>
      )}

      {activeTab === "prompt" && (
        <div className="p-5 space-y-3 max-h-125 overflow-y-auto custom-scrollbar">
          <div className="p-3 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs font-mono text-[#818CF8] flex items-center gap-2">
            <Sparkles size={14} className="shrink-0" />
            <span>
              Salin prompt ini ke AI Agent di IDE Anda (Cursor / Windsurf / Antigravity). AI akan
              membuat komponen scaffolding ini dengan standar Anti-Slop.
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#121318] border border-[#222634] text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
            {currentComponent.aiPrompt}
          </div>
        </div>
      )}

      {activeTab === "install" && (
        <div className="p-6 space-y-5 max-w-xl mx-auto">
          <div>
            <h4 className="text-xs font-mono font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-4 h-4 rounded bg-[#6366F1] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                1
              </span>
              <span>Generate Scaffold via Moryn CLI</span>
            </h4>
            <div className="p-3 rounded-lg bg-[#121318] border border-[#222634] flex items-center justify-between font-mono text-xs text-slate-200">
              <code>{currentComponent.cliCommand}</code>
              <button
                onClick={() => onCopyCli(currentComponent.cliCommand)}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Copy scaffold command"
              >
                {copiedType === "cli" ? (
                  <Check size={13} className="text-emerald-400" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-4 h-4 rounded bg-[#10B981] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                2
              </span>
              <span>Scaffold File Location</span>
            </h4>
            <p className="text-xs text-slate-400 font-mono">
              Output akan dibuat di:{" "}
              <code className="text-slate-200">src/components/{currentComponent.name}.tsx</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
