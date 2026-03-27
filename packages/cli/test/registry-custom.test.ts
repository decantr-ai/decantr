import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { RegistryClient } from '../src/registry.js';

describe('RegistryClient custom theme resolution', () => {
  const testDir = join(process.cwd(), 'test-project');
  const customThemesDir = join(testDir, '.decantr', 'custom', 'themes');

  beforeEach(() => {
    mkdirSync(customThemesDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('resolves custom: prefixed theme from .decantr/custom/themes', async () => {
    const themeData = {
      id: 'mytheme',
      name: 'My Theme',
      seed: { primary: '#000', secondary: '#111', accent: '#222', background: '#fff' },
      modes: ['dark'],
      shapes: ['rounded'],
      decantr_compat: '>=1.0.0',
      source: 'custom'
    };
    writeFileSync(join(customThemesDir, 'mytheme.json'), JSON.stringify(themeData));

    const client = new RegistryClient({
      projectRoot: testDir,
      cacheDir: join(testDir, '.decantr', 'cache'),
      offline: true
    });

    const result = await client.fetchTheme('custom:mytheme');

    expect(result).not.toBeNull();
    expect(result?.data.id).toBe('mytheme');
    expect(result?.source.type).toBe('custom');
    expect(result?.source.path).toContain('mytheme.json');
  });

  it('returns null for missing custom theme', async () => {
    const client = new RegistryClient({
      projectRoot: testDir,
      cacheDir: join(testDir, '.decantr', 'cache'),
      offline: true
    });

    const result = await client.fetchTheme('custom:nonexistent');

    expect(result).toBeNull();
  });

  it('does not use custom: path for registry themes', async () => {
    const client = new RegistryClient({
      projectRoot: testDir,
      cacheDir: join(testDir, '.decantr', 'cache'),
      offline: true
    });

    // This should NOT look in custom directory
    const result = await client.fetchTheme('auradecantism');

    // Should fall through to bundled (offline mode)
    expect(result?.source.type).not.toBe('custom');
  });
});
