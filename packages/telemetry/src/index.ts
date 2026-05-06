export type {
  FetchTelemetrySinkOptions,
  TelemetryClient,
  TelemetryClientOptions,
  TelemetrySink,
} from './client.js';
export {
  createFetchTelemetrySink,
  createNoopTelemetrySink,
  createTelemetryClient,
} from './client.js';
export type {
  AdoptionMode,
  AuditCompletedProperties,
  CliCommandCompletedProperties,
  ContentPublishCompletedProperties,
  ContentValidationCompletedProperties,
  CritiqueCompletedProperties,
  DecantrTelemetryEvent,
  DecantrTelemetryEventName,
  ExecutionPackCompiledProperties,
  ExecutionPackSelectedProperties,
  ProductEventProperties,
  ProjectScope,
  RegistryItemResolvedProperties,
  RegistrySource,
  RegistrySyncCompletedProperties,
  TelemetryAnalysisScope,
  TelemetryContentType,
  TelemetryContext,
  TelemetryEnvironment,
  TelemetryProperties,
  TelemetryPropertyValue,
  TelemetrySource,
  TelemetryVisibility,
  WorkflowMode,
} from './events.js';
export {
  DECANTR_TELEMETRY_EVENT_NAMES,
  DECANTR_TELEMETRY_SCHEMA_VERSION,
  isDecantrTelemetryEventName,
} from './events.js';
export type { PostHogTelemetrySinkOptions } from './posthog.js';
export { createPostHogTelemetrySink } from './posthog.js';
export type { TelemetryRedactionOptions } from './privacy.js';
export {
  isSensitiveTelemetryKey,
  REDACTED_VALUE,
  sanitizeTelemetryEvent,
  sanitizeTelemetryValue,
} from './privacy.js';
