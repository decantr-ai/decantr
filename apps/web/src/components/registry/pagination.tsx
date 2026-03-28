'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 20;

export function Pagination({ total }: { total: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offset = Number(searchParams.get('offset') || '0');
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function goTo(newOffset: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (newOffset === 0) {
      params.delete('offset');
    } else {
      params.set('offset', String(newOffset));
    }
    router.push(`/registry?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 pt-8">
      <Button
        variant="secondary"
        size="sm"
        disabled={offset === 0}
        onClick={() => goTo(Math.max(0, offset - PAGE_SIZE))}
      >
        Previous
      </Button>
      <span className="text-xs sm:text-sm text-[var(--fg-muted)]">
        {currentPage}/{totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={offset + PAGE_SIZE >= total}
        onClick={() => goTo(offset + PAGE_SIZE)}
      >
        Next
      </Button>
    </div>
  );
}
