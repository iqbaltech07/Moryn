"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Key,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Plus,
  Trash2,
  Power,
  Activity,
  ShieldCheck,
  Zap,
  Terminal,
  User,
  Award,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Sprout,
  Compass,
  PenLine,
  LayoutList,
  Lightbulb,
  Map,
  Timer,
  Telescope,
  Trophy,
  Wrench,
  Lock,
  Star,
  CheckCircle2,
  Folder,
  Calendar,
} from "lucide-react";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardHeader from "../components/DashboardHeader";
import { apiClient } from "@/lib/utils/apiClient";
import {
  getRank,
  getNextRank,
  getRankProgress,
  getExpToNextRank,
  RANKS,
} from "@/lib/analytics/gamification";
import { toast } from "sonner";
import settingsStyles from "./settings.module.css";

const RANK_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  Sprout,
  Compass,
  PenLine,
  LayoutList,
  Lightbulb,
  Map,
  Timer,
  Telescope,
  Trophy,
  Wrench,
};

interface CustomKeyItem {
  id: string;
  provider: "gemini" | "openrouter";
  label: string;
  maskedKey: string;
  isActive: boolean;
  priority: number;
  preferredModel?: string;
  createdAt: string;
  inCooldown?: boolean;
  lastUsedAt?: string;
}

interface UserProfileData {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  tier: string;
  exp: number;
  prdCount: number;
  createdAt: Date | string;
  totalProjects?: number;
  completedProjects?: number;
  monthlyUsage?: string;
}

interface SettingsClientProps {
  user: UserProfileData;
}

const GEMINI_MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (Fast & Default)" },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite (Ultra Fast)" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (Deep Reasoning)" },
];

