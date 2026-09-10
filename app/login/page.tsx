"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "@/lib/auth/auth-client";
import { Loader2, ArrowLeft, FileText, Gauge, Target, Download, Bot, Gift } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const FEATURES = [
  { icon: <Gauge size={14} />, label: "Generate in under 3 minutes" },
  { icon: <Target size={14} />, label: "7-step anti-hallucination flow" },
  { icon: <Download size={14} />, label: "Export clean Markdown PRD" },
  { icon: <Bot size={14} />, label: "AI-powered tech stack recommendations" },
];

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn.social({ provider: "google", callbackURL: "/dashboard" });
    } catch (err) {
      setError("Sign-in failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", overflow: "hidden", background: "var(--color-ink)" }}>

      {/* ── Left branding panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: "46%",
          flexShrink: 0,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 56px",
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-hairline)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Drafting grid */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
            <Image src="/logo/Moryn-Light-Mode.webp" alt="Moryn" width={800} height={200} style={{ height: "48px", width: "auto" }} />
          </Link>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Category annotation */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            border: "1px solid var(--border-hairline)",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--color-signal)",
            marginBottom: 20,
          }}>
            <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "var(--color-signal)" }} />
            AI-Powered PRD Generator
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.75rem, 2.8vw, 2.4rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            color: "var(--fg-primary)",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}>
            Ship products faster with{" "}
            <span style={{ color: "var(--color-signal)" }}>structured PRDs</span>
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--color-mist)", lineHeight: 1.7, marginBottom: 36, maxWidth: 380 }}>
            Sign in to generate professional Product Requirements Documents in under 3 minutes — no experience needed.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 32, height: 32,
                  border: "1px solid var(--border-hairline)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-elevated)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--color-circuit)",
                  flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--fg-secondary)", fontWeight: 500 }}>
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div style={{
          position: "relative", zIndex: 1,
          padding: "18px 20px",
          border: "1px solid var(--border-hairline)",
          borderRadius: "var(--radius-lg)",
          background: "var(--bg-elevated)",
        }}>
          {/* Quote mark */}
          <div style={{ fontFamily: "var(--font-display)", fontSize: "32px", color: "var(--color-signal)", lineHeight: 1, marginBottom: 8, opacity: 0.7 }}>"</div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--fg-secondary)", lineHeight: 1.65, marginBottom: 14 }}>
            Moryn saved me hours of documentation work. Got a full PRD for my capstone project in just 2 minutes.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-hairline)",
              background: "var(--bg-base)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "11px", color: "var(--color-signal)",
            }}>R</div>
            <div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color: "var(--fg-primary)", margin: 0 }}>Rafi A.</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-muted)", margin: 0, letterSpacing: "0.04em" }}>IT Student, Universitas Brawijaya</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative" }}>
        {/* Grid background */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
          backgroundSize: "40px 40px", pointerEvents: "none",
        }} />

        {/* Mobile logo */}
        <div className="lg:hidden" style={{ marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
            <Image src="/logo/Moryn-Light-Mode.webp" alt="Moryn" width={800} height={200} style={{ height: "44px", width: "auto" }} />
          </Link>
        </div>

        <div style={{ width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}>
          {/* Card */}
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-hairline)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}>
            {/* Signal top rule */}
            <div aria-hidden="true" style={{ height: 2, background: "var(--color-signal)" }} />

            <div style={{ padding: "36px 32px" }}>
              {/* Header */}
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "3px 10px",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: "var(--radius-xs)",
                  fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "var(--color-signal)", marginBottom: 14,
                }}>
                  <FileText size={10} />
                  Moryn · PRD Generator
                </div>
                <h2 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "22px", fontWeight: 800,
                  color: "var(--fg-primary)", marginBottom: 6, lineHeight: 1.2,
                }}>
                  Welcome to Moryn
                </h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-mist)", lineHeight: 1.6 }}>
                  Sign in to generate, manage, and export your PRDs.
                </p>
              </div>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ flex: 1, height: 1, background: "var(--border-hairline)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--fg-muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Continue with
                </span>
                <div style={{ flex: 1, height: 1, background: "var(--border-hairline)" }} />
              </div>

              {/* Google Button */}
              <button
                id="login-google-btn"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                style={{
                  width: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "12px 20px",
                  borderRadius: "var(--radius-md)",
                  background: "white",
                  color: "#1a1a2e",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600, fontSize: "14px",
                  border: "none",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.75 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {isLoading ? (
                  <Loader2 size={18} style={{ animation: "spin 0.8s linear infinite", color: "#6366f1" }} />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                {isLoading ? "Connecting…" : "Continue with Google"}
              </button>

              {/* Error */}
              {error && (
                <p style={{
                  marginTop: 12, padding: "10px 14px",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(239,68,68,0.08)",
                  color: "#f87171",
                  fontFamily: "var(--font-mono)", fontSize: "11px", textAlign: "center",
                  letterSpacing: "0.04em",
                }}>
                  {error}
                </p>
              )}

              {/* Free tier hint */}
              <div style={{
                marginTop: 24,
                padding: "14px 16px",
                border: "1px solid var(--border-hairline)",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-elevated)",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Gift size={14} style={{ color: "var(--color-signal)", marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, color: "var(--color-signal)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                      Free tier — 1 PRD included
                    </p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-mist)", lineHeight: 1.55 }}>
                      Sign in for free and generate your first PRD. Upgrade to Pro for more access.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <p style={{ marginTop: 20, fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-muted)", textAlign: "center", lineHeight: 1.6, letterSpacing: "0.03em" }}>
                By continuing, you agree to Moryn's{" "}
                <Link href="#" style={{ color: "var(--color-signal)", textDecoration: "underline" }}>Terms</Link>
                {" "}and{" "}
                <Link href="#" style={{ color: "var(--color-signal)", textDecoration: "underline" }}>Privacy Policy</Link>.
              </p>
            </div>
          </div>

          {/* Back link */}
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-muted)",
              textDecoration: "none", letterSpacing: "0.06em",
              transition: "color 0.15s",
            }}>
              <ArrowLeft size={12} strokeWidth={2} />
              Back to homepage
            </Link>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
