import * as readline from "readline";
import { saveGlobalConfig } from "../config/store.js";
import { apiRequest } from "../api/client.js";

function promptInput(query: string): Promise<string> {
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

export async function loginCommand(options: { token?: string; key?: string; url?: string; json?: boolean }) {
  let token = options.token?.trim() || options.key?.trim() || process.env.MORYN_API_KEY?.trim() || process.env.PIARDIFY_API_KEY?.trim();

  if (!token && !options.json && process.stdin.isTTY) {
    console.log("\n  Moryn CLI Login");
    console.log("  ==================");
    token = await promptInput("  Enter your Moryn API Key: ");
  }

  if (!token) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: "Missing --token argument or API Key input." }));
    } else {
      console.error("\n[ERROR] Token is required.\nUsage: npx moryn login --token <YOUR_MORYN_API_KEY>\n");
    }
    process.exit(1);
  }

  const apiUrl = options.url?.trim();
  const configToSave: any = { token };
  if (apiUrl) {
    configToSave.apiUrl = apiUrl;
  }

  try {
    const res = await apiRequest("/api/agent/status", { token, apiUrl });

    saveGlobalConfig(configToSave);

    if (options.json) {
      console.log(JSON.stringify({ success: true, user: res.user, status: "authenticated" }));
    } else {
      console.log("\n==========================================");
      console.log("  Moryn CLI - Authentication Success");
      console.log("==========================================");
      console.log(`  User  : ${res.user?.name || "Authenticated User"} (${res.user?.email})`);
      console.log("  Status: Connected");
      console.log("\nNext step: Run 'npx moryn init' in your project directory.\n");
    }
  } catch (err: any) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: err.message }));
    } else {
      console.error(`\n[ERROR] Authentication failed: ${err.message}\n`);
    }
    process.exit(1);
  }
}
