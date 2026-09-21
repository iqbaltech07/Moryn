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
exports.getGlobalConfig = getGlobalConfig;
exports.saveGlobalConfig = saveGlobalConfig;
exports.getProjectConfig = getProjectConfig;
exports.saveProjectConfig = saveProjectConfig;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const GLOBAL_CONFIG_DIR = path.join(os.homedir(), ".moryn");
const GLOBAL_CONFIG_FILE = path.join(GLOBAL_CONFIG_DIR, "config.json");
const LEGACY_GLOBAL_CONFIG_FILE = path.join(os.homedir(), ".piardify", "config.json");
const PROJECT_CONFIG_DIR = path.join(process.cwd(), ".moryn");
const PROJECT_CONFIG_FILE = path.join(PROJECT_CONFIG_DIR, "project.json");
const LEGACY_PROJECT_CONFIG_FILE = path.join(process.cwd(), ".piardify", "project.json");
function getGlobalConfig() {
    try {
        if (fs.existsSync(GLOBAL_CONFIG_FILE)) {
            const content = fs.readFileSync(GLOBAL_CONFIG_FILE, "utf-8");
            return JSON.parse(content);
        }
        if (fs.existsSync(LEGACY_GLOBAL_CONFIG_FILE)) {
            const content = fs.readFileSync(LEGACY_GLOBAL_CONFIG_FILE, "utf-8");
            return JSON.parse(content);
        }
    }
    catch (e) {
        // Ignore read errors
    }
    return {};
}
function saveGlobalConfig(config) {
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
        }
        catch { }
    }
    catch (e) {
        console.error("Failed to save global config:", e.message);
    }
}
function getProjectConfig() {
    try {
        if (fs.existsSync(PROJECT_CONFIG_FILE)) {
            const content = fs.readFileSync(PROJECT_CONFIG_FILE, "utf-8");
            return JSON.parse(content);
        }
        if (fs.existsSync(LEGACY_PROJECT_CONFIG_FILE)) {
            const content = fs.readFileSync(LEGACY_PROJECT_CONFIG_FILE, "utf-8");
            return JSON.parse(content);
        }
    }
    catch (e) { }
    // Fallback: check environment variable
    if (process.env.MORYN_PROJECT_ID || process.env.PIARDIFY_PROJECT_ID) {
        return { projectId: process.env.MORYN_PROJECT_ID || process.env.PIARDIFY_PROJECT_ID };
    }
    return {};
}
function saveProjectConfig(config) {
    try {
        if (!fs.existsSync(PROJECT_CONFIG_DIR)) {
            fs.mkdirSync(PROJECT_CONFIG_DIR, { recursive: true });
        }
        const current = getProjectConfig();
        const updated = { ...current, ...config, linkedAt: new Date().toISOString() };
        fs.writeFileSync(PROJECT_CONFIG_FILE, JSON.stringify(updated, null, 2), "utf-8");
    }
    catch (e) {
        console.error("Failed to save project config:", e.message);
    }
}
