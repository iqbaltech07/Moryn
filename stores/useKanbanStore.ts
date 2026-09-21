import { create } from "zustand";

export type ColumnId = "todo" | "in_progress" | "done" | "error";

interface KanbanStore {
  taskStatus: Record<string, ColumnId>;
  isDirty: boolean;
  activePhase: string;

  setTaskStatus: (statuses: Record<string, ColumnId> | ((prev: Record<string, ColumnId>) => Record<string, ColumnId>)) => void;
  updateTaskStatus: (taskId: string, newStatus: ColumnId) => void;
  setActivePhase: (phaseId: string) => void;
  setIsDirty: (isDirty: boolean) => void;
  resetKanban: () => void;
}

export const useKanbanStore = create<KanbanStore>((set) => ({
  taskStatus: {},
  isDirty: false,
  activePhase: "",

  setTaskStatus: (updater) =>
    set((state) => ({
      taskStatus: typeof updater === "function" ? updater(state.taskStatus) : updater,
    })),

  updateTaskStatus: (taskId, newStatus) =>
    set((state) => ({
      taskStatus: { ...state.taskStatus, [taskId]: newStatus },
      isDirty: true,
    })),

  setActivePhase: (activePhase) => set({ activePhase }),
  setIsDirty: (isDirty) => set({ isDirty }),
  resetKanban: () => set({ taskStatus: {}, isDirty: false, activePhase: "" }),
}));
