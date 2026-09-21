import * as fs from "fs";
import * as path from "path";
import { getTailwindPresetContent, getCssVariablesContent } from "../presets/index.js";

export async function themeCommand(options: { target?: string; json?: boolean }) {
  try {
    const workspaceRoot = process.cwd();
    const morynDir = path.join(workspaceRoot, ".moryn");
    if (!fs.existsSync(morynDir)) {
      fs.mkdirSync(morynDir, { recursive: true });
    }

    const targetDomain = options.target || "web";

    const presetContent = getTailwindPresetContent(targetDomain);
    const cssContent = getCssVariablesContent(targetDomain);

    const presetPath = path.join(workspaceRoot, "moryn.preset.js");
    fs.writeFileSync(presetPath, presetContent, "utf-8");

    const cssPath = path.join(morynDir, "theme.css");
    fs.writeFileSync(cssPath, cssContent, "utf-8");

    if (options.json) {
      console.log(JSON.stringify({
        success: true,
        presetFile: presetPath,
        cssFile: cssPath,
      }));
    } else {
      console.log("\n==========================================");
      console.log("  Moryn Theme Boilerplate Initialized");
      console.log("==========================================");
      console.log(`  Tailwind Preset : Created -> moryn.preset.js`);
      console.log(`  CSS Variables   : Created -> .moryn/theme.css`);
      console.log("\nAdd 'presets: [require(\"./moryn.preset.js\")]' to tailwind.config.js to enable semantic classes.\n");
    }
  } catch (err: any) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: err.message }));
    } else {
      console.error(`\n[ERROR] Theme initialization failed: ${err.message}\n`);
    }
    process.exit(1);
  }
}
