import { Link } from 'react-router-dom';
import { CreditCard, Wrench, FileText, Home as HomeIcon, Calendar } from 'lucide-react';
import { currentTenant, maintenanceTickets } from '@/data/mock';

export function TenantPortalHomePage() {
  const myTickets = maintenanceTickets.filter(t => t.tenantName === currentTenant.name).slice(0, 3);
  const daysUntilDue = 0; // rent due today for demo

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--d-primary)' }}>
          Welcome back, {currentTenant.name.split(' ')[0]}
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--d-text-muted)', marginTop: '0.375rem' }}>
          {currentTenant.propertyName} · Unit {currentTenant.unitNumber}
        </p>
      </div>

      {/* Rent reminder */}
      <div className="pm-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, color-mix(in srgb, var(--d-primary) 6%, var(--d-surface)), var(--d-surface))', border: '1px solid color-mix(in srgb, var(--d-primary) 20%, var(--d-border))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="d-label" style={{ marginBottom: '0.375rem' }}>April Rent</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--d-primary)' }}>${currentTenant.rent.toLocaleString()}.00</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
              {daysUntilDue === 0 ? 'Due today' : `Due in ${daysUntilDue} days`} · Auto-pay enabled
            </div>
          </div>
          <Link to="/tenant-portal/payments" className="pm-button-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.9rem' }}>
            <CreditCard size={16} /> Pay rent
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
        <Link to="/tenant-portal/maintenance" className="pm-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div className="pm-feature-icon" style={{ width: 40, height: 40, marginBottom: 0 }}>
            <Wrench size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--d-primary)' }}>Submit request</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Maintenance</div>
          </div>
        </Link>
        <Link to="/tenant-portal/documents" className="pm-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div className="pm-feature-icon" style={{ width: 40, height: 40, marginBottom: 0 }}>
            <FileText size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--d-primary)' }}>Documents</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Lease, receipts</div>
          </div>
        </Link>
        <Link to="/tenant-portal/payments" className="pm-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div className="pm-feature-icon" style={{ width: 40, height: 40, marginBottom: 0 }}>
            <CreditCard size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--d-primary)' }}>Payment history</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>View receipts</div>
          </div>
        </Link>
      </div>

      {/* Lease info + Requests */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="pm-card" style={{ padding: '1.25rem' }}>
          <div className="d-label" style={{ marginBottom: '0.875rem' }}>Your Lease</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HomeIcon size={14} style={{ color: 'var(--d-text-muted)' }} />
              {currentTenant.propertyName}, Unit {currentTenant.unitNumber}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={14} style={{ color: 'var(--d-text-muted)' }} />
              {currentTenant.leaseStart} — {currentTenant.leaseEnd}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={14} style={{ color: 'var(--d-text-muted)' }} />
              ${currentTenant.rent.toLocaleString()}/month
            </div>
          </div>
        </div>
        <div className="pm-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <div className="d-label">Your Requests</div>
            <Link to="/tenant-portal/maintenance" style={{ fontSize: '0.75rem', color: 'var(--d-accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {myTickets.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {myTickets.map(t => (
                <div key={t.id} style={{ padding: '0.5rem 0.625rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-sm)' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 500 }}>{t.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{t.number} · {t.submitted}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.825rem', color: 'var(--d-text-muted)' }}>No open requests. Everything's in order!</p>
          )}
        </div>
      </div>
    </div>
  );
}
