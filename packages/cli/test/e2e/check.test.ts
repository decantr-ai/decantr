import { execSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('check command (e2e)', () => {
  let testDir: string;
  const cliPath = join(__dirname, '..', '..', 'dist', 'bin.js');

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-check-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('uses local registry cache for pattern guard validation', () => {
    mkdirSync(join(testDir, '.decantr', 'cache', '@official', 'patterns'), { recursive: true });
    mkdirSync(join(testDir, '.decantr', 'cache', '@official', 'themes'), { recursive: true });

    writeFileSync(
      join(testDir, '.decantr', 'cache', '@official', 'patterns', 'hero.json'),
      JSON.stringify(
        {
          id: 'hero',
          name: 'Hero',
          version: '1.0.0',
        },
        null,
        2,
      ),
    );
    writeFileSync(
      join(testDir, '.decantr', 'cache', '@official', 'themes', 'luminarum.json'),
      JSON.stringify(
        {
          id: 'luminarum',
          modes: ['dark', 'light'],
          version: '1.0.0',
        },
        null,
        2,
      ),
    );

    writeFileSync(
      join(testDir, 'decantr.essence.json'),
      JSON.stringify(
        {
          version: '3.1.0',
          dna: {
            theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
            spacing: {
              base_unit: 4,
              scale: 'linear',
              density: 'comfortable',
              content_gap: '_gap4',
            },
            typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
            color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
            radius: { philosophy: 'rounded', base: 8 },
            elevation: { system: 'layered', max_levels: 3 },
            motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
            accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
            personality: ['clean'],
          },
          blueprint: {
            sections: [
              {
                id: 'marketing',
                role: 'public',
                shell: 'top-nav-footer',
                features: [],
                description: 'Marketing surface',
                pages: [{ id: 'home', route: '/', layout: ['hero'] }],
              },
            ],
            features: [],
            routes: {
              '/': { section: 'marketing', page: 'home' },
            },
          },
          meta: {
            archetype: 'marketing',
            target: 'react',
            platform: { type: 'spa', routing: 'hash' },
            guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
          },
        },
        null,
        2,
      ),
    );

    const output = execSync(`node ${cliPath} check`, {
      cwd: testDir,
      encoding: 'utf-8',
      timeout: 15000,
      env: { ...process.env, DECANTR_OFFLINE: 'true' },
    });

    expect(output).not.toContain('[pattern-exists]');
    expect(output).toContain('No issues found. Project is healthy.');
  });
});
