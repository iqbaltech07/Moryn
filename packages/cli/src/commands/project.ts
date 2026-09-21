import * as fs from "fs";
import * as path from "path";
import { getProjectConfig } from "../config/store.js";
import { apiRequest } from "../api/client.js";

export async function projectCommand(section?: string, options: { project?: string; skill?: string; json?: boolean } = {}) {
  try {
    const workspaceRoot = process.cwd();
    const morynDir = path.join(workspaceRoot, ".moryn");
    const legacyPiardifyDir = path.join(workspaceRoot, ".piardify");

    let sec = (section || "overview").toLowerCase();

    // Check local modular files first
    if (sec === "tokens") {
      let tokensFile = path.join(morynDir, "tokens.json");
      if (!fs.existsSync(tokensFile)) tokensFile = path.join(legacyPiardifyDir, "tokens.json");
      if (fs.existsSync(tokensFile)) {
        const tokens = JSON.parse(fs.readFileSync(tokensFile, "utf-8"));
        console.log(options.json ? JSON.stringify(tokens) : JSON.stringify(tokens, null, 2));
        return;
      }
    }

    if (sec === "rules") {
      let rulesFile = path.join(morynDir, "anti_slop_rules.md");
      if (!fs.existsSync(rulesFile)) rulesFile = path.join(legacyPiardifyDir, "anti_slop_rules.md");
      if (fs.existsSync(rulesFile)) {
        const rules = fs.readFileSync(rulesFile, "utf-8");
        console.log(rules);
        return;
      }
    }

    const projectId = options.project || getProjectConfig().projectId;

    if (!projectId) {
      throw new Error("NO_PROJECT_LINKED: Run 'npx moryn init' or specify '--project <projectId>' first.");
    }

    if (sec === "current") sec = "overview";

    let url = `/api/agent/project?projectId=${projectId}&section=${sec}`;
    if (options.skill) {
      url += `&skill=${encodeURIComponent(options.skill)}`;
    }

    // section=context returns the hybrid format as plain text (not JSON),
    // so it must be fetched raw and printed verbatim.
    const isContext = sec === "context";
    const res = await apiRequest(url, { rawText: isContext });

    if (isContext) {
      console.log(res);
    } else if (options.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n--- Moryn Project [${sec.toUpperCase()}] ---`);
      if (sec === "prd") {
        console.log(res.prd || "No PRD content found.");
      } else {
        console.log(JSON.stringify(res, null, 2));
      }
      console.log("");
    }
  } catch (err: any) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: err.message }));
    } else {
      console.error(`\n❌ Project command failed: ${err.message}\n`);
    }
    process.exit(1);
  }
}
