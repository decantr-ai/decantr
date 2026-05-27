import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildGraphArtifacts, cmdGraph } from '../src/commands/graph.js';

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function writeEssence(root: string): void {
  writeJson(join(root, 'decantr.essence.json'), {
    version: '4.0.0',
    dna: {
      theme: { id: 'existing', mode: 'auto', shape: 'rounded' },
      spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '_gap4' },
      typography: { scale: 'system', heading_weight: 600, body_weight: 400 },
      color: { palette: 'existing', accent_count: 1, cvd_preference: 'auto' },
      radius: { philosophy: 'rounded', base: 8 },
      elevation: { system: 'existing', max_levels: 3 },
      motion: { preference: 'subtle', duration_scale: 1, reduce_motion: false },
      accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: false },
      personality: ['observed brownfield app'],
    },
    blueprint: {
      sections: [
        {
          id: 'app',
          role: 'primary',
          shell: 'observed-existing-shell',
          features: ['auth'],
          description: 'Existing app',
          pages: [{ id: 'home', route: '/', layout: ['existing-surface'] }],
        },
      ],
      features: ['auth'],
      routes: { '/': { section: 'app', page: 'home' } },
    },
    meta: {
      archetype: 'observed-brownfield',
      target: 'react',
      platform: { type: 'spa', routing: 'history' },
      guard: { mode: 'guided', dna_enforcement: 'warn', blueprint_enforcement: 'warn' },
    },
  });
}

