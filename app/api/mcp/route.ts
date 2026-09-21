import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      jsonrpc: "2.0",
      error: {
        code: -32600,
        message: "The MCP protocol endpoint (/api/mcp) has been deprecated and removed. Please migrate to Moryn NPX CLI & Agent Skill via 'npx moryn login --token <TOKEN>' and 'npx moryn init'. API endpoints are available at /api/agent/*.",
      },
      id: null,
    },
    {
      status: 410,
      headers: {
        "X-Moryn-Deprecated": "MCP protocol is permanently removed. Migrate to 'npx moryn init'.",
      },
    }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: "MCP protocol endpoint is deprecated and removed. Please migrate to 'npx moryn init' and Moryn REST API (/api/agent/*).",
    },
    { status: 410 }
  );
}
