import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { StatusBadge } from '@/components/StatusBadge';
import { products } from '@/data/mock';

export function ProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id) ?? products[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--d-text-muted)', textDecoration: 'none', marginBottom: '0.5rem' }}>
          <ArrowLeft size={12} /> Back to products
        </Link>
        <PageHeader
          title={product.name}
          description={product.sku}
          actions={
            <>
              <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem', color: 'var(--d-error)' }}>
                <Trash2 size={14} /> Delete
              </button>
              <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }} onClick={() => navigate('/products')}>Cancel</button>
              <button className="ea-button-accent" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Save Changes</button>
            </>
          }
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--d-content-gap)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
          {/* Details */}
          <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Details</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Name</label>
                <input className="d-control" defaultValue={product.name} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Description</label>
                <textarea className="d-control" rows={4} defaultValue={`The ${product.name} delivers premium quality for everyday use. Ships within 24 hours from our Portland warehouse.`} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>SKU</label>
                  <input className="d-control" defaultValue={product.sku} style={{ fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Category</label>
                  <input className="d-control" defaultValue={product.category} />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Pricing & Inventory</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Price ($)</label>
                <input className="d-control" type="number" defaultValue={product.price} step="0.01" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Stock</label>
                <input className="d-control" type="number" defaultValue={product.stock} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Reorder at</label>
                <input className="d-control" type="number" defaultValue={product.reorderAt} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
          {/* Status */}
          <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Status</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Publishing</label>
                <select className="d-control" defaultValue={product.status}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Stock status</span>
                <StatusBadge status={product.stockStatus} />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Images</SectionLabel>
            <div style={{
              border: '1px dashed var(--d-border)',
              borderRadius: 'var(--d-radius)',
              padding: '2rem 1rem',
              textAlign: 'center',
              background: 'var(--d-surface-raised)',
            }}>
              <Upload size={20} style={{ color: 'var(--d-text-muted)', margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>Drop images here</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>PNG, JPG up to 5MB</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
