import { TrendingUp } from 'lucide-react';

const monthly = [4200, 5100, 4800, 6200, 7400, 6900, 8100, 9200, 8800, 9600, 10400, 8412];
const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function SellerAnalyticsPage() {
  const max = Math.max(...monthly);
  return (
    <div style={{ maxWidth: 1100 }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <div className="d-label" style={{ marginBottom: '0.5rem' }}>Insights</div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 600 }}>Analytics</h1>
      </header>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="nm-kpi"><span className="nm-kpi-label">Total earnings</span><span className="nm-kpi-value">$89,112</span><span className="nm-kpi-delta">+14.2% YoY</span></div>
        <div className="nm-kpi"><span className="nm-kpi-label">Bookings</span><span className="nm-kpi-value">241</span><span className="nm-kpi-delta">+18 vs last year</span></div>
        <div className="nm-kpi"><span className="nm-kpi-label">Avg nightly</span><span className="nm-kpi-value">$284</span><span className="nm-kpi-delta">+$12</span></div>
        <div className="nm-kpi"><span className="nm-kpi-label">Occupancy</span><span className="nm-kpi-value">78%</span><span className="nm-kpi-delta">+6%</span></div>
      </div>

      {/* Chart */}
      <div className="nm-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Earnings this year</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)' }}>Monthly gross earnings</p>
          </div>
          <span className="nm-badge" data-tone="success"><TrendingUp size={11} /> +14.2%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 200, paddingBottom: '0.5rem', borderBottom: '1px solid var(--d-border)' }}>
          {monthly.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', height: '100%' }}>
              <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{
                  width: '100%',
                  height: `${(v / max) * 100}%`,
                  background: i === monthly.length - 1 ? 'var(--d-primary)' : 'color-mix(in srgb, var(--d-primary) 25%, transparent)',
                  borderRadius: 'var(--d-radius-sm) var(--d-radius-sm) 0 0',
                  transition: 'height 0.4s ease',
                }} title={`$${v.toLocaleString()}`} />
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--d-text-muted)' }}>{labels[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trends */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
        <div className="nm-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.875rem' }}>Top performing listings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              ['Cedar A-Frame', '$14,820'],
              ['Brooklyn Loft', '$12,440'],
              ['Malibu Glass House', '$18,600'],
              ['Paris Studio', '$8,210'],
            ].map(([name, amt]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.5rem 0', borderBottom: '1px solid var(--d-border)' }}>
                <span>{name}</span>
                <span style={{ fontWeight: 600 }}>{amt}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="nm-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.875rem' }}>Booking sources</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              ['Search', 52],
              ['Direct link', 28],
              ['Featured', 14],
              ['Other', 6],
            ].map(([label, pct]) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 600 }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--d-surface-raised)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--d-primary)', borderRadius: '9999px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
