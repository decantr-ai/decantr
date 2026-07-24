import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { COMMAND_SURFACE } from '../../src/command-surface.js';

function runHelp(cwd: string, args: string[]): string {
  const cliPath = join(__dirname, '..', '..', 'dist', 'bin.js');
  return execFileSync('node', [cliPath, ...args], {
    cwd,
    encoding: 'utf-8',
    timeout: 5000,
    env: { ...process.env, DECANTR_OFFLINE: 'true' },
  });
}

describe('command help (e2e)', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-help-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('prints health help without running a project health report', () => {
    const output = runHelp(testDir, ['health', '--help']);

    expect(output).toContain('decantr health');
    expect(output).toContain('--prompt');
    expect(output).toContain('<finding-id>');
    expect(output).not.toContain('No decantr.essence.json');
    expect(output).not.toContain('ERROR');
  });

  it('accepts command help as a positional subcommand', () => {
    const output = runHelp(testDir, ['health', 'help']);

    expect(output).toContain('decantr health');
    expect(output).toContain('decantr ci --project apps/web');
    expect(output).not.toContain('No decantr.essence.json');
  });

  it('prints content-health help without requiring a content repository', () => {
    const output = runHelp(testDir, ['content-health', '--help']);

    expect(output).toContain('decantr content-health');
    expect(output).toContain('--prompt');
    expect(output).toContain('<finding-id>');
    expect(output).not.toContain('Run this command from packages/content');
  });

  it('prints studio help without starting the server', () => {
    const output = runHelp(testDir, ['studio', '--help']);

    expect(output).toContain('decantr studio');
    expect(output).toContain('--report');
    expect(output).toContain('GET  /api/health');
    expect(output).toContain('POST /api/refresh');
    expect(output).not.toContain('Decantr Studio is running');
  });

  it('prints workflow command help without running workflows', () => {
    const rootHelp = runHelp(testDir, ['help']);
    const advancedHelp = runHelp(testDir, ['help', '--advanced']);
    const compatibilityHelp = runHelp(testDir, ['help', '--compatibility']);
    const setup = runHelp(testDir, ['setup', '--help']);
    const scan = runHelp(testDir, ['scan', '--help']);
    const adopt = runHelp(testDir, ['adopt', '--help']);
    const verify = runHelp(testDir, ['verify', '--help']);
    const ci = runHelp(testDir, ['ci', '--help']);
    const doctor = runHelp(testDir, ['doctor', '--help']);
    const task = runHelp(testDir, ['task', '--help']);
    const codify = runHelp(testDir, ['codify', '--help']);
    const connect = runHelp(testDir, ['connect', '--help']);
    const themeSwitch = runHelp(testDir, ['theme', 'switch', '--help']);

    expect(rootHelp).toContain('Primary workflow:');
    expect(rootHelp).toContain('decantr scan');
    expect(rootHelp).toContain('decantr adopt');
    expect(rootHelp).toContain('decantr task');
    expect(rootHelp).toContain('decantr verify');
    expect(rootHelp).toContain('decantr ci init');
    expect(rootHelp).toContain('decantr help --advanced');

    const hiddenCommands = [
      'registry',
      'login',
      'logout',
      'publish',
      'theme',
      'telemetry',
      'studio',
      'magic',
      'content',
      'content-health',
      'create',
    ];
    for (const command of hiddenCommands) {
      expect(rootHelp).not.toContain(`decantr ${command}`);
    }
    expect(rootHelp).not.toContain('decantr-css');
    expect(rootHelp).not.toContain('Advanced commands:');

    for (const entry of COMMAND_SURFACE.filter(
      (candidate) => candidate.visibility === 'advanced',
    )) {
      expect(advancedHelp).toContain(entry.purpose);
      expect(rootHelp).not.toContain(entry.purpose);
    }
    for (const entry of COMMAND_SURFACE.filter(
      (candidate) => candidate.visibility === 'compatibility',
    )) {
      expect(compatibilityHelp).toContain(entry.purpose);
      expect(advancedHelp).not.toContain(entry.purpose);
      expect(rootHelp).not.toContain(entry.purpose);
    }
    expect(setup).toContain('Which command first?');
    expect(scan).toContain('Which command first?');
    expect(scan).toContain('decantr scan');
    expect(adopt).toContain('decantr adopt');
    expect(adopt).toContain('--dry-run');
    expect(verify).toContain('decantr verify');
    expect(verify).toContain('--local-patterns');
    expect(ci).toContain('decantr ci');
    expect(ci).toContain('ci init');
    expect(doctor).toContain('decantr doctor');
    expect(doctor).toContain('--workspace');
    expect(task).toContain('decantr task');
    expect(task).toContain('--since origin/main');
    expect(codify).toContain('decantr codify');
    expect(codify).toContain('--from-audit');
    expect(connect).toContain('decantr connect cursor');
    expect(connect).toContain('.cursor/mcp.json');
    expect(connect).toContain('.cursor/rules/decantr.mdc');
    expect(themeSwitch).toContain(
      'decantr theme switch <themeName> [--shape <shape>] [--mode <mode>]',
    );
    expect(existsSync(join(testDir, '.decantr'))).toBe(false);
    expect(existsSync(join(testDir, '.cursor'))).toBe(false);
  }, 30_000);

  it('keeps the command catalog unique and generic commands locally discoverable', () => {
    const commands = COMMAND_SURFACE.map((entry) => entry.command);
    expect(new Set(commands).size).toBe(commands.length);

    const output = runHelp(testDir, ['new', '--help']);
    expect(output).toContain('decantr new');
    expect(output).not.toContain('Primary workflow:');

    expect(existsSync(join(testDir, '.decantr'))).toBe(false);
    expect(existsSync(join(testDir, '.cursor'))).toBe(false);
    expect(existsSync(join(testDir, 'decantr.essence.json'))).toBe(false);
  });

  it('prints content namespace help without requiring a content repository', () => {
    const output = runHelp(testDir, ['content', '--help']);
    const pageRoute = runHelp(testDir, [
      'content',
      'get-pack',
      'page',
      '--route',
      '/feed',
      '--help',
    ]);

    expect(output).toContain('decantr content');
    expect(output).toContain('content check');
    expect(output).toContain('decantr content get-pack page --route <route>');
    expect(pageRoute).toContain('decantr content get-pack page --route <route>');
    expect(output).not.toContain('Run this command from packages/content');
    expect(existsSync(join(testDir, '.decantr'))).toBe(false);
  });

  it('prints init help without writing project files', () => {
    const output = runHelp(testDir, ['init', '--help']);

    expect(output).toContain('decantr init');
    expect(output).toContain('Advanced command:');
    expect(output).toContain('Attach or initialize Decantr contract and context files.');
    expect(output).not.toContain('Primary workflow:');
    expect(existsSync(join(testDir, 'decantr.essence.json'))).toBe(false);
    expect(existsSync(join(testDir, '.decantr'))).toBe(false);
  });
});
