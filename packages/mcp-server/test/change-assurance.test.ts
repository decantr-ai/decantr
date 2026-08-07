import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { handleTool, TOOLS } from '../src/tools.js';

const originalCwd = process.cwd();
const roots: string[] = [];

function write(root: string, path: string, contents: string): void {
  const absolutePath = join(root, path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents, 'utf-8');
}

function initGit(root: string): void {
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['config', 'user.email', 'test@decantr.ai'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Decantr Test'], { cwd: root });
}

function writeWorkspaceApp(root: string, app: string): void {
  write(
    root,
    `apps/${app}/package.json`,
    JSON.stringify({ name: app, dependencies: { react: '^19.0.0' } }),
  );
  write(
    root,
    `apps/${app}/src/pages/Home.tsx`,
    `export function Home() { return <main>${app}</main>; }\n`,
  );
}

afterEach(async () => {
  process.chdir(originalCwd);
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});

describe('MCP change assurance', () => {
  it('keeps eight tools while exposing changed UI assurance as a verify action', async () => {
    const root = mkdtempSync(join(tmpdir(), 'decantr-mcp-assurance-'));
    roots.push(root);
    write(
      root,
      'package.json',
      JSON.stringify({ name: 'mcp-assurance-app', dependencies: { react: '^19.0.0' } }),
    );
    write(
      root,
      'src/components/ui/Button.tsx',
      'export function Button() { return <button type="button" />; }\n',
    );
    write(
      root,
      'src/pages/Home.tsx',
      'export function Home() { return <button type="button">Save</button>; }\n',
    );
    process.chdir(root);

    const report = (await handleTool('decantr_verify', {
      action: 'changes',
      changed_files: ['src/pages/Home.tsx'],
    })) as {
      $schema: string;
      findings: Array<{ occurrence: { code: string; file: string } }>;
    };

    expect(TOOLS).toHaveLength(8);
    expect(report.$schema).toBe('https://decantr.ai/schemas/change-assurance-report.v1.json');
    expect(report.findings[0]?.occurrence).toMatchObject({
      code: 'COMP010',
      file: 'src/pages/Home.tsx',
    });
  });

  it('selects the one changed UI app from a monorepo root', async () => {
    const root = mkdtempSync(join(tmpdir(), 'decantr-mcp-assurance-workspace-'));
    roots.push(root);
    initGit(root);
    write(root, 'pnpm-workspace.yaml', 'packages:\n  - apps/*\n');
    write(root, 'package.json', JSON.stringify({ private: true }));
    writeWorkspaceApp(root, 'web');
    writeWorkspaceApp(root, 'admin');
    execFileSync('git', ['add', '.'], { cwd: root });
    execFileSync('git', ['commit', '-qm', 'initial'], { cwd: root });
    write(
      root,
      'apps/admin/src/pages/Home.tsx',
      'export function Home() { return <button type="button">Save</button>; }\n',
    );
    process.chdir(root);

    const report = (await handleTool('decantr_verify', { action: 'changes' })) as {
      project: { selectedAppRoot: string; selection: { strategy: string } };
      changeBase: { changedFiles: string[] };
    };

    expect(report.project).toMatchObject({
      selectedAppRoot: 'apps/admin',
      selection: { strategy: 'changed-files' },
    });
    expect(report.changeBase.changedFiles).toEqual(['src/pages/Home.tsx']);
  });

  it('fails closed at a monorepo root when no changed file identifies an app', async () => {
    const root = mkdtempSync(join(tmpdir(), 'decantr-mcp-assurance-ambiguous-'));
    roots.push(root);
    initGit(root);
    write(root, 'pnpm-workspace.yaml', 'packages:\n  - apps/*\n');
    write(root, 'package.json', JSON.stringify({ private: true }));
    writeWorkspaceApp(root, 'web');
    writeWorkspaceApp(root, 'admin');
    execFileSync('git', ['add', '.'], { cwd: root });
    execFileSync('git', ['commit', '-qm', 'initial'], { cwd: root });
    write(root, 'README.md', '# changed root documentation\n');
    process.chdir(root);

    const result = (await handleTool('decantr_verify', { action: 'changes' })) as {
      error: string;
    };

    expect(result.error).toContain('No changed file identifies a single UI app');
    expect(result.error).toContain('Pass project_path explicitly');
  });
});
