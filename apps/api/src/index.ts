import { serve } from '@hono/node-server';
import type { ServerType } from '@hono/node-server';
import { createApp } from './app.js';
import { logger } from './lib/logger.js';

const app = createApp();
const port = parseInt(process.env.PORT || '3000', 10);

const server: ServerType = serve({ fetch: app.fetch, port }, () => {
  logger.info({ port }, 'Decantr content API started');
});

function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after 30s timeout');
    process.exit(1);
  }, 30_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
