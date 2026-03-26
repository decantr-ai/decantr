import type { LayoutItem, PatternRef } from '@decantr/essence-spec';

// AUTO: hookType classifies each signal for custom hook generation
export type HookType = 'search' | 'filter' | 'selection' | 'sort';

export interface WiringSignal { name: string; init: string; hookType: HookType }

export interface WiringRule {
  pair: [string, string];
  signals: WiringSignal[];
  props: Record<string, Record<string, string>>;
  // AUTO: hookProps maps pattern IDs to hook variable names passed as props
  hookProps: Record<string, Record<string, string>>;
}

export interface WiringResult {
  rule: WiringRule;
  signals: WiringSignal[];
  props: Record<string, Record<string, string>>;
  hookProps: Record<string, Record<string, string>>;
}

export const WIRING_RULES: WiringRule[] = [
  {
    pair: ['filter-bar', 'data-table'],
    signals: [
      { name: 'pageSearch', init: "''", hookType: 'search' },
      { name: 'pageStatus', init: "'all'", hookType: 'filter' },
    ],
    props: {
      'filter-bar': { onSearch: 'setPageSearch', onCategory: 'setPageStatus' },
      'data-table': { search: 'pageSearch', status: 'pageStatus' },
    },
    hookProps: {
      'filter-bar': { search: 'search', filters: 'filters' },
      'data-table': { search: 'search', filters: 'filters' },
    },
  },
  {
    pair: ['filter-bar', 'activity-feed'],
    signals: [
      { name: 'pageSearch', init: "''", hookType: 'search' },
      { name: 'pageView', init: "'all'", hookType: 'filter' },
    ],
    props: {
      'filter-bar': { onSearch: 'setPageSearch', onView: 'setPageView' },
      'activity-feed': { search: 'pageSearch', view: 'pageView' },
    },
    hookProps: {
      'filter-bar': { search: 'search', filters: 'filters' },
      'activity-feed': { search: 'search', filters: 'filters' },
    },
  },
  {
    pair: ['filter-bar', 'card-grid'],
    signals: [
      { name: 'pageSearch', init: "''", hookType: 'search' },
    ],
    props: {
      'filter-bar': { onSearch: 'setPageSearch' },
      'card-grid': { search: 'pageSearch' },
    },
    hookProps: {
      'filter-bar': { search: 'search' },
      'card-grid': { search: 'search' },
    },
  },
];

function getPatternId(item: LayoutItem): string | null {
  if (typeof item === 'string') return item;
  if ('pattern' in item) return (item as PatternRef).pattern;
  return null;
}

export function detectWirings(layout: LayoutItem[]): WiringResult[] {
  const patternIds = layout.map(getPatternId).filter((id): id is string => id !== null);
  const results: WiringResult[] = [];
  for (const rule of WIRING_RULES) {
    const [a, b] = rule.pair;
    if (patternIds.includes(a) && patternIds.includes(b)) {
      results.push({ rule, signals: rule.signals, props: rule.props, hookProps: rule.hookProps });
    }
  }
  return results;
}
