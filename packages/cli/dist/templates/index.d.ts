export type ComponentType = "card" | "hero" | "table" | "form" | "modal" | "bento" | "sidebar" | string;
export interface TemplateMetadata {
    id: string;
    name: string;
    slug: string;
    type: ComponentType;
    file: string;
    defaultName: string;
    category: string;
    description: string;
    tags: string[];
    dependencies: string[];
    cliCommand: string;
    aiPrompt: string;
}
/**
 * Loads registry.json from templates manifest
 */
export declare function getTemplateRegistry(): TemplateMetadata[];
/**
 * Universal AST/Regex Template Parser
 * Parses the raw React Component file and replaces default identifiers with custom user component names.
 */
export declare function parseComponentScaffold(rawSource: string, defaultName: string, targetName: string): string;
/**
 * Reads and parses scaffold template dynamically from packages/cli/src/templates
 */
export declare function getScaffoldTemplate(name: string, type: ComponentType): string;
