import type { TelemetrySink } from './client.js';
import {
  DECANTR_TELEMETRY_SCHEMA_VERSION,
  resolveTelemetryActorType,
  type DecantrTelemetryEvent,
  type TelemetryProperties,
} from './events.js';

export interface PostHogTelemetrySinkOptions {
  apiKey: string;
  fetch?: typeof fetch;
  host?: string;
  processPersonProfile?: boolean;
  timeoutMs?: number;
}

export function createPostHogTelemetrySink(options: PostHogTelemetrySinkOptions): TelemetrySink {
  const host = trimTrailingSlashes(options.host ?? 'https://us.i.posthog.com');
  const fetchImpl = options.fetch ?? globalThis.fetch;

  return {
    async capture(event) {
      const distinctId = resolveDistinctId(event);
      if (!distinctId) {
        throw new Error(
          'PostHog telemetry requires an opaque user, install, project, or anonymous id.',
        );
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 3000);

      try {
        const response = await fetchImpl(`${host}/i/v0/e/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: options.apiKey,
            event: event.name,
            distinct_id: distinctId,
            properties: toPostHogProperties(event, options),
            timestamp: event.timestamp,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`PostHog capture returned HTTP ${response.status}.`);
        }
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

function trimTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47) {
    end -= 1;
  }
  return value.slice(0, end);
}

function resolveDistinctId(event: DecantrTelemetryEvent): string | undefined {
  return (
    event.context.userId ??
    event.context.installId ??
    event.context.projectId ??
    event.context.anonymousId
  );
}

function toPostHogProperties(
  event: DecantrTelemetryEvent,
  options: PostHogTelemetrySinkOptions,
): TelemetryProperties {
  const groups: Record<string, string> = {};
  if (event.context.orgId) groups.organization = event.context.orgId;
  if (event.context.projectId) groups.project = event.context.projectId;

  return {
    ...event.properties,
    $groups: groups,
    $process_person_profile: options.processPersonProfile ?? false,
    decantr_anonymous_id: event.context.anonymousId ?? null,
    decantr_actor_type: resolveTelemetryActorType(event.context),
    decantr_install_id: event.context.installId ?? null,
    decantr_org_id: event.context.orgId ?? null,
    decantr_project_id: event.context.projectId ?? null,
    decantr_session_id: event.context.sessionId ?? null,
    decantr_schema_version: DECANTR_TELEMETRY_SCHEMA_VERSION,
    decantr_source: event.context.source,
    decantr_environment: event.context.environment ?? 'production',
    decantr_version: event.context.decantrVersion ?? null,
    registry_source: event.context.registrySource ?? null,
    service_name: event.context.serviceName ?? null,
    service_version: event.context.serviceVersion ?? null,
  };
}
