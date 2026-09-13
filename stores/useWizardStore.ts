import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FormData, Step, StackCategory } from "@/app/dashboard/components/setup/types";
import { apiClient } from "@/lib/utils/apiClient";

interface WizardStore {
  step: Step;
  subStep: number;
  loading: boolean;
  questionsLoading: boolean;
  form: FormData;

  setStep: (step: Step | ((prev: Step) => Step)) => void;
  setSubStep: (subStep: number | ((prev: number) => number)) => void;
  setLoading: (loading: boolean) => void;
  setQuestionsLoading: (loading: boolean) => void;

  setAppName: (name: string) => void;
  setAppIdea: (idea: string) => void;
  setStackMode: (mode: "manual" | "ai") => void;
  setStack: (category: StackCategory, label: string) => void;
  setDesignData: (designData: string) => void;
  setDynamicAnswer: (key: string, value: string | string[], type: "single" | "multiple") => void;

  fetchDynamicQuestions: () => Promise<void>;
  resetWizard: () => void;
}

const initialForm: FormData = {
  appIdea: "",
  appName: "",
  stackMode: "manual",
  stacks: { frontend: "", backend: "", database: "", deployment: "" },
  dynamicQuestions: [],
  dynamicAnswers: {},
};

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      step: 1,
      subStep: 0,
      loading: false,
      questionsLoading: false,
      form: initialForm,

      setStep: (updater) =>
        set((state) => ({ step: typeof updater === "function" ? updater(state.step) : updater })),

      setSubStep: (updater) =>
        set((state) => ({ subStep: typeof updater === "function" ? updater(state.subStep) : updater })),

      setLoading: (loading) => set({ loading }),
      setQuestionsLoading: (questionsLoading) => set({ questionsLoading }),

      setAppName: (appName) =>
        set((state) => ({ form: { ...state.form, appName } })),

      setAppIdea: (appIdea) =>
        set((state) => ({ form: { ...state.form, appIdea } })),

      setStackMode: (stackMode) =>
        set((state) => ({ form: { ...state.form, stackMode } })),

      setStack: (category, label) =>
        set((state) => ({
          form: {
            ...state.form,
            stacks: { ...state.form.stacks, [category]: label },
          },
        })),

      setDesignData: (designData) =>
        set((state) => ({ form: { ...state.form, designData } })),

      setDynamicAnswer: (key, value, type) =>
        set((state) => {
          if (type === "single") {
            return {
              form: {
                ...state.form,
                dynamicAnswers: { ...state.form.dynamicAnswers, [key]: value },
              },
            };
          }
          const current = (state.form.dynamicAnswers[key] as string[]) || [];
          const strVal = String(value);
          const next = current.includes(strVal)
            ? current.filter((x) => x !== strVal)
            : [...current, strVal];
          return {
            form: {
              ...state.form,
              dynamicAnswers: { ...state.form.dynamicAnswers, [key]: next },
            },
          };
        }),

      fetchDynamicQuestions: async () => {
        const { form } = get();
        set({ questionsLoading: true });
        try {
          const data = await apiClient.generate.questions({
            appName: form.appName,
            appIdea: form.appIdea,
            stacks: form.stacks,
          });

          const questions = Array.isArray(data) ? data : (data as any).questions || [];
          set((state) => ({
            form: { ...state.form, dynamicQuestions: questions, dynamicAnswers: {} },
            questionsLoading: false,
          }));
        } catch (e) {
          console.error("Failed to fetch dynamic questions:", e);
          set({ questionsLoading: false });
        }
      },

      resetWizard: () =>
        set({
          step: 1,
          subStep: 0,
          loading: false,
          questionsLoading: false,
          form: initialForm,
        }),
    }),
    {
      name: "moryn_wizard_draft_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        step: state.step,
        subStep: state.subStep,
        form: state.form,
      }),
    }
  )
);
