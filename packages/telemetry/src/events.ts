export const DECANTR_TELEMETRY_SCHEMA_VERSION = '0.1.0';

export type TelemetrySource =
  | 'api'
  | 'cli'
  | 'content-ci'
  | 'marketing-web'
  | 'mcp'
  | 'registry-web';
export type TelemetryEnvironment = 'development' | 'preview' | 'production' | 'test';
export const DECANTR_TELEMETRY_ACTOR_TYPES = [
  'anonymous',
  'customer',
  'internal',
  'official_pipeline',
  'service',
] as const;
export type TelemetryActorType = (typeof DECANTR_TELEMETRY_ACTOR_TYPES)[number];
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
  'marketing_web.command_clicked',
  'marketing_web.cta_clicked',
  'marketing_web.outbound_clicked',
  'marketing_web.page_viewed',
  'org.created',
  'registry_web.api_key_page_viewed',
  'registry_web.billing_viewed',
  'registry_web.content_opened',
  'registry_web.identity_linked',
  'registry_web.organization_viewed',
  'registry_web.page_viewed',
  'registry_web.search_performed',
  'registry_web.signup_clicked',
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
  actorType?: TelemetryActorType;
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

export interface TelemetryActorResolutionOptions {
  internalAnonymousIds?: readonly string[] | ReadonlySet<string>;
  internalInstallIds?: readonly string[] | ReadonlySet<string>;
  internalOrgIds?: readonly string[] | ReadonlySet<string>;
  internalProjectIds?: readonly string[] | ReadonlySet<string>;
  internalUserIds?: readonly string[] | ReadonlySet<string>;
}

export function isTelemetryActorType(value: unknown): value is TelemetryActorType {
  return (
    typeof value === 'string' &&
    (DECANTR_TELEMETRY_ACTOR_TYPES as readonly string[]).includes(value)
  );
}

export function resolveTelemetryActorType(
  context: TelemetryContext,
  options: TelemetryActorResolutionOptions = {},
): TelemetryActorType {
  if (context.actorType) return context.actorType;

  if (context.source === 'content-ci') {
    return 'official_pipeline';
  }

  if (matchesInternalActor(context, options)) {
    return 'internal';
  }

  if (context.userId || context.orgId || context.projectId || context.installId) {
    return 'customer';
  }

  if (context.anonymousId) {
    return 'anonymous';
  }

  return 'service';
}

function matchesInternalActor(
  context: TelemetryContext,
  options: TelemetryActorResolutionOptions,
): boolean {
  return (
    idListHas(options.internalAnonymousIds, context.anonymousId) ||
    idListHas(options.internalInstallIds, context.installId) ||
    idListHas(options.internalOrgIds, context.orgId) ||
    idListHas(options.internalProjectIds, context.projectId) ||
    idListHas(options.internalUserIds, context.userId)
  );
}

