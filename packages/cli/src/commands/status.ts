import { getProjectConfig } from "../config/store.js";
import { apiRequest } from "../api/client.js";

export async function statusCommand(options: { json?: boolean }) {
  try {
    const projectConfig = getProjectConfig();
    const projectId = projectConfig.projectId;

    const endpoint = projectId ? `/api/agent/status?projectId=${projectId}` : "/api/agent/status";
    const res = await apiRequest(endpoint);

    if (options.json) {
      console.log(JSON.stringify(res));
    } else {
      console.log("\nMoryn Status");
      console.log("──────────────");
      console.log(`Authenticated: yes (${res.user?.email})`);
      console.log(`User         : ${res.user?.name || res.user?.email}`);
      console.log(`Project      : ${res.project?.appName || projectConfig.appName || "None linked"}`);
      console.log(`API          : connected`);
      console.log("");
    }
  } catch (err: any) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: err.message }));
    } else {
      console.error(`\n❌ Status check failed: ${err.message}\n`);
    }
    process.exit(1);
  }
}
