import { Hono } from 'hono';
import type { Env } from '../types.js';
import { PUBLIC_SCHEMAS } from '../lib/schema-catalog.js';

export const schemaRoutes = new Hono<Env>();

schemaRoutes.get('/schema/:name', (c) => {
  const name = c.req.param('name');
  const schema = PUBLIC_SCHEMAS[name];

  if (!schema) {
    return c.json({
      error: 'Schema not found',
      available: Object.keys(PUBLIC_SCHEMAS).sort(),
    }, 404);
  }

  return c.json(schema);
});
