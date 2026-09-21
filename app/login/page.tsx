"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "@/lib/auth/auth-client";
import { Loader2, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState<null | "google" | "github">(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) router.replace("/dashboard");
  }, [session, router]);

  const handleLogin = async (provider: "google" | "github") => {
    setIsLoading(provider);
    setError(null);
    try {
      await signIn.social({ provider, callbackURL: "/dashboard" });
    } catch {
      setError("Sign-in failed. Please try again.");
      setIsLoading(null);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8]">
        <Loader2 size={24} className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8] selection:bg-[#E05A38]/15 text-neutral-900 overflow-x-hidden">
      <header className="h-16 flex items-center justify-center border-b border-neutral-200/40 shrink-0 relative z-10">
        <Link href="/" className="inline-flex items-center hover:opacity-85 transition-opacity">
          <Image
            src="/logo/Moryn-Light-Mode.webp"
            alt="Moryn"
            width={240}
            height={76}
            className="h-6 sm:h-[26px] w-auto object-contain select-none transition-opacity duration-150"
            priority
          />
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center relative px-4 py-10 sm:py-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(520px 420px at 18% 18%, rgba(224,90,56,0.07), transparent 70%), radial-gradient(560px 460px at 88% 72%, rgba(224,90,56,0.05), transparent 72%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(#0a0a0a 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div
          aria-hidden="true"
          className="hidden lg:block absolute left-[5%] top-[14%] -rotate-[5deg] pointer-events-none select-none login-float login-float-left"
        >
          <div className="w-[148px] rounded-xl bg-white border border-neutral-200/70 shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-4">
            <div className="h-1.5 w-8 rounded-full bg-[#E05A38]/80 mb-3" />
            <div className="space-y-2">
              <div className="h-1.5 w-full rounded-full bg-neutral-200" />
              <div className="h-1.5 w-[92%] rounded-full bg-neutral-200" />
              <div className="h-1.5 w-[78%] rounded-full bg-neutral-200/70" />
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="hidden lg:flex absolute right-[4.5%] bottom-[26%] w-12 h-12 rounded-full bg-[#E05A38] shadow-[0_8px_24px_rgba(224,90,56,0.35)] items-center justify-center text-white pointer-events-none login-float login-float-checkmark"
        >
          <Check size={18} strokeWidth={2.6} />
        </div>

        <div
          aria-hidden="true"
          className="hidden lg:block absolute right-[8%] top-[15%] w-[172px] rounded-xl bg-white/90 border border-neutral-200/70 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 rotate-[4deg] pointer-events-none login-float login-float-chart"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-bold tracking-[0.14em] text-neutral-400 uppercase">Blueprint</span>
            <span className="w-2 h-2 rounded-full bg-[#E05A38]" />
          </div>
          <div className="flex items-end gap-1.5 h-12 mb-3">
            <div className="w-3 rounded-t bg-[#E05A38]/25 h-5" />
            <div className="w-3 rounded-t bg-[#E05A38]/40 h-8" />
            <div className="w-3 rounded-t bg-[#E05A38]/60 h-6" />
            <div className="w-3 rounded-t bg-[#E05A38] h-11" />
            <div className="w-3 rounded-t bg-[#E05A38]/50 h-8" />
          </div>
          <div className="h-1.5 w-20 rounded-full bg-neutral-200" />
        </div>

        <div
          aria-hidden="true"
          className="hidden lg:block absolute left-[8%] bottom-[17%] w-[190px] rounded-xl bg-white/90 border border-neutral-200/70 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 -rotate-[3deg] pointer-events-none login-float login-float-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Image
              src="/logo/Moryn-1-1-Light-Transparent.webp"
              alt="Moryn Logo"
              width={26}
              height={26}
              className="w-6.5 h-6.5 object-contain shrink-0"
            />
            <div>
              <div className="h-1.5 w-20 rounded-full bg-neutral-800/80" />
              <div className="h-1.5 w-14 rounded-full bg-neutral-200 mt-1.5" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Context ready for AI workflow
          </div>
        </div>

        <div
          aria-hidden="true"
          className="hidden lg:block absolute right-[24%] bottom-[13%] w-[116px] rounded-lg bg-[#1D211F] shadow-[0_10px_30px_rgba(0,0,0,0.14)] p-3 rotate-[5deg] pointer-events-none login-float login-float-dark"
        >
          <div className="text-[9px] font-bold tracking-widest uppercase text-white/50 mb-2">Moryn AI</div>
          <div className="h-1.5 w-full rounded-full bg-white/20 mb-1.5" />
          <div className="h-1.5 w-[72%] rounded-full bg-[#E05A38]" />
        </div>

        <div className="relative w-full max-w-[420px]">
          <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-b from-white/70 to-transparent blur-xl pointer-events-none" aria-hidden="true" />

          <div className="relative bg-white rounded-2xl border border-neutral-200/80 shadow-[0_8px_40px_rgba(0,0,0,0.07),0_1px_3px_rgba(0,0,0,0.04)] p-8 sm:p-9">
            <div className="absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-[#E05A38]/20 to-transparent" aria-hidden="true" />

            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center mb-4">
                <Image
                  src="/logo/Moryn-1-1-Light-Transparent.webp"
                  alt="Moryn Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain select-none"
                  priority
                />
              </div>
              <h1 className="text-[22px] sm:text-2xl font-bold tracking-tight text-neutral-900">
                Welcome to Moryn
              </h1>
              <p className="text-[13.5px] leading-relaxed text-neutral-500 mt-2 max-w-[36ch] mx-auto text-balance">
                Turn your product ideas into structured context, ready for you and your AI coding workflow.
              </p>
            </div>

            <div className="space-y-3">
              <button
                id="login-google-btn"
                onClick={() => handleLogin("google")}
                disabled={!!isLoading}
                className="w-full inline-flex items-center justify-center gap-2.5 h-11 rounded-xl bg-white border border-neutral-200/90 hover:bg-neutral-50 hover:border-neutral-300 active:bg-neutral-100 text-[13.5px] font-semibold text-neutral-900 shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading === "google" ? (
                  <Loader2 size={16} className="animate-spin text-neutral-500" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                <span>{isLoading === "google" ? "Connecting…" : "Continue with Google"}</span>
              </button>

              <button
                id="login-github-btn"
                onClick={() => handleLogin("github")}
                disabled={!!isLoading}
                className="w-full inline-flex items-center justify-center gap-2.5 h-11 rounded-xl bg-[#111213] hover:bg-black active:bg-neutral-900 text-white text-[13.5px] font-semibold shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading === "github" ? (
                  <Loader2 size={16} className="animate-spin text-white/70" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57v-2.165c-3.33.705-4.035-1.41-4.035-1.41-.54-1.395-1.32-1.77-1.32-1.77-1.08-.705.105-.69.105-.69 1.2.105 1.83 1.23 1.83 1.23 1.065 1.815 2.79 1.29 3.48.984.105-.78.42-1.305.765-1.605-2.7-.285-5.55-1.335-5.55-5.925 0-1.305.465-2.385 1.215-3.225-.105-.285-.54-1.53.105-3.195 0 0 .99-.315 3.255 1.215 1.17-.315 2.25-.315 3.375 0 2.265-1.53 3.255-1.215 3.255-1.215.645 1.665.24 2.91.135 3.195.75.84 1.2 1.92 1.2 3.225 0 4.605-2.85 5.625-5.565 5.925.435.375.81 1.095.81 2.22v3.295c0 .315.21.675.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
                <span>{isLoading === "github" ? "Connecting…" : "Continue with GitHub"}</span>
              </button>
            </div>

            {error && (
              <p className="mt-4 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-medium text-center">
                {error}
              </p>
            )}

            <p className="mt-6 text-[12px] leading-relaxed text-neutral-400 text-center">
              By continuing, you agree to Moryn&apos;s{" "}
              <Link href="#" className="text-neutral-600 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900 hover:decoration-neutral-500 transition">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-neutral-600 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900 hover:decoration-neutral-500 transition">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-neutral-200/60 bg-white/60 backdrop-blur-sm">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 h-[56px] flex items-center justify-between gap-6">
          <Link href="/" className="inline-flex items-center hover:opacity-85 transition-opacity">
            <Image
              src="/logo/Moryn-Light-Mode.webp"
              alt="Moryn"
              width={240}
              height={76}
              className="h-5 sm:h-6 w-auto object-contain select-none"
            />
          </Link>
          <nav className="hidden sm:flex items-center gap-5 text-[11px] font-semibold tracking-widest uppercase text-neutral-400">
            <Link href="#" className="hover:text-neutral-700 transition">
              Privacy
            </Link>
            <Link href="#" className="hover:text-neutral-700 transition">
              Terms
            </Link>
            <Link href="#" className="hover:text-neutral-700 transition">
              Support
            </Link>
            <Link href="#" className="hover:text-neutral-700 transition">
              Contact
            </Link>
          </nav>
          <span className="text-[11px] font-medium text-neutral-400 hidden sm:inline">
            © 2024 Moryn. All rights reserved.
          </span>
          <span className="text-[11px] font-medium text-neutral-400 sm:hidden">© 2024 Moryn</span>
        </div>
      </footer>

      <style>{`
        @keyframes floatLeft {
          0% {
            opacity: 0;
            transform: translate(280px, -120px) scale(0.6);
          }
          100% {
            opacity: 1;
            transform: translate(0, 0) scale(1) rotate(-5deg);
          }
        }

        @keyframes floatCheckmark {
          0% {
            opacity: 0;
            transform: translate(-320px, 120px) scale(0.4);
          }
          100% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
        }

        @keyframes floatChart {
          0% {
            opacity: 0;
            transform: translate(-200px, -160px) scale(0.5) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: translate(0, 0) scale(1) rotate(4deg);
          }
        }

        @keyframes floatCard {
          0% {
            opacity: 0;
            transform: translate(200px, 140px) scale(0.5) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: translate(0, 0) scale(1) rotate(-3deg);
          }
        }

        @keyframes floatDark {
          0% {
            opacity: 0;
            transform: translate(140px, 100px) scale(0.4);
          }
          100% {
            opacity: 1;
            transform: translate(0, 0) scale(1) rotate(5deg);
          }
        }

        .login-float-left {
          animation: floatLeft 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
        }

        .login-float-checkmark {
          animation: floatCheckmark 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s both;
        }

        .login-float-chart {
          animation: floatChart 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.18s both;
        }

        .login-float-card {
          animation: floatCard 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.22s both;
        }

        .login-float-dark {
          animation: floatDark 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.28s both;
        }
      `}</style>
    </div>
  );
}
