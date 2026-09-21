"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusCommand = statusCommand;
const store_js_1 = require("../config/store.js");
const client_js_1 = require("../api/client.js");
async function statusCommand(options) {
    try {
        const projectConfig = (0, store_js_1.getProjectConfig)();
        const projectId = projectConfig.projectId;
        const endpoint = projectId ? `/api/agent/status?projectId=${projectId}` : "/api/agent/status";
        const res = await (0, client_js_1.apiRequest)(endpoint);
        if (options.json) {
            console.log(JSON.stringify(res));
        }
        else {
            console.log("\nMoryn Status");
            console.log("──────────────");
            console.log(`Authenticated: yes (${res.user?.email})`);
            console.log(`User         : ${res.user?.name || res.user?.email}`);
            console.log(`Project      : ${res.project?.appName || projectConfig.appName || "None linked"}`);
            console.log(`API          : connected`);
            console.log("");
        }
    }
    catch (err) {
        if (options.json) {
            console.log(JSON.stringify({ success: false, error: err.message }));
        }
        else {
            console.error(`\n❌ Status check failed: ${err.message}\n`);
        }
        process.exit(1);
    }
}
