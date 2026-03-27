import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectWirings } from '../src/wiring.js';
import { resolvePatternPreset } from '../src/pattern.js';
import type { Pattern } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentRoot = join(__dirname, 'fixtures');

async function loadPattern(id: string): Promise<Pattern> {
  const raw = await readFile(join(contentRoot, 'patterns', `${id}.json`), 'utf-8');
  return JSON.parse(raw) as Pattern;
}

describe('activity-feed pattern', () => {
  let pattern: Pattern;

  it('loads valid JSON with correct id', async () => {
    pattern = await loadPattern('activity-feed');
    expect(pattern.id).toBe('activity-feed');
    expect(pattern.name).toBe('Activity Feed');
    expect(pattern.version).toBe('1.0.0');
  });

  it('has all three presets: standard, compact, detailed', async () => {
    pattern = await loadPattern('activity-feed');
    expect(Object.keys(pattern.presets)).toContain('standard');
    expect(Object.keys(pattern.presets)).toContain('compact');
    expect(Object.keys(pattern.presets)).toContain('detailed');
    expect(pattern.default_preset).toBe('standard');
  });

  it('io.consumes includes search and view', async () => {
    pattern = await loadPattern('activity-feed');
    expect(pattern.io).toBeDefined();
    expect(pattern.io!.consumes).toContain('search');
    expect(pattern.io!.consumes).toContain('view');
  });

  it('io.actions includes load-more and mark-read', async () => {
    pattern = await loadPattern('activity-feed');
    expect(pattern.io!.actions).toContain('load-more');
    expect(pattern.io!.actions).toContain('mark-read');
  });

  it('components include Avatar and Badge', async () => {
    pattern = await loadPattern('activity-feed');
    expect(pattern.components).toContain('Avatar');
    expect(pattern.components).toContain('Badge');
  });

  it('each preset has valid layout and code', async () => {
    pattern = await loadPattern('activity-feed');
    for (const [name, preset] of Object.entries(pattern.presets)) {
      expect(preset.layout, `${name} missing layout`).toBeDefined();
      expect(preset.layout.layout, `${name} missing layout`).toBeTruthy();
      expect(preset.layout.atoms, `${name} missing atoms`).toBeTruthy();
      expect(preset.code, `${name} missing code`).toBeDefined();
      expect(preset.code.imports, `${name} missing imports`).toBeTruthy();
      expect(preset.code.example, `${name} missing example`).toBeTruthy();
    }
  });

  it('resolves default preset via resolvePatternPreset', async () => {
    pattern = await loadPattern('activity-feed');
    const resolved = resolvePatternPreset(pattern);
    expect(resolved.preset).toBe('standard');
    expect(resolved.code.example).toContain('ActivityFeed');
  });

  it('wiring rule exists for filter-bar + activity-feed', () => {
    const wirings = detectWirings(['filter-bar', 'activity-feed']);
    expect(wirings).toHaveLength(1);
    expect(wirings[0].signals).toHaveLength(2);
    expect(wirings[0].props['activity-feed']).toHaveProperty('search');
    expect(wirings[0].props['activity-feed']).toHaveProperty('view');
  });
});
