import registryData from "@/packages/cli/src/templates/registry.json";
import { getScaffoldTemplate, type ComponentType, type TemplateMetadata } from "@/packages/cli/src/templates/index";

export type { ComponentType };

export interface ComponentItem extends TemplateMetadata {
  rawCode: string;
}

export const COMPONENTS_REGISTRY: ComponentItem[] = (registryData as TemplateMetadata[]).map((item) => ({
  ...item,
  rawCode: getScaffoldTemplate(item.defaultName, item.type),
}));
