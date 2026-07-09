import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type AdoptionMode,
  createFetchTelemetrySink,
  createTelemetryClient,
  type DecantrAnalyzeCompletedProperties,
  type DecantrLifecycleCompletedProperties,
  type DecantrTelemetryEvent,
  type DecantrTelemetryEventName,
  type HealthCiFailedProperties,
  type HealthFindingPromptRequestedProperties,
  isTelemetryActorType,
  type ProjectHealthFailOn,
  type ProjectHealthOutputFormat,
  type ProjectHealthTelemetryProperties,
  type ProjectScope,
  type RegistrySource,
  type StudioHealthRefreshedProperties,
  type StudioStartedProperties,
  type TelemetryActorType,
  type TelemetryProperties,
  type WorkflowMode,
} from '@decantr/telemetry';
import type { ProjectHealthFinding, ProjectHealthReport } from '@decantr/verifier';

export interface GuardMetrics {
  timestamp: string;
  cli_version: string;
  essence_version: string;
  guard_mode: string;
  violations: {
    dna: number;
    blueprint: number;
    by_rule: Record<string, number>;
  };
  resolution_rate: number;
  sections_count: number;
  routes_count: number;
  theme: string;
}

const TELEMETRY_TIMEOUT_MS = 3000;

const DNA_RULES = new Set(['theme', 'style', 'density', 'accessibility', 'theme-mode']);

