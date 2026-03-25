import type { LayoutItem, PatternRef } from '@decantr/essence-spec';

export interface WiringSignal { name: string; init: string }

export interface WiringRule {
  pair: [string, string];
  signals: WiringSignal[];
  props: Record<string, Record<string, string>>;
}

export interface WiringResult {
  rule: WiringRule;
  signals: WiringSignal[];
  props: Record<string, Record<string, string>>;
}

export const WIRING_RULES: WiringRule[] = [
  {
    pair: ['filter-bar', 'data-table'],
    signals: [{ name: 'pageSearch', init: "''" }, { name: 'pageStatus', init: "'all'" }],
    props: {
      'filter-bar': { onSearch: 'setPageSearch', onCategory: 'setPageStatus' },
      'data-table': { search: 'pageSearch', status: 'pageStatus' },
    },
  },
  {
    pair: ['filter-bar', 'activity-feed'],
    signals: [{ name: 'pageSearch', init: "''" }, { name: 'pageView', init: "'all'" }],
    props: {
      'filter-bar': { onSearch: 'setPageSearch', onView: 'setPageView' },
      'activity-feed': { search: 'pageSearch', view: 'pageView' },
    },
  },
  {
    pair: ['filter-bar', 'card-grid'],
    signals: [{ name: 'pageSearch', init: "''" }],
    props: {
      'filter-bar': { onSearch: 'setPageSearch' },
      'card-grid': { search: 'pageSearch' },
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
      results.push({ rule, signals: rule.signals, props: rule.props });
    }
  }
  return results;
}
