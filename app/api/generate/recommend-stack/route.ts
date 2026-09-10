import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { FastApiClient } from "@/lib/ai/fastapiClient";

export const maxDuration = 45;

function getFallbackRecommendation(appIdea: string) {
  const isMobile = /mobile|android|ios|flutter|react native|smartphone|apk/i.test(appIdea);
  const isIot = /iot|esp32|arduino|sensor|hardware|mqtt|device/i.test(appIdea);
  const isVanilla = /vanilla|html|css|javascript|no db|simple web|tugas kuliah/i.test(appIdea);

  if (isMobile) {
    return {
      stacks: {
        frontend: "Flutter (Dart)",
        backend: "Firebase Cloud Functions",
        database: "Firebase Firestore",
        deployment: "Google Play & App Store",
      },
      paletteId: "electric-emerald",
      badge: "Mobile Native",
      reasoning: "Flutter dan Firebase memberikan performa cross-platform native dengan backend real-time tanpa setup server rumit.",
    };
  }

  if (isIot) {
    return {
      stacks: {
        frontend: "Embedded C/C++ (ESP32)",
        backend: "Node.js (MQTT Broker)",
        database: "InfluxDB / TimescaleDB",
        deployment: "PlatformIO / OTA",
      },
      paletteId: "amber-cyber",
      badge: "IoT & Hardware",
      reasoning: "ESP32 dengan protokol MQTT dan time-series database sangat ideal untuk transmisi telemetri sensor latensi rendah.",
    };
  }

  if (isVanilla) {
    return {
      stacks: {
        frontend: "HTML5 / Vanilla JS",
        backend: "None (Client-Side Only)",
        database: "LocalStorage / IndexedDB",
        deployment: "GitHub Pages",
      },
      paletteId: "ocean-indigo",
      badge: "Zero Backend",
      reasoning: "Arsitektur client-side ringan menggunakan LocalStorage tanpa dependensi backend atau biaya database.",
    };
  }

  return {
    stacks: {
      frontend: "Next.js",
      backend: "Next.js (API Routes)",
      database: "PostgreSQL",
      deployment: "Vercel",
    },
    paletteId: "amber-cyber",
    badge: "Most Recommended",
    reasoning: "Next.js Fullstack dengan App Router dan Postgres memberikan skalabilitas tinggi, SEO optimal, dan deployment instan.",
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { appName, appIdea } = body;

    if (!appIdea || appIdea.length < 10) {
      return NextResponse.json({ error: "App idea is required" }, { status: 400 });
    }

    // Call FastAPI AI Engine
    try {
      const res = await FastApiClient.recommendStack({ appName, appIdea });
      if (res && res.stacks) {
        return NextResponse.json({
          success: true,
          recommendation: res,
        });
      }
    } catch (err: unknown) {
      console.warn("[RecommendStack] FastAPI AI Engine call failed, falling back to smart defaults:", err);
    }

    // Keyword-based fallback
    return NextResponse.json({
      success: true,
      recommendation: getFallbackRecommendation(appIdea),
    });
  } catch (error: unknown) {
    console.error("Error recommending stack:", error);
    const msg = error instanceof Error ? error.message : "Failed to recommend stack";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
