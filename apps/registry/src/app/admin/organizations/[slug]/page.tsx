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
    <div className="registry-page-stack">
      <div className="registry-page-intro registry-admin-head">
        <div>
          <h3 className="text-lg font-semibold">Organization Operations</h3>
          <p className="registry-muted-copy">
            Support and inspect a single org across seats, package posture, governance, and recent operational events.
          </p>
        </div>
        <Link href="/admin/organizations" className="d-interactive" data-variant="ghost">
          Back to organizations
        </Link>
      </div>

      {error ? (
        <div className="d-annotation registry-inline-error" data-status="error">
          {error}
        </div>
      ) : null}

      {detail ? (
        <>
          <section className="d-section" data-density="compact">
            <div className="d-surface registry-admin-card">
              <div className="registry-admin-card-head">
                <div>
                  <div className="registry-admin-card-title">{detail.organization.name}</div>
                  <div className="registry-admin-card-subtitle">{detail.organization.slug}</div>
                </div>
                <span className="d-annotation" data-status={detail.organization.tier === 'enterprise' ? 'warning' : 'info'}>
                  {detail.organization.tier}
                </span>
              </div>

              <div className="registry-admin-card-list">
                <div>Seats: {detail.usage.member_count} / {detail.organization.seat_limit}</div>
                <div>Public packages: {detail.usage.public_packages}</div>
                <div>Private packages: {detail.usage.private_packages}</div>
                <div>Pending approvals: {detail.usage.pending_approvals}</div>
                <div>API requests (30d): {detail.usage.api_requests_30d}</div>
                <div>Policy: {detail.policy.require_public_content_approval ? 'Public content approval required' : 'Public content can publish directly'}</div>
                <div>Member submissions: {detail.policy.allow_member_submissions ? 'Enabled' : 'Admins and owners only'}</div>
                <div>Private package review: {detail.policy.require_private_content_approval ? 'Required' : 'Direct private publish'}</div>
              </div>
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Members ({detail.members.length})
            </span>

            <div className="d-surface registry-admin-stack">
              {detail.members.map((member) => (
                <div key={member.user_id} className="registry-admin-row">
                  <div className="registry-admin-row-copy">
                    <span className="registry-admin-row-title">
                      {member.display_name || member.email}
                    </span>
                    <span className="registry-admin-row-meta">
                      {member.email}
                    </span>
                  </div>
                  <span className="d-annotation">{member.role}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Recent Package Activity
            </span>

            <div className="d-surface registry-admin-stack">
              {detail.recent_content.map((item) => (
                <div key={item.id} className="registry-admin-row">
                  <div className="registry-admin-row-copy">
                    <span className="registry-admin-row-title">
                      {item.name || item.slug}
                    </span>
                    <span className="registry-admin-row-meta">
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
            <span className="d-label registry-anchor-label">
              Recent Audit
            </span>

            <div className="d-surface registry-admin-stack">
              {detail.recent_audit.map((entry) => (
                <div key={entry.id} className="registry-admin-log-entry">
                  <div className="registry-admin-log-head">
                    <span className="registry-admin-row-title">
                      {entry.action}
                    </span>
                    <span className="d-annotation" data-status="info">
                      {entry.scope}
                    </span>
                  </div>
                  <div className="registry-admin-row-meta">
                    {entry.target_type}{entry.target_id ? ` · ${entry.target_id}` : ''}
                  </div>
                  <div className="registry-admin-row-meta">
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
