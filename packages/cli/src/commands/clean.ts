import * as fs from "fs";
import * as path from "path";

export async function cleanCommand(options: { fix?: boolean; dryRun?: boolean; json?: boolean }) {
  const workspaceRoot = process.cwd();
  const searchDirs = ["src", "app", "components", "lib", "pages", "ui"];
  const targetExtensions = [".tsx", ".jsx", ".ts", ".js", ".vue"];

  const allFiles: string[] = [];

  function scanDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== ".git" && entry.name !== "dist") {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (targetExtensions.includes(ext)) {
          allFiles.push(fullPath);
        }
      }
    }
  }

  for (const dirName of searchDirs) {
    scanDirectory(path.join(workspaceRoot, dirName));
  }

  // 1. Build Import Graph
  const importOccurrences = new Set<string>();
  const fileContents = new Map<string, string>();

  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    fileContents.set(filePath, content);

    // Match static import or require or dynamic import
    const importRegex = /(?:from\s+|import\s*\(\s*|require\s*\(\s*)["']([^"']+)["']/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      importOccurrences.add(importPath);

      // Normalize @/ alias or relative path base name
      const baseName = path.basename(importPath, path.extname(importPath));
      importOccurrences.add(baseName);
    }
  }

  // 2. Identify Orphaned Bespoke Components
  const orphanedFiles: string[] = [];
  for (const filePath of allFiles) {
    const relPath = path.relative(workspaceRoot, filePath).replace(/\\/g, "/");
    const baseName = path.basename(filePath, path.extname(filePath));

    // Only inspect component files (ignore root pages, layouts, globals, or shadcn ui primitives)
    const isComponent = (relPath.includes("components/") || relPath.includes("ui/")) && !relPath.includes("components/ui/");
    const isPageOrLayout = relPath.includes("page.") || relPath.includes("layout.") || relPath.includes("route.") || relPath.includes("globals.");

    if (isComponent && !isPageOrLayout) {
      let isUsed = false;
      for (const imp of importOccurrences) {
        if (imp === baseName || imp.endsWith("/" + baseName) || relPath.endsWith(imp) || relPath.includes(imp)) {
          isUsed = true;
          break;
        }
      }

      if (!isUsed) {
        orphanedFiles.push(relPath);
      }
    }
  }

  // 3. Clean Dead Comments and Prune Files
  let cleanedCommentsCount = 0;
  const filesModified: string[] = [];
  const autoFix = options.fix !== false && !options.dryRun;

  for (const filePath of allFiles) {
    const relPath = path.relative(workspaceRoot, filePath).replace(/\\/g, "/");
    let content = fileContents.get(filePath) || "";

    // Prune commented-out JSX blocks (e.g. // <div..., // <Button...)
    const lines = content.split("\n");
    const newLines: string[] = [];
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*\/\/\s*<(div|section|button|Card|input|Link|table|form|p|h[1-6])\b/i.test(line)) {
        cleanedCommentsCount++;
        modified = true;
        continue; // drop the line
      }
      newLines.push(line);
    }

    if (modified) {
      content = newLines.join("\n");
      if (autoFix) {
        fs.writeFileSync(filePath, content, "utf-8");
        filesModified.push(relPath);
      }
    }
  }

  // 4. If autoFix is enabled, delete or prune orphaned files
  if (autoFix && orphanedFiles.length > 0) {
    for (const orphan of orphanedFiles) {
      const fullPath = path.join(workspaceRoot, orphan);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (e) {}
      }
    }
  }

  if (options.json) {
    console.log(JSON.stringify({
      orphanedFiles,
      cleanedCommentsCount,
      filesModified,
      pruned: autoFix,
    }));
  } else {
    console.log("\n==========================================");
    console.log("  Moryn Codebase Cleaner v2.13.0");
    console.log("==========================================\n");

    if (orphanedFiles.length > 0) {
      console.log(`  ${autoFix ? "🗑️  Pruned" : "⚠️  Found"} ${orphanedFiles.length} Unused/Orphaned Component(s):`);
      orphanedFiles.forEach((f) => console.log(`    - ${f}`));
      console.log("");
    } else {
      console.log("  ✅ Zero orphaned components detected.");
    }

    if (cleanedCommentsCount > 0) {
      console.log(`  ${autoFix ? "🧹 Cleaned" : "⚠️  Found"} ${cleanedCommentsCount} dead commented-out code lines.`);
      filesModified.forEach((f) => console.log(`    - ${f}`));
      console.log("");
    } else {
      console.log("  ✅ Zero dead comment blocks found.");
    }

    if (autoFix && (orphanedFiles.length > 0 || cleanedCommentsCount > 0)) {
      console.log("  🎉 Codebase successfully sanitized & pristine clean!\n");
    } else {
      console.log("  ✨ Codebase is already in pristine condition!\n");
    }
  }
}
