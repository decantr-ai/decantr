/**
 * Curated pattern data for Showcase Patterns tab
 * Each pattern includes metadata for anatomy viewer display
 */
export const featuredPatterns = [
  {
    id: 'hero',
    name: 'Hero Section',
    preset: 'vision',
    description: 'Full-width hero with gradient headline, value prop, and dual CTAs',
    components: ['Button', 'icon'],
    atoms: ['_flex', '_col', '_aic', '_tc', '_gap8', '_py24', '_px6', '_minh[100vh]', '_jcc', '_relative'],
    preview: '/images/patterns/hero-vision.svg',
    slots: [
      { id: 'decoration', label: 'Decorative orbs', x: 10, y: 15 },
      { id: 'headline', label: 'Display heading', x: 50, y: 35 },
      { id: 'description', label: 'Value prop', x: 50, y: 55 },
      { id: 'cta-group', label: 'CTA buttons', x: 50, y: 75 },
    ],
  },
  {
    id: 'bento-features',
    name: 'Bento Features',
    preset: 'default',
    description: 'Varied card sizes with hero feature prominence and stats',
    components: ['Card', 'Badge', 'icon'],
    atoms: ['_grid', '_gc1', '_md:gc2', '_lg:gc4', '_gap4', '_p6'],
    preview: '/images/patterns/bento-features.svg',
    slots: [
      { id: 'hero-card', label: 'Hero feature (2x2)', x: 25, y: 40 },
      { id: 'stat-cards', label: 'Stat cards', x: 75, y: 25 },
      { id: 'feature-row', label: 'Supporting features', x: 50, y: 85 },
    ],
  },
  {
    id: 'data-table',
    name: 'Data Table',
    preset: 'default',
    description: 'Sortable, filterable table with pagination and row actions',
    components: ['Card', 'Input', 'Button', 'Badge', 'Checkbox', 'Dropdown', 'Pagination'],
    atoms: ['_flex', '_col', '_gap4', '_wfull'],
    preview: '/images/patterns/data-table.svg',
    slots: [
      { id: 'toolbar', label: 'Search + filters', x: 50, y: 10 },
      { id: 'header', label: 'Column headers', x: 50, y: 25 },
      { id: 'rows', label: 'Data rows', x: 50, y: 55 },
      { id: 'pagination', label: 'Pagination', x: 50, y: 90 },
    ],
  },
  {
    id: 'card-grid',
    name: 'Card Grid',
    preset: 'product',
    description: 'Responsive grid of product/content cards with metadata',
    components: ['Card', 'Badge', 'Button', 'Avatar', 'icon'],
    atoms: ['_grid', '_gc1', '_md:gc2', '_lg:gc3', '_gap6'],
    preview: '/images/patterns/card-grid.svg',
    slots: [
      { id: 'image', label: 'Card image', x: 50, y: 25 },
      { id: 'badges', label: 'Status badges', x: 80, y: 45 },
      { id: 'content', label: 'Title + description', x: 50, y: 65 },
      { id: 'footer', label: 'Actions', x: 50, y: 90 },
    ],
  },
  {
    id: 'filter-bar',
    name: 'Filter Bar',
    preset: 'default',
    description: 'Horizontal filter controls with search, dropdowns, and chips',
    components: ['Input', 'Select', 'Chip', 'Button', 'icon'],
    atoms: ['_flex', '_wrap', '_gap3', '_aic', '_p4', '_bgmuted/5', '_r2'],
    preview: '/images/patterns/filter-bar.svg',
    slots: [
      { id: 'search', label: 'Search input', x: 20, y: 50 },
      { id: 'filters', label: 'Filter dropdowns', x: 50, y: 50 },
      { id: 'active-chips', label: 'Active filter chips', x: 80, y: 50 },
    ],
  },
  {
    id: 'kpi-grid',
    name: 'KPI Grid',
    preset: 'default',
    description: 'Dashboard metrics with trend indicators and sparklines',
    components: ['Card', 'Badge', 'icon', 'Sparkline'],
    atoms: ['_grid', '_gc1', '_sm:gc2', '_lg:gc4', '_gap4'],
    preview: '/images/patterns/kpi-grid.svg',
    slots: [
      { id: 'label', label: 'Metric label', x: 50, y: 20 },
      { id: 'value', label: 'Value + trend', x: 50, y: 50 },
      { id: 'sparkline', label: 'Sparkline chart', x: 50, y: 80 },
    ],
  },
];
