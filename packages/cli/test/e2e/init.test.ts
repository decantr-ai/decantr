import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';

const INIT_TIMEOUT_MS = 15_000;

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
  }, INIT_TIMEOUT_MS);

  it('creates DECANTR.md file', () => {
    execSync(`node ${cliPath} init --yes`, {
      cwd: testDir,
      env: { ...process.env, DECANTR_OFFLINE: 'true' }
    });

    expect(existsSync(join(testDir, 'DECANTR.md'))).toBe(true);
  }, INIT_TIMEOUT_MS);

  it('DECANTR.md contains methodology primer content', () => {
    execSync(`node ${cliPath} init --yes`, {
      cwd: testDir,
      env: { ...process.env, DECANTR_OFFLINE: 'true' }
    });

    const content = readFileSync(join(testDir, 'DECANTR.md'), 'utf-8');
    // V3.1 simplified template: methodology primer with guard rules and CSS approach
    expect(content).toContain('## Guard Rules');
    expect(content).toContain('## How To Use This Project');
    expect(content).toContain('## CSS Implementation');
    expect(content).toContain('@decantr/css');
  }, INIT_TIMEOUT_MS);

  it('prints the stronger AI scaffold prompt and bakes pack-first guidance into DECANTR.md', () => {
    const output = execSync(`node ${cliPath} init --blueprint=default --yes`, {
      cwd: testDir,
      env: { ...process.env, DECANTR_OFFLINE: 'true' }
    }).toString();

    const content = readFileSync(join(testDir, 'DECANTR.md'), 'utf-8');

    expect(output).toContain('Treat the compiled execution-pack files as the primary source of truth.');
    expect(output).toContain('Prefer scaffold-pack, section-pack, and page-pack guidance over broader narrative docs when they differ.');
    expect(output).toContain('After implementation, run decantr check and decantr audit and fix any contract or drift issues.');

    expect(content).toContain('Treat the compiled execution-pack files as the primary source of truth.');
    expect(content).toContain('Prefer the compiled section pack if the two sources differ');
    expect(content).toContain('Do not modify generated context files unless you are explicitly regenerating or refreshing Decantr context.');
  }, INIT_TIMEOUT_MS);

  it('creates .decantr directory', () => {
    execSync(`node ${cliPath} init --yes`, {
      cwd: testDir,
      env: { ...process.env, DECANTR_OFFLINE: 'true' }
    });

    expect(existsSync(join(testDir, '.decantr'))).toBe(true);
  }, INIT_TIMEOUT_MS);
});
