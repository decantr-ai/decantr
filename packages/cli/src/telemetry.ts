import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type AdoptionMode,
  createFetchTelemetrySink,
  createTelemetryClient,
  type DecantrTelemetryEvent,
  type ProjectScope,
  type RegistrySource,
  type WorkflowMode,
} from '@decantr/telemetry';

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

const TELEMETRY_ENDPOINT = 'https://api.decantr.ai/v1/telemetry/guard';
const DEFAULT_TELEMETRY_EVENTS_ENDPOINT = 'https://api.decantr.ai/v1/telemetry/events';
const TELEMETRY_TIMEOUT_MS = 3000;

const DNA_RULES = new Set(['theme', 'style', 'density', 'accessibility', 'theme-mode']);

export async function sendGuardMetrics(metrics: GuardMetrics): Promise<void> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TELEMETRY_TIMEOUT_MS);
    await fetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch {
    // Fire-and-forget: silently ignore all errors
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

export async function sendCliCommandTelemetry(input: CliCommandTelemetryInput): Promise<void> {
  const projectRoot = input.projectRoot ?? process.cwd();
  const command = normalizeCommand(input.args[0]);
  if (!isOptedIn(projectRoot) || !command || command === 'help' || command === 'version') {
    return;
  }

  const identities = ensureTelemetryIdentities(projectRoot);
  if (!identities) {
    return;
  }

  const client = createTelemetryClient({
    sink: createFetchTelemetrySink({
      endpoint: getTelemetryEventsEndpoint(),
      timeoutMs: TELEMETRY_TIMEOUT_MS,
    }),
  });

  const event: DecantrTelemetryEvent = {
    name: 'cli.command.completed',
    context: {
      source: 'cli',
      environment: 'production',
      decantrVersion: getCliVersion(),
      installId: identities.installId,
      projectId: identities.projectId,
      registrySource: inferRegistrySource(input.args),
    },
    properties: {
      command,
      success: input.success,
      durationMs: input.durationMs,
      adoptionMode: inferAdoptionMode(input.args),
      errorCode: input.success ? undefined : 'cli_command_failed',
      offline: input.args.includes('--offline'),
      projectScope: inferProjectScope(projectRoot),
      registrySource: inferRegistrySource(input.args),
      targetFramework: inferFlagValue(input.args, '--target'),
      workflowMode: inferWorkflowMode(input.args),
    },
  };

  try {
    await client.capture(event);
  } catch {
    // Fire-and-forget: silently ignore all errors.
  }
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

function getConfigDir(): string {
  return process.env.DECANTR_CONFIG_DIR || join(homedir(), '.config', 'decantr');
}

function getTelemetryEventsEndpoint(): string {
  return process.env.DECANTR_TELEMETRY_ENDPOINT || DEFAULT_TELEMETRY_EVENTS_ENDPOINT;
}

function normalizeCommand(command: string | undefined): string | null {
  if (!command) return null;
  if (command === '--help' || command === '-h') return 'help';
  if (command === '--version' || command === '-v') return 'version';
  return command;
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
  if (value === 'contract-only' || value === 'decantr-css' || value === 'style-bridge') {
    return value;
  }
  return undefined;
}

function inferWorkflowMode(args: string[]): WorkflowMode | undefined {
  const value = inferFlagValue(args, '--workflow');
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

function inferRegistrySource(args: string[]): RegistrySource {
  if (args.includes('--offline')) {
    return 'cache';
  }
  if (args.some((arg) => arg === '--registry' || arg.startsWith('--registry='))) {
    return 'custom';
  }
  return 'official';
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
