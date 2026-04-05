import { Link, useParams } from 'react-router-dom';
import { Edit, Wrench } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { StatusBadge } from '@/components/StatusBadge';
import { properties, units, tenants, maintenanceTickets } from '@/data/mock';

export function PropertyUnitDetailPage() {
  const { id, unitId } = useParams();
  const property = properties.find(p => p.id === id) ?? properties[0];
  const unit = units.find(u => u.id === unitId) ?? units[0];
  const tenant = tenants.find(t => t.id === unit.tenantId);
  const unitTickets = maintenanceTickets.filter(t => t.propertyId === property.id && t.unitNumber === unit.number);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title={`Unit ${unit.number}`}
        description={`${property.name} · ${unit.bedrooms}BR / ${unit.bathrooms}BA · ${unit.sqft} sqft`}
        actions={
          <>
            <Link to={`/properties/${property.id}/units`} className="d-interactive" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>Back to units</Link>
            <button className="pm-button-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}><Edit size={13} /> Edit unit</button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>Unit Details</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly rent</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-primary)' }}>${unit.rent.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bedrooms</div>
              <div style={{ fontSize: '1rem', fontWeight: 500 }}>{unit.bedrooms}</div>
            </div>
            <div>
              <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bathrooms</div>
              <div style={{ fontSize: '1rem', fontWeight: 500 }}>{unit.bathrooms}</div>
            </div>
            <div>
              <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Square feet</div>
              <div style={{ fontSize: '1rem', fontWeight: 500 }}>{unit.sqft.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
              <div style={{ marginTop: '0.25rem' }}><StatusBadge status={unit.status} /></div>
            </div>
            <div>
              <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lease ends</div>
              <div style={{ fontSize: '0.875rem' }}>{unit.leaseEnd ?? '—'}</div>
            </div>
          </div>
        </div>
        <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>Current Tenant</SectionLabel>
          {tenant ? (
            <Link to={`/tenants/${tenant.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="pm-avatar" style={{ width: 44, height: 44, fontSize: '0.95rem' }}>{tenant.avatar}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{tenant.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{tenant.email}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Since {tenant.moveInDate}</div>
              </div>
            </Link>
          ) : (
            <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', padding: '0.5rem 0' }}>
              Unit is vacant. <Link to="/tenants" style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>Add a tenant</Link>
            </div>
          )}
        </div>
      </div>

      <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
          <SectionLabel>Maintenance History</SectionLabel>
          <button className="d-interactive" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}><Wrench size={12} /> New ticket</button>
        </div>
        {unitTickets.length > 0 ? (
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Ticket</th>
                <th className="d-data-header">Category</th>
                <th className="d-data-header">Status</th>
                <th className="d-data-header">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {unitTickets.map(t => (
                <tr key={t.id} className="d-data-row">
                  <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>
                    <Link to={`/maintenance/${t.id}`} style={{ color: 'var(--d-text)', textDecoration: 'none', fontWeight: 500 }}>{t.title}</Link>
                  </td>
                  <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{t.category}</td>
                  <td className="d-data-cell"><StatusBadge status={t.status} /></td>
                  <td className="d-data-cell" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{t.submitted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>No maintenance tickets yet.</p>
        )}
      </div>
    </div>
  );
}
