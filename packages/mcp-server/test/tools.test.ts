import { describe, it, expect } from 'vitest';
import { handleTool, TOOLS } from '../src/tools.js';
import { validateStringArg, fuzzyScore } from '../src/helpers.js';

describe('MCP tool handlers', () => {
  describe('tool definitions', () => {
    it('should define 14 tools', () => {
      expect(TOOLS).toHaveLength(14);
    });

    it('should have unique tool names', () => {
      const names = TOOLS.map(t => t.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it('should have correct annotations on read-only tools', () => {
      const readOnlyTools = TOOLS.filter(t => !['decantr_accept_drift', 'decantr_update_essence'].includes(t.name));
      for (const tool of readOnlyTools) {
        expect(tool.annotations.readOnlyHint).toBe(true);
        expect(tool.annotations.destructiveHint).toBe(false);
      }
    });

    it('should have write annotations on write tools', () => {
      const writeTools = TOOLS.filter(t => ['decantr_accept_drift', 'decantr_update_essence'].includes(t.name));
      for (const tool of writeTools) {
        expect(tool.annotations.readOnlyHint).toBe(false);
        expect(tool.annotations.destructiveHint).toBe(false);
        expect(tool.annotations.idempotentHint).toBe(false);
      }
    });

    it('should have openWorldHint: true on network tools', () => {
      const networkToolNames = [
        'decantr_search_registry', 'decantr_resolve_pattern', 'decantr_resolve_archetype',
        'decantr_resolve_blueprint', 'decantr_suggest_patterns',
        'decantr_create_essence',
      ];
      for (const name of networkToolNames) {
        const tool = TOOLS.find(t => t.name === name);
        expect(tool?.annotations.openWorldHint).toBe(true);
      }
    });

    it('should have openWorldHint: false on local-only tools', () => {
      const localToolNames = ['decantr_read_essence', 'decantr_validate', 'decantr_check_drift'];
      for (const name of localToolNames) {
        const tool = TOOLS.find(t => t.name === name);
        expect(tool?.annotations.openWorldHint).toBe(false);
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
