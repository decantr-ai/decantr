import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

function runCli(cwd: string, args: string[]): string {
  const cliPath = join(__dirname, '..', '..', 'dist', 'index.js');
  return execFileSync('node', [cliPath, ...args], {
    cwd,
    encoding: 'utf-8',
    timeout: 45_000,
    env: { ...process.env, DECANTR_OFFLINE: 'true' },
  });
}

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
          features: [],
          description: 'Existing app',
          pages: [{ id: 'home', route: '/', layout: ['existing-surface'] }],
        },
      ],
      features: [],
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

function stripAnsi(value: string): string {
  return value.replace(new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g'), '');
}

describe('operating layer commands', () => {
  let testDir = '';

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-operating-layer-'));
    mkdirSync(join(testDir, 'apps', 'web', '.decantr', 'context'), { recursive: true });
    mkdirSync(join(testDir, 'apps', 'platform-api', 'src'), { recursive: true });
    mkdirSync(join(testDir, 'packages', 'ui'), { recursive: true });
    mkdirSync(join(testDir, 'packages', 'design-system'), { recursive: true });
    writeFileSync(join(testDir, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n  - packages/*\n');
    writeJson(join(testDir, 'package.json'), {
      private: true,
      packageManager: 'pnpm@10.0.0',
      devDependencies: { '@decantr/cli': '2.9.0' },
    });
    writeJson(join(testDir, 'apps', 'web', 'package.json'), {
      name: 'web',
      dependencies: { react: '^19.0.0' },
    });
    writeJson(join(testDir, 'apps', 'platform-api', 'package.json'), {
      name: 'platform-api',
      dependencies: { hono: '^4.0.0' },
    });
    writeJson(join(testDir, 'packages', 'design-system', 'package.json'), {
      name: 'design-system',
      dependencies: { react: '^19.0.0' },
    });
    writeEssence(join(testDir, 'apps', 'web'));
    writeJson(join(testDir, 'apps', 'web', '.decantr', 'project.json'), {
      sync: { status: 'not-required', registrySource: 'cache' },
      initialized: {
        version: '2.9.0',
        workflowMode: 'brownfield-attach',
        adoptionMode: 'contract-only',
        projectScope: 'workspace-app',
      },
    });
    writeFileSync(join(testDir, 'apps', 'web', 'DECANTR.md'), '# Decantr\n');
    writeFileSync(
      join(testDir, 'apps', 'web', '.decantr', 'context', 'scaffold.md'),
      '# Scaffold\n',
    );
    writeJson(join(testDir, 'apps', 'web', '.decantr', 'context', 'pack-manifest.json'), {
      $schema: 'https://decantr.ai/schemas/pack-manifest.v1.json',
      version: '1.0.0',
      generatedAt: '2026-05-14T00:00:00.000Z',
      scaffold: { id: 'scaffold', markdown: 'scaffold-pack.md', json: 'scaffold-pack.json' },
      review: { id: 'review', markdown: 'review-pack.md', json: 'review-pack.json' },
      sections: [
        {
          id: 'app',
          markdown: 'section-app-pack.md',
          json: 'section-app-pack.json',
          pageIds: ['home'],
        },
      ],
      pages: [
        {
          id: 'home',
          markdown: 'page-home-pack.md',
          json: 'page-home-pack.json',
          sectionId: 'app',
          sectionRole: 'primary',
        },
      ],
      mutations: [
        {
          id: 'modify',
          markdown: 'mutation-modify-pack.md',
          json: 'mutation-modify-pack.json',
          mutationType: 'modify',
        },
      ],
    });
    for (const file of [
      'scaffold-pack.md',
      'scaffold-pack.json',
      'review-pack.md',
      'review-pack.json',
      'section-app-pack.md',
      'section-app-pack.json',
      'page-home-pack.md',
      'page-home-pack.json',
      'mutation-modify-pack.md',
      'mutation-modify-pack.json',
    ]) {
      writeFileSync(join(testDir, 'apps', 'web', '.decantr', 'context', file), '{}\n');
    }
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('explains monorepo project state and design authority', () => {
    const output = runCli(testDir, ['doctor', '--project', 'apps/web']);

    expect(output).toContain('Decantr Doctor');
    expect(output).toContain('Workflow: brownfield-attach | adoption contract-only');
    expect(output).toContain('Adoption Lane:');
    expect(output).toContain('Brownfield contract-only');
    expect(output).toContain('Existing app is authoritative');
    expect(output).toContain('packages/ui');
    expect(output).toContain('Typed graph: stale or missing');
    expect(output).toContain('Typed Contract graph artifacts are missing or stale');
    expect(output).toContain('decantr graph --project apps/web');
    expect(output).toContain('Next steps:');
  });

  it('does not crash when CI scan candidates are directories', () => {
    mkdirSync(join(testDir, 'BUILD'), { recursive: true });
    mkdirSync(join(testDir, 'node_modules', 'pkg', '.github', 'workflows'), { recursive: true });
    writeFileSync(
      join(testDir, 'node_modules', 'pkg', '.github', 'workflows', 'ci.yml'),
      'name: dependency\nrun: decantr verify\n',
    );

    const output = runCli(testDir, ['doctor', '--project', 'apps/web']);

    expect(output).toContain('Decantr Doctor');
    expect(output).not.toContain('BUILD');
    expect(output).not.toContain('node_modules/pkg/.github/workflows/ci.yml');
  });

  it('reports current typed Contract graph artifacts in doctor after graph generation', () => {
    runCli(testDir, ['graph', '--project', 'apps/web']);

    const output = runCli(testDir, ['doctor', '--project', 'apps/web']);

    expect(output).toContain('Typed graph: current');
    expect(output).toContain('Graph capsule: present');
    expect(output).not.toContain('Typed Contract graph artifacts are missing or stale');
  });

  it('carries typed Contract graph readiness through CI JSON after graph generation', () => {
    runCli(testDir, ['graph', '--project', 'apps/web']);

    const report = JSON.parse(
      runCli(testDir, ['ci', '--project', 'apps/web', '--fail-on', 'none', '--json']),
    ) as {
      health: {
        graph: {
          present: boolean;
          ready: boolean;
          current: boolean | null;
          capsulePresent: boolean;
          snapshotId: string | null;
          contractCacheKey: string | null;
          sourceArtifactCount: number;
        };
        findings: Array<{ rule?: string }>;
      };
    };

    expect(report.health.graph).toMatchObject({
      present: true,
      ready: true,
      current: true,
      capsulePresent: true,
    });
    expect(report.health.graph.snapshotId).toMatch(/^graph:/);
    expect(report.health.graph.contractCacheKey).toMatch(/^decantr-contract:fnv1a32:/);
    expect(report.health.graph.sourceArtifactCount).toBeGreaterThan(0);
    expect(report.health.findings.some((finding) => finding.rule === 'typed-graph-current')).toBe(
      false,
    );
  });

  it('previews the typed Contract graph during read-only scan without writing artifacts', () => {
    const output = runCli(testDir, ['scan', '--project', 'apps/web', '--json']);
    const report = JSON.parse(output) as {
      graphPreview?: {
        status?: string;
        canPreview?: boolean;
        snapshot?: { nodes?: number; edges?: number; sourceArtifacts?: number } | null;
        capsule?: {
          routes?: number;
          sourceArtifacts?: number;
          sourceArtifactLimit?: number;
          sourceArtifactsTruncated?: boolean;
        } | null;
        diff?: {
          ops?: number;
          findingsAdded?: number;
          findingsResolved?: number;
          evidenceAdded?: number;
        } | null;
        staleArtifacts?: string[];
        nextCommand?: string | null;
      };
    };

    expect(report.graphPreview?.status).toBe('stale');
    expect(report.graphPreview?.canPreview).toBe(true);
    expect(report.graphPreview?.snapshot?.nodes).toBeGreaterThan(0);
    expect(report.graphPreview?.snapshot?.edges).toBeGreaterThan(0);
    expect(report.graphPreview?.snapshot?.sourceArtifacts).toBeGreaterThan(0);
    expect(report.graphPreview?.capsule?.routes).toBe(1);
    expect(report.graphPreview?.capsule?.sourceArtifacts).toBeGreaterThan(0);
    expect(report.graphPreview?.capsule?.sourceArtifactLimit).toBe(200);
    expect(report.graphPreview?.capsule?.sourceArtifactsTruncated).toBe(false);
    expect(report.graphPreview?.diff).toMatchObject({
      ops: 0,
      findingsAdded: 0,
      findingsResolved: 0,
      evidenceAdded: 0,
    });
    expect(report.graphPreview?.staleArtifacts).toContain(
      'apps/web/.decantr/graph/graph.snapshot.json',
    );
    expect(report.graphPreview?.nextCommand).toBe('decantr graph --project apps/web');
    expect(existsSync(join(testDir, 'apps', 'web', '.decantr', 'graph'))).toBe(false);
  });

  it('promotes accepted local law as the first Hybrid lane', () => {
    writeJson(join(testDir, 'apps', 'web', '.decantr', 'local-patterns.json'), {
      version: 2,
      status: 'accepted',
      patterns: [{ id: 'button', role: 'Project-owned buttons' }],
    });
    writeJson(join(testDir, 'apps', 'web', '.decantr', 'rules.json'), {
      version: 1,
      status: 'accepted',
      rules: [],
    });

    const output = runCli(testDir, ['doctor', '--project', 'apps/web']);

    expect(output).toContain('Hybrid local law');
    expect(output).toContain('accepted local patterns/rules');
    expect(output).toContain('map hosted patterns into local law');
  });

  it('codifies a Hybrid style bridge and surfaces it in doctor, task, suggest, and CI', () => {
    mkdirSync(join(testDir, 'apps', 'web', 'src', 'components'), { recursive: true });
    mkdirSync(join(testDir, 'apps', 'web', 'src', 'styles'), { recursive: true });
    writeFileSync(
      join(testDir, 'apps', 'web', 'src', 'components', 'Button.tsx'),
      'export function Button() { return <button className="btn primary action">Save</button>; }\n',
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'apps', 'web', 'src', 'styles', 'themes.css'),
      ':root { --surface: #fff; --primary: #2563eb; } [data-theme="dark"] { --surface: #111827; }\n',
      'utf-8',
    );
    writeJson(join(testDir, 'apps', 'web', '.decantr', 'theme-inventory.json'), {
      modes: ['base', 'dark'],
      variants: [{ id: 'dark' }],
      darkModeDetected: true,
    });

    const proposalOutput = runCli(testDir, [
      'codify',
      '--project',
      'apps/web',
      '--from-audit',
      '--style-bridge',
    ]);
    const acceptOutput = runCli(testDir, ['codify', '--project', 'apps/web', '--accept']);
    const doctor = runCli(testDir, ['doctor', '--project', 'apps/web']);
    const setup = runCli(join(testDir, 'apps', 'web'), ['setup']);
    const task = JSON.parse(
      runCli(testDir, [
        'task',
        '/',
        'standardize primary action styling',
        '--project',
        'apps/web',
        '--json',
      ]),
    ) as {
      authority: { lane: string; activeAuthorities: string[] };
      styleBridge: { path: string | null; mappingCount: number };
    };
    const suggestions = runCli(testDir, [
      'suggest',
      'standardize actions',
      '--project',
      'apps/web',
    ]);
    const ci = JSON.parse(
      runCli(testDir, ['ci', '--project', 'apps/web', '--fail-on', 'none', '--json']),
    ) as {
      health: { findings: Array<{ id: string }> };
      styleBridge?: { present?: boolean; mappingCount?: number; themeModes?: string[] };
    };

    expect(proposalOutput).toContain('Wrote style bridge proposal');
    expect(acceptOutput).toContain('Accepted style bridge');
    expect(acceptOutput).toContain('Hybrid style bridge is now active');
    expect(doctor).toContain('Hybrid style bridge');
    expect(doctor).toContain('Style bridge: present');
    expect(setup).toContain('decantr doctor');
    expect(setup).toContain('decantr task <route> "<change>"');
    expect(setup).toContain('decantr ci init');
    expect(setup).not.toContain('codify --from-audit');
    expect(task.authority.lane).toBe('Hybrid style bridge');
    expect(task.authority.activeAuthorities).toContain('accepted style bridge');
    expect(task.styleBridge.path).toBe('apps/web/.decantr/style-bridge.json');
    expect(task.styleBridge.mappingCount).toBeGreaterThan(0);
    expect(suggestions).toContain('Project-owned style bridge');
    expect(suggestions).toContain('action');
    expect(ci.styleBridge?.present).toBe(true);
    expect(ci.styleBridge?.mappingCount).toBeGreaterThan(0);
    expect(ci.styleBridge?.themeModes).toContain('dark');
    const ciFindingIds = ci.health.findings.map((finding) => finding.id);
    expect(ciFindingIds).not.toContain('assertion-contract-design-token-tokens-file');
    expect(ciFindingIds).not.toContain('assertion-contract-context-pack-manifest');
    expect(ciFindingIds).not.toContain('assertion-contract-context-review-pack');
  }, 20_000);

  it('explains workspace state without requiring an essence at the root', () => {
    const output = runCli(testDir, ['doctor', '--workspace']);

    expect(output).toContain('Decantr Doctor');
    expect(output).toContain('Attached projects: 1');
    expect(output).not.toContain('No decantr.essence.json found');
    expect(output).toContain('decantr ci init --workspace');
  });

  it('does not list React library packages as app candidates', () => {
    const output = runCli(testDir, ['workspace', 'list']);

    expect(output).toContain('apps/web');
    expect(output).not.toContain('apps/platform-api');
    expect(output).not.toContain('packages/design-system');
  });

  it('recommends attaching another app after one project is already attached', () => {
    mkdirSync(join(testDir, 'apps', 'admin', 'src'), { recursive: true });
    writeJson(join(testDir, 'apps', 'admin', 'package.json'), {
      name: 'admin',
      dependencies: { react: '^19.0.0' },
    });

    const output = runCli(testDir, ['workspace', 'list']);

    expect(output).toContain('apps/web');
    expect(output).toContain('apps/admin');
    expect(output).toContain('Attach another app:');
    expect(output).toContain('decantr adopt --project apps/admin --yes');
    expect(output).not.toContain('Start by attaching one app:');
  });

  it('orients monorepo roots toward app-scoped doctor instead of root setup', () => {
    const output = runCli(testDir, ['doctor']);

    expect(output).toContain('This is a monorepo root');
    expect(output).toContain('Workspace overview');
    expect(output).toContain('decantr doctor --project apps/web');
    expect(output).not.toContain('No decantr.essence.json found');
  });

  it('uses setup as a post-adoption monorepo dashboard when apps are attached', () => {
    const output = runCli(testDir, ['setup']);

    expect(output).toContain('Decantr is already attached to at least one app');
    expect(output).toContain('Attached projects:');
    expect(output).toContain('apps/web');
    expect(output).toContain('decantr doctor --project apps/web');
    expect(output).toContain('decantr task <route> "<change>" --project apps/web');
    expect(output).toContain('decantr verify --brownfield --local-patterns --project apps/web');
    expect(output).not.toContain('decantr adopt --project apps/web --yes');
  });

  it('keeps setup recommendations aligned with accepted local law inside an app', () => {
    writeJson(join(testDir, 'apps', 'web', '.decantr', 'local-patterns.json'), {
      version: 2,
      status: 'accepted',
      patterns: [{ id: 'button', label: 'Button primitives' }],
    });
    writeJson(join(testDir, 'apps', 'web', '.decantr', 'rules.json'), {
      version: 1,
      status: 'accepted',
      rules: [],
    });

    const output = runCli(join(testDir, 'apps', 'web'), ['setup']);

    expect(output).toContain('decantr verify --brownfield --local-patterns');
    expect(output).toContain('decantr codify --style-bridge');
    expect(output).not.toContain('decantr codify --from-audit');
  });

  it('requires --project for ci from a monorepo root', () => {
    try {
      runCli(testDir, ['ci']);
      throw new Error('Expected ci to require --project.');
    } catch (error) {
      const output = `${(error as { stdout?: Buffer }).stdout?.toString() ?? ''}\n${
        (error as { stderr?: Buffer }).stderr?.toString() ?? ''
      }`;
      expect(output).toContain('Decantr CI needs an app path');
      expect(output).toContain('decantr ci --project apps/web');
    }
  });

  it('requires --project or --workspace when initializing CI from a monorepo root', () => {
    try {
      runCli(testDir, ['ci', 'init']);
      throw new Error('Expected ci init to require --project.');
    } catch (error) {
      const output = `${(error as { stdout?: Buffer }).stdout?.toString() ?? ''}\n${
        (error as { stderr?: Buffer }).stderr?.toString() ?? ''
      }`;
      expect(output).toContain('Decantr CI init needs an app path');
      expect(output).toContain('--project apps/web');
    }
  });

  it('runs brownfield check against the selected project from a monorepo root', () => {
    const output = runCli(testDir, ['check', '--brownfield', '--project', 'apps/web']);

    expect(output).toContain('Scanning for issues');
    expect(output).not.toContain('No decantr.essence.json found');
  });

  it('doctor catches pack manifests that reference missing context files', () => {
    rmSync(join(testDir, 'apps', 'web', '.decantr', 'context', 'page-home-pack.md'), {
      force: true,
    });

    const output = runCli(testDir, ['doctor', '--project', 'apps/web']);

    expect(output).toContain('Manifest references: 1 missing');
    expect(output).toContain('Generated pack manifest references 1 missing file');
    expect(output).toContain(
      'registry compile-packs apps/web/decantr.essence.json --write-context',
    );
  });

  it('does not make hosted pack hydration the doctor next step for contract-only apps', () => {
    rmSync(join(testDir, 'apps', 'web', '.decantr', 'context', 'pack-manifest.json'), {
      force: true,
    });
    rmSync(join(testDir, 'apps', 'web', '.decantr', 'context', 'review-pack.json'), {
      force: true,
    });

    const output = runCli(testDir, ['doctor', '--project', 'apps/web']);

    expect(output).not.toContain('Generated context packs are missing or incomplete');
    expect(output).not.toContain(
      'registry compile-packs apps/web/decantr.essence.json --write-context',
    );
    expect(output).toContain('decantr codify --from-audit --project apps/web');
  });

  it('prints monorepo-scoped pack hydration commands from health findings', () => {
    rmSync(join(testDir, 'apps', 'web', '.decantr', 'context', 'pack-manifest.json'), {
      force: true,
    });
    rmSync(join(testDir, 'apps', 'web', '.decantr', 'context', 'review-pack.json'), {
      force: true,
    });

    const output = runCli(testDir, ['verify', '--project', 'apps/web']);

    expect(output).toContain(
      'registry compile-packs apps/web/decantr.essence.json --write-context',
    );
    expect(output).toContain('decantr ci --project apps/web --fail-on error');
    expect(output).not.toContain('registry compile-packs decantr.essence.json --write-context');
  });

  it('generates root GitHub CI with the pinned package-manager command', () => {
    const output = runCli(testDir, ['ci', 'init', '--project', 'apps/web']);
    const workflow = readFileSync(join(testDir, '.github', 'workflows', 'decantr-ci.yml'), 'utf-8');

    expect(output).toContain('Created Decantr CI workflow');
    expect(workflow).toContain('pnpm exec decantr ci --project apps/web');
    expect(workflow).not.toContain('@decantr/cli@latest');
    expect(workflow).not.toContain('npx --yes');
  });

  it('tells monorepo users how to pin the CLI before relying on generated CI', () => {
    writeJson(join(testDir, 'package.json'), {
      private: true,
      packageManager: 'pnpm@10.0.0',
    });

    const output = runCli(testDir, ['ci', 'init', '--project', 'apps/web']);

    expect(output).toContain('pin it with: pnpm add -D -w @decantr/cli');
    expect(output).toContain('Created Decantr CI workflow');
  });

  it('tells doctor users to pin the CLI before relying on workspace automation', () => {
    writeJson(join(testDir, 'package.json'), {
      private: true,
      packageManager: 'pnpm@10.0.0',
    });

    const output = runCli(testDir, ['doctor', '--project', 'apps/web']);

    expect(output).toContain('@decantr/cli is not pinned in the workspace root package.json');
    expect(output).toContain('pnpm add -D -w @decantr/cli');
  });

  it('still writes monorepo CI at the workspace root when invoked inside an app', () => {
    const appRoot = join(testDir, 'apps', 'web');

    runCli(appRoot, ['ci', 'init']);

    const workflowPath = join(testDir, '.github', 'workflows', 'decantr-ci.yml');
    const appWorkflowPath = join(appRoot, '.github', 'workflows', 'decantr-ci.yml');
    const workflow = readFileSync(workflowPath, 'utf-8');

    expect(existsSync(workflowPath)).toBe(true);
    expect(existsSync(appWorkflowPath)).toBe(false);
    expect(workflow).toContain('pnpm exec decantr ci --project apps/web');
  });

  it('writes a portable generic CI snippet', () => {
    runCli(testDir, ['ci', 'init', '--provider', 'generic', '--project', 'apps/web']);
    const snippetPath = join(testDir, '.decantr', 'ci', 'decantr-ci.sh');
    const snippet = readFileSync(snippetPath, 'utf-8');

    expect(existsSync(snippetPath)).toBe(true);
    expect(snippet).toContain('pnpm exec decantr ci --project apps/web');
  });

  it('checks refresh freshness without writing files', () => {
    const output = runCli(testDir, ['refresh', '--project', 'apps/web', '--check']);

    expect(output).toContain('Generated Decantr context looks fresh');
  });

  it('does not fail refresh freshness only because contract-only packs are not hydrated', () => {
    rmSync(join(testDir, 'apps', 'web', '.decantr', 'context', 'pack-manifest.json'), {
      force: true,
    });
    rmSync(join(testDir, 'apps', 'web', '.decantr', 'context', 'review-pack.json'), {
      force: true,
    });

    const output = runCli(testDir, ['refresh', '--project', 'apps/web', '--check']);

    expect(output).toContain('Generated Decantr context looks fresh');
    expect(output).not.toContain('pack-manifest.json is missing');
  });

  it('prints monorepo-scoped paths in refresh change summaries', () => {
    rmSync(join(testDir, 'apps', 'web', '.decantr', 'context', 'page-home-pack.md'), {
      force: true,
    });

    const output = runCli(testDir, ['refresh', '--project', 'apps/web', '--list-changes']);

    expect(output).toContain('apps/web/.decantr/context/');
    expect(output).toContain('apps/web/DECANTR.md');
    expect(output).not.toContain('\n  .decantr/context/');
  });

  it('runs primitive mutation commands against the selected monorepo project', () => {
    const output = runCli(testDir, [
      'add',
      'page',
      'app/settings',
      '--project',
      'apps/web',
      '--route',
      '/settings',
    ]);
    const essence = JSON.parse(
      readFileSync(join(testDir, 'apps', 'web', 'decantr.essence.json'), 'utf-8'),
    ) as { blueprint: { routes: Record<string, { section: string; page: string }> } };

    expect(output).toContain('route "/settings"');
    expect(essence.blueprint.routes['/settings']).toEqual({ section: 'app', page: 'settings' });
    expect(existsSync(join(testDir, 'decantr.essence.json'))).toBe(false);

    const task = JSON.parse(
      runCli(testDir, [
        'task',
        '/settings',
        'tighten settings layout',
        '--project',
        'apps/web',
        '--json',
      ]),
    ) as { route: string; section: string; page: string; read: string[] };
    expect(task).toMatchObject({ route: '/settings', section: 'app', page: 'settings' });
    expect(task.read).toContain('apps/web/.decantr/context/scaffold.md');
    expect(task.read).toContain('apps/web/DECANTR.md');
  });

  it('resolves common app section aliases for observed brownfield sections', () => {
    const essencePath = join(testDir, 'apps', 'web', 'decantr.essence.json');
    const essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as {
      blueprint: {
        sections: Array<{ id: string; role: string; pages: Array<{ id: string }> }>;
        routes: Record<string, { section: string; page: string }>;
      };
    };
    essence.blueprint.sections[0].id = 'observed-primary';
    essence.blueprint.sections[0].role = 'primary';
    essence.blueprint.routes['/'] = { section: 'observed-primary', page: 'home' };
    writeJson(essencePath, essence);

    const output = runCli(testDir, [
      'add',
      'page',
      'app/dogfood-edge',
      '--project',
      'apps/web',
      '--route',
      '/dogfood-edge',
    ]);
    const updated = JSON.parse(readFileSync(essencePath, 'utf-8')) as {
      blueprint: { routes: Record<string, { section: string; page: string }> };
    };

    expect(output).toContain('Resolved section alias "app" to "observed-primary"');
    expect(output).toContain('route "/dogfood-edge"');
    expect(updated.blueprint.routes['/dogfood-edge']).toEqual({
      section: 'observed-primary',
      page: 'dogfood-edge',
    });

    const removeOutput = runCli(testDir, [
      'remove',
      'page',
      'app/dogfood-edge',
      '--project',
      'apps/web',
    ]);
    const removed = JSON.parse(readFileSync(essencePath, 'utf-8')) as {
      blueprint: { routes: Record<string, { section: string; page: string }> };
    };

    expect(removeOutput).toContain('Resolved section alias "app" to "observed-primary"');
    expect(removeOutput).toContain('Removed page "dogfood-edge" from section "observed-primary"');
    expect(removed.blueprint.routes['/dogfood-edge']).toBeUndefined();
  }, 15_000);

  it('suggests a concrete section when page additions use an unknown section', () => {
    try {
      runCli(testDir, [
        'add',
        'page',
        'not-a-section/settings',
        '--project',
        'apps/web',
        '--route',
        '/settings',
      ]);
      throw new Error('Expected add page to reject an unknown section.');
    } catch (error) {
      const output = `${(error as { stdout?: Buffer }).stdout?.toString() ?? ''}\n${
        (error as { stderr?: Buffer }).stderr?.toString() ?? ''
      }`;
      expect(output).toContain('Section "not-a-section" not found.');
      expect(output).toContain('Available sections: app');
      expect(output).toContain('Try: decantr add page app/settings');
    }
  });

  it('resolves common app section aliases for scoped feature additions', () => {
    const essencePath = join(testDir, 'apps', 'web', 'decantr.essence.json');
    const essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as {
      blueprint: {
        sections: Array<{
          id: string;
          role: string;
          features: string[];
          pages: Array<{ id: string }>;
        }>;
        routes: Record<string, { section: string; page: string }>;
        features: string[];
      };
    };
    essence.blueprint.sections[0].id = 'observed-primary';
    essence.blueprint.sections[0].role = 'primary';
    essence.blueprint.sections[0].features = [];
    essence.blueprint.routes['/'] = { section: 'observed-primary', page: 'home' };
    writeJson(essencePath, essence);

    const output = runCli(testDir, [
      'add',
      'feature',
      'saved-recipes',
      '--section',
      'app',
      '--project',
      'apps/web',
    ]);
    const updated = JSON.parse(readFileSync(essencePath, 'utf-8')) as {
      blueprint: { sections: Array<{ id: string; features: string[] }>; features: string[] };
    };
    const section = updated.blueprint.sections.find(
      (candidate) => candidate.id === 'observed-primary',
    );

    expect(output).toContain('Resolved section alias "app" to "observed-primary"');
    expect(output).toContain(
      'Added feature "saved-recipes" to section "observed-primary" and global features.',
    );
    expect(section?.features).toContain('saved-recipes');
    expect(updated.blueprint.features).toContain('saved-recipes');
  });

  it('suppresses Decantr CSS interaction-class guidance in contract-only brownfield apps', () => {
    writeJson(join(testDir, 'apps', 'web', '.decantr', 'context', 'page-home-pack.json'), {
      data: { patterns: [{ id: 'hero', interactions: ['animate-on-mount'] }] },
    });
    mkdirSync(join(testDir, 'apps', 'web', 'src'), { recursive: true });
    writeFileSync(
      join(testDir, 'apps', 'web', 'src', 'page.tsx'),
      'export function Page() { return <main>Home</main>; }\n',
      'utf-8',
    );

    const output = runCli(testDir, ['verify', '--brownfield', '--project', 'apps/web']);

    expect(output).not.toContain('Declared pattern interactions are not implemented');
    expect(output).not.toContain('d-enter-fade');
  });

  it('rejects nonexistent project paths instead of recommending impossible adoption', () => {
    try {
      runCli(testDir, ['doctor', '--project', 'apps/does-not-exist']);
      throw new Error('Expected doctor to reject a nonexistent project path.');
    } catch (error) {
      const output = `${(error as { stdout?: Buffer }).stdout?.toString() ?? ''}\n${
        (error as { stderr?: Buffer }).stderr?.toString() ?? ''
      }`;
      expect(output).toContain('Project path does not exist: apps/does-not-exist');
      expect(output).toContain('decantr workspace list');
      expect(output).not.toContain('decantr adopt --project apps/does-not-exist');
    }
  });

  it('does not attach package workspaces as brownfield apps unless explicitly forced', () => {
    try {
      runCli(testDir, ['adopt', '--project', 'packages/design-system', '--yes']);
      throw new Error('Expected adopt to reject a component package.');
    } catch (error) {
      const output = `${(error as { stdout?: Buffer }).stdout?.toString() ?? ''}\n${
        (error as { stderr?: Buffer }).stderr?.toString() ?? ''
      }`;
      expect(output).toContain('is not an app candidate');
      expect(output).toContain('Use --force-package');
    }
  });

  it('honors an absolute standalone --project outside the current monorepo cwd', () => {
    const externalApp = mkdtempSync(join(tmpdir(), 'decantr-external-app-'));
    try {
      mkdirSync(join(externalApp, 'src'), { recursive: true });
      writeJson(join(externalApp, 'package.json'), {
        name: 'external-app',
        private: true,
        dependencies: { react: '^19.0.0' },
      });
      writeFileSync(
        join(externalApp, 'src', 'App.tsx'),
        'export function App() { return <button className="primaryAction">Save</button>; }\n',
        'utf-8',
      );

      const output = runCli(testDir, ['adopt', '--project', externalApp, '--yes']);

      expect(output).toContain('Decantr Adopt');
      expect(output).not.toContain('is not an app candidate');
      expect(output).toContain('decantr task <route> "<change>"');
      expect(output).toContain(`cd ${externalApp} && decantr studio`);
      expect(output).toContain('Inspect routes, findings, and attention areas visually');
      expect(existsSync(join(externalApp, 'decantr.essence.json'))).toBe(true);
    } finally {
      rmSync(externalApp, { recursive: true, force: true });
    }
  }, 20_000);

  it('steers magic on attached monorepo apps into task-time context', () => {
    const output = runCli(testDir, [
      'magic',
      'make this app feel more consistent',
      '--project',
      'apps/web',
    ]);

    expect(output).toContain('Decantr is already attached to this project');
    expect(output).toContain('decantr doctor --project apps/web');
    expect(output).toContain(
      'decantr task <route> "make this app feel more consistent" --project apps/web',
    );
    expect(output).toContain('decantr verify --brownfield --local-patterns --project apps/web');
    expect(output).not.toContain('Remove it first');
  });

  it('includes route-scoped typed graph context in task JSON when graph artifacts exist', () => {
    const appRoot = join(testDir, 'apps', 'web');
    mkdirSync(join(appRoot, 'src', 'app'), { recursive: true });
    writeFileSync(
      join(appRoot, 'src', 'app', 'page.tsx'),
      'export default function Page() { return <main>Home</main>; }\n',
      'utf-8',
    );
    writeJson(join(appRoot, '.decantr', 'analysis.json'), {
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
      features: { detected: [] },
    });
    execFileSync('git', ['init'], { cwd: appRoot, stdio: 'ignore' });
    execFileSync('git', ['config', 'user.email', 'test@example.com'], {
      cwd: appRoot,
      stdio: 'ignore',
    });
    execFileSync('git', ['config', 'user.name', 'Decantr Test'], {
      cwd: appRoot,
      stdio: 'ignore',
    });
    execFileSync('git', ['add', '.'], { cwd: appRoot, stdio: 'ignore' });
    execFileSync('git', ['commit', '-m', 'baseline'], { cwd: appRoot, stdio: 'ignore' });
    runCli(testDir, ['graph', '--project', 'apps/web']);
    writeFileSync(
      join(appRoot, 'src', 'app', 'page.tsx'),
      'export default function Page() { return <main>Home changed</main>; }\n',
      'utf-8',
    );

    const task = JSON.parse(
      runCli(testDir, ['task', '/', 'tighten the home surface', '--project', 'apps/web', '--json']),
    );

    expect(task.graph.capsule.cacheKey).toContain('decantr-contract:fnv1a32:');
    expect(task.graph.capsule.contractHash).toMatch(/^fnv1a32:/);
    expect(task.graph.capsule.contractCacheKey).toBe(task.graph.capsule.cacheKey);
    expect(task.graph.routeContext.routeNode.id).toBe('rt:/');
    expect(task.graph.routeContext.ids.patterns).toContain('pat:existing-surface');
    expect(task.graph.routeContext.summary).toMatchObject({
      pages: 1,
      patterns: 1,
    });
    expect(task.graph.changedFileContext.changedFiles).toContain('src/app/page.tsx');
    expect(task.graph.changedFileContext.resolvedNodeIds).toContain('src:src/app/page.tsx');
    expect(task.graph.changedFileContext.impact.ids.routes).toContain('rt:/');
    expect(task.read).toContain('apps/web/.decantr/graph/contract-capsule.json');
  });

  it('rejects unsupported flags on codify before writing proposals', () => {
    try {
      runCli(testDir, ['codify', '--project', 'apps/web', '--from-audit', '--dry-run']);
      throw new Error('Expected codify to reject unsupported flags.');
    } catch (error) {
      const output = `${(error as { stdout?: Buffer }).stdout?.toString() ?? ''}\n${
        (error as { stderr?: Buffer }).stderr?.toString() ?? ''
      }`;
      expect(output).toContain('Unsupported option for decantr codify: --dry-run');
      expect(
        existsSync(join(testDir, 'apps', 'web', '.decantr', 'local-patterns.proposal.json')),
      ).toBe(false);
    }
  });

  it('keeps codify follow-up commands scoped to the selected project', () => {
    const proposalOutput = runCli(testDir, ['codify', '--project', 'apps/web', '--from-audit']);
    const acceptOutput = runCli(testDir, ['codify', '--project', 'apps/web', '--accept']);
    const task = JSON.parse(
      runCli(testDir, [
        'task',
        '/',
        'next step: tighten buttons but do not add Angular to this React app',
        '--project',
        'apps/web',
        '--json',
      ]),
    ) as {
      authority: { lane: string; warnings: string[]; activeAuthorities: string[] };
      localLaw: { patternsPath: string | null; rulesPath: string | null };
    };

    expect(proposalOutput).toContain('decantr codify --accept --project apps/web');
    expect(proposalOutput).toContain('Hybrid authority guidance');
    expect(acceptOutput).toContain('Hybrid local law is now active');
    expect(acceptOutput).toContain(
      'decantr verify --brownfield --local-patterns --project apps/web',
    );
    expect(task.authority.lane).toBe('Hybrid local law');
    expect(task.authority.activeAuthorities).toContain('accepted local patterns/rules');
    expect(task.authority.warnings.join('\n')).toContain('angular');
    expect(task.authority.warnings.join('\n')).not.toContain('next');
    expect(task.localLaw.patternsPath).toBe('apps/web/.decantr/local-patterns.json');
    expect(task.localLaw.rulesPath).toBe('apps/web/.decantr/rules.json');
  });

  it('maps a registry pattern into project-owned local law as an advisory Hybrid proposal', () => {
    const output = runCli(testDir, ['codify', '--project', 'apps/web', '--map-pattern', 'hero']);
    const proposal = JSON.parse(
      readFileSync(
        join(testDir, 'apps', 'web', '.decantr', 'local-patterns.proposal.json'),
        'utf-8',
      ),
    ) as {
      patterns?: Array<{
        id?: string;
        hostedPatternRefs?: Array<{ slug?: string; source?: string }>;
        enforcement?: { level?: string; status?: string };
        evidenceToCollect?: string[];
      }>;
    };
    const mapped = proposal.patterns?.find((pattern) => pattern.id === 'hero');

    expect(output).toContain('hosted pattern mapping proposal');
    expect(output).toContain('No source files were changed');
    expect(mapped?.hostedPatternRefs?.[0]?.slug).toBe('hero');
    expect(mapped?.enforcement?.level).toBe('advisory');
    expect(mapped?.enforcement?.status).toBe('needs-mapping');
    expect(mapped?.evidenceToCollect?.join(' ')).toContain('Project-owned component path');
  }, 20_000);

  it('prints and resolves project-scoped health repair prompts', () => {
    rmSync(join(testDir, 'apps', 'web', '.decantr', 'context', 'pack-manifest.json'), {
      force: true,
    });

    const output = runCli(testDir, ['health', '--project', 'apps/web']);
    const match = stripAnsi(output).match(
      /Prompt: decantr health --project apps\/web --prompt ([^\s]+)/,
    );
    expect(match?.[1]).toBeTruthy();

    const prompt = runCli(testDir, [
      'health',
      '--project',
      'apps/web',
      '--prompt',
      match?.[1] ?? '',
    ]);
    expect(prompt).toContain(`Finding: ${match?.[1]}`);
    expect(prompt).toContain('apps/web/DECANTR.md');
    expect(prompt).toContain('apps/web/decantr.essence.json');
    expect(prompt).toContain('apps/web/.decantr/context/scaffold-pack.md');
    expect(prompt).toContain('apps/web/.decantr/context/scaffold.md');
    expect(prompt).not.toContain('No health finding found');

    const runtimePrompt = runCli(testDir, [
      'health',
      '--project',
      'apps/web',
      '--prompt',
      'runtime-runtime-dist-missing',
    ]);
    expect(runtimePrompt).toContain('pnpm --dir apps/web build');
    expect(runtimePrompt).not.toContain('- npm run build');
  });

  it('keeps legacy health init-ci on the pinned CI workflow path', () => {
    const output = runCli(testDir, ['health', 'init-ci', '--project', 'apps/web']);
    const workflowPath = join(testDir, '.github', 'workflows', 'decantr-ci.yml');
    const legacyPath = join(testDir, '.github', 'workflows', 'decantr-health.yml');
    const workflow = readFileSync(workflowPath, 'utf-8');

    expect(output).toContain('Created Decantr CI workflow');
    expect(existsSync(workflowPath)).toBe(true);
    expect(existsSync(legacyPath)).toBe(false);
    expect(workflow).toContain('pnpm exec decantr ci --project apps/web');
    expect(workflow).not.toContain('@decantr/cli@latest');
  });

  it('honors --project for status, theme, export, and local-law suggestions', () => {
    writeJson(join(testDir, 'apps', 'web', '.decantr', 'local-patterns.json'), {
      version: 2,
      status: 'accepted',
      patterns: [
        {
          id: 'button',
          label: 'Button primitives',
          role: 'Primary, secondary, tertiary, and icon actions',
          appliesTo: ['buttons', 'actions'],
          componentPaths: ['src/components/ui/button.tsx'],
        },
        {
          id: 'surface-card',
          label: 'Card surfaces',
          role: 'Reusable panels and card treatments',
          appliesTo: ['cards', 'panels'],
          componentPaths: ['src/components/ui/card.tsx'],
        },
      ],
    });

    const status = runCli(testDir, ['status', '--project', 'apps/web']);
    const theme = runCli(testDir, ['theme', 'create', 'retro-night', '--project', 'apps/web']);
    const suggestions = runCli(testDir, [
      'suggest',
      'standardize buttons',
      '--project',
      'apps/web',
    ]);
    const appRootSuggestions = runCli(join(testDir, 'apps', 'web'), [
      'suggest',
      'button',
      '--from-code',
      '--file',
      'src/components/ui/button.tsx',
    ]);
    const rulesPreview = runCli(testDir, ['rules', 'preview', '--project', 'apps/web']);
    mkdirSync(join(testDir, 'apps', 'web', 'src', 'components', 'ui'), { recursive: true });
    writeFileSync(
      join(testDir, 'apps', 'web', 'src', 'components', 'ui', 'button.tsx'),
      'export function Demo() { return <button className="recipe-card">Save</button>; }\n',
      'utf-8',
    );
    const codeSuggestions = runCli(testDir, [
      'suggest',
      '--from-code',
      '--file',
      'apps/web/src/components/ui/button.tsx',
      '--project',
      'apps/web',
    ]);

    mkdirSync(join(testDir, 'apps', 'web', 'src', 'styles'), { recursive: true });
    writeFileSync(
      join(testDir, 'apps', 'web', 'src', 'styles', 'tokens.css'),
      ':root { --d-bg: #000; --d-text: #fff; }\n',
      'utf-8',
    );
    const exported = runCli(testDir, [
      'export',
      '--project',
      'apps/web',
      '--to',
      'figma-tokens',
      '--output',
      '.decantr/figma-tokens.json',
    ]);

    expect(status).toContain('(v4)');
    expect(theme).toContain(join(testDir, 'apps', 'web', '.decantr', 'custom', 'themes'));
    expect(existsSync(join(testDir, '.decantr', 'custom', 'themes', 'retro-night.json'))).toBe(
      false,
    );
    expect(suggestions).toContain('Project-owned local law');
    expect(suggestions).toContain('button');
    expect(appRootSuggestions).toContain('Project-owned local law');
    expect(appRootSuggestions).toContain('button');
    expect(rulesPreview).toContain('Package manager: pnpm');
    expect(codeSuggestions).toContain(
      'Pattern suggestions for "file button.tsx source code patterns"',
    );
    expect(codeSuggestions).toContain('surface-card');
    expect(exported).toContain('Exported Figma/Tokens Studio tokens');
    expect(existsSync(join(testDir, 'apps', 'web', '.decantr', 'figma-tokens.json'))).toBe(true);
  }, 20_000);

  it('prints accepted local-law findings in the CI gate', () => {
    mkdirSync(join(testDir, 'apps', 'web', 'src'), { recursive: true });
    writeFileSync(
      join(testDir, 'apps', 'web', 'src', 'App.tsx'),
      'export function App() { return <button style={{ color: "#ff7a18" }}>Save</button>; }\n',
      'utf-8',
    );
    writeJson(join(testDir, 'apps', 'web', '.decantr', 'local-patterns.json'), {
      version: 2,
      status: 'accepted',
      patterns: [{ id: 'button', label: 'Button primitives' }],
    });
    writeJson(join(testDir, 'apps', 'web', '.decantr', 'rules.json'), {
      version: 1,
      status: 'accepted',
      generatedAt: '2026-05-18T00:00:00.000Z',
      source: 'test',
      purpose: 'test local law',
      enforcement: { defaultSeverity: 'warn', mode: 'warn', notes: [] },
      rules: [
        {
          id: 'no-inline-style',
          type: 'forbid-regex',
          enabled: true,
          severity: 'warn',
          description: 'No inline styles.',
          includeExtensions: ['.tsx'],
          pattern: '\\bstyle\\s*=',
          message: 'Inline style found in UI template.',
          suggestedFix: 'Use the project-owned style system.',
        },
      ],
    });

    const output = runCli(testDir, ['ci', '--project', 'apps/web', '--fail-on', 'none']);

    expect(output).toContain('Project-owned local law');
    expect(output).toContain('[Local law warning]');
    expect(output).toContain('no-inline-style');
    expect(output).toContain('src/App.tsx:1');
  });
});
