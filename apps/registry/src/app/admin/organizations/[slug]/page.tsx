import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { isAdmin } from '@/lib/admin';

export const metadata: Metadata = {
  title: 'Organization Detail',
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function AdminOrganizationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect('/dashboard');
  }

  const token = session.access_token;
  const adminKey = process.env.DECANTR_ADMIN_KEY ?? '';

  let detail = null;
  let error: string | null = null;
  try {
    detail = await api.getAdminOrganization(token, adminKey, slug);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load organization detail';
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Organization Operations</h3>
          <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
            Support and inspect a single org across seats, package posture, governance, and recent operational events.
          </p>
        </div>
        <Link href="/admin/organizations" className="d-interactive" data-variant="ghost">
          Back to organizations
        </Link>
      </div>

      {error ? (
        <div className="d-annotation" data-status="error" style={{ display: 'block' }}>
          {error}
        </div>
      ) : null}

      {detail ? (
        <>
          <section className="d-section" data-density="compact">
            <div className="d-surface grid gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base" style={{ fontWeight: 600 }}>
                    {detail.organization.name}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                    {detail.organization.slug}
                  </div>
                </div>
                <span className="d-annotation" data-status={detail.organization.tier === 'enterprise' ? 'warning' : 'info'}>
                  {detail.organization.tier}
                </span>
              </div>

              <div className="grid gap-1 text-sm" style={{ color: 'var(--d-text-muted)' }}>
                <div>Seats: {detail.usage.member_count} / {detail.organization.seat_limit}</div>
                <div>Public packages: {detail.usage.public_packages}</div>
                <div>Private packages: {detail.usage.private_packages}</div>
                <div>Pending approvals: {detail.usage.pending_approvals}</div>
                <div>API requests (30d): {detail.usage.api_requests_30d}</div>
                <div>Policy: {detail.policy.require_public_content_approval ? 'Public content approval required' : 'Public content can publish directly'}</div>
              </div>
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span
              className="d-label block mb-4"
              style={{
                paddingLeft: '0.75rem',
                borderLeft: '2px solid var(--d-accent)',
              }}
            >
              Members ({detail.members.length})
            </span>

            <div className="d-surface grid gap-3">
              {detail.members.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between gap-3" style={{ borderTop: '1px solid var(--d-border)', paddingTop: '0.75rem' }}>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm" style={{ fontWeight: 600 }}>
                      {member.display_name || member.email}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                      {member.email}
                    </span>
                  </div>
                  <span className="d-annotation">{member.role}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span
              className="d-label block mb-4"
              style={{
                paddingLeft: '0.75rem',
                borderLeft: '2px solid var(--d-accent)',
              }}
            >
              Recent Package Activity
            </span>

            <div className="d-surface grid gap-3">
              {detail.recent_content.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3" style={{ borderTop: '1px solid var(--d-border)', paddingTop: '0.75rem' }}>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm" style={{ fontWeight: 600 }}>
                      {item.name || item.slug}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                      {item.type} · {item.visibility} · {item.status}
                    </span>
                  </div>
                  <Link href={`/${item.type}/${encodeURIComponent(item.namespace)}/${item.slug}`} className="d-interactive" data-variant="ghost">
                    Open
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span
              className="d-label block mb-4"
              style={{
                paddingLeft: '0.75rem',
                borderLeft: '2px solid var(--d-accent)',
              }}
            >
              Recent Audit
            </span>

            <div className="d-surface grid gap-3">
              {detail.recent_audit.map((entry) => (
                <div key={entry.id} className="grid gap-1" style={{ borderTop: '1px solid var(--d-border)', paddingTop: '0.75rem' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm" style={{ fontWeight: 600 }}>
                      {entry.action}
                    </span>
                    <span className="d-annotation" data-status="info">
                      {entry.scope}
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                    {entry.target_type}{entry.target_id ? ` · ${entry.target_id}` : ''}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                    {formatTimestamp(entry.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
