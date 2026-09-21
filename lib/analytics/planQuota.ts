export type PlanTier = "FREE" | "PRO";

export const MONTHLY_PROJECT_LIMITS: Record<PlanTier, number> = {
  FREE: 1,
  PRO: 3,
};

export const AI_CHAT_LIMITS: Record<PlanTier, number> = {
  FREE: 5,
  PRO: 20,
};

/** Daily rate-limit (rolling) for each AI generation endpoint, per user. */
export const DAILY_AI_CALL_LIMITS: Record<PlanTier, number> = {
  FREE: 30,
  PRO: 120,
};

function normalizeEmail(email?: string | null): string {
  return (email || "").trim().toLowerCase();
}

/**
 * Admin emails are read from the ADMIN_EMAILS env var (comma separated).
 * NEVER hardcode a single privileged account in source code.
 */
export function isAdminEmail(email?: string | null): boolean {
  const adminRaw = process.env.ADMIN_EMAILS || "";
  const admins = adminRaw
    .split(",")
    .map((e) => normalizeEmail(e))
    .filter(Boolean);
  return admins.includes(normalizeEmail(email));
}

export function resolveTier(tier?: string | null): PlanTier {
  return tier === "PRO" ? "PRO" : "FREE";
}

/** Monthly project generation limit. Admins are unlimited. */
export function getMonthlyProjectLimit(tier: string | null | undefined, email?: string | null): number {
  if (isAdminEmail(email)) return Infinity;
  return MONTHLY_PROJECT_LIMITS[resolveTier(tier)];
}

/** Per-project AI chat limit (edit/refine PRD). Admins are unlimited. */
export function getAiChatLimit(tier: string | null | undefined, email?: string | null): number {
  if (isAdminEmail(email)) return Infinity;
  return AI_CHAT_LIMITS[resolveTier(tier)];
}

/** Daily rolling rate-limit for AI endpoints. Admins are unlimited. */
export function getDailyAiCallLimit(tier: string | null | undefined, email?: string | null): number {
  if (isAdminEmail(email)) return Infinity;
  return DAILY_AI_CALL_LIMITS[resolveTier(tier)];
}