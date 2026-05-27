import { execFileSync, execSync } from 'node:child_process';
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

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
      cpSync(join(contentRoot, type), join(testDir, '.decantr', 'cache', '@official', type), {
        recursive: true,
      });
      cpSync(join(contentRoot, type), join(testDir, '.decantr', 'custom', type), {
        recursive: true,
      });
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

    expect(packageJson.dependencies?.['@decantr/css']).toBe('^1.0.4');
    // Modern-SPA default is history-mode (BrowserRouter). Hash-mode can be opted into
    // explicitly via the blueprint's meta.platform.routing field when needed.
    expect(mainTsx).toContain('BrowserRouter');
    expect(appTsx).toContain('Skip to content');
    expect(appTsx).toContain('id="main-content"');
    expect(appTsx).toContain('Runtime: @decantr/css');
    expect(existsSync(join(projectDir, '.decantr', 'context', 'pack-manifest.json'))).toBe(true);
    expect(existsSync(join(projectDir, '.decantr', 'context', 'scaffold-pack.md'))).toBe(true);
  });

  it('creates a Next.js App Router starter through the next-app adapter', () => {
    writeFileSync(join(testDir, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n');
    const fakeBinDir = join(testDir, '.fake-bin');
    mkdirSync(fakeBinDir, { recursive: true });
    const fakePnpm = join(fakeBinDir, 'pnpm');
    writeFileSync(fakePnpm, '#!/bin/sh\nexit 0\n');
    chmodSync(fakePnpm, 0o755);

    const output = execSync(
      `node ${cliPath} new next-smoke --blueprint=agent-marketplace --target=nextjs --offline`,
      {
        cwd: testDir,
        env: {
          ...process.env,
          DECANTR_CONTENT_DIR: contentRoot,
          PATH: `${fakeBinDir}:${process.env.PATH ?? ''}`,
        },
        stdio: 'pipe',
        timeout: 30000,
      },
    ).toString();

    const projectDir = join(testDir, 'next-smoke');
    const essence = JSON.parse(readFileSync(join(projectDir, 'decantr.essence.json'), 'utf-8')) as {
      meta?: { platform?: { routing?: string } };
    };
    const projectJson = JSON.parse(
      readFileSync(join(projectDir, '.decantr', 'project.json'), 'utf-8'),
    ) as { initialized?: { adapterId?: string; workflowMode?: string } };

    expect(essence.meta?.platform?.routing).toBe('pathname');
    expect(existsSync(join(projectDir, 'package.json'))).toBe(true);
    expect(existsSync(join(projectDir, 'app', 'layout.tsx'))).toBe(true);
    expect(existsSync(join(projectDir, 'app', 'page.tsx'))).toBe(true);
    expect(existsSync(join(projectDir, '.decantr', 'context', 'scaffold-pack.md'))).toBe(true);
    expect(projectJson.initialized?.adapterId).toBe('next-app');
    expect(projectJson.initialized?.workflowMode).toBe('greenfield-scaffold');
    expect(output).toContain('Bootstrapped Next.js App Router starter');
  });

  it.each([
    {
      target: 'html',
      adapterId: 'vanilla-vite',
      files: ['package.json', 'index.html', 'src/main.js'],
      absentDeps: ['react', 'next'],
    },
    {
      target: 'vue',
      adapterId: 'vue-vite',
      files: ['package.json', 'vite.config.ts', 'src/main.ts', 'src/App.vue'],
      deps: ['vue', 'vue-router'],
    },
    {
      target: 'svelte',
      adapterId: 'sveltekit',
      files: ['package.json', 'svelte.config.js', 'src/app.html', 'src/routes/+page.svelte'],
      deps: ['svelte', '@sveltejs/kit'],
    },
    {
      target: 'angular',
      adapterId: 'angular',
      files: ['package.json', 'angular.json', 'src/main.ts', 'src/app/app.component.ts'],
      deps: ['@angular/core', '@angular/router'],
    },
    {
      target: 'solid',
      adapterId: 'solid-vite',
      files: ['package.json', 'vite.config.ts', 'src/main.tsx', 'src/App.tsx'],
      deps: ['solid-js', '@solidjs/router'],
    },
  ])('creates a runnable $target starter through $adapterId', ({
    target,
    adapterId,
    files,
    deps,
    absentDeps,
  }) => {
    writeFileSync(join(testDir, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n');
    const fakeBinDir = join(testDir, '.fake-bin');
    mkdirSync(fakeBinDir, { recursive: true });
    const fakePnpm = join(fakeBinDir, 'pnpm');
    writeFileSync(fakePnpm, '#!/bin/sh\nexit 0\n');
    chmodSync(fakePnpm, 0o755);

    execSync(
      `node ${cliPath} new ${target}-smoke --blueprint=agent-marketplace --target=${target} --offline`,
      {
        cwd: testDir,
        env: {
          ...process.env,
          DECANTR_CONTENT_DIR: contentRoot,
          PATH: `${fakeBinDir}:${process.env.PATH ?? ''}`,
        },
        stdio: 'pipe',
        timeout: 30000,
      },
    );

    const projectDir = join(testDir, `${target}-smoke`);
    const packageJson = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf-8')) as {
      dependencies?: Record<string, string>;
    };
    const projectJson = JSON.parse(
      readFileSync(join(projectDir, '.decantr', 'project.json'), 'utf-8'),
    ) as { initialized?: { adapterId?: string } };
    const scaffoldPack = JSON.parse(
      readFileSync(join(projectDir, '.decantr', 'context', 'scaffold-pack.json'), 'utf-8'),
    ) as { target?: { adapter?: string } };

    for (const file of files) {
      expect(existsSync(join(projectDir, file))).toBe(true);
    }
    for (const dep of deps ?? []) {
      expect(packageJson.dependencies?.[dep]).toBeDefined();
    }
    for (const dep of absentDeps ?? []) {
      expect(packageJson.dependencies?.[dep]).toBeUndefined();
    }
    expect(projectJson.initialized?.adapterId).toBe(adapterId);
    expect(scaffoldPack.target?.adapter).toBe(adapterId);
  });

  it('records blank greenfield new as greenfield contract-only instead of brownfield attach', () => {
    writeFileSync(join(testDir, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n');
    const fakeBinDir = join(testDir, '.fake-bin');
    mkdirSync(fakeBinDir, { recursive: true });
    const fakePnpm = join(fakeBinDir, 'pnpm');
    writeFileSync(fakePnpm, '#!/bin/sh\nexit 0\n');
    chmodSync(fakePnpm, 0o755);

    execSync(`node ${cliPath} new blank-smoke --offline`, {
      cwd: testDir,
      env: {
        ...process.env,
        PATH: `${fakeBinDir}:${process.env.PATH ?? ''}`,
      },
      stdio: 'pipe',
      timeout: 30000,
    });

    const projectDir = join(testDir, 'blank-smoke');
    const projectJson = JSON.parse(
      readFileSync(join(projectDir, '.decantr', 'project.json'), 'utf-8'),
    ) as { initialized?: { workflowMode?: string; adoptionMode?: string } };
    const decantrMd = readFileSync(join(projectDir, 'DECANTR.md'), 'utf-8');

    expect(projectJson.initialized?.workflowMode).toBe('greenfield-contract-only');
    expect(projectJson.initialized?.adoptionMode).toBe('contract-only');
    expect(existsSync(join(projectDir, 'package.json'))).toBe(false);
    expect(decantrMd).not.toContain('brownfield attach');
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

    expect(essence.blueprint?.sections?.map((section) => section.id)).toContain(
      'portfolio-showcase',
    );
    expect(existsSync(join(projectDir, '.decantr', 'context', 'scaffold-pack.md'))).toBe(true);
    expect(
      existsSync(join(projectDir, '.decantr', 'context', 'section-portfolio-showcase-pack.md')),
    ).toBe(true);
  });

  it('passes init flags as argv without executing shell metacharacters', () => {
    const markerPath = join(testDir, 'shell-pwned');
    const maliciousRegistry = 'https://registry.example.test; touch ../shell-pwned #';

    execFileSync(
      process.execPath,
      [cliPath, 'new', 'argv-smoke', '--offline', `--registry=${maliciousRegistry}`],
      {
        cwd: testDir,
        stdio: 'pipe',
        timeout: 30000,
      },
    );

    expect(existsSync(join(testDir, 'argv-smoke'))).toBe(true);
    expect(existsSync(markerPath)).toBe(false);
  });
});
