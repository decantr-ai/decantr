import { describe, expect, it, vi } from 'vitest';
import type { DecantrTelemetryEvent } from '../src/events.js';
import { createPostHogTelemetrySink } from '../src/posthog.js';

describe('PostHog telemetry sink', () => {
  it('maps Decantr events to the PostHog capture API', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    const sink = createPostHogTelemetrySink({
      apiKey: 'ph_test_key',
      fetch: fetchMock,
      host: 'https://us.i.posthog.com/',
    });
    const event: DecantrTelemetryEvent = {
      name: 'audit.completed',
      timestamp: '2026-05-06T12:00:00.000Z',
      context: {
        source: 'api',
        environment: 'production',
        serviceName: 'decantr-api',
        serviceVersion: '2.0.0',
        userId: 'user_123',
        orgId: 'org_123',
        projectId: 'project_123',
        registrySource: 'official',
      },
      properties: {
        scope: 'hosted',
        success: true,
        durationMs: 1320,
        errorCount: 0,
        warnCount: 1,
        score: 94,
      },
    };

    await sink.capture(event);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://us.i.posthog.com/i/v0/e/',
      expect.objectContaining({ method: 'POST' }),
    );

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({
      api_key: 'ph_test_key',
      event: 'audit.completed',
      distinct_id: 'user_123',
      timestamp: '2026-05-06T12:00:00.000Z',
    });
    expect(body.properties).toMatchObject({
      scope: 'hosted',
      success: true,
      durationMs: 1320,
      $groups: {
        organization: 'org_123',
        project: 'project_123',
      },
      $process_person_profile: false,
      decantr_anonymous_id: null,
      decantr_org_id: 'org_123',
      decantr_project_id: 'project_123',
      decantr_schema_version: '0.1.0',
      decantr_source: 'api',
      decantr_environment: 'production',
      service_name: 'decantr-api',
      service_version: '2.0.0',
    });
  });
});
