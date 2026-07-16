import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { EssenceV4 } from '@decantr/essence-spec';
import { describe, expect, it } from 'vitest';
import {
  buildChangedFileGraphImpact,
  buildContractCapsuleFromSnapshot,
  buildGraphImpactContext,
  buildGraphRouteContext,
  buildGraphSnapshotFromEssence,
  buildGraphSnapshotFromIR,
  CONTRACT_CAPSULE_SCHEMA_URL,
  createMemoryGraphStore,
  DEFAULT_CONTRACT_CAPSULE_SOURCE_ARTIFACT_LIMIT,
  diffGraphSnapshots,
  GRAPH_COMMON_SCHEMA_URL,
  GRAPH_DIFF_SCHEMA_URL,
  GRAPH_MANIFEST_SCHEMA_URL,
  GRAPH_SCHEMA_VERSION,
  GRAPH_SNAPSHOT_SCHEMA_URL,
  type GraphSnapshot,
  graphContractHash,
  type IRAppNode,
  normalizeGraphSnapshot,
  summarizeGraphDiff,
} from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, '..');

describe('typed graph foundation', () => {
  it('publishes graph artifact schemas from the core package', () => {
    const expectedSchemas = [
      [GRAPH_COMMON_SCHEMA_URL, 'graph.common.v1.json'],
      [GRAPH_SNAPSHOT_SCHEMA_URL, 'graph-snapshot.v1.json'],
      [GRAPH_MANIFEST_SCHEMA_URL, 'graph-manifest.v1.json'],
      [GRAPH_DIFF_SCHEMA_URL, 'graph-diff.v1.json'],
      [CONTRACT_CAPSULE_SCHEMA_URL, 'contract-capsule.v1.json'],
    ];

    for (const [schemaUrl, file] of expectedSchemas) {
      const schemaPath = join(packageRoot, 'schema', file);
      expect(existsSync(schemaPath), file).toBe(true);
      expect(JSON.parse(readFileSync(schemaPath, 'utf-8')).$id).toBe(schemaUrl);
    }
  });

  it('derives a contract graph snapshot from existing IR', () => {
    const ir: IRAppNode = {
      type: 'app',
      id: 'app',
      children: [
        {
          type: 'page',
          id: 'dashboard:settings',
          pageId: 'settings',
          sectionId: 'dashboard',
          surface: 'main',
          children: [
            {
              type: 'pattern',
              id: 'settings-form',
              children: [],
              pattern: {
                patternId: 'form-sections',
                preset: 'settings',
                alias: 'settings-form',
                layout: 'stack',
                contained: true,
                standalone: false,
                code: null,
                components: ['Button', 'Input'],
              },
              card: null,
              visualEffects: null,
              wireProps: null,
            },
          ],
          wiring: null,
        },
      ],
      theme: { id: 'auradecantism', mode: 'dark', shape: 'rounded', isAddon: false },
      routes: [
        { path: '/settings', pageId: 'settings', sectionId: 'dashboard', shell: 'sidebar-main' },
      ],
      routing: 'history',
      shell: {
        type: 'shell',
        id: 'shell',
        children: [],
        config: {
          type: 'sidebar-main',
          brand: 'Acme',
          nav: [{ href: '/settings', icon: 'settings', label: 'Settings' }],
          inset: true,
          decoration: null,
        },
      },
      store: { type: 'store', id: 'store', children: [], pageSignals: [] },
      features: ['auth'],
    };

    const snapshot = buildGraphSnapshotFromIR(ir, {
      sourceArtifact: {
        id: 'src:decantr.essence.json',
        kind: 'essence',
        path: 'decantr.essence.json',
      },
    });

    expect(snapshot.$schema).toBe(GRAPH_SNAPSHOT_SCHEMA_URL);
    expect(snapshot.nodes.map((node) => node.id)).toContain('pg:dashboard:settings');
    expect(snapshot.nodes.map((node) => node.id)).toContain('cmp:button');
    expect(snapshot.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: 'pg:dashboard:settings',
          dst: 'rt:/settings',
          relation: 'PAGE_ROUTED_AT_ROUTE',
        }),
        expect.objectContaining({
          src: 'pat:form-sections',
          dst: 'cmp:button',
          relation: 'PATTERN_NEEDS_COMPONENT',
        }),
        expect.objectContaining({
          relation: 'NODE_DERIVED_FROM_SOURCE',
          dst: 'src:decantr.essence.json',
        }),
      ]),
    );
  });

  it('derives an offline graph snapshot directly from Essence v4', () => {
    const essence = {
      version: '4.0.0',
      dna: {
        theme: { id: 'clean', mode: 'light', shape: 'rounded' },
        spacing: {
          base_unit: 4,
          scale: 'standard',
          density: 'comfortable',
          content_gap: '1rem',
        },
        typography: { scale: 'system', heading_weight: 650, body_weight: 400 },
        color: { palette: 'neutral', accent_count: 1, cvd_preference: 'none' },
        radius: { philosophy: 'rounded', base: 8 },
        elevation: { system: 'soft', max_levels: 3 },
        motion: { preference: 'subtle', duration_scale: 1, reduce_motion: false },
        accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
        personality: ['calm'],
      },
      blueprint: {
        features: ['auth'],
        routes: { '/dashboard': { section: 'app', page: 'dashboard' } },
        sections: [
          {
            id: 'app',
            role: 'primary',
            shell: 'sidebar-main',
            features: ['auth'],
            description: 'Application workspace.',
            pages: [
              {
                id: 'dashboard',
                layout: [
                  'hero-summary',
                  { cols: ['stat-card', { pattern: 'data-table', as: 'results-table' }] },
                ],
                surface: 'main',
              },
            ],
          },
        ],
      },
      meta: {
        archetype: 'saas',
        target: 'react',
        platform: { type: 'spa', routing: 'history' },
        guard: {
          mode: 'strict',
          dna_enforcement: 'error',
          blueprint_enforcement: 'warn',
        },
      },
    } satisfies EssenceV4;

    const snapshot = buildGraphSnapshotFromEssence(essence, {
      sourceArtifact: {
        id: 'src:decantr.essence.json',
        kind: 'essence',
        path: 'decantr.essence.json',
      },
    });

    expect(snapshot.nodes.map((node) => node.id)).toEqual(
      expect.arrayContaining([
        'proj:default',
        'theme:clean',
        'feat:auth',
        'sec:app',
        'sh:sidebar-main',
        'pg:app:dashboard',
        'rt:/dashboard',
        'pat:hero-summary',
        'pat:stat-card',
        'pat:data-table',
      ]),
    );
    expect(snapshot.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: 'proj:default',
          dst: 'theme:clean',
          relation: 'PROJECT_USES_THEME',
        }),
        expect.objectContaining({
          src: 'proj:default',
          dst: 'feat:auth',
          relation: 'PROJECT_ENABLES_FEATURE',
        }),
        expect.objectContaining({
          src: 'pg:app:dashboard',
          dst: 'rt:/dashboard',
          relation: 'PAGE_ROUTED_AT_ROUTE',
        }),
        expect.objectContaining({
          src: 'pg:app:dashboard',
          dst: 'pat:data-table',
          relation: 'PAGE_COMPOSES_PATTERN',
          payload: expect.objectContaining({ alias: 'results-table' }),
        }),
      ]),
    );
  });

  it('stores graph nodes and traverses scoped relationships', async () => {
    const store = createMemoryGraphStore();
    await store.open('/workspace');

    await store.upsertNode({ id: 'rt:/settings', type: 'Route', payload: { path: '/settings' } });
    await store.upsertNode({ id: 'pg:settings', type: 'Page', payload: { label: 'Settings' } });
    await store.upsertNode({
      id: 'sh:settings-shell',
      type: 'Shell',
      payload: { kind: 'sidebar' },
    });
    await store.upsertEdge({
      src: 'pg:settings',
      dst: 'rt:/settings',
      relation: 'PAGE_ROUTED_AT_ROUTE',
    });
    await store.upsertEdge({
      src: 'pg:settings',
      dst: 'sh:settings-shell',
      relation: 'PAGE_USES_SHELL',
    });

    const subgraph = await store.traverse({
      from: 'pg:settings',
      direction: 'out',
      depth: 1,
    });

    expect(subgraph.nodes.map((node) => node.id)).toEqual([
      'pg:settings',
      'rt:/settings',
      'sh:settings-shell',
    ]);
    expect(subgraph.edges.map((edge) => edge.relation)).toEqual([
      'PAGE_ROUTED_AT_ROUTE',
      'PAGE_USES_SHELL',
    ]);
  });

  it('queries graph nodes by payload key and text', async () => {
    const store = createMemoryGraphStore({
      nodes: [
        {
          id: 'find:raw-button',
          type: 'Finding',
          payload: {
            code: 'COMP010',
            message: 'Raw button usage violates local law.',
            repair: { id: 'replace-raw-control-with-local-component' },
          },
        },
        {
          id: 'find:graph-stale',
          type: 'Finding',
          payload: { code: 'GRAPH001', message: 'Typed graph artifacts are stale.' },
        },
        { id: 'cmp:button', type: 'Component', payload: { name: 'Button' } },
      ],
    });

    await expect(
      store.queryNodes({ type: 'Finding', payloadKey: 'code', payloadValue: 'COMP010' }),
    ).resolves.toMatchObject([{ id: 'find:raw-button' }]);
    await expect(
      store.queryNodes({ type: 'Finding', payloadKey: 'repair.id' }),
    ).resolves.toMatchObject([{ id: 'find:raw-button' }]);
    await expect(store.queryNodes({ payloadContains: 'local law' })).resolves.toMatchObject([
      { id: 'find:raw-button' },
    ]);
  });

  it('extracts route-scoped graph context with local law and findings', () => {
    const snapshot: GraphSnapshot = {
      id: 'graph:route',
      schema_version: GRAPH_SCHEMA_VERSION,
      project_id: 'proj:default',
      created_at: '2026-05-21T00:00:00.000Z',
      source_hash: 'sha256:route',
      nodes: [
        { id: 'rt:/settings', type: 'Route', payload: { path: '/settings' } },
        { id: 'pg:settings', type: 'Page', payload: { id: 'settings' } },
        { id: 'sh:settings', type: 'Shell', payload: { id: 'settings' } },
        { id: 'pat:settings-form', type: 'Pattern', payload: { id: 'settings-form' } },
        { id: 'cmp:button', type: 'Component', payload: { name: 'Button' } },
        { id: 'rule:no-raw-button', type: 'LocalRule', payload: { id: 'no-raw-button' } },
        { id: 'find:COMP001:button', type: 'Finding', payload: { code: 'COMP001' } },
        {
          id: 'find:SRC001:settings-page',
          type: 'Finding',
          payload: { code: 'SRC001', anchored_at: 'src:src/app/settings/page.tsx' },
        },
        { id: 'ev:ast:button', type: 'Evidence', payload: { path: 'src/App.tsx' } },
        {
          id: 'ev:src:settings-page',
          type: 'Evidence',
          payload: { path: 'src/app/settings/page.tsx' },
        },
        {
          id: 'ev:visual:settings',
          type: 'Evidence',
          payload: { screenshot: '.decantr/evidence/screenshots/settings.png' },
        },
        {
          id: 'src:.decantr/evidence/visual-manifest.json',
          type: 'SourceArtifact',
          payload: { path: '.decantr/evidence/visual-manifest.json' },
        },
        {
          id: 'src:src/app/settings/page.tsx',
          type: 'SourceArtifact',
          payload: { kind: 'route-source', path: 'src/app/settings/page.tsx' },
        },
        { id: 'cmp:settingsfilter', type: 'Component', payload: { name: 'SettingsFilter' } },
      ],
      edges: [
        { src: 'pg:settings', dst: 'rt:/settings', relation: 'PAGE_ROUTED_AT_ROUTE' },
        { src: 'pg:settings', dst: 'sh:settings', relation: 'PAGE_USES_SHELL' },
        { src: 'pg:settings', dst: 'pat:settings-form', relation: 'PAGE_COMPOSES_PATTERN' },
        {
          src: 'pg:settings',
          dst: 'src:src/app/settings/page.tsx',
          relation: 'NODE_DERIVED_FROM_SOURCE',
        },
        {
          src: 'rt:/settings',
          dst: 'src:src/app/settings/page.tsx',
          relation: 'NODE_DERIVED_FROM_SOURCE',
        },
        {
          src: 'cmp:settingsfilter',
          dst: 'src:src/app/settings/page.tsx',
          relation: 'NODE_DERIVED_FROM_SOURCE',
        },
        { src: 'pat:settings-form', dst: 'cmp:button', relation: 'PATTERN_NEEDS_COMPONENT' },
        { src: 'rule:no-raw-button', dst: 'cmp:button', relation: 'LOCAL_RULE_APPLIES_TO' },
        { src: 'find:COMP001:button', dst: 'cmp:button', relation: 'FINDING_ANCHORED_AT' },
        {
          src: 'find:SRC001:settings-page',
          dst: 'src:src/app/settings/page.tsx',
          relation: 'FINDING_ANCHORED_AT',
        },
        { src: 'ev:ast:button', dst: 'find:COMP001:button', relation: 'EVIDENCE_SUPPORTS_FINDING' },
        {
          src: 'ev:src:settings-page',
          dst: 'find:SRC001:settings-page',
          relation: 'EVIDENCE_SUPPORTS_FINDING',
        },
        { src: 'ev:visual:settings', dst: 'rt:/settings', relation: 'EVIDENCE_CAPTURED_FOR' },
        {
          src: 'ev:visual:settings',
          dst: 'src:.decantr/evidence/visual-manifest.json',
          relation: 'NODE_DERIVED_FROM_SOURCE',
        },
      ],
      summary: { nodes: 0, edges: 0, findings: 0, evidence: 0 },
    };

    const context = buildGraphRouteContext(snapshot, '/settings');

    expect(context?.snapshotId).toBe('graph:route');
    expect(context?.ids.patterns).toEqual(['pat:settings-form']);
    expect(context?.ids.components).toEqual(['cmp:button', 'cmp:settingsfilter']);
    expect(context?.ids.localRules).toEqual(['rule:no-raw-button']);
    expect(context?.ids.openFindings).toEqual(['find:COMP001:button', 'find:SRC001:settings-page']);
    expect(context?.ids.evidence).toEqual([
      'ev:ast:button',
      'ev:src:settings-page',
      'ev:visual:settings',
    ]);
    expect(context?.ids.sourceArtifacts).toEqual([
      'src:.decantr/evidence/visual-manifest.json',
      'src:src/app/settings/page.tsx',
    ]);
    expect(context?.ranked.slice(0, 4)).toEqual([
      { id: 'rt:/settings', type: 'Route', score: 1, reason: 'requested_route+pagerank' },
      { id: 'pg:settings', type: 'Page', score: 0.853, reason: 'route_page+pagerank' },
      { id: 'sh:settings', type: 'Shell', score: 0.632, reason: 'route_shell+pagerank' },
      { id: 'pat:settings-form', type: 'Pattern', score: 0.603, reason: 'page_pattern+pagerank' },
    ]);
    expect(context?.summary).toMatchObject({
      pages: 1,
      patterns: 1,
      components: 2,
      localRules: 1,
      openFindings: 2,
      evidence: 3,
      sourceArtifacts: 2,
    });

    const taskContext = buildGraphRouteContext(snapshot, '/settings', {
      task: 'Update the settings filter and source evidence.',
    });
    expect(taskContext?.ranking).toEqual({
      method: 'hybrid_weighted_pagerank_with_task_boost',
      seed: 'rt:/settings',
      task_keywords: ['update', 'settings', 'filter', 'source', 'evidence'],
    });
    expect(taskContext?.ranked.find((node) => node.id === 'cmp:settingsfilter')).toMatchObject({
      id: 'cmp:settingsfilter',
      reason: 'pattern_component+pagerank+task_match',
      matched_terms: ['settings', 'filter'],
    });
    expect(
      taskContext?.ranked.find((node) => node.id === 'src:src/app/settings/page.tsx'),
    ).toMatchObject({
      id: 'src:src/app/settings/page.tsx',
      reason: 'source_provenance+pagerank+task_match',
      matched_terms: ['settings', 'source'],
    });
  });

  it('extracts node impact context across contract and evidence relationships', () => {
    const snapshot: GraphSnapshot = {
      id: 'graph:impact',
      schema_version: GRAPH_SCHEMA_VERSION,
      project_id: 'proj:default',
      created_at: '2026-05-21T00:00:00.000Z',
      source_hash: 'sha256:impact',
      nodes: [
        { id: 'proj:default', type: 'Project', payload: { id: 'default' } },
        { id: 'rt:/settings', type: 'Route', payload: { path: '/settings' } },
        { id: 'pg:settings', type: 'Page', payload: { id: 'settings' } },
        { id: 'sh:settings', type: 'Shell', payload: { id: 'settings' } },
        { id: 'pat:settings-form', type: 'Pattern', payload: { id: 'settings-form' } },
        { id: 'cmp:card', type: 'Component', payload: { name: 'Card' } },
        {
          id: 'tkn:surface.elevated',
          type: 'Token',
          payload: { name: 'surface.elevated' },
        },
        { id: 'theme:clean', type: 'Theme', payload: { id: 'clean' } },
        { id: 'rule:no-raw-button', type: 'LocalRule', payload: { id: 'no-raw-button' } },
        { id: 'find:TOKEN010:card', type: 'Finding', payload: { code: 'TOKEN010' } },
        { id: 'ev:ast:card', type: 'Evidence', payload: { path: 'src/Card.tsx' } },
        { id: 'repair:restore-token-binding', type: 'Repair', payload: { id: 'restore' } },
        {
          id: 'src:src/Card.tsx',
          type: 'SourceArtifact',
          payload: { kind: 'component-source', path: 'src/Card.tsx' },
        },
      ],
      edges: [
        { src: 'pg:settings', dst: 'rt:/settings', relation: 'PAGE_ROUTED_AT_ROUTE' },
        { src: 'pg:settings', dst: 'sh:settings', relation: 'PAGE_USES_SHELL' },
        { src: 'pg:settings', dst: 'pat:settings-form', relation: 'PAGE_COMPOSES_PATTERN' },
        { src: 'pat:settings-form', dst: 'cmp:card', relation: 'PATTERN_NEEDS_COMPONENT' },
        {
          src: 'cmp:card',
          dst: 'tkn:surface.elevated',
          relation: 'COMPONENT_STYLED_WITH_TOKEN',
        },
        { src: 'theme:clean', dst: 'tkn:surface.elevated', relation: 'THEME_DEFINES_TOKEN' },
        { src: 'rule:no-raw-button', dst: 'proj:default', relation: 'LOCAL_RULE_APPLIES_TO' },
        { src: 'find:TOKEN010:card', dst: 'cmp:card', relation: 'FINDING_ANCHORED_AT' },
        { src: 'ev:ast:card', dst: 'find:TOKEN010:card', relation: 'EVIDENCE_SUPPORTS_FINDING' },
        {
          src: 'repair:restore-token-binding',
          dst: 'find:TOKEN010:card',
          relation: 'REPAIR_FIXES_FINDING',
        },
        { src: 'cmp:card', dst: 'src:src/Card.tsx', relation: 'NODE_DERIVED_FROM_SOURCE' },
      ],
      summary: { nodes: 0, edges: 0, findings: 0, evidence: 0 },
    };

    const tokenImpact = buildGraphImpactContext(snapshot, 'tkn:surface.elevated', {
      task: 'change elevated surface token',
    });

    expect(tokenImpact?.ranking).toEqual({
      method: 'hybrid_impact_pagerank_with_task_boost',
      seed: ['tkn:surface.elevated'],
      task_keywords: ['change', 'elevated', 'surface', 'token'],
    });
    expect(tokenImpact?.ids.routes).toEqual(['rt:/settings']);
    expect(tokenImpact?.ids.pages).toEqual(['pg:settings']);
    expect(tokenImpact?.ids.patterns).toEqual(['pat:settings-form']);
    expect(tokenImpact?.ids.components).toEqual(['cmp:card']);
    expect(tokenImpact?.ids.tokens).toEqual(['tkn:surface.elevated']);
    expect(tokenImpact?.ids.openFindings).toEqual(['find:TOKEN010:card']);
    expect(tokenImpact?.ids.evidence).toEqual(['ev:ast:card']);
    expect(tokenImpact?.ids.repairs).toEqual(['repair:restore-token-binding']);
    expect(tokenImpact?.ids.sourceArtifacts).toEqual(['src:src/Card.tsx']);
    expect(tokenImpact?.ranked[0]).toMatchObject({
      id: 'tkn:surface.elevated',
      reason: 'seed_node+pagerank+task_match',
      matched_terms: ['elevated', 'surface', 'token'],
    });

    const boundedImpact = buildGraphImpactContext(snapshot, 'tkn:surface.elevated', {
      limit: 4,
    });
    expect(boundedImpact?.summary.truncated).toBe(true);
    expect(boundedImpact?.summary.totalNodes).toBeGreaterThan(boundedImpact?.summary.nodes ?? 0);
    expect(boundedImpact?.ids.tokens).toEqual(['tkn:surface.elevated']);

    const projectRuleImpact = buildGraphImpactContext(snapshot, 'rule:no-raw-button');
    expect(projectRuleImpact?.ids.routes).toEqual(['rt:/settings']);
    expect(projectRuleImpact?.ids.pages).toEqual(['pg:settings']);
    expect(projectRuleImpact?.ids.localRules).toEqual(['rule:no-raw-button']);

    const fileImpact = buildChangedFileGraphImpact(
      snapshot,
      ['./src/Card.tsx', 'src/Untracked.tsx', 'src/Card.tsx'],
      { task: 'change card styling' },
    );
    expect(fileImpact.changedFiles).toEqual(['src/Card.tsx', 'src/Untracked.tsx']);
    expect(fileImpact.matchedFiles).toEqual([
      { file: 'src/Card.tsx', sourceNodeIds: ['src:src/Card.tsx'] },
    ]);
    expect(fileImpact.unresolvedFiles).toEqual(['src/Untracked.tsx']);
    expect(fileImpact.sourceNodeIds).toEqual(['src:src/Card.tsx']);
    expect(fileImpact.context?.ids.routes).toEqual(['rt:/settings']);

    const missingGraphImpact = buildChangedFileGraphImpact(null, ['src/Card.tsx']);
    expect(missingGraphImpact).toMatchObject({
      unresolvedFiles: ['src/Card.tsx'],
      sourceNodeIds: [],
      context: null,
    });
  });

  it('normalizes snapshot order and summary counts', () => {
    const snapshot: GraphSnapshot = {
      id: 'graph:test',
      schema_version: GRAPH_SCHEMA_VERSION,
      project_id: 'proj:default',
      created_at: '2026-05-21T00:00:00.000Z',
      source_hash: 'sha256:test',
      nodes: [
        { id: 'find:TOKEN042:test', type: 'Finding', payload: { code: 'TOKEN042' } },
        { id: 'ev:ast:test', type: 'Evidence', payload: { path: 'src/App.tsx' } },
        { id: 'pg:settings', type: 'Page', payload: {} },
      ],
      edges: [
        { src: 'find:TOKEN042:test', dst: 'pg:settings', relation: 'FINDING_ANCHORED_AT' },
        { src: 'ev:ast:test', dst: 'find:TOKEN042:test', relation: 'EVIDENCE_SUPPORTS_FINDING' },
      ],
      summary: { nodes: 0, edges: 0, findings: 0, evidence: 0 },
    };

    const normalized = normalizeGraphSnapshot(snapshot);

    expect(normalized.nodes.map((node) => node.id)).toEqual([
      'ev:ast:test',
      'find:TOKEN042:test',
      'pg:settings',
    ]);
    expect(normalized.summary).toEqual({
      nodes: 3,
      edges: 2,
      findings: 1,
      evidence: 1,
    });
  });

  it('diffs graph snapshots with stable typed operations', () => {
    const before: GraphSnapshot = {
      id: 'graph:before',
      schema_version: GRAPH_SCHEMA_VERSION,
      project_id: 'proj:default',
      created_at: '2026-05-21T00:00:00.000Z',
      source_hash: 'sha256:before',
      nodes: [
        { id: 'pg:settings', type: 'Page', payload: { label: 'Settings' } },
        { id: 'pat:form', type: 'Pattern', payload: { id: 'form' } },
        { id: 'find:COMP001:old', type: 'Finding', payload: { code: 'COMP001' } },
      ],
      edges: [{ src: 'pg:settings', dst: 'pat:form', relation: 'PAGE_COMPOSES_PATTERN' }],
      summary: { nodes: 0, edges: 0, findings: 0, evidence: 0 },
    };
    const after: GraphSnapshot = {
      ...before,
      id: 'graph:after',
      source_hash: 'sha256:after',
      nodes: [
        { id: 'pg:settings', type: 'Page', payload: { label: 'Account settings' } },
        { id: 'pat:form', type: 'Pattern', payload: { id: 'form' } },
        { id: 'pat:toolbar', type: 'Pattern', payload: { id: 'toolbar' } },
        { id: 'find:COMP010:new', type: 'Finding', payload: { code: 'COMP010' } },
        { id: 'ev:visual:settings', type: 'Evidence', payload: { route: '/settings' } },
      ],
      edges: [
        { src: 'pg:settings', dst: 'pat:form', relation: 'PAGE_COMPOSES_PATTERN' },
        { src: 'pg:settings', dst: 'pat:toolbar', relation: 'PAGE_COMPOSES_PATTERN', idx: 1 },
      ],
    };

    const diff = diffGraphSnapshots(before, after);

    expect(diff.$schema).toBe(GRAPH_DIFF_SCHEMA_URL);
    expect(diff.from).toBe('graph:before');
    expect(diff.to).toBe('graph:after');
    expect(diff.ops).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ op: 'node.changed', id: 'pg:settings' }),
        expect.objectContaining({ op: 'node.added', id: 'pat:toolbar' }),
        expect.objectContaining({ op: 'finding.added', id: 'find:COMP010:new' }),
        expect.objectContaining({ op: 'finding.resolved', id: 'find:COMP001:old' }),
        expect.objectContaining({ op: 'evidence.added', id: 'ev:visual:settings' }),
        expect.objectContaining({
          op: 'edge.added',
          src: 'pg:settings',
          dst: 'pat:toolbar',
          relation: 'PAGE_COMPOSES_PATTERN',
        }),
      ]),
    );

    expect(summarizeGraphDiff(diff)).toMatchObject({
      total: 6,
      nodes: { added: 1, removed: 0, changed: 1 },
      edges: { added: 1, removed: 0, changed: 0 },
      findings: { added: 1, resolved: 1 },
      evidence: { added: 1 },
      by_type: {
        'node.added': 1,
        'node.changed': 1,
        'edge.added': 1,
        'finding.added': 1,
        'finding.resolved': 1,
        'evidence.added': 1,
      },
    });
  });

  it('builds a provider-neutral contract capsule from a graph snapshot', () => {
    const snapshot: GraphSnapshot = {
      id: 'graph:capsule',
      schema_version: GRAPH_SCHEMA_VERSION,
      project_id: 'proj:default',
      created_at: '2026-05-21T00:00:00.000Z',
      source_hash: 'sha256:capsule',
      nodes: [
        { id: 'rt:/settings', type: 'Route', payload: { path: '/settings' } },
        { id: 'pg:settings', type: 'Page', payload: { id: 'settings' } },
        { id: 'sh:settings-shell', type: 'Shell', payload: { id: 'settings-shell' } },
        { id: 'cmp:button', type: 'Component', payload: { name: 'Button' } },
        { id: 'tkn:color.primary', type: 'Token', payload: { name: 'color.primary' } },
        { id: 'rule:no-raw-button', type: 'LocalRule', payload: { label: 'No raw buttons' } },
        {
          id: 'bridge:tailwind-shadcn',
          type: 'StyleBridge',
          payload: { label: 'Tailwind shadcn' },
        },
        {
          id: 'src:src/app/settings/page.tsx',
          type: 'SourceArtifact',
          payload: {
            id: 'src:src/app/settings/page.tsx',
            kind: 'route-source',
            path: 'src/app/settings/page.tsx',
          },
        },
        {
          id: 'find:COMP010:test',
          type: 'Finding',
          payload: {
            code: 'COMP010',
            severity: 'warn',
            anchored_at: 'pg:settings',
            message: 'Raw button usage detected.',
          },
        },
      ],
      edges: [
        { src: 'pg:settings', dst: 'rt:/settings', relation: 'PAGE_ROUTED_AT_ROUTE' },
        { src: 'pg:settings', dst: 'sh:settings-shell', relation: 'PAGE_USES_SHELL' },
      ],
      summary: { nodes: 0, edges: 0, findings: 0, evidence: 0 },
    };

    const capsule = buildContractCapsuleFromSnapshot(snapshot);

    expect(capsule.$schema).toBe(CONTRACT_CAPSULE_SCHEMA_URL);
    expect(capsule.contract_hash).toBe(graphContractHash(snapshot));
    expect(capsule.cache_key).toBe(`decantr-contract:${capsule.contract_hash}`);
    expect(capsule.contract_cache_key).toBe(`decantr-contract:${capsule.contract_hash}`);
    const capsuleSchema = JSON.parse(
      readFileSync(join(packageRoot, 'schema', 'contract-capsule.v1.json'), 'utf-8'),
    ) as {
      required: string[];
      properties: { summary: { required: string[] } };
    };
    expect(capsuleSchema.required).toContain('source_artifacts');
    for (const field of capsuleSchema.required) {
      expect(capsule).toHaveProperty(field);
    }
    expect(capsuleSchema.properties.summary.required).toContain('source_artifacts');
    for (const field of capsuleSchema.properties.summary.required) {
      expect(capsule.summary).toHaveProperty(field);
    }
    expect(capsule.routes).toEqual([
      {
        id: 'rt:/settings',
        path: '/settings',
        page_id: 'pg:settings',
        shell_id: 'sh:settings-shell',
      },
    ]);
    expect(capsule.summary).toMatchObject({
      routes: 1,
      components: 1,
      tokens: 1,
      local_rules: 1,
      style_bridge: 1,
      source_artifacts: 1,
      open_findings: 1,
    });
    expect(capsule.source_artifact_limit).toBe(DEFAULT_CONTRACT_CAPSULE_SOURCE_ARTIFACT_LIMIT);
    expect(capsule.source_artifacts_truncated).toBe(false);
    expect(capsule.source_artifacts).toEqual([
      {
        id: 'src:src/app/settings/page.tsx',
        path: 'src/app/settings/page.tsx',
        kind: 'route-source',
        label: 'src:src/app/settings/page.tsx',
        payload: {
          id: 'src:src/app/settings/page.tsx',
          kind: 'route-source',
          path: 'src/app/settings/page.tsx',
        },
      },
    ]);
    expect(capsule.open_findings).toEqual([
      {
        id: 'find:COMP010:test',
        code: 'COMP010',
        severity: 'warn',
        anchored_at: 'pg:settings',
        message: 'Raw button usage detected.',
      },
    ]);

    const changedEvidenceSnapshot: GraphSnapshot = {
      ...snapshot,
      source_hash: 'sha256:evidence-changed',
      nodes: [
        ...snapshot.nodes.filter((node) => node.type !== 'Finding'),
        {
          id: 'find:COMP010:test',
          type: 'Finding',
          payload: {
            code: 'COMP010',
            severity: 'warn',
            anchored_at: 'pg:settings',
            message: 'Raw button usage changed.',
          },
        },
        {
          id: 'ev:visual:settings',
          type: 'Evidence',
          payload: { screenshot: '.decantr/evidence/screenshots/settings.png' },
        },
      ],
    };
    const changedEvidenceCapsule = buildContractCapsuleFromSnapshot(changedEvidenceSnapshot);
    expect(changedEvidenceCapsule.contract_hash).toBe(capsule.contract_hash);
    expect(changedEvidenceCapsule.cache_key).toBe(capsule.cache_key);

    const limitedCapsule = buildContractCapsuleFromSnapshot(snapshot, {
      sourceArtifactLimit: 0,
    });
    expect(limitedCapsule.summary.source_artifacts).toBe(1);
    expect(limitedCapsule.source_artifact_limit).toBe(0);
    expect(limitedCapsule.source_artifacts_truncated).toBe(true);
    expect(limitedCapsule.source_artifacts).toEqual([]);
  });

  it('stores and reads the latest normalized snapshot', async () => {
    const store = createMemoryGraphStore();
    const snapshot: GraphSnapshot = {
      id: 'graph:latest',
      schema_version: GRAPH_SCHEMA_VERSION,
      project_id: 'proj:default',
      created_at: '2026-05-21T00:00:00.000Z',
      source_hash: 'sha256:test',
      nodes: [{ id: 'proj:default', type: 'Project', payload: {} }],
      edges: [],
      summary: { nodes: 0, edges: 0, findings: 0, evidence: 0 },
    };

    await store.writeSnapshot(snapshot);

    await expect(store.readSnapshot()).resolves.toMatchObject({
      id: 'graph:latest',
      summary: { nodes: 1 },
    });
  });
});
