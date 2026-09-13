export class ApiError extends Error {
  statusCode: number;
  data?: unknown;

  constructor(message: string, statusCode: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options?.headers as Record<string, string>),
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMessage =
        (data && typeof data === "object" && ("message" in data || "error" in data)
          ? data.message || data.error
          : null) || `Request failed with status ${res.status}`;
      throw new ApiError(errorMessage, res.status, data);
    }

    return data as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      err instanceof Error ? err.message : "Network error or server unreachable",
      500
    );
  }
}

export const apiClient = {
  projects: {
    list: () =>
      request<Array<{ id: string; appName: string; createdAt: string; status: string; finishedAt: string | null }>>(
        "/api/projects/list"
      ),

    get: (id: string) =>
      request<{ id: string; appName: string; appIdea: string; title: string; status: string; createdAt: string }>(
        `/api/projects/${id}`
      ),

    getDetail: (projectId: string) =>
      request<{ project: any }>(`/api/projects/detail?projectId=${encodeURIComponent(projectId)}`),

    create: (payload: {
      appName: string;
      appIdea: string;
      stacks?: Record<string, string>;
      dynamicQuestions?: any[];
      dynamicAnswers?: Record<string, any>;
      designPreference?: string;
      designData?: string;
    }) =>
      request<{ projectId: string }>("/api/projects/create", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    update: (payload: {
      projectId: string;
      appName?: string;
      appIdea?: string;
      formInputs?: string;
      prdData?: string;
      strukturData?: any;
      taskData?: any;
      designData?: string;
      status?: string;
      checkedTasks?: string | Record<string, boolean | string>;
      tasksOutdated?: boolean;
    }) =>
      request<{ success: boolean; project?: any }>("/api/projects/update", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    delete: (id: string) =>
      request<{ success: boolean }>(`/api/projects/${id}`, {
        method: "DELETE",
      }),

    getStatus: (projectId: string) =>
      request<{ taskStatus: Record<string, string | boolean> }>(
        `/api/projects/status?projectId=${encodeURIComponent(projectId)}`,
        { cache: "no-store" }
      ),

    finish: (payload: { projectId: string; checkedTasks: Record<string, boolean> }) =>
      request<{
        success: boolean;
        message: string;
        expGained: number;
        newExp: number;
        rank: { id: number; name: string; icon: string; color: string };
      }>("/api/projects/finish", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    uploadDesign: (payload: { projectId: string; designData: string }) =>
      request<{ success: boolean; designData: string }>("/api/projects/upload-design", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    uploadDesignFile: (projectId: string, file: File) => {
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("file", file);
      return request<{ success: boolean; designData: string }>("/api/projects/upload-design", {
        method: "POST",
        body: formData,
      });
    },

    getDesignTemplates: (id?: string) =>
      request<{ template?: any; templates?: any[] }>(
        id ? `/api/projects/templates/design?id=${encodeURIComponent(id)}` : "/api/projects/templates/design"
      ),
  },

  generate: {
    questions: (payload: { appName?: string; appIdea: string; stacks?: Record<string, string> }) =>
      request<any[]>("/api/generate/questions", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    recommendStack: (payload: { appName: string; appIdea: string }) =>
      request<{
        success: boolean;
        recommendation: {
          stacks: Record<string, string>;
          paletteId: string;
          paletteName?: string;
          designStyle?: string;
          badge: string;
          reasoning: string;
          designReasoning?: string;
          modelUsed?: string;
        };
      }>("/api/generate/recommend-stack", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    prd: (projectId: string) =>
      request<{ markdown: string }>("/api/generate/prd", {
        method: "POST",
        body: JSON.stringify({ projectId }),
      }),

    editPrd: (payload: {
      projectId: string;
      currentPrd: string;
      prompt: string;
      selectedModel?: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    }) =>
      request<{
        reply?: string;
        isPrdUpdated?: boolean;
        updatedMarkdown: string;
        markdown?: string;
        diffSummary?: string;
        modelUsed?: string;
        provider?: string;
        actions?: Array<{
          id: string;
          label: string;
          prompt?: string;
          variant?: "primary" | "secondary" | "outline";
          icon?: "edit" | "brainstorm" | "database" | "diagram" | "sync" | "sparkles";
          actionType?: "send_prompt" | "copy_text";
          payload?: string;
        }>;
      }>("/api/generate/edit-prd", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    struktur: (projectId: string) =>
      request<any>("/api/generate/struktur", {
        method: "POST",
        body: JSON.stringify({ projectId }),
      }),

    tasks: (payload: { projectId: string; forceSync?: boolean }) =>
      request<any>("/api/generate/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  user: {
    me: () =>
      request<{
        user: {
          id: string;
          email: string;
          name: string;
          image?: string;
          tier: "FREE" | "PRO";
          exp: number;
          isPro: boolean;
        };
      }>("/api/user/me"),
    getApiKey: () => request<{ hasApiKey: boolean; apiKey: string | null }>("/api/user/api-key"),
    generateApiKey: () => request<{ apiKey: string }>("/api/user/api-key", { method: "POST" }),
    getCustomAiKeys: () =>
      request<{
        keys: Array<{
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
        }>;
      }>("/api/user/custom-keys"),
    addCustomAiKey: (payload: {
      provider: "gemini" | "openrouter";
      apiKey: string;
      label?: string;
      preferredModel?: string;
      skipValidation?: boolean;
    }) =>
      request<{
        success: boolean;
        keys: Array<any>;
        addedId: string;
      }>("/api/user/custom-keys", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateCustomAiKeys: (payload: {
      updates?: Array<{ id: string; label?: string; isActive?: boolean; priority?: number; preferredModel?: string }>;
      toggleId?: string;
      reorder?: Array<{ id: string; priority: number }>;
      updateModel?: { id: string; preferredModel: string };
    }) =>
      request<{
        success: boolean;
        keys: Array<any>;
      }>("/api/user/custom-keys", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    deleteCustomAiKey: (id: string) =>
      request<{
        success: boolean;
        keys: Array<any>;
      }>(`/api/user/custom-keys?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    testCustomAiKey: (payload: {
      provider?: "gemini" | "openrouter";
      apiKey?: string;
      keyId?: string;
    }) =>
      request<{
        success: boolean;
        message?: string;
        error?: string;
      }>("/api/user/custom-keys/test", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  leaderboard: {
    get: () =>
      request<{
        success: boolean;
        data: Array<{
          id: string;
          name: string;
          points: number;
          prds: number;
          avatar: string;
          rankName: string;
        }>;
      }>("/api/leaderboard"),
  },

  gemini: {
    getModels: (apiKey?: string) =>
      request<{
        models: Array<{ id: string; name: string; description?: string; inputTokenLimit?: number }>;
        count: number;
        isFallback?: boolean;
      }>(`/api/gemini/models${apiKey ? `?key=${encodeURIComponent(apiKey)}` : ""}`),
  },

  openrouter: {
    getModels: () =>
      request<{
        models: Array<{ id: string; name: string; contextLength?: number; isFree?: boolean }>;
        freeModels?: Array<{ id: string; name: string; contextLength?: number; isFree?: boolean }>;
        popularModels?: Array<{ id: string; name: string; isFree?: boolean }>;
      }>("/api/openrouter/models"),
  },

  admin: {
    getSettings: () => request<{ geminiModel?: string; openRouterModel?: string }>("/api/admin/settings"),

    updateSettings: (payload: { geminiModel: string; openRouterModel: string }) =>
      request<{ success: boolean; settings: any }>("/api/admin/settings", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    getUsage: () =>
      request<{
        geminiKey1Count: number;
        geminiKey2Count: number;
        openRouterCount: number;
        totalRequestsToday: number;
        date: string;
      }>("/api/admin/usage"),
  },
};
