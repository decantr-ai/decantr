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
      actorType: 'customer',
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

  it('accepts registry web telemetry events for the public product surface', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/telemetry/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: '0.1.0',
        event: {
          name: 'registry_web.page_viewed',
          timestamp: '2026-05-06T00:00:00.000Z',
          context: {
            source: 'registry-web',
            environment: 'production',
            anonymousId: 'registry_web:test',
          },
          properties: {
            authenticated: false,
            route: 'browse',
            routePath: '/browse',
            surface: 'registry_browser',
          },
        },
      }),
    });

    expect(res.status).toBe(202);
  });

  it('accepts marketing web telemetry events for the public acquisition surface', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/telemetry/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: '0.1.0',
        event: {
          name: 'marketing_web.cta_clicked',
          timestamp: '2026-05-06T00:00:00.000Z',
          context: {
            source: 'marketing-web',
            environment: 'production',
            anonymousId: 'marketing_web:test',
          },
          properties: {
            attributionClickIdPresent: false,
            attributionLandingPath: '/',
            attributionUtmCampaign: 'founder-test',
            destination: 'registry',
            label: 'Browse the Registry',
            surface: 'registry',
          },
        },
      }),
    });

    expect(res.status).toBe(202);
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

  it('rejects telemetry events with unknown actor attribution', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/telemetry/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...validEvent,
        event: {
          ...validEvent.event,
          context: {
            ...validEvent.event.context,
            actorType: 'team-member',
          },
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
