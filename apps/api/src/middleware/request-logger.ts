import { randomUUID } from 'node:crypto';
import type { Context, Next } from 'hono';
import type { Env } from '../types.js';
import { logger } from '../lib/logger.js';

export function requestLogger() {
  return async (c: Context<Env>, next: Next) => {
    const requestId = randomUUID();
    const start = Date.now();

    c.set('requestId' as any, requestId);
    c.header('X-Request-ID', requestId);

    await next();

    const duration = Date.now() - start;
    const status = c.res.status;

    logger.info({
      requestId,
      method: c.req.method,
      path: c.req.path,
      status,
      durationMs: duration,
    }, `${c.req.method} ${c.req.path} ${status}`);
  };
}
