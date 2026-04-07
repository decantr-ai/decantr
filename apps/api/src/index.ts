import { serve } from '@hono/node-server';
import type { ServerType } from '@hono/node-server';
import { createApp } from './app.js';
import { createAdminClient } from './db/client.js';

const app = createApp();
const port = parseInt(process.env.PORT || '3001', 10);

let server: ServerType;

server = serve({ fetch: app.fetch, port }, async () => {
  console.log(`Decantr API v2 running at http://localhost:${port}`);

  // Warm up Supabase connection to prevent first-request failures
  try {
    const client = createAdminClient();
    const { count } = await client.from('content').select('id', { count: 'exact', head: true }).limit(1);
    console.log(`Supabase connected (${count} content items)`);
  } catch (e) {
    console.error('Supabase warmup failed:', (e as Error).message);
  }
});

// Graceful shutdown — drain in-flight requests on SIGTERM/SIGINT
function shutdown(signal: string) {
  console.log(`${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  // Force exit after 30s if connections aren't drained
  setTimeout(() => {
    console.error('Forced shutdown after 30s timeout');
    process.exit(1);
  }, 30_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
