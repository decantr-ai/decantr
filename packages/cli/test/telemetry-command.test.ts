import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cmdTelemetry } from '../src/commands/telemetry.js';

let projectRoot = '';
let configDir = '';
let previousApiKey: string | undefined;
let previousConfigDir: string | undefined;

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf-8')) as Record<string, unknown>;
}

beforeEach(() => {
  previousApiKey = process.env.DECANTR_API_KEY;
  previousConfigDir = process.env.DECANTR_CONFIG_DIR;
  projectRoot = mkdtempSync(join(tmpdir(), 'decantr-telemetry-command-project-'));
  configDir = mkdtempSync(join(tmpdir(), 'decantr-telemetry-command-config-'));
  process.env.DECANTR_CONFIG_DIR = configDir;
  process.env.DECANTR_API_KEY = 'dctr_test_key';
});

afterEach(() => {
  restoreEnv('DECANTR_API_KEY', previousApiKey);
  restoreEnv('DECANTR_CONFIG_DIR', previousConfigDir);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  rmSync(projectRoot, { recursive: true, force: true });
  rmSync(configDir, { recursive: true, force: true });
});

describe('decantr telemetry command', () => {
  it('links opted-in install and project identities to the authenticated API', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      aliases: [{ id: 'alias-1' }, { id: 'alias-2' }],
      linked: true,
    }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await cmdTelemetry(projectRoot, [
      'telemetry',
      'link',
      '--enable',
      '--org',
      'customer-org',
      '--label',
      'Founder laptop',
      '--api-url',
      'https://api.test/v1/',
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.test/v1/me/telemetry-link');
    expect((init.headers as Record<string, string>)['X-API-Key']).toBe('dctr_test_key');
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({
      label: 'Founder laptop',
      org_slug: 'customer-org',
    });
    expect(body.install_id).toMatch(/^install_/);
    expect(body.project_id).toMatch(/^project_/);

    const projectConfig = readJson(join(projectRoot, '.decantr', 'project.json'));
    const globalConfig = readJson(join(configDir, 'config.json'));
    expect(projectConfig.telemetry).toBe(true);
    expect(projectConfig.telemetryProjectId).toBe(body.project_id);
    expect(globalConfig.telemetryInstallId).toBe(body.install_id);
  });

  it('prints telemetry status as json without creating identities', async () => {
    mkdirSync(join(projectRoot, '.decantr'), { recursive: true });
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await cmdTelemetry(projectRoot, ['telemetry', 'status', '--json']);

    expect(console.log).toHaveBeenCalledTimes(1);
    const output = JSON.parse(String(vi.mocked(console.log).mock.calls[0][0]));
    expect(output).toMatchObject({
      enabled: false,
      hasProjectConfig: false,
      projectRoot,
    });
    expect(output.installId).toBeUndefined();
    expect(output.projectId).toBeUndefined();
  });
});
