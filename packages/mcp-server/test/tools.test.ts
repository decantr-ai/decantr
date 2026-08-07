import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fuzzyScore, resolveWorkspacePath, validateStringArg } from '../src/helpers.js';
import { handleTool, TOOLS } from '../src/tools.js';
import { callTool } from './tool-call.js';

const ORIGINAL_CWD = process.cwd();

afterEach(() => {
  process.chdir(ORIGINAL_CWD);
  vi.restoreAllMocks();
});

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function hashFile(path: string): string {
  return `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJson(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .filter((key) => record[key] !== undefined)
      .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function hashJson(value: unknown): string {
  return `sha256:${createHash('sha256').update(stableJson(value)).digest('hex')}`;
}

function visualManifestSourceHash(manifest: {
  version?: number;
  localOnly?: boolean;
  baseUrl?: string | null;
  routes?: Array<{
    route?: string;
    url?: string;
    screenshot?: string | null;
    screenshotHash?: string | null;
    status?: string;
    error?: string;
  }>;
}): string {
  return hashJson({
    version: manifest.version,
    localOnly: manifest.localOnly,
    baseUrl: manifest.baseUrl ?? null,
    routes: (manifest.routes ?? []).map((route) => ({
      route: route.route,
      url: route.url,
      screenshot: route.screenshot,
      screenshotHash: route.screenshotHash ?? null,
      status: route.status,
      error: route.error,
    })),
  });
}

function evidenceBundleSourceHash(bundle: {
  health?: {
    status?: string;
    score?: number;
    errorCount?: number;
    warnCount?: number;
    infoCount?: number;
    findingCount?: number;
  };
  provenance?: Record<
    string,
    { path?: string; present?: boolean; hash?: string | null; generatedAt?: string | null }
  >;
  findings?: Array<{
    id?: string;
    code?: string;
    source?: string;
    category?: string;
    severity?: string;
    message?: string;
    target?: string;
    rule?: string;
    suggestedFix?: string;
    graph?: {
      node_id?: string;
      node_type?: string;
      route?: string;
      confidence?: string;
      reason?: string;
    };
    repair?: { id?: string };
    repairPlan?: {
      id?: string;
      actions?: unknown[];
      readTargets?: string[];
      commands?: string[];
    };
    evidence?: string[];
    commands?: string[];
  }>;
}): string {
  return hashJson({
    health: bundle.health
      ? {
          status: bundle.health.status,
          score: bundle.health.score,
          errorCount: bundle.health.errorCount,
          warnCount: bundle.health.warnCount,
          infoCount: bundle.health.infoCount,
          findingCount: bundle.health.findingCount,
        }
      : null,
    provenance: Object.entries(bundle.provenance ?? {})
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => ({
        key,
        path: entry.path,
        present: entry.present,
        hash: entry.hash ?? null,
      })),
    findings: (bundle.findings ?? []).map((finding) => ({
      id: finding.id,
      code: finding.code,
      source: finding.source,
      category: finding.category,
      severity: finding.severity,
      message: finding.message,
      target: finding.target,
      rule: finding.rule,
      suggestedFix: finding.suggestedFix,
      graph: finding.graph
        ? {
            node_id: finding.graph.node_id,
            node_type: finding.graph.node_type,
            route: finding.graph.route,
            confidence: finding.graph.confidence,
            reason: finding.graph.reason,
          }
        : undefined,
      repair: finding.repair?.id,
      repairPlan: finding.repairPlan
        ? {
            id: finding.repairPlan.id,
            actions: finding.repairPlan.actions,
            readTargets: finding.repairPlan.readTargets,
            commands: finding.repairPlan.commands,
          }
        : undefined,
      evidence: finding.evidence,
      commands: finding.commands,
    })),
  });
}

function analysisSourceHash(analysis: {
  project?: {
    framework?: string;
    frameworkVersion?: string | null;
    packageManager?: string;
    hasTypeScript?: boolean;
    hasTailwind?: boolean;
    projectScope?: string;
  };
  routes?: {
    strategy?: string;
    routes?: Array<{ path?: string; file?: string; hasLayout?: boolean }>;
  };
  styling?: {
    approach?: string;
    configFile?: string | null;
    darkMode?: boolean;
    cssVariables?: string[];
  };
  layout?: { shellPattern?: string };
  features?: { detected?: string[] };
}): string {
  return hashJson({
    project: {
      framework: analysis.project?.framework,
      frameworkVersion: analysis.project?.frameworkVersion,
      packageManager: analysis.project?.packageManager,
      hasTypeScript: analysis.project?.hasTypeScript,
      hasTailwind: analysis.project?.hasTailwind,
      projectScope: analysis.project?.projectScope,
    },
    routes: {
      strategy: analysis.routes?.strategy,
      routes: (analysis.routes?.routes ?? []).map((route) => ({
        path: route.path,
        file: route.file,
        hasLayout: route.hasLayout,
      })),
    },
    styling: {
      approach: analysis.styling?.approach,
      configFile: analysis.styling?.configFile,
      darkMode: analysis.styling?.darkMode,
      cssVariables: analysis.styling?.cssVariables,
    },
    layout: { shellPattern: analysis.layout?.shellPattern },
    features: { detected: analysis.features?.detected },
  });
}

function healthBaselineDiffSourceHash(diff: {
  savedAt?: string | null;
  statusChanged?: boolean;
  scoreDelta?: number | null;
  addedFindings?: string[];
  resolvedFindings?: string[];
  changedFiles?: string[];
  changedRoutes?: string[];
  changedScreenshots?: string[];
  contractDrift?: string[];
}): string {
  return hashJson({
    savedAt: diff.savedAt ?? null,
    statusChanged: diff.statusChanged ?? false,
    scoreDelta: diff.scoreDelta ?? null,
    addedFindings: diff.addedFindings ?? [],
    resolvedFindings: diff.resolvedFindings ?? [],
    changedFiles: diff.changedFiles ?? [],
    changedRoutes: diff.changedRoutes ?? [],
    changedScreenshots: diff.changedScreenshots ?? [],
    contractDrift: diff.contractDrift ?? [],
  });
}

describe('MCP tool handlers', () => {
  describe('tool definitions', () => {
    it('should advertise the hard 8-tool MCP surface', () => {
      expect(TOOLS.map((tool) => tool.name)).toEqual([
        'decantr_project',
        'decantr_contract',
        'decantr_context',
        'decantr_graph',
        'decantr_registry',
        'decantr_verify',
        'decantr_repair',
        'decantr_contract_write',
      ]);
    });

    it('should describe the discovery-backed UI change-control loop', () => {
      const toolsByName = Object.fromEntries(TOOLS.map((tool) => [tool.name, tool]));

      expect(toolsByName.decantr_project.description).toContain('Observe local project authority');
      expect(toolsByName.decantr_context.title).toBe('Decantr Task Context');
      expect(toolsByName.decantr_context.description).toContain(
        'discovery-backed UI surface task context',
      );
      expect(toolsByName.decantr_context.description).toContain('authoritative route capsules');
      expect(toolsByName.decantr_verify.description).toContain('Verify local UI diffs');
      expect(toolsByName.decantr_verify.description).toContain('evidence bundles');
      expect(toolsByName.decantr_registry.title).toBe('Decantr Content Corpus (Compatibility)');
      expect(toolsByName.decantr_registry.description).toContain('not a public registry');
    });

    it('should have unique tool names', () => {
      const names = TOOLS.map((t) => t.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it('should advertise key replacement actions', () => {
      const actionsByTool = Object.fromEntries(
        TOOLS.map((tool) => [tool.name, tool.inputSchema.properties.action.enum]),
      ) as Record<string, string[]>;

      expect(actionsByTool.decantr_contract).toEqual(
        expect.arrayContaining(['read_essence', 'validate', 'check_drift', 'capsule']),
      );
      expect(actionsByTool.decantr_context).toEqual(
        expect.arrayContaining(['scaffold', 'section', 'page', 'task', 'execution_pack']),
      );
      expect(actionsByTool.decantr_graph).toEqual(
        expect.arrayContaining(['snapshot', 'query', 'traverse']),
      );
      expect(actionsByTool.decantr_registry).toEqual(
        expect.arrayContaining(['search', 'resolve_pattern', 'compile_execution_packs']),
      );
      expect(actionsByTool.decantr_verify).toEqual(
        expect.arrayContaining(['changes', 'audit_project', 'critique', 'evidence_bundle']),
      );
      expect(actionsByTool.decantr_repair).toEqual(
        expect.arrayContaining(['findings', 'repair_plan', 'repair_prompt']),
      );
      expect(actionsByTool.decantr_contract_write).toEqual(['accept_drift', 'update_essence']);
    });

    it('should not advertise legacy tool names', () => {
      const names = TOOLS.map((tool) => tool.name);
      expect(names).not.toContain('decantr_read_essence');
      expect(names).not.toContain('decantr_update_essence');
      expect(names).not.toContain('decantr_accept_drift');
    });

    it('should have correct annotations on read-only tools', () => {
      const readOnlyTools = TOOLS.filter((t) => t.name !== 'decantr_contract_write');
      for (const tool of readOnlyTools) {
        expect(tool.annotations.readOnlyHint).toBe(true);
        expect(tool.annotations.destructiveHint).toBe(false);
      }
    });

    it('should keep writes isolated to decantr_contract_write', () => {
      const writeTool = TOOLS.find((t) => t.name === 'decantr_contract_write');
      expect(writeTool?.annotations.readOnlyHint).toBe(false);
      expect(writeTool?.annotations.destructiveHint).toBe(false);
      expect(writeTool?.annotations.idempotentHint).toBe(false);
    });

    it('should have openWorldHint: true on network tools', () => {
      const networkToolNames = [
        'decantr_contract',
        'decantr_context',
        'decantr_registry',
        'decantr_verify',
      ];
      for (const name of networkToolNames) {
        const tool = TOOLS.find((t) => t.name === name);
        expect(tool?.annotations.openWorldHint).toBe(true);
      }
    });

    it('should have openWorldHint: false on local-only tools', () => {
      const localToolNames = [
        'decantr_project',
        'decantr_graph',
        'decantr_repair',
        'decantr_contract_write',
      ];
      for (const name of localToolNames) {
        const tool = TOOLS.find((t) => t.name === name);
        expect(tool?.annotations.openWorldHint).toBe(false);
      }
    });

    it('should reject direct legacy tool calls', async () => {
      const result = await handleTool('decantr_read_essence', {});
      expect(result).toEqual({ error: 'Unknown tool: decantr_read_essence' });
    });
  });

  describe('decantr_read_essence', () => {
    it('should return error for missing essence file', async () => {
      const result = await callTool('decantr_read_essence', {
        path: '/nonexistent/decantr.essence.json',
      });
      expect(result).toHaveProperty('error');
    });
  });

  describe('decantr_validate', () => {
    it('should return error for missing file', async () => {
      const result = (await callTool('decantr_validate', {
        path: '/nonexistent/decantr.essence.json',
      })) as { valid: boolean; errors: string[] };
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('typed graph tools', () => {
    it('reads the contract capsule and route-scoped graph subgraph', async () => {
      const projectDir = mkdtempSync(join(tmpdir(), 'decantr-mcp-graph-'));
      try {
        process.chdir(projectDir);
        mkdirSync(join(projectDir, '.decantr', 'graph'), { recursive: true });
        writeJson(join(projectDir, '.decantr', 'graph', 'contract-capsule.json'), {
          schema_version: '3.0.0-draft',
          snapshot_id: 'graph:test',
          project_id: 'proj:default',
          created_at: '2026-05-21T00:00:00.000Z',
          source_hash: 'sha256:test',
          contract_hash: 'fnv1a32:test',
          cache_key: 'decantr-contract:sha256:test',
          contract_cache_key: 'decantr-contract:fnv1a32:test',
          summary: {
            routes: 1,
            components: 1,
            tokens: 0,
            local_rules: 1,
            style_bridge: 1,
            source_artifacts: 1,
            open_findings: 0,
          },
          source_artifact_limit: 200,
          source_artifacts_truncated: false,
          routes: [{ id: 'rt:/feed', path: '/feed', page_id: 'pg:app:feed' }],
          components: [{ id: 'cmp:recipecard', label: 'RecipeCard' }],
          tokens: [],
          local_rules: [{ id: 'rule:no-raw-button' }],
          style_bridge: [{ id: 'bridge:surface' }],
          source_artifacts: [
            {
              id: 'src:src/app/feed/page.tsx',
              path: 'src/app/feed/page.tsx',
              kind: 'route-source',
            },
          ],
          open_findings: [],
        });
        writeJson(join(projectDir, '.decantr', 'graph', 'graph.snapshot.json'), {
          id: 'graph:test',
          schema_version: '3.0.0-draft',
          project_id: 'proj:default',
          created_at: '2026-05-21T00:00:00.000Z',
          source_hash: 'sha256:test',
          nodes: [
            { id: 'rt:/feed', type: 'Route', payload: { path: '/feed' } },
            { id: 'pg:app:feed', type: 'Page', payload: { id: 'feed' } },
            { id: 'sh:app', type: 'Shell', payload: { id: 'app' } },
            { id: 'pat:content-feed', type: 'Pattern', payload: { id: 'content-feed' } },
            { id: 'cmp:recipecard', type: 'Component', payload: { name: 'RecipeCard' } },
            { id: 'rule:no-raw-button', type: 'LocalRule', payload: { id: 'no-raw-button' } },
            { id: 'bridge:surface', type: 'StyleBridge', payload: { id: 'surface' } },
            {
              id: 'src:src/app/feed/page.tsx',
              type: 'SourceArtifact',
              payload: {
                id: 'src:src/app/feed/page.tsx',
                kind: 'route-source',
                path: 'src/app/feed/page.tsx',
              },
            },
            {
              id: 'find:check-no-raw-button',
              type: 'Finding',
              payload: {
                code: 'RULE001',
                severity: 'warn',
                message: 'Raw button usage violates local law.',
              },
            },
          ],
          edges: [
            { src: 'pg:app:feed', dst: 'rt:/feed', relation: 'PAGE_ROUTED_AT_ROUTE' },
            { src: 'pg:app:feed', dst: 'sh:app', relation: 'PAGE_USES_SHELL' },
            { src: 'pg:app:feed', dst: 'pat:content-feed', relation: 'PAGE_COMPOSES_PATTERN' },
            { src: 'pat:content-feed', dst: 'cmp:recipecard', relation: 'PATTERN_NEEDS_COMPONENT' },
            { src: 'rule:no-raw-button', dst: 'proj:default', relation: 'LOCAL_RULE_APPLIES_TO' },
            { src: 'bridge:surface', dst: 'proj:default', relation: 'STYLE_BRIDGE_MAPS_TO' },
            {
              src: 'rt:/feed',
              dst: 'src:src/app/feed/page.tsx',
              relation: 'NODE_DERIVED_FROM_SOURCE',
            },
            {
              src: 'pg:app:feed',
              dst: 'src:src/app/feed/page.tsx',
              relation: 'NODE_DERIVED_FROM_SOURCE',
            },
            {
              src: 'find:check-no-raw-button',
              dst: 'rule:no-raw-button',
              relation: 'FINDING_ANCHORED_AT',
            },
          ],
          summary: { nodes: 9, edges: 9, findings: 1, evidence: 0 },
        });

        writeJson(join(projectDir, 'package.json'), {
          dependencies: {
            next: '^16.0.0',
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            tailwindcss: '^4.0.0',
          },
          devDependencies: { typescript: '^6.0.0' },
          packageManager: 'pnpm@10.33.0',
        });
        writeJson(join(projectDir, '.decantr', 'project.json'), {
          initialized: {
            workflowMode: 'brownfield-attach',
            adoptionMode: 'contract-only',
          },
        });
        writeJson(join(projectDir, 'decantr.essence.json'), {
          version: '4.0.0',
          dna: {
            theme: { id: 'existing', mode: 'light' },
            spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '4' },
            typography: { scale: 'system', heading_weight: 600, body_weight: 400 },
            color: { palette: 'existing', accent_count: 1, cvd_preference: 'auto' },
            radius: { philosophy: 'rounded', base: 8 },
            elevation: { system: 'existing', max_levels: 3 },
            motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
            accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
            personality: ['focused'],
          },
          blueprint: {
            features: ['feed'],
            sections: [
              {
                id: 'app',
                role: 'primary',
                shell: 'app',
                features: ['feed'],
                description: 'App',
                pages: [{ id: 'feed', route: '/feed', layout: ['content-feed'] }],
              },
            ],
            routes: { '/feed': { section: 'app', page: 'feed' } },
          },
          meta: {
            archetype: 'observed-brownfield',
            target: 'react',
            platform: { type: 'spa', routing: 'history' },
            guard: { mode: 'guided', dna_enforcement: 'warn', blueprint_enforcement: 'warn' },
          },
        });
        mkdirSync(join(projectDir, 'src', 'app', 'feed'), { recursive: true });
        writeFileSync(
          join(projectDir, 'src', 'app', 'feed', 'page.tsx'),
          'export default function FeedPage() { return <main />; }\n',
          'utf-8',
        );
        const analysis = {
          version: 1,
          analyzedAt: '2026-05-21T14:00:00.000Z',
          project: {
            framework: 'next',
            packageManager: 'pnpm',
            hasTypeScript: true,
            hasTailwind: true,
            projectScope: 'single-app',
          },
          routes: {
            strategy: 'app-router',
            routes: [{ path: '/feed', file: 'src/app/feed/page.tsx', hasLayout: false }],
          },
          styling: { approach: 'tailwind', cssVariables: [] },
          layout: { shellPattern: 'app-router' },
          features: { detected: ['feed'] },
        };
        writeJson(join(projectDir, '.decantr', 'analysis.json'), {
          ...analysis,
          analyzedAt: '2026-05-21T14:01:00.000Z',
        });
        mkdirSync(join(projectDir, '.decantr', 'evidence'), { recursive: true });
        const visualManifest = {
          version: 1,
          generatedAt: '2026-05-21T14:00:00.000Z',
          localOnly: true,
          baseUrl: 'http://127.0.0.1:3000',
          routes: [
            {
              route: '/feed',
              url: 'http://127.0.0.1:3000/feed',
              screenshot: null,
              screenshotHash: null,
              status: 'captured',
            },
          ],
        };
        writeJson(join(projectDir, '.decantr', 'evidence', 'visual-manifest.json'), {
          ...visualManifest,
          generatedAt: '2026-05-21T14:01:00.000Z',
        });
        const evidenceBundle = {
          generatedAt: '2026-05-21T14:00:00.000Z',
          health: {
            status: 'warning',
            score: 95,
            errorCount: 0,
            warnCount: 1,
            infoCount: 0,
            findingCount: 1,
          },
          provenance: {
            graphSnapshot: {
              path: '.decantr/graph/graph.snapshot.json',
              present: true,
              hash: 'sha256:snapshot',
              generatedAt: '2026-05-21T14:00:00.000Z',
            },
            contractCapsule: {
              path: '.decantr/graph/contract-capsule.json',
              present: true,
              hash: 'sha256:capsule',
              generatedAt: '2026-05-21T14:00:00.000Z',
            },
          },
          findings: [
            {
              id: 'check-no-raw-button',
              code: 'RULE001',
              source: 'check',
              category: 'Local law',
              severity: 'warn',
              message: 'Raw button usage violates local law.',
              evidence: ['src/App.tsx:12 uses <button>'],
              rule: 'no-raw-button',
              suggestedFix: 'Import Button.',
              graph: {
                snapshot_id: 'graph:test',
                source_hash: 'sha256:test',
                node_id: 'rule:no-raw-button',
                node_type: 'LocalRule',
                confidence: 'exact',
                reason: 'rule id matched a LocalRule node',
              },
              repair: {
                id: 'replace-raw-control-with-local-component',
              },
              repairPlan: {
                id: 'repair-plan:check-no-raw-button',
                actions: [{ id: 'replace-raw-control-with-local-component' }],
                readTargets: ['src/app/feed/page.tsx'],
                commands: ['decantr health'],
              },
              commands: ['decantr health'],
            },
          ],
        };
        writeJson(join(projectDir, '.decantr', 'evidence', 'latest.json'), {
          ...evidenceBundle,
          generatedAt: '2026-05-21T14:01:00.000Z',
          provenance: {
            graphSnapshot: {
              ...evidenceBundle.provenance.graphSnapshot,
              generatedAt: '2026-05-21T14:01:00.000Z',
            },
            contractCapsule: {
              ...evidenceBundle.provenance.contractCapsule,
              generatedAt: '2026-05-21T14:01:00.000Z',
            },
          },
        });
        const healthBaselineDiff = {
          savedAt: '2026-05-21T14:00:00.000Z',
          statusChanged: false,
          scoreDelta: -1,
          addedFindings: ['check-no-raw-button'],
          resolvedFindings: [],
          changedFiles: ['src/app/feed/page.tsx'],
          changedRoutes: ['/feed'],
          changedScreenshots: [],
          contractDrift: [],
        };
        writeJson(join(projectDir, '.decantr', 'health-baseline-diff.json'), {
          ...healthBaselineDiff,
          baselinePath: '.decantr/health-baseline.json',
        });
        writeJson(join(projectDir, '.decantr', 'graph', 'graph.manifest.json'), {
          schema_version: '3.0.0-draft',
          snapshot_id: 'graph:test',
          project_id: 'proj:default',
          generated_at: '2026-05-21T00:00:00.000Z',
          sources: [
            {
              id: 'src:decantr.essence.json',
              kind: 'essence',
              path: 'decantr.essence.json',
              hash: hashFile(join(projectDir, 'decantr.essence.json')),
            },
            {
              id: 'src:.decantr/analysis.json',
              kind: 'brownfield-analysis',
              path: '.decantr/analysis.json',
              hash: analysisSourceHash(analysis),
            },
            {
              id: 'src:src/app/feed/page.tsx',
              kind: 'route-source',
              path: 'src/app/feed/page.tsx',
              hash: hashFile(join(projectDir, 'src', 'app', 'feed', 'page.tsx')),
            },
            {
              id: 'src:.decantr/evidence/visual-manifest.json',
              kind: 'visual-manifest',
              path: '.decantr/evidence/visual-manifest.json',
              hash: visualManifestSourceHash(visualManifest),
            },
            {
              id: 'src:.decantr/evidence/latest.json',
              kind: 'evidence-bundle',
              path: '.decantr/evidence/latest.json',
              hash: evidenceBundleSourceHash(evidenceBundle),
            },
            {
              id: 'src:.decantr/health-baseline-diff.json',
              kind: 'health-baseline-diff',
              path: '.decantr/health-baseline-diff.json',
              hash: healthBaselineDiffSourceHash(healthBaselineDiff),
            },
          ],
          outputs: {
            snapshot: '.decantr/graph/graph.snapshot.json',
            history: '.decantr/graph/snapshots',
            diff: '.decantr/graph/graph.diff.json',
          },
          warnings: [],
        });
        mkdirSync(join(projectDir, '.decantr', 'graph', 'snapshots'), { recursive: true });
        writeJson(join(projectDir, '.decantr', 'graph', 'snapshots', 'graph-test.json'), {
          $schema: 'https://decantr.ai/schemas/graph-snapshot.v1.json',
          id: 'graph:test',
          schema_version: '3.0.0-draft',
          project_id: 'proj:default',
          created_at: '2026-05-21T00:00:00.000Z',
          source_hash: 'sha256:test',
          nodes: [],
          edges: [],
          summary: { nodes: 0, edges: 0, findings: 0, evidence: 0 },
        });
        writeJson(join(projectDir, '.decantr', 'graph', 'snapshots', 'graph-older.json'), {
          $schema: 'https://decantr.ai/schemas/graph-snapshot.v1.json',
          id: 'graph:older',
          schema_version: '3.0.0-draft',
          project_id: 'proj:default',
          created_at: '2026-05-20T00:00:00.000Z',
          source_hash: 'sha256:older',
          nodes: [],
          edges: [],
          summary: { nodes: 0, edges: 0, findings: 0, evidence: 0 },
        });
        writeJson(join(projectDir, '.decantr', 'graph', 'graph.diff.json'), {
          id: 'diff:empty:graph:test',
          to: 'graph:test',
          ops: [
            {
              op: 'finding.added',
              id: 'find:check-no-raw-button',
              type: 'Finding',
            },
            {
              op: 'evidence.added',
              id: 'ev:visual:feed',
              type: 'Evidence',
            },
          ],
        });

        const state = (await callTool('decantr_get_project_state', {})) as {
          adoption_truth?: {
            $schema?: string;
            facts?: Array<{ id: string }>;
            project?: { selectedAppRoot?: string };
          };
          project_config?: {
            workflow_mode?: string | null;
            adoption_mode?: string | null;
          };
          essence?: { routes?: string[]; active_v4?: boolean };
          discovery?: {
            project?: { framework?: string; package_manager?: string; primary_language?: string };
            routes?: { taskable_route_count?: number; route_signal_count?: number };
          };
          graph?: {
            ready?: boolean;
            current?: boolean | null;
            stale_sources?: Array<{ path: string }>;
            available_routes?: string[];
            contract_hash?: string | null;
            contract_cache_key?: string | null;
            snapshot_history_present?: boolean;
            snapshot_history_count?: number;
            diff_summary?: {
              total: number;
              findings: { added: number; resolved: number };
              evidence: { added: number };
            } | null;
            source_artifact_count?: number;
            capsule_source_artifact_count?: number | null;
            capsule_source_artifact_limit?: number | null;
            capsule_source_artifacts_truncated?: boolean | null;
            available_source_artifacts?: Array<{ id: string; path: string; kind: string | null }>;
          };
          diagnostics?: {
            known_count?: number;
            families?: string[];
            codes?: Array<{ code: string; rule: string; repair_id: string; family: string }>;
          };
          recommended_next_tools?: string[];
          recommended_next_actions?: Array<{ tool: string; action: string }>;
        };
        expect(state.essence?.active_v4).toBe(true);
        expect(state.adoption_truth?.$schema).toBe(
          'https://decantr.ai/schemas/adoption-truth.v1.json',
        );
        expect(state.adoption_truth?.facts?.map((fact) => fact.id)).toContain(
          'adoption.host-source-integrity',
        );
        expect(state.essence?.routes).toEqual(['/feed']);
        expect(state.project_config).toMatchObject({
          workflow_mode: 'brownfield-attach',
          adoption_mode: 'contract-only',
        });
        expect(state.discovery?.project?.framework).toBe('nextjs');
        expect(state.discovery?.project?.package_manager).toBe('pnpm');
        expect(state.discovery?.project?.primary_language).toBe('typescript');
        expect(state.discovery?.routes?.taskable_route_count).toBeGreaterThanOrEqual(1);
        expect(state.discovery?.routes?.route_signal_count).toBeGreaterThanOrEqual(1);
        expect(state.graph?.ready).toBe(true);
        expect(state.graph?.current).toBe(true);
        expect(state.graph?.available_routes).toEqual(['/feed']);
        expect(state.graph?.contract_hash).toBe('fnv1a32:test');
        expect(state.graph?.contract_cache_key).toBe('decantr-contract:fnv1a32:test');
        expect(state.graph?.snapshot_history_present).toBe(true);
        expect(state.graph?.snapshot_history_count).toBe(2);
        expect(state.graph?.diff_summary).toMatchObject({
          total: 2,
          findings: { added: 1, resolved: 0 },
          evidence: { added: 1 },
        });
        expect(state.graph?.source_artifact_count).toBe(1);
        expect(state.graph?.capsule_source_artifact_count).toBe(1);
        expect(state.graph?.capsule_source_artifact_limit).toBe(200);
        expect(state.graph?.capsule_source_artifacts_truncated).toBe(false);
        expect(state.graph?.available_source_artifacts).toEqual([
          {
            id: 'src:src/app/feed/page.tsx',
            path: 'src/app/feed/page.tsx',
            kind: 'route-source',
          },
        ]);
        expect(state.diagnostics?.families).toContain('TOKEN');
        expect(state.diagnostics?.codes).toEqual(
          expect.arrayContaining([
            {
              code: 'TOKEN010',
              rule: 'style-bridge-arbitrary-value',
              repair_id: 'replace-arbitrary-style-with-bridge-token',
              family: 'TOKEN',
            },
          ]),
        );
        expect(state.recommended_next_tools).toContain('decantr_contract');
        expect(state.recommended_next_actions).toContainEqual({
          tool: 'decantr_contract',
          action: 'capsule',
        });

        const capsule = (await callTool('decantr_get_contract_capsule', {})) as {
          capsule?: {
            cache_key?: string;
            source_artifact_limit?: number;
            source_artifacts_truncated?: boolean;
            summary?: { source_artifacts?: number };
            source_artifacts?: Array<{ id: string; path: string; kind?: string }>;
          };
        };
        expect(capsule.capsule?.cache_key).toBe('decantr-contract:sha256:test');
        expect(capsule.capsule?.source_artifact_limit).toBe(200);
        expect(capsule.capsule?.source_artifacts_truncated).toBe(false);
        expect(capsule.capsule?.summary?.source_artifacts).toBe(1);
        expect(capsule.capsule?.source_artifacts).toEqual([
          {
            id: 'src:src/app/feed/page.tsx',
            path: 'src/app/feed/page.tsx',
            kind: 'route-source',
          },
        ]);

        const metadata = (await callTool('decantr_get_graph_snapshot', {
          include_history: true,
        })) as {
          available_routes?: string[];
          snapshot_history_present?: boolean;
          snapshot_history_count?: number;
          history?: Array<{ id: string; source_hash: string }>;
          diff_summary?: {
            total: number;
            findings: { added: number; resolved: number };
            evidence: { added: number };
          } | null;
        };
        expect(metadata.available_routes).toEqual(['/feed']);
        expect(metadata.snapshot_history_present).toBe(true);
        expect(metadata.snapshot_history_count).toBe(2);
        expect(metadata.history?.map((entry) => entry.id)).toEqual(['graph:test', 'graph:older']);
        expect(metadata.history?.[0]).toMatchObject({ source_hash: 'sha256:test' });
        expect(metadata.diff_summary).toMatchObject({
          total: 2,
          findings: { added: 1, resolved: 0 },
          evidence: { added: 1 },
        });

        const olderSnapshot = (await callTool('decantr_get_graph_snapshot', {
          snapshot_id: 'graph:older',
          include_full: true,
        })) as {
          current_snapshot_id?: string;
          snapshot?: { id: string };
        };
        expect(olderSnapshot.current_snapshot_id).toBe('graph:test');
        expect(olderSnapshot.snapshot?.id).toBe('graph:older');

        const comparedSnapshot = (await callTool('decantr_get_graph_snapshot', {
          compare_to: 'graph:older',
          include_diff_ops: true,
          limit: 3,
        })) as {
          current_snapshot_id?: string;
          snapshot_id?: string;
          comparison?: {
            from: string;
            to: string;
            summary: {
              total: number;
              nodes: { added: number };
              edges: { added: number };
              findings: { added: number };
            };
            ops?: unknown[];
            ops_truncated?: boolean;
            limit?: number;
          };
        };
        expect(comparedSnapshot.current_snapshot_id).toBe('graph:test');
        expect(comparedSnapshot.snapshot_id).toBe('graph:test');
        expect(comparedSnapshot.comparison).toMatchObject({
          from: 'graph:older',
          to: 'graph:test',
          summary: {
            findings: { added: 1 },
          },
        });
        expect(comparedSnapshot.comparison?.summary.nodes.added).toBeGreaterThanOrEqual(8);
        expect(comparedSnapshot.comparison?.summary.edges.added).toBeGreaterThanOrEqual(9);
        expect(comparedSnapshot.comparison?.summary.total).toBeGreaterThan(0);
        expect(comparedSnapshot.comparison?.ops).toHaveLength(3);
        expect(comparedSnapshot.comparison?.ops_truncated).toBe(true);
        expect(comparedSnapshot.comparison?.limit).toBe(3);

        const routeGraph = (await callTool('decantr_get_graph_snapshot', {
          route: '/feed',
        })) as {
          nodes?: Array<{ id: string }>;
          ranked?: Array<{ id: string; type: string; score: number; reason: string }>;
          summary?: { nodes: number };
        };
        expect(routeGraph.nodes?.map((node) => node.id)).toEqual(
          expect.arrayContaining([
            'rt:/feed',
            'pg:app:feed',
            'pat:content-feed',
            'cmp:recipecard',
            'rule:no-raw-button',
            'bridge:surface',
          ]),
        );
        expect(routeGraph.summary?.nodes).toBeGreaterThanOrEqual(6);
        expect(routeGraph.ranked?.[0]).toEqual({
          id: 'rt:/feed',
          type: 'Route',
          score: 1,
          reason: 'requested_route+pagerank',
        });

        const taskRankedRouteGraph = (await callTool('decantr_get_graph_snapshot', {
          route: '/feed',
          task: 'Repair raw button local law drift.',
        })) as {
          ranking?: { method?: string; task_keywords?: string[] };
          ranked?: Array<{ id: string; reason: string; matched_terms?: string[] }>;
        };
        expect(taskRankedRouteGraph.ranking).toMatchObject({
          method: 'hybrid_weighted_pagerank_with_task_boost',
          task_keywords: ['repair', 'raw', 'button', 'local', 'law', 'drift'],
        });
        expect(
          taskRankedRouteGraph.ranked?.find((node) => node.id === 'find:check-no-raw-button'),
        ).toMatchObject({
          reason: 'open_finding+pagerank+task_match',
          matched_terms: ['raw', 'button', 'local', 'law'],
        });

        const nodeImpactGraph = (await callTool('decantr_get_graph_snapshot', {
          node_id: 'cmp:recipecard',
          task: 'change recipe card surface',
        })) as {
          node_id?: string;
          ranking?: { method?: string; seed?: string[]; task_keywords?: string[] };
          ids?: { routes?: string[]; pages?: string[]; patterns?: string[]; components?: string[] };
          ranked?: Array<{ id: string; reason: string; matched_terms?: string[] }>;
        };
        expect(nodeImpactGraph.node_id).toBe('cmp:recipecard');
        expect(nodeImpactGraph.ranking).toMatchObject({
          method: 'hybrid_impact_pagerank_with_task_boost',
          seed: ['cmp:recipecard'],
          task_keywords: ['change', 'recipe', 'card', 'surface'],
        });
        expect(nodeImpactGraph.ids?.routes).toEqual(['rt:/feed']);
        expect(nodeImpactGraph.ids?.pages).toEqual(['pg:app:feed']);
        expect(nodeImpactGraph.ids?.patterns).toEqual(['pat:content-feed']);
        expect(nodeImpactGraph.ids?.components).toEqual(['cmp:recipecard']);
        expect(nodeImpactGraph.ranked?.[0]).toMatchObject({
          id: 'cmp:recipecard',
          reason: 'seed_node+pagerank+task_match',
          matched_terms: ['recipe', 'card'],
        });

        const fileImpactGraph = (await callTool('decantr_get_graph_snapshot', {
          file_path: 'src/app/feed/page.tsx',
          task: 'edit feed source',
        })) as {
          file_path?: string;
          resolved_node_ids?: string[];
          ranking?: { method?: string; seed?: string[]; task_keywords?: string[] };
          ids?: { routes?: string[]; pages?: string[]; sourceArtifacts?: string[] };
          ranked?: Array<{ id: string; reason: string; matched_terms?: string[] }>;
        };
        expect(fileImpactGraph.file_path).toBe('src/app/feed/page.tsx');
        expect(fileImpactGraph.resolved_node_ids).toEqual(['src:src/app/feed/page.tsx']);
        expect(fileImpactGraph.ranking).toMatchObject({
          method: 'hybrid_impact_pagerank_with_task_boost',
          seed: ['src:src/app/feed/page.tsx'],
          task_keywords: ['edit', 'feed', 'source'],
        });
        expect(fileImpactGraph.ids?.routes).toEqual(['rt:/feed']);
        expect(fileImpactGraph.ids?.pages).toEqual(['pg:app:feed']);
        expect(fileImpactGraph.ids?.sourceArtifacts).toEqual(['src:src/app/feed/page.tsx']);
        expect(fileImpactGraph.ranked?.[0]).toMatchObject({
          id: 'src:src/app/feed/page.tsx',
          reason: 'seed_node+pagerank+task_match',
          matched_terms: ['feed', 'source'],
        });

        const query = (await callTool('decantr_query_graph', {
          node_type: 'Route',
          include_edges: true,
        })) as {
          current_snapshot_id?: string;
          snapshot_id?: string;
          nodes?: Array<{ id: string }>;
          edges?: Array<{ relation: string }>;
        };
        expect(query.current_snapshot_id).toBe('graph:test');
        expect(query.snapshot_id).toBe('graph:test');
        expect(query.nodes?.map((node) => node.id)).toEqual(
          expect.arrayContaining(['rt:/feed', 'pg:app:feed']),
        );
        expect(query.edges?.map((edge) => edge.relation)).toContain('PAGE_ROUTED_AT_ROUTE');

        const historicalQuery = (await callTool('decantr_query_graph', {
          snapshot_id: 'graph:older',
          node_type: 'Route',
        })) as {
          current_snapshot_id?: string;
          snapshot_id?: string;
          summary?: { nodes: number };
          nodes?: Array<{ id: string }>;
        };
        expect(historicalQuery.current_snapshot_id).toBe('graph:test');
        expect(historicalQuery.snapshot_id).toBe('graph:older');
        expect(historicalQuery.summary?.nodes).toBe(0);
        expect(historicalQuery.nodes).toEqual([]);

        const relationQuery = (await callTool('decantr_query_graph', {
          relation: 'PATTERN_NEEDS_COMPONENT',
        })) as { nodes?: Array<{ id: string }>; edges?: Array<{ src: string; dst: string }> };
        expect(relationQuery.edges).toEqual([
          { src: 'pat:content-feed', dst: 'cmp:recipecard', relation: 'PATTERN_NEEDS_COMPONENT' },
        ]);
        expect(relationQuery.nodes?.map((node) => node.id)).toEqual(
          expect.arrayContaining(['pat:content-feed', 'cmp:recipecard']),
        );

        const impactQuery = (await callTool('decantr_query_graph', {
          node_ids: ['cmp:recipecard'],
          include_impact: true,
          task: 'change recipe card surface',
        })) as {
          impact?: {
            ranking?: { method?: string; seed?: string[]; task_keywords?: string[] };
            ids?: {
              routes?: string[];
              pages?: string[];
              patterns?: string[];
              components?: string[];
            };
            ranked?: Array<{ id: string; reason: string; matched_terms?: string[] }>;
          } | null;
        };
        expect(impactQuery.impact?.ranking).toMatchObject({
          method: 'hybrid_impact_pagerank_with_task_boost',
          seed: ['cmp:recipecard'],
          task_keywords: ['change', 'recipe', 'card', 'surface'],
        });
        expect(impactQuery.impact?.ids?.routes).toEqual(['rt:/feed']);
        expect(impactQuery.impact?.ids?.pages).toEqual(['pg:app:feed']);
        expect(impactQuery.impact?.ids?.patterns).toEqual(['pat:content-feed']);
        expect(impactQuery.impact?.ids?.components).toEqual(['cmp:recipecard']);
        expect(impactQuery.impact?.ranked?.[0]).toMatchObject({
          id: 'cmp:recipecard',
          reason: 'seed_node+pagerank+task_match',
          matched_terms: ['recipe', 'card'],
        });

        const fileImpactQuery = (await callTool('decantr_query_graph', {
          file_path: 'src/app/feed/page.tsx',
          include_impact: true,
          task: 'edit feed source',
        })) as {
          query?: { file_path?: string; node_ids?: string[] };
          nodes?: Array<{ id: string }>;
          impact?: {
            ranking?: { seed?: string[]; task_keywords?: string[] };
            ids?: { routes?: string[]; sourceArtifacts?: string[] };
          } | null;
        };
        expect(fileImpactQuery.query?.file_path).toBe('src/app/feed/page.tsx');
        expect(fileImpactQuery.query?.node_ids).toEqual(['src:src/app/feed/page.tsx']);
        expect(fileImpactQuery.nodes?.map((node) => node.id)).toEqual([
          'src:src/app/feed/page.tsx',
        ]);
        expect(fileImpactQuery.impact?.ranking).toMatchObject({
          seed: ['src:src/app/feed/page.tsx'],
          task_keywords: ['edit', 'feed', 'source'],
        });
        expect(fileImpactQuery.impact?.ids?.routes).toEqual(['rt:/feed']);
        expect(fileImpactQuery.impact?.ids?.sourceArtifacts).toEqual(['src:src/app/feed/page.tsx']);

        const payloadQuery = (await callTool('decantr_query_graph', {
          node_type: 'Finding',
          payload_key: 'code',
          payload_value: 'RULE001',
        })) as { nodes?: Array<{ id: string }>; summary?: { nodes: number } };
        expect(payloadQuery.summary?.nodes).toBe(1);
        expect(payloadQuery.nodes?.map((node) => node.id)).toEqual(['find:check-no-raw-button']);

        const payloadContainsQuery = (await callTool('decantr_query_graph', {
          payload_contains: 'raw button',
        })) as { nodes?: Array<{ id: string }>; summary?: { nodes: number } };
        expect(payloadContainsQuery.summary?.nodes).toBe(1);
        expect(payloadContainsQuery.nodes?.map((node) => node.id)).toEqual([
          'find:check-no-raw-button',
        ]);

        const traversal = (await callTool('decantr_traverse_graph', {
          from: 'rt:/feed',
          direction: 'in',
          relations: ['PAGE_ROUTED_AT_ROUTE'],
        })) as {
          current_snapshot_id?: string;
          snapshot_id?: string;
          nodes?: Array<{ id: string }>;
          summary?: { edges: number };
        };
        expect(traversal.current_snapshot_id).toBe('graph:test');
        expect(traversal.snapshot_id).toBe('graph:test');
        expect(traversal.nodes?.map((node) => node.id)).toEqual(
          expect.arrayContaining(['rt:/feed', 'pg:app:feed']),
        );
        expect(traversal.summary?.edges).toBe(1);

        const fileTraversal = (await callTool('decantr_traverse_graph', {
          file_path: 'src/app/feed/page.tsx',
          direction: 'in',
          relations: ['NODE_DERIVED_FROM_SOURCE'],
        })) as {
          traversal?: { file_path?: string; resolved_node_ids?: string[]; direction?: string };
          nodes?: Array<{ id: string }>;
          edges?: Array<{ src: string; dst: string; relation: string }>;
        };
        expect(fileTraversal.traversal).toMatchObject({
          file_path: 'src/app/feed/page.tsx',
          resolved_node_ids: ['src:src/app/feed/page.tsx'],
          direction: 'in',
        });
        expect(fileTraversal.nodes?.map((node) => node.id)).toEqual(
          expect.arrayContaining(['src:src/app/feed/page.tsx', 'rt:/feed', 'pg:app:feed']),
        );
        expect(fileTraversal.edges).toEqual(
          expect.arrayContaining([
            {
              src: 'rt:/feed',
              dst: 'src:src/app/feed/page.tsx',
              relation: 'NODE_DERIVED_FROM_SOURCE',
            },
            {
              src: 'pg:app:feed',
              dst: 'src:src/app/feed/page.tsx',
              relation: 'NODE_DERIVED_FROM_SOURCE',
            },
          ]),
        );

        const historicalTraversal = (await callTool('decantr_traverse_graph', {
          snapshot_id: 'graph:older',
          from: 'rt:/feed',
        })) as { error?: string; snapshot_id?: string; available_routes?: string[] };
        expect(historicalTraversal.error).toContain('Start node not found');
        expect(historicalTraversal.snapshot_id).toBe('graph:older');
        expect(historicalTraversal.available_routes).toEqual([]);

        writeJson(join(projectDir, '.decantr', 'evidence', 'latest.json'), {
          ...evidenceBundle,
          findings: evidenceBundle.findings.map((finding) => ({
            ...finding,
            repairPlan: {
              ...finding.repairPlan,
              readTargets: ['src/app/feed/other-page.tsx'],
            },
          })),
          generatedAt: '2026-05-21T14:02:00.000Z',
        });
        const staleState = (await callTool('decantr_get_project_state', {})) as {
          graph?: {
            current?: boolean | null;
            stale_sources?: Array<{ path: string }>;
          };
        };
        expect(staleState.graph?.current).toBe(false);
        expect(staleState.graph?.stale_sources?.map((source) => source.path)).toContain(
          '.decantr/evidence/latest.json',
        );
      } finally {
        rmSync(projectDir, { recursive: true, force: true });
      }
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
        const result = (await callTool('decantr_update_essence', {
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
      const result = await callTool('decantr_prepare_task_context', {
        task: 'improve feed',
      });

      expect(result).toHaveProperty('error');
    });

    it('prepares task context for a project_path from the workspace root', async () => {
      const workspaceDir = mkdtempSync(join(tmpdir(), 'decantr-mcp-context-workspace-'));
      try {
        const projectDir = join(workspaceDir, 'apps', 'web');
        mkdirSync(projectDir, { recursive: true });
        process.chdir(workspaceDir);
        writeJson(join(workspaceDir, 'package.json'), {
          private: true,
          workspaces: ['apps/*'],
          packageManager: 'pnpm@10.33.0',
        });
        writeFileSync(join(workspaceDir, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n', 'utf-8');
        writeJson(join(projectDir, 'package.json'), {
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            'react-router-dom': '^7.0.0',
          },
          devDependencies: { typescript: '^6.0.0', vite: '^8.0.0' },
        });
        mkdirSync(join(projectDir, 'src'), { recursive: true });
        writeFileSync(
          join(projectDir, 'src', 'App.tsx'),
          'import { Route, Routes } from "react-router-dom"; export function App() { return <Routes><Route path="/" element={<main />} /></Routes>; }\n',
          'utf-8',
        );
        writeFileSync(join(projectDir, 'src', 'main.tsx'), "import './App';\n", 'utf-8');
        writeJson(join(projectDir, 'decantr.essence.json'), {
          version: '4.0.0',
          dna: {
            theme: { id: 'existing', mode: 'light' },
            spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '4' },
            typography: { scale: 'system', heading_weight: 600, body_weight: 400 },
            color: { palette: 'existing', accent_count: 1, cvd_preference: 'auto' },
            radius: { philosophy: 'rounded', base: 8 },
            elevation: { system: 'existing', max_levels: 3 },
            motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
            accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
            personality: ['focused'],
          },
          blueprint: {
            features: ['home'],
            sections: [
              {
                id: 'app',
                role: 'primary',
                shell: 'app',
                features: ['home'],
                description: 'App',
                pages: [{ id: 'home', route: '/', layout: ['content-feed'] }],
              },
            ],
            routes: { '/': { section: 'app', page: 'home' } },
          },
          meta: {
            archetype: 'observed-brownfield',
            target: 'react',
            platform: { type: 'spa', routing: 'history' },
            guard: { mode: 'guided', dna_enforcement: 'warn', blueprint_enforcement: 'warn' },
          },
        });

        const result = (await callTool('decantr_prepare_task_context', {
          project_path: 'apps/web',
          route: '/',
          task: 'tighten home loading',
        })) as {
          route?: string | null;
          page_id?: string;
          section_id?: string;
          discovery?: {
            project_path?: string;
            project?: { framework?: string; package_manager?: string; primary_language?: string };
          };
          typed_graph?: unknown;
          verify_command?: string;
        };

        expect(result.route).toBe('/');
        expect(result.page_id).toBe('home');
        expect(result.section_id).toBe('app');
        expect(result.discovery?.project_path).toBe('apps/web');
        expect(result.discovery?.project?.framework).toBe('react');
        expect(result.discovery?.project?.package_manager).toBe('pnpm');
        expect(result.discovery?.project?.primary_language).toBe('typescript');
        expect(result.typed_graph).toBeNull();
        expect(result.verify_command).toBe(
          'decantr verify --project apps/web --brownfield --local-patterns',
        );
      } finally {
        rmSync(workspaceDir, { recursive: true, force: true });
      }
    });

    it('prepares compact task context with packs, evidence, health, and theme inventory', async () => {
      const projectDir = mkdtempSync(join(tmpdir(), 'decantr-mcp-context-'));
      try {
        process.chdir(projectDir);
        writeJson(join(projectDir, 'package.json'), {
          private: true,
          dependencies: { next: '^16.0.0', react: '^19.0.0' },
        });
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
        writeJson(join(projectDir, '.decantr', 'analysis.json'), {
          routes: {
            strategy: 'react-router',
            routes: [{ path: '/feed', file: 'src/fixtures/fake-feed.tsx', hasLayout: false }],
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
              behavior_obligations: {
                intent: 'Keep destructive actions explicit.',
                pattern_role: 'confirmation-dialog',
                modalities: ['keyboard', 'pointer', 'screen-reader'],
                states: ['closed', 'open', 'submitting'],
                risk_profile: ['accidental-destruction'],
                obligations: [
                  {
                    id: 'accessible-name',
                    label: 'Dialog has an accessible name.',
                    severity: 'error',
                    evidence: 'static',
                  },
                ],
                test_hints: ['keyboard interaction smoke test'],
              },
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
        mkdirSync(join(projectDir, 'src', 'app', 'feed'), { recursive: true });
        writeFileSync(
          join(projectDir, 'src', 'app', 'feed', 'page.tsx'),
          'export default function FeedPage() { return <main>Feed</main>; }\n',
          'utf-8',
        );
        execFileSync('git', ['init'], { cwd: projectDir, stdio: 'ignore' });
        execFileSync('git', ['config', 'user.email', 'test@example.com'], {
          cwd: projectDir,
          stdio: 'ignore',
        });
        execFileSync('git', ['config', 'user.name', 'Decantr Test'], {
          cwd: projectDir,
          stdio: 'ignore',
        });
        execFileSync('git', ['add', '.'], { cwd: projectDir, stdio: 'ignore' });
        execFileSync('git', ['commit', '-m', 'baseline'], { cwd: projectDir, stdio: 'ignore' });
        writeFileSync(
          join(projectDir, 'src', 'app', 'feed', 'page.tsx'),
          'export default function FeedPage() { return <main>Feed changed</main>; }\n',
          'utf-8',
        );
        mkdirSync(join(projectDir, '.decantr', 'graph'), { recursive: true });
        writeJson(join(projectDir, '.decantr', 'graph', 'contract-capsule.json'), {
          schema_version: '3.0.0-draft',
          snapshot_id: 'graph:task',
          project_id: 'proj:default',
          created_at: '2026-05-21T00:00:00.000Z',
          source_hash: 'sha256:task',
          contract_hash: 'fnv1a32:task',
          cache_key: 'decantr-contract:fnv1a32:task',
          contract_cache_key: 'decantr-contract:fnv1a32:task',
          summary: {
            routes: 1,
            components: 1,
            tokens: 0,
            local_rules: 1,
            style_bridge: 0,
            source_artifacts: 1,
            open_findings: 0,
          },
          source_artifact_limit: 200,
          source_artifacts_truncated: false,
          routes: [{ id: 'rt:/feed', path: '/feed', page_id: 'pg:app:feed' }],
          components: [{ id: 'cmp:recipecard', label: 'RecipeCard' }],
          tokens: [],
          local_rules: [{ id: 'rule:no-inline-style' }],
          style_bridge: [],
          source_artifacts: [
            {
              id: 'src:src/app/feed/page.tsx',
              path: 'src/app/feed/page.tsx',
              kind: 'route-source',
            },
          ],
          open_findings: [],
        });
        writeJson(join(projectDir, '.decantr', 'graph', 'graph.snapshot.json'), {
          id: 'graph:task',
          schema_version: '3.0.0-draft',
          project_id: 'proj:default',
          created_at: '2026-05-21T00:00:00.000Z',
          source_hash: 'sha256:task',
          nodes: [
            { id: 'rt:/feed', type: 'Route', payload: { path: '/feed' } },
            { id: 'pg:app:feed', type: 'Page', payload: { id: 'feed' } },
            { id: 'sh:top-nav-footer', type: 'Shell', payload: { id: 'top-nav-footer' } },
            { id: 'pat:content-feed', type: 'Pattern', payload: { id: 'content-feed' } },
            { id: 'cmp:recipecard', type: 'Component', payload: { name: 'RecipeCard' } },
            {
              id: 'src:src/app/feed/page.tsx',
              type: 'SourceArtifact',
              payload: {
                id: 'src:src/app/feed/page.tsx',
                kind: 'route-source',
                path: 'src/app/feed/page.tsx',
              },
            },
            {
              id: 'rule:no-inline-style',
              type: 'LocalRule',
              payload: { id: 'no-inline-style' },
            },
          ],
          edges: [
            { src: 'pg:app:feed', dst: 'rt:/feed', relation: 'PAGE_ROUTED_AT_ROUTE' },
            { src: 'pg:app:feed', dst: 'sh:top-nav-footer', relation: 'PAGE_USES_SHELL' },
            { src: 'pg:app:feed', dst: 'pat:content-feed', relation: 'PAGE_COMPOSES_PATTERN' },
            { src: 'pat:content-feed', dst: 'cmp:recipecard', relation: 'PATTERN_NEEDS_COMPONENT' },
            {
              src: 'rt:/feed',
              dst: 'src:src/app/feed/page.tsx',
              relation: 'NODE_DERIVED_FROM_SOURCE',
            },
            {
              src: 'pg:app:feed',
              dst: 'src:src/app/feed/page.tsx',
              relation: 'NODE_DERIVED_FROM_SOURCE',
            },
            { src: 'rule:no-inline-style', dst: 'proj:default', relation: 'LOCAL_RULE_APPLIES_TO' },
          ],
          summary: { nodes: 7, edges: 7, findings: 0, evidence: 0 },
        });

        const result = (await callTool('decantr_prepare_task_context', {
          route: '/feed',
          task: 'improve recipe feed loading',
        })) as {
          task_capsule_version: string;
          task_capsule_budget: {
            maxCanonicalBytes: number;
            maxEstimatedTokens: number;
            canonicalBytes: number;
            estimatedTokens: number;
          };
          task_capsule_truncation: { truncated: boolean; truncatedFields: string[] };
          task_capsule_digest: string;
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
            patterns: Array<{
              id: string;
              component_paths: string[];
              behavior_obligations?: {
                intent?: string;
                obligations?: Array<{ id: string; label: string }>;
              } | null;
            }>;
            behavior_obligations: Array<{
              pattern_id: string;
              intent?: string;
              obligations: Array<{ id: string; label: string }>;
            }>;
            rules: Array<{ id: string; severity: string }>;
          };
          authority: {
            lane: string;
            active_lane: string;
            active_authorities: string[];
            source_authority: string;
            warnings: string[];
          };
          change_impact: { changed_file_count: number; impacted_routes: string[] };
          typed_graph: {
            snapshot_id: string;
            contract: { contract_cache_key: string };
            route_context: {
              ranking: { method: string; task_keywords: string[] };
              ids: { patterns: string[]; components: string[] };
              ranked: Array<{ id: string; reason: string; matched_terms?: string[] }>;
              summary: { nodes: number };
            };
            changed_file_context: {
              changed_files: string[];
              resolved_node_ids: string[];
              impact: {
                ids: { routes: string[]; sourceArtifacts: string[] };
                ranked: Array<{ id: string; reason: string; matched_terms?: string[] }>;
              } | null;
            };
          };
          response_detail: string;
          ui_surface_task: {
            target: string;
            status: string;
            surface: { kind: string; files: string[]; authority: string };
          };
          loop: {
            state: string;
            authority: { activeLane: string };
            graphImpact: { status: string; staleArtifacts: unknown[] };
            readTargets: string[];
          };
          verify_command: string;
          local_files: {
            graph_snapshot: string;
            visual_manifest: string;
            local_patterns: string;
            local_rules: string;
          };
        };

        expect(result.route).toBe('/feed');
        expect(result.task_capsule_version).toBe('task-capsule.v1');
        expect(result.task_capsule_budget.canonicalBytes).toBeLessThanOrEqual(12_000);
        expect(result.task_capsule_budget.estimatedTokens).toBeLessThanOrEqual(4_000);
        expect(result.task_capsule_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
        expect(result.response_detail).toBe('compact');
        expect(result.ui_surface_task).toMatchObject({
          target: '/feed',
          surface: {
            kind: 'route',
            files: ['src/app/feed/page.tsx'],
            authority: 'production-proven',
          },
        });
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
        expect(result.local_law.patterns[0].behavior_obligations?.obligations[0].id).toBe(
          'accessible-name',
        );
        expect(result.local_law.behavior_obligations[0]).toMatchObject({
          pattern_id: 'button',
          intent: 'Keep destructive actions explicit.',
        });
        expect(result.local_law.rules[0].id).toBe('no-inline-style');
        expect(result.authority.lane).toBe('Hybrid local law');
        expect(result.authority.active_lane).toBe('local-law');
        expect(result.loop.authority.activeLane).toBe(result.authority.active_lane);
        expect(result.authority.active_authorities).toContain('accepted local patterns/rules');
        expect(result.authority.source_authority).toContain('accepted project-owned UI law');
        expect(result.change_impact.changed_file_count).toBeGreaterThanOrEqual(0);
        expect(result.typed_graph.snapshot_id).toBe('graph:task');
        expect(result.typed_graph.contract.contract_cache_key).toBe(
          'decantr-contract:fnv1a32:task',
        );
        expect(result.typed_graph.route_context.ids.patterns).toContain('pat:content-feed');
        expect(result.typed_graph.route_context.ids.components).toContain('cmp:recipecard');
        expect(result.typed_graph.route_context.ranking).toMatchObject({
          method: 'hybrid_weighted_pagerank_with_task_boost',
          task_keywords: ['improve', 'recipe', 'feed', 'loading'],
        });
        expect(result.typed_graph.route_context.ranked[0]).toMatchObject({
          id: 'pg:app:feed',
          reason: 'route_page+pagerank+task_match',
          matched_terms: ['feed'],
        });
        expect(
          result.typed_graph.route_context.ranked.find(
            (node: { id: string }) => node.id === 'rt:/feed',
          ),
        ).toMatchObject({
          id: 'rt:/feed',
          reason: 'requested_route+pagerank+task_match',
          matched_terms: ['feed'],
        });
        expect(result.typed_graph.changed_file_context.changed_files).toContain(
          'src/app/feed/page.tsx',
        );
        expect(result.typed_graph.changed_file_context.resolved_node_ids).toEqual([
          'src:src/app/feed/page.tsx',
        ]);
        expect(result.typed_graph.changed_file_context.impact?.ids.routes).toEqual(['rt:/feed']);
        expect(result.typed_graph.changed_file_context.impact?.ids.sourceArtifacts).toEqual([
          'src:src/app/feed/page.tsx',
        ]);
        expect(result.typed_graph.route_context).not.toHaveProperty('nodes');
        expect(result.typed_graph.route_context).not.toHaveProperty('edges');
        expect(result.loop.state).toBe('blocked_missing_graph');
        expect(result.loop.graphImpact.status).toBe('stale');
        expect(result.loop.readTargets[0]).toBe('src/app/feed/page.tsx');
        expect(result.loop.readTargets).toContain('src/app/feed/page.tsx');
        expect(Buffer.byteLength(JSON.stringify(result), 'utf8')).toBeLessThanOrEqual(12_000);
        expect(result.verify_command).toBe('decantr verify --brownfield --local-patterns');
        expect(result.local_files.graph_snapshot).toBe('.decantr/graph/graph.snapshot.json');
        expect(result.local_files.visual_manifest).toBe('.decantr/evidence/visual-manifest.json');
        expect(result.local_files.local_patterns).toBe('.decantr/local-patterns.json');
        expect(result.local_files.local_rules).toBe('.decantr/rules.json');

        const longTask = 'improve the governed recipe feed loading state '.repeat(900);
        const bounded = (await callTool('decantr_prepare_task_context', {
          route: '/feed',
          task: longTask,
          detail: 'full',
        })) as {
          task: string;
          task_capsule_budget: { canonicalBytes: number; estimatedTokens: number };
          task_capsule_truncation: { truncated: boolean; truncatedFields: string[] };
          task_capsule_digest: string;
        };
        expect(bounded.task.length).toBeLessThan(longTask.length);
        expect(bounded.task.endsWith('\u2026')).toBe(true);
        expect(bounded.task_capsule_budget.canonicalBytes).toBeLessThanOrEqual(12_000);
        expect(bounded.task_capsule_budget.estimatedTokens).toBeLessThanOrEqual(4_000);
        expect(bounded.task_capsule_truncation).toMatchObject({
          truncated: true,
          truncatedFields: ['task.request'],
        });
        expect(bounded.task_capsule_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
        expect(Buffer.byteLength(JSON.stringify(bounded), 'utf8')).toBeLessThanOrEqual(12_000);
        const repeatedBounded = (await callTool('decantr_prepare_task_context', {
          route: '/feed',
          task: longTask,
          detail: 'full',
        })) as {
          task: string;
          task_capsule_budget: { canonicalBytes: number; estimatedTokens: number };
          task_capsule_truncation: { truncated: boolean; truncatedFields: string[] };
          task_capsule_digest: string;
        };
        expect(repeatedBounded.task).toBe(bounded.task);
        expect(repeatedBounded.task_capsule_budget).toEqual(bounded.task_capsule_budget);
        expect(repeatedBounded.task_capsule_truncation).toEqual(bounded.task_capsule_truncation);
        expect(repeatedBounded.task_capsule_digest).toBe(bounded.task_capsule_digest);
      } finally {
        rmSync(projectDir, { recursive: true, force: true });
      }
    });

    it('preserves component reuse repair payloads in evidence bundles', async () => {
      const projectDir = mkdtempSync(join(tmpdir(), 'decantr-mcp-component-reuse-'));
      try {
        process.chdir(projectDir);
        writeJson(join(projectDir, 'decantr.essence.json'), {
          version: '4.0.0',
          dna: {
            theme: { id: 'existing', mode: 'auto', shape: 'rounded' },
            spacing: {
              base_unit: 4,
              scale: 'linear',
              density: 'comfortable',
              content_gap: '_gap4',
            },
            typography: { scale: 'system', heading_weight: 600, body_weight: 400 },
            color: { palette: 'existing', accent_count: 1, cvd_preference: 'auto' },
            radius: { philosophy: 'rounded', base: 8 },
            elevation: { system: 'existing', max_levels: 3 },
            motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
            accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: false },
            personality: ['observed app'],
          },
          blueprint: {
            features: [],
            sections: [
              {
                id: 'app',
                role: 'primary',
                shell: 'observed-existing-shell',
                features: [],
                description: 'Existing app',
                pages: [{ id: 'home', route: '/', layout: ['existing-surface'] }],
              },
            ],
            routes: { '/': { section: 'app', page: 'home' } },
          },
          meta: {
            archetype: 'observed-brownfield',
            target: 'react',
            platform: { type: 'spa', routing: 'history' },
            guard: { mode: 'guided', dna_enforcement: 'warn', blueprint_enforcement: 'warn' },
          },
        });
        mkdirSync(join(projectDir, 'src', 'components', 'ui'), { recursive: true });
        mkdirSync(join(projectDir, 'src', 'app', 'dashboard'), { recursive: true });
        mkdirSync(join(projectDir, 'src', 'app', 'settings'), { recursive: true });
        writeFileSync(
          join(projectDir, 'src', 'components', 'ui', 'Button.tsx'),
          'export function Button() { return <button />; }\n',
          'utf-8',
        );
        writeFileSync(
          join(projectDir, 'src', 'app', 'dashboard', 'page.tsx'),
          'function Button() { return <button />; }\nexport function DashboardPage() { return <Button />; }\n',
          'utf-8',
        );
        writeFileSync(
          join(projectDir, 'src', 'app', 'settings', 'page.tsx'),
          'export function SettingsPage() { return <button type="button">Save</button>; }\n',
          'utf-8',
        );

        const evidence = (await callTool('decantr_get_evidence_bundle', {})) as {
          discovery?: {
            schema_version?: string;
            project_path?: string;
            project?: { framework?: string };
          };
          provenance?: {
            graphSnapshot?: { present?: boolean; path?: string };
            contractCapsule?: { present?: boolean; path?: string };
          };
          findings: Array<{
            code?: string;
            repair?: { id: string; payload?: Record<string, unknown> };
          }>;
        };
        const finding = evidence.findings.find((entry) => entry.code === 'COMP001');

        expect(finding?.repair).toMatchObject({
          id: 'import-existing-component',
          payload: {
            component: 'Button',
            file: 'src/app/dashboard/page.tsx',
            canonical_file: 'src/components/ui/Button.tsx',
          },
        });
        expect(evidence.provenance?.graphSnapshot).toMatchObject({
          path: '.decantr/graph/graph.snapshot.json',
          present: false,
        });
        expect(evidence.provenance?.contractCapsule).toMatchObject({
          path: '.decantr/graph/contract-capsule.json',
          present: false,
        });
        expect(evidence.discovery).toMatchObject({
          schema_version: 'discovery.v1',
          project_path: '.',
          project: { framework: 'unknown' },
        });

        const findings = (await callTool('decantr_get_findings', {
          code: 'COMP001',
        })) as {
          findings: Array<{
            code?: string;
            remediation?: { prompt?: string; commands?: string[] };
            repair?: { id: string };
          }>;
          summary?: { matched_findings: number };
        };
        expect(findings.summary?.matched_findings).toBe(1);
        expect(findings.findings[0]).toMatchObject({
          code: 'COMP001',
          repair: { id: 'import-existing-component' },
        });
        expect(findings.findings[0]?.remediation?.prompt).toBeUndefined();
        expect(findings.findings[0]?.remediation?.commands?.length).toBeGreaterThan(0);

        const repairPlan = (await callTool('decantr_get_repair_plan', {
          code: 'COMP001',
        })) as {
          finding?: { code?: string };
          plan?: {
            repair_id?: string | null;
            actions?: Array<{ kind?: string; payload?: Record<string, unknown> }>;
            read_targets?: string[];
            prompt?: string;
          };
        };
        expect(repairPlan.finding?.code).toBe('COMP001');
        expect(repairPlan.plan?.repair_id).toBe('import-existing-component');
        expect(repairPlan.plan?.actions?.[0]).toMatchObject({
          kind: 'replace_duplicate_with_import',
          payload: {
            component: 'Button',
            file: 'src/app/dashboard/page.tsx',
            canonical_file: 'src/components/ui/Button.tsx',
          },
        });
        expect(repairPlan.plan?.read_targets).toEqual(
          expect.arrayContaining([
            'DECANTR.md',
            'decantr.essence.json',
            'src/app/dashboard/page.tsx',
          ]),
        );
        expect(repairPlan.plan?.prompt).toBeUndefined();

        const rawControlRepairPlan = (await callTool('decantr_get_repair_plan', {
          code: 'COMP010',
        })) as {
          plan?: {
            repair_id?: string | null;
            actions?: Array<{ kind?: string; payload?: Record<string, unknown> }>;
          };
        };
        expect(rawControlRepairPlan.plan?.repair_id).toBe(
          'replace-raw-control-with-local-component',
        );
        expect(rawControlRepairPlan.plan?.actions?.[0]).toMatchObject({
          kind: 'replace_raw_control_with_component',
          payload: {
            component: 'Button',
            element: 'button',
            file: 'src/app/settings/page.tsx',
            canonical_file: 'src/components/ui/Button.tsx',
          },
        });
      } finally {
        rmSync(projectDir, { recursive: true, force: true });
      }
    });

    it('returns style bridge drift findings and typed repair plans', async () => {
      const projectDir = mkdtempSync(join(tmpdir(), 'decantr-mcp-style-bridge-'));
      try {
        process.chdir(projectDir);
        writeJson(join(projectDir, 'decantr.essence.json'), {
          version: '4.0.0',
          dna: {
            theme: { id: 'existing', mode: 'auto', shape: 'rounded' },
            spacing: {
              base_unit: 4,
              scale: 'linear',
              density: 'comfortable',
              content_gap: '_gap4',
            },
            typography: { scale: 'system', heading_weight: 600, body_weight: 400 },
            color: { palette: 'existing', accent_count: 1, cvd_preference: 'auto' },
            radius: { philosophy: 'rounded', base: 8 },
            elevation: { system: 'existing', max_levels: 3 },
            motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
            accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: false },
            personality: ['observed app'],
          },
          blueprint: {
            features: [],
            sections: [
              {
                id: 'app',
                role: 'primary',
                shell: 'observed-existing-shell',
                features: [],
                description: 'Existing app',
                pages: [{ id: 'home', route: '/', layout: ['existing-surface'] }],
              },
            ],
            routes: { '/': { section: 'app', page: 'home' } },
          },
          meta: {
            archetype: 'observed-brownfield',
            target: 'react',
            platform: { type: 'spa', routing: 'history' },
            guard: { mode: 'guided', dna_enforcement: 'warn', blueprint_enforcement: 'warn' },
          },
        });
        mkdirSync(join(projectDir, '.decantr'), { recursive: true });
        writeJson(join(projectDir, '.decantr', 'style-bridge.json'), {
          version: 1,
          status: 'accepted',
          mappings: [
            {
              id: 'bridge:surface',
              tokenHints: ['--color-surface', '--color-foreground'],
              classHints: ['bg-background', 'text-foreground'],
            },
          ],
        });
        mkdirSync(join(projectDir, '.decantr', 'graph'), { recursive: true });
        writeJson(join(projectDir, '.decantr', 'graph', 'graph.snapshot.json'), {
          id: 'graph:style-bridge',
          schema_version: '3.0.0-draft',
          project_id: 'proj:default',
          created_at: '2026-05-21T00:00:00.000Z',
          source_hash: 'sha256:style-bridge',
          nodes: [
            { id: 'proj:default', type: 'Project', payload: { id: 'default' } },
            { id: 'rt:/', type: 'Route', payload: { path: '/' } },
            { id: 'pg:app:home', type: 'Page', payload: { id: 'home', section: 'app' } },
            {
              id: 'sh:observed-existing-shell',
              type: 'Shell',
              payload: { id: 'observed-existing-shell' },
            },
            { id: 'pat:existing-surface', type: 'Pattern', payload: { id: 'existing-surface' } },
            { id: 'bridge:surface', type: 'StyleBridge', payload: { id: 'bridge:surface' } },
            { id: 'tkn:color-surface', type: 'Token', payload: { name: '--color-surface' } },
          ],
          edges: [
            { src: 'pg:app:home', dst: 'rt:/', relation: 'PAGE_ROUTED_AT_ROUTE' },
            { src: 'pg:app:home', dst: 'sh:observed-existing-shell', relation: 'PAGE_USES_SHELL' },
            { src: 'pg:app:home', dst: 'pat:existing-surface', relation: 'PAGE_COMPOSES_PATTERN' },
            { src: 'bridge:surface', dst: 'proj:default', relation: 'STYLE_BRIDGE_MAPS_TO' },
            { src: 'bridge:surface', dst: 'tkn:color-surface', relation: 'STYLE_BRIDGE_MAPS_TO' },
          ],
          summary: { nodes: 7, edges: 5, findings: 0, evidence: 0 },
        });
        mkdirSync(join(projectDir, 'src', 'app', 'dashboard'), { recursive: true });
        writeFileSync(
          join(projectDir, 'src', 'app', 'dashboard', 'page.tsx'),
          'import { cn } from "@/lib/utils";\nexport function DashboardPage() { return <main className={cn("bg-[#0f172a]")}>Dashboard</main>; }\n',
          'utf-8',
        );

        const findings = (await callTool('decantr_get_findings', {
          source: 'style-bridge',
          code: 'TOKEN010',
        })) as {
          findings: Array<{
            code?: string;
            source?: string;
            repair?: { id?: string; payload?: Record<string, unknown> };
          }>;
          summary?: { matched_findings: number };
        };

        expect(findings.summary?.matched_findings).toBe(1);
        expect(findings.findings[0]).toMatchObject({
          code: 'TOKEN010',
          source: 'style-bridge',
          repair: {
            id: 'replace-arbitrary-style-with-bridge-token',
            payload: {
              file: 'src/app/dashboard/page.tsx',
              value: 'bg-[#0f172a]',
              bridge_mappings: ['bridge:surface'],
            },
          },
        });

        const repairPlan = (await callTool('decantr_get_repair_plan', {
          code: 'TOKEN010',
        })) as {
          plan?: {
            repair_id?: string | null;
            graph_anchor?: { node_id?: string };
            impact_context?: {
              summary?: { routes?: number; tokens?: number };
              ids?: { routes?: string[]; tokens?: string[]; styleBridge?: string[] };
            } | null;
            actions?: Array<{ kind?: string; payload?: Record<string, unknown> }>;
            read_targets?: string[];
            commands?: string[];
          };
        };
        expect(repairPlan.plan?.repair_id).toBe('replace-arbitrary-style-with-bridge-token');
        expect(repairPlan.plan?.graph_anchor?.node_id).toBe('bridge:surface');
        expect(repairPlan.plan?.impact_context?.ids?.routes).toEqual(['rt:/']);
        expect(repairPlan.plan?.impact_context?.ids?.tokens).toEqual(['tkn:color-surface']);
        expect(repairPlan.plan?.impact_context?.ids?.styleBridge).toEqual(['bridge:surface']);
        expect(repairPlan.plan?.impact_context?.summary).toMatchObject({ routes: 1, tokens: 1 });
        expect(repairPlan.plan?.actions?.[0]).toMatchObject({
          kind: 'replace_arbitrary_style_with_bridge_token',
          payload: {
            file: 'src/app/dashboard/page.tsx',
            value: 'bg-[#0f172a]',
            bridge_mappings: ['bridge:surface'],
          },
        });
        expect(repairPlan.plan?.read_targets).toEqual(
          expect.arrayContaining([
            'DECANTR.md',
            'decantr.essence.json',
            '.decantr/style-bridge.json',
            'src/app/dashboard/page.tsx',
          ]),
        );
        expect(repairPlan.plan?.commands).toContain('decantr codify --style-bridge');
      } finally {
        rmSync(projectDir, { recursive: true, force: true });
      }
    });

    it('surfaces missing typed graph artifacts as typed MCP findings and repair plans', async () => {
      const projectDir = mkdtempSync(join(tmpdir(), 'decantr-mcp-graph-health-'));
      try {
        process.chdir(projectDir);
        mkdirSync(join(projectDir, '.decantr'), { recursive: true });
        writeJson(join(projectDir, '.decantr', 'project.json'), {
          workflowMode: 'brownfield-attach',
          adoptionMode: 'contract-only',
        });
        writeJson(join(projectDir, 'decantr.essence.json'), {
          version: '4.0.0',
          dna: {
            theme: { id: 'existing', mode: 'auto', shape: 'rounded' },
            spacing: {
              base_unit: 4,
              scale: 'linear',
              density: 'comfortable',
              content_gap: '_gap4',
            },
            typography: { scale: 'system', heading_weight: 600, body_weight: 400 },
            color: { palette: 'existing', accent_count: 1, cvd_preference: 'auto' },
            radius: { philosophy: 'rounded', base: 8 },
            elevation: { system: 'existing', max_levels: 3 },
            motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
            accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: false },
            personality: ['observed app'],
          },
          blueprint: {
            features: [],
            sections: [
              {
                id: 'app',
                role: 'primary',
                shell: 'observed-existing-shell',
                features: [],
                description: 'Existing app',
                pages: [{ id: 'home', route: '/', layout: ['existing-surface'] }],
              },
            ],
            routes: { '/': { section: 'app', page: 'home' } },
          },
          meta: {
            archetype: 'observed-brownfield',
            target: 'react',
            platform: { type: 'spa', routing: 'history' },
            guard: { mode: 'guided', dna_enforcement: 'warn', blueprint_enforcement: 'warn' },
          },
        });

        const findings = (await callTool('decantr_get_findings', {
          code: 'GRAPH001',
        })) as {
          findings: Array<{
            code?: string;
            repair?: { id?: string };
            source?: string;
          }>;
          summary?: { matched_findings: number };
        };

        expect(findings.summary?.matched_findings).toBe(1);
        expect(findings.findings[0]).toMatchObject({
          code: 'GRAPH001',
          source: 'graph',
          repair: { id: 'regenerate-typed-graph' },
        });

        const evidence = (await callTool('decantr_get_evidence_bundle', {})) as {
          provenance?: {
            graphSnapshot?: { present?: boolean };
            graphManifest?: { present?: boolean };
            graphDiff?: { present?: boolean };
            contractCapsule?: { present?: boolean };
          };
        };
        expect(evidence.provenance?.graphSnapshot?.present).toBe(false);
        expect(evidence.provenance?.graphManifest?.present).toBe(false);
        expect(evidence.provenance?.graphDiff?.present).toBe(false);
        expect(evidence.provenance?.contractCapsule?.present).toBe(false);

        const repairPlan = (await callTool('decantr_get_repair_plan', {
          code: 'GRAPH001',
        })) as {
          plan?: {
            repair_id?: string | null;
            actions?: Array<{ kind?: string; target?: string }>;
            commands?: string[];
          };
        };
        expect(repairPlan.plan?.repair_id).toBe('regenerate-typed-graph');
        expect(repairPlan.plan?.actions?.[0]).toMatchObject({
          kind: 'regenerate_artifact',
          target: '.decantr/graph',
        });
        expect(repairPlan.plan?.commands).toContain('decantr graph');
      } finally {
        rmSync(projectDir, { recursive: true, force: true });
      }
    });

    it('rejects project paths outside the active workspace root', async () => {
      const result = await callTool('decantr_get_evidence_bundle', {
        project_path: '../outside-workspace',
      });

      expect(result).toHaveProperty('error');
      expect(String((result as { error: string }).error)).toContain('escapes the active workspace');
    });
  });

  describe('decantr_search_registry', () => {
    it('should require query parameter', async () => {
      const result = await callTool('decantr_search_registry', {});
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

      const result = (await callTool('decantr_search_registry', {
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
      const result = await callTool('decantr_resolve_pattern', {});
      expect(result).toHaveProperty('error');
    });

    it('should return not-found for unknown pattern', async () => {
      const result = (await callTool('decantr_resolve_pattern', {
        id: 'nonexistent-pattern-xyz',
      })) as { found: boolean };
      expect(result.found).toBe(false);
    });
  });

  describe('decantr_resolve_archetype', () => {
    it('should require id parameter', async () => {
      const result = await callTool('decantr_resolve_archetype', {});
      expect(result).toHaveProperty('error');
    });

    it('should return not-found for unknown archetype', async () => {
      const result = (await callTool('decantr_resolve_archetype', {
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

      const result = (await callTool('decantr_get_registry_intelligence_summary', {
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
      const result = await callTool('unknown_tool', {});
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
