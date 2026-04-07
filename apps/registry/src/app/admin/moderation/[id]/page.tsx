import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { JsonViewer } from '@/components/json-viewer';
import { DetailActions } from './detail-actions';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ModerationDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || '';
  const adminKey = process.env.DECANTR_ADMIN_KEY || '';

  let item = null;
  let error = '';

  try {
    const res = await api.getModerationQueue(token, adminKey, { limit: 50 });
    item = res.items?.find((i) => i.id === id) || null;
  } catch (err: any) {
    error = err.message || 'Failed to load item';
  }

  if (!item) {
    return (
      <div className="flex flex-col gap-6">
        <Link href="/admin/moderation" className="text-sm" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>
          &larr; Back to queue
        </Link>
        <div className="d-surface flex flex-col items-center gap-3" style={{ padding: '3rem' }}>
          <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
            {error || 'Item not found.'}
          </p>
        </div>
      </div>
    );
  }

  const singularType = item.content.type.endsWith('s') ? item.content.type.slice(0, -1) : item.content.type;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/moderation" className="text-sm" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>
        &larr; Back to queue
      </Link>

      {/* Header */}
      <div className="d-surface" data-elevation="raised">
        <div className="flex items-center gap-2 mb-3">
          <span className="d-annotation" data-status={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'error' : 'warning'}>
            {item.status}
          </span>
          <span className="d-annotation">{singularType}</span>
          <span className="d-annotation">{item.content.namespace}</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">{item.content.slug}</h2>
        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--d-text-muted)' }}>
          <span>Submitted by {item.submitted_by}</span>
          <span>{new Date(item.submitted_at).toLocaleDateString()}</span>
          <span style={{ fontFamily: 'var(--d-font-mono, monospace)' }}>v{item.content.version}</span>
        </div>
      </div>

      {/* Actions */}
      {item.status === 'pending' && (
        <DetailActions id={item.id} />
      )}

      {/* JSON viewer */}
      {item.content.data && (
        <JsonViewer data={item.content.data} title={`${item.content.namespace}/${item.content.slug}`} />
      )}
    </div>
  );
}
