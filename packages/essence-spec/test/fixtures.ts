import type { Essence, EssenceV3, SectionedEssence } from '../src/types.js';

export const VALID_V2_SIMPLE: Essence = {
  version: '2.0.0',
  archetype: 'saas-dashboard',
  theme: { id: 'auradecantism', mode: 'dark', shape: 'rounded' },
  personality: ['professional', 'data-rich'],
  platform: { type: 'spa', routing: 'hash' },
  structure: [
    { id: 'overview', shell: 'sidebar-main', layout: ['kpi-grid', 'chart-grid'] },
  ],
  features: ['auth'],
  density: { level: 'comfortable', content_gap: '4' },
  guard: { enforce_style: true, mode: 'strict' },
  target: 'react',
};

export const VALID_V2_SECTIONED: SectionedEssence = {
  version: '2.0.0',
  platform: { type: 'spa', routing: 'hash' },
  personality: ['professional'],
  sections: [
    {
      id: 'brand',
      path: '/',
      archetype: 'portfolio',
      theme: { id: 'glassmorphism', mode: 'dark' },
      structure: [{ id: 'home', shell: 'full-bleed', layout: ['hero'] }],
    },
  ],
  density: { level: 'spacious', content_gap: '6' },
  guard: { mode: 'creative' },
  target: 'decantr',
};

export const VALID_V3: EssenceV3 = {
  version: '3.0.0',
  dna: {
    theme: { id: 'luminarum', mode: 'dark', shape: 'pill' },
    spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '_gap4' },
    typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
    color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
    radius: { philosophy: 'pill', base: 12 },
    elevation: { system: 'layered', max_levels: 3 },
    motion: { preference: 'subtle', duration_scale: 1.0, reduce_motion: true },
    accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
    personality: ['professional'],
  },
  blueprint: {
    shell: 'sidebar-main',
    pages: [
      {
        id: 'main',
        layout: [
          { pattern: 'hero', preset: 'landing', as: 'guild-hero' },
          'kpi-grid',
          { cols: ['activity-feed', 'top-players'], at: 'lg' },
        ],
      },
      {
        id: 'news',
        layout: ['filter-bar', 'post-list'],
      },
    ],
    features: ['guild-state', 'achievements', 'realtime-data'],
  },
  meta: {
    archetype: 'gaming-community',
    target: 'react',
    platform: { type: 'spa', routing: 'hash' },
    guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
  },
};
