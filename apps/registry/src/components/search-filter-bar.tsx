'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

const CONTENT_TYPES = [
  { value: '', label: 'All' },
  { value: 'patterns', label: 'Patterns' },
  { value: 'themes', label: 'Themes' },
  { value: 'blueprints', label: 'Blueprints' },
  { value: 'shells', label: 'Shells' },
  { value: 'archetypes', label: 'Archetypes' },
] as const;

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
] as const;

interface SearchFilterBarProps {
  baseUrl?: string;
  showSort?: boolean;
}

export function SearchFilterBar({ baseUrl = '/browse', showSort = true }: SearchFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get('q') ?? '';
  const currentType = searchParams.get('type') ?? '';
  const currentSort = searchParams.get('sort') ?? 'relevance';

  const [query, setQuery] = useState(currentQuery);

  const navigate = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset offset on any filter change
      params.delete('offset');

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
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
    [router, searchParams, baseUrl],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ q: query });
  }

  function handleTypeChange(type: string) {
    navigate({ type });
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    navigate({ sort: e.target.value });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search row */}
      <form onSubmit={handleSubmit} className="relative">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-d-muted pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patterns, themes, blueprints..."
          className="d-control pl-10 pr-4 w-full focus:border-d-accent"
          aria-label="Search registry content"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-d-muted border-t-d-primary rounded-full animate-spin" />
          </div>
        )}
      </form>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Type tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {CONTENT_TYPES.map((ct) => {
            const isActive = currentType === ct.value;
            return (
              <button
                key={ct.value}
                onClick={() => handleTypeChange(ct.value)}
                className={`d-interactive py-1 px-3 text-xs rounded-full whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-d-primary text-white border-d-primary'
                    : ''
                }`}
                data-variant={isActive ? 'primary' : 'ghost'}
                aria-pressed={isActive}
              >
                {ct.label}
              </button>
            );
          })}
        </div>

        {/* Sort dropdown */}
        {showSort && (
          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs text-d-muted whitespace-nowrap">
              Sort by
            </label>
            <select
              id="sort-select"
              value={currentSort}
              onChange={handleSortChange}
              className="d-control py-1 px-2 text-xs w-auto min-w-[120px]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
