import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { createAdminClient } from './db/client.js';

const app = createApp();
const port = parseInt(process.env.PORT || '3001', 10);

serve({ fetch: app.fetch, port }, async () => {
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
