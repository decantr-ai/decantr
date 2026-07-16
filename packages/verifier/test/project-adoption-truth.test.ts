import { createHash } from 'node:crypto';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  type AdoptionTruthV1,
  createProjectAdoptionTruthV1,
  createProjectIdentityV1,
  createStableProjectIdentityV1,
} from '../src/index.js';
import { assertMatchesVerifierSchema } from './helpers/schema-assert.js';

const GENERATED_AT = '2026-07-16T12:00:00.000Z';
const roots: string[] = [];

function temporaryRoot(label: string): string {
  const root = mkdtempSync(join(tmpdir(), `decantr-adoption-truth-${label}-`));
  roots.push(root);
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function write(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, 'utf8');
}

function writeJson(path: string, value: unknown): void {
  write(path, `${JSON.stringify(value, null, 2)}\n`);
}

function validEssence(): Record<string, unknown> {
  return {
    version: '4.0.0',
    dna: {
      theme: { id: 'existing', mode: 'light' },
      spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '4' },
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
          shell: 'observed-shell',
          features: [],
          description: 'Existing app',
          pages: [{ id: 'home', route: '/', layout: ['home-surface'] }],
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
  };
}

function sha256File(path: string): string {
  return `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((item) => stableJson(item)).join(',')}]`;
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

function sha256Json(value: unknown): string {
  return `sha256:${createHash('sha256').update(stableJson(value)).digest('hex')}`;
}

function analysisProjection(analysis: Record<string, any>): Record<string, unknown> {
  return {
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
      routes: (analysis.routes?.routes ?? []).map((route: Record<string, unknown>) => ({
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
  };
}

function writeCurrentGraph(appRoot: string): void {
  const graphRoot = join(appRoot, '.decantr', 'graph');
  const snapshotId = 'graph:test-current';
  writeJson(join(graphRoot, 'graph.snapshot.json'), {
    id: snapshotId,
    schema_version: '1.0.0',
    project_id: 'test-project',
    created_at: GENERATED_AT,
    source_hash: 'sha256:test-source',
    nodes: [],
    edges: [],
    summary: { nodes: 0, edges: 0, findings: 0, evidence: 0 },
  });
  writeJson(join(graphRoot, 'graph.manifest.json'), {
    schema_version: '1.0.0',
    snapshot_id: snapshotId,
    project_id: 'test-project',
    generated_at: GENERATED_AT,
    sources: [
      {
        id: 'src:decantr.essence.json',
        kind: 'essence',
        path: 'decantr.essence.json',
        hash: sha256File(join(appRoot, 'decantr.essence.json')),
      },
    ],
    outputs: { snapshot: '.decantr/graph/graph.snapshot.json' },
    warnings: [],
  });
  writeJson(join(graphRoot, 'contract-capsule.json'), {
    snapshot_id: snapshotId,
    source_hash: 'sha256:test-source',
    summary: { routes: 1, source_artifacts: 1 },
  });
}

type ReceiptStatus = 'verified-untouched' | 'source-changed' | 'incomplete';

function adoptionReceipt(
  input: {
    scopeRoot?: string;
    status?: ReceiptStatus;
    complete?: boolean;
    created?: string[];
    updated?: string[];
    deleted?: string[];
    hostSource?: Partial<{ created: string[]; updated: string[]; deleted: string[] }>;
    workflowCompleted?: boolean;
  } = {},
): Record<string, unknown> {
  const status = input.status ?? 'verified-untouched';
  const hostSource = {
    created: input.hostSource?.created ?? [],
    updated: input.hostSource?.updated ?? [],
    deleted: input.hostSource?.deleted ?? [],
  };
  return {
    version: 1,
    scope: {
      root: input.scopeRoot ?? '.',
      hashAlgorithm: 'sha256',
      symlinkPolicy: 'not-followed',
      excludedDirectories: [],
      excludedPaths: [],
      bounds: {
        maxDepth: 64,
        maxEntries: 20_000,
        maxFiles: 10_000,
        maxFileSizeBytes: 8_388_608,
        maxTotalBytes: 134_217_728,
      },
    },
    integrity: {
      status,
      complete: input.complete ?? status !== 'incomplete',
      hostSourceBeforeHash: 'sha256:before',
      hostSourceAfterHash: status === 'verified-untouched' ? 'sha256:before' : 'sha256:after',
    },
    changes: {
      created: input.created ?? [],
      updated: input.updated ?? [],
      deleted: input.deleted ?? [],
      decantrManaged: { created: [], updated: [], deleted: [] },
      hostSource,
      hostOther: { created: [], updated: [], deleted: [] },
    },
    limitations:
      status === 'incomplete' ? [{ phase: 'before', code: 'symlink', path: 'src/linked.ts' }] : [],
    workflowCompleted: input.workflowCompleted ?? true,
    packHydration: {
      requested: false,
      status: 'skipped',
      writtenPathCount: 0,
      limitation: null,
    },
  };
}

function writeProjectJson(appRoot: string, receipt?: Record<string, unknown>): void {
  writeJson(join(appRoot, '.decantr', 'project.json'), {
    initialized: {
      workflowMode: 'brownfield-attach',
      adoptionMode: 'contract-only',
      ...(receipt ? { adoption: receipt } : {}),
    },
  });
}

function writeAcceptedLocalLaw(appRoot: string): void {
  writeJson(join(appRoot, '.decantr', 'local-patterns.json'), {
    version: 2,
    status: 'accepted',
    patterns: [{ id: 'button', componentPaths: ['src/components/Button.tsx'] }],
  });
  writeJson(join(appRoot, '.decantr', 'rules.json'), {
    version: 1,
    status: 'accepted',
    generatedAt: GENERATED_AT,
    source: 'test',
    purpose: 'test law',
    enforcement: { defaultSeverity: 'warn', mode: 'warn', notes: [] },
    rules: [],
  });
}

function writeApp(
  appRoot: string,
  options: {
    packageManager?: boolean;
    essence?: boolean;
    graph?: boolean;
    localLaw?: boolean;
    packs?: boolean;
    receipt?: Record<string, unknown> | null;
  } = {},
): void {
  writeJson(join(appRoot, 'package.json'), {
    name: '@fixture/web',
    ...(options.packageManager === false ? {} : { packageManager: 'pnpm@10.33.0' }),
    dependencies: {
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      'react-router-dom': '^7.0.0',
    },
    devDependencies: { typescript: '^6.0.0', vite: '^8.0.0' },
  });
  if (options.packageManager !== false)
    write(join(appRoot, 'pnpm-lock.yaml'), 'lockfileVersion: 9\n');
  writeJson(join(appRoot, 'tsconfig.json'), { compilerOptions: { jsx: 'react-jsx' } });
  write(
    join(appRoot, 'src', 'App.tsx'),
    [
      "import { Route, Routes } from 'react-router-dom';",
      'export function App() {',
      '  return <Routes><Route path="/" element={<Home />} /></Routes>;',
      '}',
      'function Home() { return <main />; }',
      '',
    ].join('\n'),
  );
  write(
    join(appRoot, 'src', 'components', 'Button.tsx'),
    'export function Button() { return <button type="button" />; }\n',
  );
  write(join(appRoot, 'src', 'styles.css'), ':root { --surface: #fff; }\n');
  if (options.essence !== false) writeJson(join(appRoot, 'decantr.essence.json'), validEssence());
  if (options.localLaw !== false) writeAcceptedLocalLaw(appRoot);
  if (options.packs !== false) {
    writeJson(join(appRoot, '.decantr', 'context', 'pack-manifest.json'), {
      version: 1,
      scaffold: { markdown: '.decantr/context/scaffold-pack.md' },
    });
  }
  if (options.graph !== false && options.essence !== false) writeCurrentGraph(appRoot);
  if (options.receipt === null) writeProjectJson(appRoot);
  else writeProjectJson(appRoot, options.receipt ?? adoptionReceipt());
}

function findFact(truth: AdoptionTruthV1, id: string) {
  const selected = truth.facts.find((fact) => fact.id === id);
  if (!selected) throw new Error(`Missing fact ${id}`);
  return selected;
}

function inventory(root: string): string[] {
  const files: string[] = [];
  const walk = (directory: string, prefix = ''): void => {
    for (const entry of readdirSync(directory).sort()) {
      const path = join(directory, entry);
      const relativePath = prefix ? `${prefix}/${entry}` : entry;
      if (statSync(path).isDirectory()) walk(path, relativePath);
      else files.push(`${relativePath}:${sha256File(path)}`);
    }
  };
  walk(root);
  return files;
}

describe('createProjectAdoptionTruthV1', () => {
  it('builds a schema-valid truth for a single app without mutating the project', () => {
    const root = temporaryRoot('single');
    writeApp(root, {
      receipt: adoptionReceipt({
        created: [
          'decantr.essence.json',
          '.decantr/graph/graph.snapshot.json',
          '.decantr/graph/graph.manifest.json',
          '.decantr/graph/contract-capsule.json',
          '.decantr/context/pack-manifest.json',
        ],
      }),
    });
    const before = inventory(root);

    const truth = createProjectAdoptionTruthV1(root, { generatedAt: GENERATED_AT });

    expect(truth.project).toMatchObject({ workspaceRoot: '.', selectedAppRoot: '.' });
    expect(truth.facts).toHaveLength(13);
    expect(findFact(truth, 'project.framework').observation.state).toBe('found');
    expect(findFact(truth, 'governance.essence-contract').governance.state).toBe('governed');
    expect(findFact(truth, 'governance.typed-graph').observation.state).toBe('found');
    expect(findFact(truth, 'adoption.support-artifacts').mutation.state).toBe('untouched');
    expect(findFact(truth, 'adoption.host-source-integrity').mutation.state).toBe('untouched');
    expect(truth.nextAction).toContain('decantr task');
    assertMatchesVerifierSchema('adoption-truth.v1.json', truth);
    expect(inventory(root)).toEqual(before);
  });

  it('keeps selected monorepo app paths workspace-relative without duplicating scope', () => {
    const workspace = temporaryRoot('workspace');
    const appRoot = join(workspace, 'apps', 'web');
    writeJson(join(workspace, 'package.json'), {
      name: '@fixture/workspace',
      private: true,
      packageManager: 'pnpm@10.33.0',
      workspaces: ['apps/*'],
    });
    write(join(workspace, 'pnpm-workspace.yaml'), "packages:\n  - 'apps/*'\n");
    write(join(workspace, 'pnpm-lock.yaml'), 'lockfileVersion: 9\n');
    write(join(workspace, 'AGENTS.md'), '# Workspace rules\n');
    writeApp(appRoot, {
      packageManager: false,
      receipt: adoptionReceipt({
        scopeRoot: 'apps/web',
        created: ['apps/web/decantr.essence.json', '.decantr/graph/graph.snapshot.json'],
      }),
    });

    const truth = createProjectAdoptionTruthV1(appRoot, { generatedAt: GENERATED_AT });
    const serialized = JSON.stringify(truth);

    expect(truth.project.selectedAppRoot).toBe('apps/web');
    expect(findFact(truth, 'project.package-manager').observation.provenance[0]?.path).toBe(
      'package.json',
    );
    expect(findFact(truth, 'project.assistant-rules').observation.provenance[0]?.path).toBe(
      'AGENTS.md',
    );
    expect(serialized).not.toContain('apps/web/apps/web');
    expect(serialized).not.toContain(workspace);
    expect(serialized).not.toContain(appRoot);
  });

  it('keeps historical projects without receipts at not_checked', () => {
    const root = temporaryRoot('historical');
    writeApp(root, { receipt: null });

    const truth = createProjectAdoptionTruthV1(root, { generatedAt: GENERATED_AT });
    const sourceIntegrity = findFact(truth, 'adoption.host-source-integrity');

    expect(sourceIntegrity.observation.state).toBe('unknown');
    expect(sourceIntegrity.mutation).toEqual({ state: 'not_checked', receiptIds: [] });
    expect(sourceIntegrity.limitations.join(' ')).toContain('predates adoption receipts');
  });

  it('uses a complete verified receipt to prove host source untouched', () => {
    const root = temporaryRoot('verified');
    writeApp(root, {
      receipt: adoptionReceipt({
        created: ['decantr.essence.json', '.decantr/graph/graph.snapshot.json'],
      }),
    });

    const truth = createProjectAdoptionTruthV1(root, { generatedAt: GENERATED_AT });

    expect(findFact(truth, 'adoption.host-source-integrity').mutation.state).toBe('untouched');
    expect(findFact(truth, 'governance.essence-contract').mutation.state).toBe('created');
    expect(
      truth.mutationReceipts.find((receipt) => receipt.id === 'adoption-receipt:v1:host-source'),
    ).toMatchObject({ complete: true, outcome: 'untouched' });
  });

  it('accepts created-only host-source receipts without changing their outcome', () => {
    const root = temporaryRoot('source-created');
    writeApp(root, {
      receipt: adoptionReceipt({
        status: 'source-changed',
        created: ['src/New.tsx'],
        hostSource: { created: ['src/New.tsx'] },
      }),
    });

    const truth = createProjectAdoptionTruthV1(root, { generatedAt: GENERATED_AT });

    expect(findFact(truth, 'adoption.host-source-integrity').mutation.state).toBe('created');
    expect(
      truth.mutationReceipts.find((receipt) => receipt.id === 'adoption-receipt:v1:host-source'),
    ).toMatchObject({ complete: true, outcome: 'created', createdPaths: ['src/New.tsx'] });
  });

  it('recomputes semantic graph source hashes and ignores non-semantic metadata', () => {
    const root = temporaryRoot('semantic-graph-source');
    writeApp(root);
    const analysisPath = join(root, '.decantr', 'analysis.json');
    const analysis = {
      analyzedAt: '2026-07-15T12:00:00.000Z',
      project: {
        framework: 'react',
        frameworkVersion: '19.0.0',
        packageManager: 'pnpm',
        hasTypeScript: true,
        hasTailwind: false,
        projectScope: 'single-app',
      },
      routes: {
        strategy: 'react-router',
        routes: [{ path: '/', file: 'src/App.tsx', hasLayout: false }],
      },
      styling: { approach: 'css', configFile: null, darkMode: false, cssVariables: true },
      layout: { shellPattern: 'single-column' },
      features: { detected: ['routing'] },
    };
    writeJson(analysisPath, analysis);
    const visualManifestPath = join(root, '.decantr', 'evidence', 'visual-manifest.json');
    const visualManifest = {
      version: 1,
      generatedAt: '2026-07-15T12:00:00.000Z',
      localOnly: true,
      baseUrl: 'http://127.0.0.1:3000',
      routes: [
        {
          route: '/',
          url: 'http://127.0.0.1:3000/',
          screenshot: null,
          screenshotHash: null,
          status: 'captured',
          error: undefined,
        },
      ],
    };
    writeJson(visualManifestPath, visualManifest);
    const evidenceBundlePath = join(root, '.decantr', 'evidence', 'latest.json');
    const evidenceBundle = {
      generatedAt: '2026-07-15T12:00:00.000Z',
      health: {
        status: 'warning',
        score: 90,
        errorCount: 0,
        warnCount: 1,
        infoCount: 0,
        findingCount: 1,
      },
      provenance: {
        essence: {
          path: 'decantr.essence.json',
          present: true,
          hash: sha256File(join(root, 'decantr.essence.json')),
          generatedAt: '2026-07-15T12:00:00.000Z',
        },
      },
      findings: [
        {
          id: 'test-finding',
          code: 'TEST001',
          source: 'audit',
          category: 'Components',
          severity: 'warn',
          message: 'Review the component.',
          target: 'src/App.tsx',
          rule: 'review-component',
          suggestedFix: 'Use the project component.',
          evidence: ['src/App.tsx'],
          commands: ['decantr verify'],
        },
      ],
    };
    writeJson(evidenceBundlePath, evidenceBundle);
    const manifestPath = join(root, '.decantr', 'graph', 'graph.manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, any>;
    manifest.sources.push({
      id: 'src:.decantr/analysis.json',
      kind: 'brownfield-analysis',
      path: '.decantr/analysis.json',
      hash: sha256Json(analysisProjection(analysis)),
    });
    manifest.sources.push({
      id: 'src:.decantr/evidence/visual-manifest.json',
      kind: 'visual-manifest',
      path: '.decantr/evidence/visual-manifest.json',
      hash: sha256Json({
        version: visualManifest.version,
        localOnly: visualManifest.localOnly,
        baseUrl: visualManifest.baseUrl,
        routes: visualManifest.routes.map((route) => ({
          route: route.route,
          url: route.url,
          screenshot: route.screenshot,
          screenshotHash: route.screenshotHash,
          status: route.status,
          error: route.error,
        })),
      }),
    });
    manifest.sources.push({
      id: 'src:.decantr/evidence/latest.json',
      kind: 'evidence-bundle',
      path: '.decantr/evidence/latest.json',
      hash: sha256Json({
        health: evidenceBundle.health,
        provenance: [
          {
            key: 'essence',
            path: evidenceBundle.provenance.essence.path,
            present: evidenceBundle.provenance.essence.present,
            hash: evidenceBundle.provenance.essence.hash,
          },
        ],
        findings: evidenceBundle.findings.map((finding) => ({
          ...finding,
          graph: undefined,
          repair: undefined,
          repairPlan: undefined,
        })),
      }),
    });
    writeJson(manifestPath, manifest);

    analysis.analyzedAt = '2026-07-16T13:00:00.000Z';
    visualManifest.generatedAt = '2026-07-16T13:00:00.000Z';
    evidenceBundle.generatedAt = '2026-07-16T13:00:00.000Z';
    evidenceBundle.provenance.essence.generatedAt = '2026-07-16T13:00:00.000Z';
    writeJson(analysisPath, analysis);
    writeJson(visualManifestPath, visualManifest);
    writeJson(evidenceBundlePath, evidenceBundle);
    const metadataOnly = createProjectAdoptionTruthV1(root, { generatedAt: GENERATED_AT });
    expect(findFact(metadataOnly, 'governance.typed-graph').governance.state).toBe('advisory');
    expect(findFact(metadataOnly, 'governance.typed-graph').limitations).toEqual([]);

    analysis.project.framework = 'vue';
    writeJson(analysisPath, analysis);
    const semanticallyChanged = createProjectAdoptionTruthV1(root, { generatedAt: GENERATED_AT });
    expect(findFact(semanticallyChanged, 'governance.typed-graph').governance.state).toBe(
      'uncovered',
    );
    expect(findFact(semanticallyChanged, 'governance.typed-graph').limitations.join(' ')).toContain(
      'no longer matches its recorded evidence',
    );
  });

  it('projects every remaining receipt path as an adoption support artifact', () => {
    const root = temporaryRoot('support-artifacts');
    writeApp(root, {
      receipt: adoptionReceipt({
        created: [
          'decantr.essence.json',
          '.decantr/graph/graph.snapshot.json',
          'DECANTR.md',
          '.cursor/rules/decantr.mdc',
        ],
        updated: ['.prettierignore'],
      }),
    });

    const truth = createProjectAdoptionTruthV1(root, { generatedAt: GENERATED_AT });
    const support = findFact(truth, 'adoption.support-artifacts');
    const supportReceipt = truth.mutationReceipts.find(
      (receipt) => receipt.id === 'adoption-receipt:v1:support-artifacts',
    );

    expect(support.mutation.state).toBe('updated');
    expect(supportReceipt).toMatchObject({
      createdPaths: ['.cursor/rules/decantr.mdc', 'DECANTR.md'],
      updatedPaths: ['.prettierignore'],
      complete: true,
      outcome: 'updated',
    });
  });

  it('never upgrades source-changed or incomplete receipts to untouched', () => {
    const changedRoot = temporaryRoot('source-changed');
    writeApp(changedRoot, {
      receipt: adoptionReceipt({
        status: 'source-changed',
        updated: ['src/App.tsx'],
        hostSource: { updated: ['src/App.tsx'] },
      }),
    });
    const incompleteRoot = temporaryRoot('incomplete');
    writeApp(incompleteRoot, {
      receipt: adoptionReceipt({ status: 'incomplete', complete: false }),
    });

    const changed = findFact(
      createProjectAdoptionTruthV1(changedRoot, { generatedAt: GENERATED_AT }),
      'adoption.host-source-integrity',
    );
    const incomplete = findFact(
      createProjectAdoptionTruthV1(incompleteRoot, { generatedAt: GENERATED_AT }),
      'adoption.host-source-integrity',
    );

    expect(changed.mutation.state).toBe('updated');
    expect(changed.mutation.state).not.toBe('untouched');
    expect(incomplete.mutation.state).toBe('not_checked');
    expect(incomplete.mutation.state).not.toBe('untouched');
  });

  it('keeps low-confidence discovery conservative and limitation-backed', () => {
    const root = temporaryRoot('low-confidence');

    const truth = createProjectAdoptionTruthV1(root, { generatedAt: GENERATED_AT });
    const lowConfidenceFacts = truth.facts.filter((fact) => fact.observation.confidence === 'low');

    expect(lowConfidenceFacts.length).toBeGreaterThan(0);
    expect(lowConfidenceFacts.every((fact) => fact.limitations.length > 0)).toBe(true);
    expect(findFact(truth, 'project.framework').observation.state).toBe('unknown');
    expect(findFact(truth, 'adoption.host-source-integrity').mutation.state).toBe('not_checked');
  });

  it('selects the deterministic next action in contract, graph, local-law, task order', () => {
    const missingContract = temporaryRoot('next-contract');
    writeApp(missingContract, { essence: false, graph: false, localLaw: false });
    const missingGraph = temporaryRoot('next-graph');
    writeApp(missingGraph, { graph: false, localLaw: false });
    const missingLaw = temporaryRoot('next-law');
    writeApp(missingLaw, { localLaw: false });
    const ready = temporaryRoot('next-task');
    writeApp(ready);

    expect(
      createProjectAdoptionTruthV1(missingContract, { generatedAt: GENERATED_AT }).nextAction,
    ).toContain('decantr init --existing');
    expect(
      createProjectAdoptionTruthV1(missingGraph, { generatedAt: GENERATED_AT }).nextAction,
    ).toContain('decantr graph');
    expect(
      createProjectAdoptionTruthV1(missingLaw, { generatedAt: GENERATED_AT }).nextAction,
    ).toContain('decantr codify --from-audit');
    expect(createProjectAdoptionTruthV1(ready, { generatedAt: GENERATED_AT }).nextAction).toContain(
      'decantr task',
    );
  });

  it('orders output deterministically and redacts absolute roots', () => {
    const root = temporaryRoot('deterministic');
    writeApp(root);

    const first = createProjectAdoptionTruthV1(root, { generatedAt: GENERATED_AT });
    const second = createProjectAdoptionTruthV1(root, { generatedAt: GENERATED_AT });

    expect(second).toEqual(first);
    expect(first.facts.map((entry) => entry.id)).toEqual(
      [...first.facts.map((entry) => entry.id)].sort(),
    );
    expect(first.mutationReceipts.map((entry) => entry.id)).toEqual(
      [...first.mutationReceipts.map((entry) => entry.id)].sort(),
    );
    expect(JSON.stringify(first)).not.toContain(root);
  });
});

describe('project identity v1', () => {
  it('is clone-independent, workspace-relative, and usable from pure metadata', () => {
    const firstRoot = temporaryRoot('identity-a');
    const secondRoot = temporaryRoot('identity-b');
    writeApp(firstRoot);
    writeApp(secondRoot);

    const metadataIdentity = createProjectIdentityV1({
      selectedAppRoot: 'apps/web',
      packageName: '@fixture/web',
      workspacePackageName: '@fixture/workspace',
    });
    const normalizedIdentity = createProjectIdentityV1({
      selectedAppRoot: './apps//web',
      packageName: '@fixture/web',
      workspacePackageName: '@fixture/workspace',
    });

    expect(metadataIdentity).toBe(normalizedIdentity);
    expect(createStableProjectIdentityV1(firstRoot)).toBe(
      createStableProjectIdentityV1(secondRoot),
    );
    expect(metadataIdentity).toMatch(/^project:v1:sha256:[a-f0-9]{64}$/);
    expect(metadataIdentity).not.toContain(firstRoot);
    expect(() =>
      createProjectIdentityV1({
        selectedAppRoot: firstRoot,
        packageName: '@fixture/web',
        workspacePackageName: '@fixture/workspace',
      }),
    ).toThrow(/workspace-relative/);
    expect(() =>
      createProjectIdentityV1({
        selectedAppRoot: 'C:\\workspace\\apps\\web',
        packageName: '@fixture/web',
        workspacePackageName: '@fixture/workspace',
      }),
    ).toThrow(/workspace-relative/);
  });
});
