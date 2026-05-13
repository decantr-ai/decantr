import {
  type ContentIntelligenceSource,
  getBlueprintPortfolioMetadata,
  normalizePublicContentSort,
  sortPublicContent,
  type PublicBlueprintSet,
  type PublicContentSort,
  type PublicContentSummary,
} from '@decantr/registry';

function matchesPublicContentFilters(
  item: PublicContentSummary,
  recommendedOnly: boolean,
  intelligenceSource: ContentIntelligenceSource | undefined,
  blueprintSet: PublicBlueprintSet,
  includeLabs: boolean,
): boolean {
  if (item.type === 'blueprint' || item.type === 'blueprints') {
    const portfolio = getBlueprintPortfolioMetadata(item.blueprint_portfolio);
    const visibility = portfolio?.visibility ?? 'public';
    if (visibility === 'hidden') {
      return false;
    }
    if (visibility === 'labs' && !includeLabs) {
      return false;
    }
    if (blueprintSet === 'featured' && visibility !== 'featured') {
      return false;
    }
    if (blueprintSet === 'certified' && portfolio?.artifact.status !== 'certified') {
      return false;
    }
    if (blueprintSet === 'labs' && visibility !== 'labs') {
      return false;
    }
  }

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
  blueprintSet: PublicBlueprintSet,
  includeLabs: boolean,
  limit: number,
  offset: number,
): {
  sort: PublicContentSort;
  filteredTotal: number;
  items: T[];
} {
  const sort = normalizePublicContentSort(sortParam);
  const filtered = items.filter((item) =>
    matchesPublicContentFilters(item, recommendedOnly, intelligenceSource, blueprintSet, includeLabs),
  );
  const sorted = sortPublicContent(filtered, sort);

  return {
    sort,
    filteredTotal: filtered.length,
    items: sorted.slice(offset, offset + limit),
  };
}
