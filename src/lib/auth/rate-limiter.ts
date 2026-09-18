import 'server-only';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // Unix timestamp in ms
  retryAfterSeconds?: number;
}

export interface IRateLimiter {
  check(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
}

interface MemoryBucket {
  count: number;
  resetAt: number;
}

/**
 * In-Memory Sliding-Window Rate Limiter
 * Suitable for: Development and single-container production environments.
 *
 * NOTE FOR DISTRIBUTED / SERVERLESS PRODUCTION:
 * In a multi-instance or serverless environment (e.g. multi-region Vercel functions, Kubernetes replicas),
 * rate limiting state must be backed by a shared distributed store (such as Redis / Upstash Redis / Cloudflare KV).
 * The IRateLimiter interface is designed to support a RedisRateLimiter drop-in without code changes.
 */
class MemoryRateLimiter implements IRateLimiter {
  private buckets = new Map<string, MemoryBucket>();
  private lastCleanup = Date.now();

  private cleanupExpired(now: number) {
    if (now - this.lastCleanup < 60_000) return; // Clean up at most once per minute
    this.lastCleanup = now;
    for (const [key, bucket] of this.buckets.entries()) {
      if (now > bucket.resetAt) {
        this.buckets.delete(key);
      }
    }
  }

  async check(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    this.cleanupExpired(now);

    let bucket = this.buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      bucket = {
        count: 1,
        resetAt: now + windowMs,
      };
      this.buckets.set(key, bucket);
      return {
        success: true,
        limit,
        remaining: limit - 1,
        resetAt: bucket.resetAt,
      };
    }

    bucket.count += 1;

    if (bucket.count > limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      return {
        success: false,
        limit,
        remaining: 0,
        resetAt: bucket.resetAt,
        retryAfterSeconds,
      };
    }

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - bucket.count),
      resetAt: bucket.resetAt,
    };
  }

  async reset(key: string): Promise<void> {
    this.buckets.delete(key);
  }
}

// Global singleton instance for memory limiter
const memoryLimiter = new MemoryRateLimiter();

export function getRateLimiter(): IRateLimiter {
  return memoryLimiter;
}

/**
 * Standard Login Rate Limiter Guardrail
 * - Max 5 attempts per 15 minutes (900,000 ms) per client key (IP + email hash)
 */
export async function checkLoginRateLimit(clientKey: string): Promise<RateLimitResult> {
  const limiter = getRateLimiter();
  const LOGIN_LIMIT = 5;
  const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  return await limiter.check(`login:${clientKey}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
}

export async function resetLoginRateLimit(clientKey: string): Promise<void> {
  const limiter = getRateLimiter();
  await limiter.reset(`login:${clientKey}`);
}
