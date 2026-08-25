"use client";

import { useEffect, useState } from "react";
import {
  KeyRound,
  Plus,
  Trash2,
  Check,
  Copy,
  ChevronUp,
  ChevronDown,
  Activity,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Power,
  Sparkles,
  Zap,
  Cpu,
  Edit3,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/utils/apiClient";
import { toast } from "sonner";

interface CustomKeyItem {
  id: string;
  provider: "gemini" | "openrouter";
  label: string;
  maskedKey: string;
  isActive: boolean;
  priority: number;
  preferredModel?: string;
  createdAt: string;
  lastUsedAt?: string;
  inCooldown?: boolean;
}

const GEMINI_AVAILABLE_MODELS = [
  { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash (Default / Recommended)", badge: "Fast & Smart" },
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", badge: "Fast" },
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", badge: "Balanced" },
  { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite", badge: "Ultra Fast" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", badge: "Stable" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", badge: "Deep Reasoning" },
];

const DEFAULT_POPULAR_OPENROUTER_MODELS = [
  { id: "nvidia/nemotron-3-ultra-550b-a55b:free", name: "Nemotron 3 Ultra 550B (Free)", isFree: true },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B Instruct (Free)", isFree: true },
  { id: "qwen/qwen-2.5-72b-instruct:free", name: "Qwen 2.5 72B Instruct (Free)", isFree: true },
  { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 Reasoning (Free)", isFree: true },
  { id: "mistralai/mistral-small-24b-instruct-2501:free", name: "Mistral Small 24B (Free)", isFree: true },
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash Exp (Free)", isFree: true },
  { id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7 Sonnet (Anthropic)", isFree: false },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet (Anthropic)", isFree: false },
  { id: "openai/gpt-4o", name: "GPT-4o (OpenAI)", isFree: false },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3 Chat", isFree: false },
];

export default function CustomAiKeysSection() {
  const [keys, setKeys] = useState<CustomKeyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingModelKeyId, setEditingModelKeyId] = useState<string | null>(null);
  const [editingModelValue, setEditingModelValue] = useState("");

  // OpenRouter Models List from API
  const [openRouterFreeModels, setOpenRouterFreeModels] = useState<any[]>([]);
  const [openRouterPopularModels, setOpenRouterPopularModels] = useState<any[]>(DEFAULT_POPULAR_OPENROUTER_MODELS);
  const [isModelsLoading, setIsModelsLoading] = useState(false);

  // Form State for Adding New Key
  const [newProvider, setNewProvider] = useState<"gemini" | "openrouter">("gemini");
  const [newLabel, setNewLabel] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [newPreferredModel, setNewPreferredModel] = useState("gemini-3.7-flash");
  const [customModelInput, setCustomModelInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
    fetchOpenRouterModels();
  }, []);

  async function fetchKeys() {
    try {
      setIsLoading(true);
      const res = await apiClient.user.getCustomAiKeys();
      setKeys(res.keys || []);
    } catch (err: unknown) {
      console.warn("Failed to fetch custom keys:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchOpenRouterModels() {
    try {
      setIsModelsLoading(true);
      const res = await apiClient.openrouter.getModels();
      if (res.freeModels && res.freeModels.length > 0) {
        setOpenRouterFreeModels(res.freeModels);
      }
      if (res.popularModels && res.popularModels.length > 0) {
        setOpenRouterPopularModels(res.popularModels);
      }
    } catch (e) {
      console.warn("Failed to fetch live OpenRouter models, using fallback list:", e);
    } finally {
      setIsModelsLoading(false);
    }
  }

  // Set default model when provider changes
  useEffect(() => {
    if (newProvider === "gemini") {
      setNewPreferredModel("gemini-3.7-flash");
    } else {
      setNewPreferredModel("nvidia/nemotron-3-ultra-550b-a55b:free");
    }
  }, [newProvider]);

  async function handleAddKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newApiKey.trim()) {
      setFormError("API Key tidak boleh kosong.");
      return;
    }

    const resolvedModel =
      newPreferredModel === "custom" ? customModelInput.trim() : newPreferredModel;

    if (newPreferredModel === "custom" && !resolvedModel) {
      setFormError("Harap masukkan Custom Model ID.");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const res = await apiClient.user.addCustomAiKey({
        provider: newProvider,
        label: newLabel.trim() || undefined,
        apiKey: newApiKey.trim(),
        preferredModel: resolvedModel,
      });

      if (res.success) {
        toast.success("API Key berhasil diverifikasi & ditambahkan ke fallback pool!");
        setKeys(res.keys || []);
        setIsAdding(false);
        setNewApiKey("");
        setNewLabel("");
        setCustomModelInput("");
      }
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Gagal menambahkan API Key. Periksa kembali apakah key valid.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveModelChange(keyId: string) {
    if (!editingModelValue.trim()) return;
    try {
      const res = await apiClient.user.updateCustomAiKeys({
        updateModel: { id: keyId, preferredModel: editingModelValue.trim() },
      });
      if (res.success) {
        setKeys(res.keys || []);
        setEditingModelKeyId(null);
        toast.success("Model berhasil diperbarui untuk API Key ini!");
      }
    } catch (err: unknown) {
      toast.error("Gagal memperbarui model.");
    }
  }

  async function handleToggle(id: string) {
    try {
      const res = await apiClient.user.updateCustomAiKeys({ toggleId: id });
      if (res.success) {
        setKeys(res.keys || []);
        toast.success("Status API Key diperbarui.");
      }
    } catch (err: unknown) {
      toast.error("Gagal mengubah status key.");
    }
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Hapus API Key "${label}" dari fallback pool?`)) return;

    try {
      const res = await apiClient.user.deleteCustomAiKey(id);
      if (res.success) {
        setKeys(res.keys || []);
        toast.success("API Key berhasil dihapus.");
      }
    } catch (err: unknown) {
      toast.error("Gagal menghapus API Key.");
    }
  }

  async function handleMovePriority(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= keys.length) return;

    const newKeys = [...keys];
    const temp = newKeys[index];
    newKeys[index] = newKeys[targetIndex];
    newKeys[targetIndex] = temp;

    // Recalculate priority
    const reorderPayload = newKeys.map((k, idx) => ({ id: k.id, priority: idx + 1 }));

    // Optimistic update
    setKeys(
      newKeys.map((k, idx) => ({
        ...k,
        priority: idx + 1,
      }))
    );

    try {
      const res = await apiClient.user.updateCustomAiKeys({ reorder: reorderPayload });
      if (res.success) {
        setKeys(res.keys || []);
      }
    } catch (err: unknown) {
      toast.error("Gagal mengubah urutan prioritas.");
      fetchKeys();
    }
  }

  async function handleTestKey(id: string) {
    setIsTesting(id);
    try {
      const res = await apiClient.user.testCustomAiKey({ keyId: id });
      if (res.success) {
        toast.success("Koneksi API Key berhasil & aktif! Siap digunakan.");
      } else {
        toast.error(res.error || "Uji koneksi gagal.");
      }
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Uji koneksi gagal.";
      toast.error(msg);
    } finally {
      setIsTesting(null);
    }
  }

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Masked key disalin.");
  }

  const activeCount = keys.filter((k) => k.isActive).length;

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-hairline)",
        borderRadius: "var(--radius-lg)",
        padding: "24px 28px",
        marginBottom: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid texture */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header Title */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                background: "rgba(79,209,197,0.1)",
                border: "1px solid rgba(79,209,197,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <KeyRound size={18} style={{ color: "var(--color-circuit)" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--fg-primary)",
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Custom AI API Keys & Multi-Model Fallback Pool
                </h3>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "var(--radius-xs)",
                    background: activeCount > 0 ? "rgba(79,209,197,0.15)" : "var(--bg-elevated)",
                    border: `1px solid ${activeCount > 0 ? "var(--color-circuit)" : "var(--border-hairline)"}`,
                    color: activeCount > 0 ? "var(--color-circuit)" : "var(--fg-muted)",
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                  }}
                >
                  {activeCount > 0 ? `⚡ ${activeCount} Keys Active` : "System Default Mode"}
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--fg-muted)",
                  margin: "4px 0 0",
                  letterSpacing: "0.02em",
                  lineHeight: 1.5,
                  maxWidth: 680,
                }}
              >
                Gunakan API key AI sendiri (Google Gemini / OpenRouter). Anda dapat memilih <strong>model spesifik</strong> untuk setiap key dan mendaftarkan <strong>lebih dari 1 key</strong> agar sistem otomatis melakukan <strong>fallback berantai</strong> jika key utama mencapai limit kuota.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setIsAdding(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-circuit)",
                background: "rgba(79,209,197,0.12)",
                color: "var(--color-circuit)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <Plus size={14} /> Tambah API Key
            </button>
          </div>
        </div>

        {/* Benefits Banner */}
        <div
          style={{
            background: "rgba(255,182,39,0.06)",
            border: "1px solid rgba(255,182,39,0.25)",
            borderRadius: "var(--radius-md)",
            padding: "10px 14px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--color-signal)",
          }}
        >
          <Sparkles size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Model Transparency:</strong> Anda bebas memilih model gratisan (Llama 3.3, DeepSeek R1, Nemotron) maupun model berbayar (Claude 3.7, GPT-4o). Penggunaan Custom Key otomatis <strong>membypass kuota harian platform</strong>.
          </span>
        </div>

        {/* Add Key Form / Modal Inline */}
        {isAdding && (
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--color-circuit)",
              borderRadius: "var(--radius-md)",
              padding: "20px",
              marginBottom: 20,
              animation: "fadeIn 0.2s ease-in-out",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Zap size={16} color="var(--color-circuit)" />
                <h4 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700 }}>
                  Tambah AI API Key & Pilih Model
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setFormError(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--fg-muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                Tutup ✕
              </button>
            </div>

            <form onSubmit={handleAddKey} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12 }}>
                {/* Provider Select */}
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--fg-muted)", marginBottom: 6, textTransform: "uppercase" }}>
                    AI Provider
                  </label>
                  <select
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value as "gemini" | "openrouter")}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-hairline)",
                      background: "var(--bg-surface)",
                      color: "var(--fg-primary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      outline: "none",
                    }}
                  >
                    <option value="gemini">Google Gemini (Free / Pro)</option>
                    <option value="openrouter">OpenRouter (Multi-Model)</option>
                  </select>
                </div>

                {/* Label Input */}
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--fg-muted)", marginBottom: 6, textTransform: "uppercase" }}>
                    Label / Nama Key (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder={`Contoh: ${newProvider === "gemini" ? "Gemini Personal Akun 1" : "OpenRouter Claude/Llama"}`}
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-hairline)",
                      background: "var(--bg-surface)",
                      color: "var(--fg-primary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Model Selector Dropdown */}
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--fg-muted)", marginBottom: 6, textTransform: "uppercase" }}>
                  Model AI Pilihan (Preferred Model)
                </label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <select
                    value={newPreferredModel}
                    onChange={(e) => setNewPreferredModel(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: 260,
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-hairline)",
                      background: "var(--bg-surface)",
                      color: "var(--fg-primary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      outline: "none",
                    }}
                  >
                    {newProvider === "gemini" ? (
                      <optgroup label="Google Gemini Models">
                        {GEMINI_AVAILABLE_MODELS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.id})
                          </option>
                        ))}
                      </optgroup>
                    ) : (
                      <>
                        <optgroup label="🆓 OpenRouter Free Models ($0)">
                          {openRouterFreeModels.length > 0
                            ? openRouterFreeModels.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} ({m.id})
                                </option>
                              ))
                            : DEFAULT_POPULAR_OPENROUTER_MODELS.filter((m) => m.isFree).map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                </option>
                              ))}
                        </optgroup>
                        <optgroup label="⚡ Flagship / Top Tier Models (Paid Account)">
                          {DEFAULT_POPULAR_OPENROUTER_MODELS.filter((m) => !m.isFree).map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.id})
                            </option>
                          ))}
                        </optgroup>
                        <option value="custom">✏️ Masukkan Custom Model ID Lainnya...</option>
                      </>
                    )}
                  </select>

                  {newPreferredModel === "custom" && (
                    <input
                      type="text"
                      placeholder="e.g. meta-llama/llama-3.1-405b-instruct"
                      value={customModelInput}
                      onChange={(e) => setCustomModelInput(e.target.value)}
                      required
                      style={{
                        flex: 1,
                        minWidth: 240,
                        padding: "10px 12px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--color-circuit)",
                        background: "var(--bg-surface)",
                        color: "var(--fg-primary)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        outline: "none",
                      }}
                    />
                  )}
                </div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-muted)", margin: "4px 0 0" }}>
                  {newProvider === "gemini"
                    ? "Model ini akan menjadi pilihan utama saat mengeksekusi request AI via key ini."
                    : "Pilih model gratisan atau model flagship sesuai jenis saldo akun OpenRouter Anda."}
                </p>
              </div>

              {/* API Key Input */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase" }}>
                    Secret API Key String
                  </label>
                  {newProvider === "gemini" ? (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--color-signal)",
                        textDecoration: "none",
                      }}
                    >
                      Dapatkan Gemini API Key Gratis di Google AI Studio <ExternalLink size={10} />
                    </a>
                  ) : (
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--color-circuit)",
                        textDecoration: "none",
                      }}
                    >
                      Dapatkan OpenRouter Key di openrouter.ai/keys <ExternalLink size={10} />
                    </a>
                  )}
                </div>
                <input
                  type="password"
                  placeholder={newProvider === "gemini" ? "AIzaSy..." : "sk-or-v1-..."}
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-hairline)",
                    background: "var(--bg-surface)",
                    color: "var(--fg-primary)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    outline: "none",
                    letterSpacing: "0.05em",
                  }}
                />
              </div>

              {formError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: "var(--radius-xs)",
                    background: "rgba(255, 99, 99, 0.1)",
                    border: "1px solid rgba(255, 99, 99, 0.3)",
                    color: "#ff6b6b",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                  }}
                >
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{formError}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  disabled={isSaving}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-hairline)",
                    background: "transparent",
                    color: "var(--fg-muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    background: "var(--color-circuit)",
                    color: "var(--color-ink)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: isSaving ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {isSaving ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                  {isSaving ? "Memverifikasi & Menyimpan..." : "Verifikasi & Simpan Key"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Key List Table */}
        {isLoading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--fg-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
            <Loader2 size={20} className="animate-spin" style={{ margin: "0 auto 8px" }} />
            Memuat daftar API Key...
          </div>
        ) : keys.length === 0 ? (
          <div
            style={{
              padding: "28px",
              textAlign: "center",
              background: "var(--bg-elevated)",
              border: "1px dashed var(--border-hairline)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <KeyRound size={28} style={{ color: "var(--fg-muted)", margin: "0 auto 8px", opacity: 0.5 }} />
            <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--fg-primary)", marginBottom: 4 }}>
              Belum Ada Custom API Key
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)", margin: "0 0 14px", maxWidth: 460, marginInline: "auto" }}>
              Sistem saat ini menggunakan kuota default platform Moryn. Tambahkan API key Google Gemini atau OpenRouter Anda sendiri untuk bebas memilih model dan generasi tak terbatas.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-circuit)",
                background: "rgba(79,209,197,0.1)",
                color: "var(--color-circuit)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Plus size={13} /> Tambah Key Pertama
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {keys.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === keys.length - 1;
              const isEditingThisModel = editingModelKeyId === item.id;
              const activeModelName = item.preferredModel || (item.provider === "gemini" ? "gemini-3.7-flash" : "nvidia/nemotron-3-ultra-550b-a55b:free");
              const isFreeModel = activeModelName.includes(":free") || item.provider === "gemini";

              return (
                <div
                  key={item.id}
                  style={{
                    background: item.isActive ? "var(--bg-elevated)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${item.inCooldown ? "rgba(255,182,39,0.4)" : item.isActive ? "var(--border-hairline)" : "rgba(255,255,255,0.04)"}`,
                    borderRadius: "var(--radius-md)",
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    opacity: item.isActive ? 1 : 0.6,
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    {/* Left: Priority + Identity */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 260, flex: 1 }}>
                      {/* Priority Reordering Controls */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <button
                          onClick={() => handleMovePriority(index, "up")}
                          disabled={isFirst}
                          title="Naikkan Prioritas Fallback"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: isFirst ? "rgba(255,255,255,0.15)" : "var(--fg-secondary)",
                            cursor: isFirst ? "default" : "pointer",
                            padding: 2,
                            display: "flex",
                          }}
                        >
                          <ChevronUp size={14} />
                        </button>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            fontWeight: 800,
                            color: "var(--color-signal)",
                            background: "rgba(255,182,39,0.1)",
                            padding: "1px 5px",
                            borderRadius: "var(--radius-xs)",
                          }}
                        >
                          #{item.priority}
                        </span>
                        <button
                          onClick={() => handleMovePriority(index, "down")}
                          disabled={isLast}
                          title="Turunkan Prioritas Fallback"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: isLast ? "rgba(255,255,255,0.15)" : "var(--fg-secondary)",
                            cursor: isLast ? "default" : "pointer",
                            padding: 2,
                            display: "flex",
                          }}
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--fg-primary)" }}>
                            {item.label}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "2px 6px",
                              borderRadius: "var(--radius-xs)",
                              background: item.provider === "gemini" ? "rgba(79,209,197,0.1)" : "rgba(255,182,39,0.1)",
                              color: item.provider === "gemini" ? "var(--color-circuit)" : "var(--color-signal)",
                              border: `1px solid ${item.provider === "gemini" ? "rgba(79,209,197,0.25)" : "rgba(255,182,39,0.25)"}`,
                            }}
                          >
                            {item.provider}
                          </span>

                          {/* Cooldown / Health Status */}
                          {item.inCooldown ? (
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 9,
                                padding: "2px 6px",
                                borderRadius: "var(--radius-xs)",
                                background: "rgba(255,182,39,0.15)",
                                color: "var(--color-signal)",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Activity size={10} /> 429 Cooldown (Auto Fallback)
                            </span>
                          ) : item.isActive ? (
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 9,
                                padding: "2px 6px",
                                borderRadius: "var(--radius-xs)",
                                background: "rgba(79,209,197,0.1)",
                                color: "var(--color-circuit)",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Check size={10} /> Ready
                            </span>
                          ) : (
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 9,
                                padding: "2px 6px",
                                borderRadius: "var(--radius-xs)",
                                background: "rgba(255,255,255,0.05)",
                                color: "var(--fg-muted)",
                              }}
                            >
                              Disabled
                            </span>
                          )}
                        </div>

                        {/* Masked Key Display */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <code
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 11,
                              color: "var(--fg-muted)",
                              background: "rgba(0,0,0,0.3)",
                              padding: "2px 6px",
                              borderRadius: "var(--radius-xs)",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {item.maskedKey}
                          </code>
                          <button
                            onClick={() => handleCopy(item.id, item.maskedKey)}
                            title="Copy Masked Key"
                            style={{
                              background: "transparent",
                              border: "none",
                              color: copiedId === item.id ? "var(--color-circuit)" : "var(--fg-muted)",
                              cursor: "pointer",
                              padding: 2,
                            }}
                          >
                            {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* Test Connection Button */}
                      <button
                        onClick={() => handleTestKey(item.id)}
                        disabled={isTesting === item.id}
                        title="Tes Koneksi API Key"
                        style={{
                          padding: "6px 10px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border-hairline)",
                          background: "var(--bg-surface)",
                          color: "var(--fg-secondary)",
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: isTesting === item.id ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        {isTesting === item.id ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <RefreshCw size={11} />
                        )}
                        Test Ping
                      </button>

                      {/* Toggle Active Switch */}
                      <button
                        onClick={() => handleToggle(item.id)}
                        title={item.isActive ? "Nonaktifkan Key" : "Aktifkan Key"}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "var(--radius-sm)",
                          border: `1px solid ${item.isActive ? "rgba(79,209,197,0.3)" : "var(--border-hairline)"}`,
                          background: item.isActive ? "rgba(79,209,197,0.08)" : "transparent",
                          color: item.isActive ? "var(--color-circuit)" : "var(--fg-muted)",
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Power size={11} />
                        {item.isActive ? "ON" : "OFF"}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(item.id, item.label)}
                        title="Hapus Key"
                        style={{
                          padding: "6px 8px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid rgba(255, 99, 99, 0.2)",
                          background: "rgba(255, 99, 99, 0.05)",
                          color: "#ff6b6b",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Model Badge & Quick Switcher Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 8,
                      borderTop: "1px solid rgba(255,255,255,0.04)",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Cpu size={13} color="var(--color-circuit)" />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-muted)" }}>
                        Active Model:
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--fg-primary)",
                          background: "rgba(255,255,255,0.05)",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-xs)",
                          border: "1px solid var(--border-hairline)",
                        }}
                      >
                        {activeModelName}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "1px 5px",
                          borderRadius: "var(--radius-xs)",
                          background: isFreeModel ? "rgba(79,209,197,0.15)" : "rgba(168,85,247,0.15)",
                          color: isFreeModel ? "var(--color-circuit)" : "#c084fc",
                          border: `1px solid ${isFreeModel ? "rgba(79,209,197,0.3)" : "rgba(168,85,247,0.3)"}`,
                        }}
                      >
                        {isFreeModel ? "FREE TIER" : "PRO / PAID"}
                      </span>
                    </div>

                    {/* Quick Switch Model Button */}
                    {!isEditingThisModel ? (
                      <button
                        onClick={() => {
                          setEditingModelKeyId(item.id);
                          setEditingModelValue(activeModelName);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "3px 8px",
                          borderRadius: "var(--radius-xs)",
                          border: "1px solid var(--border-hairline)",
                          background: "transparent",
                          color: "var(--color-signal)",
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Edit3 size={11} /> Ganti Model
                      </button>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <select
                          value={editingModelValue}
                          onChange={(e) => setEditingModelValue(e.target.value)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "var(--radius-xs)",
                            border: "1px solid var(--color-circuit)",
                            background: "var(--bg-surface)",
                            color: "var(--fg-primary)",
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            outline: "none",
                          }}
                        >
                          {item.provider === "gemini" ? (
                            <optgroup label="Google Gemini Models">
                              {GEMINI_AVAILABLE_MODELS.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                </option>
                              ))}
                            </optgroup>
                          ) : (
                            <>
                              <optgroup label="🆓 Free Models ($0)">
                                {openRouterFreeModels.length > 0
                                  ? openRouterFreeModels.map((m) => (
                                      <option key={m.id} value={m.id}>
                                        {m.name} ({m.id})
                                      </option>
                                    ))
                                  : DEFAULT_POPULAR_OPENROUTER_MODELS.filter((m) => m.isFree).map((m) => (
                                      <option key={m.id} value={m.id}>
                                        {m.name}
                                      </option>
                                    ))}
                              </optgroup>
                              <optgroup label="⚡ Flagship Models (Paid)">
                                {DEFAULT_POPULAR_OPENROUTER_MODELS.filter((m) => !m.isFree).map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name}
                                  </option>
                                ))}
                              </optgroup>
                            </>
                          )}
                        </select>
                        <button
                          onClick={() => handleSaveModelChange(item.id)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "var(--radius-xs)",
                            border: "none",
                            background: "var(--color-circuit)",
                            color: "var(--color-ink)",
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditingModelKeyId(null)}
                          style={{
                            padding: "4px 6px",
                            borderRadius: "var(--radius-xs)",
                            border: "1px solid var(--border-hairline)",
                            background: "transparent",
                            color: "var(--fg-muted)",
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            cursor: "pointer",
                          }}
                        >
                          Batal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
