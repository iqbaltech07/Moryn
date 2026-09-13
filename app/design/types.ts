export interface ProjectDetailData {
  id: string;
  userId?: string;
  appName: string;
  appIdea: string;
  title?: string;
  formInputs?: string;
  prdData?: string;
  strukturData?: string;
  taskData?: string;
  designData?: string;
  status?: string;
  checkedTasks?: string;
  finishedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ColorToken {
  token: string;
  hex: string;
  role: string;
}

export interface AccordionSection {
  id: string;
  title: string;
  content: string;
}
