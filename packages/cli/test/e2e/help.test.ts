import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

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
    expect(output).toContain('decantr health --ci --fail-on error');
    expect(output).not.toContain('No decantr.essence.json');
  });

  it('prints content-health help without requiring a content repository', () => {
    const output = runHelp(testDir, ['content-health', '--help']);

    expect(output).toContain('decantr content-health');
    expect(output).toContain('--prompt');
    expect(output).toContain('<finding-id>');
    expect(output).not.toContain('Run this command from a decantr-content style repository');
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
    const adopt = runHelp(testDir, ['adopt', '--help']);
    const verify = runHelp(testDir, ['verify', '--help']);
    const task = runHelp(testDir, ['task', '--help']);
    const codify = runHelp(testDir, ['codify', '--help']);

    expect(adopt).toContain('decantr adopt');
    expect(adopt).toContain('--dry-run');
    expect(verify).toContain('decantr verify');
    expect(verify).toContain('--local-patterns');
    expect(task).toContain('decantr task');
    expect(codify).toContain('decantr codify');
    expect(existsSync(join(testDir, '.decantr'))).toBe(false);
  });

  it('prints content namespace help without requiring a content repository', () => {
    const output = runHelp(testDir, ['content', '--help']);

    expect(output).toContain('decantr content');
    expect(output).toContain('content check');
    expect(output).not.toContain('Run this command from a decantr-content style repository');
  });

  it('prints init help without writing project files', () => {
    const output = runHelp(testDir, ['init', '--help']);

    expect(output).toContain('decantr');
    expect(output).toContain('Init Options');
    expect(existsSync(join(testDir, 'decantr.essence.json'))).toBe(false);
    expect(existsSync(join(testDir, '.decantr'))).toBe(false);
  });
});
