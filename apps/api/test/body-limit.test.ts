import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('request body limit', () => {
  it('rejects a streamed body over the limit without a content-length header', async () => {
    let chunks = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (chunks++ < 11) controller.enqueue(new Uint8Array(1024 * 1024));
        else controller.close();
      },
    });
    const request = new Request('http://localhost/v1/packs/select', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: stream,
      duplex: 'half',
    } as RequestInit);

    const response = await createApp().fetch(request);
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: 'Request body too large' });
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('preserves small streamed requests and preflight responses', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{}'));
        controller.close();
      },
    });
    const request = new Request('http://localhost/v1/packs/select', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: stream,
      duplex: 'half',
    } as RequestInit);
    const app = createApp();
    const response = await app.fetch(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Body must include an essence document.' });
    expect((await app.request('/v1/packs/select', { method: 'OPTIONS' })).status).toBe(204);
  });

  it('rejects a declared oversized body without consuming it', async () => {
    const response = await createApp().request('/v1/packs/select', {
      method: 'POST',
      headers: { 'content-length': String(10 * 1024 * 1024 + 1) },
      body: '{}',
    });
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: 'Request body too large' });
  });
});
