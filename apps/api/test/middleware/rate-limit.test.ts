import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { AuthContext } from '../../src/middleware/auth.js';

// Mock db client to prevent env var errors on import
vi.mock('../../src/db/client.js', () => ({
  createAdminClient: vi.fn(),
  createUserClient: vi.fn(),
}));

const { rateLimiter, _rateLimitStore, TIER_LIMITS } = await import('../../src/middleware/rate-limit.js');

function createTestApp(authContext?: AuthContext) {
  const app = new Hono();

  // Simulate setting auth context before rate limiter runs
  if (authContext) {
    app.use('*', async (c, next) => {
      c.set('auth', authContext);
      await next();
    });
  }

  app.use('*', rateLimiter());
  app.get('/test', (c) => c.json({ ok: true }));

  return app;
}

describe('Rate limiter middleware', () => {
  beforeEach(() => {
    // Clear the rate limit store between tests
    _rateLimitStore.clear();
  });

  describe('tier limits', () => {
    it('should allow unauthenticated requests up to the limit', async () => {
      const app = createTestApp();

      // Unauthenticated limit is 30
      for (let i = 0; i < 30; i++) {
        const res = await app.request('/test', {
          headers: { 'x-forwarded-for': '1.2.3.4' },
        });
        expect(res.status).toBe(200);
      }

      // 31st request should be rate limited
      const res = await app.request('/test', {
        headers: { 'x-forwarded-for': '1.2.3.4' },
      });
      expect(res.status).toBe(429);
      const json = await res.json();
      expect(json.error).toBe('Rate limit exceeded');
    });

    it('should apply free tier limit for authenticated free users', async () => {
      const auth: AuthContext = {
        user: { id: 'free-user', email: 'free@test.com', tier: 'free', trusted: false, reputation_score: 0 },
        isAuthenticated: true,
        isAdmin: false,
      };
      const app = createTestApp(auth);

      // Free limit is 60
      for (let i = 0; i < 60; i++) {
        const res = await app.request('/test');
        expect(res.status).toBe(200);
      }

      const res = await app.request('/test');
      expect(res.status).toBe(429);
    });

    it('should apply pro tier limit for pro users', async () => {
      const auth: AuthContext = {
        user: { id: 'pro-user', email: 'pro@test.com', tier: 'pro', trusted: true, reputation_score: 100 },
        isAuthenticated: true,
        isAdmin: false,
      };
      const app = createTestApp(auth);

      // Pro limit is 300 -- just verify the header
      const res = await app.request('/test');
      expect(res.status).toBe(200);
      expect(res.headers.get('X-RateLimit-Limit')).toBe('300');
    });

    it('should skip rate limiting for enterprise tier (Infinity)', async () => {
      const auth: AuthContext = {
        user: { id: 'ent-user', email: 'ent@test.com', tier: 'enterprise', trusted: true, reputation_score: 100 },
        isAuthenticated: true,
        isAdmin: false,
      };
      const app = createTestApp(auth);

      // Enterprise has Infinity limit, so no rate limit headers should be set
      const res = await app.request('/test');
      expect(res.status).toBe(200);
      // Enterprise skips rate limiting entirely, so no limit header
      expect(res.headers.get('X-RateLimit-Limit')).toBeNull();
    });
  });

  describe('rate limit headers', () => {
    it('should set X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset headers', async () => {
      const app = createTestApp();

      const res = await app.request('/test', {
        headers: { 'x-forwarded-for': '5.6.7.8' },
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('X-RateLimit-Limit')).toBe('30');
      expect(res.headers.get('X-RateLimit-Remaining')).toBe('29');
      expect(res.headers.get('X-RateLimit-Reset')).toBeTruthy();
    });

    it('should decrement remaining count on each request', async () => {
      const app = createTestApp();

      await app.request('/test', {
        headers: { 'x-forwarded-for': '9.10.11.12' },
      });

      const res = await app.request('/test', {
        headers: { 'x-forwarded-for': '9.10.11.12' },
      });

      expect(res.headers.get('X-RateLimit-Remaining')).toBe('28');
    });
  });

  describe('IP vs user keying', () => {
    it('should key by IP for unauthenticated requests', async () => {
      const app = createTestApp();

      // Different IPs should have separate counters
      const res1 = await app.request('/test', {
        headers: { 'x-forwarded-for': '10.0.0.1' },
      });
      const res2 = await app.request('/test', {
        headers: { 'x-forwarded-for': '10.0.0.2' },
      });

      expect(res1.headers.get('X-RateLimit-Remaining')).toBe('29');
      expect(res2.headers.get('X-RateLimit-Remaining')).toBe('29');
    });

    it('should key by user ID for authenticated requests', async () => {
      const auth: AuthContext = {
        user: { id: 'keyed-user', email: 'keyed@test.com', tier: 'free', trusted: false, reputation_score: 0 },
        isAuthenticated: true,
        isAdmin: false,
      };
      const app = createTestApp(auth);

      // Both requests use same user ID key regardless of IP
      const res1 = await app.request('/test', {
        headers: { 'x-forwarded-for': '10.0.0.1' },
      });
      const res2 = await app.request('/test', {
        headers: { 'x-forwarded-for': '10.0.0.2' },
      });

      // Should share the same counter (user-based), so remaining should decrement
      expect(res1.headers.get('X-RateLimit-Remaining')).toBe('59');
      expect(res2.headers.get('X-RateLimit-Remaining')).toBe('58');
    });
  });

  describe('stale cleanup', () => {
    it('should reset window after WINDOW_MS elapses', async () => {
      const app = createTestApp();
      const ip = '192.168.1.1';

      // Make a request to create an entry
      await app.request('/test', {
        headers: { 'x-forwarded-for': ip },
      });

      expect(_rateLimitStore.size).toBeGreaterThan(0);

      // Manually expire the entry by backdating its windowStart
      const key = `ip:${ip}`;
      const entry = _rateLimitStore.get(key);
      expect(entry).toBeDefined();

      // Set windowStart to more than 60s ago so the next request resets
      entry!.windowStart = Date.now() - 61_000;

      const res = await app.request('/test', {
        headers: { 'x-forwarded-for': ip },
      });

      // Should be a fresh window with remaining = limit - 1
      expect(res.status).toBe(200);
      expect(res.headers.get('X-RateLimit-Remaining')).toBe('29');
    });

    it('should expose the store for cleanup verification', () => {
      // The store is exported for testing purposes
      expect(_rateLimitStore).toBeInstanceOf(Map);
    });
  });

  describe('tier limit constants', () => {
    it('should have expected tier limits', () => {
      expect(TIER_LIMITS['unauthenticated']).toBe(30);
      expect(TIER_LIMITS['free']).toBe(60);
      expect(TIER_LIMITS['pro']).toBe(300);
      expect(TIER_LIMITS['team']).toBe(600);
      expect(TIER_LIMITS['enterprise']).toBe(Infinity);
    });
  });
});
