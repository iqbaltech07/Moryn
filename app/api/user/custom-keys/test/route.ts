import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { testApiKey, AIKeyProvider, getStoredCustomKeys } from "@/lib/ai/keyManager";
import { decryptText } from "@/lib/utils/encryption";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { provider, apiKey, keyId } = body as {
      provider?: AIKeyProvider;
      apiKey?: string;
      keyId?: string;
    };

    let resolvedKey = apiKey?.trim();
    let resolvedProvider = provider;

    // If keyId is provided, test existing stored key
    if (keyId && !resolvedKey) {
      const stored = await getStoredCustomKeys(session.user.id);
      const found = stored.find((k) => k.id === keyId);
      if (!found) {
        return NextResponse.json({ error: "Key not found" }, { status: 404 });
      }
      resolvedProvider = found.provider;
      resolvedKey = decryptText({
        encrypted: found.encrypted,
        iv: found.iv,
        tag: found.tag,
      });
    }

    if (!resolvedProvider || !["gemini", "openrouter"].includes(resolvedProvider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    if (!resolvedKey) {
      return NextResponse.json({ error: "API Key or Key ID is required" }, { status: 400 });
    }

    const result = await testApiKey(resolvedProvider, resolvedKey);

    if (result.success) {
      return NextResponse.json({ success: true, message: "Connection successful!" });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Connection failed. Please check the API key.",
        },
        { status: 422 }
      );
    }
  } catch (error: unknown) {
    console.error("Error testing custom AI key:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
