import { describe, expect, it } from 'vitest';
import {
  buildContentIntelligenceSummary,
  createContentResolver,
  getContentRecord,
  listContentRecords,
  searchContent,
  validateContentData,
  validateOfficialCorpus,
} from '../src/index.js';

describe('@decantr/content', () => {
  it('loads the official corpus from package-local files', () => {
    const patterns = listContentRecords({ type: 'patterns', limit: 500 });

    expect(patterns.total).toBeGreaterThan(200);
    expect(patterns.items.some((item) => item.slug === 'data-table')).toBe(true);
  });

  it('resolves content through the package resolver', async () => {
    const resolver = createContentResolver();
    const resolved = await resolver.resolve('pattern', 'data-table');

    expect(resolved?.source).toBe('core');
    expect(resolved?.path).toBe('@official/pattern/data-table');
    expect(resolved?.item.id).toBe('data-table');
  });

  it('searches summaries without network access', () => {
    const results = searchContent({ q: 'agent', type: 'blueprints', limit: 10 });

    expect(results.total).toBeGreaterThan(0);
    expect(results.results.some((item) => item.slug === 'agent-studio')).toBe(true);
  });

  it('applies public blueprint filtering from portfolio metadata', () => {
    const featured = listContentRecords({
      type: 'blueprints',
      blueprintSet: 'featured',
      limit: 100,
    });
    const certified = listContentRecords({
      type: 'blueprints',
      blueprintSet: 'certified',
      limit: 100,
    });

    expect(
      featured.items.every((item) => item.blueprint_portfolio?.visibility === 'featured'),
    ).toBe(true);
    expect(
      certified.items.every((item) => item.blueprint_portfolio?.artifact.status === 'certified'),
    ).toBe(true);
  });

  it('validates content data with bundled schemas', () => {
    const record = getContentRecord('patterns', 'data-table');
    expect(record).not.toBeNull();

    const result = validateContentData('pattern', record!.data);
    expect(result).toEqual({ valid: true, errors: [] });
  });

  it('validates the full official corpus', () => {
    const result = validateOfficialCorpus();
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('summarizes authored content intelligence without Supabase', () => {
    const summary = buildContentIntelligenceSummary('@official');

    expect(summary.totals.total_public_items).toBeGreaterThan(500);
    expect(summary.by_type.blueprint.recommended).toBeGreaterThan(0);
  });
});
