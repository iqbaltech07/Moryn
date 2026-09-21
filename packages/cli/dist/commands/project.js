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
exports.projectCommand = projectCommand;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const store_js_1 = require("../config/store.js");
const client_js_1 = require("../api/client.js");
async function projectCommand(section, options = {}) {
    try {
        const workspaceRoot = process.cwd();
        const morynDir = path.join(workspaceRoot, ".moryn");
        const legacyPiardifyDir = path.join(workspaceRoot, ".piardify");
        let sec = (section || "overview").toLowerCase();
        // Check local modular files first
        if (sec === "tokens") {
            let tokensFile = path.join(morynDir, "tokens.json");
            if (!fs.existsSync(tokensFile))
                tokensFile = path.join(legacyPiardifyDir, "tokens.json");
            if (fs.existsSync(tokensFile)) {
                const tokens = JSON.parse(fs.readFileSync(tokensFile, "utf-8"));
                console.log(options.json ? JSON.stringify(tokens) : JSON.stringify(tokens, null, 2));
                return;
            }
        }
        if (sec === "rules") {
            let rulesFile = path.join(morynDir, "anti_slop_rules.md");
            if (!fs.existsSync(rulesFile))
                rulesFile = path.join(legacyPiardifyDir, "anti_slop_rules.md");
            if (fs.existsSync(rulesFile)) {
                const rules = fs.readFileSync(rulesFile, "utf-8");
                console.log(rules);
                return;
            }
        }
        const projectId = options.project || (0, store_js_1.getProjectConfig)().projectId;
        if (!projectId) {
            throw new Error("NO_PROJECT_LINKED: Run 'npx moryn init' or specify '--project <projectId>' first.");
        }
        if (sec === "current")
            sec = "overview";
        let url = `/api/agent/project?projectId=${projectId}&section=${sec}`;
        if (options.skill) {
            url += `&skill=${encodeURIComponent(options.skill)}`;
        }
        // section=context returns the hybrid format as plain text (not JSON),
        // so it must be fetched raw and printed verbatim.
        const isContext = sec === "context";
        const res = await (0, client_js_1.apiRequest)(url, { rawText: isContext });
        if (isContext) {
            console.log(res);
        }
        else if (options.json) {
            console.log(JSON.stringify(res, null, 2));
        }
        else {
            console.log(`\n--- Moryn Project [${sec.toUpperCase()}] ---`);
            if (sec === "prd") {
                console.log(res.prd || "No PRD content found.");
            }
            else {
                console.log(JSON.stringify(res, null, 2));
            }
            console.log("");
        }
    }
    catch (err) {
        if (options.json) {
            console.log(JSON.stringify({ success: false, error: err.message }));
        }
        else {
            console.error(`\n❌ Project command failed: ${err.message}\n`);
        }
        process.exit(1);
    }
}
