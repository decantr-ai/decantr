import { execSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
      // V3.1 simplified template: methodology primer with guard rules and CSS approach
      expect(content).toContain('## Guard Rules');
      expect(content).toContain('## How To Use This Project');
      expect(content).toContain('## CSS Implementation');
      expect(content).toContain('@decantr/css');
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
      expect(output).toContain(
        'Prefer scaffold-pack, section-pack, and page-pack guidance over broader narrative docs when they differ.',
      );
      expect(output).toContain('Use only files present in this workspace as the source of truth.');
      expect(output).toContain(
        'After implementation, run decantr check and decantr audit and fix any contract or drift issues.',
      );

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
});