export async function sendGuardMetrics(metrics: GuardMetrics): Promise<void> {
  const endpoint = readConfiguredEndpoint('DECANTR_TELEMETRY_GUARD_ENDPOINT');
  if (!endpoint) return;

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const controller = new AbortController();
    timer = setTimeout(() => controller.abort(), TELEMETRY_TIMEOUT_MS);
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics),
      signal: controller.signal,
    });
  } catch {
    // Fire-and-forget: silently ignore all errors
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function isOptedIn(projectRoot: string): boolean {
  const projectJsonPath = join(projectRoot, '.decantr', 'project.json');
  if (!existsSync(projectJsonPath)) return false;
  try {
    const data = JSON.parse(readFileSync(projectJsonPath, 'utf-8'));
    return data.telemetry === true;
  } catch {
    return false;
  }
}

export function optIn(projectRoot: string): void {
  const projectJsonPath = join(projectRoot, '.decantr', 'project.json');
  let data: Record<string, unknown> = {};
  if (existsSync(projectJsonPath)) {
    try {
      data = JSON.parse(readFileSync(projectJsonPath, 'utf-8'));
    } catch {
      // Start fresh if corrupt
    }
  }
  data.telemetry = true;
  mkdirSync(dirname(projectJsonPath), { recursive: true });
  writeFileSync(projectJsonPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export function optOut(projectRoot: string): void {
  const projectJsonPath = join(projectRoot, '.decantr', 'project.json');
  let data: Record<string, unknown> = {};
  if (existsSync(projectJsonPath)) {
    try {
      data = JSON.parse(readFileSync(projectJsonPath, 'utf-8'));
    } catch {
      return;
    }
  }
  data.telemetry = false;
  mkdirSync(dirname(projectJsonPath), { recursive: true });
  writeFileSync(projectJsonPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export interface CliCommandTelemetryInput {
  args: string[];
  durationMs: number;
  projectRoot?: string;
  success: boolean;
}

export interface CliTelemetryEventInput {
  args?: string[];
  name: DecantrTelemetryEventName;
  projectRoot?: string;
  properties: TelemetryProperties;
  registrySource?: RegistrySource;
}

export async function captureCliTelemetryEvent(input: CliTelemetryEventInput): Promise<void> {
  const projectRoot = resolveCliTelemetryProjectRoot(
    input.projectRoot ?? process.cwd(),
    input.args ?? [],
  );
  if (!isOptedIn(projectRoot)) {
    return;
  }

  const endpoint = getTelemetryEventsEndpoint();
  if (!endpoint) {
    return;
  }

  const identities = ensureTelemetryIdentities(projectRoot);
  if (!identities) {
    return;
  }

  const registrySource =
    input.registrySource ??
    getRegistrySourceProperty(input.properties) ??
    inferRegistrySource(input.args ?? []);

  const client = createTelemetryClient({
    sink: createFetchTelemetrySink({
      endpoint,
      timeoutMs: TELEMETRY_TIMEOUT_MS,
    }),
  });

  const event = {
    name: input.name,
    context: {
      source: 'cli',
      actorType: getTelemetryActorType(),
      environment: 'production',
      decantrVersion: getCliVersion(),
      installId: identities.installId,
      projectId: identities.projectId,
      registrySource,
    },
    properties: input.properties,
  } as DecantrTelemetryEvent;

  try {
    await client.capture(event);
  } catch {
    // Fire-and-forget: silently ignore all errors.
  }
}

export async function sendCliCommandTelemetry(input: CliCommandTelemetryInput): Promise<void> {
  const projectRoot = resolveCliTelemetryProjectRoot(
    input.projectRoot ?? process.cwd(),
    input.args,
  );
  const command = normalizeCommand(input.args[0]);
  if (
    !isOptedIn(projectRoot) ||
    !command ||
    command === 'help' ||
    command === 'version' ||
    isHelpOrVersionProbe(input.args)
  ) {
    return;
  }

  const properties = buildCliLifecycleProperties({
    args: input.args,
    command,
    durationMs: input.durationMs,
    projectRoot,
    success: input.success,
  });

  await captureCliTelemetryEvent({
    args: input.args,
    name: 'cli.command.completed',
    projectRoot,
    properties,
    registrySource: properties.registrySource,
  });

  const lifecycleEventName = lifecycleTelemetryEventName(command);
  if (lifecycleEventName) {
    await captureCliTelemetryEvent({
      args: input.args,
      name: lifecycleEventName,
      projectRoot,
      properties: properties as DecantrLifecycleCompletedProperties,
      registrySource: properties.registrySource,
    });
  }
}

export interface ProjectHealthReportTelemetryInput {
  ci?: boolean;
  durationMs?: number;
  failOn?: ProjectHealthFailOn;
  format?: ProjectHealthOutputFormat;
  outputWritten?: boolean;
  projectRoot?: string;
  report: ProjectHealthReport;
}

export async function sendProjectHealthReportTelemetry(
  input: ProjectHealthReportTelemetryInput,
): Promise<void> {
  const projectRoot = input.projectRoot ?? process.cwd();
  const properties = buildProjectHealthTelemetryProperties(input, projectRoot);

  await captureCliTelemetryEvent({
    name: 'health.report.generated',
    projectRoot,
    properties,
  });

  if (input.report.status === 'healthy') {
    await captureCliTelemetryEvent({
      name: 'decantr.health.healthy',
      projectRoot,
      properties,
    });
  }
}

export interface NewProjectCompletedTelemetryInput {
  args?: string[];
  durationMs: number;
  projectRoot?: string;
  success: boolean;
}

export interface AnalyzeCompletedTelemetryInput {
  componentCount?: number;
  dependencyCategoryCount?: number;
  durationMs?: number;
  pageCount?: number;
  projectRoot?: string;
  routeCount?: number;
  success: boolean;
  targetFramework?: string;
}

export async function sendAnalyzeCompletedTelemetry(
  input: AnalyzeCompletedTelemetryInput,
): Promise<void> {
  const projectRoot = input.projectRoot ?? process.cwd();
  const metadata = readProjectTelemetryMetadata(projectRoot);
  const properties: DecantrAnalyzeCompletedProperties = {
    command: 'analyze',
    success: input.success,
    durationMs: input.durationMs,
    adoptionMode: metadata.adoptionMode ?? 'contract-only',
    componentCount: input.componentCount,
    dependencyCategoryCount: input.dependencyCategoryCount,
    errorCode: input.success ? undefined : 'analyze_failed',
    pageCount: input.pageCount,
    projectScope: metadata.projectScope ?? inferProjectScope(projectRoot),
    routeCount: input.routeCount,
    targetFramework: input.targetFramework,
    workflowMode: metadata.workflowMode ?? 'brownfield-attach',
  };

  await captureCliTelemetryEvent({
    args: ['analyze'],
    name: 'decantr.analyze.completed',
    projectRoot,
    properties,
  });
}

export async function sendNewProjectCompletedTelemetry(
  input: NewProjectCompletedTelemetryInput,
): Promise<void> {
  const projectRoot = input.projectRoot ?? process.cwd();
  const args = input.args ?? ['new'];
  const base = buildCliLifecycleProperties({
    args,
    command: 'new',
    durationMs: input.durationMs,
    projectRoot,
    success: input.success,
  });
  const properties = {
    ...base,
    command: 'new',
  } satisfies DecantrLifecycleCompletedProperties;

  await captureCliTelemetryEvent({
    args,
    name: 'decantr.new.completed',
    projectRoot,
    properties,
    registrySource: properties.registrySource,
  });
}

export interface ProjectHealthPromptTelemetryInput {
  ci?: boolean;
  finding?: ProjectHealthFinding;
  projectRoot?: string;
  report: ProjectHealthReport;
}

export async function sendProjectHealthPromptTelemetry(
  input: ProjectHealthPromptTelemetryInput,
): Promise<void> {
  const projectRoot = input.projectRoot ?? process.cwd();
  const finding = input.finding;
  const properties: HealthFindingPromptRequestedProperties = {
    success: Boolean(finding),
    findingFound: Boolean(finding),
    adoptionMode: normalizeAdoptionMode(input.report.summary.adoptionMode),
    ci: input.ci ?? false,
    findingSeverity: normalizeFindingSeverity(finding?.severity),
    findingSource: normalizeFindingSource(finding?.source),
    projectScope: inferProjectScope(projectRoot),
    workflowMode: normalizeWorkflowMode(input.report.summary.workflowMode),
  };

  await captureCliTelemetryEvent({
    name: 'health.finding.prompt_requested',
    projectRoot,
    properties,
  });
}

export interface ProjectHealthCiFailedTelemetryInput extends ProjectHealthReportTelemetryInput {
  failOn: 'error' | 'warn';
}

export async function sendProjectHealthCiFailedTelemetry(
  input: ProjectHealthCiFailedTelemetryInput,
): Promise<void> {
  const projectRoot = input.projectRoot ?? process.cwd();
  const properties = {
    ...buildProjectHealthTelemetryProperties(input, projectRoot),
    errorCode: 'project_health_ci_failed',
    failOn: input.failOn,
    success: false,
  } satisfies HealthCiFailedProperties;

  await captureCliTelemetryEvent({
    name: 'health.ci.failed',
    projectRoot,
    properties,
  });
}

export interface StudioStartedTelemetryInput {
  host: string;
  port: number;
  projectRoot?: string;
}

export async function sendStudioStartedTelemetry(
  input: StudioStartedTelemetryInput,
): Promise<void> {
  const projectRoot = input.projectRoot ?? process.cwd();
  const metadata = readProjectTelemetryMetadata(projectRoot);
  const properties: StudioStartedProperties = {
    success: true,
    hostMode: isLoopbackHost(input.host) ? 'loopback' : 'custom',
    port: input.port,
    adoptionMode: metadata.adoptionMode,
    projectScope: inferProjectScope(projectRoot),
    workflowMode: metadata.workflowMode,
  };

  await captureCliTelemetryEvent({
    name: 'studio.started',
    projectRoot,
    properties,
  });
}

export interface StudioHealthRefreshedTelemetryInput extends ProjectHealthReportTelemetryInput {
  trigger?: 'api-refresh';
}

export async function sendStudioHealthRefreshedTelemetry(
  input: StudioHealthRefreshedTelemetryInput,
): Promise<void> {
  const projectRoot = input.projectRoot ?? process.cwd();
  const properties = {
    ...buildProjectHealthTelemetryProperties(input, projectRoot),
    trigger: input.trigger ?? 'api-refresh',
  } satisfies StudioHealthRefreshedProperties;

  await captureCliTelemetryEvent({
    name: 'studio.health_refreshed',
    projectRoot,
    properties,
  });
}

interface BuildCliLifecyclePropertiesInput {
  args: string[];
  command: string;
  durationMs: number;
  projectRoot: string;
  success: boolean;
}

function buildCliLifecycleProperties(input: BuildCliLifecyclePropertiesInput) {
  const metadata = readProjectTelemetryMetadata(input.projectRoot);
  const registrySource = inferRegistrySource(input.args);
  return {
    command: input.command,
    success: input.success,
    durationMs: input.durationMs,
    adoptionMode: inferAdoptionMode(input.args) ?? metadata.adoptionMode,
    errorCode: input.success ? undefined : 'cli_command_failed',
    offline: input.args.includes('--offline'),
    projectScope: metadata.projectScope ?? inferProjectScope(input.projectRoot),
    registrySource,
    targetFramework: inferFlagValue(input.args, '--target'),
    workflowMode: inferWorkflowMode(input.args) ?? metadata.workflowMode,
  };
}

function lifecycleTelemetryEventName(
  command: string,
): 'decantr.check.completed' | 'decantr.init.completed' | 'decantr.refresh.completed' | null {
  if (command === 'check') return 'decantr.check.completed';
  if (command === 'init') return 'decantr.init.completed';
  if (command === 'refresh') return 'decantr.refresh.completed';
  return null;
}

function buildProjectHealthTelemetryProperties(
  input: ProjectHealthReportTelemetryInput,
  projectRoot: string,
): ProjectHealthTelemetryProperties {
  const { report } = input;
  return {
    success: true,
    status: report.status,
    score: report.score,
    durationMs: input.durationMs,
    adoptionMode: normalizeAdoptionMode(report.summary.adoptionMode),
    ci: input.ci ?? false,
    errorCount: report.summary.errorCount,
    failOn: input.failOn,
    findingCount: report.summary.findingCount,
    format: input.format,
    infoCount: report.summary.infoCount,
    outputWritten: input.outputWritten ?? false,
    packManifestPresent: report.summary.packManifestPresent,
    pageCount: report.summary.pageCount,
    projectScope: inferProjectScope(projectRoot),
    reviewPackPresent: report.summary.reviewPackPresent,
    routeCount: report.routes.declared.length,
    runtimeAuditChecked: report.summary.runtimeAuditChecked,
    runtimeMatchedCount: report.routes.runtimeMatched,
    runtimePassed: report.summary.runtimePassed,
    runtimeRouteCheckedCount: report.routes.runtimeChecked.length,
    warnCount: report.summary.warnCount,
    workflowMode: normalizeWorkflowMode(report.summary.workflowMode),
  };
}

export function collectMetrics(
  essence: Record<string, unknown>,
  issues: Array<{ type: string; rule: string }>,
): GuardMetrics {
  const dna = (essence.dna ?? {}) as Record<string, unknown>;
  const blueprint = (essence.blueprint ?? {}) as Record<string, unknown>;
  const meta = (essence.meta ?? {}) as Record<string, unknown>;
  const guard = (meta.guard ?? {}) as Record<string, unknown>;
  const theme = (dna.theme ?? {}) as Record<string, unknown>;
  const sections = (blueprint.sections ?? []) as unknown[];
  const routes = (blueprint.routes ?? {}) as Record<string, unknown>;

  const byRule: Record<string, number> = {};
  let dnaCount = 0;
  let blueprintCount = 0;

  for (const issue of issues) {
    byRule[issue.rule] = (byRule[issue.rule] ?? 0) + 1;
    if (DNA_RULES.has(issue.rule)) {
      dnaCount++;
    } else {
      blueprintCount++;
    }
  }

  return {
    timestamp: new Date().toISOString(),
    cli_version: getCliVersion(),
    essence_version: (essence.version as string) ?? 'unknown',
    guard_mode: (guard.mode as string) ?? 'unknown',
    violations: {
      dna: dnaCount,
      blueprint: blueprintCount,
      by_rule: byRule,
    },
    resolution_rate: 0,
    sections_count: sections.length,
    routes_count: Object.keys(routes).length,
    theme: (theme.id as string) ?? 'unknown',
  };
}

interface TelemetryIdentities {
  installId: string;
  projectId: string;
}

export interface CliTelemetryIdentityStatus {
  enabled: boolean;
  endpoint?: string;
  endpointConfigured: boolean;
  hasProjectConfig: boolean;
  installId?: string;
  projectId?: string;
  projectRoot: string;
}

export function getCliTelemetryIdentityStatus(
  projectRoot: string,
  options: { create?: boolean } = {},
): CliTelemetryIdentityStatus {
  const projectJsonPath = join(projectRoot, '.decantr', 'project.json');
  const hasProjectConfig = existsSync(projectJsonPath);
  const identities = options.create ? ensureTelemetryIdentities(projectRoot) : null;
  const projectData = readProjectJson(projectRoot);
  const endpoint = getTelemetryEventsEndpoint();

  return {
    enabled: projectData?.telemetry === true,
    endpoint,
    endpointConfigured: Boolean(endpoint),
    hasProjectConfig,
    installId: identities?.installId ?? readExistingInstallId(),
    projectId: identities?.projectId ?? readStringProperty(projectData, 'telemetryProjectId'),
    projectRoot,
  };
}

function ensureTelemetryIdentities(projectRoot: string): TelemetryIdentities | null {
  const installId = getOrCreateInstallId();
  const projectJsonPath = join(projectRoot, '.decantr', 'project.json');
  if (!existsSync(projectJsonPath)) {
    return null;
  }

  try {
    const data = JSON.parse(readFileSync(projectJsonPath, 'utf-8')) as Record<string, unknown>;
    let projectId =
      typeof data.telemetryProjectId === 'string' ? data.telemetryProjectId : undefined;

    if (!projectId) {
      projectId = `project_${randomUUID()}`;
      data.telemetryProjectId = projectId;
      writeFileSync(projectJsonPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    }

    return { installId, projectId };
  } catch {
    return null;
  }
}

function getOrCreateInstallId(): string {
  const configDir = getConfigDir();
  const configPath = join(configDir, 'config.json');

  try {
    if (existsSync(configPath)) {
      const data = JSON.parse(readFileSync(configPath, 'utf-8')) as Record<string, unknown>;
      if (typeof data.telemetryInstallId === 'string') {
        return data.telemetryInstallId;
      }
      const installId = `install_${randomUUID()}`;
      data.telemetryInstallId = installId;
      writeFileSync(configPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
      return installId;
    }

    mkdirSync(configDir, { recursive: true });
    const installId = `install_${randomUUID()}`;
    writeFileSync(
      configPath,
      JSON.stringify({ telemetryInstallId: installId }, null, 2) + '\n',
      'utf-8',
    );
    return installId;
  } catch {
    return `install_${randomUUID()}`;
  }
}

function readExistingInstallId(): string | undefined {
  const configPath = join(getConfigDir(), 'config.json');
  if (!existsSync(configPath)) return undefined;
  try {
    const data = JSON.parse(readFileSync(configPath, 'utf-8')) as Record<string, unknown>;
    return readStringProperty(data, 'telemetryInstallId');
  } catch {
    return undefined;
  }
}

function getConfigDir(): string {
  return process.env.DECANTR_CONFIG_DIR || join(homedir(), '.config', 'decantr');
}

export function getTelemetryEventsEndpoint(): string | undefined {
  return readConfiguredEndpoint('DECANTR_TELEMETRY_ENDPOINT');
}

function readConfiguredEndpoint(name: string): string | undefined {
  const value = process.env[name]?.trim();
  if (!value) return undefined;
  return value.replace(/\/+$/, '');
}

function getTelemetryActorType(): TelemetryActorType {
  const configured = process.env.DECANTR_TELEMETRY_ACTOR_TYPE;
  return isTelemetryActorType(configured) ? configured : 'customer';
}

function getRegistrySourceProperty(properties: TelemetryProperties): RegistrySource | undefined {
  const value = properties.registrySource;
  return isRegistrySource(value) ? value : undefined;
}

function readProjectTelemetryMetadata(projectRoot: string): {
  adoptionMode?: AdoptionMode;
  projectScope?: ProjectScope;
  workflowMode?: WorkflowMode;
} {
  const data = readProjectJson(projectRoot);
  const initialized = isRecord(data?.initialized) ? data.initialized : undefined;
  return {
    adoptionMode: normalizeAdoptionMode(initialized?.adoptionMode),
    projectScope: normalizeProjectScope(initialized?.projectScope),
    workflowMode: normalizeWorkflowMode(initialized?.workflowMode),
  };
}

function resolveCliTelemetryProjectRoot(projectRoot: string, args: string[]): string {
  const projectFlag = inferFlagValue(args, '--project');
  if (!projectFlag) return projectRoot;

  const candidate = resolve(projectRoot, projectFlag);
  return existsSync(join(candidate, '.decantr', 'project.json')) ? candidate : projectRoot;
}

function readProjectJson(projectRoot: string): Record<string, unknown> | null {
  const projectJsonPath = join(projectRoot, '.decantr', 'project.json');
  if (!existsSync(projectJsonPath)) return null;
  try {
    return JSON.parse(readFileSync(projectJsonPath, 'utf-8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readStringProperty(
  value: Record<string, unknown> | null | undefined,
  key: string,
): string | undefined {
  const property = value?.[key];
  return typeof property === 'string' && property.trim() ? property : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeCommand(command: string | undefined): string | null {
  if (!command) return null;
  if (command === '--help' || command === '-h') return 'help';
  if (command === '--version' || command === '-v') return 'version';
  return command;
}

function isHelpOrVersionProbe(args: string[]): boolean {
  if (args.some((arg) => arg === '--help' || arg === '-h')) return true;
  if (args[1] === 'help') return true;
  return false;
}

function inferFlagValue(args: string[], flag: string): string | undefined {
  const equalsPrefix = `${flag}=`;
  const inline = args.find((arg) => arg.startsWith(equalsPrefix));
  if (inline) {
    return inline.slice(equalsPrefix.length) || undefined;
  }

  const index = args.indexOf(flag);
  if (index !== -1 && args[index + 1] && !args[index + 1].startsWith('-')) {
    return args[index + 1];
  }

  return undefined;
}

function inferAdoptionMode(args: string[]): AdoptionMode | undefined {
  const value = inferFlagValue(args, '--adoption');
  return normalizeAdoptionMode(value);
}

function inferWorkflowMode(args: string[]): WorkflowMode | undefined {
  const value = inferFlagValue(args, '--workflow');
  return normalizeWorkflowMode(value);
}

function normalizeAdoptionMode(value: unknown): AdoptionMode | undefined {
  if (value === 'contract-only' || value === 'decantr-css' || value === 'style-bridge') {
    return value;
  }
  return undefined;
}

function normalizeWorkflowMode(value: unknown): WorkflowMode | undefined {
  if (value === 'greenfield' || value === 'greenfield-scaffold') {
    return 'greenfield-scaffold';
  }
  if (value === 'contract' || value === 'greenfield-contract-only') {
    return 'greenfield-contract-only';
  }
  if (value === 'brownfield' || value === 'brownfield-attach') {
    return 'brownfield-attach';
  }
  if (value === 'hybrid' || value === 'hybrid-compose') {
    return 'hybrid-compose';
  }
  return undefined;
}

function normalizeProjectScope(value: unknown): ProjectScope | undefined {
  if (value === 'single-app' || value === 'workspace-app') return value;
  return undefined;
}

function normalizeFindingSeverity(value: unknown): 'error' | 'info' | 'warn' | undefined {
  if (value === 'error' || value === 'info' || value === 'warn') return value;
  return undefined;
}

function normalizeFindingSource(
  value: unknown,
): 'audit' | 'brownfield' | 'check' | 'interaction' | 'pack' | 'runtime' | undefined {
  if (
    value === 'audit' ||
    value === 'brownfield' ||
    value === 'check' ||
    value === 'interaction' ||
    value === 'pack' ||
    value === 'runtime'
  ) {
    return value;
  }
  return undefined;
}

function inferRegistrySource(args: string[]): RegistrySource {
  if (args.includes('--offline')) {
    return 'cache';
  }
  if (args.some((arg) => arg === '--registry' || arg.startsWith('--registry='))) {
    return 'custom';
  }
  return 'official';
}

function isRegistrySource(value: unknown): value is RegistrySource {
  return (
    value === 'cache' ||
    value === 'custom' ||
    value === 'none' ||
    value === 'official' ||
    value === 'private'
  );
}

function inferProjectScope(projectRoot: string): ProjectScope {
  return existsSync(join(projectRoot, 'pnpm-workspace.yaml')) ||
    existsSync(join(projectRoot, 'turbo.json')) ||
    existsSync(join(projectRoot, 'lerna.json'))
    ? 'workspace-app'
    : 'single-app';
}

function getCliVersion(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const candidates = [join(here, '..', 'package.json'), join(here, '..', '..', 'package.json')];
    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        const pkg = JSON.parse(readFileSync(candidate, 'utf-8')) as { version?: string };
        if (pkg.version) {
          return pkg.version;
        }
      }
    }
  } catch {
    // Fall through to unknown.
  }
  return 'unknown';
}

function isLoopbackHost(host: string): boolean {
  return host === '127.0.0.1' || host === 'localhost' || host === '::1';
}