describe('graph command artifacts', () => {
  let testDir = '';

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-graph-'));
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    writeEssence(testDir);
    writeJson(join(testDir, '.decantr', 'rules.json'), {
      version: 1,
      status: 'accepted',
      generatedAt: '2026-05-21T00:00:00.000Z',
      source: 'test',
      purpose: 'Test local law',
      enforcement: { defaultSeverity: 'warn', mode: 'warn', notes: [] },
      rules: [
        {
          id: 'no-raw-button',
          type: 'forbid-regex',
          enabled: true,
          severity: 'warn',
          description: 'Prefer Button.',
          includeExtensions: ['.tsx'],
          pattern: '<button',
          message: 'Use Button.',
          suggestedFix: 'Import Button.',
        },
      ],
    });
    writeJson(join(testDir, '.decantr', 'local-patterns.json'), {
      version: 2,
      status: 'accepted',
      source: 'test',
      patterns: [
        {
          id: 'existing-surface',
          role: 'Route surface',
          componentPaths: ['src/components/Dialog.tsx'],
          behavior_obligations: {
            intent: 'Keep destructive confirmations safe.',
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
            test_hints: ['focus return assertion'],
          },
        },
      ],
    });
    writeJson(join(testDir, '.decantr', 'style-bridge.json'), {
      version: 1,
      status: 'accepted',
      generatedAt: '2026-05-21T00:00:00.000Z',
      source: 'test',
      purpose: 'Test style bridge',
      adoption: {
        mode: 'style-bridge',
        workflowMode: 'brownfield-attach',
        sourceAuthority: 'source',
        styleAuthority: 'style',
        notRuntimeTakeover: true,
        authorityPrecedence: [],
      },
      project: {
        framework: 'react',
        packageManager: 'pnpm',
        target: 'react',
        routeCount: 1,
      },
      styling: {
        approach: 'tailwind',
        configFile: null,
        darkModeDetected: false,
        cssVariables: [],
        colorTokenNames: [],
        themeModes: ['base'],
        themeVariantIds: [],
      },
      mappings: [
        {
          id: 'surface',
          label: 'Surface',
          decantrIntent: 'surfaces',
          projectAuthority: 'Card',
          tokenHints: ['--surface'],
          classHints: ['bg-card'],
          sourceEvidence: ['src/components/Card.tsx'],
          guardrails: ['Use Card.'],
        },
      ],
      rules: [],
      nextSteps: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(testDir, { recursive: true, force: true });
    process.exitCode = undefined;
  });

  it('builds typed graph artifacts from Essence, local rules, and style bridge', async () => {
    const artifacts = buildGraphArtifacts(testDir);

    expect(artifacts?.snapshot.nodes.map((node) => node.id)).toEqual(
      expect.arrayContaining([
        'rule:no-raw-button',
        'rule:behavior:existing-surface:accessible-name',
        'bridge:surface',
        'tkn:surface',
        'rt:/',
      ]),
    );
    expect(artifacts?.snapshot.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: 'bridge:surface',
          dst: 'tkn:surface',
          relation: 'STYLE_BRIDGE_MAPS_TO',
        }),
        expect.objectContaining({
          src: 'rule:behavior:existing-surface:accessible-name',
          dst: 'pat:existing-surface',
          relation: 'LOCAL_RULE_APPLIES_TO',
        }),
      ]),
    );
    expect(artifacts?.capsule.summary).toMatchObject({
      routes: 1,
      tokens: 1,
      local_rules: 2,
      style_bridge: 1,
    });
    expect(artifacts?.capsule.summary.source_artifacts).toBeGreaterThan(0);
    expect(artifacts?.capsule.source_artifacts.map((source) => source.path)).toEqual(
      expect.arrayContaining(['decantr.essence.json']),
    );

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await cmdGraph(testDir, { json: true });
    const summary = JSON.parse(String(log.mock.calls.at(-1)?.[0])) as {
      snapshot?: { history?: string };
      capsule?: {
        source_artifact_limit?: number;
        source_artifacts_truncated?: boolean;
      };
      diff?: { from?: string; summary?: { total?: number; findings?: { added?: number } } };
    };
    expect(summary.snapshot?.history).toMatch(/\.decantr\/graph\/snapshots\/graph-/);
    expect(summary.capsule?.source_artifact_limit).toBe(200);
    expect(summary.capsule?.source_artifacts_truncated).toBe(false);
    expect(summary.diff?.from).toMatch(/^graph:/);
    expect(summary.diff?.summary).toMatchObject({
      total: 0,
      findings: { added: 0 },
    });

    const graphDir = join(testDir, '.decantr', 'graph');
    expect(existsSync(join(graphDir, 'graph.snapshot.json'))).toBe(true);
    expect(existsSync(join(graphDir, 'snapshots'))).toBe(true);
    expect(existsSync(join(graphDir, 'graph.manifest.json'))).toBe(true);
    expect(existsSync(join(graphDir, 'graph.diff.json'))).toBe(true);
    expect(existsSync(join(graphDir, 'contract-capsule.json'))).toBe(true);

    const manifest = JSON.parse(readFileSync(join(graphDir, 'graph.manifest.json'), 'utf-8')) as {
      outputs?: { history?: string };
    };
    expect(manifest.outputs?.history).toBe('.decantr/graph/snapshots');

    const capsule = JSON.parse(readFileSync(join(graphDir, 'contract-capsule.json'), 'utf-8')) as {
      contract_hash?: string;
      cache_key?: string;
      contract_cache_key?: string;
      summary: { local_rules: number; style_bridge: number; source_artifacts: number };
      tokens?: Array<{ id: string; label?: string }>;
      source_artifacts?: Array<{ path: string }>;
    };
    expect(capsule.contract_hash).toMatch(/^fnv1a32:/);
    expect(capsule.cache_key).toBe(`decantr-contract:${capsule.contract_hash}`);
    expect(capsule.contract_cache_key).toBe(capsule.cache_key);
    expect(capsule.summary).toMatchObject({
      local_rules: 2,
      style_bridge: 1,
      source_artifacts: expect.any(Number),
    });
    expect(capsule.local_rules?.map((rule) => rule.id)).toEqual(
      expect.arrayContaining(['rule:behavior:existing-surface:accessible-name']),
    );
    expect(capsule.tokens?.map((token) => token.id)).toEqual(['tkn:surface']);
    expect(capsule.source_artifacts?.map((source) => source.path)).toEqual(
      expect.arrayContaining(['decantr.essence.json']),
    );

    await cmdGraph(testDir, { json: true, capsuleSourceLimit: 0 });
    const limitedSummary = JSON.parse(String(log.mock.calls.at(-1)?.[0])) as {
      capsule?: {
        source_artifacts?: number;
        source_artifact_limit?: number;
        source_artifacts_truncated?: boolean;
      };
    };
    expect(limitedSummary.capsule).toMatchObject({
      source_artifacts: expect.any(Number),
      source_artifact_limit: 0,
      source_artifacts_truncated: true,
    });
    const limitedCapsule = JSON.parse(
      readFileSync(join(graphDir, 'contract-capsule.json'), 'utf-8'),
    ) as {
      summary: { source_artifacts: number };
      source_artifact_limit: number;
      source_artifacts_truncated: boolean;
      source_artifacts: unknown[];
    };
    expect(limitedCapsule.summary.source_artifacts).toBeGreaterThan(0);
    expect(limitedCapsule.source_artifact_limit).toBe(0);
    expect(limitedCapsule.source_artifacts_truncated).toBe(true);
    expect(limitedCapsule.source_artifacts).toEqual([]);

    await cmdGraph(testDir, { json: true });
    expect(buildGraphArtifacts(testDir)?.staleArtifacts).toEqual([]);
  });

  it('prints route-scoped graph context in JSON output', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await cmdGraph(testDir, { json: true, route: '/' });

    const summary = JSON.parse(String(log.mock.calls.at(-1)?.[0])) as {
      routeContext?: {
        found?: boolean;
        route?: string;
        ranking?: { method?: string; seed?: string; task_keywords?: string[] };
        ids?: { patterns?: string[]; tokens?: string[]; localRules?: string[] };
        ranked?: Array<{ id: string; reason: string }>;
      };
    };
    expect(summary.routeContext?.found).toBe(true);
    expect(summary.routeContext?.route).toBe('/');
    expect(summary.routeContext?.ranking).toEqual({
      method: 'weighted_traversal',
      seed: 'rt:/',
      task_keywords: [],
    });
    expect(summary.routeContext?.ids?.patterns).toContain('pat:existing-surface');
    expect(summary.routeContext?.ids?.tokens).toContain('tkn:surface');
    expect(summary.routeContext?.ids?.localRules).toContain('rule:no-raw-button');
    expect(summary.routeContext?.ids?.localRules).toContain(
      'rule:behavior:existing-surface:accessible-name',
    );
    expect(summary.routeContext?.ranked?.[0]).toMatchObject({
      id: 'rt:/',
      reason: 'requested_route',
    });

    log.mockClear();
    await cmdGraph(testDir, { json: true, route: '/', task: 'replace raw button surface' });
    const taskSummary = JSON.parse(String(log.mock.calls.at(-1)?.[0])) as {
      routeContext?: {
        ranking?: { method?: string; task_keywords?: string[] };
        ranked?: Array<{ id: string; reason: string; matched_terms?: string[] }>;
      };
    };
    expect(taskSummary.routeContext?.ranking).toMatchObject({
      method: 'weighted_traversal_with_task_boost',
      task_keywords: ['replace', 'raw', 'button', 'surface'],
    });
    expect(
      taskSummary.routeContext?.ranked?.find((node) => node.id === 'rule:no-raw-button'),
    ).toMatchObject({
      reason: 'applicable_local_rule+task_match',
      matched_terms: ['raw', 'button'],
    });
  });

  it('prints node impact graph context in JSON output', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await cmdGraph(testDir, {
      json: true,
      node: 'pat:existing-surface',
      impact: true,
      task: 'change existing surface',
    });

    const summary = JSON.parse(String(log.mock.calls.at(-1)?.[0])) as {
      impactContext?: {
        found?: boolean;
        node?: string;
        ranking?: { method?: string; seed?: string[]; task_keywords?: string[] };
        ids?: { routes?: string[]; pages?: string[]; patterns?: string[] };
        ranked?: Array<{ id: string; reason: string; matched_terms?: string[] }>;
      };
    };
    expect(summary.impactContext?.found).toBe(true);
    expect(summary.impactContext?.node).toBe('pat:existing-surface');
    expect(summary.impactContext?.ranking).toEqual({
      method: 'impact_traversal_with_task_boost',
      seed: ['pat:existing-surface'],
      task_keywords: ['change', 'existing', 'surface'],
    });
    expect(summary.impactContext?.ids?.routes).toContain('rt:/');
    expect(summary.impactContext?.ids?.pages).toContain('pg:app:home');
    expect(summary.impactContext?.ids?.patterns).toContain('pat:existing-surface');
    expect(summary.impactContext?.ranked?.[0]).toMatchObject({
      id: 'pat:existing-surface',
      reason: 'seed_node+task_match',
      matched_terms: ['existing', 'surface'],
    });
  });

  it('prints source-file impact graph context in JSON output', async () => {
    mkdirSync(join(testDir, 'src', 'app'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'components', 'ui'), { recursive: true });
    writeJson(join(testDir, 'tsconfig.json'), {
      compilerOptions: {
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*'],
        },
      },
    });
    writeFileSync(
      join(testDir, 'src', 'components', 'ui', 'Button.tsx'),
      'export function Button() { return <button />; }\n',
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'src', 'app', 'page.tsx'),
      'import { Button } from "@/components/ui/Button";\nexport default function Page() { return <main><Button /></main>; }\n',
      'utf-8',
    );
    writeJson(join(testDir, '.decantr', 'analysis.json'), {
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
        routes: [{ path: '/', file: 'src/app/page.tsx', hasLayout: false }],
      },
      styling: { approach: 'tailwind', cssVariables: [] },
      layout: { shellPattern: 'app-router' },
      features: { detected: ['auth'] },
    });
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const artifacts = buildGraphArtifacts(testDir);

    expect(artifacts?.snapshot.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: 'src:src/app/page.tsx',
          dst: 'src:src/components/ui/Button.tsx',
          relation: 'SOURCE_IMPORTS_SOURCE',
          payload: expect.objectContaining({
            source: '@/components/ui/Button',
            imported: ['Button'],
            localNames: ['Button'],
          }),
        }),
      ]),
    );

    await cmdGraph(testDir, {
      json: true,
      file: 'src/app/page.tsx',
      impact: true,
      task: 'edit page source surface',
    });

    const summary = JSON.parse(String(log.mock.calls.at(-1)?.[0])) as {
      impactContext?: {
        found?: boolean;
        file?: string;
        resolvedNodeIds?: string[];
        ranking?: { method?: string; seed?: string[]; task_keywords?: string[] };
        ids?: { routes?: string[]; pages?: string[]; sourceArtifacts?: string[] };
        ranked?: Array<{ id: string; reason: string; matched_terms?: string[] }>;
      };
    };
    expect(summary.impactContext?.found).toBe(true);
    expect(summary.impactContext?.file).toBe('src/app/page.tsx');
    expect(summary.impactContext?.resolvedNodeIds).toEqual(['src:src/app/page.tsx']);
    expect(summary.impactContext?.ranking).toMatchObject({
      method: 'impact_traversal_with_task_boost',
      seed: ['src:src/app/page.tsx'],
      task_keywords: ['edit', 'source', 'surface'],
    });
    expect(summary.impactContext?.ids?.routes).toContain('rt:/');
    expect(summary.impactContext?.ids?.pages).toContain('pg:app:home');
    expect(summary.impactContext?.ids?.sourceArtifacts).toContain('src:src/app/page.tsx');
    expect(summary.impactContext?.ids?.sourceArtifacts).toContain(
      'src:src/components/ui/Button.tsx',
    );
    expect(summary.impactContext?.ranked?.[0]).toMatchObject({
      id: 'src:src/app/page.tsx',
      reason: 'seed_node+task_match',
      matched_terms: ['source'],
    });
  });

  it('reads historical snapshots and compares graph snapshots in JSON output', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await cmdGraph(testDir, { json: true });
    const firstSummary = JSON.parse(String(log.mock.calls.at(-1)?.[0])) as {
      snapshot: { id: string };
    };
    const previousSnapshotId = firstSummary.snapshot.id;

    const essencePath = join(testDir, 'decantr.essence.json');
    const essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as {
      blueprint: {
        sections: Array<{ pages: Array<{ id: string; route: string; layout: string[] }> }>;
        routes: Record<string, { section: string; page: string }>;
      };
    };
    essence.blueprint.sections[0].pages.push({
      id: 'settings',
      route: '/settings',
      layout: ['settings-panel'],
    });
    essence.blueprint.routes['/settings'] = { section: 'app', page: 'settings' };
    writeJson(essencePath, essence);

    log.mockClear();
    await cmdGraph(testDir, {
      json: true,
      compareTo: previousSnapshotId,
      includeDiffOps: true,
      limit: 2,
    });
    const comparisonSummary = JSON.parse(String(log.mock.calls.at(-1)?.[0])) as {
      snapshot: { id: string };
      selectedSnapshot: { selector: string; id: string };
      comparison: {
        from: string;
        to: string;
        summary: { total: number; by_type: Record<string, number> };
        ops: unknown[];
        truncated: boolean;
        limit: number;
      };
    };

    expect(comparisonSummary.selectedSnapshot.selector).toBe('current');
    expect(comparisonSummary.comparison.from).toBe(previousSnapshotId);
    expect(comparisonSummary.comparison.to).toBe(comparisonSummary.snapshot.id);
    expect(comparisonSummary.comparison.summary.total).toBeGreaterThan(0);
    expect(comparisonSummary.comparison.summary.by_type['node.added']).toBeGreaterThan(0);
    expect(comparisonSummary.comparison.ops).toHaveLength(2);
    expect(comparisonSummary.comparison.limit).toBe(2);
    expect(comparisonSummary.comparison.truncated).toBe(true);

    log.mockClear();
    await cmdGraph(testDir, {
      json: true,
      snapshotId: previousSnapshotId,
      route: '/',
      task: 'button',
    });
    const historicalSummary = JSON.parse(String(log.mock.calls.at(-1)?.[0])) as {
      selectedSnapshot: { selector: string; id: string };
      routeContext: { snapshotId: string; found: boolean };
    };
    expect(historicalSummary.selectedSnapshot).toMatchObject({
      selector: previousSnapshotId,
      id: previousSnapshotId,
    });
    expect(historicalSummary.routeContext).toMatchObject({
      found: true,
      snapshotId: previousSnapshotId,
    });
  });

  it('ingests visual manifest screenshots as route evidence nodes', () => {
    mkdirSync(join(testDir, '.decantr', 'evidence', 'screenshots'), { recursive: true });
    writeFileSync(join(testDir, '.decantr', 'evidence', 'screenshots', 'root.png'), 'screenshot');
    writeJson(join(testDir, '.decantr', 'evidence', 'visual-manifest.json'), {
      version: 1,
      generatedAt: '2026-05-21T14:00:00.000Z',
      localOnly: true,
      baseUrl: 'http://127.0.0.1:3000',
      routes: [
        {
          route: '/',
          url: 'http://127.0.0.1:3000/',
          screenshot: '.decantr/evidence/screenshots/root.png',
          screenshotHash: 'sha256:root',
          status: 'captured',
        },
      ],
    });

    const artifacts = buildGraphArtifacts(testDir);

    expect(artifacts?.manifest.sources.map((source) => source.id)).toEqual(
      expect.arrayContaining([
        'src:.decantr/evidence/visual-manifest.json',
        'src:.decantr/evidence/screenshots/root.png',
      ]),
    );
    expect(artifacts?.snapshot.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'ev:visual:root',
          type: 'Evidence',
          payload: expect.objectContaining({
            route: '/',
            screenshot: '.decantr/evidence/screenshots/root.png',
            status: 'captured',
          }),
        }),
      ]),
    );
    expect(artifacts?.snapshot.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: 'ev:visual:root',
          dst: 'rt:/',
          relation: 'EVIDENCE_CAPTURED_FOR',
        }),
        expect.objectContaining({
          src: 'ev:visual:root',
          dst: 'pg:app:home',
          relation: 'EVIDENCE_CAPTURED_FOR',
        }),
      ]),
    );
    expect(artifacts?.snapshot.summary.evidence).toBe(1);
  });

  it('ingests saved evidence bundle findings as graph finding evidence and repair nodes', () => {
    mkdirSync(join(testDir, '.decantr', 'evidence'), { recursive: true });
    mkdirSync(join(testDir, 'src'), { recursive: true });
    writeFileSync(
      join(testDir, 'src', 'App.tsx'),
      'export function App() { return <button />; }\n',
    );
    writeJson(join(testDir, '.decantr', 'evidence', 'latest.json'), {
      $schema: 'https://decantr.ai/schemas/evidence-bundle.v1.json',
      generatedAt: '2026-05-21T14:00:00.000Z',
      health: {
        status: 'warning',
        score: 92,
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
            snapshot_id: 'graph:previous',
            source_hash: 'sha256:previous',
            node_id: 'rule:no-raw-button',
            node_type: 'LocalRule',
            confidence: 'exact',
            reason: 'rule id matched a LocalRule node',
          },
          repair: {
            id: 'replace-raw-control-with-local-component',
            payload: { component: 'Button' },
          },
          repairPlan: {
            id: 'repair-plan:check-no-raw-button',
            actions: [{ id: 'replace-raw-control-with-local-component' }],
            readTargets: ['src/App.tsx'],
            commands: ['decantr health'],
          },
          remediationSummary: 'Use the local Button primitive.',
          commands: ['decantr health'],
          promptCommand: 'decantr health --prompt check-no-raw-button',
        },
      ],
    });

    const artifacts = buildGraphArtifacts(testDir);

    expect(artifacts?.manifest.sources.map((source) => source.id)).toContain(
      'src:.decantr/evidence/latest.json',
    );
    expect(artifacts?.manifest.sources.map((source) => source.id)).toContain('src:src/App.tsx');
    expect(artifacts?.snapshot.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'find:check-no-raw-button',
          type: 'Finding',
          payload: expect.objectContaining({
            code: 'RULE001',
            repair_id: 'replace-raw-control-with-local-component',
            anchored_at: 'rule:no-raw-button',
          }),
        }),
        expect.objectContaining({
          id: 'ev:finding:check-no-raw-button:1',
          type: 'Evidence',
          payload: expect.objectContaining({ text: 'src/App.tsx:12 uses <button>' }),
        }),
        expect.objectContaining({
          id: 'repair:replace-raw-control-with-local-component',
          type: 'Repair',
        }),
        expect.objectContaining({
          id: 'src:.decantr/evidence/latest.json',
          type: 'SourceArtifact',
          payload: expect.objectContaining({
            payload: expect.objectContaining({
              graphSnapshotPresent: true,
              graphSnapshotHash: 'sha256:snapshot',
              contractCapsulePresent: true,
              contractCapsuleHash: 'sha256:capsule',
            }),
          }),
        }),
      ]),
    );
    expect(artifacts?.snapshot.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: 'find:check-no-raw-button',
          dst: 'rule:no-raw-button',
          relation: 'FINDING_ANCHORED_AT',
        }),
        expect.objectContaining({
          src: 'find:check-no-raw-button',
          dst: 'rule:no-raw-button',
          relation: 'FINDING_VIOLATES_RULE',
        }),
        expect.objectContaining({
          src: 'ev:finding:check-no-raw-button:1',
          dst: 'find:check-no-raw-button',
          relation: 'EVIDENCE_SUPPORTS_FINDING',
        }),
        expect.objectContaining({
          src: 'repair:replace-raw-control-with-local-component',
          dst: 'find:check-no-raw-button',
          relation: 'REPAIR_FIXES_FINDING',
        }),
      ]),
    );
    expect(artifacts?.capsule.open_findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'find:check-no-raw-button',
          code: 'RULE001',
          anchored_at: 'rule:no-raw-button',
        }),
      ]),
    );
  });

  it('anchors evidence bundle findings to source artifacts when graph anchors are missing', () => {
    mkdirSync(join(testDir, '.decantr', 'evidence'), { recursive: true });
    mkdirSync(join(testDir, 'src'), { recursive: true });
    writeFileSync(join(testDir, 'src', 'styles.css'), '.surface { color: #fff; }\n');
    writeJson(join(testDir, '.decantr', 'evidence', 'latest.json'), {
      generatedAt: '2026-05-21T14:00:00.000Z',
      health: {
        status: 'warning',
        score: 92,
        errorCount: 0,
        warnCount: 1,
        infoCount: 0,
        findingCount: 1,
      },
      findings: [
        {
          id: 'source-backed-finding',
          code: 'SRC001',
          source: 'check',
          category: 'Source',
          severity: 'warn',
          message: 'Source file needs repair.',
          evidence: ['src/styles.css:1 uses a generic placeholder surface'],
          remediationSummary: 'Update the source file.',
          commands: ['decantr health'],
          promptCommand: 'decantr health --prompt source-backed-finding',
          repairPlan: {
            id: 'repair-plan:source-backed-finding',
            actions: [{ id: 'update-source' }],
            readTargets: ['src/styles.css'],
            commands: ['decantr health'],
          },
        },
      ],
    });

    const artifacts = buildGraphArtifacts(testDir);

    expect(artifacts?.snapshot.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'src:src/styles.css',
          type: 'SourceArtifact',
          payload: expect.objectContaining({
            kind: 'finding-source',
            path: 'src/styles.css',
            payload: expect.objectContaining({
              findings: ['source-backed-finding'],
              codes: ['SRC001'],
            }),
          }),
        }),
        expect.objectContaining({
          id: 'find:source-backed-finding',
          type: 'Finding',
          payload: expect.objectContaining({
            code: 'SRC001',
            anchored_at: 'src:src/styles.css',
          }),
        }),
      ]),
    );
    expect(artifacts?.snapshot.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: 'find:source-backed-finding',
          dst: 'src:src/styles.css',
          relation: 'FINDING_ANCHORED_AT',
          payload: expect.objectContaining({ confidence: 'inferred' }),
        }),
      ]),
    );
    expect(artifacts?.capsule.open_findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'find:source-backed-finding',
          code: 'SRC001',
          anchored_at: 'src:src/styles.css',
        }),
      ]),
    );
    expect(artifacts?.capsule.source_artifacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'src:src/styles.css',
          path: 'src/styles.css',
          kind: 'finding-source',
        }),
      ]),
    );
  });

  it('ingests health baseline diffs as temporal evidence nodes', () => {
    mkdirSync(join(testDir, '.decantr', 'evidence'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'app'), { recursive: true });
    writeFileSync(join(testDir, 'src', 'app', 'page.tsx'), 'export default function Page() {}\n');
    writeJson(join(testDir, '.decantr', 'evidence', 'visual-manifest.json'), {
      version: 1,
      generatedAt: '2026-05-21T14:00:00.000Z',
      localOnly: true,
      baseUrl: 'http://127.0.0.1:3000',
      routes: [
        {
          route: '/',
          url: 'http://127.0.0.1:3000/',
          screenshot: '.decantr/evidence/screenshots/root.png',
          screenshotHash: 'sha256:root',
          status: 'captured',
        },
      ],
    });
    writeJson(join(testDir, '.decantr', 'health-baseline-diff.json'), {
      baselinePath: join(testDir, '.decantr', 'health-baseline.json'),
      savedAt: '2026-05-21T13:00:00.000Z',
      statusChanged: false,
      scoreDelta: -3,
      addedFindings: ['component-reuse-raw-control'],
      resolvedFindings: [],
      changedFiles: ['src/app/page.tsx'],
      changedRoutes: ['/'],
      changedScreenshots: ['.decantr/evidence/screenshots/root.png'],
      contractDrift: ['Declared route set changed since baseline.'],
    });

    const artifacts = buildGraphArtifacts(testDir);

    expect(artifacts?.manifest.sources.map((source) => source.id)).toContain(
      'src:.decantr/health-baseline-diff.json',
    );
    expect(artifacts?.manifest.sources.map((source) => source.id)).toContain(
      'src:src/app/page.tsx',
    );
    expect(artifacts?.snapshot.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'ev:baseline:file:src/app/page.tsx',
          type: 'Evidence',
          payload: expect.objectContaining({
            kind: 'baseline-file-impact',
            file: 'src/app/page.tsx',
          }),
        }),
        expect.objectContaining({
          id: 'ev:baseline:route:/',
          type: 'Evidence',
          payload: expect.objectContaining({ kind: 'baseline-route-impact', route: '/' }),
        }),
        expect.objectContaining({
          id: 'ev:baseline:screenshot:1',
          type: 'Evidence',
          payload: expect.objectContaining({
            kind: 'baseline-screenshot-drift',
            screenshot: '.decantr/evidence/screenshots/root.png',
            route: '/',
          }),
        }),
        expect.objectContaining({
          id: 'ev:baseline:contract:1',
          type: 'Evidence',
          payload: expect.objectContaining({
            kind: 'baseline-contract-drift',
            text: 'Declared route set changed since baseline.',
          }),
        }),
      ]),
    );
    expect(artifacts?.snapshot.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: 'ev:baseline:file:src/app/page.tsx',
          dst: 'src:src/app/page.tsx',
          relation: 'EVIDENCE_CAPTURED_FOR',
        }),
        expect.objectContaining({
          src: 'ev:baseline:route:/',
          dst: 'rt:/',
          relation: 'EVIDENCE_CAPTURED_FOR',
        }),
        expect.objectContaining({
          src: 'ev:baseline:screenshot:1',
          dst: 'rt:/',
          relation: 'EVIDENCE_CAPTURED_FOR',
        }),
        expect.objectContaining({
          src: 'ev:baseline:contract:1',
          dst: 'proj:default',
          relation: 'EVIDENCE_CAPTURED_FOR',
        }),
      ]),
    );
    expect(artifacts?.snapshot.summary.evidence).toBeGreaterThanOrEqual(4);
  });

  it('ingests brownfield analysis route source files as graph provenance', () => {
    mkdirSync(join(testDir, 'src', 'app'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'components', 'ui'), { recursive: true });
    writeFileSync(join(testDir, 'src', 'app', 'page.tsx'), 'export default function Page() {}\n');
    writeFileSync(
      join(testDir, 'src', 'components', 'ui', 'Button.tsx'),
      'export function Button() { return <button />; }\n',
    );
    writeJson(join(testDir, '.decantr', 'analysis.json'), {
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
        routes: [{ path: '/', file: 'src/app/page.tsx', hasLayout: false }],
      },
      styling: { approach: 'tailwind', cssVariables: [] },
      layout: { shellPattern: 'app-router' },
      features: { detected: ['auth'] },
    });

    const artifacts = buildGraphArtifacts(testDir);

    expect(artifacts?.manifest.sources.map((source) => source.id)).toEqual(
      expect.arrayContaining([
        'src:.decantr/analysis.json',
        'src:src/app/page.tsx',
        'src:src/components/ui/Button.tsx',
      ]),
    );
    expect(artifacts?.snapshot.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'src:src/app/page.tsx',
          type: 'SourceArtifact',
          payload: expect.objectContaining({
            kind: 'route-source',
            path: 'src/app/page.tsx',
            payload: expect.objectContaining({ route: '/', strategy: 'app-router' }),
          }),
        }),
        expect.objectContaining({
          id: 'cmp:button',
          type: 'Component',
          payload: expect.objectContaining({
            name: 'Button',
            source: 'code',
          }),
        }),
      ]),
    );
    expect(artifacts?.snapshot.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: 'rt:/',
          dst: 'src:src/app/page.tsx',
          relation: 'NODE_DERIVED_FROM_SOURCE',
          payload: expect.objectContaining({ role: 'route-implementation' }),
        }),
        expect.objectContaining({
          src: 'pg:app:home',
          dst: 'src:src/app/page.tsx',
          relation: 'NODE_DERIVED_FROM_SOURCE',
          payload: expect.objectContaining({ role: 'page-implementation' }),
        }),
        expect.objectContaining({
          src: 'cmp:button',
          dst: 'src:src/components/ui/Button.tsx',
          relation: 'NODE_DERIVED_FROM_SOURCE',
          payload: expect.objectContaining({ role: 'component-implementation' }),
        }),
      ]),
    );
  });

  it('does not mark graph artifacts stale for timestamp-only analysis churn', async () => {
    mkdirSync(join(testDir, 'src', 'app'), { recursive: true });
    writeFileSync(join(testDir, 'src', 'app', 'page.tsx'), 'export default function Page() {}\n');
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
        routes: [{ path: '/', file: 'src/app/page.tsx', hasLayout: false }],
      },
      styling: { approach: 'tailwind', cssVariables: [] },
      layout: { shellPattern: 'app-router' },
      features: { detected: ['auth'] },
    };
    writeJson(join(testDir, '.decantr', 'analysis.json'), analysis);

    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await cmdGraph(testDir, { json: true });

    writeJson(join(testDir, '.decantr', 'analysis.json'), {
      ...analysis,
      analyzedAt: '2026-05-21T14:05:00.000Z',
    });

    expect(buildGraphArtifacts(testDir)?.staleArtifacts).toEqual([]);
  });

  it('marks graph artifacts stale when reusable component source changes', async () => {
    mkdirSync(join(testDir, 'src', 'components', 'ui'), { recursive: true });
    const componentPath = join(testDir, 'src', 'components', 'ui', 'Button.tsx');
    writeFileSync(componentPath, 'export function Button() { return <button />; }\n');

    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await cmdGraph(testDir, { json: true });

    writeFileSync(
      componentPath,
      'export function Button() { return <button data-state="changed" />; }\n',
    );

    expect(
      buildGraphArtifacts(testDir)?.staleArtifacts.map((path) => path.replace(testDir, '')),
    ).toEqual(
      expect.arrayContaining([
        '/.decantr/graph/graph.snapshot.json',
        '/.decantr/graph/graph.manifest.json',
        '/.decantr/graph/graph.diff.json',
      ]),
    );
  });

  it('does not mark graph artifacts stale for timestamp-only evidence churn', async () => {
    mkdirSync(join(testDir, '.decantr', 'evidence'), { recursive: true });
    const visualManifest = {
      version: 1,
      generatedAt: '2026-05-21T14:00:00.000Z',
      localOnly: true,
      baseUrl: 'http://127.0.0.1:3000',
      routes: [
        {
          route: '/',
          url: 'http://127.0.0.1:3000/',
          screenshot: null,
          screenshotHash: null,
          status: 'captured',
        },
      ],
    };
    const evidenceBundle = {
      generatedAt: '2026-05-21T14:00:00.000Z',
      health: {
        status: 'healthy',
        score: 100,
        errorCount: 0,
        warnCount: 0,
        infoCount: 0,
        findingCount: 0,
      },
      provenance: {
        graphSnapshot: {
          path: '.decantr/graph/graph.snapshot.json',
          present: false,
          hash: null,
          generatedAt: null,
        },
        contractCapsule: {
          path: '.decantr/graph/contract-capsule.json',
          present: false,
          hash: null,
          generatedAt: null,
        },
      },
      findings: [],
    };
    writeJson(join(testDir, '.decantr', 'evidence', 'visual-manifest.json'), visualManifest);
    writeJson(join(testDir, '.decantr', 'evidence', 'latest.json'), evidenceBundle);

    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await cmdGraph(testDir, { json: true });

    writeJson(join(testDir, '.decantr', 'evidence', 'visual-manifest.json'), {
      ...visualManifest,
      generatedAt: '2026-05-21T14:05:00.000Z',
    });
    writeJson(join(testDir, '.decantr', 'evidence', 'latest.json'), {
      ...evidenceBundle,
      generatedAt: '2026-05-21T14:05:00.000Z',
      provenance: {
        graphSnapshot: {
          ...evidenceBundle.provenance.graphSnapshot,
          generatedAt: '2026-05-21T14:05:00.000Z',
        },
        contractCapsule: {
          ...evidenceBundle.provenance.contractCapsule,
          generatedAt: '2026-05-21T14:05:00.000Z',
        },
      },
    });

    expect(buildGraphArtifacts(testDir)?.staleArtifacts).toEqual([]);
  });

  it('marks graph artifacts stale when evidence bundle graph provenance changes', async () => {
    mkdirSync(join(testDir, '.decantr', 'evidence'), { recursive: true });
    const evidenceBundle = {
      generatedAt: '2026-05-21T14:00:00.000Z',
      health: {
        status: 'healthy',
        score: 100,
        errorCount: 0,
        warnCount: 0,
        infoCount: 0,
        findingCount: 0,
      },
      provenance: {
        graphSnapshot: {
          path: '.decantr/graph/graph.snapshot.json',
          present: true,
          hash: 'sha256:before',
          generatedAt: '2026-05-21T14:00:00.000Z',
        },
        contractCapsule: {
          path: '.decantr/graph/contract-capsule.json',
          present: true,
          hash: 'sha256:capsule',
          generatedAt: '2026-05-21T14:00:00.000Z',
        },
      },
      findings: [],
    };
    writeJson(join(testDir, '.decantr', 'evidence', 'latest.json'), evidenceBundle);

    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await cmdGraph(testDir, { json: true });

    writeJson(join(testDir, '.decantr', 'evidence', 'latest.json'), {
      ...evidenceBundle,
      provenance: {
        ...evidenceBundle.provenance,
        graphSnapshot: {
          ...evidenceBundle.provenance.graphSnapshot,
          hash: 'sha256:after',
        },
      },
    });

    expect(
      buildGraphArtifacts(testDir)?.staleArtifacts.some((artifact) =>
        artifact.endsWith('/.decantr/graph/graph.snapshot.json'),
      ),
    ).toBe(true);
  });

  it('marks graph artifacts stale when evidence bundle repair targets change', async () => {
    mkdirSync(join(testDir, '.decantr', 'evidence'), { recursive: true });
    mkdirSync(join(testDir, 'src'), { recursive: true });
    writeFileSync(join(testDir, 'src', 'styles.css'), '.surface { color: #fff; }\n');
    writeFileSync(join(testDir, 'src', 'alternate.css'), '.surface { color: #111; }\n');
    const evidenceBundle = {
      generatedAt: '2026-05-21T14:00:00.000Z',
      health: {
        status: 'warning',
        score: 98,
        errorCount: 0,
        warnCount: 1,
        infoCount: 0,
        findingCount: 1,
      },
      findings: [
        {
          id: 'style-target',
          code: 'SRC001',
          source: 'check',
          category: 'Source',
          severity: 'warn',
          message: 'Style target needs repair.',
          evidence: ['src/styles.css:1 hardcoded color'],
          remediationSummary: 'Update the style source.',
          commands: ['decantr health'],
          promptCommand: 'decantr health --prompt style-target',
          repairPlan: {
            id: 'repair-plan:style-target',
            actions: [{ id: 'update-source' }],
            readTargets: ['src/styles.css'],
            commands: ['decantr health'],
          },
        },
      ],
    };
    writeJson(join(testDir, '.decantr', 'evidence', 'latest.json'), evidenceBundle);

    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await cmdGraph(testDir, { json: true });

    writeJson(join(testDir, '.decantr', 'evidence', 'latest.json'), {
      ...evidenceBundle,
      generatedAt: '2026-05-21T14:05:00.000Z',
      findings: evidenceBundle.findings.map((finding) => ({
        ...finding,
        repairPlan: {
          ...finding.repairPlan,
          readTargets: ['src/alternate.css'],
        },
      })),
    });

    expect(
      buildGraphArtifacts(testDir)?.staleArtifacts.map((path) => path.replace(testDir, '')),
    ).toEqual(
      expect.arrayContaining([
        '/.decantr/graph/graph.snapshot.json',
        '/.decantr/graph/graph.manifest.json',
        '/.decantr/graph/graph.diff.json',
      ]),
    );
  });
});
