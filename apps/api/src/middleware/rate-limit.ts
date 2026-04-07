import type { Context, Next } from 'hono';
import type { Env } from '../types.js';
import type { AuthContext } from './auth.js';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 60_000;

const TIER_LIMITS: Record<string, number> = {
  unauthenticated: 30,
  free: 60,
  pro: 300,
  team: 600,
  enterprise: Infinity,
};

// LIMITATION: This rate limiter uses an in-memory Map, which means:
// - Rate limit state is NOT shared across multiple server instances
// - Each instance maintains its own independent counters
// - In a multi-instance deployment (e.g., Fly.io with multiple machines),
//   a user could get N * limit requests through where N = number of instances
// - State is lost on server restart
// If multi-instance consistency is needed, replace with a shared store (e.g., Redis).
const store = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.windowStart > WINDOW_MS * 2) {
      store.delete(key);
    }
  }
}, 5 * 60_000);

function getRateLimitKey(c: Context<Env>): string {
  const auth: AuthContext | undefined = c.get('auth');
  if (auth?.isAuthenticated && auth.user) {
    return `user:${auth.user.id}`;
  }
  // Use first IP from x-forwarded-for (client origin), not full chain
  const xff = c.req.header('x-forwarded-for');
  const ip = xff
    ? (xff.split(',')[0]?.trim() || 'unknown')
    : (c.req.header('x-real-ip') || 'unknown');
  return `ip:${ip}`;
}

function getMaxRequests(c: Context<Env>): number {
  const auth: AuthContext | undefined = c.get('auth');
  if (!auth?.isAuthenticated || !auth.user) {
    return TIER_LIMITS['unauthenticated'] ?? 30;
  }
  return TIER_LIMITS[auth.user.tier] ?? 60;
}

export function rateLimiter() {
  return async (c: Context<Env>, next: Next) => {
    const key = getRateLimitKey(c);
    const max = getMaxRequests(c);

    if (max === Infinity) {
      await next();
      return;
    }

    const now = Date.now();
    let entry = store.get(key);

    if (!entry || now - entry.windowStart > WINDOW_MS) {
      entry = { count: 0, windowStart: now };
      store.set(key, entry);
    }

    entry.count++;

    const remaining = Math.max(0, max - entry.count);
    const resetAt = entry.windowStart + WINDOW_MS;

    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(remaining));
    c.header('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

    if (entry.count > max) {
      return c.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((resetAt - now) / 1000),
        },
        429
      );
    }

    await next();
  };
}

export { store as _rateLimitStore, TIER_LIMITS };
