import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

function runCli(cwd: string, args: string[]): string {
  const cliPath = join(__dirname, '..', '..', 'dist', 'index.js');
  return execFileSync('node', [cliPath, ...args], {
    cwd,
    encoding: 'utf-8',
    timeout: 15_000,
    env: { ...process.env, DECANTR_OFFLINE: 'true' },
  });
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function writeReactFixture(root: string): void {
  mkdirSync(join(root, 'src'), { recursive: true });
  writeJson(join(root, 'package.json'), {
    name: 'cursor-connect-fixture',
    dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
  });
  writeFileSync(
    join(root, 'src', 'App.tsx'),
    'export function App() { return <main><a href="/settings">Settings</a></main>; }\n',
    'utf-8',
  );
}

function writeEssence(root: string): void {
  writeJson(join(root, 'decantr.essence.json'), {
    version: '4.0.0',
    dna: {
      theme: { id: 'existing', mode: 'auto', shape: 'rounded' },
      spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '_gap4' },
      typography: { scale: 'system', heading_weight: 600, body_weight: 400 },
      color: { palette: 'existing', accent_count: 1, cvd_preference: 'auto' },
      radius: { philosophy: 'rounded', base: 8 },
      elevation: { system: 'existing', max_levels: 3 },
      motion: { preference: 'subtle', duration_scale: 1, reduce_motion: false },
      accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: false },
      personality: ['cursor activation fixture'],
    },
    blueprint: {
      sections: [
        {
          id: 'app',
          role: 'primary',
          shell: 'observed-existing-shell',
          features: [],
          description: 'Existing app',
          pages: [{ id: 'home', route: '/', layout: ['existing-surface'] }],
        },
      ],
      features: [],
      routes: { '/': { section: 'app', page: 'home' } },
    },
    meta: {
      archetype: 'observed-brownfield',
      target: 'react',
      platform: { type: 'spa', routing: 'history' },
      guard: { mode: 'guided', dna_enforcement: 'warn', blueprint_enforcement: 'warn' },
    },
  });
}

describe('cursor connector', () => {
  let testDir = '';

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-cursor-connect-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('previews Cursor MCP and rule files without writing them', () => {
    writeReactFixture(testDir);
    writeEssence(testDir);

    const output = runCli(testDir, ['connect', 'cursor', '--preview']);

    expect(output).toContain('Decantr Cursor Connection');
    expect(output).toContain('.cursor/mcp.json preview');
    expect(output).toContain('"decantr"');
    expect(output).toContain('decantr_context');
    expect(existsSync(join(testDir, '.cursor', 'mcp.json'))).toBe(false);
    expect(existsSync(join(testDir, '.cursor', 'rules', 'decantr.mdc'))).toBe(false);
  });

  it('writes Cursor MCP config and rule file while preserving existing MCP servers', () => {
    writeReactFixture(testDir);
    writeEssence(testDir);
    mkdirSync(join(testDir, '.cursor'), { recursive: true });
    writeJson(join(testDir, '.cursor', 'mcp.json'), {
      mcpServers: {
        existing: { command: 'node', args: ['server.js'] },
      },
    });

    const output = runCli(testDir, ['connect', 'cursor']);
    const mcp = JSON.parse(readFileSync(join(testDir, '.cursor', 'mcp.json'), 'utf-8')) as {
      mcpServers: Record<string, { command: string; args: string[] }>;
    };
    const rule = readFileSync(join(testDir, '.cursor', 'rules', 'decantr.mdc'), 'utf-8');

    expect(output).toContain('wrote');
    expect(mcp.mcpServers.existing).toMatchObject({ command: 'node', args: ['server.js'] });
    expect(mcp.mcpServers.decantr).toMatchObject({
      command: 'npx',
      args: ['-y', '@decantr/mcp-server'],
    });
    expect(rule).toContain('alwaysApply: true');
    expect(rule).toContain('decantr_context');
    expect(rule).toContain('decantr verify --brownfield --local-patterns');
    expect(rule).toContain('runtime source and Decantr context disagree');
  });

  it('keeps Cursor config at the opened workspace root and includes project_path guidance', () => {
    mkdirSync(join(testDir, 'apps', 'web'), { recursive: true });
    writeFileSync(join(testDir, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n', 'utf-8');
    writeJson(join(testDir, 'package.json'), { name: 'workspace' });
    writeReactFixture(join(testDir, 'apps', 'web'));
    writeEssence(join(testDir, 'apps', 'web'));

    const output = runCli(testDir, ['connect', 'cursor', '--project', 'apps/web']);
    const rule = readFileSync(join(testDir, '.cursor', 'rules', 'decantr.mdc'), 'utf-8');

    expect(output).toContain('Cursor project_path: apps/web');
    expect(existsSync(join(testDir, '.cursor', 'mcp.json'))).toBe(true);
    expect(existsSync(join(testDir, 'apps', 'web', '.cursor', 'mcp.json'))).toBe(false);
    expect(rule).toContain('"project_path": "apps/web"');
    expect(rule).toContain('decantr task');
    expect(rule).toContain('--project apps/web');
  });
});
