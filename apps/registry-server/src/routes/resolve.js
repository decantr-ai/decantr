import { Hono } from 'hono';
import { getDb } from '../db/index.js';
import { resolveDependencies } from '../services/resolver.js';
import { rateLimit } from '../middleware/rate-limit.js';

const app = new Hono();
app.use(rateLimit({ max: 50, windowMs: 60_000, prefix: 'resolve' }));

app.post('/', async (c) => {
  const body = await c.req.json();
  const { items, installed = {}, decantr_version = '0.9.0' } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return c.json({ error: 'items must be a non-empty array' }, 400);
  }

  // Parse specs: "type/id@range" or "type/id"
  const parsed = [];
  for (const spec of items) {
    const match = spec.match(/^([a-z]+)\/([a-z0-9-]+?)(?:@(.+))?$/);
    if (!match) return c.json({ error: `Invalid specifier: "${spec}"` }, 400);
    const type = match[1].endsWith('s') ? match[1].slice(0, -1) : match[1];
    parsed.push({ type, id: match[2], range: match[3] || '*' });
  }

  const db = getDb();
  try {
    const result = resolveDependencies(db, parsed, installed, decantr_version);
    return c.json(result);
  } catch (err) {
    if (err.message.includes('Circular')) return c.json({ error: 'circular_dependency', message: err.message }, 422);
    if (err.message.includes('not found') || err.message.includes('No version')) return c.json({ error: 'unresolvable', message: err.message }, 422);
    return c.json({ error: 'resolve_failed', message: err.message }, 500);
  }
});

export default app;
