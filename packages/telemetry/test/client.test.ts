import { describe, expect, it, vi } from 'vitest';
import { createFetchTelemetrySink, createTelemetryClient } from '../src/client.js';
import type { DecantrTelemetryEvent } from '../src/events.js';

describe('telemetry client', () => {
  it('merges default context and sends schema-versioned events to a fetch sink', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    const sink = createFetchTelemetrySink({
      endpoint: 'https://api.decantr.ai/v1/telemetry/events',
      fetch: fetchMock,
      headers: () => ({ Authorization: 'Bearer test' }),
    });
    const client = createTelemetryClient({
      context: {
        source: 'api',
        environment: 'production',
        serviceName: 'decantr-api',
      },
      sink,
    });

    const event: DecantrTelemetryEvent = {
      name: 'registry.item.resolved',
      timestamp: '2026-05-06T12:00:00.000Z',
      context: {
        source: 'api',
        projectId: 'project_123',
        registrySource: 'official',
      },
      properties: {
        contentType: 'pattern',
        itemId: 'hero-split',
        namespace: '@official',
        success: true,
      },
    };

    await client.capture(event);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.decantr.ai/v1/telemetry/events',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test',
          'Content-Type': 'application/json',
        }),
      }),
    );

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.schemaVersion).toBe('0.3.0');
    expect(body.event.context).toEqual({
      source: 'api',
      environment: 'production',
      serviceName: 'decantr-api',
      projectId: 'project_123',
      registrySource: 'official',
    });
  });
});
