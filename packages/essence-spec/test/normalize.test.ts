import { describe, expect, it } from 'vitest';
import { normalizeEssence } from '../src/normalize.js';

describe('normalizeEssence', () => {
  it('converts v1 wine terminology to v2 normalized terms (layouts, features, theme, shell, personality)', () => {
    const v1 = {
      version: '1.0.0',
      terroir: 'saas-dashboard',
      vintage: { style: 'auradecantism', mode: 'dark', shape: 'rounded' },
      character: ['professional'],
      vessel: { type: 'spa', routing: 'hash' },
      structure: [{ id: 'overview', carafe: 'sidebar-main', blend: ['kpi-grid'] }],
      tannins: ['auth'],
      clarity: { density: 'comfortable', content_gap: '_gap4' },
      cork: { enforce_style: true, mode: 'maintenance' },
    };

    const v2 = normalizeEssence(v1);

    expect(v2.version).toBe('2.0.0');
    expect((v2 as any).archetype).toBe('saas-dashboard');
    expect((v2 as any).theme).toEqual({ id: 'auradecantism', mode: 'dark', shape: 'rounded' });
    expect(v2.platform).toEqual({ type: 'spa', routing: 'hash' });
    expect((v2 as any).structure[0].shell).toBe('sidebar-main');
    expect((v2 as any).structure[0].layout).toEqual(['kpi-grid']);
    expect((v2 as any).features).toEqual(['auth']);
    expect(v2.density).toEqual({ level: 'comfortable', content_gap: '4' });
    expect(v2.guard).toEqual({ enforce_style: true, mode: 'strict' });
    expect(v2.target).toBe('decantr');
  });

  it('passes through v2 essence unchanged', () => {
    const v2 = {
      version: '2.0.0',
      archetype: 'saas-dashboard',
      theme: { id: 'auradecantism', mode: 'dark' },
      personality: ['professional'],
      platform: { type: 'spa', routing: 'hash' },
      structure: [{ id: 'overview', shell: 'sidebar-main', layout: ['kpi-grid'] }],
      features: ['auth'],
      density: { level: 'comfortable', content_gap: '4' },
      guard: { mode: 'strict' },
      target: 'react',
    };

    const result = normalizeEssence(v2);
    expect(result).toEqual(v2);
  });

  it('preserves pathname routing during v1 to v2 normalization', () => {
    const v1 = {
      version: '1.0.0',
      terroir: 'saas-dashboard',
      vintage: { style: 'auradecantism', mode: 'dark', shape: 'rounded' },
      character: ['professional'],
      vessel: { type: 'spa', routing: 'pathname' },
      structure: [{ id: 'overview', carafe: 'sidebar-main', blend: ['kpi-grid'] }],
      tannins: ['auth'],
      clarity: { density: 'comfortable', content_gap: '_gap4' },
      cork: { enforce_style: true, mode: 'maintenance' },
    };

    const v2 = normalizeEssence(v1);
    expect(v2.platform).toEqual({ type: 'spa', routing: 'pathname' });
  });

  it('converts v1 sectioned essence', () => {
    const v1 = {
      version: '1.0.0',
      vessel: { type: 'spa', routing: 'hash' },
      character: ['professional'],
      sections: [
        {
          id: 'brand',
          path: '/',
          terroir: 'portfolio',
          vintage: { style: 'glassmorphism', mode: 'dark' },
          structure: [{ id: 'home', carafe: 'full-bleed', blend: ['hero'] }],
          tannins: ['analytics'],
        },
      ],
      shared_tannins: ['auth'],
      clarity: { density: 'spacious', content_gap: '_gap6' },
      cork: { enforce_style: true, mode: 'creative' },
    };

    const v2 = normalizeEssence(v1) as any;

    expect(v2.sections[0].archetype).toBe('portfolio');
    expect(v2.sections[0].theme.id).toBe('glassmorphism');
    expect(v2.sections[0].structure[0].shell).toBe('full-bleed');
    expect(v2.sections[0].structure[0].layout).toEqual(['hero']);
    expect(v2.sections[0].features).toEqual(['analytics']);
    expect(v2.shared_features).toEqual(['auth']);
    expect(v2.guard.mode).toBe('creative');
  });

  it('strips _gap prefix from content_gap', () => {
    const v1 = {
      version: '1.0.0',
      terroir: 'test',
      vintage: { style: 'clean', mode: 'light' },
      character: ['minimal'],
      vessel: { type: 'spa', routing: 'hash' },
      structure: [{ id: 'home', carafe: 'full-bleed', blend: ['hero'] }],
      tannins: [],
      clarity: { density: 'compact', content_gap: '_gap3' },
      cork: { mode: 'creative' },
    };

    const v2 = normalizeEssence(v1);
    expect(v2.density.content_gap).toBe('3');
  });

  it('maps cork mode maintenance to guard mode strict', () => {
    const v1 = {
      version: '1.0.0',
      terroir: 'test',
      vintage: { style: 'clean', mode: 'light' },
      character: ['minimal'],
      vessel: { type: 'spa', routing: 'hash' },
      structure: [{ id: 'home', carafe: 'full-bleed', blend: ['hero'] }],
      tannins: [],
      clarity: { density: 'comfortable', content_gap: '_gap4' },
      cork: { mode: 'maintenance' },
    };

    const v2 = normalizeEssence(v1);
    expect(v2.guard.mode).toBe('strict');
  });
});
