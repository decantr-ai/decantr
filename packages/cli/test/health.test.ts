import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createStableProjectIdentityV1,
  fingerprintFindingOccurrence,
  GOVERNANCE_FINDING_FINGERPRINT_VERSION,
  type GovernanceFindingLocationV1,
  type GovernanceFindingOccurrenceInputV1,
  type ProjectHealthFinding,
  type ProjectHealthReport,
} from '@decantr/verifier';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COMMAND_SURFACE, commandSurfaceByName } from '../src/command-surface.js';
import { buildGraphArtifacts } from '../src/commands/graph.js';
import {
  cmdHealth,
  createProjectEvidenceBundle,
  createProjectHealthReport,
  evaluateHealthBaselineGate,
  formatDiagnosticCatalogJson,
  formatProjectHealthMarkdown,
  formatProjectHealthText,
  parseHealthArgs,
  renderProjectHealthCiWorkflow,
  shouldFailHealth,
  shouldFailHealthBaselineGate,
  writeProjectHealthCiWorkflow,
} from '../src/commands/health.js';
import { createWorkspaceHealthReport, listWorkspaceProjects } from '../src/commands/workspace.js';

let testDir = '';

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function writeRegistryCache(root = testDir): void {
  mkdirSync(join(root, '.decantr', 'cache', '@official', 'patterns'), { recursive: true });
  mkdirSync(join(root, '.decantr', 'cache', '@official', 'themes'), { recursive: true });
  writeJson(join(root, '.decantr', 'cache', '@official', 'patterns', 'hero.json'), {
    id: 'hero',
    name: 'Hero',
    version: '1.0.0',
  });
  writeJson(join(root, '.decantr', 'cache', '@official', 'themes', 'luminarum.json'), {
    id: 'luminarum',
    modes: ['dark', 'light'],
    version: '1.0.0',
  });
}

function writeEssence(
  routes: Record<string, { section: string; page: string }> = {
    '/': { section: 'marketing', page: 'home' },
  },
  root = testDir,
): void {
  writeJson(join(root, 'decantr.essence.json'), {
    version: '4.0.0',
    dna: {
      theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
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
      personality: ['clean'],
    },
    blueprint: {
      sections: [
        {
          id: 'marketing',
          role: 'public',
          shell: 'top-nav-footer',
          features: [],
          description: 'Marketing surface',
          pages: [{ id: 'home', route: '/', layout: ['hero'] }],
        },
      ],
      features: [],
      routes,
    },
    meta: {
      archetype: 'marketing',
      target: 'react',
      platform: { type: 'spa', routing: 'hash' },
      guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
    },
  });
}

function writePacks(root = testDir): void {
  mkdirSync(join(root, '.decantr', 'context'), { recursive: true });
  mkdirSync(join(root, 'src', 'styles'), { recursive: true });
  writeFileSync(
    join(root, 'src', 'styles', 'tokens.css'),
    ':root { --d-bg: #101014; --d-text: #f5f2eb; --d-radius: 8px; }\n:focus-visible { outline: 2px solid var(--d-text); }\n',
    'utf-8',
  );
  writeJson(join(root, '.decantr', 'context', 'pack-manifest.json'), {
    $schema: 'https://decantr.ai/schemas/pack-manifest.v1.json',
    version: '1.0.0',
    generatedAt: '2026-05-08T14:00:00.000Z',
    scaffold: { id: 'scaffold', markdown: 'scaffold-pack.md', json: 'scaffold-pack.json' },
    review: { id: 'review', markdown: 'review-pack.md', json: 'review-pack.json' },
    sections: [],
    pages: [
      {
        id: 'page-home',
        markdown: 'page-home-pack.md',
        json: 'page-home-pack.json',
        sectionId: 'marketing',
        sectionRole: 'public',
      },
    ],
    mutations: [
      {
        id: 'mutation-add-page',
        markdown: 'mutation.md',
        json: 'mutation.json',
        mutationType: 'add-page',
      },
    ],
  });
  for (const file of [
    'scaffold-pack.md',
    'scaffold-pack.json',
    'review-pack.md',
    'page-home-pack.md',
    'page-home-pack.json',
    'mutation.md',
    'mutation.json',
  ]) {
    writeFileSync(join(root, '.decantr', 'context', file), '{}\n', 'utf-8');
  }
  writeJson(join(root, '.decantr', 'context', 'review-pack.json'), {
    $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
    packVersion: '1.0.0',
    packType: 'review',
    objective: 'Review generated output against the compiled Decantr contract.',
    target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
    preset: null,
    scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
    requiredSetup: [],
    allowedVocabulary: [],
    examples: [],
    antiPatterns: [],
    successChecks: [],
    tokenBudget: { target: 1400, max: 2200, strategy: [] },
    data: {
      reviewType: 'app',
      shell: 'top-nav-footer',
      theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
      routing: 'hash',
      features: [],
      routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
      focusAreas: ['route-topology', 'accessibility'],
      workflow: [],
    },
    renderedMarkdown: '# Review Pack\n',
  });
}

function writeGraph(root = testDir): void {
  mkdirSync(join(root, '.decantr', 'graph'), { recursive: true });
  writeJson(join(root, '.decantr', 'graph', 'graph.snapshot.json'), {
    id: 'graph:test',
    schema_version: '3.0.0-draft',
    project_id: 'proj:test',
    created_at: '2026-05-21T12:00:00.000Z',
    source_hash: 'hash:test',
    nodes: [
      { id: 'proj:test', type: 'Project', payload: { name: 'Test project' } },
      { id: 'pg:marketing:home', type: 'Page', payload: { id: 'home', section: 'marketing' } },
      { id: 'rt:/', type: 'Route', payload: { path: '/' } },
    ],
    edges: [{ src: 'pg:marketing:home', dst: 'rt:/', relation: 'PAGE_ROUTED_AT_ROUTE' }],
    summary: { nodes: 3, edges: 1, findings: 0, evidence: 0 },
  });
}

function writeCurrentGraph(root = testDir): void {
  const artifacts = buildGraphArtifacts(root);
  if (!artifacts) throw new Error('Expected graph artifacts to be buildable.');
  mkdirSync(artifacts.paths.graphDir, { recursive: true });
  mkdirSync(artifacts.paths.snapshotsDir, { recursive: true });
  writeJson(artifacts.paths.snapshot, artifacts.snapshot);
  writeJson(artifacts.paths.snapshotHistory, artifacts.snapshot);
  writeJson(artifacts.paths.manifest, artifacts.manifest);
  writeJson(artifacts.paths.diff, artifacts.diff);
  writeJson(artifacts.paths.capsule, artifacts.capsule);
}

function baselineTestFinding(
  file?: string,
  location?: GovernanceFindingLocationV1,
): ProjectHealthFinding {
  return {
    id: 'audit-shared-occurrence',
    code: 'TEST001',
    source: 'audit',
    category: 'Components',
    severity: 'warn',
    message: 'A shared control bypasses the project primitive.',
    evidence: [],
    file,
    rule: 'shared-control',
    repair: { id: 'use-project-control' },
    remediation: { summary: 'Use the project control.', prompt: 'Repair it.', commands: [] },
    ...(location ? { location } : {}),
  } as ProjectHealthFinding;
}

