import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDebouncedGuard, loadEssence, shouldTriggerGuard } from '../src/watcher.js';

const TMP = join(__dirname, '.tmp-watcher');

beforeEach(() => {
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
});

describe('loadEssence', () => {
  it('loads and returns a valid v3 essence file', () => {
    const essencePath = join(TMP, 'decantr.essence.json');
    writeFileSync(
      essencePath,
      JSON.stringify({
        version: '3.1.0',
        dna: {
          theme: { id: 'clean', mode: 'dark', shape: 'rounded' },
          spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '4' },
          typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
          color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
          radius: { philosophy: 'rounded', base: 8 },
          elevation: { system: 'layered', max_levels: 3 },
          motion: { preference: 'subtle', duration_scale: 1.0, reduce_motion: true },
          accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
          personality: ['minimal'],
        },
        blueprint: {
          shell: 'top-nav-main',
          pages: [{ id: 'home', layout: ['hero'] }],
          features: [],
        },
        meta: {
          archetype: 'portfolio',
          target: 'react',
          platform: { type: 'spa', routing: 'hash' },
          guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'off' },
        },
      }),
    );

    const result = loadEssence(essencePath);
    expect(result).not.toBeNull();
    expect(result!.version).toBe('3.1.0');
  });

  it('returns null for missing file', () => {
    expect(loadEssence(join(TMP, 'nonexistent.json'))).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    const bad = join(TMP, 'bad.json');
    writeFileSync(bad, '{ broken json');
    expect(loadEssence(bad)).toBeNull();
  });
});

describe('shouldTriggerGuard', () => {
  it('returns true for .tsx files', () => {
    expect(shouldTriggerGuard('src/App.tsx')).toBe(true);
  });

  it('returns true for .vue files', () => {
    expect(shouldTriggerGuard('src/App.vue')).toBe(true);
  });

  it('returns true for .svelte files', () => {
    expect(shouldTriggerGuard('src/App.svelte')).toBe(true);
  });

  it('returns false for .css files', () => {
    expect(shouldTriggerGuard('src/style.css')).toBe(false);
  });

  it('returns false for node_modules paths', () => {
    expect(shouldTriggerGuard('node_modules/react/index.js')).toBe(false);
  });

  it('returns false for the essence file itself', () => {
    expect(shouldTriggerGuard('decantr.essence.json')).toBe(false);
  });
});

describe('createDebouncedGuard', () => {
  it('calls the callback after the delay', async () => {
    const fn = vi.fn();
    const debounced = createDebouncedGuard(fn, 50);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    await new Promise((r) => setTimeout(r, 80));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('coalesces rapid calls into one', async () => {
    const fn = vi.fn();
    const debounced = createDebouncedGuard(fn, 50);

    debounced();
    debounced();
    debounced();

    await new Promise((r) => setTimeout(r, 80));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
