import { css } from '@decantr/css';
import { Plus } from 'lucide-react';
import { purchaseOrders, formatCurrency } from '../../data/mock';

const statusColor = (s: string) =>
  s === 'received' ? 'success' : s === 'submitted' ? 'info' : s === 'partial' ? 'warning' : 'error';

export function OrdersPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className={css('_flex _aic _jcsb')}>
        <div>
          <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Purchase Orders</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Track orders to suppliers</p>
        </div>
        <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.8125rem' }}>
          <Plus size={14} /> New Order
        </button>
      </div>

      {/* PO board — kanban style */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {(['draft', 'submitted', 'partial', 'received'] as const).map(status => (
          <div key={status}>
            <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.5rem' }}>
              <span className="d-label" style={{ textTransform: 'capitalize' }}>{status}</span>
              <span className="d-annotation" data-status={statusColor(status)}>
                {purchaseOrders.filter(o => o.status === status).length}
              </span>
            </div>
            <div className={css('_flex _col _gap2')}>
              {purchaseOrders.filter(o => o.status === status).map(po => (
                <div key={po.id} className="bistro-warm-card" style={{ padding: '0.75rem' }}>
                  <div className={css('_fontmedium')} style={{ fontSize: '0.875rem' }}>{po.supplier}</div>
                  <div className={css('_flex _aic _jcsb')} style={{ marginTop: '0.375rem' }}>
                    <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{po.items} items</span>
                    <span className={css('_textsm _fontmedium')}>{formatCurrency(po.total)}</span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>{po.date}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* PO list table */}
      <table className="d-data">
        <thead>
          <tr>
            <th className="d-data-header">PO #</th>
            <th className="d-data-header">Supplier</th>
            <th className="d-data-header">Items</th>
            <th className="d-data-header">Total</th>
            <th className="d-data-header">Status</th>
            <th className="d-data-header">Date</th>
          </tr>
        </thead>
        <tbody>
          {purchaseOrders.map(po => (
            <tr key={po.id} className="d-data-row">
              <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, monospace)', fontWeight: 500 }}>{po.id.toUpperCase()}</td>
              <td className="d-data-cell" style={{ fontWeight: 500 }}>{po.supplier}</td>
              <td className="d-data-cell">{po.items}</td>
              <td className="d-data-cell">{formatCurrency(po.total)}</td>
              <td className="d-data-cell">
                <span className="d-annotation" data-status={statusColor(po.status)}>{po.status}</span>
              </td>
              <td className="d-data-cell" style={{ color: 'var(--d-text-muted)' }}>{po.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
