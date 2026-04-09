import { describe, expect, it } from 'vitest';
import { getContentIntelligence } from '../../src/lib/content-intelligence.js';

describe('getContentIntelligence', () => {
  it('derives benchmark-backed intelligence for official blueprints with showcase evidence', () => {
    const intelligence = getContentIntelligence('blueprint', '@official', 'portfolio');

    expect(intelligence).not.toBeNull();
    expect(intelligence?.source).toBe('benchmark');
    expect(intelligence?.golden_usage).toBe('shortlisted');
    expect(intelligence?.verification_status).toBe('smoke-green');
    expect(intelligence?.benchmark_confidence).toBe('high');
    expect(intelligence?.confidence_tier).toBe('verified');
    expect(intelligence?.recommended).toBe(true);
    expect(intelligence?.target_coverage).toContain('react-vite');
    expect(intelligence?.evidence).toContain('live-showcase');
    expect(intelligence?.evidence).toContain('smoke-verified');
    expect(intelligence?.evidence).toContain('document-metadata-verified');
    expect(intelligence?.evidence).toContain('charset-verified');
    expect(intelligence?.evidence).toContain('script-hygiene-verified');
    expect(intelligence?.evidence).toContain('runtime-hardening-verified');
    expect(intelligence?.evidence).toContain('asset-budget-ok');
  });

  it('returns null for non-blueprint content', () => {
    expect(getContentIntelligence('pattern', '@official', 'hero')).toBeNull();
  });

  it('returns null for non-official namespaces even when a slug matches showcase corpus', () => {
    expect(getContentIntelligence('blueprint', '@community', 'portfolio')).toBeNull();
  });

  it('derives authored intelligence for official patterns when registry data is present', () => {
    const intelligence = getContentIntelligence('pattern', '@official', 'hero', {
      description: 'A hero section',
      tags: ['marketing'],
      components: ['Hero'],
      presets: {
        default: {
          description: 'Default hero',
          layout: {
            layout: 'stack',
            atoms: '_flex _col',
          },
          code: {
            example: 'Hero()',
          },
        },
      },
      io: {
        consumes: ['copy'],
      },
      responsive: {
        mobile: 'stack',
      },
      accessibility: {
        role: 'region',
      },
    });

    expect(intelligence).not.toBeNull();
    expect(intelligence?.source).toBe('authored');
    expect(intelligence?.verification_status).toBe('unknown');
    expect(intelligence?.golden_usage).toBe('none');
    expect(intelligence?.benchmark_confidence).toBe('none');
    expect(intelligence?.confidence_tier).toBe('high');
    expect(intelligence?.recommended).toBe(true);
    expect(intelligence?.quality_score).toBeGreaterThanOrEqual(74);
    expect(intelligence?.evidence).toContain('official-source');
    expect(intelligence?.evidence).toContain('code-example');
  });

  it('derives non-recommended authored intelligence for community content when registry data is present', () => {
    const intelligence = getContentIntelligence('shell', '@community', 'sidebar', {
      description: 'Sidebar shell',
      root: 'd-shell',
      nav: 'd-nav',
      guidance: {
        layout: 'Use a sidebar',
      },
    });

    expect(intelligence).not.toBeNull();
    expect(intelligence?.source).toBe('authored');
    expect(intelligence?.recommended).toBe(false);
    expect(intelligence?.benchmark_confidence).toBe('none');
    expect(intelligence?.golden_usage).toBe('none');
    expect(intelligence?.confidence_tier).toBe('low');
    expect(intelligence?.confidence_score).toBeLessThan(68);
  });

  it('derives hybrid intelligence when authored blueprint data and showcase evidence both exist', () => {
    const intelligence = getContentIntelligence('blueprint', '@official', 'portfolio', {
      description: 'Creator portfolio',
      theme: { id: 'clean' },
      compose: ['portfolio-home'],
      routes: {
        home: {
          shell: 'shell-main',
        },
      },
    });

    expect(intelligence).not.toBeNull();
    expect(intelligence?.source).toBe('hybrid');
    expect(intelligence?.confidence_tier).toBe('verified');
    expect(intelligence?.evidence).toContain('official-source');
    expect(intelligence?.evidence).toContain('live-showcase');
    expect(intelligence?.evidence).toContain('document-metadata-verified');
    expect(intelligence?.evidence).toContain('runtime-hardening-verified');
  });
});
