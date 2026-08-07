import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { GovernanceGitChangeBaseV1 } from '../src/index.js';
import { verifyUIChanges } from '../src/index.js';

function createProjectRoot(): string {
  return mkdtempSync(join(tmpdir(), 'decantr-change-assurance-'));
}

function write(projectRoot: string, path: string, contents: string): void {
  const absolutePath = join(projectRoot, path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents, 'utf-8');
}

function changeBase(changedFiles: string[]): GovernanceGitChangeBaseV1 {
  return {
    identity: 'git:working-tree:test',
    hash: 'sha256:test',
    baseRef: 'HEAD',
    headRef: 'test-head',
    mergeBase: 'test-head',
    completeness: 'complete',
    changedFiles,
    changedRoutes: [],
    impactedNodeIds: [],
    unresolvedFiles: [],
    limitations: [],
  };
}

function verify(projectRoot: string, changedFiles: string[], maxFindings?: number) {
  return verifyUIChanges({
    projectRoot,
    comparisonScope: { kind: 'working_tree', identity: 'test' },
    changeBase: changeBase(changedFiles),
    generatedAt: '2026-08-07T12:00:00.000Z',
    maxFindings,
  });
}

describe('change assurance', () => {
  it('finds changed-file primitive drift without requiring Decantr adoption', async () => {
    const projectRoot = createProjectRoot();
    try {
      write(
        projectRoot,
        'package.json',
        JSON.stringify({ name: 'unadopted-app', dependencies: { react: '^19.0.0' } }),
      );
      write(
        projectRoot,
        'src/components/ui/Button.tsx',
        'export function Button() { return <button type="button" />; }\n',
      );
      write(
        projectRoot,
        'src/pages/Home.tsx',
        'export function Home() { return <button type="button">Save</button>; }\n',
      );

      const report = verify(projectRoot, ['src/pages/Home.tsx']);

      expect(report.status).toBe('attention');
      expect(report.project.framework).toBe('react');
      expect(report.findings).toHaveLength(1);
      expect(report.findings[0]?.occurrence).toMatchObject({
        code: 'COMP010',
        file: 'src/pages/Home.tsx',
        repairTarget: 'src/components/ui/Button.tsx',
      });
      expect(report.findings[0]?.repair?.payload).toMatchObject({
        canonical_file: 'src/components/ui/Button.tsx',
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not emit unchanged legacy debt', async () => {
    const projectRoot = createProjectRoot();
    try {
      write(
        projectRoot,
        'package.json',
        JSON.stringify({ name: 'changed-only-app', dependencies: { react: '^19.0.0' } }),
      );
      write(
        projectRoot,
        'src/components/ui/Button.tsx',
        'export function Button() { return <button type="button" />; }\n',
      );
      write(
        projectRoot,
        'src/pages/Legacy.tsx',
        'export function Legacy() { return <button type="button">Legacy</button>; }\n',
      );
      write(
        projectRoot,
        'src/pages/Changed.tsx',
        'import { Button } from "../components/ui/Button"; export function Changed() { return <Button />; }\n',
      );

      const report = verify(projectRoot, ['src/pages/Changed.tsx']);

      expect(report.findings).toEqual([]);
      expect(report.summary.totalFindingCount).toBe(0);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports accepted style-bridge drift only in changed source', async () => {
    const projectRoot = createProjectRoot();
    try {
      write(
        projectRoot,
        'package.json',
        JSON.stringify({ name: 'style-assurance-app', dependencies: { react: '^19.0.0' } }),
      );
      write(
        projectRoot,
        '.decantr/style-bridge.json',
        JSON.stringify({
          version: 1,
          status: 'accepted',
          mappings: [
            {
              id: 'bridge:surface',
              tokenHints: ['--color-surface'],
              classHints: ['bg-background'],
            },
          ],
        }),
      );
      write(
        projectRoot,
        'src/pages/Legacy.tsx',
        'export function Legacy() { return <main className="bg-[#111111]" />; }\n',
      );
      write(
        projectRoot,
        'src/pages/Changed.tsx',
        'export function Changed() { return <main className="bg-[#0f172a]" />; }\n',
      );

      const report = verify(projectRoot, ['src/pages/Changed.tsx']);

      expect(report.status).toBe('attention');
      expect(report.findings).toHaveLength(1);
      expect(report.findings[0]?.occurrence).toMatchObject({
        code: 'TOKEN010',
        file: 'src/pages/Changed.tsx',
        location: { line: 1 },
        annotation: { path: 'src/pages/Changed.tsx', startLine: 1, endLine: 1 },
        target: 'bg-[#0f172a]',
      });
      expect(report.findings[0]?.repair).toMatchObject({
        id: 'replace-arbitrary-style-with-bridge-token',
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('uses directly referenced workspace packages as component authority', async () => {
    const workspaceRoot = createProjectRoot();
    try {
      write(
        workspaceRoot,
        'package.json',
        JSON.stringify({
          name: 'workspace',
          private: true,
          workspaces: ['apps/*', 'packages/*'],
        }),
      );
      write(
        workspaceRoot,
        'apps/web/package.json',
        JSON.stringify({
          name: '@acme/web',
          dependencies: { '@acme/ui': 'workspace:*', react: '^19.0.0' },
        }),
      );
      write(
        workspaceRoot,
        'apps/web/src/pages/Home.tsx',
        'export function Home() { return <button type="button">Save</button>; }\n',
      );
      write(
        workspaceRoot,
        'packages/ui/package.json',
        JSON.stringify({ name: '@acme/ui', version: '1.0.0' }),
      );
      write(
        workspaceRoot,
        'packages/ui/src/components/AcmeButton.tsx',
        'export function AcmeButton() { return <button type="button" />; }\n',
      );

      const report = verify(join(workspaceRoot, 'apps/web'), ['src/pages/Home.tsx']);

      expect(report.status).toBe('attention');
      expect(report.findings[0]?.occurrence).toMatchObject({
        code: 'COMP010',
        file: 'src/pages/Home.tsx',
        repairTarget: 'packages/ui/src/components/AcmeButton.tsx',
      });
      expect(report.findings[0]?.repair?.payload).toMatchObject({
        component: 'AcmeButton',
        canonical_file: 'packages/ui/src/components/AcmeButton.tsx',
      });
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('excludes changed tests and fixtures from production UI authority', async () => {
    const projectRoot = createProjectRoot();
    try {
      write(
        projectRoot,
        'package.json',
        JSON.stringify({ name: 'fixture-app', dependencies: { react: '^19.0.0' } }),
      );
      write(
        projectRoot,
        'src/settings-menu.vitest.ts',
        "export const links = [{ path: '/admin' }, { path: '/assign' }];\n",
      );

      const report = verify(projectRoot, ['src/settings-menu.vitest.ts']);

      expect(report.status).toBe('pass');
      expect(report.surfaces.uiFiles).toEqual([]);
      expect(report.surfaces.ignoredFiles).toEqual([
        { file: 'src/settings-menu.vitest.ts', scope: 'test' },
      ]);
      expect(report.findings).toEqual([]);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('returns not-proven authority instead of silently accepting unresolved UI files', async () => {
    const projectRoot = createProjectRoot();
    try {
      write(
        projectRoot,
        'package.json',
        JSON.stringify({ name: 'unresolved-app', dependencies: { react: '^19.0.0' } }),
      );
      write(projectRoot, 'src/experimental.tsx', 'export const value = <main />;\n');

      const report = verify(projectRoot, ['src/experimental.tsx']);

      expect(report.status).toBe('not_proven');
      expect(report.surfaces.unresolvedFiles).toEqual(['src/experimental.tsx']);
      expect(report.findings[0]?.occurrence.code).toBe('AUTH001');
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('caps the default finding surface at three while retaining the total count', async () => {
    const projectRoot = createProjectRoot();
    try {
      write(
        projectRoot,
        'package.json',
        JSON.stringify({ name: 'finding-cap-app', dependencies: { react: '^19.0.0' } }),
      );
      write(
        projectRoot,
        'src/components/ui/Button.tsx',
        'export function Button() { return <button type="button" />; }\n',
      );
      const changedFiles = Array.from({ length: 4 }, (_, index) => {
        const file = `src/pages/Page${index}.tsx`;
        write(
          projectRoot,
          file,
          `export function Page${index}() { return <button type="button">Save</button>; }\n`,
        );
        return file;
      });

      const report = verify(projectRoot, changedFiles);

      expect(report.findings).toHaveLength(3);
      expect(report.summary.totalFindingCount).toBe(4);
      expect(report.summary.truncatedFindingCount).toBe(1);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });
});
