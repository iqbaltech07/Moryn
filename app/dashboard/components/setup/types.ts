export type Step = 1 | 2 | 3;

export interface DynamicQuestion {
  key: string;
  title: string;
  subtitle: string;
  type: "single" | "multiple";
  options: string[];
}

export interface FormData {
  appIdea: string;
  appName: string;
  stackMode: "manual" | "ai";
  stacks: {
    frontend: string;
    backend: string;
    database: string;
    deployment: string;
  };
  dynamicQuestions: DynamicQuestion[];
  dynamicAnswers: Record<string, string | string[]>;
  designData?: string;
}

export type StackCategory = "frontend" | "backend" | "database" | "deployment";
