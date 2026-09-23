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
exports.loginCommand = loginCommand;
const readline = __importStar(require("readline"));
const store_js_1 = require("../config/store.js");
const client_js_1 = require("../api/client.js");
function promptInput(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans.trim());
        });
    });
}
async function loginCommand(options) {
    let token = options.token?.trim() || options.key?.trim() || process.env.MORYN_API_KEY?.trim() || process.env.PIARDIFY_API_KEY?.trim();
    if (!token && !options.json && process.stdin.isTTY) {
        console.log("\n  Moryn CLI Login");
        console.log("  ==================");
        token = await promptInput("  Enter your Moryn API Key: ");
    }
    if (!token) {
        if (options.json) {
            console.log(JSON.stringify({ success: false, error: "Missing --token argument or API Key input." }));
        }
        else {
            console.error("\n[ERROR] Token is required.\nUsage: npx moryn-cli login --token <YOUR_MORYN_API_KEY>\n");
        }
        process.exit(1);
    }
    const apiUrl = options.url?.trim();
    const configToSave = { token };
    if (apiUrl) {
        configToSave.apiUrl = apiUrl;
    }
    try {
        const res = await (0, client_js_1.apiRequest)("/api/agent/status", { token, apiUrl });
        (0, store_js_1.saveGlobalConfig)(configToSave);
        if (options.json) {
            console.log(JSON.stringify({ success: true, user: res.user, status: "authenticated" }));
        }
        else {
            console.log("\n==========================================");
            console.log("  Moryn CLI - Authentication Success");
            console.log("==========================================");
            console.log(`  User  : ${res.user?.name || "Authenticated User"} (${res.user?.email})`);
            console.log("  Status: Connected");
            console.log("\nNext step: Run 'npx moryn-cli init' in your project directory.\n");
        }
    }
    catch (err) {
        if (options.json) {
            console.log(JSON.stringify({ success: false, error: err.message }));
        }
        else {
            console.error(`\n[ERROR] Authentication failed: ${err.message}\n`);
        }
        process.exit(1);
    }
}
