import { getGlobalConfig } from "../config/store.js";
import { DEFAULT_API_URL } from "../config/constants.js";

export async function apiRequest(endpoint: string, options: { method?: string; body?: any; token?: string; apiUrl?: string; rawText?: boolean } = {}): Promise<any> {
  const globalConfig = getGlobalConfig();
  const token = options.token || globalConfig.token || process.env.MORYN_API_KEY || process.env.PIARDIFY_API_KEY || "";
  const baseUrl = (options.apiUrl || globalConfig.apiUrl || DEFAULT_API_URL).replace(/\/$/, "");

  if (!token && !endpoint.includes("/api/agent/status")) {
    throw new Error("NOT_AUTHENTICATED: Please run 'npx moryn login --token <TOKEN>' first.");
  }

  const url = `${baseUrl}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method: options.method || "GET",
    headers,
  };
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, fetchOptions);

    // Return raw text for hybrid context format responses
    if (options.rawText) {
      if (!res.ok) {
        throw new Error(`API_ERROR_${res.status}: ${res.statusText || "Request failed"}`);
      }
      return await res.text();
    }

    const data: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.error?.message || data.error || res.statusText || "Request failed";
      throw new Error(`API_ERROR_${res.status}: ${msg}`);
    }
    return data;
  } catch (err: any) {
    if (err.message?.startsWith("API_ERROR_") || err.message?.startsWith("NOT_AUTHENTICATED")) {
      throw err;
    }
    throw new Error(`NETWORK_ERROR: Unable to connect to Moryn API at ${baseUrl}. ${err.message}`);
  }
}
