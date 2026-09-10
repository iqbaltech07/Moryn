import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Navbar } from "../components/layout";
import ProfileProjects from "./ProfileProjects";
import ApiKeySection from "./ApiKeySection";
import CustomAiKeysSection from "./CustomAiKeysSection";
import { getRank, getNextRank, getRankProgress, getExpToNextRank, RANKS } from "@/lib/analytics/gamification";
import { getMonthlyProjectLimit } from "@/lib/analytics/planQuota";
import {
  Sprout, Compass, PenLine, LayoutList, Lightbulb,
  Map, Timer, Telescope, Trophy, Wrench,
  Award, Calendar, FolderOpen, CheckCircle2, TrendingUp, Lock, Star,
} from "lucide-react";

const RANK_ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>> = {
  Sprout, Compass, PenLine, LayoutList, Lightbulb, Map, Timer, Telescope, Trophy, Wrench,
};

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) redirect("/login");

  const userDb = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tier: true, exp: true, createdAt: true },
  });

  const tier       = userDb?.tier || "FREE";
  const exp        = userDb?.exp ?? 0;
  const joinDate   = userDb?.createdAt ?? new Date();
  const rank       = getRank(exp);
  const nextRank   = getNextRank(exp);
  const rankPct    = getRankProgress(exp);
  const expToNext  = getExpToNextRank(exp);

  const projects         = await prisma.project.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } });
  const finishedProjects = projects.filter((p) => p.status === "FINISHED");

  const isUnlimited     = getMonthlyProjectLimit(tier, session.user.email) === Infinity;
  const prdLimit        = getMonthlyProjectLimit(tier, session.user.email);
  const now             = new Date();
  const firstOfMonth    = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthCount  = projects.filter((p) => new Date(p.createdAt) >= firstOfMonth).length;

  const RankIcon       = RANK_ICON_MAP[rank.icon] ?? Star;
  const joinFormatted  = new Date(joinDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const stats = [
    { label: "Total Projects", value: String(projects.length),       accent: "var(--color-signal)"  },
    { label: "Completed",      value: String(finishedProjects.length), accent: "var(--color-circuit)" },
    { label: "Total Points",   value: exp.toLocaleString("id-ID"),   accent: "var(--color-signal)"  },
    { label: "Monthly Limit",  value: isUnlimited ? "∞" : `${thisMonthCount} / ${prdLimit}`, accent: "var(--color-mist)" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-ink)", color: "var(--fg-primary)" }}>
      <Navbar />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "88px 24px 80px" }}>

        {/* ── Profile header card ── */}
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-hairline)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          marginBottom: 16,
          position: "relative",
        }}>
          {/* Signal top rule */}
          <div aria-hidden="true" style={{ height: 2, background: "var(--color-signal)" }} />

          {/* Grid overlay */}
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
            backgroundSize: "40px 40px", pointerEvents: "none",
          }} />

          <div style={{ padding: "28px 32px", display: "flex", alignItems: "flex-start", gap: 28, flexWrap: "wrap", position: "relative", zIndex: 1 }}>

            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || ""}
                  style={{ width: 80, height: 80, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-hairline)", objectFit: "cover" }}
                />
              ) : (
                <div style={{
                  width: 80, height: 80,
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-hairline)",
                  background: "var(--bg-elevated)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800,
                  color: "var(--color-signal)",
                }}>
                  {session.user.name?.charAt(0) || "U"}
                </div>
              )}
              {/* Rank pip */}
              <div style={{
                position: "absolute", bottom: -5, right: -5,
                width: 26, height: 26,
                borderRadius: "var(--radius-md)",
                background: rank.color,
                border: "2px solid var(--bg-surface)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <RankIcon size={12} color="white" strokeWidth={2.5} />
              </div>
            </div>

            {/* Identity */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem,2vw,1.75rem)", fontWeight: 800, color: "var(--fg-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                  {session.user.name}
                </h1>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  padding: "3px 9px",
                  border: `1px solid ${tier === "PRO" ? "var(--color-signal)" : "var(--border-hairline)"}`,
                  borderRadius: "var(--radius-xs)",
                  color: tier === "PRO" ? "var(--color-signal)" : "var(--color-mist)",
                  background: tier === "PRO" ? "rgba(255,182,39,0.08)" : "var(--bg-elevated)",
                }}>
                  {tier}
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)", marginBottom: 12, letterSpacing: "0.04em" }}>
                {session.user.email}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={12} style={{ color: "var(--fg-muted)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.04em" }}>
                  Joined {joinFormatted}
                </span>
              </div>
            </div>

            {/* Rank panel */}
            <div style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--radius-lg)",
              padding: "18px 22px",
              minWidth: 240,
              flexShrink: 0,
            }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 12 }}>
                Current Rank
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: rank.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <RankIcon size={20} color="white" strokeWidth={2} />
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "var(--fg-primary)", margin: 0, letterSpacing: "-0.01em" }}>{rank.name}</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-muted)", margin: 0, letterSpacing: "0.04em" }}>
                    {exp.toLocaleString("id-ID")} pts
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.06em" }}>{exp.toLocaleString("id-ID")}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.06em" }}>
                  {nextRank ? nextRank.minExp.toLocaleString("id-ID") : "MAX"}
                </span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "var(--bg-base)", overflow: "hidden", marginBottom: 7 }}>
                <div style={{ height: "100%", borderRadius: 2, background: rank.color, width: `${rankPct}%`, transition: "width 0.6s ease" }} />
              </div>
              {nextRank ? (
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.04em" }}>
                  <span style={{ color: "var(--color-signal)", fontWeight: 700 }}>{expToNext} pts</span> to {nextRank.name}
                </p>
              ) : (
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-signal)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  🏆 Highest Rank Achieved!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: 16 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{
              background: "var(--bg-surface)",
              borderRight: i < stats.length - 1 ? "1px solid var(--border-hairline)" : "none",
              padding: "20px 22px",
            }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 10 }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, color: s.accent, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Rank journey ── */}
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-hairline)",
          borderRadius: "var(--radius-lg)",
          padding: "22px 28px 28px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Grid background */}
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
            backgroundSize: "40px 40px", pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: "var(--fg-muted)", marginBottom: 20,
            }}>
              Rank Journey
            </div>

            {/*
              Layout strategy — no scroll, fully fluid:
              - Outer wrapper: position:relative so the connector line can be absolute
              - CSS grid: repeat(RANKS.length, 1fr) — each tile gets equal share of width
              - The horizontal connector is a single absolute line spanning the icon centers
              - Three conceptual layers per cell: YOU badge (top), icon (middle), labels (bottom)
            */}
            <div style={{ position: "relative" }}>

              {/* ── Connector line — sits behind the icons, vertically centered ──
                  Icon size = 40px. Badge row above = 20px. So icon center from top of grid
                  = 20px (badge) + 20px (half icon) = 40px.
                  left/right = 50% of first/last cell = half a column-width away from edges.
                  We approximate with percentage: left = (0.5 / RANKS.length * 100)%
              */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 40,           /* badge(20px) + half icon(20px) */
                  left: `${(0.5 / RANKS.length) * 100}%`,
                  right: `${(0.5 / RANKS.length) * 100}%`,
                  height: 1,
                  background: "var(--border-hairline)",
                  zIndex: 0,
                }}
              />

              {/* ── Filled connector — covers unlocked portion ── */}
              {(() => {
                const lastUnlockedIdx = [...RANKS].reverse().findIndex(r => exp >= r.minExp);
                const unlockedCount   = lastUnlockedIdx === -1 ? 0 : RANKS.length - lastUnlockedIdx;
                const filledPct       = unlockedCount <= 1
                  ? 0
                  : ((unlockedCount - 1) / (RANKS.length - 1)) * 100;
                return (
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 40,
                      left: `${(0.5 / RANKS.length) * 100}%`,
                      width: `${filledPct * (1 - 1 / RANKS.length)}%`,
                      height: 1,
                      background: "var(--color-signal)",
                      zIndex: 0,
                      transition: "width 0.4s ease",
                    }}
                  />
                );
              })()}

              {/* ── Tile grid ── */}
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${RANKS.length}, 1fr)`,
                position: "relative", zIndex: 1,
              }}>
                {RANKS.map((r) => {
                  const unlocked  = exp >= r.minExp;
                  const isCurrent = r.id === rank.id;
                  const RIcon     = RANK_ICON_MAP[r.icon] ?? Star;
                  return (
                    <div key={r.id} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
                    }}>
                      {/* YOU badge row — always 20px tall to reserve space */}
                      <div style={{ height: 20, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 0 }}>
                        {isCurrent && (
                          <span style={{
                            fontFamily: "var(--font-mono)", fontSize: 7, fontWeight: 800,
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            color: "#ffffff",
                            background: "var(--color-signal)",
                            padding: "1px 5px",
                            borderRadius: "var(--radius-xs)",
                            whiteSpace: "nowrap",
                          }}>
                            YOU
                          </span>
                        )}
                      </div>

                      {/* Icon tile — 40px */}
                      <div style={{
                        width: 40, height: 40,
                        borderRadius: "var(--radius-md)",
                        background: unlocked ? r.color : "var(--bg-elevated)",
                        border: isCurrent
                          ? "2px solid var(--color-signal)"
                          : "1px solid var(--border-hairline)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: unlocked ? 1 : 0.3,
                        position: "relative", zIndex: 2,
                        flexShrink: 0,
                      }}>
                        {unlocked
                          ? <RIcon size={18} color="white" strokeWidth={2} />
                          : <Lock size={13} color="var(--fg-muted)" strokeWidth={2} />
                        }
                      </div>

                      {/* Name */}
                      <p style={{
                        fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 600,
                        textAlign: "center", letterSpacing: "0.03em",
                        color: isCurrent ? "var(--color-signal)" : unlocked ? "var(--fg-secondary)" : "var(--fg-muted)",
                        lineHeight: 1.3, margin: "8px 2px 2px",
                        maxWidth: "100%",
                        wordBreak: "keep-all",
                        overflowWrap: "break-word",
                      }}>
                        {r.name}
                      </p>

                      {/* Threshold */}
                      <p style={{
                        fontFamily: "var(--font-mono)", fontSize: 7,
                        color: "var(--fg-muted)", letterSpacing: "0.04em", margin: 0,
                      }}>
                        {r.minExp === 0 ? "Start" : r.minExp >= 1000 ? `${r.minExp / 1000}k` : String(r.minExp)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Custom AI API Keys (Multi-Key Fallback Pool) ── */}
        <CustomAiKeysSection />

        {/* ── CLI Token Integration Key ── */}
        <ApiKeySection />

        {/* ── Projects ── */}
        <ProfileProjects projects={projects} />
      </main>
    </div>
  );
}
