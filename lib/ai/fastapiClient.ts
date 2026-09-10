/**
 * Type-safe HTTP client to communicate between Next.js BFF and FastAPI AI Engine.
 */

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET || "moryn_internal_ai_secret_dev";

export class FastApiClient {
  private static async request<T>(endpoint: string, body: unknown): Promise<T> {
    const url = `${FASTAPI_URL}${endpoint}`;
    
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": INTERNAL_SECRET,
        },
        body: JSON.stringify(body),
        // AI generation can take some time
        signal: AbortSignal.timeout(90_000),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.detail || `FastAPI error: ${res.statusText} (${res.status})`);
      }

      return (await res.json()) as T;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "TimeoutError") {
        throw new Error("FastAPI generation request timed out after 90 seconds.");
      }
      throw err;
    }
  }

  /** Checks if the FastAPI AI Engine is running and healthy. */
  static async isHealthy(): Promise<boolean> {
    try {
      const res = await fetch(`${FASTAPI_URL}/api/v1/health`, {
        method: "GET",
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /** Generates PRD markdown via FastAPI */
  static async generatePrd(payload: {
    appName?: string;
    appIdea: string;
    stacks?: Record<string, unknown>;
    dynamicAnswers?: Record<string, unknown>;
    designPreference?: string;
    customPrompt?: string;
    structureContext?: string;
  }): Promise<{ markdown: string; modelUsed: string }> {
    return this.request("/api/v1/generate/prd", payload);
  }

  /** Generates 7 clarifying dynamic questions */
  static async generateQuestions(payload: {
    appName?: string;
    appIdea: string;
    stacks?: Record<string, unknown>;
  }): Promise<{ questions: Array<{ key: string; title: string; subtitle: string; type: "single" | "multiple"; options: string[] }> }> {
    return this.request("/api/v1/generate/questions", payload);
  }

  /** Recommends tech stack & color palette */
  static async recommendStack(payload: {
    appName?: string;
    appIdea: string;
    existingStacks?: Record<string, unknown>;
  }): Promise<{
    stacks: { frontend: string; backend: string; database: string; deployment: string };
    paletteId: string;
    badge: string;
    reasoning: string;
  }> {
    return this.request("/api/v1/generate/recommend-stack", payload);
  }

  /** Generates 6-Phase Kanban tasks */
  static async generateTasks(payload: {
    appName?: string;
    appIdea: string;
    prdMarkdown?: string;
    coreFeatures?: string[];
    strukturSummary?: string;
    stacks?: Record<string, unknown>;
  }): Promise<{ data: { phases: Array<Record<string, unknown>> } }> {
    return this.request("/api/v1/generate/tasks", payload);
  }

  /** Generates feature mindmap tree (Struktur) */
  static async generateStruktur(payload: {
    appName?: string;
    appIdea: string;
    stacks?: Record<string, unknown>;
    prdMarkdown?: string;
    dynamicAnswers?: Record<string, unknown>;
  }): Promise<{ data: { title: string; description: string; nodes: Array<Record<string, unknown>> } }> {
    return this.request("/api/v1/generate/struktur", payload);
  }

  /** Generates 768-dim embeddings via official Gemini gemini-embedding-001 */
  static async generateEmbeddings(payload: {
    texts: string[];
    model?: string;
  }): Promise<{ embeddings: number[][]; modelUsed: string; count: number }> {
    return this.request("/api/v1/generate/embeddings", payload);
  }

  /** Edits an existing PRD or answers brainstorming queries */
  static async editPrd(payload: {
    currentPrd: string;
    instruction: string;
    appName?: string;
    isEditIntent?: boolean;
  }): Promise<{
    reply: string;
    isPrdUpdated: boolean;
    updatedMarkdown?: string | null;
    modelUsed: string;
  }> {
    return this.request("/api/v1/generate/edit-prd", payload);
  }
}

