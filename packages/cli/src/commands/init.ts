import * as fs from "fs";
import * as path from "path";
import { saveProjectConfig, getProjectConfig, getGlobalConfig } from "../config/store.js";
import { DEFAULT_API_URL } from "../config/constants.js";
import { apiRequest } from "../api/client.js";

export async function initCommand(options: { project?: string; target?: string; json?: boolean }) {
  try {
    const globalConfig = getGlobalConfig();
    const token = globalConfig.token || process.env.MORYN_API_KEY || process.env.PIARDIFY_API_KEY || "";
    const baseUrl = (globalConfig.apiUrl || DEFAULT_API_URL).replace(/\/$/, "");
    const targetDomain = (options.target || "web").toLowerCase();

    const statusRes = await apiRequest("/api/agent/status");
    if (!statusRes.authenticated) {
      throw new Error("NOT_AUTHENTICATED: Run 'npx moryn login --token <TOKEN>' first.");
    }

    let projectId = options.project || getProjectConfig().projectId;

    if (!projectId) {
      const projectsRes = await apiRequest("/api/agent/project");
      const projects = projectsRes.projects || [];

      if (projects.length === 0) {
        throw new Error("NO_PROJECTS_FOUND: No Moryn projects found in your account. Please create one on Moryn web app first.");
      }

      projectId = projects[0].id;
    }

    const projectRes = await apiRequest(`/api/agent/project?projectId=${projectId}`);
    const project = projectRes.project;

    if (!project) {
      throw new Error(`PROJECT_NOT_FOUND: Project ID '${projectId}' was not found.`);
    }

    saveProjectConfig({
      projectId: project.id,
      appName: project.appName,
    });

    const workspaceRoot = process.cwd();
    const morynDir = path.join(workspaceRoot, ".moryn");
    if (!fs.existsSync(morynDir)) {
      fs.mkdirSync(morynDir, { recursive: true });
    }

    // Save project target domain config (.moryn/config.json)
    const configData = {
      projectId: project.id,
      appName: project.appName,
      target: targetDomain,
      initializedAt: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(morynDir, "config.json"), JSON.stringify(configData, null, 2), "utf-8");

    // Fetch and save full project context locally in hybrid format (XML + Markdown + JSON)
    let fullContextRes = "";
    try {
      fullContextRes = await apiRequest(`/api/agent/project?projectId=${projectId}&section=context`, { rawText: true });
      fs.writeFileSync(path.join(morynDir, "context.md"), fullContextRes, "utf-8");
    } catch { }

    // Modular Context Architecture
    try {
      // 1. Tokens JSON
      const tokensData = {
        bgMain: "#090A0C",
        bgSurface: "#121318",
        bgElevated: "#181A22",
        borderSubtle: "#222634",
        accentPrimary: "#6366F1",
        textPrimary: "#F3F4F6",
        textMuted: "#9CA3AF",
        currencyRules: {
          billion: "Rp X,XX M",
          million: "Rp X,XX Jt",
          thousand: "Rp XXX Rb"
        }
      };
      fs.writeFileSync(path.join(morynDir, "tokens.json"), JSON.stringify(tokensData, null, 2), "utf-8");

      // 2. Anti-Slop Rules MD
      const antiSlopRules = `# 🛡️ Moryn Anti-Slop & UI Framework Rules (${targetDomain.toUpperCase()})
- REQUIRED MANDATE: ALWAYS use shadcn/ui primitives (@/components/ui/*) for all UI components (Button, Input, Dialog, Select, Card, Sheet, DropdownMenu, Table, Tabs, Tooltip, Popover, Avatar, Badge).
- FORBIDDEN: Pure Black (#000000) or Navy (#0F172A). Use Obsidian (#090A0C).
- FORBIDDEN: Gradient Text fill on headlines (text-transparent bg-gradient-to-r).
- FORBIDDEN: Card-inside-card nested > 2 levels deep.
- FORBIDDEN: Fixed 'h-screen' viewport. Use 'min-h-[100dvh]' or 'min-h-screen'.
- FORBIDDEN: Headline biscuit pills with pulsing dots.
- REQUIRED: Compact currency formatting for IDR amounts >= 100.000.
`;
      fs.writeFileSync(path.join(morynDir, "anti_slop_rules.md"), antiSlopRules, "utf-8");

      // 3. PRD Summary
      if (project.prdData) {
        fs.writeFileSync(path.join(morynDir, "prd_summary.md"), project.prdData, "utf-8");
      }
    } catch { }

    // Generate Windows CMD 10ms native helper
    const cmdScript = `@echo off
set "ACTION=%~1"
set "TASK_ID=%~2"
set "EXTRA=%~3"
set "API_URL=${baseUrl}"
set "TOKEN=${token}"
set "PROJECT_ID=${projectId}"

if "%ACTION%"=="start" (
  curl -s -X POST "%API_URL%/api/agent/tasks/%TASK_ID%/start?projectId=%PROJECT_ID%" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json"
  exit /b
)
if "%ACTION%"=="complete" (
  curl -s -X POST "%API_URL%/api/agent/tasks/%TASK_ID%/complete?projectId=%PROJECT_ID%" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json"
  exit /b
)
if "%ACTION%"=="fail" (
  curl -s -X POST "%API_URL%/api/agent/tasks/%TASK_ID%/fail?projectId=%PROJECT_ID%" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d "{\\"reason\\":\\"%EXTRA%\\"}"
  exit /b
)
if "%ACTION%"=="current" (
  curl -s "%API_URL%/api/agent/tasks/current?projectId=%PROJECT_ID%" -H "Authorization: Bearer %TOKEN%"
  exit /b
)
if "%ACTION%"=="context" (
  curl -s "%API_URL%/api/agent/project?projectId=%PROJECT_ID%&section=context" -H "Authorization: Bearer %TOKEN%"
  exit /b
)
if "%ACTION%"=="design" (
  curl -s "%API_URL%/api/agent/project?projectId=%PROJECT_ID%&section=design" -H "Authorization: Bearer %TOKEN%"
  exit /b
)
if "%ACTION%"=="prd" (
  curl -s "%API_URL%/api/agent/project?projectId=%PROJECT_ID%&section=prd" -H "Authorization: Bearer %TOKEN%"
  exit /b
)
if "%ACTION%"=="taste" (
  curl -s "%API_URL%/api/agent/project?projectId=%PROJECT_ID%&section=taste-skill&skill=%TASK_ID%" -H "Authorization: Bearer %TOKEN%"
  exit /b
)
if "%ACTION%"=="validate" (
  npx moryn validate-ui
  exit /b
)
if "%ACTION%"=="theme" (
  npx moryn init-theme
  exit /b
)
if "%ACTION%"=="clean" (
  npx moryn clean
  exit /b
)
`;
    fs.writeFileSync(path.join(morynDir, "sync.cmd"), cmdScript, "utf-8");

    // Generate POSIX shell 10ms native helper
    const shScript = `#!/bin/sh
ACTION="$1"
TASK_ID="$2"
EXTRA="$3"
API_URL="${baseUrl}"
TOKEN="${token}"
PROJECT_ID="${projectId}"

if [ "$ACTION" = "start" ]; then
  curl -s -X POST "$API_URL/api/agent/tasks/$TASK_ID/start?projectId=$PROJECT_ID" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json"
elif [ "$ACTION" = "complete" ]; then
  curl -s -X POST "$API_URL/api/agent/tasks/$TASK_ID/complete?projectId=$PROJECT_ID" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json"
elif [ "$ACTION" = "fail" ]; then
  curl -s -X POST "$API_URL/api/agent/tasks/$TASK_ID/fail?projectId=$PROJECT_ID" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\\"reason\\":\\"$EXTRA\\"}"
elif [ "$ACTION" = "current" ]; then
  curl -s "$API_URL/api/agent/tasks/current?projectId=$PROJECT_ID" -H "Authorization: Bearer $TOKEN"
elif [ "$ACTION" = "context" ]; then
  curl -s "$API_URL/api/agent/project?projectId=$PROJECT_ID&section=context" -H "Authorization: Bearer $TOKEN"
elif [ "$ACTION" = "design" ]; then
  curl -s "$API_URL/api/agent/project?projectId=$PROJECT_ID&section=design" -H "Authorization: Bearer $TOKEN"
elif [ "$ACTION" = "prd" ]; then
  curl -s "$API_URL/api/agent/project?projectId=$PROJECT_ID&section=prd" -H "Authorization: Bearer $TOKEN"
elif [ "$ACTION" = "taste" ]; then
  curl -s "$API_URL/api/agent/project?projectId=$PROJECT_ID&section=taste-skill&skill=$TASK_ID" -H "Authorization: Bearer $TOKEN"
elif [ "$ACTION" = "validate" ]; then
  npx moryn validate-ui
elif [ "$ACTION" = "theme" ]; then
  npx moryn init-theme
fi
`;
    const shPath = path.join(morynDir, "sync");
    fs.writeFileSync(shPath, shScript, { mode: 0o755 });

    // Install Agent Skills into workspace (.agents/skills/moryn/SKILL.md & .agents/skills/frontend/SKILL.md)
    const skillsToInstall = [
      { name: "moryn", folder: "moryn" },
      { name: "frontend", folder: "frontend" },
    ];

    const installedSkillPaths: string[] = [];

    for (const skill of skillsToInstall) {
      const targetSkillDir = path.join(workspaceRoot, ".agents", "skills", skill.folder);
      const targetSkillFile = path.join(targetSkillDir, "SKILL.md");

      if (!fs.existsSync(targetSkillDir)) {
        fs.mkdirSync(targetSkillDir, { recursive: true });
      }

      let bundledSkillPath = path.resolve(__dirname, "..", "..", "skills", skill.folder, "SKILL.md");
      if (!fs.existsSync(bundledSkillPath) && skill.folder === "frontend") {
        bundledSkillPath = path.resolve(__dirname, "..", "..", "skills", "moryn", "frontend", "SKILL.md");
      }

      if (fs.existsSync(bundledSkillPath)) {
        const skillContentToWrite = fs.readFileSync(bundledSkillPath, "utf-8");
        fs.writeFileSync(targetSkillFile, skillContentToWrite, "utf-8");
        installedSkillPaths.push(targetSkillFile);
      } else if (skill.name === "moryn") {
        throw new Error(`BUNDLED_SKILL_MISSING: Bundled skill file not found at ${bundledSkillPath}. Reinstall the moryn package.`);
      }
    }

    let currentTask = null;
    try {
      const taskRes = await apiRequest(`/api/agent/tasks/current?projectId=${projectId}`);
      currentTask = taskRes.task;
    } catch { }

    if (options.json) {
      console.log(JSON.stringify({
        success: true,
        project: {
          id: project.id,
          appName: project.appName,
          target: targetDomain,
        },
        nativeHelpers: [path.join(morynDir, "sync.cmd"), shPath],
        localContext: path.join(morynDir, "context.md"),
        skillsInstalled: installedSkillPaths,
        currentTask,
      }));
    } else {
      console.log("\n==========================================");
      console.log("  Moryn CLI v2.13.0 - Project Initialized");
      console.log("==========================================");
      console.log(`  Project Name  : ${project.appName}`);
      console.log(`  Project ID    : ${project.id}`);
      console.log(`  Target Domain : ${targetDomain.toUpperCase()}`);
      console.log("  UI Framework  : Required -> shadcn/ui (@/components/ui/*)");
      console.log("  Local Context : Saved -> .moryn/context.md (3-Layer Hybrid)");
      console.log("  Modular Context: Saved -> .moryn/tokens.json & anti_slop_rules.md");
      console.log("  Native Helper : Generated -> .moryn/sync (10ms)");
      console.log("  Agent Skills  : Installed -> .agents/skills/moryn & frontend");
      console.log(`  Authentication: Connected (${statusRes.user?.email})`);
      console.log("  Kanban Sync   : Active");
      if (currentTask) {
        console.log(`\n  Current Task  : #${currentTask.id} ${currentTask.title} [Status: ${currentTask.status.toUpperCase()}]`);
      } else {
        console.log("\n  Current Task  : None pending.");
      }
      console.log("\nAI Agent is ready to work on tasks.\n");
    }
  } catch (err: any) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: err.message }));
    } else {
      console.error(`\n[ERROR] Initialization failed: ${err.message}\n`);
    }
    process.exit(1);
  }
}
