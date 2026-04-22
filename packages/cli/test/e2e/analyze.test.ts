import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';

describe('analyze command', () => {
  let testDir: string;
  const cliPath = join(__dirname, '..', '..', 'dist', 'index.js');

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-analyze-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('writes analysis.json and init-seed.json for brownfield adoption', () => {
    writeFileSync(join(testDir, 'package.json'), JSON.stringify({
      name: 'brownfield-react',
      private: true,
      dependencies: {
        react: '^19.0.0',
        'react-dom': '^19.0.0',
      },
    }, null, 2) + '\n');
    writeFileSync(join(testDir, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { jsx: 'react-jsx' },
    }, null, 2) + '\n');
    mkdirSync(join(testDir, 'src', 'components'), { recursive: true });
    writeFileSync(join(testDir, 'src', 'components', 'Sidebar.tsx'), 'export function Sidebar() { return <aside />; }\n');
    writeFileSync(join(testDir, 'src', 'App.tsx'), 'export function App() { return <main>Hello</main>; }\n');

    execSync(`node ${cliPath} analyze`, { cwd: testDir, stdio: 'pipe' });

    const analysisPath = join(testDir, '.decantr', 'analysis.json');
    const seedPath = join(testDir, '.decantr', 'init-seed.json');

    expect(existsSync(analysisPath)).toBe(true);
    expect(existsSync(seedPath)).toBe(true);

    const analysis = JSON.parse(readFileSync(analysisPath, 'utf-8')) as {
      decantr?: { workflow?: string; attach?: { recommendedCommand?: string } };
    };
    const seed = JSON.parse(readFileSync(seedPath, 'utf-8')) as {
      workflow?: string;
      target?: string;
      shell?: string;
      existing?: boolean;
      registryOptional?: boolean;
    };

    expect(analysis.decantr?.workflow).toBe('brownfield-adoption');
    expect(analysis.decantr?.attach?.recommendedCommand).toBe('decantr init --existing --yes');
    expect(seed.workflow).toBe('brownfield-adoption');
    expect(seed.target).toBe('react');
    expect(seed.shell).toBe('sidebar-main');
    expect(seed.existing).toBe(true);
    expect(seed.registryOptional).toBe(true);
  });
});
