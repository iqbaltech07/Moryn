#!/usr/bin/env node

import { loginCommand } from "./commands/login.js";
import { initCommand } from "./commands/init.js";
import { statusCommand } from "./commands/status.js";
import { projectCommand } from "./commands/project.js";
import { taskCommand } from "./commands/task.js";
import { kanbanCommand } from "./commands/kanban.js";
import { validateCommand } from "./commands/validate.js";
import { cleanCommand } from "./commands/clean.js";
import { themeCommand } from "./commands/theme.js";
import { hookCommand } from "./commands/hook.js";
import { generateCommand } from "./commands/generate.js";
import { designCommand } from "./commands/design.js";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] ? args[0].toLowerCase() : "help";

  const options: Record<string, any> = {
    json: args.includes("--json"),
    quiet: args.includes("--quiet"),
    force: args.includes("--force"),
    fix: args.includes("--fix") || !args.includes("--dry-run"),
    dryRun: args.includes("--dry-run"),
  };

  // Resilient multi-format flag parser (--flag value & --flag=value)
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--")) {
      const parts = arg.slice(2).split("=");
      const key = parts[0];
      const inlineVal = parts.length > 1 ? parts.slice(1).join("=") : undefined;

      if (inlineVal !== undefined) {
        options[key] = inlineVal;
      } else if (args[i + 1] && !args[i + 1].startsWith("--")) {
        options[key] = args[i + 1];
      }
    }
  }

  // Filter positional arguments (exclude flags and flag values)
  const positionalArgs: string[] = [];
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--")) {
      if (!a.includes("=") && args[i + 1] && !args[i + 1].startsWith("--")) {
        i++; // skip next arg as it's the flag value
      }
      continue;
    }
    positionalArgs.push(a);
  }

  switch (command) {
    case "clean":
    case "prune":
    case "clean-code":
      await cleanCommand(options);
      break;

    case "login":
    case "sync":
    case "auth":
      await loginCommand(options);
      break;

    case "init":
      await initCommand(options);
      break;

    case "status":
      await statusCommand(options);
      break;

    case "project":
      await projectCommand(positionalArgs[0], options);
      break;

    case "design":
    case "design-context":
      await designCommand(options);
      break;

    case "task":
      await taskCommand(positionalArgs[0], positionalArgs[1], options);
      break;

    case "kanban":
      await kanbanCommand(options);
      break;

    case "validate-ui":
    case "validate":
    case "validate-mobile":
    case "validate-hardware":
    case "validate-api":
      await validateCommand(options);
      break;

    case "init-theme":
    case "theme":
      await themeCommand(options);
      break;

    case "hook":
      await hookCommand(options);
      break;

    case "scaffold":
    case "generate":
      await generateCommand(positionalArgs[0], positionalArgs[1], options);
      break;

    case "help":
    case "-h":
    case "--help":
    default:
      if (options.json) {
        console.log(JSON.stringify({
          name: "moryn-cli",
          version: "3.0.1",
          commands: ["login", "init", "status", "project", "design", "task", "kanban", "validate-ui", "clean", "init-theme", "hook", "scaffold", "generate"],
        }));
      } else {
        console.log("\n  Moryn AI Agent CLI v3.0.1 (Anti-Slop Architecture)");
        console.log("  ==========================");
        console.log("  Usage: npx moryn-cli <command> [options]\n");
        console.log("  Core Developer & Scaffolding Commands:");
        console.log("    npx moryn-cli scaffold <Name> [--type <hero|bento|card|table|form|modal>]");
        console.log("    npx moryn-cli generate <Name> [--type <hero|bento|card|table|form|modal>]");
        console.log("    npx moryn-cli login --token <TOKEN>         Save auth token");
        console.log("    npx moryn-cli init [--target web|mobile...] Connect project & setup Agent Skill");
        console.log("    npx moryn-cli status                        Display health & connection status\n");
        console.log("  Anti-Slop Visual Governance & Tooling:");
        console.log("    npx moryn-cli design                        Fetch design context & tokens");
        console.log("    npx moryn-cli validate-ui                   Run AST Anti-Slop Linter on workspace");
        console.log("    npx moryn-cli clean                         Automatically prune unused components & dead code");
        console.log("    npx moryn-cli init-theme                    Generate Tailwind preset & CSS tokens");
        console.log("    npx moryn-cli hook                          Install Git pre-commit & build hooks\n");
        console.log("  AI Agent Task Commands:");
        console.log("    npx moryn-cli project [tokens|rules|prd...] Fetch modular context or full hybrid");
        console.log("    npx moryn-cli task <action> [id]            Task lifecycle (list, current, start, complete, fail)");
        console.log("    npx moryn-cli kanban                        Fetch full Kanban board state\n");
        console.log("  Flags:");
        console.log("    --type <hero|bento|card|table|form|modal>  Component archetype type");
        console.log("    --target <web|mobile|iot|backend>          Specify multi-domain target ecosystem");
        console.log("    --json                                    Machine-readable JSON output");
        console.log("    --project <id>                            Specify project ID explicitly");
        console.log("    --dry-run                                 Check unused code without deleting");
        console.log("    --force                                   Force state transitions\n");
      }
      break;
  }
}

main().catch((err) => {
  console.error("CLI Execution Error:", err.message);
  process.exit(1);
});
