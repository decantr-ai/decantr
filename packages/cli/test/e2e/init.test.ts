import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';

describe('init command', () => {
  let testDir: string;
  const cliPath = join(__dirname, '..', '..', 'dist', 'index.js');

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-test-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('creates essence file with default blueprint', () => {
    execSync(`node ${cliPath} init --yes`, {
      cwd: testDir,
      env: { ...process.env, DECANTR_OFFLINE: 'true' }
    });

    expect(existsSync(join(testDir, 'decantr.essence.json'))).toBe(true);
  });

  it('creates DECANTR.md file', () => {
    execSync(`node ${cliPath} init --yes`, {
      cwd: testDir,
      env: { ...process.env, DECANTR_OFFLINE: 'true' }
    });

    expect(existsSync(join(testDir, 'DECANTR.md'))).toBe(true);
  });

  it('DECANTR.md uses @decantr/cli not decantr', () => {
    execSync(`node ${cliPath} init --yes`, {
      cwd: testDir,
      env: { ...process.env, DECANTR_OFFLINE: 'true' }
    });

    const content = readFileSync(join(testDir, 'DECANTR.md'), 'utf-8');
    expect(content).toContain('npx @decantr/cli');
    expect(content).not.toMatch(/npx decantr /);
  });

  it('creates .decantr directory', () => {
    execSync(`node ${cliPath} init --yes`, {
      cwd: testDir,
      env: { ...process.env, DECANTR_OFFLINE: 'true' }
    });

    expect(existsSync(join(testDir, '.decantr'))).toBe(true);
  });
});
