import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('magic command in existing projects', () => {
  let testDir: string;
  const cliPath = join(__dirname, '..', '..', 'dist', 'index.js');

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-magic-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('steers existing projects into brownfield analyze instead of scaffolding', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'existing-app',
          private: true,
          dependencies: {
            react: '^19.0.0',
          },
        },
        null,
        2,
      ) + '\n',
    );
    mkdirSync(join(testDir, 'src'), { recursive: true });
    writeFileSync(
      join(testDir, 'src', 'App.tsx'),
      'export function App() { return <main>Hello</main>; }\n',
    );

    const output = execSync(`node ${cliPath} magic "AI operations workspace"`, {
      cwd: testDir,
      stdio: 'pipe',
    }).toString();

    expect(output).toContain('Existing project detected.');
    expect(output).toContain('decantr init --existing --accept-proposal');
    expect(existsSync(join(testDir, '.decantr', 'observed-essence.proposal.json'))).toBe(true);
    expect(existsSync(join(testDir, '.decantr', 'analysis.json'))).toBe(true);
    expect(existsSync(join(testDir, 'decantr.essence.json'))).toBe(false);
    expect(readFileSync(join(testDir, '.decantr', 'analysis.json'), 'utf-8')).toContain(
      '"workflow": "brownfield-adoption"',
    );
  });

  it('keeps an offline greenfield scaffold contract-only and reports only existing context', () => {
    const output = execSync(`node ${cliPath} magic "AI operations workspace" --offline`, {
      cwd: testDir,
      env: { ...process.env, DECANTR_OFFLINE: 'true' },
      stdio: 'pipe',
    }).toString();

    const decantrMd = readFileSync(join(testDir, 'DECANTR.md'), 'utf-8');
    expect(output).toContain('host-owned (contract-only; no generated Decantr CSS)');
    expect(output).toContain('.decantr/context/scaffold.md');
    expect(output).not.toContain('CSS atoms, treatments, decorators');
    expect(output).not.toContain('tokens.css + treatments.css + global.css');
    expect(existsSync(join(testDir, 'src', 'styles', 'treatments.css'))).toBe(false);
    expect(decantrMd).toContain('- **Adoption mode:** contract-only');
  });
});
