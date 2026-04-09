import {
  normalizePublicContentSort,
  sortPublicContent,
  type PublicContentSort,
  type PublicContentSummary,
} from '@decantr/registry';

export function applyPublicContentOrdering<T extends PublicContentSummary>(
  items: T[],
  sortParam: string | undefined,
  recommendedOnly: boolean,
  limit: number,
  offset: number,
): {
  sort: PublicContentSort;
  items: T[];
} {
  const sort = normalizePublicContentSort(sortParam);
  const filtered = recommendedOnly
    ? items.filter((item) => item.intelligence?.recommended)
    : items;
  const sorted = sortPublicContent(filtered, sort);

  return {
    sort,
    items: sorted.slice(offset, offset + limit),
  };
}
