import { describe, expect, it } from 'vitest';
import {
  DECANTR_TELEMETRY_EVENT_CATALOG,
  DECANTR_TELEMETRY_EVENT_NAMES,
  isDecantrTelemetrySchemaVersion,
  isTelemetryEventAllowedForSource,
  resolveTelemetryActorType,
} from '../src/events.js';

describe('telemetry actor attribution', () => {
  it('classifies official content CI separately from customers', () => {
    expect(
      resolveTelemetryActorType({
        source: 'content-ci',
        environment: 'production',
        anonymousId: 'content_pipeline',
      }),
    ).toBe('official_pipeline');
  });

  it('classifies known internal opaque ids before customer ids', () => {
    expect(
      resolveTelemetryActorType(
        {
          source: 'api',
          environment: 'production',
          userId: 'user_internal',
          orgId: 'org_customer',
        },
        { internalUserIds: ['user_internal'] },
      ),
    ).toBe('internal');
  });

  it('defaults identified product usage to customer and unauthenticated usage to anonymous', () => {
    expect(
      resolveTelemetryActorType({
        source: 'cli',
        environment: 'production',
        installId: 'install_customer',
      }),
    ).toBe('customer');

    expect(
      resolveTelemetryActorType({
        source: 'registry-web',
        environment: 'production',
        anonymousId: 'registry_web:visitor',
      }),
    ).toBe('anonymous');

    expect(
      resolveTelemetryActorType({
        source: 'marketing-web',
        environment: 'production',
        anonymousId: 'marketing_web:visitor',
      }),
    ).toBe('anonymous');
  });

  it('keeps the public event catalog aligned with event names and sources', () => {
    expect(DECANTR_TELEMETRY_EVENT_CATALOG.map((entry) => entry.name).sort()).toEqual(
      [...DECANTR_TELEMETRY_EVENT_NAMES].sort(),
    );

    expect(isTelemetryEventAllowedForSource('registry_web.page_viewed', 'registry-web')).toBe(true);
    expect(isTelemetryEventAllowedForSource('registry_web.page_viewed', 'cli')).toBe(false);
    expect(isTelemetryEventAllowedForSource('decantr.analyze.completed', 'cli')).toBe(true);
    expect(isTelemetryEventAllowedForSource('telemetry.identity_linked', 'registry-web')).toBe(
      false,
    );
  });

  it('accepts the rollout schema version and the previous public ingest version', () => {
    expect(isDecantrTelemetrySchemaVersion('0.2.0')).toBe(true);
    expect(isDecantrTelemetrySchemaVersion('0.3.0')).toBe(true);
    expect(isDecantrTelemetrySchemaVersion('0.1.0')).toBe(false);
  });
});
