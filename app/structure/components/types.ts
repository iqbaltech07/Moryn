export interface StrukturChild {
  id: string;
  label: string;
}

export interface StrukturNode {
  id: string;
  label: string;
  phase?: number;
  color?: string;
  children: StrukturChild[];
}

export interface StrukturData {
  title: string;
  description: string;
  nodes: StrukturNode[];
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  estimasi?: string;
  tags?: string[];
  status?: string; // "todo" | "in_progress" | "done"
  definitionOfDone?: string;
  isCheckpoint?: boolean;
  phaseName?: string;
}