function idListHas(
  values: readonly string[] | ReadonlySet<string> | undefined,
  value: string | undefined,
): boolean {
  if (!values || !value) return false;
  if (typeof (values as ReadonlySet<string>).has === 'function') {
    return (values as ReadonlySet<string>).has(value);
  }
  return (values as readonly string[]).includes(value);
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

export interface CampaignAttributionProperties extends TelemetryProperties {
  attributionClickIdProvider?: string | null;
  attributionClickIdPresent?: boolean;
  attributionFirstLandingPath?: string | null;
  attributionFirstReferrerDomain?: string | null;
  attributionFirstUtmCampaign?: string | null;
  attributionFirstUtmContent?: string | null;
  attributionFirstUtmId?: string | null;
  attributionFirstUtmMedium?: string | null;
  attributionFirstUtmSource?: string | null;
  attributionFirstUtmTerm?: string | null;
  attributionLandingPath?: string | null;
  attributionLastLandingPath?: string | null;
  attributionLastReferrerDomain?: string | null;
  attributionLastUtmCampaign?: string | null;
  attributionLastUtmContent?: string | null;
  attributionLastUtmId?: string | null;
  attributionLastUtmMedium?: string | null;
  attributionLastUtmSource?: string | null;
  attributionLastUtmTerm?: string | null;
  attributionReferrerDomain?: string | null;
  attributionUtmCampaign?: string | null;
  attributionUtmContent?: string | null;
  attributionUtmId?: string | null;
  attributionUtmMedium?: string | null;
  attributionUtmSource?: string | null;
  attributionUtmTerm?: string | null;
}

export interface MarketingWebPageViewedProperties extends CampaignAttributionProperties {
  routePath: string;
  surface: string;
}

export interface MarketingWebCtaClickedProperties extends CampaignAttributionProperties {
  destination: string;
  label?: string | null;
  surface: string;
}

export interface MarketingWebOutboundClickedProperties extends CampaignAttributionProperties {
  destination: string;
  label?: string | null;
  surface: string;
}

export interface MarketingWebCommandClickedProperties extends CampaignAttributionProperties {
  commandKind: 'cli' | 'mcp' | 'other';
  commandLabel?: string | null;
  surface: string;
}

export interface RegistryWebPageViewedProperties extends CampaignAttributionProperties {
  authenticated: boolean;
  orgScoped?: boolean;
  plan?: string;
  queryPresent?: boolean;
  route: string;
  routePath: string;
  surface: string;
}

export interface RegistryWebSearchPerformedProperties extends CampaignAttributionProperties {
  contentType?: string;
  queryLength: number;
  resultCount?: number;
  sort?: string;
  sourceFilter?: string;
  surface: string;
}

export interface RegistryWebContentOpenedProperties extends CampaignAttributionProperties {
  contentSource?: string;
  contentType: string;
  namespace?: string;
  slug?: string;
  surface: string;
}

export interface RegistryWebCommercialPageViewedProperties extends CampaignAttributionProperties {
  orgScoped?: boolean;
  plan?: string;
  surface: string;
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
  | TelemetryEventBase<'marketing_web.command_clicked', MarketingWebCommandClickedProperties>
  | TelemetryEventBase<'marketing_web.cta_clicked', MarketingWebCtaClickedProperties>
  | TelemetryEventBase<'marketing_web.outbound_clicked', MarketingWebOutboundClickedProperties>
  | TelemetryEventBase<'marketing_web.page_viewed', MarketingWebPageViewedProperties>
  | TelemetryEventBase<'org.created', ProductEventProperties>
  | TelemetryEventBase<'registry_web.api_key_page_viewed', RegistryWebCommercialPageViewedProperties>
  | TelemetryEventBase<'registry_web.billing_viewed', RegistryWebCommercialPageViewedProperties>
  | TelemetryEventBase<'registry_web.content_opened', RegistryWebContentOpenedProperties>
  | TelemetryEventBase<'registry_web.identity_linked', RegistryWebCommercialPageViewedProperties>
  | TelemetryEventBase<'registry_web.organization_viewed', RegistryWebCommercialPageViewedProperties>
  | TelemetryEventBase<'registry_web.page_viewed', RegistryWebPageViewedProperties>
  | TelemetryEventBase<'registry_web.search_performed', RegistryWebSearchPerformedProperties>
  | TelemetryEventBase<'registry_web.signup_clicked', RegistryWebCommercialPageViewedProperties>
  | TelemetryEventBase<'registry.item.resolved', RegistryItemResolvedProperties>
  | TelemetryEventBase<'registry.sync.completed', RegistrySyncCompletedProperties>
  | TelemetryEventBase<'user.signup.completed', ProductEventProperties>;

export function isDecantrTelemetryEventName(value: string): value is DecantrTelemetryEventName {
  return (DECANTR_TELEMETRY_EVENT_NAMES as readonly string[]).includes(value);
}
