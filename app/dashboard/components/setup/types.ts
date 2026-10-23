export type Step = 1 | 2 | 3;

export interface DynamicQuestion {
  key: string;
  title: string;
  subtitle: string;
  type: "single" | "multiple" | "essay";
  options: string[];
  placeholder?: string;
  hasConditionalInput?: boolean;
  conditionalTriggerValue?: string;
  conditionalInputLabel?: string;
  conditionalInputPlaceholder?: string;
  conditionalInputType?: "text" | "textarea";
}

export interface CustomDesignMeta {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  tokenCount: number;
  sectionCount: number;
  tokensSample: Array<{ token: string; hex: string; role: string }>;
  sectionsSample: Array<{ id: string; title: string }>;
  rawMarkdown?: string;
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
  customDesignMeta?: CustomDesignMeta | null;
}

export type StackCategory = "frontend" | "backend" | "database" | "deployment";
