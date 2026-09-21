"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kanbanCommand = kanbanCommand;
const store_js_1 = require("../config/store.js");
const client_js_1 = require("../api/client.js");
async function kanbanCommand(options = {}) {
    try {
        const projectId = options.project || (0, store_js_1.getProjectConfig)().projectId;
        if (!projectId) {
            throw new Error("NO_PROJECT_LINKED: Run 'npx moryn init' or specify '--project <projectId>' first.");
        }
        const res = await (0, client_js_1.apiRequest)(`/api/agent/kanban?projectId=${projectId}`);
        if (options.json) {
            console.log(JSON.stringify(res, null, 2));
        }
        else {
            console.log("\n==========================================");
            console.log(`  Kanban Board - ${res.appName || "Project"}`);
            console.log("==========================================");
            console.log(`  Summary: ${res.summary?.total || 0} Total | ${res.summary?.todo || 0} Todo | ${res.summary?.in_progress || 0} In Progress | ${res.summary?.done || 0} Done | ${res.summary?.failed || 0} Failed\n`);
            const cols = res.columns || {};
            Object.keys(cols).forEach((colName) => {
                const list = cols[colName] || [];
                console.log(`  * ${colName.toUpperCase()} (${list.length}):`);
                list.forEach((t) => console.log(`     - #${t.id} ${t.title}`));
            });
            console.log("");
        }
    }
    catch (err) {
        if (options.json) {
            console.log(JSON.stringify({ success: false, error: err.message }));
        }
        else {
            console.error(`\n[ERROR] Kanban command failed: ${err.message}\n`);
        }
        process.exit(1);
    }
}
