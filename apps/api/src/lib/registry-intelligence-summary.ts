import type {
  ContentType,
  RegistryIntelligenceSummaryBucket,
  RegistryIntelligenceSummaryResponse,
} from '@decantr/registry';
import { CONTENT_TYPES } from '../types.js';
import { getContentIntelligence } from './content-intelligence.js';

type ContentRow = {
  type: ContentType;
  namespace: string;
  slug: string;
  data?: Record<string, unknown> | null;
};

function createEmptyBucket(): RegistryIntelligenceSummaryBucket {
  return {
    total_public_items: 0,
    with_intelligence: 0,
    recommended: 0,
    authored: 0,
    benchmark: 0,
    hybrid: 0,
    missing_source: 0,
    smoke_green: 0,
    build_green: 0,
    high_confidence: 0,
  };
}

function applyIntelligenceToBucket(
  bucket: RegistryIntelligenceSummaryBucket,
  intelligence: ReturnType<typeof getContentIntelligence>,
): void {
  bucket.total_public_items += 1;

  if (!intelligence) {
    return;
  }

  bucket.with_intelligence += 1;

  if (intelligence.recommended) {
    bucket.recommended += 1;
  }

  switch (intelligence.source) {
    case 'authored':
      bucket.authored += 1;
      break;
    case 'benchmark':
      bucket.benchmark += 1;
      break;
    case 'hybrid':
      bucket.hybrid += 1;
      break;
    default:
      bucket.missing_source += 1;
      break;
  }

  if (intelligence.verification_status === 'smoke-green') {
    bucket.smoke_green += 1;
  }
  if (intelligence.verification_status === 'build-green') {
    bucket.build_green += 1;
  }
  if (intelligence.benchmark_confidence === 'high') {
    bucket.high_confidence += 1;
  }
}

export function buildRegistryIntelligenceSummary(
  rows: ContentRow[],
  namespace: string | null,
): RegistryIntelligenceSummaryResponse {
  const byType = Object.fromEntries(
    CONTENT_TYPES.map((type) => [type, createEmptyBucket()]),
  ) as Record<ContentType, RegistryIntelligenceSummaryBucket>;
  const totals = createEmptyBucket();

  for (const row of rows) {
    const intelligence = getContentIntelligence(
      row.type,
      row.namespace,
      row.slug,
      row.data ?? undefined,
    );
    applyIntelligenceToBucket(byType[row.type], intelligence);
    applyIntelligenceToBucket(totals, intelligence);
  }

  return {
    $schema: 'https://decantr.ai/schemas/registry-intelligence-summary.v1.json',
    generated_at: new Date().toISOString(),
    namespace,
    totals,
    by_type: byType,
  };
}
