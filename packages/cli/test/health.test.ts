import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { COMMAND_SURFACE, commandSurfaceByName } from '../src/command-surface.js';
import {
  cmdHealth,
  createProjectEvidenceBundle,
  createProjectHealthReport,
  formatProjectHealthMarkdown,
  parseHealthArgs,
  renderProjectHealthCiWorkflow,
  shouldFailHealth,
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

    expect(report.$schema).toBe('https://decantr.ai/schemas/project-health-report.v1.json');
    expect(report.status).toBe('healthy');
    expect(report.score).toBeGreaterThanOrEqual(99);
    expect(report.routes.declared).toContain('/');
    expect(report.packs.manifestPresent).toBe(true);
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

    expect(evidence.$schema).toBe('https://decantr.ai/schemas/evidence-bundle.v1.json');
    expect(firstHash).toMatch(/^[a-f0-9]{64}$/);
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
      goto: async () => undefined,
      screenshot: async ({ path: target }) => {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, 'fake screenshot');
      },
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
      routes: Array<{ route: string; screenshot: string | null; status: string }>;
    };

    expect(manifest.localOnly).toBe(true);
    expect(manifest.routes[0]).toMatchObject({
      route: '/',
      screenshot: '.decantr/evidence/screenshots/root.png',
      status: 'captured',
    });
    expect(existsSync(join(testDir, '.decantr', 'evidence', 'screenshots', 'root.png'))).toBe(true);
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
      projectPath: 'apps/registry',
      reportPath: 'reports/decantr-health.md',
      jsonPath: 'reports/decantr-health.json',
    });

    expect(workflow).toContain('working-directory: apps/registry');
    expect(workflow).toContain(
      'npx --yes @decantr/cli@2.0.0 health --json --output reports/decantr-health.json',
    );
    expect(workflow).toContain('apps/registry/reports/decantr-health.json');
    expect(workflow).toContain('apps/registry/reports/decantr-health.md');
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
      'apps/registry',
    ]);

    expect(parsed.initCi).toEqual({
      force: true,
      failOn: 'warn',
      cliVersion: '2.0.0',
      workflowPath: '.github/workflows/custom-health.yml',
      reportPath: 'reports/health.md',
      jsonPath: 'reports/health.json',
      projectPath: 'apps/registry',
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

  it('writes health baselines and compares changed files, routes, and screenshot hashes', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();
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
  });

  it('tracks the audited CLI command surface', () => {
    const commands = new Set(COMMAND_SURFACE.map((entry) => entry.command));
    const dispatchedCommands = [
      'add',
      'analyze',
      'audit',
      'check',
      'content-health',
      'create',
      'export',
      'get',
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
      'rules',
      'search',
      'showcase',
      'studio',
      'suggest',
      'sync',
      'sync-drift',
      'telemetry',
      'theme',
      'upgrade',
      'validate',
      'workspace',
    ];

    for (const command of dispatchedCommands) {
      expect(commands.has(command)).toBe(true);
    }
    expect(commandSurfaceByName('health')?.classification).toBe('primary');
    expect(commandSurfaceByName('heal')?.classification).toBe('deprecated-alias');
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
    expect(report.$schema).toBe('https://decantr.ai/schemas/workspace-health-report.v1.json');
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
    expect(() => renderProjectHealthCiWorkflow({ projectPath: '../apps/registry' })).toThrow(
      /Invalid --project/,
    );
    expect(() => renderProjectHealthCiWorkflow({ failOn: 'always' as unknown as 'error' })).toThrow(
      /Invalid --fail-on/,
    );
  });
});
