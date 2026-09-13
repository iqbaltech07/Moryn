import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ChatAction {
  id: string;
  label: string;
  prompt?: string;
  variant?: "primary" | "secondary" | "outline";
  icon?: "edit" | "brainstorm" | "database" | "diagram" | "sync" | "sparkles";
  actionType?: "send_prompt" | "copy_text";
  payload?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  actions?: ChatAction[];
}

interface ChatStore {
  projectChats: Record<string, ChatMessage[]>;
  currentProjectId: string;
  chatMessages: ChatMessage[];
  isAiEditing: boolean;
  selectedModel: string;
  aiPrompt: string;

  setCurrentProjectId: (projectId: string) => void;
  addMessage: (msg: ChatMessage) => void;
  setIsAiEditing: (isEditing: boolean) => void;
  setSelectedModel: (model: string) => void;
  setAiPrompt: (prompt: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      projectChats: {},
      currentProjectId: "default",
      chatMessages: [],
      isAiEditing: false,
      selectedModel: "gemini-3.7-flash",
      aiPrompt: "",

      setCurrentProjectId: (projectId: string) => {
        const id = projectId || "default";
        const existing = get().projectChats[id] || [];
        set({
          currentProjectId: id,
          chatMessages: existing,
        });
      },

      addMessage: (msg: ChatMessage) =>
        set((state) => {
          const id = state.currentProjectId || "default";
          const currentList = state.projectChats[id] || [];
          const updatedList = [...currentList, msg];
          return {
            chatMessages: updatedList,
            projectChats: {
              ...state.projectChats,
              [id]: updatedList,
            },
          };
        }),

      setIsAiEditing: (isAiEditing) => set({ isAiEditing }),
      setSelectedModel: (selectedModel) => set({ selectedModel }),
      setAiPrompt: (aiPrompt) => set({ aiPrompt }),

      clearChat: () =>
        set((state) => {
          const id = state.currentProjectId || "default";
          return {
            chatMessages: [],
            isAiEditing: false,
            aiPrompt: "",
            projectChats: {
              ...state.projectChats,
              [id]: [],
            },
          };
        }),
    }),
    {
      name: "moryn_chat_storage_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projectChats: state.projectChats,
        selectedModel: state.selectedModel,
        currentProjectId: state.currentProjectId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.currentProjectId) {
          state.chatMessages = state.projectChats[state.currentProjectId] || [];
        }
      },
    }
  )
);
