import type { EssenceV31Section } from '@decantr/essence-spec';
import { describe, expect, it } from 'vitest';
import type {
  PatternSpecSummary,
  ScaffoldContextInput,
  SectionContextInput,
} from '../src/scaffold.js';
import { generateScaffoldContext, generateSectionContext } from '../src/scaffold.js';

function makeSection(overrides?: Partial<EssenceV31Section>): EssenceV31Section {
  return {
    id: 'dashboard',
    role: 'primary',
    shell: 'sidebar-main',
    features: ['auth', 'notifications'],
    description: 'Main dashboard section',
    pages: [
      { id: 'overview', route: '/dashboard', layout: ['kpi-grid', 'activity-feed'] },
      { id: 'settings', route: '/dashboard/settings', layout: ['settings-form'] },
    ],
    ...overrides,
  };
}

function makeSectionInput(overrides?: Partial<SectionContextInput>): SectionContextInput {
  return {
    section: makeSection(),
    themeTokens: ':root {\n  --d-primary: #6366f1;\n  --d-bg: #18181b;\n}',
    decorators: [
      { name: 'surface-card', description: 'Surface background with border' },
      { name: 'glass-panel', description: 'Backdrop blur glass effect' },
    ],
    guardConfig: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
    personality: ['professional', 'clean', 'data-focused'],
    themeName: 'midnight',
    zoneContext: 'Primary app zone — authenticated users with sidebar navigation.',
    patternSpecs: {},
    ...overrides,
  };
}

describe('generateSectionContext', () => {
  it('produces markdown with section header, role, shell', () => {
    const result = generateSectionContext(makeSectionInput());

    expect(result).toContain('# Section: dashboard');
    expect(result).toContain('**Role:** primary');
    expect(result).toContain('**Shell:** sidebar-main');
    expect(result).toContain('**Archetype:** dashboard');
    expect(result).toContain('**Description:** Main dashboard section');
  });

  it('includes compact guard line', () => {
    const result = generateSectionContext(makeSectionInput());

    expect(result).toContain(
      '**Guard:** guided mode | DNA violations = error | Blueprint violations = warn',
    );
    // Should NOT contain the full guard rules table
    expect(result).not.toContain('## Guard Rules');
    expect(result).not.toContain('| Style guard |');
  });

  it('emits a compact theme reference that points to DECANTR.md for full tables', () => {
    // P1-2: section files no longer duplicate the full palette-token and
    // spacing-guide tables. They emit a "Theme Reference" block and defer
    // to DECANTR.md (project root) for the full tables. This eliminates
    // ~160 lines of duplication per section file when multiple sections
    // share the same theme + density.
    const result = generateSectionContext(makeSectionInput());

    expect(result).toContain('## Theme Reference');
    expect(result).toMatch(/\*\*Theme:\*\*\s+midnight\s+\(dark\)/);
    expect(result).toContain('**Density:** comfortable');
    expect(result).toContain('DECANTR.md');
    // Should NOT duplicate the full palette tokens table anymore.
    expect(result).not.toContain('| Token | Value | Role |');
    // Should NOT duplicate the spacing guide table.
    expect(result).not.toContain('## Spacing Guide');
    // Should NOT contain raw CSS blocks.
    expect(result).not.toContain('## Theme: midnight');
    expect(result).not.toContain('```css');
  });

  it('renders section decorators as a compact usage list', () => {
    // P1-2: section files no longer repeat the full decorator table from
    // DECANTR.md. Each section gets a short "section decorators" bullet
    // list with the name + description — enough for local decision-making
    // without repeating the full intent/CSS/pairs table.
    const result = generateSectionContext(makeSectionInput());

    expect(result).toContain('**Section decorators:**');
    expect(result).toContain('`.surface-card` — Surface background with border');
    expect(result).toContain('`.glass-panel` — Backdrop blur glass effect');
    // Should NOT re-emit the full decorator table.
    expect(result).not.toContain('| Class | Usage |');
  });

  it('includes zone context inline without heading', () => {
    const result = generateSectionContext(makeSectionInput());

    expect(result).toContain('Primary app zone');
    expect(result).toContain('authenticated users with sidebar navigation');
    expect(result).toContain('For full app topology, see `.decantr/context/scaffold.md`');
    // Should NOT use a separate heading for zone context
    expect(result).not.toContain('## Zone Context');
  });

  it('lists pages with routes and layouts', () => {
    const result = generateSectionContext(makeSectionInput());

    expect(result).toContain('## Pages');
    expect(result).toContain('### overview (/dashboard)');
    expect(result).toContain('Layout: kpi-grid');
    expect(result).toContain('activity-feed');
    expect(result).toContain('### settings (/dashboard/settings)');
    expect(result).toContain('Layout: settings-form');
  });

  it('lists pattern specs in Pattern Reference section', () => {
    const patternSpecs: Record<string, PatternSpecSummary> = {
      'kpi-grid': {
        description: 'Grid of KPI metric cards',
        components: ['KpiCard', 'MetricValue', 'TrendIndicator'],
        slots: {
          header: 'Section title and period selector',
          grid: 'Responsive grid of KPI cards',
        },
      },
    };

    const result = generateSectionContext(makeSectionInput({ patternSpecs }));

    expect(result).toContain('## Pattern Reference');
    expect(result).toContain('### kpi-grid');
    expect(result).toContain('Grid of KPI metric cards');
    expect(result).toContain('**Components:** KpiCard, MetricValue, TrendIndicator');
    expect(result).toContain('**Layout slots:**');
    expect(result).toContain('`header`: Section title and period selector');
    expect(result).toContain('`grid`: Responsive grid of KPI cards');
    expect(result).not.toContain('**Code example:**');
  });

  it('omits empty optional sections', () => {
    const input = makeSectionInput({
      section: makeSection({ features: [] }),
      personality: [],
      zoneContext: '',
      constraints: undefined,
      themeHints: undefined,
    });

    const result = generateSectionContext(input);

    expect(result).not.toContain('## Features');
    expect(result).not.toContain('## Personality');
    expect(result).not.toContain('## Zone Context');
    expect(result).not.toContain('## Constraints');
  });
});

