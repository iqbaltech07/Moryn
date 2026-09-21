import { redis } from "@/lib/db/redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  /** Seconds until the counter resets. 0 for unlimited. */
  resetIn: number;
}

export const RateLimitWindows = {
  MINUTE: 60,
  HOUR: 60 * 60,
  DAY: 24 * 60 * 60,
} as const;

/**
 * Per-user sliding-window rate limit backed by Redis.
 * Uses two counters (current window + previous window) to avoid a hard reset
 * spike while keeping constant memory and O(1) per check.
 */
export async function checkRateLimit(opts: {
  userId: string;
  scope: string;
  limit: number;
  windowSeconds?: number;
}): Promise<RateLimitResult> {
  const { userId, scope, limit } = opts;
  const windowSeconds = opts.windowSeconds ?? RateLimitWindows.DAY;

  if (!isFinite(limit) || limit <= 0) {
    return { allowed: true, remaining: Number.POSITIVE_INFINITY, limit, resetIn: 0 };
  }

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const window = Math.floor(now / windowMs); // current window index
  const prevWindow = window - 1;

  const key = (w: number) => `rl:${scope}:${userId}:${w}`;

  try {
    const pipeline = redis.pipeline();
    pipeline.get<number>(key(prevWindow));
    pipeline.incr(key(window));
    pipeline.expire(key(window), windowSeconds * 2);

    const [prevCountRaw, currentCount] = (await pipeline.exec()) as [
      number | null,
      number,
      number,
    ];

    const prevCount = prevCountRaw ?? 0;
    // Fractional progress through the current window (0.0 → 1.0)
    const timeInCurrentWindow = (now % windowMs) / windowMs;
    // Weight the previous window's count by how much of it overlaps
    const estimatedCount = Math.floor(
      prevCount * (1 - timeInCurrentWindow) + currentCount
    );

    const allowed = estimatedCount <= limit;
    const remaining = Math.max(0, limit - estimatedCount);
    const resetIn = Math.ceil((windowMs - (now % windowMs)) / 1000);

    return { allowed, remaining, limit, resetIn };
  } catch (err) {
    console.error("[RateLimit] Redis failure, failing open:", err);
    return { allowed: true, remaining: limit, limit, resetIn: 0 };
  }
}