function baselineTestOccurrence(
  file?: string,
  location?: GovernanceFindingLocationV1,
): GovernanceFindingOccurrenceInputV1 {
  return {
    code: 'TEST001',
    ruleId: 'shared-control',
    source: 'audit',
    category: 'Components',
    severity: 'warn',
    message: 'A shared control bypasses the project primitive.',
    authorityLane: 'unknown',
    graphAnchor: null,
    repairId: 'use-project-control',
    repairTarget: file ?? null,
    annotation: {
      path: file ?? null,
      startLine: location?.line ?? null,
      startColumn: location?.column ?? null,
      endLine: location?.endLine ?? null,
      endColumn: location?.endColumn ?? null,
    },
    file: file ?? null,
    route: null,
    target: null,
    location: location ?? null,
  };
}

function baselineFindingV2(file: string, location: GovernanceFindingLocationV1) {
  const occurrence = baselineTestOccurrence(file, location);
  return {
    id: 'audit-shared-occurrence',
    fingerprint: fingerprintFindingOccurrence(occurrence),
    fingerprintVersion: GOVERNANCE_FINDING_FINGERPRINT_VERSION,
    code: occurrence.code,
    rule: occurrence.ruleId,
    source: occurrence.source,
    category: occurrence.category,
    severity: occurrence.severity,
    message: occurrence.message,
    file: occurrence.file,
    route: occurrence.route,
    target: occurrence.target,
    location: occurrence.location,
    repairTarget: occurrence.repairTarget,
    annotation: occurrence.annotation,
    repair: { id: occurrence.repairId },
  };
}

function baselineGateReport(findings: ProjectHealthFinding[]): ProjectHealthReport {
  return {
    projectRoot: testDir,
    summary: { workflowMode: 'brownfield-attach' },
    findings,
  } as unknown as ProjectHealthReport;
}

