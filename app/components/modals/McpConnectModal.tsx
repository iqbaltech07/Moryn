"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Terminal, X, Lock, FileCode2 } from "lucide-react";
import { apiClient } from "@/lib/utils/apiClient";

interface McpConnectModalProps {
  projectId: string;
  appName?: string;
  onClose: () => void;
}

export default function McpConnectModal({ projectId, appName, onClose }: McpConnectModalProps) {
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoadingKey, setIsLoadingKey] = useState(true);
  const [isCopiedKey, setIsCopiedKey] = useState(false);
  const [isCopiedCommand, setIsCopiedCommand] = useState(false);
  const [isCopiedPrompt, setIsCopiedPrompt] = useState(false);

  const fetchKey = async (): Promise<string> => {
    if (apiKey) return apiKey;
    try {
      setIsLoadingKey(true);
      const data = await apiClient.user.getApiKey();
      if (data.apiKey) {
        setApiKey(data.apiKey);
        return data.apiKey;
      }
    } catch (err) {
      console.warn("Failed to fetch API key:", err);
    } finally {
      setIsLoadingKey(false);
    }
    return "";
  };

  useEffect(() => {
    fetchKey();
  }, []);

  const keyToUse = apiKey || "";

  // Masked string representation for UI display (always sensored on UI, no eye toggle)
  const sensoredApiKeyDisplay = isLoadingKey
    ? "Memuat API Key..."
    : apiKey
      ? `${apiKey.slice(0, 10)}${"•".repeat(20)}${apiKey.slice(-4)}`
      : "piar_live_••••••••••••••••••••••••••••••••";

  // CLI command strings
  const getCliCommands = (key: string) => `npx moryn-cli login --token ${key || "<YOUR_API_KEY>"}
npx moryn-cli init --project ${projectId}`;

  const cliCommandsDisplay = `npx moryn-cli login --token ${sensoredApiKeyDisplay}
npx moryn-cli init --project ${projectId}`;

  // AI Prompt strings
  const getAiPrompt = (key: string) => `Bertindaklah sebagai AI Senior Fullstack Engineer untuk proyek Moryn ini.

Tolong jalankan alur kerja otomatisasi berikut:

1. SETUP CLI & INSTALL SKILL (Terminal):
   Jalankan 2 perintah berikut di terminal:
   npx moryn-cli login --token ${key || "<YOUR_API_KEY>"}
   npx moryn-cli init --project ${projectId}

2. BACA SYSTEM DIRECTIVES & WORKFLOW SKILL:
   Setelah init selesai, baca file instruksi .agents/skills/moryn/SKILL.md dan .moryn/context.md yang otomatis terpasang di workspace.
   Verifikasi freshness konteks (AH-017): jika <project_context>.updatedAt lebih baru dari generatedAt di komentar header context.md, refresh dulu dengan: .moryn/sync context > .moryn/context.md, lalu baca ulang.

3. EKSEKUSI TASK & AUTOMATIC KANBAN SYNC:
   - Cek task aktif dengan: .moryn/sync current
   - Sebelum mulai mengedit kode, tandai status task sebagai IN_PROGRESS dengan: .moryn/sync start <task-id>
   - Implementasikan solusi sesuai PRD dan aturan Anti-Hallucination.
   - WAJIB jalankan verifikasi lokal di terminal: npm run lint && npm run build
   - Jika verifikasi lulus: tandai DONE dengan: .moryn/sync complete <task-id>
   - Jika verifikasi gagal: tandai FAILED dengan: .moryn/sync fail <task-id> "alasan error"`;

  const aiPromptDisplay = `Bertindaklah sebagai AI Senior Fullstack Engineer untuk proyek Moryn ini.

Tolong jalankan alur kerja otomatisasi berikut:

1. SETUP CLI & INSTALL SKILL (Terminal):
   Jalankan 2 perintah berikut di terminal:
   npx moryn-cli login --token ${sensoredApiKeyDisplay}
   npx moryn-cli init --project ${projectId}

2. BACA SYSTEM DIRECTIVES & WORKFLOW SKILL:
   Setelah init selesai, baca file instruksi .agents/skills/moryn/SKILL.md dan .moryn/context.md yang otomatis terpasang di workspace.
   Verifikasi freshness konteks (AH-017): jika <project_context>.updatedAt lebih baru dari generatedAt di komentar header context.md, refresh dulu dengan: .moryn/sync context > .moryn/context.md, lalu baca ulang.

3. EKSEKUSI TASK & AUTOMATIC KANBAN SYNC:
   - Cek task aktif dengan: .moryn/sync current
   - Sebelum mulai mengedit kode, tandai status task sebagai IN_PROGRESS dengan: .moryn/sync start <task-id>
   - Implementasikan solusi sesuai PRD dan aturan Anti-Hallucination.
   - WAJIB jalankan verifikasi lokal di terminal: npm run lint && npm run build
   - Jika verifikasi lulus: tandai DONE dengan: .moryn/sync complete <task-id>
   - Jika verifikasi gagal: tandai FAILED dengan: .moryn/sync fail <task-id> "alasan error"`;

  const copyToClipboard = async (text: string, setCopiedState: (val: boolean) => void) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2500);
    } catch (e) {
      console.warn("Clipboard copy failed:", e);
    }
  };

  const handleCopyKey = async () => {
    let key = apiKey;
    if (!key) {
      key = await fetchKey();
    }
    if (key) {
      await copyToClipboard(key, setIsCopiedKey);
    }
  };

  const handleCopyCommand = async () => {
    let key = apiKey;
    if (!key) {
      key = await fetchKey();
    }
    await copyToClipboard(getCliCommands(key), setIsCopiedCommand);
  };

  const handleCopyPrompt = async () => {
    let key = apiKey;
    if (!key) {
      key = await fetchKey();
    }
    await copyToClipboard(getAiPrompt(key), setIsCopiedPrompt);
  };

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] bg-[var(--bg-elevated)] border border-[var(--border-hairline)] shadow-xl flex flex-col"
        style={{ borderRadius: "var(--radius-lg)", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Editorial/Utilitarian */}
        <div className="px-6 py-5 border-b border-[var(--border-hairline)] flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="font-[family-name:var(--font-body)] text-lg font-semibold text-[var(--fg-primary)] tracking-tight">
              Agent Connection Protocol
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)] rounded-[var(--radius-sm)] transition-colors"
            title="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">

          {/* Section: API Key */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-mono)] text-[11px] font-semibold text-[var(--fg-secondary)] tracking-widest uppercase flex items-center gap-2">
                Authentication Token
              </span>
              <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--fg-muted)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-[var(--radius-xs)] border border-[var(--border-hairline)] flex items-center gap-1.5">
                <Lock size={10} /> Sensored on UI
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[var(--radius-md)] px-4 py-2.5 overflow-hidden">
                <div className="font-[family-name:var(--font-mono)] text-sm text-[var(--fg-primary)] truncate select-none">
                  {sensoredApiKeyDisplay}
                </div>
              </div>
              <button
                onClick={handleCopyKey}
                disabled={isLoadingKey}
                className="shrink-0 h-full px-4 py-2.5 bg-white border border-[var(--border-strong)] rounded-[var(--radius-md)] font-[family-name:var(--font-mono)] text-xs font-semibold text-[var(--fg-primary)] hover:bg-[var(--bg-surface)] active:bg-[#ebebeb] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isCopiedKey ? <Check size={14} className="text-[var(--color-success)]" /> : <Copy size={14} />}
                {isCopiedKey ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="h-px bg-[var(--border-hairline)] w-full"></div>

          {/* Section: Terminal Setup */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-mono)] text-[11px] font-semibold text-[var(--fg-secondary)] tracking-widest uppercase flex items-center gap-2">
                1. Terminal Environment
              </span>
              <button
                onClick={handleCopyCommand}
                className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--fg-primary)] bg-white border border-[var(--border-strong)] hover:bg-[var(--bg-surface)] px-2.5 py-1 rounded-[var(--radius-sm)] flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {isCopiedCommand ? <Check size={12} className="text-[var(--color-success)]" /> : <Copy size={12} />}
                {isCopiedCommand ? "Copied" : "Copy CLI"}
              </button>
            </div>
            <div className="bg-[var(--color-brand-ink)] rounded-[var(--radius-md)] p-4 overflow-x-auto shadow-inner">
              <pre className="font-[family-name:var(--font-mono)] text-[13px] text-[#e8ebe8] leading-relaxed">
                {isLoadingKey ? "# Fetching API Key...\n..." : cliCommandsDisplay}
              </pre>
            </div>
            <p className="font-[family-name:var(--font-body)] text-xs text-[var(--fg-muted)] leading-relaxed mt-1">
              Jalankan perintah ini di terminal root proyek Anda. Perintah ini akan memasang Moryn CLI, login dengan kredensial Anda, dan menyiapkan context files lokal.
            </p>
          </div>

          {/* Section: Agent Prompt */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-mono)] text-[11px] font-semibold text-[var(--fg-secondary)] tracking-widest uppercase flex items-center gap-2">
                2. Agent Initialization Prompt
              </span>
              <button
                onClick={handleCopyPrompt}
                className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-background)] bg-[var(--color-brand-ink)] hover:bg-[#27272a] px-3 py-1.5 rounded-[var(--radius-sm)] flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {isCopiedPrompt ? <Check size={12} /> : <Copy size={12} />}
                {isCopiedPrompt ? "Copied" : "Copy Prompt"}
              </button>
            </div>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[var(--radius-md)] p-4 max-h-[160px] overflow-y-auto">
              <pre className="font-[family-name:var(--font-mono)] text-xs text-[var(--fg-secondary)] leading-relaxed whitespace-pre-wrap">
                {isLoadingKey ? "Menyiapkan prompt..." : aiPromptDisplay}
              </pre>
            </div>
            <p className="font-[family-name:var(--font-body)] text-xs text-[var(--fg-muted)] leading-relaxed mt-1">
              Paste prompt ini secara langsung ke AI Assistant Anda (Antigravity, Cursor, Claude, dll) untuk memulai alur kerja PRD terpandu secara otomatis.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
