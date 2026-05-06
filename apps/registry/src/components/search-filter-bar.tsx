'use client';

import { normalizePublicContentSort } from '@decantr/registry/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition, type ReactNode } from 'react';
import {
  CONTENT_TYPE_LABELS,
  CONTENT_TYPES,
  type RegistryContentType,
} from '@/lib/content-types';
import {
  CONTENT_TYPE_PRESENTATION,
  SOURCE_FILTER_OPTIONS,
  getAllTypesIcon,
  type RegistrySourceFilter,
} from '@/lib/content-presentation';

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'recent', label: 'Recently Published' },
  { value: 'name', label: 'Name A-Z' },
] as const;

interface SearchFilterBarProps {
  baseUrl?: string;
  showSort?: boolean;
  showSourceFilter?: boolean;
  resultCount?: number;
  activeType?: RegistryContentType | 'all';
}

const TYPES: Array<{ type?: RegistryContentType; label: string; icon: ReactNode }> = [
  { label: 'All', icon: getAllTypesIcon() },
  ...CONTENT_TYPES.map((type) => ({
    type,
    label: CONTENT_TYPE_LABELS[type],
    icon: CONTENT_TYPE_PRESENTATION[type].icon,
  })),
];

export function SearchFilterBar({
  baseUrl = '/browse',
  showSort = true,
  showSourceFilter = true,
  resultCount,
  activeType = 'all',
}: SearchFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const currentQuery = searchParams.get('q') ?? '';
  const currentSort = normalizePublicContentSort(searchParams.get('sort'));
  const currentSource = SOURCE_FILTER_OPTIONS.some(
    (option) => option.value === searchParams.get('source'),
  )
    ? (searchParams.get('source') as RegistrySourceFilter)
    : 'all';
  const [query, setQuery] = useState(currentQuery);

  const navigate = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('offset');

      for (const [key, value] of Object.entries(updates)) {
        if (value && value !== 'all') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${baseUrl}?${qs}` : baseUrl);
      });
    },
    [baseUrl, router, searchParams],
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    navigate({ q: query });
  }

  function handleTypeChange(type?: RegistryContentType) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('offset');
    params.delete('type');
    const nextBase = type ? `/browse/${type}` : '/browse';
    const qs = params.toString();

    startTransition(() => {
      router.push(qs ? `${nextBase}?${qs}` : nextBase);
    });
  }

  function handleSortChange(event: React.ChangeEvent<HTMLSelectElement>) {
    navigate({ sort: event.target.value });
  }

  function handleSourceChange(source: RegistrySourceFilter) {
    navigate({ source });
  }

  function renderSourceFilters(mode: 'desktop' | 'mobile') {
    if (!showSourceFilter) {
      return null;
    }

    return (
      <div className="registry-source-strip" data-mode={mode} role="group" aria-label="Filter by source">
        {SOURCE_FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className="d-interactive registry-source-pill"
            data-variant={currentSource === option.value ? 'primary' : 'ghost'}
            data-source={option.value}
            onClick={() => handleSourceChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="registry-search-filter">
      <form onSubmit={handleSubmit} className="registry-search-input-row">
        <svg
          className="registry-search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Decantr blueprints, themes, patterns, archetypes, or shells..."
          className="d-control registry-search-input"
          aria-label="Search registry content"
        />
        {isPending ? (
          <div className="registry-search-spinner" aria-hidden="true">
            <div className="registry-search-spinner-dot" />
          </div>
        ) : null}
      </form>

      <div className="registry-type-strip" role="tablist" aria-label="Filter by content type">
        {TYPES.map(({ type, label, icon }) => {
          const isActive = (activeType === 'all' && !type) || activeType === type;
          const tone = type ? CONTENT_TYPE_PRESENTATION[type].tone : 'all';
          return (
            <button
              key={label}
              type="button"
              className="d-interactive registry-type-tab"
              data-variant={isActive ? 'primary' : 'ghost'}
              data-type-tone={tone}
              data-active={isActive}
              onClick={() => handleTypeChange(type)}
            >
              {icon}
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <div className="registry-search-meta">
        <div className="registry-search-summary">
          {resultCount !== undefined ? (
            <span className="registry-search-results">{resultCount} results</span>
          ) : null}
          {renderSourceFilters('desktop')}
        </div>

        <div className="registry-search-actions">
          <button
            type="button"
            className="d-interactive registry-mobile-filter-toggle"
            data-variant="ghost"
            onClick={() => setMobileFiltersOpen((open) => !open)}
            aria-expanded={mobileFiltersOpen}
          >
            Filters
          </button>

          {showSort ? (
            <label className="registry-search-sort">
              <span>Sort by</span>
              <select
                value={currentSort}
                onChange={handleSortChange}
                className="d-control registry-search-select"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </div>

      <div className="registry-mobile-filters" data-open={mobileFiltersOpen}>
        <div className="d-surface registry-mobile-filters-surface">
          {renderSourceFilters('mobile')}
          {showSort ? (
            <label className="registry-search-sort">
              <span>Sort by</span>
              <select
                value={currentSort}
                onChange={handleSortChange}
                className="d-control registry-search-select"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </div>
    </div>
  );
}
