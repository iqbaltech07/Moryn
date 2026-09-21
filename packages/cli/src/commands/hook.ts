import * as fs from "fs";
import * as path from "path";

export async function hookCommand(options: { json?: boolean }) {
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
      } catch {}
    }

    if (options.json) {
      console.log(JSON.stringify({
        success: true,
        gitHookInstalled,
        packageJsonUpdated,
      }));
    } else {
      console.log("\n==========================================");
      console.log("  Moryn Guardrail Hooks Installed");
      console.log("==========================================");
      console.log(`  Git Pre-Commit : ${gitHookInstalled ? "Installed -> .git/hooks/pre-commit" : "Skipped (No .git folder)"}`);
      console.log(`  Package Prebuild: ${packageJsonUpdated ? "Added 'prebuild': 'npx moryn validate-ui'" : "Skipped"}`);
      console.log("\nCommits and builds will now automatically enforce Anti-Slop rules.\n");
    }
  } catch (err: any) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: err.message }));
    } else {
      console.error(`\n[ERROR] Hook installation failed: ${err.message}\n`);
    }
    process.exit(1);
  }
}
