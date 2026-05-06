export const DECANTR_TELEMETRY_SCHEMA_VERSION = '0.1.0';

export type TelemetrySource = 'api' | 'cli' | 'content-ci' | 'mcp' | 'registry-web';
export type TelemetryEnvironment = 'development' | 'preview' | 'production' | 'test';
export type RegistrySource = 'cache' | 'custom' | 'none' | 'official' | 'private';
export type WorkflowMode =
  | 'brownfield-attach'
  | 'greenfield-contract-only'
  | 'greenfield-scaffold'
  | 'hybrid-compose';
export type AdoptionMode = 'contract-only' | 'decantr-css' | 'style-bridge';
export type ProjectScope = 'single-app' | 'workspace-app';
export type TelemetryContentType = 'archetype' | 'blueprint' | 'pattern' | 'shell' | 'theme';
export type TelemetryVisibility = 'private' | 'public' | 'team';
export type TelemetryAnalysisScope = 'hosted' | 'local';

export const DECANTR_TELEMETRY_EVENT_NAMES = [
  'api_key.created',
  'audit.completed',
  'cli.command.completed',
  'content.publish.completed',
  'content.validation.completed',
  'critique.completed',
  'execution_pack.compiled',
  'execution_pack.selected',
  'org.created',
  'registry.item.resolved',
  'registry.sync.completed',
  'user.signup.completed',
] as const;

export type DecantrTelemetryEventName = (typeof DECANTR_TELEMETRY_EVENT_NAMES)[number];

export type TelemetryPropertyValue =
  | TelemetryPropertyValue[]
  | boolean
  | null
  | number
  | string
  | undefined
  | { [key: string]: TelemetryPropertyValue };

export type TelemetryProperties = Record<string, TelemetryPropertyValue>;

export interface TelemetryContext {
  source: TelemetrySource;
  environment?: TelemetryEnvironment;
  serviceName?: string;
  serviceVersion?: string;
  decantrVersion?: string;
  registrySource?: RegistrySource;
  anonymousId?: string;
  installId?: string;
  projectId?: string;
  sessionId?: string;
  userId?: string;
  orgId?: string;
}

export interface TelemetryEventBase<
  Name extends DecantrTelemetryEventName = DecantrTelemetryEventName,
  Properties extends TelemetryProperties = TelemetryProperties,
> {
  name: Name;
  context: TelemetryContext;
  properties: Properties;
  timestamp?: Date | string;
}

export interface CliCommandCompletedProperties extends TelemetryProperties {
  command: string;
  success: boolean;
  durationMs: number;
  adoptionMode?: AdoptionMode;
  errorCode?: string;
  offline?: boolean;
  projectScope?: ProjectScope;
  registrySource?: RegistrySource;
  targetFramework?: string;
  workflowMode?: WorkflowMode;
}

export interface RegistryItemResolvedProperties extends TelemetryProperties {
  contentType: TelemetryContentType;
  success: boolean;
  cacheHit?: boolean;
  durationMs?: number;
  errorCode?: string;
  itemId?: string;
  namespace?: string;
  registrySource?: RegistrySource;
  version?: string;
  visibility?: TelemetryVisibility;
}

export interface RegistrySyncCompletedProperties extends TelemetryProperties {
  success: boolean;
  durationMs: number;
  errorCode?: string;
  registrySource?: RegistrySource;
  totalItems?: number;
}

export interface ExecutionPackCompiledProperties extends TelemetryProperties {
  success: boolean;
  durationMs: number;
  errorCode?: string;
  pageCount?: number;
  patternCount?: number;
  sectionCount?: number;
  targetFramework?: string;
}

export interface ExecutionPackSelectedProperties extends TelemetryProperties {
  packType: 'mutation' | 'page' | 'review' | 'scaffold' | 'section';
  success: boolean;
  durationMs?: number;
  errorCode?: string;
  id?: string;
}

export interface AuditCompletedProperties extends TelemetryProperties {
  scope: TelemetryAnalysisScope;
  success: boolean;
  durationMs: number;
  errorCode?: string;
  errorCount?: number;
  pageCount?: number;
  runtimePassed?: boolean;
  score?: number;
  warnCount?: number;
}

export interface CritiqueCompletedProperties extends TelemetryProperties {
  scope: TelemetryAnalysisScope;
  success: boolean;
  durationMs: number;
  errorCode?: string;
  errorCount?: number;
  infoCount?: number;
  overall?: number;
  warnCount?: number;
}

export interface ContentValidationCompletedProperties extends TelemetryProperties {
  valid: boolean;
  contentType?: TelemetryContentType;
  durationMs?: number;
  errorCount?: number;
  itemCount?: number;
  warningCount?: number;
}

export interface ContentPublishCompletedProperties extends TelemetryProperties {
  contentType: TelemetryContentType;
  success: boolean;
  durationMs: number;
  errorCode?: string;
  namespace?: string;
  visibility?: TelemetryVisibility;
}

export interface ProductEventProperties extends TelemetryProperties {
  success?: boolean;
  channel?: string;
  entrypoint?: string;
  plan?: string;
}

export type DecantrTelemetryEvent =
  | TelemetryEventBase<'api_key.created', ProductEventProperties>
  | TelemetryEventBase<'audit.completed', AuditCompletedProperties>
  | TelemetryEventBase<'cli.command.completed', CliCommandCompletedProperties>
  | TelemetryEventBase<'content.publish.completed', ContentPublishCompletedProperties>
  | TelemetryEventBase<'content.validation.completed', ContentValidationCompletedProperties>
  | TelemetryEventBase<'critique.completed', CritiqueCompletedProperties>
  | TelemetryEventBase<'execution_pack.compiled', ExecutionPackCompiledProperties>
  | TelemetryEventBase<'execution_pack.selected', ExecutionPackSelectedProperties>
  | TelemetryEventBase<'org.created', ProductEventProperties>
  | TelemetryEventBase<'registry.item.resolved', RegistryItemResolvedProperties>
  | TelemetryEventBase<'registry.sync.completed', RegistrySyncCompletedProperties>
  | TelemetryEventBase<'user.signup.completed', ProductEventProperties>;

export function isDecantrTelemetryEventName(value: string): value is DecantrTelemetryEventName {
  return (DECANTR_TELEMETRY_EVENT_NAMES as readonly string[]).includes(value);
}
