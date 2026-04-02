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

export function createApp(): Hono<Env> {
  const app = new Hono<Env>();

  // Global error handler — prevents "Context is not finalized" crashes
  app.onError((err, c) => {
    console.error('Unhandled error:', err.message, err.stack);
    return c.json({ error: 'Internal server error' }, 500);
  });

  // Preflight handler only — no response modification after next()
  app.options('*', (c) => {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
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
