import { execSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const INIT_TIMEOUT_MS = 15_000;

function resolveContentRoot() {
  const candidates = [
    process.env.DECANTR_CONTENT_DIR,
    join(__dirname, '..', '..', '..', '..', '..', 'decantr-content'),
    join(__dirname, '..', '..', '..', '..', 'decantr-content'),
  ].filter((value): value is string => Boolean(value));

  return candidates.find((candidate) => existsSync(join(candidate, 'archetypes'))) ?? candidates[0];
}

describe('init command', () => {
  let testDir: string;
  const cliPath = join(__dirname, '..', '..', 'dist', 'index.js');
  const contentRoot = resolveContentRoot();
  const packageVersion = JSON.parse(
    readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf-8'),
  ).version as string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-test-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it(
    'creates essence file with default blueprint',
    () => {
      execSync(`node ${cliPath} init --yes`, {
        cwd: testDir,
        env: { ...process.env, DECANTR_OFFLINE: 'true' },
      });

      expect(existsSync(join(testDir, 'decantr.essence.json'))).toBe(true);
    },
    INIT_TIMEOUT_MS,
  );

  it(
    'creates DECANTR.md file',
    () => {
      execSync(`node ${cliPath} init --yes`, {
        cwd: testDir,
        env: { ...process.env, DECANTR_OFFLINE: 'true' },
      });

      expect(existsSync(join(testDir, 'DECANTR.md'))).toBe(true);

      const projectJson = JSON.parse(
        readFileSync(join(testDir, '.decantr', 'project.json'), 'utf-8'),
      ) as {
        initialized?: { version?: string };
      };
      expect(projectJson.initialized?.version).toBe(packageVersion);
    },
    INIT_TIMEOUT_MS,
  );

  it(
    'DECANTR.md contains methodology primer content',
    () => {
      execSync(`node ${cliPath} init --yes`, {
        cwd: testDir,
        env: { ...process.env, DECANTR_OFFLINE: 'true' },
      });

      const content = readFileSync(join(testDir, 'DECANTR.md'), 'utf-8');
      // V3.1 template: methodology primer plus workflow-aware styling guidance.
      expect(content).toContain('## Guard Rules');
      expect(content).toContain('## How To Use This Project');
      expect(content).toContain('## Styling Adoption');
      expect(content).toContain('contract and governance layer only');
    },
    INIT_TIMEOUT_MS,
  );

  it(
    'prints the stronger AI scaffold prompt and bakes pack-first guidance into DECANTR.md',
    () => {
      const output = execSync(
        `node ${cliPath} init --blueprint=agent-marketplace --offline --yes`,
        {
          cwd: testDir,
          env: {
            ...process.env,
            DECANTR_CONTENT_DIR: contentRoot,
          },
        },
      ).toString();

      const content = readFileSync(join(testDir, 'DECANTR.md'), 'utf-8');

      expect(output).toContain('This workspace is a new Decantr scaffold.');
      expect(output).toContain(
        'Treat the compiled execution-pack files as the primary source of truth.',
      );
      expect(output.indexOf('1. .decantr/context/scaffold-pack.md')).toBeGreaterThan(-1);
      expect(output.indexOf('5. DECANTR.md as a lookup reference')).toBeGreaterThan(-1);
      expect(output.indexOf('1. .decantr/context/scaffold-pack.md')).toBeLessThan(
        output.indexOf('5. DECANTR.md as a lookup reference'),
      );
      expect(output).toContain('Prefer scaffold-pack, section-pack, and page-pack guidance');
      expect(output).toContain('Use only files present in this workspace as the source of truth.');
      expect(output).toContain(
        // v2.1 prompt update: `decantr check` is the unified entry point;
        // the deprecated `decantr audit` line was replaced with the
        // 8-rule guard description that surfaces the C5 interactions guard.
        'After implementation, run `decantr check`',
      );
      expect(output).toContain('INTERACTIONS ARE CONTRACT, NOT GUIDANCE');
      expect(output).toContain('TREATMENT SURFACE — USE WHAT EXISTS');
      expect(output).toContain('HARD RULES (NON-NEGOTIABLE)');
      expect(output).toContain('Do not render Decantr guard prose');

      expect(content).toContain('This project is using Decantr in **greenfield scaffold** mode.');
      expect(content).toContain(
        'Treat the compiled execution-pack files as the primary source of truth.',
      );
      expect(content).toContain('Prefer the compiled section pack if the two sources differ');
      expect(content).toContain('Use only files present in this workspace as the source of truth.');
      expect(content).toContain(
        'trust its declared Decantr dependencies over external assumptions',
      );
      expect(content).toContain(
        'Do not modify generated context files unless you are explicitly regenerating or refreshing Decantr context.',
      );
    },
    INIT_TIMEOUT_MS,
  );

  it(
    'creates .decantr directory',
    () => {
      execSync(`node ${cliPath} init --yes`, {
        cwd: testDir,
        env: { ...process.env, DECANTR_OFFLINE: 'true' },
      });

      expect(existsSync(join(testDir, '.decantr'))).toBe(true);
    },
    INIT_TIMEOUT_MS,
  );

  it(
    'uses local content sources for offline blueprint init instead of silently falling back to defaults',
    () => {
      const output = execSync(
        `node ${cliPath} init --blueprint=agent-marketplace --offline --yes`,
        {
          cwd: testDir,
          env: {
            ...process.env,
            DECANTR_CONTENT_DIR: contentRoot,
          },
        },
      ).toString();

      const essence = JSON.parse(readFileSync(join(testDir, 'decantr.essence.json'), 'utf-8')) as {
        version: string;
        blueprint?: {
          sections?: Array<{ id: string }>;
          routes?: Record<string, { section: string; page: string }>;
        };
      };
      const pagePack = JSON.parse(
        readFileSync(
          join(testDir, '.decantr', 'context', 'page-agent-overview-pack.json'),
          'utf-8',
        ),
      ) as {
        data?: { path?: string };
      };

      expect(output).not.toContain(
        'Could not fetch blueprint "agent-marketplace". Using defaults.',
      );
      expect(output).not.toContain('Could not fetch theme');
      expect(existsSync(join(testDir, '.decantr', 'context', 'scaffold-pack.md'))).toBe(true);
      expect(
        existsSync(join(testDir, '.decantr', 'context', 'section-agent-orchestrator-pack.md')),
      ).toBe(true);
      expect(existsSync(join(testDir, '.decantr', 'context', 'page-agent-overview-pack.md'))).toBe(
        true,
      );
      expect(essence.version).toBe('3.1.0');
      expect(essence.blueprint?.sections?.map((section) => section.id)).toContain(
        'agent-orchestrator',
      );
      expect(essence.blueprint?.routes?.['/agents']?.page).toBe('agent-overview');
      expect(pagePack.data?.path).toBe('/agents');
    },
    INIT_TIMEOUT_MS,
  );

  it(
    'fails explicitly when offline blueprint init has no local content source',
    () => {
      try {
        execSync(`node ${cliPath} init --blueprint=agent-marketplace --offline --yes`, {
          cwd: testDir,
          env: {
            ...process.env,
            DECANTR_CONTENT_DIR: join(testDir, 'missing-content-root'),
          },
          stdio: 'pipe',
        });
        throw new Error('Expected offline init to fail without a local content source.');
      } catch (error) {
        const stdout = (error as { stdout?: Buffer }).stdout?.toString() ?? '';
        const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? '';
        const output = `${stdout}\n${stderr}`;
        expect(output).toContain(
          'Offline blueprint/archetype scaffolding requires a local Decantr content source.',
        );
      }
    },
    INIT_TIMEOUT_MS,
  );

  it(
    'uses the brownfield init seed from analyze when attaching to an existing project',
    () => {
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(
          {
            name: 'brownfield-angular',
            private: true,
            dependencies: {
              '@angular/core': '^19.0.0',
            },
          },
          null,
          2,
        ) + '\n',
      );
      writeFileSync(
        join(testDir, 'angular.json'),
        JSON.stringify(
          {
            version: 1,
            projects: {},
          },
          null,
          2,
        ) + '\n',
      );

      execSync(`node ${cliPath} analyze`, {
        cwd: testDir,
        env: { ...process.env, DECANTR_OFFLINE: 'true' },
        stdio: 'pipe',
      });

      const output = execSync(`node ${cliPath} init --existing --yes --offline`, {
        cwd: testDir,
        env: {
          ...process.env,
          DECANTR_OFFLINE: 'true',
          DECANTR_CONTENT_DIR: contentRoot,
        },
        stdio: 'pipe',
      }).toString();

      const content = readFileSync(join(testDir, 'DECANTR.md'), 'utf-8');
      const essence = JSON.parse(readFileSync(join(testDir, 'decantr.essence.json'), 'utf-8')) as {
        meta?: { target?: string };
      };

      expect(output).toContain('Found .decantr/init-seed.json brownfield guidance.');
      expect(output).toContain(
        'Attach Decantr to this existing application without rebuilding it from scratch.',
      );
      expect(output).toContain(
        'Treat .decantr/analysis.json as the factual inventory of the current app.',
      );
      expect(content).toContain('This project is using Decantr in **brownfield attach** mode.');
      expect(content).toContain(
        'Read `.decantr/analysis.json` first for the detected framework, routes, styling, layout, and dependency facts.',
      );
      expect(content).toContain(
        'Registry content is optional in this workflow unless the task explicitly asks for it.',
      );
      expect(essence.meta?.target).toBe('angular');
    },
    INIT_TIMEOUT_MS,
  );

  it(
    'attaches brownfield directly without referencing missing analyze artifacts or forcing CSS',
    () => {
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(
          {
            name: 'direct-brownfield',
            private: true,
            dependencies: {
              react: '^19.0.0',
            },
          },
          null,
          2,
        ) + '\n',
      );

      const output = execSync(`node ${cliPath} init --existing --yes --offline`, {
        cwd: testDir,
        env: {
          ...process.env,
          DECANTR_OFFLINE: 'true',
        },
        stdio: 'pipe',
      }).toString();

      const content = readFileSync(join(testDir, 'DECANTR.md'), 'utf-8');
      const projectJson = JSON.parse(
        readFileSync(join(testDir, '.decantr', 'project.json'), 'utf-8'),
      ) as { initialized?: { workflowMode?: string; adoptionMode?: string; analysisArtifacts?: boolean } };

      expect(output).toContain('No Decantr analysis seed is present.');
      expect(content).toContain('No `.decantr/analysis.json` or `.decantr/init-seed.json` was present');
      expect(projectJson.initialized?.workflowMode).toBe('brownfield-attach');
      expect(projectJson.initialized?.adoptionMode).toBe('contract-only');
      expect(projectJson.initialized?.analysisArtifacts).toBe(false);
      expect(existsSync(join(testDir, 'src', 'styles', 'treatments.css'))).toBe(false);
      expect(content).not.toContain('If `package.json` does not already depend on `@decantr/css`');
    },
    INIT_TIMEOUT_MS,
  );

  it(
    'previews and applies assistant bridge rule files idempotently',
    () => {
      writeFileSync(join(testDir, 'package.json'), JSON.stringify({ name: 'rules-app' }));
      writeFileSync(join(testDir, 'CLAUDE.md'), '# Existing rules\n');
      mkdirSync(join(testDir, '.cursor', 'rules'), { recursive: true });

      execSync(`node ${cliPath} init --existing --yes --offline --assistant-bridge=preview`, {
        cwd: testDir,
        env: { ...process.env, DECANTR_OFFLINE: 'true' },
        stdio: 'pipe',
      });

      expect(existsSync(join(testDir, '.decantr', 'context', 'assistant-bridge.md'))).toBe(true);
      expect(readFileSync(join(testDir, 'CLAUDE.md'), 'utf-8')).not.toContain(
        'decantr:assistant-bridge:start',
      );

      execSync(`node ${cliPath} rules apply`, { cwd: testDir, stdio: 'pipe' });
      execSync(`node ${cliPath} rules apply`, { cwd: testDir, stdio: 'pipe' });

      const claude = readFileSync(join(testDir, 'CLAUDE.md'), 'utf-8');
      const cursor = readFileSync(join(testDir, '.cursor', 'rules', 'decantr.mdc'), 'utf-8');
      expect((claude.match(/decantr:assistant-bridge:start/g) || []).length).toBe(1);
      expect(cursor).toContain('alwaysApply: true');
    },
    INIT_TIMEOUT_MS,
  );

  it(
    'emits style bridge files without requiring @decantr/css',
    () => {
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'bridge-app', dependencies: { react: '^19.0.0' } }, null, 2),
      );

      execSync(`node ${cliPath} init --existing --yes --offline --adoption=style-bridge`, {
        cwd: testDir,
        stdio: 'pipe',
      });

      const content = readFileSync(join(testDir, 'DECANTR.md'), 'utf-8');
      expect(existsSync(join(testDir, 'src', 'styles', 'tokens.css'))).toBe(true);
      expect(existsSync(join(testDir, 'src', 'styles', 'decantr-bridge.css'))).toBe(true);
      expect(existsSync(join(testDir, 'src', 'styles', 'treatments.css'))).toBe(false);
      expect(content).toContain('style-bridge');
      expect(content).toContain('`@decantr/css` is not required');
    },
    INIT_TIMEOUT_MS,
  );

  it(
    'requires --project at a multi-app workspace root under --yes',
    () => {
      writeFileSync(join(testDir, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n');
      for (const app of ['web', 'admin']) {
        const appDir = join(testDir, 'apps', app);
        mkdirSync(appDir, { recursive: true });
        writeFileSync(
          join(appDir, 'package.json'),
          JSON.stringify({ name: app, dependencies: { react: '^19.0.0' } }, null, 2),
        );
      }

      try {
        execSync(`node ${cliPath} init --yes --offline`, {
          cwd: testDir,
          stdio: 'pipe',
        });
        throw new Error('Expected workspace root init to require --project.');
      } catch (error) {
        const output = `${(error as { stdout?: Buffer }).stdout?.toString() ?? ''}\n${
          (error as { stderr?: Buffer }).stderr?.toString() ?? ''
        }`;
        expect(output).toContain('Use --project=<path>');
        expect(output).toContain('apps/admin');
        expect(output).toContain('apps/web');
      }
    },
    INIT_TIMEOUT_MS,
  );

  it(
    'stores workspace and app roots when --project is supplied',
    () => {
      writeFileSync(join(testDir, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n');
      const appDir = join(testDir, 'apps', 'web');
      mkdirSync(appDir, { recursive: true });
      writeFileSync(
        join(appDir, 'package.json'),
        JSON.stringify({ name: 'web', dependencies: { react: '^19.0.0' } }, null, 2),
      );

      execSync(`node ${cliPath} init --yes --offline --project=apps/web`, {
        cwd: testDir,
        stdio: 'pipe',
      });

      const projectJson = JSON.parse(
        readFileSync(join(appDir, '.decantr', 'project.json'), 'utf-8'),
      ) as {
        detected?: { workspaceRoot?: string; appRoot?: string };
        initialized?: { projectScope?: string };
      };

      expect(projectJson.detected?.workspaceRoot).toBe(realpathSync(testDir));
      expect(projectJson.detected?.appRoot).toBe(realpathSync(appDir));
      expect(projectJson.initialized?.projectScope).toBe('workspace-app');
    },
    INIT_TIMEOUT_MS,
  );
});
