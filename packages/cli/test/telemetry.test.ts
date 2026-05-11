import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cmdTelemetry } from '../src/commands/telemetry.js';
import {
  sendAnalyzeCompletedTelemetry,
  sendCliCommandTelemetry,
  sendNewProjectCompletedTelemetry,
} from '../src/telemetry.js';

let projectRoot = '';
let configDir = '';
let previousActorType: string | undefined;
let previousConfigDir: string | undefined;
let previousTelemetryEndpoint: string | undefined;

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

function writeProjectConfig(data: Record<string, unknown>): void {
  writeProjectConfigAt(projectRoot, data);
}

function writeProjectConfigAt(root: string, data: Record<string, unknown>): void {
  const decantrDir = join(root, '.decantr');
  mkdirSync(decantrDir, { recursive: true });
  writeFileSync(join(decantrDir, 'project.json'), `${JSON.stringify(data, null, 2)}\n`);
}

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf-8')) as Record<string, unknown>;
}

beforeEach(() => {
  previousActorType = process.env.DECANTR_TELEMETRY_ACTOR_TYPE;
  previousConfigDir = process.env.DECANTR_CONFIG_DIR;
  previousTelemetryEndpoint = process.env.DECANTR_TELEMETRY_ENDPOINT;

  projectRoot = mkdtempSync(join(tmpdir(), 'decantr-cli-telemetry-project-'));
  configDir = mkdtempSync(join(tmpdir(), 'decantr-cli-telemetry-config-'));

  process.env.DECANTR_CONFIG_DIR = configDir;
  process.env.DECANTR_TELEMETRY_ENDPOINT = 'https://telemetry.test/v1/events';
});

afterEach(() => {
  restoreEnv('DECANTR_TELEMETRY_ACTOR_TYPE', previousActorType);
  restoreEnv('DECANTR_CONFIG_DIR', previousConfigDir);
  restoreEnv('DECANTR_TELEMETRY_ENDPOINT', previousTelemetryEndpoint);
  vi.unstubAllGlobals();

  rmSync(projectRoot, { recursive: true, force: true });
  rmSync(configDir, { recursive: true, force: true });
});