const OPENROUTER_MODELS = [
  { id: "inclusionai/ling-3.0-flash-sante:free", name: "Ling 3.0 Flash Sante (Free)" },
  { id: "dots-studio/dots-3-note-preview:free", name: "Dots 3 Note Preview (Free)" },
  { id: "nvidia/nemotron-3.5-lightning:free", name: "Nemotron 3.5 Lightning (Free)" },
  { id: "google/gemma-4-31b-it:free", name: "Gemma 4 31B (Free)" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (Free)" },
  { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 Reasoning (Free)" },
  { id: "openai/gpt-6-astra", name: "OpenAI: GPT-6 Astra" },
  { id: "openai/gpt-6-astra-pro", name: "OpenAI: GPT-6 Astra Pro" },
  { id: "qwen/qwen3.8-max-0902", name: "Qwen: Qwen3.8 Max" },
  { id: "anthropic/claude-fable-5.1", name: "Anthropic: Claude Fable 5.1" },
  { id: "inception/mercury-2.5-preview", name: "Inception: Mercury 2.5 Preview" },
  { id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7 Sonnet" },
  { id: "openai/gpt-4o", name: "GPT-4o (OpenAI)" },
];

export default function SettingsClient({ user }: SettingsClientProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"keys" | "byok" | "account">(
    tabParam === "account" ? "account" : tabParam === "byok" ? "byok" : "keys"
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "account" || tab === "byok" || tab === "keys") {
      setActiveSection(tab);
    }
  }, [searchParams]);

  const rank = getRank(user.exp);
  const nextRank = getNextRank(user.exp);
  const rankProgress = getRankProgress(user.exp);
  const expToNext = getExpToNextRank(user.exp);
  const CurrentRankIcon = RANK_ICON_MAP[rank.icon] ?? Star;

  // Moryn Workspace API Key State
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isKeyLoading, setIsKeyLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Custom AI Keys (BYOK) State
  const [customKeys, setCustomKeys] = useState<CustomKeyItem[]>([]);
  const [isByokLoading, setIsByokLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [updatingModelId, setUpdatingModelId] = useState<string | null>(null);

  // Dynamic Gemini Models State (Fetched from API)
  const [geminiModels, setGeminiModels] = useState<Array<{ id: string; name: string }>>(GEMINI_MODELS);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);

  // Dynamic OpenRouter Models State (Top 20 Ranked + Free Models)
  const [openRouterFreeModels, setOpenRouterFreeModels] = useState<Array<{ id: string; name: string; isFree?: boolean }>>([]);
  const [openRouterRankedModels, setOpenRouterRankedModels] = useState<Array<{ id: string; name: string; isFree?: boolean }>>([]);
  const [isOpenRouterLoading, setIsOpenRouterLoading] = useState(false);

  // Form State for Adding Custom Key
  const [newProvider, setNewProvider] = useState<"gemini" | "openrouter">("gemini");
  const [newLabel, setNewLabel] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [newModel, setNewModel] = useState("gemini-2.5-flash");
  const [isSavingKey, setIsSavingKey] = useState(false);

  useEffect(() => {
    fetchMorynApiKey();
    fetchCustomAiKeys();
    fetchOpenRouterModels();
    fetchGeminiModels();
  }, []);

  // Fetch Google Gemini Models from API
  async function fetchGeminiModels() {
    try {
      setIsGeminiLoading(true);
      const res = await apiClient.gemini.getModels();
      if (res.models && res.models.length > 0) {
        setGeminiModels(res.models);
      }
    } catch (err: unknown) {
      console.warn("Failed to fetch Gemini models:", err);
    } finally {
      setIsGeminiLoading(false);
    }
  }

  // Fetch OpenRouter Models (20 Ranked + All Free)
  async function fetchOpenRouterModels() {
    try {
      setIsOpenRouterLoading(true);
      const res = await apiClient.openrouter.getModels();
      if (res.freeModels && res.freeModels.length > 0) {
        setOpenRouterFreeModels(res.freeModels);
      }
      if (res.popularModels && res.popularModels.length > 0) {
        setOpenRouterRankedModels(res.popularModels);
      }
    } catch (err: unknown) {
      console.warn("Failed to fetch OpenRouter models:", err);
    } finally {
      setIsOpenRouterLoading(false);
    }
  }

  // Fetch Moryn Workspace Key
  async function fetchMorynApiKey() {
    try {
      setIsKeyLoading(true);
      const data = await apiClient.user.getApiKey();
      setHasApiKey(Boolean(data.hasApiKey));
      setApiKey(data.apiKey || null);
    } catch (err: unknown) {
      console.warn("Failed to fetch Moryn API key:", err);
    } finally {
      setIsKeyLoading(false);
    }
  }

  // Fetch Custom BYOK Keys
  async function fetchCustomAiKeys() {
    try {
      setIsByokLoading(true);
      const res = await apiClient.user.getCustomAiKeys();
      setCustomKeys(res.keys || []);
    } catch (err: unknown) {
      console.warn("Failed to fetch custom AI keys:", err);
    } finally {
      setIsByokLoading(false);
    }
  }

  // Handle Regenerate Key
  async function handleRegenerateApiKey() {
    if (!confirm("Regenerate Moryn API Key? Your previous key will be immediately invalidated.")) return;
    try {
      setIsRegenerating(true);
      const data = await apiClient.user.generateApiKey();
      setApiKey(data.apiKey || null);
      setHasApiKey(Boolean(data.apiKey));
      setShowKey(true);
      toast.success("New Moryn API Key generated successfully");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to regenerate API Key");
    } finally {
      setIsRegenerating(false);
    }
  }

  // Handle Copy Key
  const handleCopyKey = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast.success("API Key copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.warn("Copy failed:", e);
    }
  };

  // Handle Add Custom AI Key
  async function handleAddCustomKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyValue.trim()) {
      toast.error("Please enter an API Key");
      return;
    }

    try {
      setIsSavingKey(true);
      await apiClient.user.addCustomAiKey({
        provider: newProvider,
        label: newLabel.trim() || `${newProvider === "gemini" ? "Google Gemini" : "OpenRouter"} Key`,
        apiKey: newKeyValue.trim(),
        preferredModel: newModel,
      });

      toast.success("Custom AI key saved successfully");
      setShowAddModal(false);
      setNewLabel("");
      setNewKeyValue("");
      fetchCustomAiKeys();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to save key");
    } finally {
      setIsSavingKey(false);
    }
  }

  // Handle Toggle Custom Key
  async function handleToggleCustomKey(id: string, currentActive: boolean) {
    try {
      await apiClient.user.updateCustomAiKeys({ toggleId: id });
      setCustomKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, isActive: !currentActive } : k))
      );
      toast.success(!currentActive ? "Key activated" : "Key disabled");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to update key status");
    }
  }

  // Handle Delete Custom Key
  async function handleDeleteCustomKey(id: string, label: string) {
    if (!confirm(`Delete custom key "${label}"?`)) return;
    try {
      await apiClient.user.deleteCustomAiKey(id);
      setCustomKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success("Custom key deleted");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to delete key");
    }
  }

  // Handle Test Custom Key Connection
  async function handleTestCustomKey(id: string) {
    try {
      setTestingId(id);
      const res = await apiClient.user.testCustomAiKey({ keyId: id });
      if (res.success) {
        toast.success(res.message || "Connection verified successfully!");
      } else {
        toast.error(res.message || "Key verification failed");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Verification failed");
    } finally {
      setTestingId(null);
    }
  }

  // Handle Update Custom Key Model
  async function handleUpdateKeyModel(id: string, newPreferredModel: string) {
    try {
      setUpdatingModelId(id);
      await apiClient.user.updateCustomAiKeys({
        updateModel: { id, preferredModel: newPreferredModel },
      });
      setCustomKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, preferredModel: newPreferredModel } : k))
      );
      toast.success(`Model updated to ${newPreferredModel}`);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to update model");
    } finally {
      setUpdatingModelId(null);
    }
  }

  // Handle Move Priority Order
  async function handleMovePriority(id: string, direction: "up" | "down") {
    const currentIndex = customKeys.findIndex((k) => k.id === id);
    if (currentIndex === -1) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= customKeys.length) return;

    const newKeys = [...customKeys];
    const [moved] = newKeys.splice(currentIndex, 1);
    newKeys.splice(targetIndex, 0, moved);

    const reorderPayload = newKeys.map((k, idx) => ({ id: k.id, priority: idx + 1 }));
    const updatedKeys = newKeys.map((k, idx) => ({ ...k, priority: idx + 1 }));
    setCustomKeys(updatedKeys);

    try {
      await apiClient.user.updateCustomAiKeys({ reorder: reorderPayload });
      toast.success(
        direction === "up"
          ? "Priority increased (shifted toward Primary)"
          : "Priority decreased (shifted toward Fallback)"
      );
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to update priority order");
      fetchCustomAiKeys();
    }
  }

  const maskedKey = apiKey
    ? `${apiKey.slice(0, 8)}${"•".repeat(16)}${apiKey.slice(-4)}`
    : hasApiKey
    ? "••••••••••••••••••••••••••••••••"
    : "No API Key generated yet.";

  const joinedFormatted = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-[100dvh] bg-[#FCFBF8] text-neutral-900 font-sans selection:bg-[#E05A38]/15 selection:text-neutral-900 flex">
      {/* ── Left Sidebar ── */}
      <DashboardSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* ── Main Content Area ── */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          userName={user.name}
          userImage={user.image}
          onOpenMobile={() => setMobileOpen(true)}
        />

        <main className="flex-1 max-w-[1240px] w-full mx-auto px-6 sm:px-10 lg:px-14 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-[34px] font-bold text-neutral-900 tracking-[-0.03em] leading-tight">
              Settings & Integrations
            </h1>
            <p className="text-base text-neutral-500 font-normal mt-1 leading-relaxed">
              Manage your workspace credentials, personal API keys, and custom AI model failovers.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mb-8 border-b border-neutral-200/60 pb-3">
            <button
              onClick={() => setActiveSection("keys")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeSection === "keys"
                  ? "bg-[#FAF3F0] text-[#E05A38] font-semibold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70"
              }`}
            >
              <Key size={16} />
              <span>Workspace API Key</span>
            </button>

            <button
              onClick={() => setActiveSection("byok")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeSection === "byok"
                  ? "bg-[#FAF3F0] text-[#E05A38] font-semibold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70"
              }`}
            >
              <Sparkles size={16} />
              <span>Custom AI Keys</span>
            </button>

            <button
              onClick={() => setActiveSection("account")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeSection === "account"
                  ? "bg-[#FAF3F0] text-[#E05A38] font-semibold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70"
              }`}
            >
              <User size={16} />
              <span>Account & Plan</span>
            </button>
          </div>

          {/* ════════ SECTION 1: WORKSPACE API KEY ════════ */}
          {activeSection === "keys" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="text-[11px] font-bold tracking-[0.14em] text-neutral-400 uppercase block mb-1">
                      MORYN API CREDENTIALS
                    </span>
                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                      Workspace API Key
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1 max-w-xl leading-relaxed">
                      Use this API key to authenticate the Moryn NPX CLI tool, connect IDE MCP servers (Cursor, Antigravity, Windsurf), or integrate Moryn programmatically.
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-[#FAF3F0] text-[#E05A38] flex items-center justify-center shrink-0">
                    <ShieldCheck size={22} strokeWidth={2} />
                  </div>
                </div>

                {/* API Key Box */}
                <div className="mt-6 p-4 rounded-xl bg-[#FAF9F6] border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="font-mono text-sm text-neutral-800 tracking-wider truncate select-all">
                    {isKeyLoading ? "Loading API key..." : showKey && apiKey ? apiKey : maskedKey}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {apiKey && (
                      <button
                        onClick={() => setShowKey(!showKey)}
                        className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-white transition-colors"
                        title={showKey ? "Hide key" : "Reveal key"}
                      >
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}

                    {apiKey && (
                      <button
                        onClick={() => handleCopyKey(apiKey)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-800 text-xs font-medium hover:bg-neutral-50 active:bg-neutral-100 transition shadow-2xs"
                      >
                        {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        <span>{isCopied ? "Copied" : "Copy Key"}</span>
                      </button>
                    )}

                    <button
                      onClick={handleRegenerateApiKey}
                      disabled={isRegenerating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-800 text-xs font-medium hover:bg-neutral-50 active:bg-neutral-100 transition shadow-2xs"
                    >
                      <RefreshCw size={14} className={isRegenerating ? "animate-spin" : ""} />
                      <span>{hasApiKey ? "Regenerate" : "Create Key"}</span>
                    </button>
                  </div>
                </div>

                {/* CLI & MCP Quick Guide */}
                <div className="mt-8 pt-6 border-t border-neutral-100">
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 mb-2">
                    <Terminal size={16} className="text-neutral-600" />
                    Connect via CLI & Agentic MCP
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed mb-3">
                    Run Moryn directly in your terminal or provide your key to the Antigravity IDE MCP server config:
                  </p>
                  <div className="bg-[#18181B] text-neutral-100 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-sm">
                    <code>npx @iqbaltech/moryn sync --key {apiKey || "YOUR_MORYN_API_KEY"}</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════ SECTION 2: CUSTOM AI KEYS (BYOK) ════════ */}
          {activeSection === "byok" && (
            <div className="space-y-6">
              <section className={`${settingsStyles.byokSection} bg-white rounded-[24px] border border-neutral-200/80 p-5 sm:p-8 shadow-[0_14px_40px_rgba(20,24,23,0.04)]`}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="max-w-2xl">
                    <span className="text-[11px] font-bold tracking-[0.14em] text-neutral-400 uppercase block mb-1">
                      Custom AI Keys
                    </span>
                    <h2 className="mt-2 text-2xl sm:text-[30px] font-semibold text-neutral-950 tracking-[-0.04em] leading-tight text-balance">
                      Your AI keys, in the order you choose.
                    </h2>
                    <p className="text-sm sm:text-[15px] text-neutral-500 mt-3 max-w-xl leading-7">
                      Add a Gemini or OpenRouter key and Moryn will try your preferred provider first, then move down the route when a limit is reached.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E05A38] hover:bg-[#CF4D2C] active:bg-[#B83E1F] text-white text-sm font-semibold tracking-tight shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#E05A38]/40 shrink-0"
                  >
                    <Plus size={16} strokeWidth={2.4} />
                    <span>Add a key</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-7 pt-5 border-t border-neutral-100">
                  <div className="rounded-xl bg-[#FAF9F6] px-3.5 py-3">
                    <span className="block text-[11px] text-neutral-400">Configured</span>
                    <span className="block mt-1 text-sm font-semibold text-neutral-900 tabular-nums">{customKeys.length} {customKeys.length === 1 ? "key" : "keys"}</span>
                  </div>
                  <div className="rounded-xl bg-[#FAF9F6] px-3.5 py-3">
                    <span className="block text-[11px] text-neutral-400">Ready to use</span>
                    <span className="block mt-1 text-sm font-semibold text-neutral-900 tabular-nums">{customKeys.filter((keyItem) => keyItem.isActive).length} active</span>
                  </div>
                  <div className="rounded-xl bg-[#FAF9F6] px-3.5 py-3">
                    <span className="block text-[11px] text-neutral-400">Routing</span>
                    <span className="block mt-1 text-sm font-semibold text-neutral-900">Automatic fallback</span>
                  </div>
                </div>

                {/* Keys List */}
                {isByokLoading ? (
                  <div className="mt-7 space-y-3" aria-label="Loading custom keys" role="status">
                    {[0, 1].map((item) => (
                      <div key={item} className="rounded-2xl border border-neutral-200/70 p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl skeleton-shimmer" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3.5 w-40 skeleton-shimmer" />
                            <div className="h-3 w-64 max-w-full skeleton-shimmer" />
                          </div>
                          <div className="hidden sm:block h-8 w-20 skeleton-shimmer" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : customKeys.length === 0 ? (
                  <div className="mt-7 rounded-2xl border border-dashed border-neutral-300 p-8 sm:p-10 text-center bg-[#FAF9F6]">
                    <div className="mx-auto w-11 h-11 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-[#B45138] shadow-[0_4px_12px_rgba(20,24,23,0.04)]">
                      <Key size={20} />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-neutral-900">No custom keys yet</h3>
                    <p className="text-sm text-neutral-500 max-w-md mx-auto mt-1.5 leading-6">
                      Moryn is using the shared provider pool. Add your first key when you want a dedicated route and model choice.
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 active:translate-y-px transition focus-visible:ring-2 focus-visible:ring-neutral-900/30"
                    >
                      <Plus size={15} />
                      Add your first key
                    </button>
                  </div>
                ) : (
                  <div className="mt-7">
                    {/* Failover Cascade Explainer */}
                    <div className="rounded-2xl border border-[#E7DED7] bg-[#FBF8F4] p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white border border-[#E7DED7] flex items-center justify-center text-[#B45138] shrink-0">
                            <Zap size={16} />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-neutral-950">Fallback route</h3>
                            <p className="mt-0.5 text-xs leading-5 text-neutral-500">Moryn switches to the next active key after a 429 rate-limit response.</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-neutral-400 sm:pt-1">Move keys with the arrows</span>
                      </div>

                      <div className="flex items-center gap-2 overflow-x-auto mt-4 pb-1" aria-label="Current key priority route">
                        {customKeys.map((keyItem, index) => (
                          <div key={keyItem.id} className="flex items-center gap-2 shrink-0">
                            <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${index === 0 ? "border-[#E8B6A7] bg-white" : "border-neutral-200 bg-white/60"}`}>
                              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${index === 0 ? "bg-[#E05A38] text-white" : "bg-neutral-200 text-neutral-600"}`}>
                                {index + 1}
                              </span>
                              <span className="max-w-[150px] truncate text-xs font-medium text-neutral-800">{keyItem.label}</span>
                            </div>
                            {index < customKeys.length - 1 && <ChevronRight size={14} className="text-neutral-300" aria-hidden="true" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 space-y-3">
                      {customKeys.map((keyItem, index) => (
                        <article
                          key={keyItem.id}
                          className={`${settingsStyles.keyRow} rounded-2xl border p-4 sm:p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(20,24,23,0.06)] ${
                            keyItem.inCooldown
                              ? "border-[#E8C99F] bg-[#FFFBF4]"
                              : "border-neutral-200/80 bg-white hover:border-neutral-300"
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                            <div className="flex items-start gap-3.5 min-w-0 flex-1">
                              <div className="w-11 h-11 rounded-2xl bg-[#F5F2EA] border border-neutral-200 flex items-center justify-center font-bold text-[11px] tracking-[-0.02em] text-neutral-700 shrink-0">
                                {keyItem.provider === "gemini" ? "G" : "OR"}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                                  <h4 className="text-sm font-semibold text-neutral-950 truncate max-w-[240px]">{keyItem.label}</h4>
                                  <span className="text-[11px] font-medium text-[#B45138]">
                                    {index === 0 ? "Primary" : `Fallback ${index}`}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500">
                                    <span className={`w-1.5 h-1.5 rounded-full ${keyItem.isActive ? "bg-[#3F8A67]" : "bg-neutral-300"}`} aria-hidden="true" />
                                    {keyItem.isActive ? "Active" : "Disabled"}
                                  </span>
                                  {keyItem.inCooldown && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#A36B19]">
                                      <Timer size={12} /> Rate limited for now
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 mt-3">
                                  <span className="inline-flex w-fit max-w-full font-mono text-[11px] text-neutral-600 bg-[#FAF9F6] px-2.5 py-1 rounded-lg border border-neutral-200/80 truncate">
                                    {keyItem.maskedKey}
                                  </span>
                                  <div className="hidden sm:block text-neutral-300" aria-hidden="true">/</div>
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-[11px] text-neutral-400 font-medium shrink-0">Model</span>
                                    <div className="relative inline-flex items-center min-w-0 max-w-full">
                                      <select
                                        value={
                                          keyItem.preferredModel ||
                                          (keyItem.provider === "gemini"
                                            ? "gemini-2.5-flash"
                                            : "meta-llama/llama-3.3-70b-instruct:free")
                                        }
                                        onChange={(e) => handleUpdateKeyModel(keyItem.id, e.target.value)}
                                        disabled={updatingModelId === keyItem.id}
                                        className="min-w-0 max-w-full appearance-none cursor-pointer rounded-lg border border-neutral-200 bg-white py-1.5 pl-2.5 pr-7 text-xs font-medium text-neutral-800 transition hover:border-neutral-300 focus:border-[#E05A38] focus:outline-none focus:ring-2 focus:ring-[#E05A38]/15 disabled:cursor-wait disabled:opacity-60"
                                        title="Change preferred AI model"
                                        aria-label={`Preferred model for ${keyItem.label}`}
                                      >
                                        {keyItem.provider === "gemini" ? (
                                          (geminiModels.length > 0 ? geminiModels : GEMINI_MODELS).map((m) => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                          ))
                                        ) : (
                                          <>
                                            {openRouterFreeModels.length > 0 && (
                                              <optgroup label={`Free Models (${openRouterFreeModels.length})`}>
                                                {openRouterFreeModels.map((m) => <option key={m.id} value={m.id}>{m.name} (Free)</option>)}
                                              </optgroup>
                                            )}
                                            {openRouterRankedModels.length > 0 ? (
                                              <optgroup label={`Top 20 Ranked Models (${openRouterRankedModels.length})`}>
                                                {openRouterRankedModels.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                                              </optgroup>
                                            ) : (
                                              OPENROUTER_MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)
                                            )}
                                          </>
                                        )}
                                      </select>
                                      <span className="absolute right-2 pointer-events-none text-neutral-400" aria-hidden="true">
                                        {updatingModelId === keyItem.id ? <RefreshCw size={11} className="animate-spin text-[#E05A38]" /> : <ChevronDown size={12} />}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between lg:justify-end gap-1.5 pt-3 lg:pt-0 border-t border-neutral-100 lg:border-t-0 lg:border-l lg:pl-5 shrink-0">
                              <div className="flex items-center gap-1 rounded-xl bg-[#FAF9F6] border border-neutral-200/70 p-1">
                                <button
                                  type="button"
                                  onClick={() => handleMovePriority(keyItem.id, "up")}
                                  disabled={index === 0}
                                  className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent transition focus-visible:ring-2 focus-visible:ring-[#E05A38]/30"
                                  title="Move toward primary"
                                  aria-label={`Move ${keyItem.label} up in priority`}
                                >
                                  <ArrowUp size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMovePriority(keyItem.id, "down")}
                                  disabled={index === customKeys.length - 1}
                                  className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent transition focus-visible:ring-2 focus-visible:ring-[#E05A38]/30"
                                  title="Move toward fallback"
                                  aria-label={`Move ${keyItem.label} down in priority`}
                                >
                                  <ArrowDown size={14} />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleTestCustomKey(keyItem.id)}
                                disabled={testingId === keyItem.id}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 active:translate-y-px text-neutral-700 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-[#E05A38]/30 disabled:opacity-60"
                                title="Verify key connection"
                              >
                                <Activity size={13} className={testingId === keyItem.id ? "animate-spin text-[#E05A38]" : ""} />
                                <span>{testingId === keyItem.id ? "Testing" : "Test"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleCustomKey(keyItem.id, keyItem.isActive)}
                                className={`p-2 rounded-xl border transition focus-visible:ring-2 focus-visible:ring-[#E05A38]/30 ${
                                  keyItem.isActive
                                    ? "text-[#2F7D5C] bg-[#F0F7F3] border-[#C9E4D4] hover:bg-[#E5F3EA]"
                                    : "text-neutral-500 bg-white border-neutral-200 hover:bg-neutral-50"
                                }`}
                                title={keyItem.isActive ? "Disable key" : "Enable key"}
                                aria-label={keyItem.isActive ? `Disable ${keyItem.label}` : `Enable ${keyItem.label}`}
                              >
                                <Power size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteCustomKey(keyItem.id, keyItem.label)}
                                className="p-2 rounded-xl text-neutral-400 hover:text-[#B33F32] hover:bg-[#FFF3F0] transition focus-visible:ring-2 focus-visible:ring-[#E05A38]/30"
                                title="Delete custom key"
                                aria-label={`Delete ${keyItem.label}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ════════ SECTION 3: ACCOUNT & PLAN ════════ */}
          {activeSection === "account" && (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
                  <div className="flex items-center gap-4">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User Avatar"}
                        width={64}
                        height={64}
                        unoptimized
                        className="w-16 h-16 rounded-2xl border border-neutral-200 object-cover shadow-2xs"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-[#FAF3F0] border border-[#E05A38]/20 flex items-center justify-center text-xl font-black text-[#E05A38] shadow-2xs">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                          {user.name || "Moryn Builder"}
                        </h2>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border ${
                            user.tier === "PRO"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-neutral-100 text-neutral-600 border-neutral-200"
                          }`}
                        >
                          {user.tier} PLAN
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 font-mono mt-1">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-1.5">
                        <Calendar size={12} />
                        <span>Joined {joinedFormatted}</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Rank Badge / Pill */}
                  <div className="p-4 rounded-xl bg-[#FAF9F6] border border-neutral-200/80 flex items-center gap-3.5 min-w-[220px]">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-2xs shrink-0"
                      style={{ background: rank.color }}
                    >
                      <CurrentRankIcon size={22} strokeWidth={2.2} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-[0.14em] text-neutral-400 uppercase block">
                        CURRENT RANK
                      </span>
                      <h4 className="text-sm font-bold text-neutral-900">
                        {rank.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        {user.exp.toLocaleString()} EXP
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rank Progress Bar */}
                <div className="pt-6">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                      <Trophy size={14} className="text-[#E05A38]" />
                      Rank Progression
                    </span>
                    <span className="text-neutral-500 font-mono text-[11px]">
                      {nextRank ? (
                        <>
                          <span className="font-bold text-neutral-900">{expToNext.toLocaleString()} EXP</span> to reach {nextRank.name}
                        </>
                      ) : (
                        <span className="text-emerald-600 font-bold">Highest Rank Achieved! 🏆</span>
                      )}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${rankProgress}%`,
                        background: rank.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 mt-1.5">
                    <span>{rank.minExp} EXP</span>
                    <span>{nextRank ? `${nextRank.minExp} EXP` : "MAX"}</span>
                  </div>
                </div>
              </div>

              {/* Workspace Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <Folder size={18} />
                  </div>
                  <p className="text-xs text-neutral-500 font-medium">Total Projects</p>
                  <p className="text-2xl font-black text-neutral-900 mt-0.5">
                    {user.totalProjects ?? user.prdCount ?? 0}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <CheckCircle2 size={18} />
                  </div>
                  <p className="text-xs text-neutral-500 font-medium">Completed PRDs</p>
                  <p className="text-2xl font-black text-neutral-900 mt-0.5">
                    {user.completedProjects ?? 0}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                    <Award size={18} />
                  </div>
                  <p className="text-xs text-neutral-500 font-medium">Total Points</p>
                  <p className="text-2xl font-black text-neutral-900 mt-0.5">
                    {user.exp.toLocaleString()}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                    <Zap size={18} />
                  </div>
                  <p className="text-xs text-neutral-500 font-medium">Monthly Quota</p>
                  <p className="text-2xl font-black text-neutral-900 mt-0.5">
                    {user.monthlyUsage || "1 / 1"}
                  </p>
                </div>
              </div>

              {/* Rank Journey Roadmap Card */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-[11px] font-bold tracking-[0.14em] text-neutral-400 uppercase block">
                      BUILDER ROADMAP
                    </span>
                    <h3 className="text-lg font-bold text-neutral-900 tracking-tight mt-0.5">
                      Rank Journey
                    </h3>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">
                    {RANKS.filter((r) => user.exp >= r.minExp).length} of {RANKS.length} Unlocked
                  </span>
                </div>

                {/* Horizontal Fluid Roadmap */}
                <div className="overflow-x-auto pb-4 pt-2 -mx-2 px-2">
                  <div className="min-w-[700px] relative">
                    {/* Connecting line */}
                    <div className="absolute top-[34px] left-[5%] right-[5%] h-0.5 bg-neutral-100 z-0" />
                    <div
                      className="absolute top-[34px] left-[5%] h-0.5 bg-[#E05A38] z-0 transition-all duration-500"
                      style={{
                        width: `${Math.max(0, Math.min(90, (RANKS.filter(r => user.exp >= r.minExp).length - 1) / (RANKS.length - 1) * 90))}%`,
                      }}
                    />

                    <div className="grid grid-cols-10 gap-2 relative z-10">
                      {RANKS.map((r) => {
                        const isUnlocked = user.exp >= r.minExp;
                        const isCurrent = r.id === rank.id;
                        const RIcon = RANK_ICON_MAP[r.icon] ?? Star;

                        return (
                          <div key={r.id} className="flex flex-col items-center text-center group">
                            {/* "YOU" badge */}
                            <div className="h-5 flex items-center justify-center mb-1">
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-[#E05A38] text-white shadow-2xs animate-pulse">
                                  YOU
                                </span>
                              )}
                            </div>

                            {/* Circle Icon */}
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                isCurrent
                                  ? "ring-2 ring-[#E05A38] ring-offset-2 scale-110 shadow-xs text-white"
                                  : isUnlocked
                                  ? "text-white shadow-2xs"
                                  : "bg-neutral-100 text-neutral-400 border border-neutral-200"
                              }`}
                              style={isUnlocked ? { background: r.color } : {}}
                              title={`${r.name} - ${r.description}`}
                            >
                              {isUnlocked ? (
                                <RIcon size={16} strokeWidth={2.2} />
                              ) : (
                                <Lock size={13} className="text-neutral-400" />
                              )}
                            </div>

                            {/* Rank title */}
                            <p
                              className={`text-[10px] font-bold mt-2 leading-tight max-w-[70px] truncate ${
                                isCurrent
                                  ? "text-[#E05A38]"
                                  : isUnlocked
                                  ? "text-neutral-800"
                                  : "text-neutral-400"
                              }`}
                              title={r.name}
                            >
                              {r.name}
                            </p>

                            {/* Threshold */}
                            <span className="text-[9px] font-mono text-neutral-400 mt-0.5">
                              {r.minExp === 0 ? "0 EXP" : `${r.minExp >= 1000 ? `${r.minExp / 1000}k` : r.minExp}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Navigation / Shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setActiveSection("byok")}
                  className="p-5 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-300 transition-all cursor-pointer group shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF3F0] text-[#E05A38] flex items-center justify-center">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 group-hover:text-[#E05A38] transition-colors">
                          Configure Custom AI Keys
                        </h4>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Connect Google Gemini or OpenRouter keys for dedicated throughput
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-neutral-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div
                  onClick={() => setActiveSection("keys")}
                  className="p-5 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-300 transition-all cursor-pointer group shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Key size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                          Workspace API Key
                        </h4>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Connect your CLI or Antigravity MCP server to Moryn
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-neutral-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════ ADD KEY MODAL ════════ */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.1)] relative">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-neutral-900">Add Custom AI Key</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddCustomKey} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                      AI Provider
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNewProvider("gemini");
                          setNewModel(geminiModels[0]?.id || "gemini-2.5-flash");
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium transition ${
                          newProvider === "gemini"
                            ? "bg-[#FAF3F0] text-[#E05A38] border-[#E05A38] font-semibold"
                            : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        Google Gemini
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewProvider("openrouter");
                          const defaultModel =
                            openRouterFreeModels[0]?.id ||
                            openRouterRankedModels[0]?.id ||
                            "meta-llama/llama-3.3-70b-instruct:free";
                          setNewModel(defaultModel);
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium transition ${
                          newProvider === "openrouter"
                            ? "bg-[#FAF3F0] text-[#E05A38] border-[#E05A38] font-semibold"
                            : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        OpenRouter
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                      Key Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder={newProvider === "gemini" ? "e.g. My Personal Gemini Key" : "e.g. OpenRouter Primary"}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                      API Secret Key <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      placeholder={newProvider === "gemini" ? "AIzaSy..." : "sk-or-v1-..."}
                      required
                      className="w-full h-10 px-3 rounded-xl bg-white border border-neutral-200 text-sm font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-neutral-700 block">
                        Preferred Model
                      </label>
                      {newProvider === "gemini" && (
                        <span className="text-[11px] text-neutral-400 font-medium">
                          {isGeminiLoading ? "Loading models..." : `${geminiModels.length} Text Models`}
                        </span>
                      )}
                      {newProvider === "openrouter" && (
                        <span className="text-[11px] text-neutral-400 font-medium">
                          {isOpenRouterLoading
                            ? "Loading models..."
                            : `${openRouterFreeModels.length} Free + ${openRouterRankedModels.length} Ranked`}
                        </span>
                      )}
                    </div>
                    <select
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition"
                    >
                      {newProvider === "gemini" ? (
                        (geminiModels.length > 0 ? geminiModels : GEMINI_MODELS).map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))
                      ) : (
                        <>
                          {openRouterFreeModels.length > 0 && (
                            <optgroup label={`Free Models (${openRouterFreeModels.length})`}>
                              {openRouterFreeModels.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} (Free)
                                </option>
                              ))}
                            </optgroup>
                          )}

                          {openRouterRankedModels.length > 0 ? (
                            <optgroup label={`Top 20 Ranked Models (${openRouterRankedModels.length})`}>
                              {openRouterRankedModels.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                </option>
                              ))}
                            </optgroup>
                          ) : (
                            OPENROUTER_MODELS.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))
                          )}
                        </>
                      )}
                    </select>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingKey}
                      className="px-5 py-2 rounded-xl bg-[#E05A38] hover:bg-[#CF4D2C] text-white text-sm font-medium transition shadow-xs disabled:opacity-50"
                    >
                      {isSavingKey ? "Saving..." : "Save Key"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
