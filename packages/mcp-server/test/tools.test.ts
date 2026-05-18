import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fuzzyScore, resolveWorkspacePath, validateStringArg } from '../src/helpers.js';
import { handleTool, TOOLS } from '../src/tools.js';

const ORIGINAL_CWD = process.cwd();

afterEach(() => {
  process.chdir(ORIGINAL_CWD);
  vi.restoreAllMocks();
});

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

describe('MCP tool handlers', () => {
  describe('tool definitions', () => {
    it('should define the full MCP tool surface', () => {
      expect(TOOLS).toHaveLength(25);
    });

    it('should have unique tool names', () => {
      const names = TOOLS.map((t) => t.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it('should have correct annotations on read-only tools', () => {
      const readOnlyTools = TOOLS.filter(
        (t) => !['decantr_accept_drift', 'decantr_update_essence'].includes(t.name),
      );
      for (const tool of readOnlyTools) {
        expect(tool.annotations.readOnlyHint).toBe(true);
        expect(tool.annotations.destructiveHint).toBe(false);
      }
    });

    it('should have write annotations on write tools', () => {
      const writeTools = TOOLS.filter((t) =>
        ['decantr_accept_drift', 'decantr_update_essence'].includes(t.name),
      );
      for (const tool of writeTools) {
        expect(tool.annotations.readOnlyHint).toBe(false);
        expect(tool.annotations.destructiveHint).toBe(false);
        expect(tool.annotations.idempotentHint).toBe(false);
      }
    });

    it('should have openWorldHint: true on network tools', () => {
      const networkToolNames = [
        'decantr_search_registry',
        'decantr_resolve_pattern',
        'decantr_resolve_archetype',
        'decantr_resolve_blueprint',
        'decantr_suggest_patterns',
        'decantr_create_essence',
        'decantr_get_showcase_benchmarks',
        'decantr_get_registry_intelligence_summary',
        'decantr_compile_execution_packs',
        'decantr_audit_project',
        'decantr_critique',
      ];
      for (const name of networkToolNames) {
        const tool = TOOLS.find((t) => t.name === name);
        expect(tool?.annotations.openWorldHint).toBe(true);
      }
    });

    it('should have openWorldHint: false on local-only tools', () => {
      const localToolNames = [
        'decantr_read_essence',
        'decantr_validate',
        'decantr_check_drift',
        'decantr_get_scaffold_context',
        'decantr_get_page_context',
        'decantr_prepare_task_context',
        'decantr_get_execution_pack',
        'decantr_get_evidence_bundle',
        'decantr_workspace_health',
        'decantr_get_repair_prompt',
        'decantr_run_health_loop',
      ];
      for (const name of localToolNames) {
        const tool = TOOLS.find((t) => t.name === name);
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
      const result = (await handleTool('decantr_validate', {
        path: '/nonexistent/decantr.essence.json',
      })) as { valid: boolean; errors: string[] };
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('workspace containment', () => {
    it('rejects relative, absolute, and symlink escapes from the active workspace root', async () => {
      const workspaceDir = mkdtempSync(join(tmpdir(), 'decantr-mcp-workspace-'));
      const outsideDir = mkdtempSync(join(tmpdir(), 'decantr-mcp-outside-'));
      try {
        expect(() => resolveWorkspacePath('../outside', workspaceDir)).toThrow(
          /Path escapes the active workspace root/,
        );
        expect(() =>
          resolveWorkspacePath(join(outsideDir, 'decantr.essence.json'), workspaceDir),
        ).toThrow(/Path escapes the active workspace root/);

        symlinkSync(outsideDir, join(workspaceDir, 'outside-link'), 'dir');
        expect(() =>
          resolveWorkspacePath('outside-link/decantr.essence.json', workspaceDir),
        ).toThrow(/Path escapes the active workspace root/);

        process.chdir(workspaceDir);
        const result = (await handleTool('decantr_update_essence', {
          operation: 'add_feature',
          payload: { feature: 'unsafe' },
          path: join(outsideDir, 'decantr.essence.json'),
        })) as { error?: string };
        expect(result.error).toContain('Path escapes the active workspace root');
      } finally {
        rmSync(workspaceDir, { recursive: true, force: true });
        rmSync(outsideDir, { recursive: true, force: true });
      }
    });
  });

  describe('reliability tools', () => {
    it('requires route or page_id for task context', async () => {
      const result = await handleTool('decantr_prepare_task_context', {
        task: 'improve feed',
      });

      expect(result).toHaveProperty('error');
    });

    it('prepares compact task context with packs, evidence, health, and theme inventory', async () => {
      const projectDir = mkdtempSync(join(tmpdir(), 'decantr-mcp-context-'));
      try {
        process.chdir(projectDir);
        mkdirSync(join(projectDir, '.decantr', 'context'), { recursive: true });
        mkdirSync(join(projectDir, '.decantr', 'evidence'), { recursive: true });
        writeJson(join(projectDir, 'decantr.essence.json'), {
          version: '4.0.0',
          dna: {
            theme: { id: 'recipefork', mode: 'dark', shape: 'rounded' },
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
            motion: { preference: 'subtle', duration_scale: 1, reduce_motion: false },
            accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: false },
            personality: ['AI-powered social recipe platform'],
          },
          blueprint: {
            sections: [
              {
                id: 'app',
                role: 'primary',
                shell: 'top-nav-footer',
                features: ['recipes'],
                pages: [
                  {
                    id: 'feed',
                    route: '/feed',
                    description: 'Infinite social recipe feed',
                    layout: [
                      {
                        pattern: 'content-feed',
                        components: ['RecipeCard'],
                        interactions: ['infinite-scroll'],
                      },
                      'filter-bar',
                    ],
                  },
                ],
              },
            ],
            features: ['recipes'],
            routes: { '/feed': { section: 'app', page: 'feed' } },
          },
          meta: { target: 'react', guard: { mode: 'strict' } },
        });
        writeJson(join(projectDir, '.decantr', 'context', 'pack-manifest.json'), {
          version: '1.0.0',
          generatedAt: '2026-05-12T00:00:00.000Z',
          scaffold: null,
          sections: [
            {
              id: 'app',
              markdown: 'section-app-pack.md',
              json: 'section-app-pack.json',
              pageIds: ['feed'],
            },
          ],
          pages: [
            {
              id: 'feed',
              markdown: 'page-feed-pack.md',
              json: 'page-feed-pack.json',
              sectionId: 'app',
              sectionRole: 'primary',
            },
          ],
        });
        writeJson(join(projectDir, '.decantr', 'context', 'page-feed-pack.json'), {
          data: {
            visualTarget: '3-column food-forward feed with lift-hover cards',
            directives: ['Keep infinite scroll loading visible'],
            patterns: ['content-feed', 'filter-bar'],
            sharedComponents: ['RecipeCard'],
          },
        });
        writeJson(join(projectDir, '.decantr', 'context', 'section-app-pack.json'), {
          data: { visualTarget: 'Dark cookbook social app', patterns: ['content-feed'] },
        });
        writeFileSync(
          join(projectDir, '.decantr', 'context', 'page-feed-pack.md'),
          '# Feed Pack\nUse the recipe card grid.\n',
          'utf-8',
        );
        writeFileSync(
          join(projectDir, '.decantr', 'context', 'section-app.md'),
          '# App Section\nFood social surface.\n',
          'utf-8',
        );
        writeJson(join(projectDir, '.decantr', 'evidence', 'visual-manifest.json'), {
          version: 1,
          localOnly: true,
          routes: [
            {
              route: '/feed',
              screenshot: '.decantr/evidence/screenshots/feed.png',
              screenshotHash: 'abc123',
              status: 'captured',
            },
          ],
        });
        writeJson(join(projectDir, '.decantr', 'health-baseline-diff.json'), {
          baselinePath: '.decantr/health-baseline.json',
          savedAt: '2026-05-12T00:00:00.000Z',
          statusChanged: false,
          scoreDelta: 2,
          addedFindings: ['interaction-missing'],
          resolvedFindings: [],
          changedRoutes: ['/feed'],
          changedScreenshots: ['.decantr/evidence/screenshots/feed.png'],
          contractDrift: ['Declared route set changed since baseline.'],
        });
        writeJson(join(projectDir, '.decantr', 'theme-inventory.json'), {
          modes: [{ mode: 'dark', evidence: ['class=dark'] }],
          variants: [{ name: 'holiday', evidence: ['data-theme=holiday'] }],
        });
        writeJson(join(projectDir, '.decantr', 'project.json'), {
          initialized: {
            workflowMode: 'brownfield-attach',
            adoptionMode: 'contract-only',
          },
        });
        writeJson(join(projectDir, '.decantr', 'local-patterns.json'), {
          version: 2,
          status: 'accepted',
          patterns: [
            {
              id: 'button',
              role: 'Actions and command triggers',
              componentPaths: ['src/components/Button.tsx'],
            },
          ],
        });
        writeJson(join(projectDir, '.decantr', 'rules.json'), {
          version: 1,
          status: 'accepted',
          rules: [
            {
              id: 'no-inline-style',
              enabled: true,
              severity: 'warn',
              description: 'Reusable UI should not add static inline styles.',
            },
          ],
        });

        const result = (await handleTool('decantr_prepare_task_context', {
          route: '/feed',
          task: 'improve recipe feed loading',
        })) as {
          route: string;
          page_id: string;
          visual_target: string;
          directives: string[];
          patterns: string[];
          shared_components: string[];
          section_context: string;
          page_pack_excerpt: string;
          visual_evidence: { screenshot: string; screenshot_hash: string };
          health_evidence: {
            baseline_path: string;
            score_delta: number;
            added_findings: string[];
            changed_routes: string[];
          };
          theme_inventory: { modes: unknown[]; variants: unknown[]; path: string };
          local_law: {
            patterns_path: string;
            rules_path: string;
            patterns: Array<{ id: string; component_paths: string[] }>;
            rules: Array<{ id: string; severity: string }>;
          };
          authority: {
            lane: string;
            active_authorities: string[];
            source_authority: string;
            warnings: string[];
          };
          change_impact: { changed_file_count: number; impacted_routes: string[] };
          verify_command: string;
          local_files: { visual_manifest: string; local_patterns: string; local_rules: string };
        };

        expect(result.route).toBe('/feed');
        expect(result.page_id).toBe('feed');
        expect(result.visual_target).toContain('3-column');
        expect(result.directives).toContain('Keep infinite scroll loading visible');
        expect(result.patterns).toContain('content-feed');
        expect(result.shared_components).toContain('RecipeCard');
        expect(result.section_context).toContain('Food social surface');
        expect(result.page_pack_excerpt).toContain('Feed Pack');
        expect(result.visual_evidence.screenshot).toBe('.decantr/evidence/screenshots/feed.png');
        expect(result.visual_evidence.screenshot_hash).toBe('abc123');
        expect(result.health_evidence.baseline_path).toBe('.decantr/health-baseline.json');
        expect(result.health_evidence.score_delta).toBe(2);
        expect(result.health_evidence.added_findings).toContain('interaction-missing');
        expect(result.health_evidence.changed_routes).toContain('/feed');
        expect(result.theme_inventory.path).toBe('.decantr/theme-inventory.json');
        expect(result.theme_inventory.modes).toHaveLength(1);
        expect(result.theme_inventory.variants).toHaveLength(1);
        expect(result.local_law.patterns_path).toBe('.decantr/local-patterns.json');
        expect(result.local_law.rules_path).toBe('.decantr/rules.json');
        expect(result.local_law.patterns[0].component_paths).toContain('src/components/Button.tsx');
        expect(result.local_law.rules[0].id).toBe('no-inline-style');
        expect(result.authority.lane).toBe('Hybrid local law');
        expect(result.authority.active_authorities).toContain('accepted local patterns/rules');
        expect(result.authority.source_authority).toContain('accepted project-owned UI law');
        expect(result.change_impact.changed_file_count).toBeGreaterThanOrEqual(0);
        expect(result.verify_command).toBe('decantr verify --brownfield --local-patterns');
        expect(result.local_files.visual_manifest).toBe('.decantr/evidence/visual-manifest.json');
        expect(result.local_files.local_patterns).toBe('.decantr/local-patterns.json');
        expect(result.local_files.local_rules).toBe('.decantr/rules.json');
      } finally {
        rmSync(projectDir, { recursive: true, force: true });
      }
    });

    it('rejects project paths outside the active workspace root', async () => {
      const result = await handleTool('decantr_get_evidence_bundle', {
        project_path: '../outside-workspace',
      });

      expect(result).toHaveProperty('error');
      expect(String((result as { error: string }).error)).toContain('escapes the active workspace');
    });
  });

  describe('decantr_search_registry', () => {
    it('should require query parameter', async () => {
      const result = await handleTool('decantr_search_registry', {});
      expect(result).toHaveProperty('error');
    });

    it('returns intelligence metadata when the registry search surface provides it', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            total: 1,
            results: [
              {
                type: 'blueprint',
                slug: 'portfolio',
                namespace: '@official',
                name: 'Portfolio',
                description: 'Creator portfolio',
                intelligence: {
                  source: 'hybrid',
                  verification_status: 'smoke-green',
                  benchmark_confidence: 'high',
                  confidence_tier: 'verified',
                  golden_usage: 'shortlisted',
                  quality_score: 92,
                  confidence_score: 90,
                  recommended: true,
                  target_coverage: ['react-vite'],
                  evidence: ['live-showcase', 'smoke-verified'],
                },
              },
            ],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

      const result = (await handleTool('decantr_search_registry', {
        query: 'portfolio',
        sort: 'name',
        recommended: true,
        source: 'hybrid',
      })) as {
        total: number;
        results: Array<{ intelligence?: { recommended?: boolean; quality_score?: number } | null }>;
      };

      expect(result.total).toBe(1);
      expect(result.results[0]?.intelligence?.recommended).toBe(true);
      expect(result.results[0]?.intelligence?.quality_score).toBe(92);
      expect(fetchSpy).toHaveBeenCalledWith(expect.stringMatching(/sort=name/), expect.anything());
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
      const result = (await handleTool('decantr_resolve_pattern', {
        id: 'nonexistent-pattern-xyz',
      })) as { found: boolean };
      expect(result.found).toBe(false);
    });
  });

  describe('decantr_resolve_archetype', () => {
    it('should require id parameter', async () => {
      const result = await handleTool('decantr_resolve_archetype', {});
      expect(result).toHaveProperty('error');
    });

    it('should return not-found for unknown archetype', async () => {
      const result = (await handleTool('decantr_resolve_archetype', {
        id: 'nonexistent-archetype-xyz',
      })) as { found: boolean };
      expect(result.found).toBe(false);
    });
  });

  describe('decantr_get_registry_intelligence_summary', () => {
    it('returns hosted summary data and respects namespace filtering', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
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
              verified_confidence: 2,
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
                verified_confidence: 0,
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
                verified_confidence: 0,
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
                verified_confidence: 2,
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
                verified_confidence: 0,
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
                verified_confidence: 0,
              },
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

      const result = (await handleTool('decantr_get_registry_intelligence_summary', {
        namespace: '@official',
      })) as {
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
