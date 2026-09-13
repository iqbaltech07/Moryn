import { create } from "zustand";
import { apiClient } from "@/lib/utils/apiClient";
import type { ProjectDetailData } from "@/app/design/types";

interface ProjectStore {
  currentProjectId: string | null;
  project: ProjectDetailData | null;
  isLoading: boolean;
  error: string | null;

  fetchProject: (projectId: string, force?: boolean) => Promise<ProjectDetailData | null>;
  setProject: (project: ProjectDetailData | null | ((prev: ProjectDetailData | null) => ProjectDetailData | null)) => void;
  updateProjectLocally: (partial: Partial<ProjectDetailData>) => void;
  clearProject: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  currentProjectId: null,
  project: null,
  isLoading: false,
  error: null,

  fetchProject: async (projectId: string, force = false) => {
    const state = get();
    // Cache hit: return immediately if project is already in memory and matching ID
    if (!force && state.currentProjectId === projectId && state.project) {
      return state.project;
    }

    set({ currentProjectId: projectId, isLoading: true, error: null });
    try {
      const res = await apiClient.projects.getDetail(projectId);
      const projectData = res.project || null;
      set({ project: projectData, isLoading: false, error: null });
      return projectData;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load project details";
      set({ error: errorMsg, isLoading: false });
      return null;
    }
  },

  setProject: (updater) => {
    if (typeof updater === "function") {
      set((state) => ({ project: updater(state.project) }));
    } else {
      set({ project: updater });
    }
  },

  updateProjectLocally: (partial) => {
    set((state) => ({
      project: state.project ? { ...state.project, ...partial } : null,
    }));
  },

  clearProject: () => set({ currentProjectId: null, project: null, error: null, isLoading: false }),
}));
