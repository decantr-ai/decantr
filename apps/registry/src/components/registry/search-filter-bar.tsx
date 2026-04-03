'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';

const CONTENT_TYPES = ['all', 'patterns', 'themes', 'blueprints', 'archetypes', 'shells'] as const;
const NAMESPACES = ['all', '@official', '@community'] as const;

export function SearchFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentType = searchParams.get('type') || 'all';
  const currentNamespace = searchParams.get('namespace') || 'all';
  const currentQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(currentQuery);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === 'all' || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      params.delete('offset'); // Reset pagination on filter change
      startTransition(() => {
        router.push(`/?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q: query });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Search content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-[var(--secondary)] px-4 py-2 text-sm font-medium text-[var(--bg)] hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {CONTENT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => updateParams({ type })}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              currentType === type
                ? 'bg-[var(--secondary)]/10 text-[var(--secondary)]'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}

        <span className="mx-2 h-4 w-px bg-[var(--border)]" />

        {NAMESPACES.map((ns) => (
          <button
            key={ns}
            onClick={() => updateParams({ namespace: ns })}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              currentNamespace === ns
                ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            {ns === 'all' ? 'All Sources' : ns}
          </button>
        ))}
      </div>

      {isPending && (
        <div className="text-xs text-[var(--fg-muted)]">Loading...</div>
      )}
    </div>
  );
}
