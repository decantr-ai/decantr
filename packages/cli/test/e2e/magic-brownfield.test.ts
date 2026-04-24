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
    expect(output).toContain('decantr init --existing --yes');
    expect(existsSync(join(testDir, '.decantr', 'analysis.json'))).toBe(true);
    expect(existsSync(join(testDir, 'decantr.essence.json'))).toBe(false);
    expect(readFileSync(join(testDir, '.decantr', 'analysis.json'), 'utf-8')).toContain(
      '"workflow": "brownfield-adoption"',
    );
  });
});
