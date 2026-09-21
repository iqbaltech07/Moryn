import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import crypto from "crypto";
import {
  getStoredCustomKeys,
  saveStoredCustomKeys,
  getSanitizedUserKeys,
  testApiKey,
  CustomApiKeyData,
  AIKeyProvider,
} from "@/lib/ai/keyManager";
import { encryptText, maskApiKey } from "@/lib/utils/encryption";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = await getSanitizedUserKeys(session.user.id);
    return NextResponse.json({ keys });
  } catch (error: unknown) {
    console.error("Error fetching custom AI keys:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { provider, label, apiKey, preferredModel, skipValidation } = body as {
      provider?: AIKeyProvider;
      label?: string;
      apiKey?: string;
      preferredModel?: string;
      skipValidation?: boolean;
    };

    if (!provider || !["gemini", "openrouter"].includes(provider)) {
      return NextResponse.json({ error: "Invalid provider. Must be 'gemini' or 'openrouter'" }, { status: 400 });
    }

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 8) {
      return NextResponse.json({ error: "API Key must be at least 8 characters" }, { status: 400 });
    }

    const cleanKey = apiKey.trim();

    // Validate key against AI provider unless explicitly skipped
    if (!skipValidation) {
      const testResult = await testApiKey(provider, cleanKey);
      if (!testResult.success) {
        return NextResponse.json(
          {
            error: "API Key verification failed",
            details: testResult.error || "The key was rejected by the provider.",
          },
          { status: 422 }
        );
      }
    }

    const existingKeys = await getStoredCustomKeys(session.user.id);

    // Limit maximum keys per user to prevent abuse
    if (existingKeys.length >= 10) {
      return NextResponse.json({ error: "Maximum 10 custom API keys allowed per account." }, { status: 400 });
    }

    const encrypted = encryptText(cleanKey);
    const masked = maskApiKey(cleanKey);
    const id = crypto.randomUUID();

    const defaultModel =
      provider === "gemini" ? "gemini-3.7-flash" : "nvidia/nemotron-3-ultra-550b-a55b:free";

    const newKeyItem: CustomApiKeyData = {
      id,
      provider,
      label: label?.trim() || `${provider === "gemini" ? "Gemini" : "OpenRouter"} Key ${existingKeys.length + 1}`,
      encrypted: encrypted.encrypted,
      iv: encrypted.iv,
      tag: encrypted.tag,
      maskedKey: masked,
      isActive: true,
      priority: existingKeys.length + 1,
      preferredModel: preferredModel?.trim() || defaultModel,
      createdAt: new Date().toISOString(),
    };

    const updatedList = [...existingKeys, newKeyItem];
    await saveStoredCustomKeys(session.user.id, updatedList);

    const sanitized = await getSanitizedUserKeys(session.user.id);
    return NextResponse.json({ success: true, keys: sanitized, addedId: id });
  } catch (error: unknown) {
    console.error("Error adding custom AI key:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { updates, toggleId, reorder, updateModel } = body as {
      updates?: Array<{ id: string; label?: string; isActive?: boolean; priority?: number; preferredModel?: string }>;
      toggleId?: string;
      reorder?: Array<{ id: string; priority: number }>;
      updateModel?: { id: string; preferredModel: string };
    };

    let stored = await getStoredCustomKeys(session.user.id);

    if (updateModel) {
      stored = stored.map((k) =>
        k.id === updateModel.id ? { ...k, preferredModel: updateModel.preferredModel } : k
      );
    } else if (toggleId) {
      stored = stored.map((k) => (k.id === toggleId ? { ...k, isActive: !k.isActive } : k));
    } else if (reorder && Array.isArray(reorder)) {
      const priorityMap = new Map(reorder.map((r) => [r.id, r.priority]));
      stored = stored.map((k) => {
        if (priorityMap.has(k.id)) {
          return { ...k, priority: priorityMap.get(k.id)! };
        }
        return k;
      });
      stored.sort((a, b) => a.priority - b.priority);
    } else if (updates && Array.isArray(updates)) {
      const updateMap = new Map(updates.map((u) => [u.id, u]));
      stored = stored.map((k) => {
        const u = updateMap.get(k.id);
        if (u) {
          return {
            ...k,
            label: u.label !== undefined ? u.label : k.label,
            isActive: u.isActive !== undefined ? u.isActive : k.isActive,
            priority: u.priority !== undefined ? u.priority : k.priority,
            preferredModel: u.preferredModel !== undefined ? u.preferredModel : k.preferredModel,
          };
        }
        return k;
      });
    }

    await saveStoredCustomKeys(session.user.id, stored);
    const sanitized = await getSanitizedUserKeys(session.user.id);

    return NextResponse.json({ success: true, keys: sanitized });
  } catch (error: unknown) {
    console.error("Error updating custom AI keys:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ error: "Key ID is required" }, { status: 400 });
    }

    const stored = await getStoredCustomKeys(session.user.id);
    const filtered = stored.filter((k) => k.id !== id);

    // Reindex priority
    const reindexed = filtered.map((k, index) => ({
      ...k,
      priority: index + 1,
    }));

    await saveStoredCustomKeys(session.user.id, reindexed);
    const sanitized = await getSanitizedUserKeys(session.user.id);

    return NextResponse.json({ success: true, keys: sanitized });
  } catch (error: unknown) {
    console.error("Error deleting custom AI key:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
