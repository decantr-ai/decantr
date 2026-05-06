import {
  DECANTR_TELEMETRY_SCHEMA_VERSION,
  isDecantrTelemetryEventName,
  isTelemetryActorType,
  type DecantrTelemetryEvent,
  type TelemetrySource,
} from '@decantr/telemetry';
import { Hono } from 'hono';
import type { Env } from '../types.js';
import { captureTelemetryEvent } from '../lib/telemetry.js';

export const telemetryRoutes = new Hono<Env>();

const ALLOWED_PUBLIC_SOURCES = new Set<TelemetrySource>([
  'cli',
  'content-ci',
  'mcp',
  'registry-web',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPublicTelemetrySource(value: unknown): value is TelemetrySource {
  return typeof value === 'string' && ALLOWED_PUBLIC_SOURCES.has(value as TelemetrySource);
}

function parseTelemetryEvent(body: unknown): DecantrTelemetryEvent | null {
  if (!isRecord(body) || body.schemaVersion !== DECANTR_TELEMETRY_SCHEMA_VERSION) {
    return null;
  }

  const event = body.event;
  if (!isRecord(event) || typeof event.name !== 'string' || !isDecantrTelemetryEventName(event.name)) {
    return null;
  }

  if (!isRecord(event.context) || !isPublicTelemetrySource(event.context.source)) {
    return null;
  }

  if (
    'actorType' in event.context &&
    event.context.actorType !== undefined &&
    event.context.actorType !== null &&
    !isTelemetryActorType(event.context.actorType)
  ) {
    return null;
  }

  if (!isRecord(event.properties)) {
    return null;
  }

  return event as unknown as DecantrTelemetryEvent;
}

telemetryRoutes.post('/telemetry/events', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const event = parseTelemetryEvent(body);
  if (!event) {
    return c.json({ error: 'Invalid telemetry event' }, 400);
  }

  captureTelemetryEvent(event);
  return c.json({ accepted: true }, 202);
});
