import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Search, Mail, Phone } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { tenants } from '@/data/mock';

export function TenantsPage() {
  const [query, setQuery] = useState('');
  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.email.toLowerCase().includes(query.toLowerCase()) ||
    t.propertyName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Residents"
        description={`${tenants.length} residents · ${tenants.filter(t => t.status === 'active').length} active leases`}
        actions={
          <button className="pm-button-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>
            <Plus size={14} /> Add resident
          </button>
        }
      />

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input
            className="d-control"
            placeholder="Search residents..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 32, fontSize: '0.85rem' }}
          />
        </div>
        <select className="d-control" style={{ width: 160, fontSize: '0.85rem' }} defaultValue="all">
          <option value="all">All statuses</option>
          <option>Active</option>
          <option>Expiring</option>
          <option>Month-to-month</option>
          <option>Notice given</option>
        </select>
      </div>

      <div className="pm-card" style={{ padding: 0 }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Resident</th>
              <th className="d-data-header">Property / Unit</th>
              <th className="d-data-header">Rent</th>
              <th className="d-data-header">Lease Ends</th>
              <th className="d-data-header">Balance</th>
              <th className="d-data-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="d-data-row">
                <td className="d-data-cell">
                  <Link to={`/tenants/${t.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', color: 'inherit' }}>
                    <div className="pm-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={10} /> {t.email}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>
                  {t.propertyName}<br />
                  <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>Unit {t.unitNumber}</span>
                </td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem', fontWeight: 600 }}>${t.rent.toLocaleString()}</td>
                <td className="d-data-cell" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{t.leaseEnd}</td>
                <td className="d-data-cell" style={{ fontSize: '0.825rem', fontWeight: 600, color: t.balance > 0 ? 'var(--d-warning)' : 'var(--d-text-muted)' }}>
                  {t.balance > 0 ? `$${t.balance}` : '—'}
                </td>
                <td className="d-data-cell"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
