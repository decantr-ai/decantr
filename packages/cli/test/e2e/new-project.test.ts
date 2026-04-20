import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('new command (e2e)', () => {
  let testDir: string;
  const cliPath = join(__dirname, '..', '..', 'dist', 'bin.js');
  const contentRoot = join(__dirname, '..', '..', '..', '..', '..', 'decantr-content');

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-new-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('seeds offline blueprint content and creates a runtime-aligned starter', () => {
    writeFileSync(join(testDir, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n');
    const fakeBinDir = join(testDir, '.fake-bin');
    mkdirSync(fakeBinDir, { recursive: true });
    const fakePnpm = join(fakeBinDir, 'pnpm');
    writeFileSync(fakePnpm, '#!/bin/sh\nexit 0\n');
    chmodSync(fakePnpm, 0o755);

    mkdirSync(join(testDir, '.decantr', 'cache', '@official'), { recursive: true });
    mkdirSync(join(testDir, '.decantr', 'custom'), { recursive: true });
    for (const type of ['archetypes', 'blueprints', 'patterns', 'themes', 'shells']) {
      cpSync(join(contentRoot, type), join(testDir, '.decantr', 'cache', '@official', type), { recursive: true });
      cpSync(join(contentRoot, type), join(testDir, '.decantr', 'custom', type), { recursive: true });
    }

    execSync(`node ${cliPath} new agent-smoke --blueprint=agent-marketplace --offline`, {
      cwd: testDir,
      env: {
        ...process.env,
        PATH: `${fakeBinDir}:${process.env.PATH ?? ''}`,
      },
      stdio: 'pipe',
      timeout: 30000,
    });

    const projectDir = join(testDir, 'agent-smoke');
    const packageJson = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf-8')) as {
      dependencies?: Record<string, string>;
    };
    const mainTsx = readFileSync(join(projectDir, 'src', 'main.tsx'), 'utf-8');
    const appTsx = readFileSync(join(projectDir, 'src', 'App.tsx'), 'utf-8');

    expect(packageJson.dependencies?.['@decantr/css']).toBe('^1.0.0');
    expect(mainTsx).toContain('HashRouter');
    expect(appTsx).toContain('Skip to content');
    expect(appTsx).toContain('id="main-content"');
    expect(appTsx).toContain("Runtime: @decantr/css");
    expect(existsSync(join(projectDir, '.decantr', 'context', 'pack-manifest.json'))).toBe(true);
    expect(existsSync(join(projectDir, '.decantr', 'context', 'scaffold-pack.md'))).toBe(true);
  });

  it('uses BrowserRouter when the generated essence declares pathname routing', () => {
    writeFileSync(join(testDir, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n');
    const fakeBinDir = join(testDir, '.fake-bin');
    mkdirSync(fakeBinDir, { recursive: true });
    const fakePnpm = join(fakeBinDir, 'pnpm');
    writeFileSync(fakePnpm, '#!/bin/sh\nexit 0\n');
    chmodSync(fakePnpm, 0o755);

    mkdirSync(join(testDir, '.decantr', 'cache', '@official'), { recursive: true });
    mkdirSync(join(testDir, '.decantr', 'custom'), { recursive: true });
    for (const type of ['archetypes', 'blueprints', 'patterns', 'themes', 'shells']) {
      cpSync(join(contentRoot, type), join(testDir, '.decantr', 'cache', '@official', type), { recursive: true });
      cpSync(join(contentRoot, type), join(testDir, '.decantr', 'custom', type), { recursive: true });
    }

    execSync(`node ${cliPath} new next-smoke --blueprint=agent-marketplace --target=nextjs --offline`, {
      cwd: testDir,
      env: {
        ...process.env,
        PATH: `${fakeBinDir}:${process.env.PATH ?? ''}`,
      },
      stdio: 'pipe',
      timeout: 30000,
    });

    const projectDir = join(testDir, 'next-smoke');
    const essence = JSON.parse(readFileSync(join(projectDir, 'decantr.essence.json'), 'utf-8')) as {
      meta?: { platform?: { routing?: string } };
    };
    const mainTsx = readFileSync(join(projectDir, 'src', 'main.tsx'), 'utf-8');
    const appTsx = readFileSync(join(projectDir, 'src', 'App.tsx'), 'utf-8');

    expect(essence.meta?.platform?.routing).toBe('pathname');
    expect(mainTsx).toContain('BrowserRouter');
    expect(appTsx).toContain('Routing: pathname');
  });
});
