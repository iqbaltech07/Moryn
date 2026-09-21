import { ComponentItem } from "@/lib/components/componentsRegistry";

export type ShowcaseTab = "preview" | "code" | "prompt" | "install";

export type ViewportWidth = "100%" | "768px" | "375px";

export type CopiedType = "code" | "prompt" | "cli" | "npm" | null;

export interface StudioSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  groupedComponents: Record<string, ComponentItem[]>;
  filteredCount: number;
  selectedId: string;
  onSelectComponent: (id: string) => void;
}

export interface StudioBreadcrumbsHeaderProps {
  component: ComponentItem;
  copiedType: CopiedType;
  onCopyCli: (cliCommand: string) => void;
}

export interface StudioPanelToolbarProps {
  activeTab: ShowcaseTab;
  onTabChange: (tab: ShowcaseTab) => void;
  viewportWidth: ViewportWidth;
  onViewportChange: (width: ViewportWidth) => void;
  onReloadPreview: () => void;
  copiedType: CopiedType;
  onCopyCode: (code: string) => void;
  onCopyPrompt: (prompt: string) => void;
  rawCode: string;
  aiPrompt: string;
}

export interface StudioPanelBodyProps {
  activeTab: ShowcaseTab;
  currentComponent: ComponentItem;
  viewportWidth: ViewportWidth;
  previewKey: number;
  copiedType: CopiedType;
  onCopyCli: (cliCommand: string) => void;
}

export interface StudioIntegrationCardsProps {
  cliCommand: string;
}
