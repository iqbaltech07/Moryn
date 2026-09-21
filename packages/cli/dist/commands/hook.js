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
exports.hookCommand = hookCommand;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function hookCommand(options) {
    try {
        const workspaceRoot = process.cwd();
        const gitHooksDir = path.join(workspaceRoot, ".git", "hooks");
        let gitHookInstalled = false;
        let packageJsonUpdated = false;
        // 1. Install Git Pre-commit Hook
        if (fs.existsSync(path.join(workspaceRoot, ".git"))) {
            if (!fs.existsSync(gitHooksDir)) {
                fs.mkdirSync(gitHooksDir, { recursive: true });
            }
            const preCommitScript = `#!/bin/sh
# Moryn Anti-Slop Visual Governance Pre-Commit Hook
echo "🔍 Running Moryn Anti-Slop Linter..."
npx moryn validate-ui
if [ $? -ne 0 ]; then
  echo "❌ Commit rejected: Moryn Anti-Slop Linter found violations."
  exit 1
fi
`;
            const hookPath = path.join(gitHooksDir, "pre-commit");
            fs.writeFileSync(hookPath, preCommitScript, { mode: 0o755 });
            gitHookInstalled = true;
        }
        // 2. Add "prebuild" script to package.json
        const pkgPath = path.join(workspaceRoot, "package.json");
        if (fs.existsSync(pkgPath)) {
            try {
                const pkgContent = fs.readFileSync(pkgPath, "utf-8");
                const pkg = JSON.parse(pkgContent);
                pkg.scripts = pkg.scripts || {};
                pkg.scripts.prebuild = "npx moryn validate-ui";
                fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf-8");
                packageJsonUpdated = true;
            }
            catch { }
        }
        if (options.json) {
            console.log(JSON.stringify({
                success: true,
                gitHookInstalled,
                packageJsonUpdated,
            }));
        }
        else {
            console.log("\n==========================================");
            console.log("  Moryn Guardrail Hooks Installed");
            console.log("==========================================");
            console.log(`  Git Pre-Commit : ${gitHookInstalled ? "Installed -> .git/hooks/pre-commit" : "Skipped (No .git folder)"}`);
            console.log(`  Package Prebuild: ${packageJsonUpdated ? "Added 'prebuild': 'npx moryn validate-ui'" : "Skipped"}`);
            console.log("\nCommits and builds will now automatically enforce Anti-Slop rules.\n");
        }
    }
    catch (err) {
        if (options.json) {
            console.log(JSON.stringify({ success: false, error: err.message }));
        }
        else {
            console.error(`\n[ERROR] Hook installation failed: ${err.message}\n`);
        }
        process.exit(1);
    }
}
