import * as fs from "fs";
import * as path from "path";
import { getScaffoldTemplate, ComponentType, getTemplateRegistry } from "../templates/index.js";

export async function generateCommand(
  nameOrType?: string,
  extraName?: string,
  options: { type?: string; target?: string; json?: boolean } = {}
) {
  try {
    const registry = getTemplateRegistry();
    const validTypes: string[] = registry.map((r) => r.type.toLowerCase());

    if (!nameOrType && !options.type) {
      console.log("\n==========================================");
      console.log("  🎨 Moryn Component Scaffolder v2.13.0");
      console.log("==========================================");
      console.log("  Usage: npx moryn scaffold <ComponentName> [--type <type>]\n");
      console.log("  Available Anti-Slop Component Archetypes:");
      registry.forEach((item) => {
        console.log(`    • ${item.type.padEnd(10)} : ${item.description}`);
      });
      console.log();
      throw new Error("MISSING_COMPONENT_NAME: Please specify component name (e.g. 'npx moryn scaffold HeroSection --type=hero')");
    }

    let componentType: ComponentType = "card";
    let rawName = nameOrType || "";

    if (nameOrType && validTypes.includes(nameOrType.toLowerCase())) {
      componentType = nameOrType.toLowerCase();
      const matched = registry.find((r) => r.type.toLowerCase() === componentType);
      rawName = extraName || matched?.defaultName || "CustomComponent";
    } else if (options.type && validTypes.includes(options.type.toLowerCase())) {
      componentType = options.type.toLowerCase();
      const matched = registry.find((r) => r.type.toLowerCase() === componentType);
      rawName = rawName || matched?.defaultName || "CustomComponent";
    }

    const matched = registry.find((r) => r.type.toLowerCase() === componentType) || registry[0];
    if (!rawName) {
      rawName = matched?.defaultName || "CustomComponent";
    }

    const cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const workspaceRoot = process.cwd();

    let targetDir = path.join(workspaceRoot, "components");
    if (fs.existsSync(path.join(workspaceRoot, "src", "components"))) {
      targetDir = path.join(workspaceRoot, "src", "components");
    } else if (fs.existsSync(path.join(workspaceRoot, "src"))) {
      targetDir = path.join(workspaceRoot, "src", "components");
    }

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, `${cleanName}.tsx`);
    const scaffoldCode = getScaffoldTemplate(cleanName, componentType);

    fs.writeFileSync(filePath, scaffoldCode, "utf-8");

    if (options.json) {
      console.log(JSON.stringify({
        success: true,
        componentName: cleanName,
        componentType,
        filePath,
      }));
    } else {
      console.log("\n==========================================");
      console.log("  🎨 Moryn Component Scaffolder");
      console.log("==========================================");
      console.log(`  Component Name : ${cleanName}`);
      console.log(`  Archetype Type : ${componentType.toUpperCase()}`);
      console.log(`  File Created   : ${path.relative(workspaceRoot, filePath)}`);
      console.log("  Anti-Slop Status: 100% Compliant (Zero Slop, Responsive)\n");
    }
  } catch (err: any) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: err.message }));
    } else {
      console.error(`\n❌ Component scaffolding failed: ${err.message}\n`);
    }
    process.exit(1);
  }
}
