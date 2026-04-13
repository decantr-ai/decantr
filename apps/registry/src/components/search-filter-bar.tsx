'use client';

import {
  CONTENT_INTELLIGENCE_SOURCES,
  isContentIntelligenceSource,
  normalizePublicContentSort,
  type ContentIntelligenceSource,
} from '@decantr/registry/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import {
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  type RegistryContentType,
} from '@/lib/content-types';

// Inline SVG icons (14px, stroke-based) to avoid adding lucide-react dependency
function IconGrid(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function IconComponent(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2 2L13 7M17 13l2 2-2 2" />
      <path d="M20 3h1v1M20 7h1v1M14 13h1v1M14 17h1v1" />
    </svg>
  );
}
function IconPalette(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" /><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" /><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}
function IconLayers(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}
function IconBox(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </svg>
  );
}
function IconCube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

const TYPE_ICONS: Record<RegistryContentType, React.ReactNode> = {
  patterns: <IconComponent />,
  themes: <IconPalette />,
  blueprints: <IconLayers />,
  archetypes: <IconCube />,
  shells: <IconBox />,
};

const TYPES: { type?: RegistryContentType; label: string; icon: React.ReactNode }[] = [
  { label: 'All', icon: <IconGrid /> },
  ...CONTENT_TYPES.map((type) => ({
    type,
    label: CONTENT_TYPE_LABELS[type],
    icon: TYPE_ICONS[type],
  })),
];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'recent', label: 'Recently Published' },
  { value: 'name', label: 'Name A-Z' },
] as const;

const INTELLIGENCE_SOURCE_LABELS: Record<ContentIntelligenceSource, string> = {
  authored: 'Authored',
  benchmark: 'Benchmark',
  hybrid: 'Hybrid',
};

interface SearchFilterBarProps {
  baseUrl?: string;
  showSort?: boolean;
  showRecommendedToggle?: boolean;
  resultCount?: number;
  activeType?: RegistryContentType | 'all';
}

export function SearchFilterBar({
  baseUrl = '/browse',
  showSort = true,
  showRecommendedToggle = true,
  resultCount,
  activeType = 'all',
}: SearchFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get('q') ?? '';
  const currentSort = normalizePublicContentSort(searchParams.get('sort'));
  const recommendedOnly = searchParams.get('recommended') === 'true';
  const currentIntelligenceSource = (() => {
    const rawValue = searchParams.get('intelligence_source');
    return rawValue && isContentIntelligenceSource(rawValue) ? rawValue : '';
  })();

  const [query, setQuery] = useState(currentQuery);
  const activeLabel =
    activeType === 'all' ? 'All' : CONTENT_TYPE_LABELS[activeType];

  const navigate = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
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

  function handleTypeChange(type?: RegistryContentType) {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('offset');
    params.delete('q');
    params.delete('type');

    const nextBase = type ? `/browse/${type}` : '/browse';
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${nextBase}?${qs}` : nextBase);
    });
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    navigate({ sort: e.target.value });
  }

  function handleRecommendedToggle() {
    navigate({ recommended: recommendedOnly ? '' : 'true' });
  }

  function handleIntelligenceSourceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    navigate({ intelligence_source: e.target.value });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
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
          className="pointer-events-none"
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--d-text-muted)',
          }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patterns, themes, blueprints, archetypes, or shells..."
          className="d-control w-full"
          style={{ paddingLeft: '2.25rem' }}
          aria-label="Search registry content"
        />
        {isPending && (
          <div
            className="absolute"
            style={{ right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          >
            <div className="w-4 h-4 border-2 border-d-muted border-t-d-primary rounded-full animate-spin" />
          </div>
        )}
      </form>

      {/* Filters row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Type tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {TYPES.map(({ type, label, icon }) => (
            <button
              key={label}
              className="d-interactive"
              data-variant={activeLabel === label ? 'primary' : 'ghost'}
              onClick={() => handleTypeChange(type)}
              type="button"
              style={{
                borderRadius: 'var(--d-radius-full)',
                fontSize: '0.8125rem',
                padding: '0.25rem 0.75rem',
                gap: '0.375rem',
              }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {resultCount !== undefined && (
            <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
              {resultCount} results
            </span>
          )}
          {showRecommendedToggle && (
            <button
              type="button"
              className="d-interactive"
              data-variant={recommendedOnly ? 'primary' : 'ghost'}
              onClick={handleRecommendedToggle}
              style={{
                borderRadius: 'var(--d-radius-full)',
                fontSize: '0.8125rem',
                padding: '0.25rem 0.75rem',
              }}
            >
              Recommended only
            </button>
          )}
          <div className="flex items-center gap-2">
            <span
              className="text-sm whitespace-nowrap"
              style={{ color: 'var(--d-text-muted)' }}
            >
              Intelligence
            </span>
            <select
              value={currentIntelligenceSource}
              onChange={handleIntelligenceSourceChange}
              className="d-control"
              style={{ minWidth: '9rem' }}
            >
              <option value="">All sources</option>
              {CONTENT_INTELLIGENCE_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {INTELLIGENCE_SOURCE_LABELS[source]}
                </option>
              ))}
            </select>
          </div>
          {showSort && (
            <div className="flex items-center gap-2">
              <span
                className="text-sm whitespace-nowrap"
                style={{ color: 'var(--d-text-muted)' }}
              >
                Sort by
              </span>
              <select
                value={currentSort}
                onChange={handleSortChange}
                className="d-control"
                style={{ width: 'auto', minWidth: 160 }}
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
    </div>
  );
}
