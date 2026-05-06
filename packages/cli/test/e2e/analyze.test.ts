import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('analyze command', () => {
  let testDir: string;
  const cliPath = join(__dirname, '..', '..', 'dist', 'index.js');

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-analyze-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('writes analysis.json and init-seed.json for brownfield adoption', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'brownfield-react',
          private: true,
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
          },
        },
        null,
        2,
      ) + '\n',
    );
    writeFileSync(
      join(testDir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: { jsx: 'react-jsx' },
        },
        null,
        2,
      ) + '\n',
    );
    mkdirSync(join(testDir, 'src', 'components'), { recursive: true });
    writeFileSync(
      join(testDir, 'src', 'components', 'Sidebar.tsx'),
      'export function Sidebar() { return <aside />; }\n',
    );
    writeFileSync(
      join(testDir, 'src', 'App.tsx'),
      'export function App() { return <main>Hello</main>; }\n',
    );

    execSync(`node ${cliPath} analyze`, { cwd: testDir, stdio: 'pipe' });

    const analysisPath = join(testDir, '.decantr', 'analysis.json');
    const seedPath = join(testDir, '.decantr', 'init-seed.json');
    const ambientPath = join(testDir, '.decantr', 'ambient-context.json');
    const doctrinePath = join(testDir, '.decantr', 'doctrine-map.json');
    const proposalPath = join(testDir, '.decantr', 'observed-essence.proposal.json');
    const reportPath = join(testDir, '.decantr', 'brownfield-report.md');

    expect(existsSync(analysisPath)).toBe(true);
    expect(existsSync(seedPath)).toBe(true);
    expect(existsSync(ambientPath)).toBe(true);
    expect(existsSync(doctrinePath)).toBe(true);
    expect(existsSync(proposalPath)).toBe(true);
    expect(existsSync(reportPath)).toBe(true);

    const analysis = JSON.parse(readFileSync(analysisPath, 'utf-8')) as {
      decantr?: { workflow?: string; attach?: { recommendedCommand?: string; adoptionMode?: string } };
      retrofitPlan?: { recommendedAdoptionMode?: string; doctrineMapPath?: string };
    };
    const seed = JSON.parse(readFileSync(seedPath, 'utf-8')) as {
      workflow?: string;
      target?: string;
      shell?: string;
      theme?: string;
      existing?: boolean;
      registryOptional?: boolean;
      adoptionMode?: string;
    };

    expect(analysis.decantr?.workflow).toBe('brownfield-adoption');
    expect(analysis.decantr?.attach?.recommendedCommand).toBe(
      'decantr init --existing --accept-proposal',
    );
    expect(analysis.decantr?.attach?.adoptionMode).toBe('contract-only');
    expect(analysis.retrofitPlan?.recommendedAdoptionMode).toBe('contract-only');
    expect(analysis.retrofitPlan?.doctrineMapPath).toBe('.decantr/doctrine-map.json');
    expect(seed.workflow).toBe('brownfield-adoption');
    expect(seed.adoptionMode).toBe('contract-only');
    expect(seed.theme).toBe('existing');
    expect(seed.target).toBe('react');
    expect(seed.shell).toBe('sidebar-main');
    expect(seed.existing).toBe(true);
    expect(seed.registryOptional).toBe(true);
  });

  it('recognizes React Router and Decantr starter structure in an attached app', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'decantr-starter-like',
          private: true,
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            'react-router-dom': '^7.0.0',
            '@decantr/css': '^1.0.0',
          },
        },
        null,
        2,
      ) + '\n',
    );

    mkdirSync(join(testDir, 'src', 'styles'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'pages'), { recursive: true });
    writeFileSync(
      join(testDir, 'src', 'pages', 'DashboardPage.tsx'),
      'export function DashboardPage() { return <main />; }\n',
    );
    writeFileSync(
      join(testDir, 'src', 'main.tsx'),
      'import { HashRouter } from "react-router-dom";\n',
    );
    writeFileSync(
      join(testDir, 'src', 'App.tsx'),
      'import { Routes, Route } from "react-router-dom";\nexport function App() { return <Routes><Route path="/" element={<main>Hello</main>} /></Routes>; }\n',
    );
    writeFileSync(
      join(testDir, 'src', 'styles', 'global.css'),
      'html.dark { color-scheme: dark; }\n',
    );
    writeFileSync(
      join(testDir, 'src', 'styles', 'tokens.css'),
      ':root { --d-primary: #111827; --d-border: #d1d5db; }\n',
    );
    writeFileSync(
      join(testDir, 'src', 'styles', 'treatments.css'),
      '.d-surface { background: var(--d-primary); }\n',
    );
    writeFileSync(
      join(testDir, 'decantr.essence.json'),
      JSON.stringify(
        {
          version: '3.1.0',
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
            motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
            accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
            personality: ['clean'],
          },
          blueprint: {
            sections: [
              {
                id: 'agent-orchestrator',
                role: 'primary',
                shell: 'sidebar-main',
                features: [],
                description: 'Agent orchestration workspace',
                pages: [{ id: 'home', layout: ['hero'] }],
              },
            ],
            features: [],
            routes: { '/': { section: 'agent-orchestrator', page: 'home' } },
          },
          meta: {
            archetype: 'agent-marketplace',
            target: 'react',
            platform: { type: 'spa', routing: 'hash' },
            guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
          },
        },
        null,
        2,
      ) + '\n',
    );

    execSync(`node ${cliPath} analyze`, { cwd: testDir, stdio: 'pipe' });

    const analysis = JSON.parse(
      readFileSync(join(testDir, '.decantr', 'analysis.json'), 'utf-8'),
    ) as {
      routes?: { strategy?: string; routes?: Array<{ path: string }> };
      components?: { pageCount?: number; componentCount?: number };
      styling?: { approach?: string; darkMode?: boolean; cssVariables?: string[] };
      layout?: { shellPattern?: string };
      dependencies?: { ui?: string[] };
    };

    expect(analysis.routes?.strategy).toBe('react-router');
    expect(analysis.routes?.routes?.some((route) => route.path === '/')).toBe(true);
    expect(analysis.components?.pageCount).toBeGreaterThanOrEqual(1);
    expect(analysis.components?.componentCount).toBeGreaterThanOrEqual(1);
    expect(analysis.styling?.approach).toBe('decantr-css');
    expect(analysis.styling?.darkMode).toBe(true);
    expect(analysis.styling?.cssVariables?.length ?? 0).toBeGreaterThan(0);
    expect(analysis.layout?.shellPattern).toContain('sidebar-main');
    expect(analysis.dependencies?.ui).toContain('react-router-dom');
  });

  it('inventories mature Next.js brownfield doctrine without importing Decantr defaults', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'mature-next-brownfield',
          private: true,
          dependencies: {
            next: '^15.0.0',
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            '@supabase/supabase-js': '^2.0.0',
          },
          devDependencies: {
            tailwindcss: '^4.0.0',
            vitest: '^3.0.0',
          },
        },
        null,
        2,
      ) + '\n',
    );
    writeFileSync(join(testDir, 'next.config.ts'), 'export default {};\n');
    writeFileSync(join(testDir, 'tsconfig.json'), '{}\n');
    writeFileSync(join(testDir, 'tailwind.config.ts'), 'export default { content: ["./src/**/*.{ts,tsx}"] };\n');
    writeFileSync(
      join(testDir, 'components.json'),
      JSON.stringify({ style: 'new-york', tailwind: { css: 'src/app/globals.css' } }, null, 2),
    );
    writeFileSync(
      join(testDir, 'CLAUDE.md'),
      '# Project Rules\n\nTailwind classes are canonical for current UI work.\n',
    );
    mkdirSync(join(testDir, '.claude', 'rules'), { recursive: true });
    mkdirSync(join(testDir, '.claude', 'initiatives'), { recursive: true });
    mkdirSync(join(testDir, '.github', 'workflows'), { recursive: true });
    mkdirSync(join(testDir, 'docs'), { recursive: true });
    mkdirSync(join(testDir, 'project-memory'), { recursive: true });
    mkdirSync(join(testDir, 'supabase', 'migrations'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'app', '(marketing)'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'app', 'dashboard'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'app', 'dashboard', 'client-settings', 'manage-rbac'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'app', 'dashboard', 'reports', 'environmental'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'app', 'admin', 'users'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'app', 'blog', '[slug]'), { recursive: true });

    writeFileSync(
      join(testDir, '.claude', 'rules', 'security.md'),
      '# Security\n\nNever bypass RLS policies.\n',
    );
    writeFileSync(
      join(testDir, '.claude', 'initiatives', 'rbac.md'),
      '# RBAC Initiative\n\nAdmin roles are in flight.\n',
    );
    writeFileSync(join(testDir, '.github', 'workflows', 'ci.yml'), 'name: ci\n');
    writeFileSync(
      join(testDir, 'docs', 'design-system.md'),
      '# Design System\n\nDo not use Tailwind for new marketing pages until tokens are reconciled.\n',
    );
    writeFileSync(join(testDir, '.env.local'), 'DATABASE_URL=postgres://secret\n');
    writeFileSync(join(testDir, 'docs', 'legacy-summary.md'), '# Legacy Summary\n');
    writeFileSync(join(testDir, 'project-memory', 'release-risks.md'), '# Release Risks\n');
    writeFileSync(join(testDir, 'supabase', 'migrations', '0001_init.sql'), 'create table profiles(id uuid primary key);\n');
    writeFileSync(join(testDir, 'src', 'middleware.ts'), 'export function middleware() {}\n');
    writeFileSync(
      join(testDir, 'src', 'app', 'globals.css'),
      ':root { --brand-primary: #123456; --surface-card: #ffffff; }\n.dark { color-scheme: dark; }\n',
    );
    writeFileSync(join(testDir, 'src', 'app', 'layout.tsx'), 'export default function Layout({ children }) { return children; }\n');
    writeFileSync(join(testDir, 'src', 'app', '(marketing)', 'page.tsx'), 'export default function Page() { return null; }\n');
    writeFileSync(join(testDir, 'src', 'app', 'dashboard', 'page.tsx'), 'export default function Page() { return null; }\n');
    writeFileSync(join(testDir, 'src', 'app', 'dashboard', 'client-settings', 'manage-rbac', 'page.tsx'), 'export default function Page() { return null; }\n');
    writeFileSync(join(testDir, 'src', 'app', 'dashboard', 'reports', 'environmental', 'page.tsx'), 'export default function Page() { return null; }\n');
    writeFileSync(join(testDir, 'src', 'app', 'admin', 'users', 'page.tsx'), 'export default function Page() { return null; }\n');
    writeFileSync(join(testDir, 'src', 'app', 'blog', '[slug]', 'page.tsx'), 'export default function Page() { return null; }\n');

    execSync(`node ${cliPath} analyze`, { cwd: testDir, stdio: 'pipe' });

    const analysis = JSON.parse(
      readFileSync(join(testDir, '.decantr', 'analysis.json'), 'utf-8'),
    ) as {
      project?: { existingRuleFiles?: string[] };
      routes?: { strategy?: string; routes?: Array<{ path: string }> };
      styling?: { approach?: string; cssVariables?: string[] };
    };
    const ambient = JSON.parse(
      readFileSync(join(testDir, '.decantr', 'ambient-context.json'), 'utf-8'),
    ) as {
      items: Array<{ path: string; role: string; safeToCite: boolean }>;
      conflicts: string[];
      staleRisks: string[];
    };
    const proposal = JSON.parse(
      readFileSync(join(testDir, '.decantr', 'observed-essence.proposal.json'), 'utf-8'),
    ) as {
      essence?: {
        dna?: { theme?: { id?: string }; constraints?: { effects?: Record<string, string> } };
        meta?: { platform?: { type?: string } };
        blueprint?: { routes?: Record<string, unknown>; sections?: Array<{ id?: string; pages?: Array<{ layout?: string[] }> }> };
      };
    };
    const doctrine = JSON.parse(
      readFileSync(join(testDir, '.decantr', 'doctrine-map.json'), 'utf-8'),
    ) as {
      sources: Array<{ path: string; area: string; precedence: number; currency: string; safeToCite: boolean }>;
      summary: Record<string, number>;
      resolutions: Array<{ kind: string; issue: string; recommendation: string; preferredSources: string[] }>;
    };
    const report = readFileSync(join(testDir, '.decantr', 'brownfield-report.md'), 'utf-8');
    const itemByPath = new Map(ambient.items.map((item) => [item.path, item]));

    expect(analysis.project?.existingRuleFiles).toContain('CLAUDE.md');
    expect(analysis.project?.existingRuleFiles).toContain('.claude/rules');
    expect(analysis.routes?.strategy).toBe('app-router');
    expect(analysis.routes?.routes?.map((route) => route.path)).toEqual(
      expect.arrayContaining([
        '/',
        '/dashboard',
        '/dashboard/client-settings/manage-rbac',
        '/dashboard/reports/environmental',
        '/admin/users',
        '/blog/:slug',
      ]),
    );
    expect(analysis.styling?.approach).toBe('tailwind');
    expect(analysis.styling?.cssVariables).toContain('--brand-primary');

    expect(itemByPath.get('.claude/rules/security.md')?.role).toBe('assistant-specific');
    expect(itemByPath.get('.claude')?.role).toBe('assistant-specific');
    expect(itemByPath.get('.claude/initiatives')?.role).toBe('feature-business');
    expect(itemByPath.get('.claude/initiatives/rbac.md')?.role).toBe('feature-business');
    expect(itemByPath.get('project-memory/release-risks.md')?.role).toBe('feature-business');
    expect(itemByPath.get('project-memory')?.role).toBe('feature-business');
    expect(itemByPath.get('docs')?.role).toBe('architecture');
    expect(itemByPath.get('docs/design-system.md')?.role).toBe('design-system');
    expect(itemByPath.get('supabase/migrations/0001_init.sql')?.role).toBe('security-data');
    expect(itemByPath.get('src/middleware.ts')?.role).toBe('security-data');
    expect(itemByPath.get('.github/workflows/ci.yml')?.role).toBe('workflow-ci');
    expect(itemByPath.get('.env.local')?.safeToCite).toBe(false);
    expect(ambient.conflicts).toEqual(
      expect.arrayContaining(['Ambient docs contain both Tailwind usage and anti-Tailwind language.']),
    );
    expect(ambient.staleRisks.some((risk) => risk.includes('docs/legacy-summary.md'))).toBe(true);

    expect(proposal.essence?.dna?.theme?.id).toBe('existing');
    expect(proposal.essence?.dna?.constraints?.effects?.['doctrine-security-data']).toContain(
      'auth',
    );
    expect(proposal.essence?.dna?.constraints?.effects?.['doctrine-design-system']).toContain(
      'design-system',
    );
    expect(proposal.essence?.meta?.platform?.type).toBe('ssr');
    expect(proposal.essence?.blueprint?.routes?.['/dashboard']).toBeTruthy();
    expect(proposal.essence?.blueprint?.sections?.map((section) => section.id)).toEqual(
      expect.arrayContaining([
        'observed-public',
        'observed-dashboard',
        'observed-rbac',
        'observed-reporting',
        'observed-admin',
      ]),
    );
    expect(JSON.stringify(proposal)).not.toContain('luminarum');
    expect(JSON.stringify(proposal)).not.toContain('home:hero');
    expect(
      proposal.essence?.blueprint?.sections?.flatMap((section) =>
        section.pages?.flatMap((page) => page.layout ?? []) ?? [],
      ),
    ).toContain('existing-surface');
    expect(report).toContain('## Accepted Evidence');
    expect(report).toContain('## Uncertain Evidence');
    expect(report).toContain('## Immediate Value');
    expect(report).toContain('## Non-Goals By Default');
    expect(report).toContain('## Doctrine Precedence');
    expect(report).toContain('## Doctrine Resolution Suggestions');
    expect(report).toContain('## Notable Context Evidence');
    expect(report).toContain('.claude/initiatives/rbac.md');
    expect(doctrine.summary['security-data']).toBeGreaterThan(0);
    expect(doctrine.sources[0]?.precedence).toBeGreaterThanOrEqual(doctrine.sources[1]?.precedence ?? 0);
    expect(doctrine.sources.some((source) => source.path === '.env.local' && !source.safeToCite)).toBe(
      true,
    );
    expect(doctrine.resolutions.some((resolution) => resolution.issue.includes('Tailwind'))).toBe(
      true,
    );
    expect(
      doctrine.resolutions.some((resolution) => resolution.kind === 'stale-risk'),
    ).toBe(true);
  });
});