describe('CLI command telemetry', () => {
  it('captures opted-in command completions with opaque identifiers', async () => {
    writeProjectConfig({ telemetry: true });
    const fetchMock = vi.fn(async () => new Response('{}', { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);

    await sendCliCommandTelemetry({
      args: ['refresh', '--offline', '--target', 'next'],
      durationMs: 42,
      projectRoot,
      success: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const [, lifecycleInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as {
      event: {
        context: Record<string, unknown>;
        name: string;
        properties: Record<string, unknown>;
      };
      schemaVersion: string;
    };
    const lifecycleBody = JSON.parse(String(lifecycleInit.body)) as {
      event: {
        name: string;
        properties: Record<string, unknown>;
      };
    };

    expect(url).toBe('https://telemetry.test/v1/events');
    expect(body.schemaVersion).toBe('0.3.0');
    expect(body.event.name).toBe('cli.command.completed');
    expect(lifecycleBody.event.name).toBe('decantr.refresh.completed');
    expect(body.event.context.source).toBe('cli');
    expect(body.event.context.actorType).toBe('customer');
    expect(body.event.context.environment).toBe('production');
    expect(body.event.context.installId).toMatch(/^install_/);
    expect(body.event.context.projectId).toMatch(/^project_/);
    expect(body.event.context.registrySource).toBe('cache');
    expect(body.event.properties).toMatchObject({
      command: 'refresh',
      durationMs: 42,
      offline: true,
      projectScope: 'single-app',
      registrySource: 'cache',
      success: true,
      targetFramework: 'next',
    });

    expect(JSON.stringify(body)).not.toContain(projectRoot);
    expect(JSON.stringify(body)).not.toContain('--target');
    expect(JSON.stringify(lifecycleBody)).not.toContain(projectRoot);
    expect(JSON.stringify(lifecycleBody)).not.toContain('--target');
    expect(lifecycleBody.event.properties).toMatchObject({
      command: 'refresh',
      durationMs: 42,
      offline: true,
      registrySource: 'cache',
      success: true,
      targetFramework: 'next',
    });

    const globalConfig = readJson(join(configDir, 'config.json'));
    const projectConfig = readJson(join(projectRoot, '.decantr', 'project.json'));
    expect(globalConfig.telemetryInstallId).toBe(body.event.context.installId);
    expect(projectConfig.telemetryProjectId).toBe(body.event.context.projectId);
  });

  it('captures init and check activation milestones alongside command completions', async () => {
    writeProjectConfig({
      telemetry: true,
      initialized: { workflowMode: 'brownfield-attach', adoptionMode: 'contract-only' },
    });
    const fetchMock = vi.fn(async () => new Response('{}', { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);

    await sendCliCommandTelemetry({
      args: ['init', '--existing'],
      durationMs: 60,
      projectRoot,
      success: true,
    });
    await sendCliCommandTelemetry({
      args: ['check'],
      durationMs: 30,
      projectRoot,
      success: false,
    });

    const bodies = fetchMock.mock.calls.map(([, init]) =>
      JSON.parse(String((init as RequestInit).body)),
    ) as Array<{ event: { name: string; properties: Record<string, unknown> } }>;

    expect(bodies.map((body) => body.event.name)).toEqual([
      'cli.command.completed',
      'decantr.init.completed',
      'cli.command.completed',
      'decantr.check.completed',
    ]);
    expect(bodies[1].event.properties).toMatchObject({
      command: 'init',
      adoptionMode: 'contract-only',
      workflowMode: 'brownfield-attach',
      success: true,
    });
    expect(bodies[3].event.properties).toMatchObject({
      command: 'check',
      errorCode: 'cli_command_failed',
      success: false,
    });
  });

  it('captures explicit greenfield new activation milestones from the created project', async () => {
    writeProjectConfig({
      telemetry: true,
      initialized: { workflowMode: 'greenfield-scaffold', adoptionMode: 'decantr-css' },
    });
    const fetchMock = vi.fn(async () => new Response('{}', { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);

    await sendNewProjectCompletedTelemetry({
      args: ['new', 'customer-app', '--blueprint=agent-marketplace', '--target=next'],
      durationMs: 120,
      projectRoot,
      success: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as {
      event: {
        name: string;
        properties: Record<string, unknown>;
      };
    };

    expect(body.event.name).toBe('decantr.new.completed');
    expect(body.event.properties).toMatchObject({
      command: 'new',
      adoptionMode: 'decantr-css',
      durationMs: 120,
      projectScope: 'single-app',
      registrySource: 'official',
      success: true,
      targetFramework: 'next',
      workflowMode: 'greenfield-scaffold',
    });
    expect(JSON.stringify(body)).not.toContain(projectRoot);
    expect(JSON.stringify(body)).not.toContain('customer-app');
    expect(JSON.stringify(body)).not.toContain('agent-marketplace');
  });

  it('captures brownfield analyze lifecycle telemetry without source paths', async () => {
    writeProjectConfig({
      telemetry: true,
      initialized: { workflowMode: 'brownfield-attach', adoptionMode: 'contract-only' },
    });
    const fetchMock = vi.fn(async () => new Response('{}', { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);

    await sendAnalyzeCompletedTelemetry({
      componentCount: 12,
      dependencyCategoryCount: 3,
      durationMs: 150,
      pageCount: 4,
      projectRoot,
      routeCount: 6,
      success: true,
      targetFramework: 'nextjs',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as {
      event: {
        name: string;
        properties: Record<string, unknown>;
      };
    };

    expect(body.event.name).toBe('decantr.analyze.completed');
    expect(body.event.properties).toMatchObject({
      command: 'analyze',
      componentCount: 12,
      dependencyCategoryCount: 3,
      pageCount: 4,
      routeCount: 6,
      success: true,
      workflowMode: 'brownfield-attach',
    });
    expect(JSON.stringify(body)).not.toContain(projectRoot);
  });

  it('links opted-in opaque CLI telemetry identity to the API', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ linked: 2 }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    );
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);

    await cmdTelemetry(
      [
        'link',
        '--enable',
        '--api-key',
        'test-key',
        '--api-url',
        'https://api.test/v1',
        '--org',
        'customer-co',
      ],
      projectRoot,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    const projectConfig = readJson(join(projectRoot, '.decantr', 'project.json'));

    expect(url).toBe('https://api.test/v1/me/telemetry-link');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-key' });
    expect(body.install_id).toMatch(/^install_/);
    expect(body.project_id).toMatch(/^project_/);
    expect(body.org_slug).toBe('customer-co');
    expect(projectConfig.telemetry).toBe(true);
    expect(JSON.stringify(body)).not.toContain(projectRoot);

    logSpy.mockRestore();
  });

  it('explains opted-in telemetry without exposing local project data', async () => {
    writeProjectConfig({ telemetry: true });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await cmdTelemetry(['explain', '--json'], projectRoot);

    const output = logSpy.mock.calls.map((call) => String(call[0])).join('\n');
    const report = JSON.parse(output) as {
      enabled: boolean;
      events: Array<{ name: string; privacy: string }>;
      neverCollected: string[];
    };

    expect(report.enabled).toBe(true);
    expect(report.events).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'cli.command.completed', privacy: 'aggregate' }),
      expect.objectContaining({ name: 'decantr.analyze.completed', privacy: 'aggregate' }),
      expect.objectContaining({ name: 'health.report.generated', privacy: 'aggregate' }),
    ]));
    expect(report.neverCollected).toEqual(expect.arrayContaining([
      'source code',
      'prompt text',
      'local file paths',
      'emails',
      'private package slugs',
    ]));
    expect(output).not.toContain(projectRoot);

    logSpy.mockRestore();
  });

  it('attributes workspace --project commands to the selected app root', async () => {
    const appRoot = join(projectRoot, 'apps', 'web');
    mkdirSync(appRoot, { recursive: true });
    writeProjectConfigAt(appRoot, {
      telemetry: true,
      initialized: {
        workflowMode: 'brownfield-attach',
        adoptionMode: 'contract-only',
        projectScope: 'workspace-app',
      },
    });

    const fetchMock = vi.fn(async () => new Response('{}', { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);

    await sendCliCommandTelemetry({
      args: ['init', '--project', 'apps/web', '--telemetry'],
      durationMs: 75,
      projectRoot,
      success: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const bodies = fetchMock.mock.calls.map(([, init]) =>
      JSON.parse(String((init as RequestInit).body)),
    ) as Array<{ event: { context: Record<string, unknown>; properties: Record<string, unknown> } }>;

    expect(bodies[0].event.context.projectId).toMatch(/^project_/);
    expect(bodies[0].event.properties).toMatchObject({
      command: 'init',
      adoptionMode: 'contract-only',
      projectScope: 'workspace-app',
      success: true,
      workflowMode: 'brownfield-attach',
    });
    expect(bodies[1].event.properties.projectScope).toBe('workspace-app');
  });

  it('allows Decantr-owned CLI runs to opt into internal actor attribution', async () => {
    writeProjectConfig({ telemetry: true });
    process.env.DECANTR_TELEMETRY_ACTOR_TYPE = 'internal';
    const fetchMock = vi.fn(async () => new Response('{}', { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);

    await sendCliCommandTelemetry({
      args: ['refresh'],
      durationMs: 42,
      projectRoot,
      success: true,
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as {
      event: {
        context: Record<string, unknown>;
      };
    };
    expect(body.event.context.actorType).toBe('internal');
  });

  it('does not capture when project telemetry is not opted in', async () => {
    writeProjectConfig({ telemetry: false });
    const fetchMock = vi.fn(async () => new Response('{}', { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);

    await sendCliCommandTelemetry({
      args: ['refresh'],
      durationMs: 42,
      projectRoot,
      success: true,
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('skips help and version probes', async () => {
    writeProjectConfig({ telemetry: true });
    const fetchMock = vi.fn(async () => new Response('{}', { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);

    await sendCliCommandTelemetry({
      args: ['--help'],
      durationMs: 3,
      projectRoot,
      success: true,
    });
    await sendCliCommandTelemetry({
      args: ['--version'],
      durationMs: 3,
      projectRoot,
      success: true,
    });
    await sendCliCommandTelemetry({
      args: ['health', '--help'],
      durationMs: 3,
      projectRoot,
      success: true,
    });
    await sendCliCommandTelemetry({
      args: ['studio', 'help'],
      durationMs: 3,
      projectRoot,
      success: true,
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
