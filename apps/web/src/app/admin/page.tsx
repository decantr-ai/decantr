import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';
  const adminKey = process.env.DECANTR_ADMIN_KEY ?? '';

  let pendingCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;

  try {
    const pending = await api.getModerationQueue(token, adminKey, {
      status: 'pending',
      limit: 1,
    });
    pendingCount = pending.total;
  } catch {
    // API may not be reachable
  }

  try {
    const approved = await api.getModerationQueue(token, adminKey, {
      status: 'approved',
      limit: 1,
    });
    approvedCount = approved.total;
  } catch {
    // ignore
  }

  try {
    const rejected = await api.getModerationQueue(token, adminKey, {
      status: 'rejected',
      limit: 1,
    });
    rejectedCount = rejected.total;
  } catch {
    // ignore
  }

  const totalContent = approvedCount + pendingCount + rejectedCount;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Admin Overview</h1>
        <p className="text-[var(--fg-muted)] mt-1">Platform moderation and content management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-[var(--fg-dim)] text-sm">Pending Review</p>
          <p className="text-3xl font-bold text-[var(--warning)] mt-1">{pendingCount}</p>
        </Card>
        <Card>
          <p className="text-[var(--fg-dim)] text-sm">Total Approved</p>
          <p className="text-3xl font-bold text-[var(--success)] mt-1">{approvedCount}</p>
        </Card>
        <Card>
          <p className="text-[var(--fg-dim)] text-sm">Total Rejected</p>
          <p className="text-3xl font-bold text-[var(--error)] mt-1">{rejectedCount}</p>
        </Card>
      </div>

      <Card>
        <p className="text-[var(--fg-dim)] text-sm">Total Submissions</p>
        <p className="text-3xl font-bold text-[var(--fg)] mt-1">{totalContent}</p>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/moderation">
            <Button>Review Moderation Queue</Button>
          </Link>
          <Link href="/admin/moderation?status=pending">
            <Button variant="secondary">
              Pending Items ({pendingCount})
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
