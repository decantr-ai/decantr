/**
 * GET /schemas/manifest.v1.json — JSON Schema for decantr.registry.json.
 */

import { Hono } from 'hono';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let schema;
try {
  schema = JSON.parse(readFileSync(join(__dirname, '../../schemas/manifest.v1.json'), 'utf-8'));
} catch {
  schema = { error: 'Schema not found' };
}

const app = new Hono();

app.get('/manifest.v1.json', (c) => {
  c.header('Content-Type', 'application/schema+json');
  return c.json(schema);
});

export default app;
