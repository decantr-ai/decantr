import { describe, it, expect } from 'vitest';
import { detectWirings, WIRING_RULES } from '../src/wiring.js';
import type { LayoutItem } from '@decantr/essence-spec';

describe('detectWirings', () => {
  it('detects filter-bar + data-table wiring', () => {
    const layout: LayoutItem[] = ['filter-bar', 'data-table'];
    const wirings = detectWirings(layout);
    expect(wirings).toHaveLength(1);
    expect(wirings[0].signals).toEqual([
      { name: 'pageSearch', init: "''", hookType: 'search' },
      { name: 'pageStatus', init: "'all'", hookType: 'filter' },
    ]);
    expect(wirings[0].props['filter-bar']).toHaveProperty('onSearch');
    expect(wirings[0].props['data-table']).toHaveProperty('search');
  });

  it('detects filter-bar + card-grid wiring', () => {
    const layout: LayoutItem[] = ['filter-bar', { pattern: 'card-grid', preset: 'product' }];
    const wirings = detectWirings(layout);
    expect(wirings).toHaveLength(1);
    expect(wirings[0].signals).toEqual([{ name: 'pageSearch', init: "''", hookType: 'search' }]);
  });

  it('detects filter-bar + activity-feed wiring', () => {
    const wirings = detectWirings(['filter-bar', 'activity-feed']);
    expect(wirings).toHaveLength(1);
    expect(wirings[0].signals).toHaveLength(2);
  });

  it('returns empty array when no pairs match', () => {
    expect(detectWirings(['hero', 'kpi-grid'])).toEqual([]);
  });

  it('handles aliased patterns via "as" field', () => {
    const layout: LayoutItem[] = [
      { pattern: 'filter-bar', as: 'user-filter' },
      { pattern: 'data-table', preset: 'standard', as: 'user-table' },
    ];
    expect(detectWirings(layout)).toHaveLength(1);
  });

  it('handles multiple wiring pairs on same page', () => {
    const wirings = detectWirings(['filter-bar', 'data-table', 'activity-feed']);
    expect(wirings).toHaveLength(2);
  });

  it('exports WIRING_RULES for external use', () => {
    expect(WIRING_RULES).toBeDefined();
    expect(WIRING_RULES.length).toBeGreaterThanOrEqual(3);
  });
});
