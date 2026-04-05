import { Link, useParams } from 'react-router-dom';
import { Edit, ArrowRight, MapPin, Calendar, Ruler } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { StatusBadge } from '@/components/StatusBadge';
import { properties, units, tenants, maintenanceTickets } from '@/data/mock';

export function PropertyDetailPage() {
  const { id } = useParams();
  const property = properties.find(p => p.id === id) ?? properties[0];
  const propertyUnits = units.filter(u => u.propertyId === property.id);
  const propertyTenants = tenants.filter(t => t.propertyId === property.id);
  const propertyTickets = maintenanceTickets.filter(t => t.propertyId === property.id).slice(0, 5);
  const occ = (property.occupiedUnits / property.units) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title={property.name}
        description={`${property.address}, ${property.city}`}
        actions={
          <>
            <button className="d-interactive" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>
              <Edit size={13} /> Edit
            </button>
            <Link to={`/properties/${property.id}/units`} className="pm-button-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>
              View units <ArrowRight size={14} />
            </Link>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="pm-card" style={{ padding: '1.125rem' }}>
          <div className="d-label">Monthly Revenue</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-primary)', marginTop: '0.375rem' }}>${property.monthlyRevenue.toLocaleString()}</div>
        </div>
        <div className="pm-card" style={{ padding: '1.125rem' }}>
          <div className="d-label">Occupancy</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-primary)', marginTop: '0.375rem' }}>{occ.toFixed(0)}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{property.occupiedUnits} of {property.units} units</div>
        </div>
        <div className="pm-card" style={{ padding: '1.125rem' }}>
          <div className="d-label">Status</div>
          <div style={{ marginTop: '0.5rem' }}><StatusBadge status={property.status} /></div>
        </div>
        <div className="pm-card" style={{ padding: '1.125rem' }}>
          <div className="d-label">Open Tickets</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-primary)', marginTop: '0.375rem' }}>
            {maintenanceTickets.filter(t => t.propertyId === property.id && t.status !== 'resolved').length}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>Property Details</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={14} style={{ color: 'var(--d-text-muted)' }} />
              <div>
                <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Address</div>
                <div>{property.address}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={14} style={{ color: 'var(--d-text-muted)' }} />
              <div>
                <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Year Built</div>
                <div>{property.yearBuilt}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ruler size={14} style={{ color: 'var(--d-text-muted)' }} />
              <div>
                <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Square Feet</div>
                <div>{property.sqft.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={14} style={{ color: 'var(--d-text-muted)' }} />
              <div>
                <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acquired</div>
                <div>{property.acquired}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>Management</SectionLabel>
          <div style={{ fontSize: '0.875rem' }}>
            <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Property Manager</div>
            <div style={{ fontWeight: 600 }}>{property.manager}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>Assigned since {property.acquired}</div>
          </div>
        </div>
      </div>

      <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
          <SectionLabel>Units ({propertyUnits.length})</SectionLabel>
          <Link to={`/properties/${property.id}/units`} style={{ fontSize: '0.75rem', color: 'var(--d-accent)', textDecoration: 'none' }}>Manage units →</Link>
        </div>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Unit</th>
              <th className="d-data-header">Layout</th>
              <th className="d-data-header">Sqft</th>
              <th className="d-data-header">Rent</th>
              <th className="d-data-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {propertyUnits.map(u => (
              <tr key={u.id} className="d-data-row">
                <td className="d-data-cell" style={{ fontWeight: 500 }}>
                  <Link to={`/properties/${property.id}/units/${u.id}`} style={{ color: 'var(--d-text)', textDecoration: 'none' }}>{u.number}</Link>
                </td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{u.bedrooms}BR / {u.bathrooms}BA</td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{u.sqft}</td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem', fontWeight: 600 }}>${u.rent.toLocaleString()}</td>
                <td className="d-data-cell"><StatusBadge status={u.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>Residents ({propertyTenants.length})</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {propertyTenants.map(t => (
              <Link key={t.id} to={`/tenants/${t.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem', borderRadius: 'var(--d-radius-sm)', textDecoration: 'none', color: 'inherit' }}>
                <div className="pm-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{t.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>Unit {t.unitNumber} · ${t.rent}/mo</div>
                </div>
                <StatusBadge status={t.status} />
              </Link>
            ))}
          </div>
        </div>
        <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '0.875rem' }}>Recent Tickets</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {propertyTickets.map(t => (
              <Link key={t.id} to={`/maintenance/${t.id}`} style={{ padding: '0.5rem', borderRadius: 'var(--d-radius-sm)', textDecoration: 'none', color: 'inherit', background: 'var(--d-surface-raised)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 500 }}>{t.title}</div>
                  <StatusBadge status={t.status} />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>Unit {t.unitNumber} · {t.submitted}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
