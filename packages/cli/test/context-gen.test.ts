import { describe, it, expect } from 'vitest';
import { generateSectionContext, generateScaffoldContext } from '../src/scaffold.js';
import type { SectionContextInput, ScaffoldContextInput, PatternSpecSummary } from '../src/scaffold.js';
import type { EssenceV31Section } from '@decantr/essence-spec';

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
    recipeName: 'sharp-edge',
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

  it('inlines guard rules', () => {
    const result = generateSectionContext(makeSectionInput());

    expect(result).toContain('## Guard Rules');
    expect(result).toContain('| Style guard | DNA | error |');
    expect(result).toContain('midnight theme');
    expect(result).toContain('| Recipe guard | DNA | error |');
    expect(result).toContain('sharp-edge');
    expect(result).toContain('| Structure guard | Blueprint | warn |');
    expect(result).toContain('**Guard mode:** guided');
  });

  it('inlines theme tokens', () => {
    const result = generateSectionContext(makeSectionInput());

    expect(result).toContain('## Theme: midnight');
    expect(result).toContain('```css');
    expect(result).toContain('--d-primary: #6366f1');
    expect(result).toContain('--d-bg: #18181b');
  });

  it('inlines decorators', () => {
    const result = generateSectionContext(makeSectionInput());

    expect(result).toContain('## Decorators (sharp-edge recipe)');
    expect(result).toContain('| surface-card | Surface background with border |');
    expect(result).toContain('| glass-panel | Backdrop blur glass effect |');
  });

  it('inlines zone context', () => {
    const result = generateSectionContext(makeSectionInput());

    expect(result).toContain('## Zone Context');
    expect(result).toContain('Primary app zone');
    expect(result).toContain('authenticated users with sidebar navigation');
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

  it('inlines pattern specs when provided', () => {
    const patternSpecs: Record<string, PatternSpecSummary> = {
      'kpi-grid': {
        description: 'Grid of KPI metric cards',
        components: ['KpiCard', 'MetricValue', 'TrendIndicator'],
        slots: {
          header: 'Section title and period selector',
          grid: 'Responsive grid of KPI cards',
        },
        code: '<KpiGrid>\n  <KpiCard label="Revenue" value="$12k" />\n</KpiGrid>',
      },
    };

    const result = generateSectionContext(makeSectionInput({ patternSpecs }));

    expect(result).toContain('#### Pattern: kpi-grid');
    expect(result).toContain('Grid of KPI metric cards');
    expect(result).toContain('**Components:** KpiCard, MetricValue, TrendIndicator');
    expect(result).toContain('**Layout slots:**');
    expect(result).toContain('`header`: Section title and period selector');
    expect(result).toContain('`grid`: Responsive grid of KPI cards');
    expect(result).toContain('<KpiGrid>');
    expect(result).toContain('<KpiCard label="Revenue" value="$12k" />');
  });

  it('omits empty optional sections', () => {
    const input = makeSectionInput({
      section: makeSection({ features: [] }),
      personality: [],
      zoneContext: '',
      constraints: undefined,
      recipeHints: undefined,
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
        pages: [
          { id: 'home', route: '/', layout: ['hero', 'features-grid'] },
        ],
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
      recipeName: 'sharp-edge',
      personality: ['professional', 'clean'],
      topologyMarkdown: 'Public zone -> Gateway -> App zone',
      sections,
      routes,
    };

    const result = generateScaffoldContext(input);

    // Header
    expect(result).toContain('# Scaffold: MyApp');
    expect(result).toContain('**Blueprint:** saas-dashboard');
    expect(result).toContain('**Theme:** midnight | **Recipe:** sharp-edge');
    expect(result).toContain('**Personality:** professional, clean');
    expect(result).toContain('**Guard mode:** creative');

    // Topology
    expect(result).toContain('## App Topology');
    expect(result).toContain('Public zone -> Gateway -> App zone');

    // Sections table
    expect(result).toContain('## Sections Overview');
    expect(result).toContain('| landing | public | topbar-main | home | seo |');
    expect(result).toContain('| dashboard | primary | sidebar-main | overview, analytics | auth, notifications |');

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
