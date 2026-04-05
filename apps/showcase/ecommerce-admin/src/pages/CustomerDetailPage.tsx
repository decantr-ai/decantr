import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Tag } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { StatusBadge } from '@/components/StatusBadge';
import { customers, orders } from '@/data/mock';

export function CustomerDetailPage() {
  const { id } = useParams();
  const customer = customers.find(c => c.id === id) ?? customers[0];
  const customerOrders = orders.filter(o => o.customerId === customer.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <Link to="/customers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--d-text-muted)', textDecoration: 'none', marginBottom: '0.5rem' }}>
          <ArrowLeft size={12} /> Back to customers
        </Link>
      </div>

      {/* Header card */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div className="ea-avatar" style={{ width: 56, height: 56, fontSize: '1.125rem' }}>{customer.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.375rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{customer.name}</h2>
              <span className="d-annotation" data-status={customer.status === 'vip' ? 'success' : 'info'} style={{ textTransform: 'uppercase' }}>{customer.status}</span>
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--d-text-muted)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={12} /> {customer.email}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={12} /> {customer.phone}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={12} /> {customer.city}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
              {customer.tags.map(t => (
                <span key={t} className="d-annotation" style={{ fontSize: '0.65rem' }}><Tag size={10} />{t}</span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Lifetime Value</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', color: 'var(--d-accent)' }}>${customer.ltv.toFixed(2)}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{customer.orders} orders</div>
          </div>
        </div>
      </div>

      <PageHeader title="" actions={
        <>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Add Tag</button>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Send Email</button>
        </>
      } />

      {/* Purchase history */}
      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}>
          <SectionLabel>Purchase History ({customerOrders.length})</SectionLabel>
        </div>
        {customerOrders.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>
            No orders yet. First order will appear here.
          </div>
        ) : (
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Order</th>
                <th className="d-data-header" style={{ textAlign: 'right' }}>Total</th>
                <th className="d-data-header">Items</th>
                <th className="d-data-header">Status</th>
                <th className="d-data-header">Placed</th>
              </tr>
            </thead>
            <tbody>
              {customerOrders.map(o => (
                <tr key={o.id} className="d-data-row">
                  <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', fontSize: '0.8rem' }}>
                    <Link to={`/orders/${o.id}`} style={{ color: 'var(--d-text)', textDecoration: 'none', fontWeight: 500 }}>{o.number}</Link>
                  </td>
                  <td className="d-data-cell" style={{ textAlign: 'right', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>${o.total.toFixed(2)}</td>
                  <td className="d-data-cell" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{o.items.map(i => `${i.qty}× ${i.name}`).join(', ')}</td>
                  <td className="d-data-cell"><StatusBadge status={o.status} /></td>
                  <td className="d-data-cell" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{o.placed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
