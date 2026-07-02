import { Hono } from 'hono';
import type { Env } from './types.js';
import { healthRoutes } from './routes/health.js';
import { contentRoutes } from './routes/content.js';
import { searchRoutes } from './routes/search.js';
import { schemaRoutes } from './routes/schema.js';
import { showcaseRoutes } from './routes/showcase.js';
import { intelligenceRoutes } from './routes/intelligence.js';
import { packRoutes } from './routes/packs.js';
import { requestLogger } from './middleware/request-logger.js';
import { logger } from './lib/logger.js';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : null;

const MAX_BODY_SIZE = 10 * 1024 * 1024;

function getAllowedOrigin(requestOrigin: string | undefined): string {
  if (!ALLOWED_ORIGINS) return '*';
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) return requestOrigin;
  return ALLOWED_ORIGINS[0] ?? '*';
}

export function createApp(): Hono<Env> {
  const app = new Hono<Env>();

  app.onError((err, c) => {
    logger.error({ err, path: c.req.path, method: c.req.method }, 'Unhandled error');
    return c.json({ error: 'Internal server error' }, 500);
  });

  app.use('*', requestLogger());

  app.use('*', async (c, next) => {
    await next();
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Access-Control-Allow-Origin', getAllowedOrigin(c.req.header('origin')));
  });

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

  app.options('*', (c) => {
    const origin = getAllowedOrigin(c.req.header('origin'));
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  });

  app.route('/', healthRoutes);
  app.route('/v1', contentRoutes);
  app.route('/v1', searchRoutes);
  app.route('/v1', schemaRoutes);
  app.route('/v1', showcaseRoutes);
  app.route('/v1', intelligenceRoutes);
  app.route('/v1', packRoutes);

  return app;
}
