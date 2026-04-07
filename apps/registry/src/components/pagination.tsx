'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
}

export function Pagination({ total, limit, offset }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const showingFrom = total === 0 ? 0 : offset + 1;
  const showingTo = Math.min(offset + limit, total);

  const navigate = useCallback(
    (newOffset: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newOffset > 0) {
        params.set('offset', String(newOffset));
      } else {
        params.delete('offset');
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  if (total <= limit) return null;

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-d-muted">
        Showing <span className="font-medium text-d-text">{showingFrom}&#8211;{showingTo}</span> of{' '}
        <span className="font-medium text-d-text">{total}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          className="d-interactive py-1.5 px-3 text-sm"
          data-variant="ghost"
          disabled={currentPage <= 1}
          onClick={() => navigate(offset - limit)}
        >
          Previous
        </button>
        <span className="text-sm text-d-muted tabular-nums">
          {currentPage} / {totalPages}
        </span>
        <button
          className="d-interactive py-1.5 px-3 text-sm"
          data-variant="ghost"
          disabled={currentPage >= totalPages}
          onClick={() => navigate(offset + limit)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
