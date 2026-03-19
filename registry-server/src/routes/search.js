/**
 * GET /v1/search — full-text search with filtering and pagination.
 */

import { Hono } from 'hono';
import { getDb } from '../db/index.js';
import { searchContent } from '../services/search.js';
import { rateLimit } from '../middleware/rate-limit.js';

const app = new Hono();

app.use(rateLimit({ max: 100, windowMs: 60_000, prefix: 'search' }));

app.get('/', (c) => {
  const db = getDb();
  const params = {
    q: c.req.query('q') || '',
    type: c.req.query('type'),
    character: c.req.query('character'),
    terroir: c.req.query('terroir'),
    style: c.req.query('style'),
    sort: c.req.query('sort'),
    page: c.req.query('page'),
    limit: c.req.query('limit'),
  };

  const result = searchContent(db, params);
  return c.json(result);
});

export default app;
