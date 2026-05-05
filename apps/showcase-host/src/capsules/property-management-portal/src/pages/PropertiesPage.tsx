import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Search, Grid3x3, List, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { properties } from '@/data/mock';

export function PropertiesPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');
  const filtered = properties.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.city.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Properties"
        description={`${properties.length} properties · ${properties.reduce((s, p) => s + p.units, 0)} units total`}
        actions={
          <Link to="/properties/new" className="pm-button-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>
            <Plus size={14} /> Add property
          </Link>
        }
      />

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input
            className="d-control"
            placeholder="Search properties or cities..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 32, fontSize: '0.85rem' }}
          />
        </div>
        <select className="d-control" style={{ width: 160, fontSize: '0.85rem' }} defaultValue="all">
          <option value="all">All types</option>
          <option>Multifamily</option>
          <option>Single Family</option>
          <option>Commercial</option>
        </select>
        <div style={{ display: 'flex', gap: 2, border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius-sm)', padding: 2 }}>
          <button className="d-interactive" data-variant={view === 'grid' ? 'primary' : 'ghost'} onClick={() => setView('grid')} style={{ padding: '0.375rem', border: 'none' }} aria-label="Grid view">
            <Grid3x3 size={14} />
          </button>
          <button className="d-interactive" data-variant={view === 'list' ? 'primary' : 'ghost'} onClick={() => setView('list')} style={{ padding: '0.375rem', border: 'none' }} aria-label="List view">
            <List size={14} />
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {filtered.map(p => {
            const occ = (p.occupiedUnits / p.units) * 100;
            return (
              <Link key={p.id} to={`/properties/${p.id}`} className="pm-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div style={{ display: 'flex', gap: '0.875rem', marginBottom: '0.875rem' }}>
                  <div className="pm-property-thumb">{p.image}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--d-primary)' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.125rem' }}>
                      <MapPin size={11} /> {p.city}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '0.875rem' }}>
                  <div>
                    <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</div>
                    <div style={{ fontWeight: 600, color: 'var(--d-primary)' }}>${p.monthlyRevenue.toLocaleString()}/mo</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Occupancy</div>
                    <div style={{ fontWeight: 600, color: 'var(--d-primary)' }}>{p.occupiedUnits}/{p.units} units</div>
                  </div>
                </div>
                <div className="pm-occupancy-bar">
                  <div className="pm-occupancy-fill" style={{ width: `${occ}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
                  <span>{p.type}</span>
                  <span>{occ.toFixed(0)}% occupied</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="pm-card" style={{ padding: 0 }}>
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Property</th>
                <th className="d-data-header">Type</th>
                <th className="d-data-header">Units</th>
                <th className="d-data-header">Revenue</th>
                <th className="d-data-header">Manager</th>
                <th className="d-data-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="d-data-row">
                  <td className="d-data-cell">
                    <Link to={`/properties/${p.id}`} style={{ color: 'var(--d-text)', textDecoration: 'none', fontWeight: 500 }}>{p.name}</Link>
                    <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{p.city}</div>
                  </td>
                  <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{p.type}</td>
                  <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{p.occupiedUnits}/{p.units}</td>
                  <td className="d-data-cell" style={{ fontSize: '0.825rem', fontWeight: 600 }}>${p.monthlyRevenue.toLocaleString()}</td>
                  <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>{p.manager}</td>
                  <td className="d-data-cell"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
