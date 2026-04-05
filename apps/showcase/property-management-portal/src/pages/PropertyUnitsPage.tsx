import { Link, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { properties, units, tenants } from '@/data/mock';

export function PropertyUnitsPage() {
  const { id } = useParams();
  const property = properties.find(p => p.id === id) ?? properties[0];
  const propertyUnits = units.filter(u => u.propertyId === property.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title={`${property.name} — Units`}
        description={`${property.occupiedUnits} of ${property.units} units occupied`}
        actions={
          <button className="pm-button-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>
            <Plus size={14} /> Add unit
          </button>
        }
      />

      <div className="pm-card" style={{ padding: 0 }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Unit</th>
              <th className="d-data-header">Layout</th>
              <th className="d-data-header">Sqft</th>
              <th className="d-data-header">Rent</th>
              <th className="d-data-header">Tenant</th>
              <th className="d-data-header">Lease Ends</th>
              <th className="d-data-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {propertyUnits.map(u => {
              const tenant = tenants.find(t => t.id === u.tenantId);
              return (
                <tr key={u.id} className="d-data-row">
                  <td className="d-data-cell" style={{ fontWeight: 500 }}>
                    <Link to={`/properties/${property.id}/units/${u.id}`} style={{ color: 'var(--d-text)', textDecoration: 'none' }}>{u.number}</Link>
                  </td>
                  <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{u.bedrooms}BR / {u.bathrooms}BA</td>
                  <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{u.sqft}</td>
                  <td className="d-data-cell" style={{ fontSize: '0.825rem', fontWeight: 600 }}>${u.rent.toLocaleString()}</td>
                  <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{tenant ? tenant.name : <span style={{ color: 'var(--d-text-muted)' }}>—</span>}</td>
                  <td className="d-data-cell" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{u.leaseEnd ?? '—'}</td>
                  <td className="d-data-cell"><StatusBadge status={u.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
