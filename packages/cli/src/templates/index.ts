import registryData from "./registry.json";

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
export function getTemplateRegistry(): TemplateMetadata[] {
  return registryData as TemplateMetadata[];
}

/**
 * Universal AST/Regex Template Parser
 * Parses the raw React Component file and replaces default identifiers with custom user component names.
 */
export function parseComponentScaffold(rawSource: string, defaultName: string, targetName: string): string {
  if (!targetName || targetName === defaultName) {
    return rawSource;
  }

  const defaultPropsName = `${defaultName}Props`;
  const targetPropsName = `${targetName}Props`;

  let parsed = rawSource;

  // 1. Replace Props Interface definition and usages
  parsed = parsed.replaceAll(defaultPropsName, targetPropsName);

  // 2. Replace Component Function name
  parsed = parsed.replaceAll(`function ${defaultName}`, `function ${targetName}`);

  // 3. Replace default export
  parsed = parsed.replaceAll(`export default ${defaultName}`, `export default ${targetName}`);

  return parsed;
}

/**
 * Reads and parses scaffold template dynamically from packages/cli/src/templates
 */
export function getScaffoldTemplate(name: string, type: ComponentType): string {
  const registry = getTemplateRegistry();
  const found = registry.find((item) => item.type === type || item.id === type) || registry[0];

  const defaultName = found?.defaultName || "CustomComponent";
  const filename = found?.file || `${type}.tsx`;
  const targetName = name || defaultName;

  // In Node.js CLI runtime, read the component file dynamically
  if (typeof window === "undefined") {
    try {
      const nodeFs = require("fs");
      const nodePath = require("path");
      const templatesDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();

      const candidatePaths = [
        nodePath.join(templatesDir, filename),
        nodePath.join(templatesDir, "src", "templates", filename),
        nodePath.join(templatesDir, "packages", "cli", "src", "templates", filename),
        nodePath.join(process.cwd(), "packages", "cli", "src", "templates", filename),
      ];

      for (const p of candidatePaths) {
        if (nodeFs.existsSync(p)) {
          const rawCode = nodeFs.readFileSync(p, "utf-8");
          return parseComponentScaffold(rawCode, defaultName, targetName);
        }
      }
    } catch {
      // fallback to generated stub
    }
  }

  return `// Scaffolding ${targetName} (${type})\nexport function ${targetName}() { return <div>${targetName}</div>; }\nexport default ${targetName};`;
}