describe('generateScaffoldContext', () => {
  it('produces overview with sections table and route map', () => {
    const sections: EssenceV31Section[] = [
      {
        id: 'landing',
        role: 'public',
        shell: 'topbar-main',
        features: ['seo'],
        description: 'Public landing pages',
        pages: [{ id: 'home', route: '/', layout: ['hero', 'features-grid'] }],
      },
      {
        id: 'dashboard',
        role: 'primary',
        shell: 'sidebar-main',
        features: ['auth', 'notifications'],
        description: 'Main dashboard',
        pages: [
          { id: 'overview', route: '/dashboard', layout: ['kpi-grid'] },
          { id: 'analytics', route: '/dashboard/analytics', layout: ['chart-panel'] },
        ],
      },
    ];

    const routes: Record<string, { section: string; page: string }> = {
      '/': { section: 'landing', page: 'home' },
      '/dashboard': { section: 'dashboard', page: 'overview' },
      '/dashboard/analytics': { section: 'dashboard', page: 'analytics' },
    };

    const input: ScaffoldContextInput = {
      appName: 'MyApp',
      blueprintId: 'saas-dashboard',
      themeName: 'midnight',
      personality: ['professional', 'clean'],
      topologyMarkdown: 'Public zone -> Gateway -> App zone',
      sections,
      routes,
    };

    const result = generateScaffoldContext(input);

    // Header
    expect(result).toContain('# Scaffold: MyApp');
    expect(result).toContain('**Blueprint:** saas-dashboard');
    expect(result).toContain('**Theme:** midnight');
    expect(result).toContain('**Personality:** professional, clean');
    expect(result).toContain('**Guard mode:** creative');

    // Topology (topologyMarkdown is inlined without a wrapper heading)
    expect(result).toContain('Public zone -> Gateway -> App zone');

    // Sections table
    expect(result).toContain('## Sections Overview');
    expect(result).toContain('| landing | public | topbar-main | home | seo |');
    expect(result).toContain(
      '| dashboard | primary | sidebar-main | overview, analytics | auth, notifications |',
    );

    // Route map
    expect(result).toContain('## Route Map');
    expect(result).toContain('| / | landing | home |');
    expect(result).toContain('| /dashboard | dashboard | overview |');
    expect(result).toContain('| /dashboard/analytics | dashboard | analytics |');

    // Section context references
    expect(result).toContain('## Section Contexts');
    expect(result).toContain('- .decantr/context/section-landing.md');
    expect(result).toContain('- .decantr/context/section-dashboard.md');

    // Omit optional sections when not provided
    expect(result).not.toContain('## Design Constraints');
    expect(result).not.toContain('## SEO Hints');
    expect(result).not.toContain('## Navigation');
  });
});
