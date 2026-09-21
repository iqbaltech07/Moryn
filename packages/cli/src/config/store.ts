import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface GlobalConfig {
  token?: string;
  apiUrl?: string;
}

export interface ProjectConfig {
  projectId?: string;
  appName?: string;
  linkedAt?: string;
}

const GLOBAL_CONFIG_DIR = path.join(os.homedir(), ".moryn");
const GLOBAL_CONFIG_FILE = path.join(GLOBAL_CONFIG_DIR, "config.json");
const LEGACY_GLOBAL_CONFIG_FILE = path.join(os.homedir(), ".piardify", "config.json");

const PROJECT_CONFIG_DIR = path.join(process.cwd(), ".moryn");
const PROJECT_CONFIG_FILE = path.join(PROJECT_CONFIG_DIR, "project.json");
const LEGACY_PROJECT_CONFIG_FILE = path.join(process.cwd(), ".piardify", "project.json");

export function getGlobalConfig(): GlobalConfig {
  try {
    if (fs.existsSync(GLOBAL_CONFIG_FILE)) {
      const content = fs.readFileSync(GLOBAL_CONFIG_FILE, "utf-8");
      return JSON.parse(content);
    }
    if (fs.existsSync(LEGACY_GLOBAL_CONFIG_FILE)) {
      const content = fs.readFileSync(LEGACY_GLOBAL_CONFIG_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    // Ignore read errors
  }
  return {};
}

export function saveGlobalConfig(config: GlobalConfig): void {
  try {
    if (!fs.existsSync(GLOBAL_CONFIG_DIR)) {
      fs.mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true, mode: 0o700 });
    }
    const current = getGlobalConfig();
    const updated = { ...current, ...config };
    fs.writeFileSync(GLOBAL_CONFIG_FILE, JSON.stringify(updated, null, 2), { encoding: "utf-8", mode: 0o600 });
    try {
      if (process.platform !== "win32") {
        fs.chmodSync(GLOBAL_CONFIG_FILE, 0o600);
      }
    } catch {}
  } catch (e: any) {
    console.error("Failed to save global config:", e.message);
  }
}

export function getProjectConfig(): ProjectConfig {
  try {
    if (fs.existsSync(PROJECT_CONFIG_FILE)) {
      const content = fs.readFileSync(PROJECT_CONFIG_FILE, "utf-8");
      return JSON.parse(content);
    }
    if (fs.existsSync(LEGACY_PROJECT_CONFIG_FILE)) {
      const content = fs.readFileSync(LEGACY_PROJECT_CONFIG_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {}

  // Fallback: check environment variable
  if (process.env.MORYN_PROJECT_ID || process.env.PIARDIFY_PROJECT_ID) {
    return { projectId: process.env.MORYN_PROJECT_ID || process.env.PIARDIFY_PROJECT_ID };
  }
  return {};
}

export function saveProjectConfig(config: ProjectConfig): void {
  try {
    if (!fs.existsSync(PROJECT_CONFIG_DIR)) {
      fs.mkdirSync(PROJECT_CONFIG_DIR, { recursive: true });
    }
    const current = getProjectConfig();
    const updated = { ...current, ...config, linkedAt: new Date().toISOString() };
    fs.writeFileSync(PROJECT_CONFIG_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (e: any) {
    console.error("Failed to save project config:", e.message);
  }
}
