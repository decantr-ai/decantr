import { describe, it, expect } from 'vitest';
import { decantrPlugin } from '../src/index.js';

describe('decantrPlugin', () => {
  it('returns a Vite plugin object', () => {
    const plugin = decantrPlugin();
    expect(plugin.name).toBe('decantr-guard');
    expect(typeof plugin.configureServer).toBe('function');
  });

  it('accepts custom essencePath option', () => {
    const plugin = decantrPlugin({ essencePath: 'custom.json' });
    expect(plugin.name).toBe('decantr-guard');
  });

  it('accepts custom debounceMs option', () => {
    const plugin = decantrPlugin({ debounceMs: 500 });
    expect(plugin.name).toBe('decantr-guard');
  });

  it('defaults enforce to true', () => {
    const plugin = decantrPlugin();
    expect(plugin.name).toBe('decantr-guard');
  });
});
