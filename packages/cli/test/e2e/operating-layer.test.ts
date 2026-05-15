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
    timeout: 15_000,
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
  return value.replace(/\x1b\[[0-9;]*m/g, '');
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
    expect(output).toContain('packages/ui');
    expect(output).toContain('Next:');
  });

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

  it('orients monorepo roots toward app-scoped doctor instead of root setup', () => {
    const output = runCli(testDir, ['doctor']);

    expect(output).toContain('This is a monorepo root');
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
      runCli(testDir, ['task', '/', 'tighten buttons', '--project', 'apps/web', '--json']),
    ) as { localLaw: { patternsPath: string | null; rulesPath: string | null } };

    expect(proposalOutput).toContain('decantr codify --accept --project apps/web');
    expect(acceptOutput).toContain(
      'decantr verify --brownfield --local-patterns --project apps/web',
    );
    expect(task.localLaw.patternsPath).toBe('apps/web/.decantr/local-patterns.json');
    expect(task.localLaw.rulesPath).toBe('apps/web/.decantr/rules.json');
  });

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
    expect(prompt).not.toContain('No health finding found');
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
    expect(codeSuggestions).toContain(
      'Pattern suggestions for "file button.tsx source code patterns"',
    );
    expect(exported).toContain('Exported Figma/Tokens Studio tokens');
    expect(existsSync(join(testDir, 'apps', 'web', '.decantr', 'figma-tokens.json'))).toBe(true);
  });
});
