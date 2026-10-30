import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { serve } from '@hono/node-server';
import { expect, it } from 'vitest';
import { createApp } from '../src/app.js';

it('serves health and enforces streamed-body limits through the Node HTTP adapter', async () => {
  const app = createApp();
  const server = serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 0 });
  try {
    await once(server, 'listening');
    const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    expect((await fetch(`${origin}/health`)).status).toBe(200);
    let chunks = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (chunks++ < 11) controller.enqueue(new Uint8Array(1024 * 1024));
        else controller.close();
      },
    });
    const response = await fetch(`${origin}/v1/packs/select`, {
      method: 'POST',
      body,
      duplex: 'half',
      headers: { 'content-type': 'application/json' },
    } as RequestInit);
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: 'Request body too large' });
  } finally {
    if (server.listening) {
      server.closeAllConnections?.();
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  }
}, 15_000);
