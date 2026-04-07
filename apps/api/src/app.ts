import { Hono } from 'hono';
// cors import removed — using manual CORS headers due to Hono middleware bug
import type { Env } from './types.js';
import { healthRoutes } from './routes/health.js';
import { contentRoutes } from './routes/content.js';
import { searchRoutes } from './routes/search.js';
import { authRoutes } from './routes/auth.js';
import { publishRoutes } from './routes/publish.js';
import { orgRoutes } from './routes/orgs.js';
import { adminRoutes } from './routes/admin.js';
import { billingRoutes } from './routes/billing.js';
import { userRoutes } from './routes/users.js';
import { optionalAuth } from './middleware/auth.js';
import { rateLimiter } from './middleware/rate-limit.js';
import { requestLogger } from './middleware/request-logger.js';
import { logger } from './lib/logger.js';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : null; // null = allow all (public API default)

const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10 MB

function getAllowedOrigin(requestOrigin: string | undefined): string {
  if (!ALLOWED_ORIGINS) return '*';
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) return requestOrigin;
  return ALLOWED_ORIGINS[0] ?? '*';
}

export function createApp(): Hono<Env> {
  const app = new Hono<Env>();

  // Global error handler — prevents "Context is not finalized" crashes
  app.onError((err, c) => {
    logger.error({ err, path: c.req.path, method: c.req.method }, 'Unhandled error');
    return c.json({ error: 'Internal server error' }, 500);
  });

  // Request logging — logs method, path, status, duration for every request
  app.use('*', requestLogger());

  // Security headers + CORS origin on all responses
  app.use('*', async (c, next) => {
    await next();
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Access-Control-Allow-Origin', getAllowedOrigin(c.req.header('origin')));
  });

  // Body size limit on all non-GET/HEAD/OPTIONS requests
  app.use('*', async (c, next) => {
    const method = c.req.method;
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return next();
    }
    const contentLength = c.req.header('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return c.json({ error: 'Request body too large' }, 413);
    }
    await next();
  });

  // Preflight handler only — no response modification after next()
  app.options('*', (c) => {
    const origin = getAllowedOrigin(c.req.header('origin'));
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Admin-Key',
      },
    });
  });

  // Optional auth on v1 routes — skip for public read-only endpoints and admin sync
  app.use('/v1/*', async (c, next) => {
    const path = c.req.path;
    const method = c.req.method;

    // Skip auth for admin sync (uses X-Admin-Key)
    if (path === '/v1/admin/sync' && method === 'POST') {
      return next();
    }

    // Skip auth for public read-only content endpoints (GET only)
    // These don't need auth — auth is only for publishing, moderation, billing
    if (method === 'GET' && /^\/v1\/(patterns|themes|blueprints|archetypes|shells|search|health)/.test(path)) {
      c.set('auth', { user: null, isAuthenticated: false, isAdmin: false });
      return next();
    }

    await optionalAuth()(c, next);
  });

  // Rate limiting (after auth so it can read the auth context)
  // Skip for public GET endpoints and admin sync
  app.use('/v1/*', async (c, next) => {
    const path = c.req.path;
    const method = c.req.method;
    if (path === '/v1/admin/sync' && method === 'POST') {
      return next();
    }
    if (method === 'GET' && /^\/v1\/(patterns|themes|blueprints|archetypes|shells|search|health)/.test(path)) {
      return next();
    }
    await rateLimiter()(c, next);
  });

  // Mount route modules (admin first — its sync endpoint uses admin-key-only auth)
  app.route('/', healthRoutes);
  app.route('/v1', adminRoutes);
  app.route('/v1', contentRoutes);
  app.route('/v1', searchRoutes);
  app.route('/v1', authRoutes);
  app.route('/v1', publishRoutes);
  app.route('/v1', orgRoutes);
  app.route('/v1', billingRoutes);
  app.route('/v1', userRoutes);

  return app;
}
