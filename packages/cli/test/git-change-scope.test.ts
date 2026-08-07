import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  collectGitChangeScope,
  resolveChangeAssuranceProject,
  scopeGitChangeEvidence,
} from '../src/git-change-scope.js';

const roots: string[] = [];

function createRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'decantr-git-scope-'));
  roots.push(root);
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['config', 'user.email', 'test@decantr.ai'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Decantr Test'], { cwd: root });
  return root;
}

function write(root: string, path: string, contents: string): void {
  const absolutePath = join(root, path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents, 'utf-8');
}

function commitAll(root: string, message: string): void {
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['commit', '-qm', message], { cwd: root });
}

function createWorkspace(root: string): void {
  write(root, 'pnpm-workspace.yaml', 'packages:\n  - apps/*\n');
  write(root, 'package.json', JSON.stringify({ private: true }));
  for (const app of ['web', 'admin']) {
    write(
      root,
      `apps/${app}/package.json`,
      JSON.stringify({ name: app, dependencies: { react: '^19.0.0' } }),
    );
    write(
      root,
      `apps/${app}/src/App.tsx`,
      `export function App() { return <main>${app}</main>; }\n`,
    );
  }
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('Git change scope', () => {
  it('collects staged, unstaged, deleted, and untracked working-tree files', () => {
    const root = createRoot();
    write(root, 'src/staged.tsx', 'export const staged = 1;\n');
    write(root, 'src/unstaged.tsx', 'export const unstaged = 1;\n');
    write(root, 'src/deleted.tsx', 'export const deleted = 1;\n');
    commitAll(root, 'initial');

    write(root, 'src/staged.tsx', 'export const staged = 2;\n');
    execFileSync('git', ['add', 'src/staged.tsx'], { cwd: root });
    write(root, 'src/unstaged.tsx', 'export const unstaged = 2;\n');
    execFileSync('git', ['rm', '-q', 'src/deleted.tsx'], { cwd: root });
    write(root, 'src/untracked.tsx', 'export const untracked = 1;\n');

    const scope = collectGitChangeScope(root);

    expect(scope.comparisonScope.kind).toBe('working_tree');
    expect(scope.changeBase.completeness).toBe('complete');
    expect(scope.changeBase.changedFiles).toEqual([
      'src/deleted.tsx',
      'src/staged.tsx',
      'src/unstaged.tsx',
      'src/untracked.tsx',
    ]);
  });

  it('uses merge-base commit-range semantics for --since', () => {
    const root = createRoot();
    write(root, 'src/App.tsx', 'export const App = 1;\n');
    commitAll(root, 'base');
    const base = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: root,
      encoding: 'utf-8',
    }).trim();
    write(root, 'src/App.tsx', 'export const App = 2;\n');
    commitAll(root, 'change');

    const scope = collectGitChangeScope(root, base);

    expect(scope.comparisonScope.kind).toBe('commit_range');
    expect(scope.changeBase.mergeBase).toBe(base);
    expect(scope.changeBase.changedFiles).toEqual(['src/App.tsx']);
  });

  it('scopes workspace paths to the selected app', () => {
    const root = createRoot();
    createWorkspace(root);
    commitAll(root, 'initial');
    write(root, 'apps/web/src/App.tsx', 'export function App() { return <main>changed</main>; }\n');
    write(root, 'README.md', '# root\n');

    const scoped = scopeGitChangeEvidence(collectGitChangeScope(root), 'apps/web');

    expect(scoped.changeBase.changedFiles).toEqual(['src/App.tsx']);
  });

  it('automatically selects the only changed app', () => {
    const root = createRoot();
    createWorkspace(root);
    commitAll(root, 'initial');
    write(
      root,
      'apps/admin/src/App.tsx',
      'export function App() { return <main>changed</main>; }\n',
    );

    const resolution = resolveChangeAssuranceProject(root);

    expect(resolution.projectPath).toBe('apps/admin');
    expect(resolution.selection.strategy).toBe('changed-files');
    expect(resolution.git.changeBase.changedFiles).toEqual(['src/App.tsx']);
  });

  it('fails closed when changed files span multiple apps', () => {
    const root = createRoot();
    createWorkspace(root);
    commitAll(root, 'initial');
    write(root, 'apps/admin/src/App.tsx', 'export const admin = 2;\n');
    write(root, 'apps/web/src/App.tsx', 'export const web = 2;\n');

    expect(() => resolveChangeAssuranceProject(root)).toThrow(/span multiple app candidates/u);
  });

  it('fails closed when no changed file identifies an app', () => {
    const root = createRoot();
    createWorkspace(root);
    commitAll(root, 'initial');
    write(root, 'README.md', '# changed root documentation\n');

    expect(() => resolveChangeAssuranceProject(root)).toThrow(
      /No single app can be selected safely/u,
    );
  });

  it('returns incomplete evidence outside Git instead of inventing a clean diff', () => {
    const root = mkdtempSync(join(tmpdir(), 'decantr-no-git-'));
    roots.push(root);

    const scope = collectGitChangeScope(root);

    expect(scope.comparisonScope.kind).toBe('unknown');
    expect(scope.changeBase.completeness).toBe('incomplete');
    expect(scope.changeBase.limitations[0]).toContain('Git change scope could not be established');
  });

  it('covers staged and untracked files before the first commit', () => {
    const root = createRoot();
    write(root, 'src/staged.tsx', 'export const staged = true;\n');
    execFileSync('git', ['add', 'src/staged.tsx'], { cwd: root });
    write(root, 'src/untracked.tsx', 'export const untracked = true;\n');

    const scope = collectGitChangeScope(root);

    expect(scope.comparisonScope).toEqual({
      kind: 'working_tree',
      identity: 'UNBORN+working-tree',
    });
    expect(scope.changeBase.completeness).toBe('complete');
    expect(scope.changeBase.changedFiles).toEqual(['src/staged.tsx', 'src/untracked.tsx']);
  });
});
