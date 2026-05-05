import { Link, useParams } from 'react-router-dom';
import { Mail, Phone, MessageSquare, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { StatusBadge } from '@/components/StatusBadge';
import { tenants, payments, maintenanceTickets } from '@/data/mock';

export function TenantDetailPage() {
  const { id } = useParams();
  const tenant = tenants.find(t => t.id === id) ?? tenants[0];
  const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
  const tenantTickets = maintenanceTickets.filter(t => t.tenantName === tenant.name);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title={tenant.name}
        description={`${tenant.propertyName} · Unit ${tenant.unitNumber}`}
        actions={
          <>
            <button className="d-interactive" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>
              <MessageSquare size={13} /> Message
            </button>
            <button className="pm-button-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>
              <Mail size={13} /> Email
            </button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
        {/* Profile */}
        <div className="pm-card" style={{ padding: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div className="pm-avatar" style={{ width: 84, height: 84, fontSize: '1.75rem', margin: '0 auto 0.75rem' }}>{tenant.avatar}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--d-primary)' }}>{tenant.name}</div>
            <div style={{ marginTop: '0.5rem' }}><StatusBadge status={tenant.status} /></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--d-text-muted)' }}>
              <Mail size={14} /> {tenant.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--d-text-muted)' }}>
              <Phone size={14} /> {tenant.phone}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--d-text-muted)' }}>
              <Calendar size={14} /> Moved in {tenant.moveInDate}
            </div>
          </div>
          {tenant.tags.length > 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {tenant.tags.map(t => (
                <span key={t} className="d-annotation" style={{ fontSize: '0.7rem' }}>{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Lease */}
        <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>Lease Details</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly rent</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-primary)' }}>${tenant.rent.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: tenant.balance > 0 ? 'var(--d-warning)' : 'var(--d-success)' }}>
                ${tenant.balance.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lease start</div>
              <div>{tenant.leaseStart}</div>
            </div>
            <div>
              <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lease end</div>
              <div>{tenant.leaseEnd}</div>
            </div>
            <div>
              <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Property</div>
              <div>{tenant.propertyName}</div>
            </div>
            <div>
              <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit</div>
              <div>{tenant.unitNumber}</div>
            </div>
          </div>
          <div className="pm-divider" />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="d-interactive" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>Renew lease</button>
            <button className="d-interactive" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>View lease PDF</button>
          </div>
        </div>
      </div>

      <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '0.875rem' }}>Payment History</SectionLabel>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Due Date</th>
              <th className="d-data-header">Amount</th>
              <th className="d-data-header">Method</th>
              <th className="d-data-header">Paid</th>
              <th className="d-data-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {tenantPayments.map(p => (
              <tr key={p.id} className="d-data-row">
                <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{p.dueDate}</td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem', fontWeight: 600 }}>${p.amount.toLocaleString()}</td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{p.method}</td>
                <td className="d-data-cell" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{p.paidDate ?? '—'}</td>
                <td className="d-data-cell"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tenantTickets.length > 0 && (
        <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>Maintenance Requests</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tenantTickets.map(t => (
              <Link key={t.id} to={`/maintenance/${t.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.75rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-sm)', textDecoration: 'none', color: 'inherit' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{t.number} · {t.submitted}</div>
                </div>
                <StatusBadge status={t.status} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
