import type { PublicContentSummary } from './types.js';

export type PublicContentSort = 'recommended' | 'recent' | 'name';

function verificationScore(status?: string | null): number {
  switch (status) {
    case 'smoke-green':
      return 200;
    case 'build-green':
      return 120;
    case 'pending':
      return 20;
    case 'smoke-red':
    case 'build-red':
      return -40;
    default:
      return 0;
  }
}

function confidenceScore(level?: string | null): number {
  switch (level) {
    case 'high':
      return 120;
    case 'medium':
      return 70;
    case 'low':
      return 30;
    default:
      return 0;
  }
}

function confidenceTierScore(tier?: string | null): number {
  switch (tier) {
    case 'verified':
      return 180;
    case 'high':
      return 120;
    case 'medium':
      return 60;
    case 'low':
      return 10;
    default:
      return 0;
  }
}

function getRecommendedPriority(item: PublicContentSummary): number {
  const intelligence = item.intelligence;
  let score = 0;

  if (!intelligence) {
    return score;
  }

  if (intelligence.recommended) {
    score += 500;
  }

  if (intelligence.golden_usage === 'shortlisted') {
    score += 160;
  } else if (intelligence.golden_usage === 'showcase') {
    score += 80;
  }

  score += verificationScore(intelligence.verification_status);
  score += confidenceScore(intelligence.benchmark_confidence);
  score += confidenceTierScore(intelligence.confidence_tier);
  score += Math.round((intelligence.confidence_score ?? 0) / 2);
  score += intelligence.quality_score ?? 0;

  return score;
}

export function normalizePublicContentSort(
  value: string | null | undefined,
): PublicContentSort {
  switch (value) {
    case 'popular':
    case 'recommended':
      return 'recommended';
    case 'newest':
    case 'recent':
    case 'published':
      return 'recent';
    case 'name':
      return 'name';
    default:
      return 'recommended';
  }
}

export function comparePublicContent(
  a: PublicContentSummary,
  b: PublicContentSummary,
  sort: PublicContentSort = 'recommended',
): number {
  if (sort === 'name') {
    return (a.name ?? a.slug).localeCompare(b.name ?? b.slug);
  }

  if (sort === 'recent') {
    const publishedDelta =
      new Date(b.published_at ?? 0).getTime() -
      new Date(a.published_at ?? 0).getTime();
    if (publishedDelta !== 0) {
      return publishedDelta;
    }
    return a.slug.localeCompare(b.slug);
  }

  const priorityDelta = getRecommendedPriority(b) - getRecommendedPriority(a);
  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  if (a.namespace !== b.namespace) {
    if (a.namespace === '@official') return -1;
    if (b.namespace === '@official') return 1;
  }

  const publishedDelta =
    new Date(b.published_at ?? 0).getTime() -
    new Date(a.published_at ?? 0).getTime();
  if (publishedDelta !== 0) {
    return publishedDelta;
  }

  return (a.name ?? a.slug).localeCompare(b.name ?? b.slug);
}

export function sortPublicContent<T extends PublicContentSummary>(
  items: T[],
  sort: PublicContentSort = 'recommended',
): T[] {
  return [...items].sort((left, right) => comparePublicContent(left, right, sort));
}
