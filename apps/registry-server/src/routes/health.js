/**
 * Health check endpoint.
 */

import { Hono } from 'hono';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
let version;
try {
  const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));
  version = pkg.version;
} catch {
  version = 'unknown';
}

const app = new Hono();

app.get('/health', (c) => {
  return c.json({ status: 'ok', version });
});

export default app;
