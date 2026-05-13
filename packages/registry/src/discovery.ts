import type { Pattern } from './types.js';

export interface PatternDiscoveryCandidate {
  id: string;
  slug?: string;
  name?: string;
  description?: string;
  tags?: string[];
  components?: string[];
  interactions?: string[];
  visual_brief?: string;
  layout_hints?: Record<string, string>;
  aliases?: string[];
  category?: string;
  domain?: string;
  source?: string;
  pattern?: Pattern | Record<string, unknown>;
}

export interface PatternDiscoveryInput {
  query?: string;
  route?: string;
  code?: string;
  limit?: number;
}

export interface PatternDiscoveryMatch {
  candidate: PatternDiscoveryCandidate;
  score: number;
  reasons: string[];
  matchedTerms: string[];
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'app',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'have',
  'in',
  'into',
  'is',
  'it',
  'of',
  'on',
  'or',
  'page',
  'route',
  'section',
  'that',
  'the',
  'this',
  'to',
  'ui',
  'with',
]);

const DOMAIN_LANGUAGE: Record<string, string[]> = {
  recipe: [
    'cookbook',
    'cookbooks',
    'cooking',
    'dish',
    'food',
    'ingredient',
    'ingredients',
    'meal',
    'photo',
    'recipe',
    'recipes',
  ],
  ai: [
    'agent',
    'ai',
    'assistant',
    'chat',
    'claude',
    'generate',
    'generation',
    'image',
    'model',
    'prompt',
    'vision',
  ],
  social: [
    'activity',
    'avatar',
    'comment',
    'community',
    'feed',
    'follow',
    'like',
    'profile',
    'share',
    'social',
    'user',
  ],
  commerce: ['cart', 'checkout', 'commerce', 'ecommerce', 'order', 'price', 'product', 'shop'],
  dashboard: ['analytics', 'chart', 'dashboard', 'kpi', 'metric', 'report', 'table'],
  form: ['form', 'input', 'settings', 'submit', 'toggle', 'upload'],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];
}

function recordToText(value: unknown): string {
  if (!isRecord(value)) return '';
  return Object.values(value)
    .flatMap((entry) => {
      if (typeof entry === 'string') return [entry];
      if (Array.isArray(entry))
        return entry.filter((item): item is string => typeof item === 'string');
      if (isRecord(entry)) return [recordToText(entry)];
      return [];
    })
    .join(' ');
}

export function patternToDiscoveryCandidate(
  pattern: Pattern | Record<string, unknown>,
  options: { source?: string; slug?: string } = {},
): PatternDiscoveryCandidate {
  const record = pattern as Record<string, unknown>;
  const slug =
    options.slug ||
    (typeof record.slug === 'string' ? record.slug : undefined) ||
    (typeof record.id === 'string' ? record.id : undefined);
  return {
    id: typeof record.id === 'string' ? record.id : (slug ?? 'pattern'),
    slug,
    name: typeof record.name === 'string' ? record.name : slug,
    description: typeof record.description === 'string' ? record.description : undefined,
    tags: stringArray(record.tags),
    components: stringArray(record.components),
    interactions: stringArray(record.interactions),
    visual_brief:
      typeof record.visual_brief === 'string'
        ? record.visual_brief
        : typeof record.visualBrief === 'string'
          ? record.visualBrief
          : undefined,
    layout_hints: isRecord(record.layout_hints)
      ? (record.layout_hints as Record<string, string>)
      : undefined,
    aliases: stringArray(record.aliases),
    category: typeof record.category === 'string' ? record.category : undefined,
    domain: typeof record.domain === 'string' ? record.domain : undefined,
    source: options.source,
    pattern,
  };
}

function tokenize(value: string | undefined): string[] {
  if (!value) return [];
  const tokens = value
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
  return [...new Set(tokens)];
}

function inferDomainTerms(tokens: string[]): { domain: string; terms: string[] }[] {
  const tokenSet = new Set(tokens);
  const matches: { domain: string; terms: string[] }[] = [];
  for (const [domain, terms] of Object.entries(DOMAIN_LANGUAGE)) {
    const hits = terms.filter((term) => tokenSet.has(term));
    if (hits.length > 0) matches.push({ domain, terms });
  }
  return matches;
}

