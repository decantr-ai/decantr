/**
 * Decantr Registry Server — Hono app with SQLite backend.
 *
 * Endpoints:
 *   GET  /health
 *   GET  /v1/search
 *   GET  /v1/content/:type/:id[/version/:version]
 *   GET  /v1/recommend
 *   POST /v1/publish
 *   GET  /auth/github
 *   GET  /auth/github/callback
 *   GET  /schemas/manifest.v1.json
 */

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { initDb } from './db/index.js';
import { config, validateProductionConfig } from './config.js';

// Middleware
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/error-handler.js';
import { optionalAuth } from './middleware/auth.js';

// Routes
import healthRoutes from './routes/health.js';
import searchRoutes from './routes/search.js';
import contentRoutes from './routes/content.js';
import publishRoutes from './routes/publish.js';
import recommendRoutes from './routes/recommend.js';
import authRoutes from './routes/auth.js';
import schemasRoutes from './routes/schemas.js';
import resolveRoutes from './routes/resolve.js';
import compatRoutes from './routes/compat.js';

// ── Initialize database ──────────────────────────────────────────
initDb();

// ── Validate production config ───────────────────────────────────
validateProductionConfig();

// ── App ──────────────────────────────────────────────────────────
const app = new Hono();

// Global middleware
app.use('*', errorHandler());
app.use('*', corsMiddleware());
app.use('*', optionalAuth());

// Mount routes
app.route('/', healthRoutes);
app.route('/v1/search', searchRoutes);
app.route('/v1/content', contentRoutes);
app.route('/v1/publish', publishRoutes);
app.route('/v1/recommend', recommendRoutes);
app.route('/v1/resolve', resolveRoutes);
app.route('/v1/compat', compatRoutes);
app.route('/auth', authRoutes);
app.route('/schemas', schemasRoutes);

// 404 fallback
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// ── Start server ─────────────────────────────────────────────────
const port = config.port;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Decantr Registry listening on http://localhost:${info.port}`);
});

export { app };
