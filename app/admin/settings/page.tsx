"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/app/components/layout";
import { Settings, Save, Server, Cpu, Loader2, AlertCircle, Activity } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiClient, ApiError } from "@/lib/utils/apiClient";
import { isTextGenerationModel } from "@/lib/ai/models";

export default function AdminSettingsPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [geminiModel, setGeminiModel] = useState("gemini-3.7-flash");
  const [openRouterModel, setOpenRouterModel] = useState("nvidia/nemotron-3-ultra-550b-a55b:free");
  
  const [freeModels, setFreeModels] = useState<any[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  
  const [usages, setUsages] = useState({ gemini_key_1: 0, gemini_key_2: 0, openrouter: 0 });
  const [usagesLoading, setUsagesLoading] = useState(true);

  const [geminiModels, setGeminiModels] = useState<Array<{ id: string; name: string }>>([]);
  const [geminiModelsLoading, setGeminiModelsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    fetchGeminiModels();
    fetchOpenRouterModels();
    fetchUsages();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await apiClient.admin.getSettings();
      if (data.geminiModel) setGeminiModel(data.geminiModel);
      if (data.openRouterModel) setOpenRouterModel(data.openRouterModel);
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 403) {
        router.push("/");
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGeminiModels = async () => {
    try {
      setGeminiModelsLoading(true);
      const res = await apiClient.gemini.getModels();
      if (res.models && res.models.length > 0) {
        setGeminiModels(res.models.filter(isTextGenerationModel));
      }
    } catch (err: unknown) {
      console.warn("Failed to fetch Gemini models:", err);
    } finally {
      setGeminiModelsLoading(false);
    }
  };

  const fetchOpenRouterModels = async () => {
    try {
      const data = await apiClient.openrouter.getModels();
      const raw = data.models || [];
      setFreeModels(raw.filter(isTextGenerationModel));
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 403) return;
      console.error(err);
      toast.error("Failed to load OpenRouter models");
    } finally {
      setModelsLoading(false);
    }
  };

  const fetchUsages = async () => {
    try {
      const data: any = await apiClient.admin.getUsage();
      if (data.success && data.data) {
        setUsages(data.data);
      } else if (data.gemini_key_1 !== undefined) {
        setUsages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUsagesLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.admin.updateSettings({ geminiModel, openRouterModel });
      toast.success("Settings saved successfully!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" size={32} color="var(--fg-muted)" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--fg-primary)" }}>
      <Navbar />

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "160px 24px 80px" }}>
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "12px" }}>
            <Settings color="var(--indigo-400)" />
            System Configuration
          </h1>
          <p style={{ color: "var(--fg-muted)", fontSize: "16px", margin: 0 }}>
            Manage core API behaviors and AI model selections.
          </p>
        </div>

        {error && (
          <div style={{ 
            background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", 
            padding: "16px", borderRadius: "12px", marginBottom: "32px", display: "flex", gap: "12px", alignItems: "flex-start" 
          }}>
            <AlertCircle color="#ef4444" size={20} />
            <span style={{ color: "#fca5a5", fontSize: "14px" }}>{error}</span>
          </div>
        )}

        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
          borderRadius: "24px", padding: "40px", marginBottom: "24px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <Activity size={20} color="var(--pink-400)" />
              Daily API Usage Monitor
            </h2>
            {usagesLoading && <Loader2 size={16} className="animate-spin" color="var(--fg-muted)" />}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {[
              { label: "Gemini (Primary Key)", count: usages.gemini_key_1, max: 20, color: "var(--indigo-500)" },
              { label: "Gemini (Secondary Key)", count: usages.gemini_key_2, max: 20, color: "var(--blue-500)" },
              { label: "OpenRouter (Fallback)", count: usages.openrouter, max: 20, color: "var(--emerald-500)" },
            ].map((stat, i) => {
              const percentage = Math.min((stat.count / stat.max) * 100, 100);
              const isLimit = stat.count >= stat.max;
              
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
                    <span style={{ color: "var(--fg-secondary)" }}>{stat.label}</span>
                    <span style={{ color: isLimit ? "#ef4444" : "var(--fg-primary)" }}>
                      {stat.count} / {stat.max} req
                    </span>
                  </div>
                  <div style={{ height: "8px", borderRadius: "999px", background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: "999px",
                      background: isLimit ? "#ef4444" : stat.color,
                      width: `${percentage}%`,
                      transition: "width 0.6s ease, background 0.3s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
          borderRadius: "24px", padding: "40px",
        }}>
          
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Server size={20} color="var(--blue-400)" />
            AI Model Priorities
          </h2>

          {/* Gemini Settings */}
          <div style={{ marginBottom: "32px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--fg-secondary)", marginBottom: "12px" }}>
              Primary & Secondary Provider (Google Gemini)
            </label>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                disabled={geminiModelsLoading}
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--border-subtle)",
                  background: "var(--bg-elevated)", color: "var(--fg-primary)", fontSize: "15px",
                  appearance: "none", cursor: "pointer", outline: "none"
                }}
              >
                {geminiModels.length > 0 ? (
                  geminiModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                  ))
                ) : geminiModelsLoading ? (
                  <option value={geminiModel} disabled>Memuat model Gemini…</option>
                ) : (
                  <option value={geminiModel}>{geminiModel}</option>
                )}
              </select>
            </div>
            <p style={{ fontSize: "13px", color: "var(--fg-muted)", marginTop: "8px" }}>
              Used by default for all generations. If rate-limited, the system falls back to secondary API keys automatically.
            </p>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--border-subtle)", margin: "32px 0" }} />

          {/* OpenRouter Settings */}
          <div style={{ marginBottom: "40px" }}>
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", fontWeight: 600, color: "var(--fg-secondary)", marginBottom: "12px" }}>
              <span>Fallback Provider (OpenRouter - Free Tier)</span>
              {modelsLoading && <Loader2 size={14} className="animate-spin" />}
            </label>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <select
                value={openRouterModel}
                onChange={(e) => setOpenRouterModel(e.target.value)}
                disabled={modelsLoading}
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--border-subtle)",
                  background: "var(--bg-elevated)", color: "var(--fg-primary)", fontSize: "15px",
                  appearance: "none", cursor: modelsLoading ? "not-allowed" : "pointer", outline: "none",
                  opacity: modelsLoading ? 0.7 : 1
                }}
              >
                {freeModels.length > 0 ? (
                  freeModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                  ))
                ) : (
                  <option value={openRouterModel}>{openRouterModel}</option>
                )}
              </select>
            </div>
            <p style={{ fontSize: "13px", color: "var(--fg-muted)", marginTop: "8px" }}>
              Used strictly when ALL Gemini keys fail. Only $0 (free) models are available for selection.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: "var(--indigo-500)", color: "white",
                padding: "12px 24px", borderRadius: "12px", border: "none",
                fontWeight: 600, fontSize: "15px", cursor: saving ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: "8px",
                opacity: saving ? 0.8 : 1, transition: "background 0.2s"
              }}
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Configuration
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