function candidateText(candidate: PatternDiscoveryCandidate): {
  high: string;
  medium: string;
  low: string;
} {
  const pattern = candidate.pattern;
  const patternRecord = isRecord(pattern) ? pattern : {};
  const presets = isRecord(patternRecord.presets) ? recordToText(patternRecord.presets) : '';
  const composition = isRecord(patternRecord.composition)
    ? recordToText(patternRecord.composition)
    : '';
  const motion = isRecord(patternRecord.motion) ? recordToText(patternRecord.motion) : '';
  const responsive = isRecord(patternRecord.responsive)
    ? recordToText(patternRecord.responsive)
    : '';
  const accessibility = isRecord(patternRecord.accessibility)
    ? recordToText(patternRecord.accessibility)
    : '';

  return {
    high: [
      candidate.slug,
      candidate.id,
      candidate.name,
      candidate.aliases?.join(' '),
      candidate.category,
      candidate.domain,
    ]
      .filter(Boolean)
      .join(' '),
    medium: [
      candidate.description,
      candidate.tags?.join(' '),
      candidate.components?.join(' '),
      candidate.interactions?.join(' '),
      candidate.visual_brief,
      candidate.layout_hints ? recordToText(candidate.layout_hints) : '',
    ]
      .filter(Boolean)
      .join(' '),
    low: [presets, composition, motion, responsive, accessibility].filter(Boolean).join(' '),
  };
}

function fieldMatches(tokens: string[], text: string): string[] {
  const lower = text.toLowerCase();
  return tokens.filter((token) => lower.includes(token));
}

function addReason(reasons: string[], reason: string): void {
  if (!reasons.includes(reason)) reasons.push(reason);
}

export function scorePatternCandidate(
  input: PatternDiscoveryInput,
  candidate: PatternDiscoveryCandidate,
): PatternDiscoveryMatch {
  const queryTokens = tokenize(input.query);
  const routeTokens = tokenize(input.route);
  const codeTokens = tokenize(input.code).slice(0, 250);
  const tokens = [...new Set([...queryTokens, ...routeTokens, ...codeTokens])];
  const text = candidateText(candidate);
  const reasons: string[] = [];
  const matchedTerms = new Set<string>();
  let score = 0;

  const highMatches = fieldMatches(tokens, text.high);
  if (highMatches.length > 0) {
    score += highMatches.length * 18;
    for (const term of highMatches) matchedTerms.add(term);
    addReason(reasons, 'matched slug, name, alias, category, or domain');
  }

  const mediumMatches = fieldMatches(tokens, text.medium);
  if (mediumMatches.length > 0) {
    score += mediumMatches.length * 10;
    for (const term of mediumMatches) matchedTerms.add(term);
    addReason(
      reasons,
      'matched description, tags, components, interactions, visual brief, or layout hints',
    );
  }

  const lowMatches = fieldMatches(tokens, text.low);
  if (lowMatches.length > 0) {
    score += lowMatches.length * 4;
    for (const term of lowMatches) matchedTerms.add(term);
    addReason(reasons, 'matched composition, motion, responsive, preset, or accessibility details');
  }

  const slug = (candidate.slug || candidate.id).toLowerCase();
  const query = (input.query || '').toLowerCase();
  if (query && (slug === query || candidate.name?.toLowerCase() === query)) {
    score += 50;
    addReason(reasons, 'exact slug or name match');
  } else if (query && slug.includes(query.replace(/\s+/g, '-'))) {
    score += 28;
    addReason(reasons, 'direct slug phrase match');
  }

  for (const domain of inferDomainTerms(tokens)) {
    const candidateDomainText = [text.high, text.medium, text.low].join(' ').toLowerCase();
    const hits = domain.terms.filter((term) => candidateDomainText.includes(term));
    if (hits.length > 0) {
      score += Math.min(30, hits.length * 6);
      for (const term of hits) matchedTerms.add(term);
      addReason(reasons, `${domain.domain} domain language`);
    }
  }

  if (input.route) {
    const route = input.route.toLowerCase();
    if (route.includes(slug) || slug.includes(route.replace(/^\//, '').replace(/\//g, '-'))) {
      score += 16;
      addReason(reasons, 'route name resembles pattern slug');
    }
  }

  if (input.code) {
    const code = input.code.toLowerCase();
    const codeHints = [
      ['intersectionobserver', 'scroll-reveal'],
      ['avatar', 'social profile or feed'],
      ['like', 'social engagement'],
      ['upload', 'upload flow'],
      ['input type="file"', 'upload flow'],
      ['textarea', 'form or chat input'],
      ['message', 'chat surface'],
      ['grid', 'grid composition'],
      ['form', 'form surface'],
    ];
    for (const [needle, label] of codeHints) {
      if (
        code.includes(needle) &&
        [text.high, text.medium, text.low].join(' ').toLowerCase().includes(label.split(' ')[0])
      ) {
        score += 8;
        addReason(reasons, `source code hint: ${label}`);
      }
    }
  }

  return {
    candidate,
    score,
    reasons,
    matchedTerms: [...matchedTerms].sort(),
  };
}

export function rankPatternCandidates(
  input: PatternDiscoveryInput,
  candidates: PatternDiscoveryCandidate[],
): PatternDiscoveryMatch[] {
  const limit = input.limit ?? 10;
  return candidates
    .map((candidate) => scorePatternCandidate(input, candidate))
    .filter((match) => match.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.candidate.slug || a.candidate.id).localeCompare(b.candidate.slug || b.candidate.id);
    })
    .slice(0, limit);
}
