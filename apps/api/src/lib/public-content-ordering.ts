import {
  type ContentIntelligenceSource,
  normalizePublicContentSort,
  sortPublicContent,
  type PublicContentSort,
  type PublicContentSummary,
} from '@decantr/registry';

function matchesPublicContentFilters(
  item: PublicContentSummary,
  recommendedOnly: boolean,
  intelligenceSource: ContentIntelligenceSource | undefined,
): boolean {
  if (recommendedOnly && !item.intelligence?.recommended) {
    return false;
  }

  if (intelligenceSource && item.intelligence?.source !== intelligenceSource) {
    return false;
  }

  return true;
}

export function applyPublicContentOrdering<T extends PublicContentSummary>(
  items: T[],
  sortParam: string | undefined,
  recommendedOnly: boolean,
  intelligenceSource: ContentIntelligenceSource | undefined,
  limit: number,
  offset: number,
): {
  sort: PublicContentSort;
  filteredTotal: number;
  items: T[];
} {
  const sort = normalizePublicContentSort(sortParam);
  const filtered = items.filter((item) =>
    matchesPublicContentFilters(item, recommendedOnly, intelligenceSource),
  );
  const sorted = sortPublicContent(filtered, sort);

  return {
    sort,
    filteredTotal: filtered.length,
    items: sorted.slice(offset, offset + limit),
  };
}
