import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  type AdoptionSnapshotOptions,
  captureAdoptionSnapshot,
  createAdoptionReceipt,
} from '../src/adoption-receipt.js';

function write(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf-8');
}

describe('adoption receipt', () => {
  let workspaceRoot = '';

  beforeEach(() => {
    workspaceRoot = mkdtempSync(join(tmpdir(), 'decantr-adoption-receipt-'));
  });

  afterEach(() => {
    rmSync(workspaceRoot, { recursive: true, force: true });
  });

  function capture(options: AdoptionSnapshotOptions = {}) {
    return captureAdoptionSnapshot(workspaceRoot, options);
  }

  it('verifies unchanged host source with stable before and after hashes', () => {
    write(join(workspaceRoot, 'package.json'), '{"private":true}\n');
    write(join(workspaceRoot, 'src', 'App.tsx'), 'export function App() { return null; }\n');

    const before = capture();
    const after = capture();
    const receipt = createAdoptionReceipt(before, after);

    expect(receipt.integrity).toEqual({
      status: 'verified-untouched',
      complete: true,
      hostSourceBeforeHash: receipt.integrity.hostSourceAfterHash,
      hostSourceAfterHash: receipt.integrity.hostSourceBeforeHash,
    });
    expect(receipt.changes.created).toEqual([]);
    expect(receipt.changes.updated).toEqual([]);
    expect(receipt.changes.deleted).toEqual([]);
    expect(receipt.limitations).toEqual([]);
    expect(JSON.parse(JSON.stringify(receipt))).toEqual(receipt);
    expect(existsSync(join(workspaceRoot, '.decantr', 'project.json'))).toBe(false);
  });

  it('records app and workspace support writes while preserving the selected app scope', () => {
    const projectRoot = join(workspaceRoot, 'apps', 'web');
    write(join(projectRoot, 'src', 'App.tsx'), 'export const App = () => null;\n');
    write(join(workspaceRoot, '.prettierignore'), 'dist/\n');
    const before = capture({ projectRoot });

    write(join(projectRoot, '.decantr', 'analysis.json'), '{"version":1}\n');
    write(join(projectRoot, 'DECANTR.md'), '# Decantr\n');
    write(join(projectRoot, 'decantr.essence.json'), '{"version":"4.0.0"}\n');
    write(join(workspaceRoot, '.github', 'workflows', 'decantr-ci.yml'), 'name: Decantr CI\n');
    write(
      join(workspaceRoot, '.prettierignore'),
      'dist/\napps/web/.decantr/\napps/web/DECANTR.md\napps/web/decantr.essence.json\n',
    );

    const after = capture({ projectRoot });
    const receipt = createAdoptionReceipt(before, after);

    expect(receipt.scope.root).toBe('apps/web');
    expect(receipt.scope.capturedRoots).toEqual(['.']);
    expect(receipt.integrity.status).toBe('verified-untouched');
    expect(receipt.integrity.hostSourceAfterHash).toBe(receipt.integrity.hostSourceBeforeHash);
    expect(receipt.changes.created).toEqual([
      '.github/workflows/decantr-ci.yml',
      'apps/web/.decantr/analysis.json',
      'apps/web/DECANTR.md',
      'apps/web/decantr.essence.json',
    ]);
    expect(receipt.changes.updated).toEqual(['.prettierignore']);
    expect(receipt.changes.allowedGenerated.created).toEqual(receipt.changes.created);
    expect(receipt.changes.decantrManaged).toEqual(receipt.changes.allowedGenerated);
    expect(receipt.changes.hostSource).toEqual({ created: [], updated: [], deleted: [] });
    expect(receipt.changes.hostOther.updated).toEqual(['.prettierignore']);
    expect(existsSync(join(projectRoot, '.decantr', 'project.json'))).toBe(false);
  });

  it('cannot verify untouched source when workspace-root authored config changes', () => {
    const projectRoot = join(workspaceRoot, 'apps', 'web');
    write(join(projectRoot, 'src', 'App.tsx'), 'export const App = () => null;\n');
    write(join(workspaceRoot, 'vite.config.ts'), 'export default { mode: "before" };\n');
    const before = capture({ projectRoot });

    write(join(workspaceRoot, 'vite.config.ts'), 'export default { mode: "after" };\n');

    const receipt = createAdoptionReceipt(before, capture({ projectRoot }));
    expect(receipt.scope).toMatchObject({ root: 'apps/web', capturedRoots: ['.'] });
    expect(receipt.integrity.status).toBe('source-changed');
    expect(receipt.changes.updated).toEqual(['vite.config.ts']);
    expect(receipt.changes.hostSource.updated).toEqual(['vite.config.ts']);
    expect(receipt.integrity.hostSourceAfterHash).not.toBe(receipt.integrity.hostSourceBeforeHash);
  });

  it('detects an updated host application-source file', () => {
    const appPath = join(workspaceRoot, 'src', 'App.tsx');
    write(appPath, 'export const value = 1;\n');
    const before = capture();

    write(appPath, 'export const value = 2;\n');

    const receipt = createAdoptionReceipt(before, capture());
    expect(receipt.integrity.status).toBe('source-changed');
    expect(receipt.integrity.complete).toBe(true);
    expect(receipt.integrity.hostSourceAfterHash).not.toBe(receipt.integrity.hostSourceBeforeHash);
    expect(receipt.changes.updated).toEqual(['src/App.tsx']);
    expect(receipt.changes.hostSource.updated).toEqual(['src/App.tsx']);
  });

  it('detects deletion of a host application-source file', () => {
    const routePath = join(workspaceRoot, 'src', 'routes', 'settings.tsx');
    write(routePath, 'export default function Settings() { return null; }\n');
    const before = capture();

    rmSync(routePath);

    const receipt = createAdoptionReceipt(before, capture());
    expect(receipt.integrity.status).toBe('source-changed');
    expect(receipt.changes.deleted).toEqual(['src/routes/settings.tsx']);
    expect(receipt.changes.hostSource.deleted).toEqual(['src/routes/settings.tsx']);
    expect(receipt.integrity.hostSourceAfterHash).not.toBe(receipt.integrity.hostSourceBeforeHash);
  });

  it('does not follow symlinks or capture excluded dependency and build-cache paths', () => {
    write(join(workspaceRoot, 'src', 'App.tsx'), 'export const App = true;\n');
    const dependencyPath = join(workspaceRoot, 'node_modules', 'example', 'index.ts');
    const bundlePath = join(workspaceRoot, 'dist', 'bundle.js');
    write(dependencyPath, 'export const dependency = 1;\n');
    write(bundlePath, 'bundle-v1\n');
    symlinkSync(dependencyPath, join(workspaceRoot, 'src', 'linked-dependency.ts'));
    const before = capture();

    write(dependencyPath, 'export const dependency = 2;\n');
    write(bundlePath, 'bundle-v2\n');

    const after = capture();
    const receipt = createAdoptionReceipt(before, after);

    expect(before.files.map((file) => file.path)).toEqual(['src/App.tsx']);
    expect(after.files.map((file) => file.path)).toEqual(['src/App.tsx']);
    expect(receipt.changes.created).toEqual([]);
    expect(receipt.changes.updated).toEqual([]);
    expect(receipt.changes.deleted).toEqual([]);
    expect(receipt.integrity.status).toBe('incomplete');
    expect(receipt.integrity.complete).toBe(false);
    expect(receipt.limitations).toEqual([
      expect.objectContaining({
        phase: 'before',
        code: 'symlink',
        path: 'src/linked-dependency.ts',
      }),
      expect.objectContaining({
        phase: 'after',
        code: 'symlink',
        path: 'src/linked-dependency.ts',
      }),
    ]);
  });

  it('reports bounded capture as incomplete instead of claiming source was untouched', () => {
    write(join(workspaceRoot, 'a.ts'), 'export const a = 1;\n');
    write(join(workspaceRoot, 'b.ts'), 'export const b = 2;\n');

    const before = capture({ maxEntries: 1 });
    const after = capture({ maxEntries: 1 });
    const receipt = createAdoptionReceipt(before, after);

    expect(before.files.map((file) => file.path)).toEqual(['a.ts']);
    expect(before.complete).toBe(false);
    expect(receipt.integrity.status).toBe('incomplete');
    expect(receipt.integrity.complete).toBe(false);
    expect(receipt.changes.hostSource).toEqual({ created: [], updated: [], deleted: [] });
    expect(receipt.limitations).toEqual([
      expect.objectContaining({ phase: 'before', code: 'entry-limit', path: 'b.ts' }),
      expect.objectContaining({ phase: 'after', code: 'entry-limit', path: 'b.ts' }),
    ]);
  });
});
