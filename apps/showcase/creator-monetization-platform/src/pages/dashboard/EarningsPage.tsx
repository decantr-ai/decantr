import { css } from '@decantr/css';
import { Download } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { revenueSeries, tiers } from '../../data/mock';

export function EarningsPage() {
  const total = tiers.reduce((acc, t) => acc + t.price * t.subscribers, 0);
  const max = Math.max(...revenueSeries.map((r) => r.amount));

  return (
    <div>
      <PageHeader
        title="Earnings"
        subtitle="How your revenue breaks down by tier and over time."
        actions={
          <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}>
            <Download size={14} /> Export CSV
          </button>
        }
      />

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Gross (MTD)', value: `$${(total / 1).toLocaleString()}` },
          { label: 'Platform fee (8%)', value: `-$${(total * 0.08).toFixed(0)}` },
          { label: 'Processing', value: `-$${(total * 0.029 + 0.3).toFixed(0)}` },
          { label: 'Net payout', value: `$${(total * 0.891 - 0.3).toFixed(0)}`, highlight: true },
        ].map((s) => (
          <div key={s.label} className={s.highlight ? 'studio-card-premium' : 'studio-card'} style={{ padding: s.highlight ? 0 : '1.25rem' }}>
            <div className={s.highlight ? 'inner' : ''} style={s.highlight ? { padding: '1.25rem' } : {}}>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif', marginBottom: '0.375rem' }}>{s.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="studio-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 className="serif-display" style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Revenue over time</h3>
        <svg width="100%" height="200" viewBox="0 0 600 200" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
            </linearGradient>
          </defs>
          {(() => {
            const pts = revenueSeries.map((r, i) => ({ x: (i / (revenueSeries.length - 1)) * 560 + 20, y: 180 - (r.amount / max) * 140 }));
            const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            const area = `${line} L ${pts[pts.length - 1].x} 180 L ${pts[0].x} 180 Z`;
            return (
              <>
                <path d={area} fill="url(#area)" />
                <path d={line} stroke="#F97316" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                {pts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="5" fill="#F97316" stroke="#fff" strokeWidth="2" />
                ))}
                {revenueSeries.map((r, i) => (
                  <text key={r.month} x={(i / (revenueSeries.length - 1)) * 560 + 20} y={198} textAnchor="middle" fontSize="11" fill="var(--d-text-muted)" fontFamily="system-ui">{r.month}</text>
                ))}
              </>
            );
          })()}
        </svg>
      </div>

      {/* Tier breakdown */}
      <div className="studio-card" style={{ padding: '1.5rem' }}>
        <h3 className="serif-display" style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Revenue by tier</h3>
        <div className={css('_flex _col _gap3')}>
          {tiers.filter((t) => t.price > 0).map((t) => {
            const rev = t.price * t.subscribers;
            const pct = (rev / total) * 100;
            return (
              <div key={t.id} className={css('_flex _col _gap2')}>
                <div className={css('_flex _aic _jcsb')}>
                  <div className={css('_flex _aic _gap2')}>
                    <span className="studio-badge-tier" data-tier={t.color}>{t.name}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>{t.subscribers} × ${t.price}</span>
                  </div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>${rev.toLocaleString()}</div>
                </div>
                <div style={{ height: 8, background: 'var(--d-surface-raised)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: t.color === 'patron' ? 'linear-gradient(90deg, #F9A8D4, #F472B6)' : t.color === 'super' ? 'linear-gradient(90deg, #DDD6FE, #C4B5FD)' : 'linear-gradient(90deg, #FED7AA, #FDBA74)', transition: 'width 600ms ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
