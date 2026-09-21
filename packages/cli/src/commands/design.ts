import * as fs from "fs";
import * as path from "path";
import { getProjectConfig } from "../config/store.js";
import { apiRequest } from "../api/client.js";

export async function designCommand(options: { project?: string; json?: boolean } = {}) {
  try {
    const workspaceRoot = process.cwd();
    const morynDir = path.join(workspaceRoot, ".moryn");
    const legacyPiardifyDir = path.join(workspaceRoot, ".piardify");
    const projectId = options.project || getProjectConfig().projectId;

    let remoteDesign = null;
    let fetchError = null;

    // 1. ALWAYS PRIORITIZE LIVE REMOTE API (Single Source of Truth)
    if (projectId) {
      try {
        const res = await apiRequest(`/api/agent/project?projectId=${projectId}&section=design`);
        if (res.success && res.design) {
          remoteDesign = res.design;

          // Auto-sync local cache files
          if (!fs.existsSync(morynDir)) {
            fs.mkdirSync(morynDir, { recursive: true });
          }
          if (remoteDesign.colorTokens) {
            fs.writeFileSync(path.join(morynDir, "tokens.json"), JSON.stringify(remoteDesign.colorTokens, null, 2), "utf-8");
          }
        }
      } catch (err: any) {
        fetchError = err;
      }
    }

    // 2. FALLBACK TO LOCAL CACHE ONLY IF REMOTE API FAILS OR OFFLINE
    let tokensPath = path.join(morynDir, "tokens.json");
    if (!fs.existsSync(tokensPath)) tokensPath = path.join(legacyPiardifyDir, "tokens.json");

    let rulesPath = path.join(morynDir, "anti_slop_rules.md");
    if (!fs.existsSync(rulesPath)) rulesPath = path.join(legacyPiardifyDir, "anti_slop_rules.md");

    let localTokens = null;
    let localRules = null;

    if (!remoteDesign) {
      if (fs.existsSync(tokensPath)) {
        try { localTokens = JSON.parse(fs.readFileSync(tokensPath, "utf-8")); } catch {}
      }
      if (fs.existsSync(rulesPath)) {
        try { localRules = fs.readFileSync(rulesPath, "utf-8"); } catch {}
      }
    }

    if (!remoteDesign && !localTokens && !localRules) {
      const errReason = fetchError ? fetchError.message : "NO_PROJECT_LINKED: Run 'npx moryn init' or specify '--project <projectId>' first.";
      throw new Error(errReason);
    }

    if (options.json) {
      console.log(JSON.stringify({
        success: true,
        source: remoteDesign ? "remote_api" : "local_fallback",
        design: remoteDesign || { tokens: localTokens, rules: localRules },
      }, null, 2));
      return;
    }

    // Human-readable console output
    console.log("\n==========================================");
    console.log(`  🎨 Moryn Design Context [${remoteDesign ? "LIVE REMOTE API" : "LOCAL CACHE FALLBACK"}]`);
    console.log("==========================================\n");

    if (remoteDesign) {
      if (remoteDesign.colorTokens && remoteDesign.colorTokens.length > 0) {
        console.log("  [COLOR TOKENS & PALETTE]");
        for (const token of remoteDesign.colorTokens) {
          console.log(`    • ${(token.role || "token").padEnd(20)} : ${token.hex} (${token.name || ""})`);
        }
        console.log("");
      }

      if (remoteDesign.rawMarkdown) {
        console.log("  [DESIGN SYSTEM & LAYOUT RULES]");
        console.log(remoteDesign.rawMarkdown);
        console.log("");
      }
    } else {
      if (localTokens) {
        console.log("  [COLOR TOKENS & PALETTE (LOCAL FALLBACK)]");
        console.log(JSON.stringify(localTokens, null, 2));
        console.log("");
      }
      if (localRules) {
        console.log("  [ANTI-SLOP RULES (LOCAL FALLBACK)]");
        console.log(localRules);
        console.log("");
      }
    }
  } catch (err: any) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: err.message }));
    } else {
      console.error(`\n❌ Fetching design context failed: ${err.message}\n`);
    }
    process.exit(1);
  }
}
