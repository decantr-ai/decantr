import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Download, Trash2, Archive } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { products as allProducts } from '@/data/mock';

export function ProductsPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.sku.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  const allSelected = filtered.length > 0 && filtered.every(p => selected.has(p.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(p => p.id)));
    }
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="Products"
        description={`${allProducts.length} SKUs in catalog`}
        actions={
          <>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
              <Download size={14} /> Export
            </button>
            <button className="ea-button-accent" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
              <Plus size={14} /> Add Product
            </button>
          </>
        }
      />

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input
            className="d-control"
            placeholder="Search products, SKU, category..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
          />
        </div>
        {selected.size > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.25rem 0.5rem', background: 'color-mix(in srgb, var(--d-accent) 10%, transparent)', borderRadius: 'var(--d-radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--d-accent)', fontWeight: 500 }}>{selected.size} selected</span>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
              <Archive size={12} /> Archive
            </button>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--d-error)' }}>
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header" style={{ width: 40 }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="d-data-header">Product</th>
              <th className="d-data-header">SKU</th>
              <th className="d-data-header">Category</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Price</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Stock</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Sales (30d)</th>
              <th className="d-data-header">Status</th>
              <th className="d-data-header">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr
                key={p.id}
                className={`d-data-row ${selected.has(p.id) ? 'ea-table-row-selected' : ''}`}
              >
                <td className="d-data-cell">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} />
                </td>
                <td className="d-data-cell">
                  <Link to={`/products/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', color: 'var(--d-text)' }}>
                    <div className="ea-product-thumb">{p.image}</div>
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                  </Link>
                </td>
                <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{p.sku}</td>
                <td className="d-data-cell"><span className="d-annotation">{p.category}</span></td>
                <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>${p.price.toFixed(2)}</td>
                <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>{p.stock}</td>
                <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>{p.sales30d}</td>
                <td className="d-data-cell"><StatusBadge status={p.status === 'active' ? p.stockStatus : p.status} /></td>
                <td className="d-data-cell" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{p.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
