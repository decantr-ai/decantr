/**
 * GET /v1/recommend — AI-native content recommendations.
 */

import { Hono } from 'hono';
import { getDb } from '../db/index.js';
import { getRecommendations } from '../services/recommend.js';
import { rateLimit } from '../middleware/rate-limit.js';

const app = new Hono();

app.use(rateLimit({ max: 60, windowMs: 60_000, prefix: 'recommend' }));

app.get('/', (c) => {
  const db = getDb();
  const params = {
    terroir: c.req.query('terroir'),
    character: c.req.query('character'),
    style: c.req.query('style'),
    existing: c.req.query('existing'),
  };

  const result = getRecommendations(db, params);
  return c.json(result);
});

export default app;
