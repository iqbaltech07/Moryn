"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanCommand = cleanCommand;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function cleanCommand(options) {
    const workspaceRoot = process.cwd();
    const searchDirs = ["src", "app", "components", "lib", "pages", "ui"];
    const targetExtensions = [".tsx", ".jsx", ".ts", ".js", ".vue"];
    const allFiles = [];
    function scanDirectory(dir) {
        if (!fs.existsSync(dir))
            return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== ".git" && entry.name !== "dist") {
                    scanDirectory(fullPath);
                }
            }
            else if (entry.isFile()) {
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
    const importOccurrences = new Set();
    const fileContents = new Map();
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
    const orphanedFiles = [];
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
    const filesModified = [];
    const autoFix = options.fix !== false && !options.dryRun;
    for (const filePath of allFiles) {
        const relPath = path.relative(workspaceRoot, filePath).replace(/\\/g, "/");
        let content = fileContents.get(filePath) || "";
        // Prune commented-out JSX blocks (e.g. // <div..., // <Button...)
        const lines = content.split("\n");
        const newLines = [];
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
                }
                catch (e) { }
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
    }
    else {
        console.log("\n==========================================");
        console.log("  Moryn Codebase Cleaner v2.13.0");
        console.log("==========================================\n");
        if (orphanedFiles.length > 0) {
            console.log(`  ${autoFix ? "🗑️  Pruned" : "⚠️  Found"} ${orphanedFiles.length} Unused/Orphaned Component(s):`);
            orphanedFiles.forEach((f) => console.log(`    - ${f}`));
            console.log("");
        }
        else {
            console.log("  ✅ Zero orphaned components detected.");
        }
        if (cleanedCommentsCount > 0) {
            console.log(`  ${autoFix ? "🧹 Cleaned" : "⚠️  Found"} ${cleanedCommentsCount} dead commented-out code lines.`);
            filesModified.forEach((f) => console.log(`    - ${f}`));
            console.log("");
        }
        else {
            console.log("  ✅ Zero dead comment blocks found.");
        }
        if (autoFix && (orphanedFiles.length > 0 || cleanedCommentsCount > 0)) {
            console.log("  🎉 Codebase successfully sanitized & pristine clean!\n");
        }
        else {
            console.log("  ✨ Codebase is already in pristine condition!\n");
        }
    }
}
