import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createFetchTelemetrySink, createTelemetryClient } from '@decantr/telemetry';

const DEFAULT_TELEMETRY_ENDPOINT = 'https://api.decantr.ai/v1/telemetry/events';
const TELEMETRY_TIMEOUT_MS = 3000;

let client = null;
let packageVersion = null;

export async function emitContentTelemetry(event) {
  if (!shouldEmitTelemetry()) {
    return;
  }

  try {
    await getTelemetryClient().capture({
      ...event,
      context: {
        source: 'content-ci',
        environment: getTelemetryEnvironment(),
        serviceName: 'decantr-content',
        serviceVersion: getPackageVersion(),
        projectId: 'content_decantr_content',
        sessionId: getSessionId(),
        registrySource: 'official',
        ...event.context,
      },
    });
  } catch {
    // Telemetry must never fail validation or publish jobs.
  }
}

function getTelemetryClient() {
  if (client) return client;

  client = createTelemetryClient({
    sink: createFetchTelemetrySink({
      endpoint: process.env.DECANTR_TELEMETRY_ENDPOINT || DEFAULT_TELEMETRY_ENDPOINT,
      timeoutMs: TELEMETRY_TIMEOUT_MS,
    }),
  });

  return client;
}

function shouldEmitTelemetry() {
  if (process.env.DECANTR_TELEMETRY_DISABLED === 'true') {
    return false;
  }

  return process.env.CI === 'true'
    || process.env.GITHUB_ACTIONS === 'true'
    || process.env.DECANTR_TELEMETRY_ENABLED === 'true';
}

function getTelemetryEnvironment() {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return process.env.NODE_ENV;
  }
  return 'production';
}

function getSessionId() {
  if (process.env.GITHUB_RUN_ID) {
    return `github:${process.env.GITHUB_RUN_ID}`;
  }
  return undefined;
}

function getPackageVersion() {
  if (packageVersion) return packageVersion;

  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf-8'));
    packageVersion = typeof pkg.version === 'string' ? pkg.version : 'unknown';
  } catch {
    packageVersion = 'unknown';
  }

  return packageVersion;
}
