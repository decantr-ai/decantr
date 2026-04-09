import { describe, expect, it } from 'vitest';
import { getContentIntelligence } from '../../src/lib/content-intelligence.js';

describe('getContentIntelligence', () => {
  it('derives benchmark-backed intelligence for official blueprints with showcase evidence', () => {
    const intelligence = getContentIntelligence('blueprint', '@official', 'portfolio');

    expect(intelligence).not.toBeNull();
    expect(intelligence?.golden_usage).toBe('shortlisted');
    expect(intelligence?.verification_status).toBe('smoke-green');
    expect(intelligence?.benchmark_confidence).toBe('high');
    expect(intelligence?.recommended).toBe(true);
    expect(intelligence?.target_coverage).toContain('react-vite');
    expect(intelligence?.evidence).toContain('live-showcase');
    expect(intelligence?.evidence).toContain('smoke-verified');
  });

  it('returns null for non-blueprint content', () => {
    expect(getContentIntelligence('pattern', '@official', 'hero')).toBeNull();
  });

  it('returns null for non-official namespaces even when a slug matches showcase corpus', () => {
    expect(getContentIntelligence('blueprint', '@community', 'portfolio')).toBeNull();
  });
});
