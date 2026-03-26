import { describe, it, expect } from 'vitest';
import { handleTool, TOOLS } from '../src/tools.js';
import { validateStringArg, fuzzyScore } from '../src/helpers.js';

describe('MCP tool handlers', () => {
  describe('tool definitions', () => {
    it('should define 5 tools', () => {
      expect(TOOLS).toHaveLength(5);
    });

    it('should have unique tool names', () => {
      const names = TOOLS.map(t => t.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it('should have read-only annotations on all tools', () => {
      for (const tool of TOOLS) {
        expect(tool.annotations.readOnlyHint).toBe(true);
        expect(tool.annotations.destructiveHint).toBe(false);
      }
    });
  });

  describe('decantr_read_essence', () => {
    it('should return error for missing essence file', async () => {
      const result = await handleTool('decantr_read_essence', {
        path: '/nonexistent/decantr.essence.json',
      });
      expect(result).toHaveProperty('error');
    });
  });

  describe('decantr_validate', () => {
    it('should return error for missing file', async () => {
      const result = await handleTool('decantr_validate', {
        path: '/nonexistent/decantr.essence.json',
      }) as { valid: boolean; errors: string[] };
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('decantr_search_registry', () => {
    it('should require query parameter', async () => {
      const result = await handleTool('decantr_search_registry', {});
      expect(result).toHaveProperty('error');
    });
  });

  describe('decantr_resolve_pattern', () => {
    it('should require id parameter', async () => {
      const result = await handleTool('decantr_resolve_pattern', {});
      expect(result).toHaveProperty('error');
    });

    it('should return not-found for unknown pattern', async () => {
      const result = await handleTool('decantr_resolve_pattern', {
        id: 'nonexistent-pattern-xyz',
      }) as { found: boolean };
      expect(result.found).toBe(false);
    });
  });

  describe('decantr_resolve_archetype', () => {
    it('should require id parameter', async () => {
      const result = await handleTool('decantr_resolve_archetype', {});
      expect(result).toHaveProperty('error');
    });

    it('should return not-found for unknown archetype', async () => {
      const result = await handleTool('decantr_resolve_archetype', {
        id: 'nonexistent-archetype-xyz',
      }) as { found: boolean };
      expect(result.found).toBe(false);
    });
  });

  describe('unknown tool', () => {
    it('should return error for unknown tool name', async () => {
      const result = await handleTool('unknown_tool', {});
      expect(result).toHaveProperty('error');
    });
  });
});

describe('helpers', () => {
  describe('validateStringArg', () => {
    it('should return error for missing arg', () => {
      expect(validateStringArg({}, 'query')).toBeTruthy();
    });

    it('should return error for non-string arg', () => {
      expect(validateStringArg({ query: 123 }, 'query')).toBeTruthy();
    });

    it('should return null for valid string', () => {
      expect(validateStringArg({ query: 'test' }, 'query')).toBeNull();
    });

    it('should reject oversized input', () => {
      expect(validateStringArg({ query: 'x'.repeat(1001) }, 'query')).toBeTruthy();
    });
  });

  describe('fuzzyScore', () => {
    it('should score exact match highest', () => {
      expect(fuzzyScore('hero', 'hero')).toBe(100);
    });

    it('should score prefix match high', () => {
      expect(fuzzyScore('her', 'hero')).toBe(90);
    });

    it('should score substring match medium', () => {
      expect(fuzzyScore('ero', 'hero')).toBe(80);
    });

    it('should return 0 for no match', () => {
      expect(fuzzyScore('xyz', 'hero')).toBe(0);
    });
  });
});
