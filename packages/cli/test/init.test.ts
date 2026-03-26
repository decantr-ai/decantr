import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile, rm, mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('init command', () => {
  let tmpDir: string;
  const originalCwd = process.cwd();
  const originalArgv = [...process.argv];

  beforeEach(async () => {
    tmpDir = join(tmpdir(), `decantr-init-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    process.argv = [...originalArgv];
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('should create essence file with --yes defaults', async () => {
    process.chdir(tmpDir);
    process.argv = ['node', 'decantr', 'init', '--yes'];

    const { run } = await import('../src/commands/init.js');
    await run();

    const essenceRaw = await readFile(join(tmpDir, 'decantr.essence.json'), 'utf-8');
    const essence = JSON.parse(essenceRaw);
    expect(essence.version).toBe('2.0.0');
    expect(essence.archetype).toBe('saas-dashboard');
    expect(essence.theme.style).toBe('auradecantism');
    expect(essence.theme.mode).toBe('dark');
    expect(essence.target).toBe('react');
  });

  it('should create package.json with react deps when target=react', async () => {
    process.chdir(tmpDir);
    process.argv = ['node', 'decantr', 'init', '--yes', '--target', 'react'];

    const { run } = await import('../src/commands/init.js');
    await run();

    const pkgRaw = await readFile(join(tmpDir, 'package.json'), 'utf-8');
    const pkg = JSON.parse(pkgRaw);
    expect(pkg.dependencies.react).toBeDefined();
    expect(pkg.dependencies['react-dom']).toBeDefined();
  });

  it('should create directory structure', async () => {
    process.chdir(tmpDir);
    process.argv = ['node', 'decantr', 'init', '--yes'];

    const { run } = await import('../src/commands/init.js');
    await run();

    await expect(access(join(tmpDir, 'src'))).resolves.toBeUndefined();
    await expect(access(join(tmpDir, 'src/pages'))).resolves.toBeUndefined();
    await expect(access(join(tmpDir, 'src/components'))).resolves.toBeUndefined();
    await expect(access(join(tmpDir, 'public'))).resolves.toBeUndefined();
  });
});
