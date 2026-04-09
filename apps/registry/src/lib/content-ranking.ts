import type { ContentItem } from '@/lib/api';

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

function getContentPriority(item: ContentItem): number {
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
  score += intelligence.quality_score ?? 0;

  return score;
}

export function compareContentItems(a: ContentItem, b: ContentItem): number {
  const priorityDelta = getContentPriority(b) - getContentPriority(a);
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

  return a.slug.localeCompare(b.slug);
}