describe('Project Health report', () => {
  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-health-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('produces a healthy report for a greenfield project with current packs', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();

    const report = await createProjectHealthReport(testDir);

    expect(report.$schema).toBe('https://decantr.ai/schemas/project-health-report.v2.json');
    expect(report.loop.state).toBe('blocked_missing_graph');
    expect(report.evidenceTier.schemaVersion).toBe(2);
    expect(report.status).toBe('healthy');
    expect(report.score).toBeGreaterThanOrEqual(99);
    expect(report.routes.declared).toContain('/');
    expect(report.packs.manifestPresent).toBe(true);
  });

  it('accepts project-owned local patterns as guard registry entries', async () => {
    writeRegistryCache();
    writeEssence();
    const essence = JSON.parse(readFileSync(join(testDir, 'decantr.essence.json'), 'utf-8')) as {
      blueprint: { sections: Array<{ pages: Array<{ layout: string[] }> }> };
    };
    essence.blueprint.sections[0].pages[0].layout = ['project-owned-summary'];
    writeJson(join(testDir, 'decantr.essence.json'), essence);
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    writeJson(join(testDir, '.decantr', 'local-patterns.json'), {
      version: 1,
      status: 'accepted',
      patterns: [
        {
          id: 'project-owned-summary',
          status: 'accepted',
          componentPaths: ['src/components/ProjectOwnedSummary.tsx'],
        },
      ],
    });

    const report = await createProjectHealthReport(testDir);

    expect(report.findings.map((finding) => finding.rule)).not.toContain('pattern-exists');
  });

  it('reports missing or invalid essence as a CI-blocking error', async () => {
    writeFileSync(join(testDir, 'decantr.essence.json'), '{ invalid json', 'utf-8');

    const report = await createProjectHealthReport(testDir);

    expect(report.status).toBe('error');
    expect(report.summary.errorCount).toBeGreaterThan(0);
    expect(shouldFailHealth(report, 'error')).toBe(true);
  });

  it('surfaces brownfield route drift when the project is attached as brownfield', async () => {
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'app', 'dashboard'), { recursive: true });
    writeRegistryCache();
    writeEssence();
    writePacks();
    writeJson(join(testDir, '.decantr', 'project.json'), {
      initialized: { workflowMode: 'brownfield-attach', adoptionMode: 'contract-only' },
    });
    writeJson(join(testDir, 'package.json'), {
      dependencies: { next: '^16.0.0', react: '^19.0.0', 'react-dom': '^19.0.0' },
    });
    writeFileSync(
      join(testDir, 'src', 'app', 'dashboard', 'page.tsx'),
      'export default function Page() { return null; }\n',
    );

    const report = await createProjectHealthReport(testDir);

    expect(report.findings.some((finding) => finding.rule === 'brownfield-route-drift')).toBe(true);
    expect(report.routes.issues.some((issue) => issue.includes('Observed routes'))).toBe(true);
  });

  it('surfaces missing pack manifest in the health report', async () => {
    writeRegistryCache();
    writeEssence();

    const report = await createProjectHealthReport(testDir);

    expect(report.packs.manifestPresent).toBe(false);
    expect(report.findings.some((finding) => finding.id === 'pack-pack-manifest-missing')).toBe(
      true,
    );
  });

  it('warns when attached typed Contract graph artifacts are missing', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    writeJson(join(testDir, '.decantr', 'project.json'), {
      initialized: { workflowMode: 'brownfield-attach', adoptionMode: 'contract-only' },
    });

    const report = await createProjectHealthReport(testDir);
    const finding = report.findings.find((entry) => entry.rule === 'typed-graph-current');

    expect(finding).toMatchObject({
      source: 'graph',
      category: 'Typed Contract Graph',
      code: 'GRAPH001',
      repair: { id: 'regenerate-typed-graph' },
    });
    expect(finding?.evidence).toContain('.decantr/graph/graph.snapshot.json');
    expect(finding?.remediation.commands).toContain('decantr graph');
    expect(report.graph).toMatchObject({
      present: false,
      ready: false,
      current: false,
      snapshotPresent: false,
      capsulePresent: false,
      capsuleSourceArtifactLimit: 200,
      capsuleSourceArtifactsTruncated: false,
    });
    expect(report.graph.staleArtifacts).toContain('.decantr/graph/graph.snapshot.json');
  });

  it('passes graph freshness once attached graph artifacts are current', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    writeJson(join(testDir, '.decantr', 'project.json'), {
      initialized: { workflowMode: 'brownfield-attach', adoptionMode: 'contract-only' },
    });
    writeCurrentGraph();

    const report = await createProjectHealthReport(testDir);
    const evidence = await createProjectEvidenceBundle(testDir, report);

    expect(report.graph).toMatchObject({
      present: true,
      ready: true,
      current: true,
      snapshotPresent: true,
      capsulePresent: true,
      capsuleSourceArtifactLimit: 200,
      capsuleSourceArtifactsTruncated: false,
    });
    expect(report.graph.snapshotId).toMatch(/^graph:/);
    expect(report.graph.contractCacheKey).toMatch(/^decantr-contract:fnv1a32:/);
    expect(report.graph.sourceArtifactCount).toBeGreaterThan(0);
    expect(report.findings.some((finding) => finding.rule === 'typed-graph-current')).toBe(false);
    expect(evidence.provenance.graphSnapshot).toMatchObject({
      path: '.decantr/graph/graph.snapshot.json',
      present: true,
    });
    expect(evidence.provenance.graphManifest.present).toBe(true);
    expect(evidence.provenance.graphDiff.present).toBe(true);
    expect(evidence.provenance.contractCapsule.present).toBe(true);
    expect(evidence.provenance.contractCapsule.hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('attaches typed graph anchors to health findings and evidence bundles', async () => {
    writeRegistryCache();
    writeEssence();
    writeGraph();

    const report = await createProjectHealthReport(testDir);
    const finding = report.findings.find((entry) => entry.graph);
    const evidence = await createProjectEvidenceBundle(testDir, report);
    const markdown = formatProjectHealthMarkdown(report);

    expect(finding?.graph).toMatchObject({
      snapshot_id: 'graph:test',
      node_id: 'proj:test',
      node_type: 'Project',
      confidence: 'fallback',
    });
    expect(finding?.code).toBe('CTX002');
    expect(finding?.repair?.id).toBe('hydrate-execution-packs');
    expect(finding?.remediation.prompt).toContain('Code: CTX002');
    expect(finding?.remediation.prompt).toContain('Repair: hydrate-execution-packs');
    expect(finding?.remediation.prompt).toContain('Graph anchor: Project proj:test');
    expect(markdown).toContain('- Code: CTX002');
    expect(markdown).toContain('- Repair: `hydrate-execution-packs`');
    expect(markdown).toContain('- Graph: `Project proj:test`');
    expect(evidence.findings.some((entry) => entry.graph?.snapshot_id === 'graph:test')).toBe(true);
    expect(evidence.findings.some((entry) => entry.repair?.id === 'hydrate-execution-packs')).toBe(
      true,
    );
    expect(evidence.provenance.graphSnapshot).toMatchObject({
      path: '.decantr/graph/graph.snapshot.json',
      present: true,
    });
    expect(evidence.provenance.graphManifest.present).toBe(false);
    expect(evidence.provenance.contractCapsule.present).toBe(false);
  });

  it('preserves component reuse repair payloads in health and evidence output', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();
    mkdirSync(join(testDir, 'src', 'components', 'ui'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'app', 'dashboard'), { recursive: true });
    writeFileSync(
      join(testDir, 'src', 'components', 'ui', 'Button.tsx'),
      'export function Button() { return <button />; }\n',
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'src', 'app', 'dashboard', 'page.tsx'),
      'function Button() { return <button />; }\nexport function DashboardPage() { return <Button />; }\n',
      'utf-8',
    );

    const report = await createProjectHealthReport(testDir);
    const finding = report.findings.find(
      (entry) => entry.rule === 'component-reuse-primitive-reimplemented',
    );
    const evidence = await createProjectEvidenceBundle(testDir, report);
    const evidenceFinding = evidence.findings.find((entry) => entry.id === finding?.id);

    expect(finding).toMatchObject({
      code: 'COMP001',
      repair: {
        id: 'import-existing-component',
        payload: {
          component: 'Button',
          file: 'src/app/dashboard/page.tsx',
          canonical_file: 'src/components/ui/Button.tsx',
        },
      },
    });
    expect(evidenceFinding?.repair).toMatchObject({
      id: 'import-existing-component',
      payload: {
        component: 'Button',
        file: 'src/app/dashboard/page.tsx',
        canonical_file: 'src/components/ui/Button.tsx',
      },
    });
  });

  it('preserves raw control repair plans in health and evidence output', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();
    mkdirSync(join(testDir, 'src', 'components', 'ui'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'app', 'dashboard'), { recursive: true });
    writeFileSync(
      join(testDir, 'src', 'components', 'ui', 'Button.tsx'),
      'export function Button() { return <button />; }\n',
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'src', 'app', 'dashboard', 'page.tsx'),
      'export function DashboardPage() { return <button type="button">Save</button>; }\n',
      'utf-8',
    );

    const report = await createProjectHealthReport(testDir);
    const finding = report.findings.find((entry) => entry.rule === 'component-reuse-raw-control');
    const evidence = await createProjectEvidenceBundle(testDir, report);
    const evidenceFinding = evidence.findings.find((entry) => entry.id === finding?.id);

    expect(finding).toMatchObject({
      code: 'COMP010',
      repair: {
        id: 'replace-raw-control-with-local-component',
        payload: {
          component: 'Button',
          element: 'button',
          file: 'src/app/dashboard/page.tsx',
          canonical_file: 'src/components/ui/Button.tsx',
        },
      },
      repairPlan: {
        actions: [
          {
            kind: 'replace_raw_control_with_component',
            target: 'src/app/dashboard/page.tsx',
          },
        ],
      },
    });
    expect(evidenceFinding?.repairPlan?.actions[0]).toMatchObject({
      kind: 'replace_raw_control_with_component',
      target: 'src/app/dashboard/page.tsx',
    });
  });

  it('preserves accepted style bridge drift repair plans in health and evidence output', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'app', 'dashboard'), { recursive: true });
    writeJson(join(testDir, '.decantr', 'style-bridge.json'), {
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
    writeFileSync(
      join(testDir, 'src', 'app', 'dashboard', 'page.tsx'),
      'export function DashboardPage() { return <main className="bg-[#0f172a]">Dashboard</main>; }\n',
      'utf-8',
    );

    const report = await createProjectHealthReport(testDir);
    const finding = report.findings.find((entry) => entry.rule === 'style-bridge-arbitrary-value');
    const evidence = await createProjectEvidenceBundle(testDir, report);
    const evidenceFinding = evidence.findings.find((entry) => entry.id === finding?.id);

    expect(finding).toMatchObject({
      source: 'style-bridge',
      category: 'Style Bridge',
      code: 'TOKEN010',
      repair: {
        id: 'replace-arbitrary-style-with-bridge-token',
        payload: {
          file: 'src/app/dashboard/page.tsx',
          value: 'bg-[#0f172a]',
          bridge_mappings: ['bridge:surface'],
          token_hints: ['--color-surface', '--color-foreground'],
        },
      },
    });
    expect(finding?.remediation.commands).toContain('decantr codify --style-bridge');
    expect(finding?.repairPlan?.readTargets).toContain('.decantr/style-bridge.json');
    expect(evidenceFinding?.source).toBe('style-bridge');
    expect(evidenceFinding?.repairPlan?.readTargets).toContain('.decantr/style-bridge.json');
  });

  it('renders the stable diagnostic catalog without requiring a project audit', async () => {
    const json = JSON.parse(formatDiagnosticCatalogJson()) as {
      diagnostics: Array<{ code: string; rule: string; repairId: string }>;
    };

    expect(json.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'A11Y020',
          rule: 'browser-axe-violations',
          repairId: 'fix-rendered-accessibility',
        }),
        expect.objectContaining({
          code: 'RUNTIME010',
          rule: 'browser-runtime-probes-failed',
          repairId: 'repair-browser-runtime-probes',
        }),
        expect.objectContaining({
          code: 'TOKEN010',
          rule: 'style-bridge-arbitrary-value',
          repairId: 'replace-arbitrary-style-with-bridge-token',
        }),
      ]),
    );

    const parsed = parseHealthArgs(['health', '--diagnostics', '--json']);
    expect(parsed).toMatchObject({ diagnostics: true, json: true });

    await cmdHealth(testDir, { diagnostics: true, format: 'json', output: 'diagnostics.json' });
    const written = JSON.parse(readFileSync(join(testDir, 'diagnostics.json'), 'utf-8')) as {
      diagnostics: Array<{ code: string }>;
    };
    expect(written.diagnostics.some((entry) => entry.code === 'GRAPH001')).toBe(true);
  });

  it('treats missing hosted packs as optional context for contract-only brownfield projects', async () => {
    writeRegistryCache();
    writeEssence();
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    writeJson(join(testDir, '.decantr', 'project.json'), {
      initialized: { workflowMode: 'brownfield-attach', adoptionMode: 'contract-only' },
    });

    const report = await createProjectHealthReport(testDir);
    const packFinding = report.findings.find(
      (finding) => finding.id === 'pack-pack-manifest-missing',
    );
    const reviewFinding = report.findings.find(
      (finding) => finding.id === 'pack-review-pack-file-missing',
    );

    expect(packFinding?.severity).toBe('info');
    expect(packFinding?.message).toContain('optional for contract-only');
    expect(reviewFinding?.severity).toBe('info');
    expect(
      report.findings.some((finding) => finding.id === 'assertion-contract-context-pack-manifest'),
    ).toBe(false);
    expect(
      report.findings.some((finding) => finding.id === 'assertion-contract-context-review-pack'),
    ).toBe(false);
  });

  it('flags route-less pages and stale page pack counts', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();
    const essencePath = join(testDir, 'decantr.essence.json');
    const essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as {
      blueprint: {
        sections: Array<{
          id: string;
          pages: Array<{ id: string; route?: string; layout: string[] }>;
        }>;
        routes: Record<string, { section: string; page: string }>;
      };
    };
    essence.blueprint.sections[0].pages.push({ id: 'settings', layout: ['hero'] });
    writeJson(essencePath, essence);

    const report = await createProjectHealthReport(testDir);

    expect(report.findings.some((finding) => finding.rule === 'page-route-required')).toBe(true);
    expect(report.findings.some((finding) => finding.rule === 'page-pack-count-mismatch')).toBe(
      true,
    );
    expect(formatProjectHealthText(report)).toContain('[Blueprint warning]');
  });

  it('does not require Decantr token CSS for contract-only brownfield projects', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();
    rmSync(join(testDir, 'src', 'styles', 'tokens.css'));
    writeJson(join(testDir, '.decantr', 'project.json'), {
      initialized: { workflowMode: 'brownfield-attach', adoptionMode: 'contract-only' },
    });

    const report = await createProjectHealthReport(testDir);

    expect(report.findings.some((finding) => finding.rule === 'tokens-file-present')).toBe(false);
  });

  it('renders markdown and scoped remediation prompts', async () => {
    writeRegistryCache();
    writeEssence();

    const report = await createProjectHealthReport(testDir);
    const markdown = formatProjectHealthMarkdown(report);
    const finding = report.findings[0];

    expect(markdown).toContain('# Decantr Project Health');
    expect(markdown).toContain('## Findings');
    expect(finding.remediation.prompt).toContain(
      'You are fixing one Decantr Project Health finding',
    );
    expect(finding.remediation.prompt).toContain(`Finding: ${finding.id}`);
    expect(finding.remediation.prompt).toContain('Do not rewrite unrelated routes');
  });

  it('emits a privacy-redacted Evidence Bundle with freshness hashes', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();

    const report = await createProjectHealthReport(testDir);
    const evidence = await createProjectEvidenceBundle(testDir, report);
    const firstHash = evidence.provenance.essence.hash;

    expect(evidence.$schema).toBe('https://decantr.ai/schemas/evidence-bundle.v2.json');
    expect(evidence.evidenceTier.schemaVersion).toBe(2);
    expect(evidence.privacy.sourceIncluded).toBe(false);
    expect(firstHash).toMatch(/^[a-f0-9]{64}$/);
    expect(evidence.provenance.graphSnapshot.present).toBe(false);
    expect(evidence.provenance.contractCapsule.present).toBe(false);
    expect(JSON.stringify(evidence)).not.toContain(testDir);

    const essencePath = join(testDir, 'decantr.essence.json');
    const essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as {
      dna: { theme: { mode: string } };
    };
    essence.dna.theme.mode = 'light';
    writeJson(essencePath, essence);

    const updatedReport = await createProjectHealthReport(testDir);
    const updatedEvidence = await createProjectEvidenceBundle(testDir, updatedReport);
    expect(updatedEvidence.provenance.essence.hash).not.toBe(firstHash);
  });

  it('turns missing Playwright into a browser setup finding instead of a crash', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();

    const report = await createProjectHealthReport(testDir, { browser: true });

    expect(report.findings.some((finding) => finding.rule === 'browser-playwright-missing')).toBe(
      true,
    );
  });

  it('writes visual manifest screenshot evidence when Playwright renders routes', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();
    const playwrightDir = join(testDir, 'node_modules', 'playwright');
    mkdirSync(playwrightDir, { recursive: true });
    writeFileSync(
      join(playwrightDir, 'index.js'),
      `const fs = require('node:fs');
const path = require('node:path');
exports.chromium = {
  launch: async () => ({
    newPage: async () => ({
      on: () => undefined,
      goto: async () => undefined,
      evaluate: async (_fn, arg) => {
        if (Array.isArray(arg)) {
          return {
            routeRendered: {
              status: 'passed',
              readyState: 'complete',
              url: 'http://127.0.0.1:3000/',
              title: 'Home',
              bodyPresent: true,
              appRootPresent: true,
              bodyChildCount: 1,
            },
            nonblankDom: {
              status: 'passed',
              textLength: 12,
              meaningfulElementCount: 2,
              mediaElementCount: 0,
              controlElementCount: 1,
            },
            interactionStyles: {
              status: 'passed',
              checked: 1,
              matchedClasses: ['d-pulse'],
              animatedOrTransitioned: 1,
              missing: [],
            },
          };
        }
        return { violations: [], incomplete: 0 };
      },
      screenshot: async ({ path: target }) => {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, 'fake screenshot');
      },
      close: async () => undefined,
    }),
    close: async () => undefined,
  }),
};
`,
      'utf-8',
    );

    await createProjectHealthReport(testDir, {
      browser: true,
      browserBaseUrl: 'http://127.0.0.1:3000',
    });

    const manifest = JSON.parse(
      readFileSync(join(testDir, '.decantr', 'evidence', 'visual-manifest.json'), 'utf-8'),
    ) as {
      localOnly: boolean;
      routes: Array<{
        route: string;
        screenshot: string | null;
        status: string;
        runtime?: {
          routeRendered: { status: string };
          nonblankDom: { status: string };
          interactionStyles: { status: string; matchedClasses: string[] };
          accessibility: { status: string; reason?: string };
        };
      }>;
    };

    expect(manifest.localOnly).toBe(true);
    expect(manifest.routes[0]).toMatchObject({
      route: '/',
      screenshot: '.decantr/evidence/screenshots/root.png',
      status: 'captured',
    });
    expect(manifest.routes[0].runtime).toMatchObject({
      routeRendered: { status: 'passed' },
      nonblankDom: { status: 'passed' },
      interactionStyles: { status: 'passed', matchedClasses: ['d-pulse'] },
      accessibility: {
        status: 'skipped',
        reason: 'axe-core is not installed in this project.',
      },
    });
    expect(existsSync(join(testDir, '.decantr', 'evidence', 'screenshots', 'root.png'))).toBe(true);
  });

  it('turns browser runtime probe failures into a repairable health finding', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();
    const playwrightDir = join(testDir, 'node_modules', 'playwright');
    mkdirSync(playwrightDir, { recursive: true });
    writeFileSync(
      join(playwrightDir, 'index.js'),
      `const fs = require('node:fs');
const path = require('node:path');
exports.chromium = {
  launch: async () => ({
    newPage: async () => {
      const handlers = {};
      return {
        on: (event, handler) => {
          handlers[event] = handler;
        },
        goto: async () => {
          handlers.console?.({ type: () => 'error', text: () => 'ReferenceError: missing state' });
          handlers.console?.({ type: () => 'warning', text: () => 'ignored warning' });
          handlers.pageerror?.(new Error('Uncaught route failure'));
        },
        evaluate: async (_fn, arg) => {
          if (Array.isArray(arg)) {
            return {
              routeRendered: {
                status: 'passed',
                readyState: 'complete',
                url: 'http://127.0.0.1:3000/',
                title: 'Home',
                bodyPresent: true,
                appRootPresent: true,
                bodyChildCount: 1,
              },
              nonblankDom: {
                status: 'failed',
                textLength: 0,
                meaningfulElementCount: 0,
                mediaElementCount: 0,
                controlElementCount: 0,
                reason: 'DOM rendered, but no meaningful content was detected.',
              },
              interactionStyles: {
                status: 'failed',
                checked: 1,
                matchedClasses: ['d-pulse'],
                animatedOrTransitioned: 0,
                missing: ['d-pulse'],
              },
            };
          }
          return { violations: [], incomplete: 0 };
        },
        screenshot: async ({ path: target }) => {
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.writeFileSync(target, 'fake screenshot');
        },
        close: async () => undefined,
      };
    },
    close: async () => undefined,
  }),
};
`,
      'utf-8',
    );

    const report = await createProjectHealthReport(testDir, {
      browser: true,
      browserBaseUrl: 'http://127.0.0.1:3000',
    });
    const finding = report.findings.find((entry) => entry.rule === 'browser-runtime-probes-failed');
    const manifest = JSON.parse(
      readFileSync(join(testDir, '.decantr', 'evidence', 'visual-manifest.json'), 'utf-8'),
    ) as {
      routes: Array<{
        runtime?: {
          nonblankDom: { status: string };
          consoleErrors: { status: string; count: number; messages: string[] };
          pageErrors: { status: string; count: number; messages: string[] };
          interactionStyles: { status: string; missing: string[] };
        };
      }>;
    };

    expect(finding).toMatchObject({
      code: 'RUNTIME010',
      source: 'browser',
      rule: 'browser-runtime-probes-failed',
      repair: { id: 'repair-browser-runtime-probes' },
    });
    expect(finding?.evidence.join('\n')).toContain('console errors (1)');
    expect(finding?.evidence.join('\n')).toContain('page errors (1)');
    expect(finding?.evidence.join('\n')).toContain('nonblank DOM probe failed');
    expect(finding?.evidence.join('\n')).toContain('interaction style probe');
    expect(manifest.routes[0].runtime).toMatchObject({
      nonblankDom: { status: 'failed' },
      consoleErrors: {
        status: 'failed',
        count: 1,
        messages: ['ReferenceError: missing state'],
      },
      pageErrors: {
        status: 'failed',
        count: 1,
        messages: ['Uncaught route failure'],
      },
      interactionStyles: { status: 'failed', missing: ['d-pulse'] },
    });
  });

  it('runs the optional axe lane when axe-core is installed', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();
    const playwrightDir = join(testDir, 'node_modules', 'playwright');
    const axeDir = join(testDir, 'node_modules', 'axe-core');
    mkdirSync(playwrightDir, { recursive: true });
    mkdirSync(axeDir, { recursive: true });
    writeFileSync(join(axeDir, 'index.js'), "exports.source = 'window.axe = {}';\n", 'utf-8');
    writeFileSync(
      join(playwrightDir, 'index.js'),
      `const fs = require('node:fs');
const path = require('node:path');
exports.chromium = {
  launch: async () => ({
    newPage: async () => ({
      on: () => undefined,
      goto: async () => undefined,
      addScriptTag: async () => undefined,
      evaluate: async (_fn, arg) => {
        if (Array.isArray(arg)) {
          return {
            routeRendered: {
              status: 'passed',
              readyState: 'complete',
              url: 'http://127.0.0.1:3000/',
              title: 'Home',
              bodyPresent: true,
              appRootPresent: true,
              bodyChildCount: 1,
            },
            nonblankDom: {
              status: 'passed',
              textLength: 12,
              meaningfulElementCount: 2,
              mediaElementCount: 0,
              controlElementCount: 1,
            },
            interactionStyles: {
              status: 'skipped',
              checked: 0,
              matchedClasses: [],
              animatedOrTransitioned: 0,
              missing: [],
              reason: 'No known Decantr interaction classes were present on this route.',
            },
          };
        }
        return {
          violations: [
            {
              id: 'color-contrast',
              impact: 'serious',
              help: 'Elements must meet minimum color contrast ratios',
              targets: ['button.primary'],
            },
          ],
          incomplete: 0,
        };
      },
      screenshot: async ({ path: target }) => {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, 'fake screenshot');
      },
      close: async () => undefined,
    }),
    close: async () => undefined,
  }),
};
`,
      'utf-8',
    );

    const report = await createProjectHealthReport(testDir, {
      browser: true,
      browserBaseUrl: 'http://127.0.0.1:3000',
    });
    const finding = report.findings.find((entry) => entry.rule === 'browser-axe-violations');
    const manifest = JSON.parse(
      readFileSync(join(testDir, '.decantr', 'evidence', 'visual-manifest.json'), 'utf-8'),
    ) as {
      routes: Array<{
        runtime?: { accessibility: { status: string; violations: number; messages: string[] } };
      }>;
    };

    expect(finding).toMatchObject({
      code: 'A11Y020',
      category: 'Accessibility',
      rule: 'browser-axe-violations',
      repair: { id: 'fix-rendered-accessibility' },
    });
    expect(finding?.evidence.join('\n')).toContain('color-contrast');
    expect(manifest.routes[0].runtime?.accessibility).toMatchObject({
      status: 'failed',
      violations: 1,
      messages: [
        'color-contrast (serious): Elements must meet minimum color contrast ratios [button.primary]',
      ],
    });
  });

  it('supports warning-sensitive CI gating', async () => {
    writeRegistryCache();
    writeEssence();

    const report = await createProjectHealthReport(testDir);

    expect(report.summary.errorCount).toBe(0);
    expect(report.summary.warnCount).toBeGreaterThan(0);
    expect(shouldFailHealth(report, 'error')).toBe(false);
    expect(shouldFailHealth(report, 'warn')).toBe(true);
  });

  it('renders a GitHub Actions Project Health workflow', () => {
    const workflow = renderProjectHealthCiWorkflow({
      failOn: 'warn',
      cliVersion: '2.0.0',
      reportPath: 'reports/decantr-health.md',
      jsonPath: 'reports/decantr-health.json',
    });

    expect(workflow).toContain('name: Decantr Project Health');
    expect(workflow).toContain(
      'npx --yes @decantr/cli@2.0.0 health --json --output reports/decantr-health.json',
    );
    expect(workflow).toContain(
      'npx --yes @decantr/cli@2.0.0 health --ci --fail-on warn --markdown --output reports/decantr-health.md',
    );
    expect(workflow).toContain('actions/upload-artifact@v6');
  });

  it('renders a monorepo-aware Project Health workflow', () => {
    const workflow = renderProjectHealthCiWorkflow({
      cliVersion: '2.0.0',
      projectPath: 'apps/web',
      reportPath: 'reports/decantr-health.md',
      jsonPath: 'reports/decantr-health.json',
    });

    expect(workflow).toContain('working-directory: apps/web');
    expect(workflow).toContain(
      'npx --yes @decantr/cli@2.0.0 health --json --output reports/decantr-health.json',
    );
    expect(workflow).toContain('apps/web/reports/decantr-health.json');
    expect(workflow).toContain('apps/web/reports/decantr-health.md');
  });

  it('renders a workspace Project Health workflow', () => {
    const workflow = renderProjectHealthCiWorkflow({
      workspace: true,
      cliVersion: '2.0.0',
    });

    expect(workflow).toContain(
      'npx --yes @decantr/cli@2.0.0 workspace health --json --output .decantr/workspace-health.json',
    );
    expect(workflow).toContain(
      'npx --yes @decantr/cli@2.0.0 workspace health --ci --fail-on error --markdown --output .decantr/workspace-health.md',
    );
    expect(workflow).not.toContain('working-directory:');
  });

  it('writes the Project Health CI workflow without clobbering by default', () => {
    const result = writeProjectHealthCiWorkflow(testDir, { cliVersion: 'latest' });
    const workflowPath = join(testDir, '.github', 'workflows', 'decantr-health.yml');

    expect(result.created).toBe(true);
    expect(result.path).toBe('.github/workflows/decantr-health.yml');
    expect(existsSync(workflowPath)).toBe(true);
    expect(readFileSync(workflowPath, 'utf-8')).toContain('@decantr/cli@latest');
    expect(() => writeProjectHealthCiWorkflow(testDir)).toThrow(/already exists/);

    const updated = writeProjectHealthCiWorkflow(testDir, { force: true, failOn: 'warn' });
    expect(updated.created).toBe(false);
    expect(readFileSync(workflowPath, 'utf-8')).toContain('--fail-on warn');
  });

  it('parses health init-ci options', () => {
    const parsed = parseHealthArgs([
      'health',
      'init-ci',
      '--force',
      '--fail-on=warn',
      '--cli-version',
      '2.0.0',
      '--workflow-path',
      '.github/workflows/custom-health.yml',
      '--report-path=reports/health.md',
      '--json-path=reports/health.json',
      '--project',
      'apps/web',
    ]);

    expect(parsed.initCi).toEqual({
      force: true,
      failOn: 'warn',
      cliVersion: '2.0.0',
      workflowPath: '.github/workflows/custom-health.yml',
      reportPath: 'reports/health.md',
      jsonPath: 'reports/health.json',
      projectPath: 'apps/web',
    });
  });

  it('parses workspace init-ci options', () => {
    const parsed = parseHealthArgs(['health', 'init-ci', '--workspace', '--fail-on=warn']);

    expect(parsed.initCi).toEqual({
      workspace: true,
      failOn: 'warn',
    });
  });

  it('parses health baseline options', () => {
    const parsed = parseHealthArgs(['health', '--save-baseline', '--since-baseline']);

    expect(parsed.saveBaseline).toBe(true);
    expect(parsed.sinceBaseline).toBe(true);
  });

  it('classifies same-code occurrences in different files independently', () => {
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    const location = { line: 12, column: 3 };
    writeJson(join(testDir, '.decantr', 'health-baseline.json'), {
      version: 2,
      projectIdentity: createStableProjectIdentityV1(testDir),
      generatedAt: '2026-07-16T12:00:00.000Z',
      status: 'warning',
      score: 95,
      findings: [baselineFindingV2('src/components/Alpha.tsx', location)],
      routes: [],
      packs: null,
      screenshots: [],
    });
    const report = baselineGateReport([
      baselineTestFinding('src/components/Alpha.tsx', location),
      baselineTestFinding('src/components/Beta.tsx', location),
    ]);

    const gate = evaluateHealthBaselineGate(testDir, report);

    expect(gate.applied).toBe(true);
    expect(gate.inheritedFindingIds).toEqual(['audit-shared-occurrence']);
    expect(gate.newFindings).toEqual([{ id: 'audit-shared-occurrence', severity: 'warn' }]);
    expect(shouldFailHealthBaselineGate(gate, 'warn')).toBe(true);
  });

  it('reports resolved v2 finding occurrences in the private continuity artifact', async () => {
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    const location = { line: 12, column: 3 };
    writeJson(join(testDir, '.decantr', 'health-baseline.json'), {
      version: 2,
      projectIdentity: createStableProjectIdentityV1(testDir),
      generatedAt: '2026-07-16T12:00:00.000Z',
      status: 'warning',
      score: 95,
      findings: [baselineFindingV2('src/components/Removed.tsx', location)],
      routes: [],
      packs: null,
      screenshots: [],
    });
    writeRegistryCache();
    writeEssence();
    writePacks();
    writeJson(join(testDir, '.decantr', 'project.json'), {
      initialized: { workflowMode: 'brownfield-attach', adoptionMode: 'contract-only' },
    });

    await cmdHealth(testDir, {
      format: 'json',
      output: 'health-resolved.json',
      sinceBaseline: true,
    });

    const comparison = JSON.parse(
      readFileSync(join(testDir, '.decantr', 'health-baseline-diff.json'), 'utf-8'),
    ) as { resolvedFindings: string[]; limitations: string[] };
    expect(comparison.resolvedFindings).toContain('audit-shared-occurrence');
    expect(comparison.limitations).toEqual([]);
  });

  it('reads v1 and unversioned baselines with reduced evidence limitations', async () => {
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    const unanchored = baselineTestFinding();
    const legacyBaseline = {
      generatedAt: '2026-07-16T12:00:00.000Z',
      status: 'warning',
      score: 95,
      findings: [
        {
          id: unanchored.id,
          severity: unanchored.severity,
          source: unanchored.source,
          message: unanchored.message,
        },
      ],
      routes: [],
      packs: null,
      screenshots: [],
    };
    writeJson(join(testDir, '.decantr', 'health-baseline.json'), {
      version: 1,
      ...legacyBaseline,
    });

    const v1Gate = evaluateHealthBaselineGate(testDir, baselineGateReport([unanchored]));
    expect(v1Gate.applied).toBe(true);
    expect(v1Gate.inheritedFindingIds).toEqual([unanchored.id]);
    expect(v1Gate.newFindings).toEqual([]);

    writeRegistryCache();
    writeEssence();
    writePacks();
    writeJson(join(testDir, '.decantr', 'project.json'), {
      initialized: { workflowMode: 'brownfield-attach', adoptionMode: 'contract-only' },
    });
    const current = await createProjectHealthReport(testDir);
    writeJson(join(testDir, '.decantr', 'health-baseline.json'), {
      ...legacyBaseline,
      findings: current.findings.map((finding) => ({
        id: finding.id,
        severity: finding.severity,
        source: finding.source,
        message: finding.message,
      })),
    });

    await cmdHealth(testDir, {
      format: 'json',
      output: 'health-legacy.json',
      sinceBaseline: true,
    });

    const comparison = JSON.parse(
      readFileSync(join(testDir, '.decantr', 'health-baseline-diff.json'), 'utf-8'),
    ) as { savedAt: string | null; limitations: string[] };
    expect(comparison.savedAt).toBe('2026-07-16T12:00:00.000Z');
    expect(comparison.limitations.join(' ')).toContain(
      'Unversioned health baseline was read as legacy v1 evidence.',
    );
    expect(comparison.limitations.join(' ')).toContain('resolved findings are not proven');
  });

  it('rejects missing and cross-project v2 baseline identities', () => {
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    const location = { line: 12, column: 3 };
    const baseline = {
      version: 2,
      generatedAt: '2026-07-16T12:00:00.000Z',
      status: 'warning',
      score: 95,
      findings: [baselineFindingV2('src/components/Alpha.tsx', location)],
      routes: [],
      packs: null,
      screenshots: [],
    };
    const report = baselineGateReport([baselineTestFinding('src/components/Alpha.tsx', location)]);

    writeJson(join(testDir, '.decantr', 'health-baseline.json'), baseline);
    expect(evaluateHealthBaselineGate(testDir, report)).toMatchObject({
      applied: false,
      inheritedFindingIds: [],
      newFindings: [{ id: 'audit-shared-occurrence', severity: 'warn' }],
    });

    writeJson(join(testDir, '.decantr', 'health-baseline.json'), {
      ...baseline,
      projectIdentity: `project:v1:sha256:${'0'.repeat(64)}`,
    });
    expect(evaluateHealthBaselineGate(testDir, report)).toMatchObject({
      applied: false,
      inheritedFindingIds: [],
      newFindings: [{ id: 'audit-shared-occurrence', severity: 'warn' }],
    });
  });

  it('blocks a v2 finding whose severity escalates above the baseline', () => {
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    const location = { line: 12, column: 3 };
    writeJson(join(testDir, '.decantr', 'health-baseline.json'), {
      version: 2,
      projectIdentity: createStableProjectIdentityV1(testDir),
      generatedAt: '2026-07-16T12:00:00.000Z',
      status: 'warning',
      score: 95,
      findings: [baselineFindingV2('src/components/Alpha.tsx', location)],
      routes: [],
      packs: null,
      screenshots: [],
    });
    const escalated = {
      ...baselineTestFinding('src/components/Alpha.tsx', location),
      severity: 'error' as const,
    };

    const gate = evaluateHealthBaselineGate(testDir, baselineGateReport([escalated]));

    expect(gate.applied).toBe(true);
    expect(gate.inheritedFindingIds).toEqual([]);
    expect(gate.newFindings).toEqual([{ id: 'audit-shared-occurrence', severity: 'error' }]);
    expect(shouldFailHealthBaselineGate(gate, 'error')).toBe(true);
  });

  it('does not hide an anchored finding behind incomplete v1 evidence', () => {
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    const finding = baselineTestFinding('src/components/NewOccurrence.tsx', { line: 8 });
    writeJson(join(testDir, '.decantr', 'health-baseline.json'), {
      version: 1,
      generatedAt: '2026-07-16T12:00:00.000Z',
      status: 'warning',
      score: 95,
      findings: [
        {
          id: finding.id,
          severity: finding.severity,
          source: finding.source,
          message: finding.message,
        },
      ],
      routes: [],
      packs: null,
      screenshots: [],
    });

    const gate = evaluateHealthBaselineGate(testDir, baselineGateReport([finding]));

    expect(gate.inheritedFindingIds).toEqual([]);
    expect(gate.newFindings).toEqual([{ id: finding.id, severity: 'warn' }]);
    expect(shouldFailHealthBaselineGate(gate, 'warn')).toBe(true);
  });

  it('writes deterministic v2 baselines with complete occurrence evidence', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();
    writeJson(join(testDir, '.decantr', 'project.json'), {
      initialized: { workflowMode: 'brownfield-attach', adoptionMode: 'contract-only' },
    });
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-16T12:00:00.000Z'));
    try {
      await cmdHealth(testDir, {
        format: 'json',
        output: 'health-deterministic.json',
        saveBaseline: true,
      });
      const first = readFileSync(join(testDir, '.decantr', 'health-baseline.json'), 'utf-8');
      await cmdHealth(testDir, {
        format: 'json',
        output: 'health-deterministic.json',
        saveBaseline: true,
      });
      const second = readFileSync(join(testDir, '.decantr', 'health-baseline.json'), 'utf-8');
      expect(second).toBe(first);

      const baseline = JSON.parse(first) as {
        version: number;
        projectIdentity: string;
        findings: Array<Record<string, unknown>>;
      };
      expect(baseline.version).toBe(2);
      expect(baseline.projectIdentity).toBe(createStableProjectIdentityV1(testDir));
      expect(baseline.findings.map((finding) => finding.fingerprint)).toEqual(
        baseline.findings.map((finding) => finding.fingerprint).sort(),
      );
      for (const finding of baseline.findings) {
        for (const key of [
          'code',
          'rule',
          'source',
          'category',
          'severity',
          'message',
          'file',
          'target',
          'location',
          'fingerprint',
          'fingerprintVersion',
        ]) {
          expect(finding).toHaveProperty(key);
        }
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it('writes health baselines and compares changed files, routes, and screenshot hashes', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();
    writeJson(join(testDir, '.decantr', 'project.json'), {
      initialized: { workflowMode: 'brownfield-attach', adoptionMode: 'contract-only' },
    });
    mkdirSync(join(testDir, 'src', 'app'), { recursive: true });
    mkdirSync(join(testDir, '.decantr', 'evidence', 'screenshots'), { recursive: true });
    writeFileSync(join(testDir, 'src', 'app', 'page.tsx'), 'export default function Page() {}\n');
    writeFileSync(join(testDir, '.decantr', 'evidence', 'screenshots', 'root.png'), 'first');
    writeJson(join(testDir, '.decantr', 'analysis.json'), {
      routes: { routes: [{ path: '/', file: 'src/app/page.tsx' }] },
    });
    writeJson(join(testDir, '.decantr', 'evidence', 'visual-manifest.json'), {
      version: 1,
      generatedAt: '2026-05-12T00:00:00.000Z',
      localOnly: true,
      baseUrl: 'http://localhost:3000',
      routes: [
        {
          route: '/',
          url: 'http://localhost:3000/',
          screenshot: '.decantr/evidence/screenshots/root.png',
          screenshotHash: 'hash-a',
          status: 'captured',
        },
      ],
    });
    execFileSync('git', ['init'], { cwd: testDir, stdio: 'ignore' });
    execFileSync('git', ['add', '.'], { cwd: testDir, stdio: 'ignore' });

    await cmdHealth(testDir, { format: 'json', output: 'health.json', saveBaseline: true });

    writeFileSync(
      join(testDir, 'src', 'app', 'page.tsx'),
      'export default function Page() { return <main />; }\n',
    );
    writeJson(join(testDir, '.decantr', 'evidence', 'visual-manifest.json'), {
      version: 1,
      generatedAt: '2026-05-12T00:01:00.000Z',
      localOnly: true,
      baseUrl: 'http://localhost:3000',
      routes: [
        {
          route: '/',
          url: 'http://localhost:3000/',
          screenshot: '.decantr/evidence/screenshots/root.png',
          screenshotHash: 'hash-b',
          status: 'captured',
        },
      ],
    });

    await cmdHealth(testDir, { format: 'json', output: 'health-next.json', sinceBaseline: true });

    const diff = JSON.parse(
      readFileSync(join(testDir, '.decantr', 'health-baseline-diff.json'), 'utf-8'),
    ) as {
      changedFiles: string[];
      changedRoutes: string[];
      changedScreenshots: string[];
      scoreDelta: number | null;
    };
    expect(existsSync(join(testDir, '.decantr', 'health-baseline.json'))).toBe(true);
    expect(diff.changedFiles).toContain('src/app/page.tsx');
    expect(diff.changedRoutes).toContain('/');
    expect(diff.changedScreenshots).toContain('.decantr/evidence/screenshots/root.png');
    expect(diff.scoreDelta).not.toBeNull();

    const nextReport = JSON.parse(
      readFileSync(join(testDir, 'health-next.json'), 'utf-8'),
    ) as ProjectHealthReport;
    const finding = nextReport.findings.find(
      (entry) => entry.rule === 'visual-baseline-screenshot-drift',
    );
    expect(finding).toMatchObject({
      code: 'VISUAL010',
      repair: {
        id: 'review-visual-baseline-drift',
        payload: {
          changed_screenshots: ['.decantr/evidence/screenshots/root.png'],
        },
      },
    });
    expect(finding?.repairPlan?.actions?.[0]?.id).toBe('review-visual-baseline-drift');
    const gate = evaluateHealthBaselineGate(testDir, nextReport);
    expect(gate.applied).toBe(true);
    expect(gate.inheritedFindingIds.length).toBeGreaterThan(0);
    expect(gate.newFindings.map((entry) => entry.id)).toContain(finding?.id);
    expect(shouldFailHealthBaselineGate(gate, 'warn')).toBe(true);
  });

  it('tracks the audited CLI command surface', () => {
    const commands = new Set(COMMAND_SURFACE.map((entry) => entry.command));
    const dispatchedCommands = [
      'add',
      'adopt',
      'analyze',
      'audit',
      'check',
      'ci',
      'codify',
      'connect',
      'content',
      'content-health',
      'create',
      'doctor',
      'export',
      'get',
      'graph',
      'heal',
      'health',
      'init',
      'list',
      'login',
      'logout',
      'magic',
      'migrate',
      'new',
      'publish',
      'refresh',
      'registry',
      'remove',
      'resolve',
      'rules',
      'scan',
      'search',
      'showcase',
      'setup',
      'status',
      'studio',
      'suggest',
      'sync',
      'sync-drift',
      'telemetry',
      'theme',
      'task',
      'upgrade',
      'validate',
      'verify',
      'workspace',
    ];

    for (const command of dispatchedCommands) {
      expect(commands.has(command)).toBe(true);
    }
    expect(commands).toEqual(new Set(dispatchedCommands));
    expect(
      COMMAND_SURFACE.filter((entry) => entry.visibility === 'default').map(
        (entry) => entry.command,
      ),
    ).toEqual(['scan', 'adopt', 'task', 'verify', 'ci']);
    expect(
      COMMAND_SURFACE.filter((entry) => entry.visibility === 'advanced').map(
        (entry) => entry.command,
      ),
    ).toEqual([
      'setup',
      'new',
      'resolve',
      'doctor',
      'connect',
      'codify',
      'content',
      'magic',
      'init',
      'analyze',
      'refresh',
      'graph',
      'health',
      'studio',
      'workspace',
      'check',
      'audit',
      'migrate',
      'add',
      'remove',
      'theme',
      'rules',
      'export',
      'status',
      'sync',
      'upgrade',
      'sync-drift',
      'search',
      'suggest',
      'get',
      'list',
      'showcase',
      'validate',
      'telemetry',
    ]);
    expect(
      COMMAND_SURFACE.filter((entry) => entry.visibility === 'compatibility').map(
        (entry) => entry.command,
      ),
    ).toEqual(['heal', 'registry', 'content-health', 'create', 'publish', 'login', 'logout']);
    expect(commandSurfaceByName('verify')?.classification).toBe('primary');
    expect(commandSurfaceByName('verify')?.visibility).toBe('default');
    expect(commandSurfaceByName('health')?.classification).toBe('advanced');
    expect(commandSurfaceByName('health')?.visibility).toBe('advanced');
    expect(commandSurfaceByName('heal')?.classification).toBe('deprecated-alias');
    expect(commandSurfaceByName('heal')?.visibility).toBe('compatibility');
    expect(commandSurfaceByName('workspace')?.purpose).toContain('Monorepo');
  });

  it('discovers workspace projects and reports deterministic aggregate health', async () => {
    const appA = join(testDir, 'apps', 'a');
    const appB = join(testDir, 'apps', 'b');
    mkdirSync(appA, { recursive: true });
    mkdirSync(appB, { recursive: true });
    for (const root of [appA, appB]) {
      writeRegistryCache(root);
      writeEssence(undefined, root);
      writePacks(root);
    }

    const projects = listWorkspaceProjects(testDir);
    const report = await createWorkspaceHealthReport(testDir, { concurrency: 2 });

    expect(projects.map((project) => project.path)).toEqual(['apps/a', 'apps/b']);
    expect(report.$schema).toBe('https://decantr.ai/schemas/workspace-health-report.v2.json');
    expect(report.loop.state).toBe('human_resolution_required');
    expect(report.projects.map((project) => project.path)).toEqual(['apps/a', 'apps/b']);
    expect(report.summary.projectCount).toBe(2);
  });

  it('filters workspace health to changed projects', async () => {
    const appA = join(testDir, 'apps', 'a');
    const appB = join(testDir, 'apps', 'b');
    mkdirSync(join(appA, 'src', 'styles'), { recursive: true });
    mkdirSync(join(appB, 'src', 'styles'), { recursive: true });
    for (const root of [appA, appB]) {
      writeRegistryCache(root);
      writeEssence(undefined, root);
      writePacks(root);
      writeFileSync(join(root, 'src', 'styles', 'tokens.css'), ':root { --d-bg: #000; }\n');
    }
    execFileSync('git', ['init'], { cwd: testDir, stdio: 'ignore' });
    execFileSync('git', ['add', '.'], { cwd: testDir, stdio: 'ignore' });
    execFileSync(
      'git',
      ['-c', 'user.name=Decantr Test', '-c', 'user.email=test@decantr.ai', 'commit', '-m', 'init'],
      { cwd: testDir, stdio: 'ignore' },
    );
    writeFileSync(join(appB, 'src', 'styles', 'tokens.css'), ':root { --d-bg: #111; }\n');

    const report = await createWorkspaceHealthReport(testDir, {
      changedOnly: true,
      since: 'HEAD',
    });

    expect(report.changedOnly).toBe(true);
    expect(report.projects.map((project) => project.path)).toEqual(['apps/b']);
    expect(report.projects[0]?.changed).toBe(true);
  });

  it('rejects unsafe Project Health CI template inputs', () => {
    expect(() => renderProjectHealthCiWorkflow({ cliVersion: 'latest && echo bad' })).toThrow(
      /Invalid --cli-version/,
    );
    expect(() => renderProjectHealthCiWorkflow({ reportPath: 'reports/health report.md' })).toThrow(
      /Invalid --report-path/,
    );
    expect(() => writeProjectHealthCiWorkflow(testDir, { workflowPath: '../ci.yml' })).toThrow(
      /Invalid --workflow-path/,
    );
    expect(() => renderProjectHealthCiWorkflow({ projectPath: '../apps/web' })).toThrow(
      /Invalid --project/,
    );
    expect(() => renderProjectHealthCiWorkflow({ failOn: 'always' as unknown as 'error' })).toThrow(
      /Invalid --fail-on/,
    );
  });
});
