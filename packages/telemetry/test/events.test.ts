import { describe, expect, it } from 'vitest';
import { resolveTelemetryActorType } from '../src/events.js';

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
  });
});
