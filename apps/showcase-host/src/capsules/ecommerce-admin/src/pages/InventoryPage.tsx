import { useState } from 'react';
import { RefreshCcw, Download } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { StatusBadge } from '@/components/StatusBadge';
import { products, type StockStatus } from '@/data/mock';

const columns: { key: StockStatus; label: string; color: string }[] = [
  { key: 'out-of-stock', label: 'Out of Stock', color: 'var(--d-error)' },
  { key: 'low-stock', label: 'Low Stock', color: 'var(--d-warning)' },
  { key: 'in-stock', label: 'In Stock', color: 'var(--d-success)' },
];

export function InventoryPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stocks, setStocks] = useState(() => Object.fromEntries(products.map(p => [p.id, p.stock])));

  const grouped = columns.map(col => ({
    ...col,
    items: products.filter(p => p.stockStatus === col.key),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Inventory"
        description="Track stock levels across every SKU."
        actions={
          <>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
              <Download size={14} /> Export
            </button>
            <button className="ea-button-accent" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
              <RefreshCcw size={14} /> Restock
            </button>
          </>
        }
      />

      {/* Kanban board */}
      <div>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>Stock Status Board</SectionLabel>
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
          {grouped.map(col => (
            <div key={col.key} className="ea-kanban-column">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0.25rem 0.5rem', borderBottom: '1px solid var(--d-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{col.label}</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>{col.items.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {col.items.map(p => (
                  <div key={p.id} className="ea-kanban-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <div className="ea-product-thumb" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>{p.image}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>{p.sku}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
                      <span>Stock: <strong style={{ color: 'var(--d-text)', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>{p.stock}</strong></span>
                      <span>Reorder ≤ {p.reorderAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inline stock table */}
      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}>
          <SectionLabel>All SKUs (inline edit)</SectionLabel>
        </div>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Product</th>
              <th className="d-data-header">SKU</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>On Hand</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Reorder At</th>
              <th className="d-data-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="d-data-row">
                <td className="d-data-cell">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div className="ea-product-thumb" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>{p.image}</div>
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                  </div>
                </td>
                <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{p.sku}</td>
                <td className="d-data-cell" style={{ textAlign: 'right' }}>
                  {editingId === p.id ? (
                    <input
                      className="ea-inline-input"
                      type="number"
                      value={stocks[p.id]}
                      autoFocus
                      onBlur={() => setEditingId(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setEditingId(null); }}
                      onChange={e => setStocks({ ...stocks, [p.id]: Number(e.target.value) })}
                      style={{ textAlign: 'right', maxWidth: 100, marginLeft: 'auto', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingId(p.id)}
                      className="ea-inline-input"
                      style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', cursor: 'pointer', background: 'transparent' }}
                    >
                      {stocks[p.id]}
                    </button>
                  )}
                </td>
                <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', color: 'var(--d-text-muted)' }}>{p.reorderAt}</td>
                <td className="d-data-cell"><StatusBadge status={p.stockStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
