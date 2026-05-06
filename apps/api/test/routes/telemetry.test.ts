import { describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';
import { createApp } from '../../src/app.js';
import { telemetryRoutes } from '../../src/routes/telemetry.js';

vi.mock('../../src/db/client.js', () => ({
  createAdminClient: vi.fn(),
  createUserClient: vi.fn(),
}));

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', telemetryRoutes);
  return app;
}

const validEvent = {
  schemaVersion: '0.1.0',
  event: {
    name: 'cli.command.completed',
    timestamp: '2026-05-06T00:00:00.000Z',
    context: {
      source: 'cli',
      environment: 'production',
      projectId: 'project_test',
      installId: 'install_test',
    },
    properties: {
      command: 'refresh',
      success: true,
      durationMs: 123,
      registrySource: 'official',
    },
  },
};

describe('POST /v1/telemetry/events', () => {
  it('accepts schema-versioned public telemetry events', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/telemetry/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validEvent),
    });

    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ accepted: true });
  });

  it('rejects malformed telemetry events', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/telemetry/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: '0.1.0',
        event: {
          name: 'unknown.event',
          context: { source: 'cli' },
          properties: {},
        },
      }),
    });

    expect(res.status).toBe(400);
  });

  it('remains callable through the full app middleware stack', async () => {
    const app = createApp();
    const res = await app.request('/v1/telemetry/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validEvent),
    });

    expect(res.status).toBe(202);
  });
});
