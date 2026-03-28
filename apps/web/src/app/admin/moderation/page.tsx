import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import type { ModerationQueueItem } from '@/lib/api';
import { ModerationItem } from '@/components/admin/moderation-item';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function ModerationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status || 'pending';
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';
  const adminKey = process.env.DECANTR_ADMIN_KEY ?? '';

  let items: ModerationQueueItem[] = [];
  let total = 0;
  let error: string | null = null;

  try {
    const result = await api.getModerationQueue(token, adminKey, {
      status,
      limit: PAGE_SIZE,
      offset,
    });
    items = result.items;
    total = result.total;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to fetch moderation queue';
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Moderation Queue</h1>
        <p className="text-[var(--fg-muted)] mt-1">
          Review and moderate community submissions
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2">
        {statusOptions.map((opt) => (
          <Link
            key={opt.value}
            href={`/admin/moderation?status=${opt.value}`}
          >
            <Button
              variant={status === opt.value ? 'primary' : 'secondary'}
              size="sm"
            >
              {opt.label}
              {status === opt.value && (
                <span className="ml-1.5 text-xs opacity-80">({total})</span>
              )}
            </Button>
          </Link>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-[var(--error)]">
          <p className="text-[var(--error)] text-sm">{error}</p>
        </Card>
      )}

      {/* Empty state */}
      {!error && items.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-[var(--fg-muted)]">
            No {status} items in the queue.
          </p>
        </Card>
      )}

      {/* Queue items */}
      <div className="space-y-4">
        {items.map((item) => (
          <ModerationItem key={item.id} item={item} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-[var(--fg-dim)]">
            Showing {offset + 1}-{Math.min(offset + PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link href={`/admin/moderation?status=${status}&page=${page - 1}`}>
                <Button variant="secondary" size="sm">Previous</Button>
              </Link>
            )}
            <span className="text-sm text-[var(--fg-muted)] px-2">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link href={`/admin/moderation?status=${status}&page=${page + 1}`}>
                <Button variant="secondary" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
