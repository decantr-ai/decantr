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
import { optionalAuth } from './middleware/auth.js';
import { rateLimiter } from './middleware/rate-limit.js';

export function createApp(): Hono<Env> {
  const app = new Hono<Env>();

  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    })
  );

  // Optional auth on all v1 routes
  app.use('/v1/*', optionalAuth());

  // Rate limiting (after auth so it can read the auth context)
  app.use('/v1/*', rateLimiter());

  // Mount route modules
  app.route('/', healthRoutes);
  app.route('/v1', contentRoutes);
  app.route('/v1', searchRoutes);
  app.route('/v1', authRoutes);
  app.route('/v1', publishRoutes);
  app.route('/v1', orgRoutes);
  app.route('/v1', adminRoutes);
  app.route('/v1', billingRoutes);

  return app;
}
