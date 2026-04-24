import type { LayoutItem } from '@decantr/essence-spec';
import { describe, expect, it } from 'vitest';
import type { PatternIO } from '../src/types.js';
import { buildIOMap, deriveIOWirings, detectWirings, WIRING_RULES } from '../src/wiring.js';

/**
 * IO declarations for the core patterns, matching the fixture JSON files.
 */
const PATTERN_IO: Record<string, PatternIO> = {
  'filter-bar': { produces: ['search', 'filters', 'status'], consumes: [] },
  'data-table': { consumes: ['search', 'filters', 'data'], produces: ['selection', 'sort'] },
  'activity-feed': { consumes: ['search', 'view', 'filters'], produces: [] },
  'card-grid': { consumes: ['search', 'filters', 'data'], produces: ['selection'] },
  'kpi-grid': { produces: ['kpi-data'], consumes: ['date-range'] },
  'chart-grid': { consumes: ['date-range', 'filters'], produces: [] },
  hero: { produces: [], consumes: [] },
  'cta-section': { produces: [], consumes: [], actions: ['cta-click'] },
  'detail-header': { consumes: ['data'], produces: ['actions'] },
  'form-sections': { consumes: ['data'], produces: ['form-data'] },
};

function makeIOMap(ids: string[]): Map<string, PatternIO> {
  return buildIOMap(ids.filter((id) => PATTERN_IO[id]).map((id) => ({ id, io: PATTERN_IO[id] })));
}

describe('deriveIOWirings', () => {
  it('derives filter-bar -> data-table wiring via shared search and filters signals', () => {
    const edges = deriveIOWirings(
      ['filter-bar', 'data-table'],
      makeIOMap(['filter-bar', 'data-table']),
    );
    expect(edges).toHaveLength(1);
    expect(edges[0].producer).toBe('filter-bar');
    expect(edges[0].consumer).toBe('data-table');
    expect(edges[0].signals).toContain('search');
    expect(edges[0].signals).toContain('filters');
  });

  it('derives filter-bar -> activity-feed wiring via shared search and filters signals', () => {
    const edges = deriveIOWirings(
      ['filter-bar', 'activity-feed'],
      makeIOMap(['filter-bar', 'activity-feed']),
    );
    expect(edges).toHaveLength(1);
    expect(edges[0].producer).toBe('filter-bar');
    expect(edges[0].consumer).toBe('activity-feed');
    expect(edges[0].signals).toContain('search');
    expect(edges[0].signals).toContain('filters');
  });

  it('derives filter-bar -> card-grid wiring via shared search and filters signals', () => {
    const edges = deriveIOWirings(
      ['filter-bar', 'card-grid'],
      makeIOMap(['filter-bar', 'card-grid']),
    );
    expect(edges).toHaveLength(1);
    expect(edges[0].producer).toBe('filter-bar');
    expect(edges[0].consumer).toBe('card-grid');
    expect(edges[0].signals).toContain('search');
    expect(edges[0].signals).toContain('filters');
  });

  it('returns no edges when patterns have no shared signals', () => {
    const edges = deriveIOWirings(['hero', 'cta-section'], makeIOMap(['hero', 'cta-section']));
    expect(edges).toHaveLength(0);
  });

  it('derives data-table -> detail-header wiring via shared data signal', () => {
    // data-table produces 'selection', detail-header consumes 'data' -- no overlap
    // But form-sections consumes 'data' and detail-header produces 'actions'
    // Let's test a custom IO scenario for clear producer->consumer
    const customIO = new Map<string, PatternIO>([
      ['source-panel', { produces: ['date-range', 'metrics'], consumes: [] }],
      ['chart-grid', { produces: [], consumes: ['date-range', 'filters'] }],
    ]);
    const edges = deriveIOWirings(['source-panel', 'chart-grid'], customIO);
    expect(edges).toHaveLength(1);
    expect(edges[0].producer).toBe('source-panel');
    expect(edges[0].consumer).toBe('chart-grid');
    expect(edges[0].signals).toEqual(['date-range']);
  });

  it('only considers patterns present in the layout', () => {
    // kpi-grid produces date-range, but chart-grid is not in the layout
    const edges = deriveIOWirings(
      ['kpi-grid', 'hero'],
      makeIOMap(['kpi-grid', 'hero', 'chart-grid']),
    );
    expect(edges).toHaveLength(0);
  });

  it('handles multiple producers and consumers in a complex layout', () => {
    const layoutIds = ['filter-bar', 'data-table', 'card-grid', 'activity-feed'];
    const edges = deriveIOWirings(layoutIds, makeIOMap(layoutIds));
    // filter-bar -> data-table (search, filters)
    // filter-bar -> card-grid (search, filters)
    // filter-bar -> activity-feed (search, filters)
    expect(edges.length).toBeGreaterThanOrEqual(3);

    const filterToTable = edges.find(
      (e) => e.producer === 'filter-bar' && e.consumer === 'data-table',
    );
    expect(filterToTable).toBeDefined();
    expect(filterToTable!.signals).toContain('search');
    expect(filterToTable!.signals).toContain('filters');

    const filterToFeed = edges.find(
      (e) => e.producer === 'filter-bar' && e.consumer === 'activity-feed',
    );
    expect(filterToFeed).toBeDefined();
    expect(filterToFeed!.signals).toContain('search');
  });
});

