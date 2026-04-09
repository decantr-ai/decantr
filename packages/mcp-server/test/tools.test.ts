import { afterEach, describe, it, expect, vi } from 'vitest';
import { handleTool, TOOLS } from '../src/tools.js';
import { validateStringArg, fuzzyScore } from '../src/helpers.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MCP tool handlers', () => {
  describe('tool definitions', () => {
    it('should define 20 tools', () => {
      expect(TOOLS).toHaveLength(20);
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
        'decantr_get_showcase_benchmarks',
        'decantr_get_registry_intelligence_summary',
        'decantr_compile_execution_packs',
      ];
      for (const name of networkToolNames) {
        const tool = TOOLS.find(t => t.name === name);
        expect(tool?.annotations.openWorldHint).toBe(true);
      }
    });

    it('should have openWorldHint: false on local-only tools', () => {
      const localToolNames = [
        'decantr_read_essence',
        'decantr_validate',
        'decantr_check_drift',
        'decantr_audit_project',
        'decantr_get_scaffold_context',
        'decantr_get_page_context',
        'decantr_get_execution_pack',
      ];
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

    it('returns intelligence metadata when the registry search surface provides it', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({
          total: 1,
          results: [{
            type: 'blueprint',
            slug: 'portfolio',
            namespace: '@official',
            name: 'Portfolio',
            description: 'Creator portfolio',
            intelligence: {
              source: 'hybrid',
              verification_status: 'smoke-green',
              benchmark_confidence: 'high',
              golden_usage: 'shortlisted',
              quality_score: 92,
              confidence_score: 90,
              recommended: true,
              target_coverage: ['react-vite'],
              evidence: ['live-showcase', 'smoke-verified'],
            },
          }],
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await handleTool('decantr_search_registry', {
        query: 'portfolio',
        sort: 'name',
        recommended: true,
        source: 'hybrid',
      }) as {
        total: number;
        results: Array<{ intelligence?: { recommended?: boolean; quality_score?: number } | null }>;
      };

      expect(result.total).toBe(1);
      expect(result.results[0]?.intelligence?.recommended).toBe(true);
      expect(result.results[0]?.intelligence?.quality_score).toBe(92);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringMatching(/sort=name/),
        expect.anything(),
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringMatching(/recommended=true/),
        expect.anything(),
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringMatching(/intelligence_source=hybrid/),
        expect.anything(),
      );
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

  describe('decantr_get_registry_intelligence_summary', () => {
    it('returns hosted summary data and respects namespace filtering', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({
          $schema: 'https://decantr.ai/schemas/registry-intelligence-summary.v1.json',
          generated_at: '2026-04-09T00:00:00.000Z',
          namespace: '@official',
          totals: {
            total_public_items: 10,
            with_intelligence: 8,
            recommended: 4,
            authored: 3,
            benchmark: 2,
            hybrid: 3,
            missing_source: 0,
            smoke_green: 2,
            build_green: 5,
            high_confidence: 2,
          },
          by_type: {
            pattern: {
              total_public_items: 0,
              with_intelligence: 0,
              recommended: 0,
              authored: 0,
              benchmark: 0,
              hybrid: 0,
              missing_source: 0,
              smoke_green: 0,
              build_green: 0,
              high_confidence: 0,
            },
            theme: {
              total_public_items: 0,
              with_intelligence: 0,
              recommended: 0,
              authored: 0,
              benchmark: 0,
              hybrid: 0,
              missing_source: 0,
              smoke_green: 0,
              build_green: 0,
              high_confidence: 0,
            },
            blueprint: {
              total_public_items: 4,
              with_intelligence: 4,
              recommended: 2,
              authored: 1,
              benchmark: 1,
              hybrid: 2,
              missing_source: 0,
              smoke_green: 2,
              build_green: 4,
              high_confidence: 2,
            },
            archetype: {
              total_public_items: 3,
              with_intelligence: 2,
              recommended: 1,
              authored: 1,
              benchmark: 0,
              hybrid: 1,
              missing_source: 0,
              smoke_green: 0,
              build_green: 1,
              high_confidence: 0,
            },
            shell: {
              total_public_items: 3,
              with_intelligence: 2,
              recommended: 1,
              authored: 1,
              benchmark: 1,
              hybrid: 0,
              missing_source: 0,
              smoke_green: 0,
              build_green: 0,
              high_confidence: 0,
            },
          },
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await handleTool('decantr_get_registry_intelligence_summary', {
        namespace: '@official',
      }) as {
        namespace: string;
        totals: { recommended: number };
      };

      expect(result.namespace).toBe('@official');
      expect(result.totals.recommended).toBe(4);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\/v1\/intelligence\/summary\?namespace=%40official/),
        expect.anything(),
      );
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
