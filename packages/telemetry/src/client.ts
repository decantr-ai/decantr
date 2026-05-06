import {
  DECANTR_TELEMETRY_SCHEMA_VERSION,
  type DecantrTelemetryEvent,
  type TelemetryContext,
} from './events.js';
import { sanitizeTelemetryEvent, type TelemetryRedactionOptions } from './privacy.js';

export interface TelemetrySink {
  capture(event: DecantrTelemetryEvent): Promise<void> | void;
  flush?(): Promise<void> | void;
}

export interface TelemetryClient {
  capture(event: DecantrTelemetryEvent): Promise<void>;
  flush(): Promise<void>;
}

export interface TelemetryClientOptions {
  context?: Partial<TelemetryContext>;
  enabled?: boolean;
  onError?: (error: unknown, event: DecantrTelemetryEvent) => void;
  redaction?: TelemetryRedactionOptions;
  sink?: TelemetrySink;
}

export interface FetchTelemetrySinkOptions {
  endpoint: string;
  fetch?: typeof fetch;
  headers?: HeadersInit | (() => HeadersInit);
  timeoutMs?: number;
}

export function createNoopTelemetrySink(): TelemetrySink {
  return {
    capture() {
      return undefined;
    },
  };
}

export function createTelemetryClient(options: TelemetryClientOptions = {}): TelemetryClient {
  const enabled = options.enabled ?? true;
  const sink = options.sink ?? createNoopTelemetrySink();
  const pending = new Set<Promise<void>>();

  async function capture(event: DecantrTelemetryEvent): Promise<void> {
    if (!enabled) return;

    const enriched = sanitizeTelemetryEvent(
      {
        ...event,
        context: {
          ...options.context,
          ...event.context,
        },
        timestamp: normalizeTimestamp(event.timestamp),
      } as DecantrTelemetryEvent,
      options.redaction,
    );

    const promise = Promise.resolve()
      .then(() => sink.capture(enriched))
      .catch((error) => {
        options.onError?.(error, enriched);
      })
      .then(() => undefined);

    pending.add(promise);
    promise.finally(() => pending.delete(promise));
    await promise;
  }

  async function flush(): Promise<void> {
    await Promise.allSettled([...pending]);
    await sink.flush?.();
  }

  return { capture, flush };
}

export function createFetchTelemetrySink(options: FetchTelemetrySinkOptions): TelemetrySink {
  const fetchImpl = options.fetch ?? globalThis.fetch;

  return {
    async capture(event) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 3000);

      try {
        const response = await fetchImpl(options.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...normalizeHeaders(
              typeof options.headers === 'function' ? options.headers() : options.headers,
            ),
          },
          body: JSON.stringify({
            schemaVersion: DECANTR_TELEMETRY_SCHEMA_VERSION,
            event,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Telemetry endpoint returned HTTP ${response.status}.`);
        }
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

function normalizeTimestamp(timestamp: Date | string | undefined): string {
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return timestamp ?? new Date().toISOString();
}

function normalizeHeaders(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) return {};

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return headers as Record<string, string>;
}
