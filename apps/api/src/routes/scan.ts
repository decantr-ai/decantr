import { Hono } from 'hono';
import type { Env } from '../types.js';
import { runHostedScan } from '../lib/hosted-scan.js';

export const scanRoutes = new Hono<Env>();

function parseScanUrl(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return null;
  const value = (payload as { url?: unknown }).url;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 300) return null;
  return trimmed;
}

scanRoutes.post('/scan', async (c) => {
  let payload: unknown;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Request body must be JSON.' }, 400);
  }

  const url = parseScanUrl(payload);
  if (!url) {
    return c.json({ error: 'Provide a GitHub repository URL or GitHub Pages URL in `url`.' }, 400);
  }

  try {
    const report = await runHostedScan(url);
    return c.json(report);
  } catch (error) {
    if (error instanceof Error && error.name === 'HostedScanCapacityError') {
      return c.json({ error: error.message, retryAfter: 15 }, 429);
    }

    return c.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Decantr could not start the hosted scan.',
      },
      400,
    );
  }
});
