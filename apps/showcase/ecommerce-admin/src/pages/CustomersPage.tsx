import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Tag } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { customers } from '@/data/mock';

export function CustomersPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'vip' | 'active' | 'dormant'>('all');

  const filtered = customers.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (query && !c.name.toLowerCase().includes(query.toLowerCase()) && !c.email.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Customers"
        description={`${customers.length} total · ${customers.filter(c => c.status === 'vip').length} VIP`}
        actions={
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
            <Download size={14} /> Export
          </button>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input
            className="d-control"
            placeholder="Search by name or email..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', padding: '0.125rem', background: 'var(--d-surface)', border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius-sm)' }}>
          {(['all', 'vip', 'active', 'dormant'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.25rem 0.625rem',
                fontSize: '0.75rem',
                background: filter === f ? 'var(--d-accent)' : 'transparent',
                color: filter === f ? '#fff' : 'var(--d-text)',
                border: 'none',
                borderRadius: 'var(--d-radius-sm)',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontWeight: 500,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Customer</th>
              <th className="d-data-header">Location</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Orders</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>LTV</th>
              <th className="d-data-header">Tags</th>
              <th className="d-data-header">Status</th>
              <th className="d-data-header">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="d-data-row">
                <td className="d-data-cell">
                  <Link to={`/customers/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', color: 'var(--d-text)' }}>
                    <div className="ea-avatar" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>{c.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{c.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{c.email}</div>
                    </div>
                  </Link>
                </td>
                <td className="d-data-cell" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{c.city}</td>
                <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>{c.orders}</td>
                <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', fontWeight: 600 }}>${c.ltv.toFixed(2)}</td>
                <td className="d-data-cell">
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {c.tags.map(t => (
                      <span key={t} className="d-annotation" style={{ fontSize: '0.65rem' }}><Tag size={10} />{t}</span>
                    ))}
                  </div>
                </td>
                <td className="d-data-cell"><StatusBadge status={c.status === 'vip' ? 'active' : c.status === 'dormant' ? 'pending' : 'active'}>{c.status}</StatusBadge></td>
                <td className="d-data-cell" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{c.lastOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
