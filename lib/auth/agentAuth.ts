import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashApiKey } from "@/lib/auth/apiKey";

export interface AgentAuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    apiKey: string | null;
  } | null;
  error?: string;
  statusCode?: number;
}

/**
 * Authenticates an agent (CLI) request using the SHA-256 hashed API key.
 *
 * The plaintext key is never stored. Lookup is done via `hashApiKey(token)`.
 * A legacy fallback also matches against any pre-migration plaintext keys and
 * transparently re-hashes them on the fly so existing CLI users keep working.
 */
export async function authenticateAgentRequest(req: NextRequest): Promise<AgentAuthResult> {
  const authHeader = req.headers.get("authorization");
  let token = "";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else {
    const url = new URL(req.url);
    token = url.searchParams.get("apiKey") || "";
  }

  if (!token) {
    return { user: null, error: "Missing API Key token in Authorization header or apiKey parameter.", statusCode: 401 };
  }

  const hashed = hashApiKey(token);

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { apiKey: token },
        { apiKey: hashed },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      apiKey: true,
    },
  });

  if (!user) {
    return { user: null, error: "Invalid API Key token.", statusCode: 401 };
  }

  // Lazy migration: if the DB still had the plaintext key, transparently re-hash it now
  if (user.apiKey === token && token !== hashed) {
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { apiKey: hashed },
      });
    } catch {
      // Non-critical; lookup succeeded regardless
    }
  }

  return { user };
}
