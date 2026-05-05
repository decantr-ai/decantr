import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { KpiGrid } from '@/components/KpiGrid';
import { Chart } from '@/components/Chart';
import { ActivityFeed } from '@/components/ActivityFeed';
import { StatusBadge } from '@/components/StatusBadge';
import { dashboardKpis, dashboardCharts, activityEvents, products, orders } from '@/data/mock';

export function DashboardPage() {
  const lowStock = products.filter(p => p.stockStatus === 'low-stock' || p.stockStatus === 'out-of-stock').slice(0, 4);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Store Dashboard"
        description="Operations snapshot for Brightgoods."
        actions={
          <>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Export</button>
            <Link to="/dashboard/actions" className="ea-button-accent" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
              Quick Actions <ArrowRight size={14} />
            </Link>
          </>
        }
      />

      <KpiGrid items={dashboardKpis} />

      <div>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>Trends</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--d-content-gap)' }}>
          {dashboardCharts.map(chart => (
            <div key={chart.title} className="ea-card" style={{ padding: 'var(--d-surface-p)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{chart.title}</h3>
                <span className="d-annotation">Last 30 days</span>
              </div>
              <Chart chart={chart} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--d-content-gap)' }}>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <SectionLabel>Needs Attention</SectionLabel>
            <Link to="/orders" style={{ fontSize: '0.75rem', color: 'var(--d-accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Order</th>
                <th className="d-data-header">Customer</th>
                <th className="d-data-header">Total</th>
                <th className="d-data-header">Status</th>
                <th className="d-data-header">Placed</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map(o => (
                <tr key={o.id} className="d-data-row">
                  <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, ui-monospace, monospace)', fontSize: '0.8rem' }}>
                    <Link to={`/orders/${o.id}`} style={{ color: 'var(--d-text)', textDecoration: 'none' }}>{o.number}</Link>
                  </td>
                  <td className="d-data-cell">{o.customerName}</td>
                  <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>${o.total.toFixed(2)}</td>
                  <td className="d-data-cell"><StatusBadge status={o.status} /></td>
                  <td className="d-data-cell" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{o.placed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '0.75rem' }}>Recent Activity</SectionLabel>
          <ActivityFeed events={activityEvents.slice(0, 6)} />
        </div>
      </div>

      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={14} style={{ color: 'var(--d-warning)' }} />
            <SectionLabel>Inventory Alerts</SectionLabel>
          </div>
          <Link to="/inventory" style={{ fontSize: '0.75rem', color: 'var(--d-accent)', textDecoration: 'none' }}>View inventory →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {lowStock.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-sm)' }}>
              <div className="ea-product-thumb">{p.image}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>{p.stock} in stock</div>
              </div>
              <StatusBadge status={p.stockStatus} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
