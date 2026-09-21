import { getProjectConfig } from "../config/store.js";
import { apiRequest } from "../api/client.js";

export async function taskCommand(
  action?: string,
  taskId?: string,
  options: { project?: string; status?: string; force?: boolean; reason?: string; json?: boolean } = {}
) {
  try {
    const projectId = options.project || getProjectConfig().projectId;

    if (!projectId) {
      throw new Error("NO_PROJECT_LINKED: Run 'npx moryn init' or specify '--project <projectId>' first.");
    }

    const act = (action || "current").toLowerCase();

    if (act === "current") {
      const res = await apiRequest(`/api/agent/tasks/current?projectId=${projectId}`);
      if (options.json) {
        console.log(JSON.stringify(res, null, 2));
      } else if (!res.task) {
        console.log("\nNo active task found.");
      } else {
        const t = res.task;
        const isCheckpoint = t.isCheckpoint || t.title?.includes("[CHECKPOINT]");
        
        console.log(`\nTask #${t.id}`);
        if (isCheckpoint) {
          console.log(`🛑 === MANDATORY CHECKPOINT (AI AGENT MUST STOP & REQUEST USER REVIEW) ===`);
        }
        console.log(`Title              : ${t.title}`);
        console.log(`Status             : ${t.status?.toUpperCase()}`);
        console.log(`Category           : ${t.category || "-"}`);
        console.log(`Description        : ${t.description || "-"}`);
        if (t.definitionOfDone) {
          console.log(`Definition of Done : ${t.definitionOfDone}`);
        }
        if (t.acceptanceCriteria && Array.isArray(t.acceptanceCriteria)) {
          console.log("Acceptance Criteria:");
          t.acceptanceCriteria.forEach((ac: string) => console.log(`  - ${ac}`));
        }
        if (isCheckpoint) {
          console.log(`🛑 MANDATORY: Present completed work to user and wait for explicit approval before proceeding.`);
        }
        console.log("");
      }
      return;
    }

    if (act === "list") {
      const statusQuery = options.status ? `&status=${options.status}` : "";
      const res = await apiRequest(`/api/agent/tasks?projectId=${projectId}${statusQuery}`);
      if (options.json) {
        console.log(JSON.stringify(res, null, 2));
      } else {
        console.log(`\n--- Tasks List (${res.totalCount || 0} total) ---`);
        (res.tasks || []).forEach((t: any) => {
          console.log(`[${t.status.toUpperCase()}] #${t.id}: ${t.title}`);
        });
        console.log("");
      }
      return;
    }

    if (act === "get") {
      const idToFetch = taskId || options.status;
      if (!idToFetch) {
        throw new Error("MISSING_TASK_ID: Specify task ID. Example: npx moryn task get 42");
      }
      const res = await apiRequest(`/api/agent/tasks/${idToFetch}?projectId=${projectId}`);
      if (options.json) {
        console.log(JSON.stringify(res, null, 2));
      } else {
        console.log(JSON.stringify(res.task, null, 2));
      }
      return;
    }

    if (act === "start") {
      if (!taskId) {
        throw new Error("MISSING_TASK_ID: Specify task ID. Example: npx moryn task start 42");
      }
      const res = await apiRequest(`/api/agent/tasks/${taskId}/start`, {
        method: "POST",
        body: { projectId },
      });
      if (options.json) {
        console.log(JSON.stringify(res));
      } else {
        console.log(`\n[SUCCESS] Task #${taskId} status updated to IN_PROGRESS\n`);
      }
      return;
    }

    if (act === "complete") {
      if (!taskId) {
        throw new Error("MISSING_TASK_ID: Specify task ID. Example: npx moryn task complete 42");
      }
      const res = await apiRequest(`/api/agent/tasks/${taskId}/complete`, {
        method: "POST",
        body: { projectId, force: options.force },
      });
      if (options.json) {
        console.log(JSON.stringify(res));
      } else {
        console.log(`\n[SUCCESS] Task #${taskId} status updated to DONE\n`);
      }
      return;
    }

    if (act === "fail") {
      if (!taskId) {
        throw new Error("MISSING_TASK_ID: Specify task ID. Example: npx moryn task fail 42");
      }
      const res = await apiRequest(`/api/agent/tasks/${taskId}/fail`, {
        method: "POST",
        body: { projectId, reason: options.reason },
      });
      if (options.json) {
        console.log(JSON.stringify(res));
      } else {
        console.log(`\n[WARNING] Task #${taskId} status updated to FAILED\n`);
      }
      return;
    }

    if (act === "update") {
      if (!taskId) {
        throw new Error("MISSING_TASK_ID: Specify task ID. Example: npx moryn task update 42 --status done");
      }
      const res = await apiRequest(`/api/agent/tasks/${taskId}`, {
        method: "PATCH",
        body: { projectId, status: options.status || "in_progress" },
      });
      if (options.json) {
        console.log(JSON.stringify(res));
      } else {
        console.log(`\n[SUCCESS] Task #${taskId} status updated to ${options.status || "in_progress"}\n`);
      }
      return;
    }

    throw new Error(`UNKNOWN_ACTION: '${act}'. Valid actions: current, list, get, start, complete, fail, update`);
  } catch (err: any) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: err.message }));
    } else {
      console.error(`\n❌ Task command failed: ${err.message}\n`);
    }
    process.exit(1);
  }
}
