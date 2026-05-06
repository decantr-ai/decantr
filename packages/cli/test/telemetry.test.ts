import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendCliCommandTelemetry } from '../src/telemetry.js';

let projectRoot = '';
let configDir = '';
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
  const decantrDir = join(projectRoot, '.decantr');
  mkdirSync(decantrDir, { recursive: true });
  writeFileSync(join(decantrDir, 'project.json'), `${JSON.stringify(data, null, 2)}\n`);
}

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf-8')) as Record<string, unknown>;
}

beforeEach(() => {
  previousConfigDir = process.env.DECANTR_CONFIG_DIR;
  previousTelemetryEndpoint = process.env.DECANTR_TELEMETRY_ENDPOINT;

  projectRoot = mkdtempSync(join(tmpdir(), 'decantr-cli-telemetry-project-'));
  configDir = mkdtempSync(join(tmpdir(), 'decantr-cli-telemetry-config-'));

  process.env.DECANTR_CONFIG_DIR = configDir;
  process.env.DECANTR_TELEMETRY_ENDPOINT = 'https://telemetry.test/v1/events';
});

afterEach(() => {
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

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as {
      event: {
        context: Record<string, unknown>;
        name: string;
        properties: Record<string, unknown>;
      };
      schemaVersion: string;
    };

    expect(url).toBe('https://telemetry.test/v1/events');
    expect(body.schemaVersion).toBe('0.1.0');
    expect(body.event.name).toBe('cli.command.completed');
    expect(body.event.context.source).toBe('cli');
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

    const globalConfig = readJson(join(configDir, 'config.json'));
    const projectConfig = readJson(join(projectRoot, '.decantr', 'project.json'));
    expect(globalConfig.telemetryInstallId).toBe(body.event.context.installId);
    expect(projectConfig.telemetryProjectId).toBe(body.event.context.projectId);
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

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
