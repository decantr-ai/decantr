import {
  normalizePublicContentSort,
  sortPublicContent,
  type PublicContentSort,
  type PublicContentSummary,
} from '@decantr/registry';

export function applyPublicContentOrdering<T extends PublicContentSummary>(
  items: T[],
  sortParam: string | undefined,
  limit: number,
  offset: number,
): {
  sort: PublicContentSort;
  items: T[];
} {
  const sort = normalizePublicContentSort(sortParam);
  const sorted = sortPublicContent(items, sort);

  return {
    sort,
    items: sorted.slice(offset, offset + limit),
  };
}
