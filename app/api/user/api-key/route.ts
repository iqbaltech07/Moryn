import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";
import { generateApiKey, hashApiKey } from "@/lib/auth/apiKey";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { apiKey: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has an active key (hashed or legacy)
    const hasApiKey = Boolean(user.apiKey);

    return NextResponse.json({ 
      hasApiKey,
      // If legacy plaintext is still in DB, return it, otherwise indicate existence
      apiKey: user.apiKey && user.apiKey.startsWith("piar_live_") ? user.apiKey : null
    });
  } catch (error: any) {
    console.error("Error fetching API Key:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawApiKey = generateApiKey();
    const hashed = hashApiKey(rawApiKey);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { apiKey: hashed },
    });

    // Return the raw key once to the client for display/copy
    return NextResponse.json({ hasApiKey: true, apiKey: rawApiKey });
  } catch (error: any) {
    console.error("Error regenerating API Key:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}