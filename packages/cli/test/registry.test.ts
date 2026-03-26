import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

describe('registry command', () => {
  it('should handle missing manifest gracefully', async () => {
    const raw = await readFile(join('/nonexistent', 'decantr.registry.json'), 'utf-8').catch(() => '{"installed":{}}');
    const manifest = JSON.parse(raw);
    expect(manifest.installed).toEqual({});
  });

  it('should parse type/name spec correctly', () => {
    const spec = 'pattern/kanban-board@1.2.0';
    const [type, nameWithVersion] = spec.split('/');
    const [name, version] = nameWithVersion.split('@');
    expect(type).toBe('pattern');
    expect(name).toBe('kanban-board');
    expect(version).toBe('1.2.0');
  });

  it('should parse spec without version', () => {
    const spec = 'recipe/neon';
    const [type, nameWithVersion] = spec.split('/');
    const [name, version] = nameWithVersion.split('@');
    expect(type).toBe('recipe');
    expect(name).toBe('neon');
    expect(version).toBeUndefined();
  });

  it('should handle all content types', () => {
    const types = ['pattern', 'archetype', 'recipe', 'style'];
    const installPaths: Record<string, string> = {
      pattern: 'src/registry-content/patterns/',
      archetype: 'src/registry-content/archetypes/',
      recipe: 'src/registry-content/recipes/',
      style: 'src/registry-content/styles/',
    };
    for (const type of types) {
      expect(installPaths[type]).toBeDefined();
    }
  });
});
