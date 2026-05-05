import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Truck } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { StatusBadge } from '@/components/StatusBadge';
import { orders, fulfillmentColumns } from '@/data/mock';

export function OrdersPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  const filtered = orders.filter(o =>
    o.number.toLowerCase().includes(query.toLowerCase()) ||
    o.customerName.toLowerCase().includes(query.toLowerCase())
  );

  const allSelected = filtered.length > 0 && filtered.every(o => selected.has(o.id));

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(o => o.id)));
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Orders"
        description={`${orders.length} total, ${orders.filter(o => o.status === 'pending' || o.status === 'processing').length} need fulfillment`}
        actions={
          <>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
              <Download size={14} /> Export
            </button>
          </>
        }
      />

      {/* Fulfillment Kanban */}
      <div>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>Fulfillment Board</SectionLabel>
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
          {fulfillmentColumns.map(col => {
            const colOrders = orders.filter(o => o.status === col.key);
            return (
              <div key={col.key} className="ea-kanban-column">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0.25rem 0.5rem', borderBottom: '1px solid var(--d-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{col.label}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>{colOrders.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {colOrders.map(o => (
                    <Link key={o.id} to={`/orders/${o.id}`} className="ea-kanban-card" style={{ textDecoration: 'none', color: 'var(--d-text)', display: 'block' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>{o.number}</span>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', color: 'var(--d-accent)' }}>${o.total.toFixed(2)}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>{o.customerName}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>
                        <span>{o.items.length} item{o.items.length > 1 ? 's' : ''}</span>
                        <span>{o.placed}</span>
                      </div>
                    </Link>
                  ))}
                  {colOrders.length === 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', textAlign: 'center', padding: '1rem 0' }}>No orders</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input
            className="d-control"
            placeholder="Search orders, customers..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
          />
        </div>
        {selected.size > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.25rem 0.5rem', background: 'color-mix(in srgb, var(--d-accent) 10%, transparent)', borderRadius: 'var(--d-radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--d-accent)', fontWeight: 500 }}>{selected.size} selected</span>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
              <Truck size={12} /> Mark shipped
            </button>
          </div>
        )}
      </div>

      {/* Full table */}
      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header" style={{ width: 40 }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="d-data-header">Order</th>
              <th className="d-data-header">Customer</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Total</th>
              <th className="d-data-header">Status</th>
              <th className="d-data-header">Payment</th>
              <th className="d-data-header">Items</th>
              <th className="d-data-header">Placed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className={`d-data-row ${selected.has(o.id) ? 'ea-table-row-selected' : ''}`}>
                <td className="d-data-cell">
                  <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggle(o.id)} />
                </td>
                <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', fontSize: '0.8rem' }}>
                  <Link to={`/orders/${o.id}`} style={{ color: 'var(--d-text)', textDecoration: 'none', fontWeight: 500 }}>{o.number}</Link>
                </td>
                <td className="d-data-cell">{o.customerName}</td>
                <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>${o.total.toFixed(2)}</td>
                <td className="d-data-cell"><StatusBadge status={o.status} /></td>
                <td className="d-data-cell"><StatusBadge status={o.payment} /></td>
                <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', color: 'var(--d-text-muted)' }}>{o.items.length}</td>
                <td className="d-data-cell" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{o.placed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
