import type { LayoutItem, PatternRef } from '@decantr/essence-spec';
import type { PatternIO } from './types.js';

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

/**
 * IO declaration for a pattern, used by the data-driven wiring system.
 */
export interface PatternIOEntry {
  id: string;
  io: PatternIO;
}

/**
 * A dynamically derived wiring edge between two patterns based on shared IO signals.
 */
export interface IOWiringEdge {
  producer: string;
  consumer: string;
  signals: string[];
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

/**
 * Derive wiring edges from pattern IO declarations.
 * If pattern A produces signal X and pattern B consumes signal X, an edge is created.
 * Only patterns present in the layout are considered.
 */
export function deriveIOWirings(
  layoutIds: string[],
  patternIOMap: Map<string, PatternIO>,
): IOWiringEdge[] {
  const edges: IOWiringEdge[] = [];
  const layoutSet = new Set(layoutIds);

  for (const producerId of layoutIds) {
    const producerIO = patternIOMap.get(producerId);
    if (!producerIO?.produces?.length) continue;

    for (const consumerId of layoutIds) {
      if (producerId === consumerId) continue;
      if (!layoutSet.has(consumerId)) continue;
      const consumerIO = patternIOMap.get(consumerId);
      if (!consumerIO?.consumes?.length) continue;

      const shared = producerIO.produces.filter(
        (signal) => consumerIO.consumes!.includes(signal),
      );
      if (shared.length > 0) {
        edges.push({ producer: producerId, consumer: consumerId, signals: shared });
      }
    }
  }

  return edges;
}

/**
 * Build a PatternIO map from an array of PatternIOEntry objects.
 */
export function buildIOMap(entries: PatternIOEntry[]): Map<string, PatternIO> {
  const map = new Map<string, PatternIO>();
  for (const entry of entries) {
    map.set(entry.id, entry.io);
  }
  return map;
}

/**
 * Detect wirings from a layout. Uses hardcoded WIRING_RULES for detailed
 * signal/prop information. When a patternIOMap is provided, also derives
 * IO-based wirings and merges them (hardcoded rules take precedence for
 * pairs they cover).
 */
export function detectWirings(
  layout: LayoutItem[],
  patternIOMap?: Map<string, PatternIO>,
): WiringResult[] {
  const patternIds = layout.map(getPatternId).filter((id): id is string => id !== null);
  const results: WiringResult[] = [];
  const coveredPairs = new Set<string>();

  // Apply hardcoded rules first (these have detailed signal/prop info)
  for (const rule of WIRING_RULES) {
    const [a, b] = rule.pair;
    if (patternIds.includes(a) && patternIds.includes(b)) {
      results.push({ rule, signals: rule.signals, props: rule.props, hookProps: rule.hookProps });
      coveredPairs.add(`${a}:${b}`);
      coveredPairs.add(`${b}:${a}`);
    }
  }

  // If IO map provided, derive additional wirings from IO declarations
  if (patternIOMap) {
    const ioEdges = deriveIOWirings(patternIds, patternIOMap);
    for (const edge of ioEdges) {
      const pairKey = `${edge.producer}:${edge.consumer}`;
      if (coveredPairs.has(pairKey)) continue;
      coveredPairs.add(pairKey);

      // Generate a synthetic WiringRule from IO signals
      const signals: WiringSignal[] = edge.signals.map((sig) => {
        const camel = toCamelCase(sig);
        return {
          name: `page${capitalize(camel)}`,
          init: "''",
          hookType: classifySignal(sig),
        };
      });

      const producerProps: Record<string, string> = {};
      const consumerProps: Record<string, string> = {};
      const producerHookProps: Record<string, string> = {};
      const consumerHookProps: Record<string, string> = {};

      for (const sig of edge.signals) {
        const camel = toCamelCase(sig);
        const stateName = `page${capitalize(camel)}`;
        const setterName = `set${capitalize(stateName)}`;
        producerProps[`on${capitalize(camel)}`] = setterName;
        consumerProps[sig] = stateName;
        producerHookProps[sig] = sig;
        consumerHookProps[sig] = sig;
      }

      const rule: WiringRule = {
        pair: [edge.producer, edge.consumer],
        signals,
        props: { [edge.producer]: producerProps, [edge.consumer]: consumerProps },
        hookProps: { [edge.producer]: producerHookProps, [edge.consumer]: consumerHookProps },
      };

      results.push({ rule, signals, props: rule.props, hookProps: rule.hookProps });
    }
  }

  return results;
}

/**
 * Convert a kebab-case string to camelCase.
 */
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Capitalize the first letter of a string.
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Classify a signal name into a HookType for code generation.
 */
function classifySignal(signal: string): HookType {
  const normalized = toCamelCase(signal);
  if (normalized === 'search') return 'search';
  if (normalized === 'selection') return 'selection';
  if (normalized === 'sort') return 'sort';
  return 'filter';
}
