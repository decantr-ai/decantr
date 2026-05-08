import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type StudioServerHandle, startStudioServer } from '../src/commands/studio.js';

let testDir = '';
let handle: StudioServerHandle | null = null;

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function writeMinimalProject(): void {
  mkdirSync(join(testDir, '.decantr', 'cache', '@official', 'patterns'), { recursive: true });
  mkdirSync(join(testDir, '.decantr', 'cache', '@official', 'themes'), { recursive: true });
  writeJson(join(testDir, '.decantr', 'cache', '@official', 'patterns', 'hero.json'), {
    id: 'hero',
    name: 'Hero',
    version: '1.0.0',
  });
  writeJson(join(testDir, '.decantr', 'cache', '@official', 'themes', 'luminarum.json'), {
    id: 'luminarum',
    modes: ['dark', 'light'],
    version: '1.0.0',
  });
  writeJson(join(testDir, 'decantr.essence.json'), {
    version: '4.0.0',
    dna: {
      theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
      spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '_gap4' },
      typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
      color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
      radius: { philosophy: 'rounded', base: 8 },
      elevation: { system: 'layered', max_levels: 3 },
      motion: { preference: 'subtle', duration_scale: 1, reduce_motion: false },
      accessibility: { wcag_level: 'AA', focus_visible: false, skip_nav: false },
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
      routes: { '/': { section: 'marketing', page: 'home' } },
    },
    meta: {
      archetype: 'marketing',
      target: 'react',
      platform: { type: 'spa', routing: 'hash' },
      guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
    },
  });
}

describe('Decantr Studio server', () => {
  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-studio-'));
    writeMinimalProject();
  });

  afterEach(async () => {
    if (handle) {
      await new Promise<void>((resolve) => handle?.server.close(() => resolve()));
      handle = null;
    }
    rmSync(testDir, { recursive: true, force: true });
  });

  it('serves the dashboard and health endpoints without external dependencies', async () => {
    handle = await startStudioServer(testDir, { port: 0 });

    const html = await fetch(handle.url).then((response) => response.text());
    const health = await fetch(`${handle.url}/api/health`).then((response) => response.json());
    const refreshed = await fetch(`${handle.url}/api/refresh`, { method: 'POST' }).then(
      (response) => response.json(),
    );

    expect(html).toContain('Decantr Project Health');
    expect(health.$schema).toBe('https://decantr.ai/schemas/project-health-report.v1.json');
    expect(refreshed.$schema).toBe('https://decantr.ai/schemas/project-health-report.v1.json');
  });
});
