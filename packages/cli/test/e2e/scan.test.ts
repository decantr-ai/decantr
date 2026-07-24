import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('scan command', () => {
  let testDir: string;
  const cliPath = join(__dirname, '..', '..', 'dist', 'index.js');

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-cli-scan-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('prints a useful terminal report without writing Decantr files', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'scan-react',
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            'react-router-dom': '^7.0.0',
          },
        },
        null,
        2,
      ),
    );
    mkdirSync(join(testDir, 'src'), { recursive: true });
    writeFileSync(
      join(testDir, 'src', 'App.tsx'),
      'import { Route, Routes } from "react-router-dom"; export function App() { return <Routes><Route path="/" element={<main />} /></Routes>; }\n',
    );

    const output = execSync(`node ${cliPath} scan`, { cwd: testDir, encoding: 'utf-8' });

    expect(output).toContain('Decantr Scan');
    expect(output).toContain('Adoption Truth');
    expect(output).toContain('Selected app:');
    expect(output).toContain('Read-only Brownfield reconnaissance');
    expect(output).toContain('Typed Contract Graph');
    expect(output).toContain('not attached');
    expect(output).toContain('partial fit');
    expect(output).toContain('Production route authority is not proven');
    expect(output).toContain('npx @decantr/cli adopt --yes');
    expect(output).toContain('This scan was read-only');
    expect(output).toContain('without promoting unresolved topology');
    expect(output).toContain('decantr adopt --yes');
    expect(output).toContain('decantr task <target>');
    expect(existsSync(join(testDir, '.decantr'))).toBe(false);
  });

  it('emits JSON and supports --project from a workspace root', () => {
    mkdirSync(join(testDir, 'apps', 'web', 'src'), { recursive: true });
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ private: true, workspaces: ['apps/*'] }, null, 2),
    );
    writeFileSync(join(testDir, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n');
    writeFileSync(
      join(testDir, 'apps', 'web', 'package.json'),
      JSON.stringify({ dependencies: { react: '^19.0.0' } }, null, 2),
    );
    writeFileSync(
      join(testDir, 'apps', 'web', 'src', 'App.tsx'),
      'export function App() { return <main />; }\n',
    );

    const output = execSync(`node ${cliPath} scan --project apps/web --json`, {
      cwd: testDir,
      encoding: 'utf-8',
    });
    const report = JSON.parse(output) as {
      schemaVersion?: string;
      input?: { value?: string };
      project?: {
        framework?: string;
        packageManager?: string;
        primaryLanguage?: string;
        projectPath?: string;
      };
      routes?: { routeSignalCount?: number; taskableRouteCount?: number };
      components?: { componentCount?: number; confidence?: string };
      graphPreview?: {
        status?: string;
        canPreview?: boolean;
        nextCommand?: string | null;
        diff?: unknown;
      };
    };

    expect(report.schemaVersion).toBe('scan-report.v2');
    expect(report.input?.value).toBe('apps/web');
    expect(report.project?.framework).toBe('react');
    expect(report.project?.packageManager).toBe('pnpm');
    expect(report.project?.primaryLanguage).toBe('typescript');
    expect(report.project?.projectPath).toBe('apps/web');
    expect(report.routes?.routeSignalCount).toBeGreaterThanOrEqual(0);
    expect(report.routes?.taskableRouteCount).toBeGreaterThanOrEqual(0);
    expect(report.components?.componentCount).toBeGreaterThanOrEqual(1);
    expect(report.components?.confidence).toMatch(/low|medium|high/);
    expect(report.graphPreview?.status).toBe('not_attached');
    expect(report.graphPreview?.canPreview).toBe(false);
    expect(report.graphPreview?.nextCommand).toBeNull();
    expect(report.graphPreview?.diff).toBeNull();
    expect(existsSync(join(testDir, 'apps', 'web', '.decantr'))).toBe(false);
  });

  it('emits a structured JSON error and conventional app candidate for an ambiguous root', () => {
    mkdirSync(join(testDir, 'src', 'frontend', 'src'), { recursive: true });
    writeFileSync(
      join(testDir, 'src', 'frontend', 'package.json'),
      JSON.stringify({ dependencies: { svelte: '^5.0.0' } }, null, 2),
    );
    writeFileSync(join(testDir, 'src', 'frontend', 'svelte.config.js'), 'export default {};\n');

    const result = spawnSync('node', [cliPath, 'scan', '--json'], {
      cwd: testDir,
      encoding: 'utf-8',
    });
    const payload = JSON.parse(result.stdout) as {
      schemaVersion?: string;
      ok?: boolean;
      error?: { code?: string };
      workspace?: { appCandidates?: Array<{ path?: string; category?: string }> };
    };

    expect(result.status).toBe(1);
    expect(payload.schemaVersion).toBe('decantr-command-error.v1');
    expect(payload.ok).toBe(false);
    expect(payload.error?.code).toBe('project_selection_required');
    expect(payload.workspace?.appCandidates).toContainEqual(
      expect.objectContaining({ path: 'src/frontend', category: 'product-ui' }),
    );
    expect(result.stdout).not.toContain('\u001b[');
  });

  it('reports non-web repositories without failing', () => {
    writeFileSync(join(testDir, 'pyproject.toml'), '[project]\nname = "service"\n');
    writeFileSync(join(testDir, 'main.py'), 'print("hello")\n');

    const output = execSync(`node ${cliPath} scan`, { cwd: testDir, encoding: 'utf-8' });

    expect(output).toContain('Not a Brownfield UI target');
    expect(existsSync(join(testDir, '.decantr'))).toBe(false);
  });
});
