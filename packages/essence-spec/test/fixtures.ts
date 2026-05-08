import type { Essence, EssenceV4, LegacyEssenceV3, SectionedEssence } from '../src/types.js';

export const VALID_V2_SIMPLE: Essence = {
  version: '2.0.0',
  archetype: 'saas-dashboard',
  theme: { id: 'auradecantism', mode: 'dark', shape: 'rounded' },
  personality: ['professional', 'data-rich'],
  platform: { type: 'spa', routing: 'history' },
  structure: [{ id: 'overview', shell: 'sidebar-main', layout: ['kpi-grid', 'chart-grid'] }],
  features: ['auth'],
  density: { level: 'comfortable', content_gap: '_gap4' },
  guard: { enforce_style: true, mode: 'strict' },
  target: 'react',
};

export const VALID_V2_SECTIONED: SectionedEssence = {
  version: '2.0.0',
  platform: { type: 'spa', routing: 'history' },
  personality: ['professional'],
  sections: [
    {
      id: 'brand',
      path: '/',
      archetype: 'portfolio',
      theme: { id: 'glassmorphism', mode: 'dark' },
      structure: [{ id: 'home', shell: 'full-bleed', layout: ['hero'] }],
      features: ['lead-capture'],
    },
  ],
  shared_features: ['analytics'],
  density: { level: 'spacious', content_gap: '_gap6' },
  guard: { mode: 'creative' },
  target: 'react',
};

export const VALID_V4: EssenceV4 = {
  version: '4.0.0',
  dna: {
    theme: { id: 'auradecantism', mode: 'dark', shape: 'rounded' },
    spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '_gap4' },
    typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
    color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
    radius: { philosophy: 'rounded', base: 8 },
    elevation: { system: 'layered', max_levels: 3 },
    motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
    accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
    personality: ['professional', 'data-rich'],
  },
  blueprint: {
    shell: 'sidebar-main',
    sections: [
      {
        id: 'dashboard',
        role: 'primary',
        shell: 'sidebar-main',
        features: ['auth'],
        description: 'Dashboard section',
        pages: [
          { id: 'overview', route: '/', layout: ['kpi-grid', 'chart-grid'] },
          { id: 'settings', route: '/settings', layout: ['settings-form'] },
        ],
      },
    ],
    features: ['auth'],
    routes: {
      '/': { section: 'dashboard', page: 'overview' },
      '/settings': { section: 'dashboard', page: 'settings' },
    },
  },
  meta: {
    archetype: 'saas-dashboard',
    target: 'react',
    platform: { type: 'spa', routing: 'history' },
    guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
    navigation: {
      command_palette: true,
      hotkeys: [{ key: 'g d', label: 'Dashboard', route: '/' }],
    },
  },
};

export const VALID_V31: LegacyEssenceV3 = {
  ...VALID_V4,
  version: '3.1.0',
};

export const VALID_V3: LegacyEssenceV3 = {
  ...VALID_V4,
  version: '3.0.0',
  blueprint: {
    shell: 'sidebar-main',
    pages: [
      { id: 'main', layout: ['kpi-grid', 'chart-grid'] },
      { id: 'news', layout: ['filter-bar', 'post-list'] },
    ],
    features: ['auth', 'realtime-data'],
  },
};
