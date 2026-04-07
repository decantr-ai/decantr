import { serve } from '@hono/node-server';
import type { ServerType } from '@hono/node-server';
import { createApp } from './app.js';
import { createAdminClient } from './db/client.js';
import { logger } from './lib/logger.js';

const app = createApp();
const port = parseInt(process.env.PORT || '3001', 10);

let server: ServerType;

server = serve({ fetch: app.fetch, port }, async () => {
  logger.info({ port }, 'Decantr API v2 started');

  // Warm up Supabase connection to prevent first-request failures
  try {
    const client = createAdminClient();
    const { count } = await client.from('content').select('id', { count: 'exact', head: true }).limit(1);
    logger.info({ contentCount: count }, 'Supabase connected');
  } catch (e) {
    logger.error({ err: e }, 'Supabase warmup failed');
  }
});

// Graceful shutdown — drain in-flight requests on SIGTERM/SIGINT
function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  // Force exit after 30s if connections aren't drained
  setTimeout(() => {
    logger.error('Forced shutdown after 30s timeout');
    process.exit(1);
  }, 30_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