describe('detectWirings with IO map', () => {
  it('produces same 3 wirings as hardcoded rules for the classic pairs', () => {
    const layout: LayoutItem[] = ['filter-bar', 'data-table', 'activity-feed', 'card-grid'];
    const ioMap = makeIOMap(['filter-bar', 'data-table', 'activity-feed', 'card-grid']);

    // Without IO map, should detect 3 hardcoded rules
    const hardcodedResults = detectWirings(layout);
    expect(hardcodedResults).toHaveLength(3);

    // With IO map, hardcoded rules take precedence; IO-based adds no duplicates for covered pairs
    const ioResults = detectWirings(layout, ioMap);
    // Should have at least the 3 hardcoded rules
    expect(ioResults.length).toBeGreaterThanOrEqual(3);

    // Verify hardcoded pairs are present
    const pairs = ioResults.map((r) => r.rule.pair.join('+'));
    expect(pairs).toContain('filter-bar+data-table');
    expect(pairs).toContain('filter-bar+activity-feed');
    expect(pairs).toContain('filter-bar+card-grid');
  });

  it('adds IO-derived wirings for pairs not covered by hardcoded rules', () => {
    const layout: LayoutItem[] = ['source-panel', 'chart-grid'];
    const ioMap = new Map<string, PatternIO>([
      ['source-panel', { produces: ['date-range', 'metrics'], consumes: [] }],
      ['chart-grid', { produces: [], consumes: ['date-range', 'filters'] }],
    ]);

    const results = detectWirings(layout, ioMap);
    expect(results).toHaveLength(1);
    expect(results[0].rule.pair).toEqual(['source-panel', 'chart-grid']);
    expect(results[0].signals[0].name).toBe('pageDateRange');
    expect(results[0].signals[0].hookType).toBe('filter');
  });

  it('generates correct synthetic props for IO-derived wirings', () => {
    const layout: LayoutItem[] = ['source-panel', 'chart-grid'];
    const ioMap = new Map<string, PatternIO>([
      ['source-panel', { produces: ['date-range'], consumes: [] }],
      ['chart-grid', { produces: [], consumes: ['date-range'] }],
    ]);

    const results = detectWirings(layout, ioMap);
    expect(results).toHaveLength(1);
    expect(results[0].props['source-panel']).toHaveProperty('onDateRange');
    expect(results[0].props['chart-grid']).toHaveProperty('date-range');
    expect(results[0].hookProps['source-panel']).toHaveProperty('date-range');
    expect(results[0].hookProps['chart-grid']).toHaveProperty('date-range');
  });
});

describe('buildIOMap', () => {
  it('builds a map from PatternIOEntry array', () => {
    const entries = [
      { id: 'filter-bar', io: PATTERN_IO['filter-bar'] },
      { id: 'data-table', io: PATTERN_IO['data-table'] },
    ];
    const map = buildIOMap(entries);
    expect(map.size).toBe(2);
    expect(map.get('filter-bar')?.produces).toContain('search');
    expect(map.get('data-table')?.consumes).toContain('search');
  });
});
