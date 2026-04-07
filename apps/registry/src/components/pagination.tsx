'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
  total: number;
  limit: number;
  baseUrl: string;
}

export function Pagination({ total, limit, baseUrl }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const start = offset + 1;
  const end = Math.min(offset + limit, total);
  const hasPrev = offset > 0;
  const hasNext = offset + limit < total;

  function navigate(newOffset: number) {
    const sp = new URLSearchParams(searchParams.toString());
    if (newOffset > 0) {
      sp.set('offset', String(newOffset));
    } else {
      sp.delete('offset');
    }
    const qs = sp.toString();
    router.push(qs ? `${baseUrl}?${qs}` : baseUrl);
  }

  if (total <= limit) return null;

  return (
    <div className="flex items-center justify-between" style={{ paddingTop: '1rem' }}>
      <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
        Showing {start}-{end} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          className="d-interactive"
          data-variant="ghost"
          disabled={!hasPrev}
          onClick={() => navigate(Math.max(0, offset - limit))}
          style={{ fontSize: '0.875rem' }}
        >
          Previous
        </button>
        <button
          className="d-interactive"
          data-variant="ghost"
          disabled={!hasNext}
          onClick={() => navigate(offset + limit)}
          style={{ fontSize: '0.875rem' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
