import { Hono } from 'hono';
import { cors } from 'hono/cors';
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

  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Admin-Key'],
    })
  );

  // Optional auth on all v1 routes (skip for admin sync — uses its own auth)
  app.use('/v1/*', async (c, next) => {
    // Skip optionalAuth and rate limiting for admin sync (authenticated via X-Admin-Key)
    if (c.req.path === '/v1/admin/sync' && c.req.method === 'POST') {
      return next();
    }
    await optionalAuth()(c, next);
  });

  // Rate limiting (after auth so it can read the auth context)
  app.use('/v1/*', async (c, next) => {
    if (c.req.path === '/v1/admin/sync' && c.req.method === 'POST') {
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
