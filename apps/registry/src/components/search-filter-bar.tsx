'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const TYPES = [
  { label: 'All', value: '', icon: null },
  { label: 'Patterns', value: 'patterns', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
  { label: 'Themes', value: 'themes', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5" /><circle cx="6.5" cy="13.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /><path d="M3 3h18v18H3z" /></svg> },
  { label: 'Blueprints', value: 'blueprints', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg> },
  { label: 'Shells', value: 'shells', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg> },
  { label: 'Archetypes', value: 'archetypes', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg> },
] as const;

const SORTS = ['Relevance', 'Most Downloaded', 'Recently Updated', 'Name A-Z'] as const;

interface Props {
  baseUrl?: string;
}

export function SearchFilterBar({ baseUrl = '/browse' }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get('q') || '';
  const activeType = searchParams.get('type') || '';
  const sort = searchParams.get('sort') || 'Relevance';

  const buildUrl = useCallback((params: Record<string, string>) => {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    sp.delete('offset');
    const qs = sp.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  }, [searchParams, baseUrl]);

  function handleSearch(value: string) {
    router.push(buildUrl({ q: value }));
  }

  function handleType(type: string) {
    if (type === '') {
      // "All" goes to /browse with no type, and clears query
      const sp = new URLSearchParams();
      if (sort && sort !== 'Relevance') sp.set('sort', sort);
      const qs = sp.toString();
      router.push(qs ? `/browse?${qs}` : '/browse');
    } else {
      router.push(buildUrl({ type, q: '' }));
    }
  }

  function handleSort(value: string) {
    router.push(buildUrl({ sort: value === 'Relevance' ? '' : value }));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--d-text-muted)',
            pointerEvents: 'none',
          }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="d-control"
          type="text"
          placeholder="Search patterns, themes, blueprints..."
          defaultValue={query}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch((e.target as HTMLInputElement).value);
          }}
          onBlur={(e) => {
            if (e.target.value !== query) handleSearch(e.target.value);
          }}
          style={{ paddingLeft: '2.25rem' }}
        />
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {TYPES.map((type) => (
            <button
              key={type.label}
              className="d-interactive"
              data-variant={activeType === type.value ? 'primary' : 'ghost'}
              onClick={() => handleType(type.value)}
              style={{
                borderRadius: 'var(--d-radius-full)',
                fontSize: '0.8125rem',
                padding: '0.25rem 0.75rem',
              }}
            >
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium" style={{ color: 'var(--d-text-muted)' }}>Sort by</span>
          <select
            className="d-control"
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            style={{ width: 'auto', minWidth: 160 }}
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
