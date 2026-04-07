import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';

export default async function ContentPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || '';

  let items: any[] = [];
  let error = '';

  try {
    const res = await api.getMyContent(token);
    items = res.items || res || [];
    if (!Array.isArray(items)) items = [];
  } catch (err: any) {
    error = err.message || 'Failed to load content';
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Content</h3>
        <Link
          href="/dashboard/content/new"
          className="d-interactive"
          data-variant="primary"
          style={{ fontSize: '0.875rem', textDecoration: 'none' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Publish New
        </Link>
      </div>

      {error && (
        <div className="d-annotation" data-status="error">{error}</div>
      )}

      <ContentCardGrid items={items} editable />
    </div>
  );
}
