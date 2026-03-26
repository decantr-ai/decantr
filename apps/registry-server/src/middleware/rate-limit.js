/**
 * In-memory IP-based sliding window rate limiter.
 *
 * No Redis needed — fine for a single-instance SQLite server.
 * Buckets auto-expire via periodic cleanup.
 */

const buckets = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entries] of buckets) {
    const filtered = entries.filter(ts => now - ts < 3600_000);
    if (filtered.length === 0) {
      buckets.delete(key);
    } else {
      buckets.set(key, filtered);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Rate limit middleware factory.
 * @param {Object} opts
 * @param {number} opts.max - Maximum requests
 * @param {number} opts.windowMs - Window in milliseconds
 * @param {string} [opts.prefix] - Key prefix for different route groups
 */
export function rateLimit({ max, windowMs, prefix = 'global' }) {
  return async (c, next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
      || c.req.header('x-real-ip')
      || 'unknown';
    const key = `${prefix}:${ip}`;
    const now = Date.now();

    let entries = buckets.get(key) || [];
    entries = entries.filter(ts => now - ts < windowMs);

    if (entries.length >= max) {
      const retryAfter = Math.ceil((entries[0] + windowMs - now) / 1000);
      c.header('Retry-After', String(retryAfter));
      return c.json({
        error: 'Rate limit exceeded',
        retryAfter,
      }, 429);
    }

    entries.push(now);
    buckets.set(key, entries);
    await next();
  };
}
