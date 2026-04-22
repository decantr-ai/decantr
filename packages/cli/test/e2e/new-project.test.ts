import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

function resolveContentRoot() {
  const candidates = [
    process.env.DECANTR_CONTENT_DIR,
    join(__dirname, '..', '..', '..', '..', '..', 'decantr-content'),
    join(__dirname, '..', '..', '..', '..', 'decantr-content'),
  ].filter((value): value is string => Boolean(value));

  return candidates.find((candidate) => existsSync(join(candidate, 'archetypes'))) ?? candidates[0];
}

describe('new command (e2e)', () => {
  let testDir: string;
  const cliPath = join(__dirname, '..', '..', 'dist', 'bin.js');
  const contentRoot = resolveContentRoot();

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

  it('keeps unsupported greenfield targets honest by falling back to contract-only mode', () => {
    writeFileSync(join(testDir, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n');

    const output = execSync(`node ${cliPath} new next-smoke --blueprint=agent-marketplace --target=nextjs --offline`, {
      cwd: testDir,
      env: {
        ...process.env,
        DECANTR_CONTENT_DIR: contentRoot,
      },
      stdio: 'pipe',
      timeout: 30000,
    }).toString();

    const projectDir = join(testDir, 'next-smoke');
    const essence = JSON.parse(readFileSync(join(projectDir, 'decantr.essence.json'), 'utf-8')) as {
      meta?: { platform?: { routing?: string } };
    };

    expect(essence.meta?.platform?.routing).toBe('pathname');
    expect(existsSync(join(projectDir, 'package.json'))).toBe(false);
    expect(existsSync(join(projectDir, 'src', 'main.tsx'))).toBe(false);
    expect(existsSync(join(projectDir, '.decantr', 'context', 'scaffold-pack.md'))).toBe(true);
    expect(output).toContain('No greenfield bootstrap adapter is available yet for target "nextjs"');
    expect(output).toContain('Contract-only mode for target nextjs');
  });

  it('prefers DECANTR_CONTENT_DIR over stale workspace cache during offline scaffolding', () => {
    writeFileSync(join(testDir, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n');
    const fakeBinDir = join(testDir, '.fake-bin');
    mkdirSync(fakeBinDir, { recursive: true });
    const fakePnpm = join(fakeBinDir, 'pnpm');
    writeFileSync(fakePnpm, '#!/bin/sh\nexit 0\n');
    chmodSync(fakePnpm, 0o755);

    mkdirSync(join(testDir, '.decantr', 'cache', '@official'), { recursive: true });
    mkdirSync(join(testDir, '.decantr', 'custom'), { recursive: true });
    for (const type of ['archetypes', 'blueprints', 'patterns', 'themes', 'shells']) {
      mkdirSync(join(testDir, '.decantr', 'cache', '@official', type), { recursive: true });
    }

    // Seed a deliberately stale workspace cache that lacks the requested blueprint.
    cpSync(
      join(contentRoot, 'blueprints', 'agent-marketplace.json'),
      join(testDir, '.decantr', 'cache', '@official', 'blueprints', 'agent-marketplace.json'),
    );
    writeFileSync(
      join(testDir, '.decantr', 'cache', '@official', 'blueprints', 'index.json'),
      JSON.stringify({ items: [{ id: 'agent-marketplace' }] }, null, 2),
    );

    execSync(`node ${cliPath} new portfolio-smoke --blueprint=portfolio --offline`, {
      cwd: testDir,
      env: {
        ...process.env,
        DECANTR_CONTENT_DIR: contentRoot,
        PATH: `${fakeBinDir}:${process.env.PATH ?? ''}`,
      },
      stdio: 'pipe',
      timeout: 30000,
    });

    const projectDir = join(testDir, 'portfolio-smoke');
    const essence = JSON.parse(readFileSync(join(projectDir, 'decantr.essence.json'), 'utf-8')) as {
      blueprint?: { sections?: Array<{ id: string }> };
    };

    expect(essence.blueprint?.sections?.map((section) => section.id)).toContain('portfolio-showcase');
    expect(existsSync(join(projectDir, '.decantr', 'context', 'scaffold-pack.md'))).toBe(true);
    expect(existsSync(join(projectDir, '.decantr', 'context', 'section-portfolio-showcase-pack.md'))).toBe(true);
  });
});
