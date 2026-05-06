import {
  createFetchTelemetrySink,
  createNoopTelemetrySink,
  createPostHogTelemetrySink,
  createTelemetryClient,
  resolveTelemetryActorType,
  type DecantrTelemetryEvent,
  type TelemetryActorResolutionOptions,
  type TelemetryContext,
  type TelemetryEnvironment,
  type TelemetrySink,
} from '@decantr/telemetry';
import type { Context } from 'hono';
import type { Env } from '../types.js';
import { logger } from './logger.js';

const TELEMETRY_TIMEOUT_MS = 3000;

let client: ReturnType<typeof createTelemetryClient> | null = null;

type ApiTelemetryEventInput = Omit<DecantrTelemetryEvent, 'context'> & {
  context?: Partial<TelemetryContext>;
};

export function emitApiTelemetry(
  c: Context<Env>,
  event: ApiTelemetryEventInput,
): void {
  const telemetry = getApiTelemetryClient();
  const auth = c.get('auth');

  void telemetry.capture({
    ...event,
    context: createApiTelemetryContext({
      anonymousId: auth?.user?.id ? undefined : 'api:anonymous',
      userId: auth?.user?.id,
      orgId: auth?.apiKeyOrgId ?? undefined,
      registrySource: c.req.query('namespace') === '@official' ? 'official' : undefined,
      ...event.context,
    }),
  } as DecantrTelemetryEvent);
}

export function emitApiServiceTelemetry(event: ApiTelemetryEventInput): void {
  const telemetry = getApiTelemetryClient();
  void telemetry.capture({
    ...event,
    context: createApiTelemetryContext({
      anonymousId: event.context?.userId ? undefined : 'api:anonymous',
      ...event.context,
    }),
  } as DecantrTelemetryEvent);
}

export function captureTelemetryEvent(event: DecantrTelemetryEvent): void {
  const telemetry = getApiTelemetryClient();
  void telemetry.capture({
    ...event,
    context: normalizeTelemetryContext(event.context),
  } as DecantrTelemetryEvent);
}

function createApiTelemetryContext(context: Partial<TelemetryContext>): TelemetryContext {
  return normalizeTelemetryContext({
    source: 'api',
    environment: getTelemetryEnvironment(),
    serviceName: 'decantr-api',
    serviceVersion: process.env.DECANTR_API_VERSION,
    ...context,
  });
}

function normalizeTelemetryContext(context: TelemetryContext): TelemetryContext {
  const normalized: TelemetryContext = {
    environment: getTelemetryEnvironment(),
    ...context,
  };
  const serverResolvedActorType = resolveTelemetryActorType(
    { ...normalized, actorType: undefined },
    getInternalActorOptions(),
  );

  return {
    ...normalized,
    actorType:
      serverResolvedActorType === 'internal' || serverResolvedActorType === 'official_pipeline'
        ? serverResolvedActorType
        : resolveTelemetryActorType(normalized, getInternalActorOptions()),
  };
}

function getApiTelemetryClient(): ReturnType<typeof createTelemetryClient> {
  if (client) return client;

  client = createTelemetryClient({
    enabled: process.env.NODE_ENV !== 'test' && process.env.DECANTR_TELEMETRY_DISABLED !== 'true',
    sink: createConfiguredSink(),
    onError(error, event) {
      logger.debug({ err: error, event: event.name }, 'Telemetry event dropped');
    },
  });

  return client;
}

function createConfiguredSink(): TelemetrySink {
  const sinks: TelemetrySink[] = [];

  if (process.env.POSTHOG_PROJECT_TOKEN) {
    sinks.push(createPostHogTelemetrySink({
      apiKey: process.env.POSTHOG_PROJECT_TOKEN,
      host: process.env.POSTHOG_HOST,
      timeoutMs: TELEMETRY_TIMEOUT_MS,
    }));
  }

  if (process.env.DECANTR_TELEMETRY_ENDPOINT) {
    sinks.push(createFetchTelemetrySink({
      endpoint: process.env.DECANTR_TELEMETRY_ENDPOINT,
      headers: () => process.env.DECANTR_TELEMETRY_TOKEN
        ? { Authorization: `Bearer ${process.env.DECANTR_TELEMETRY_TOKEN}` }
        : {},
      timeoutMs: TELEMETRY_TIMEOUT_MS,
    }));
  }

  if (sinks.length === 0) {
    return createNoopTelemetrySink();
  }

  return {
    async capture(event) {
      await Promise.allSettled(sinks.map((sink) => sink.capture(event)));
    },
    async flush() {
      await Promise.allSettled(sinks.map((sink) => sink.flush?.()));
    },
  };
}

function getTelemetryEnvironment(): TelemetryEnvironment {
  const value = process.env.VERCEL_ENV ?? process.env.NODE_ENV;
  if (value === 'development' || value === 'preview' || value === 'test') {
    return value;
  }
  return 'production';
}

function getInternalActorOptions(): TelemetryActorResolutionOptions {
  return {
    internalAnonymousIds: parseCsvEnv('DECANTR_INTERNAL_ANONYMOUS_IDS'),
    internalInstallIds: parseCsvEnv('DECANTR_INTERNAL_INSTALL_IDS'),
    internalOrgIds: parseCsvEnv('DECANTR_INTERNAL_ORG_IDS'),
    internalProjectIds: parseCsvEnv('DECANTR_INTERNAL_PROJECT_IDS'),
    internalUserIds: parseCsvEnv('DECANTR_INTERNAL_USER_IDS'),
  };
}

function parseCsvEnv(key: string): string[] {
  return (process.env[key] ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}
