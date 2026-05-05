import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { DollarSign, Clock, Users, TrendingUp } from 'lucide-react';
import { servers, formatCurrency } from '../../data/mock';
import { KpiCard } from '../../components/KpiCard';

export function ShiftPage() {
  const totalSales = servers.reduce((s, sv) => s + sv.sales, 0);
  const totalTips = servers.reduce((s, sv) => s + sv.tips, 0);
  const totalCovers = servers.reduce((s, sv) => s + sv.covers, 0);

  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className={css('_flex _aic _jcsb')}>
        <div>
          <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>My Shift</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Dinner service — April 6, 2026</p>
        </div>
        <Link to="/shift/tips" className="d-interactive" style={{ textDecoration: 'none', fontSize: '0.8125rem' }}>
          <DollarSign size={14} /> Tip Pool
        </Link>
      </div>

      {/* Shift KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <KpiCard label="Team Sales" value={formatCurrency(totalSales)} icon={TrendingUp} trend="up" sub="+18% vs last week" />
        <KpiCard label="Total Tips" value={formatCurrency(totalTips)} icon={DollarSign} trend="up" />
        <KpiCard label="Covers" value={String(totalCovers)} icon={Users} />
        <KpiCard label="Servers On" value={`${servers.filter(s => s.sales > 0).length} / ${servers.length}`} icon={Clock} />
      </div>

      {/* Server activity */}
      <div>
        <span className="d-label" style={{ marginBottom: '0.5rem', display: 'block', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>Team Activity</span>
        <div className={css('_flex _col _gap2')}>
          {servers.map(sv => (
            <div key={sv.id} className="bistro-warm-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: 'var(--d-surface-raised)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.75rem', color: 'var(--d-primary)', flexShrink: 0,
                border: '2px solid var(--d-border)',
              }}>{sv.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={css('_flex _aic _jcsb')}>
                  <span className={css('_fontmedium')} style={{ fontSize: '0.875rem' }}>{sv.name}</span>
                  <span className="d-annotation">{sv.role}</span>
                </div>
                <div className={css('_flex _aic _gap4')} style={{ marginTop: '0.25rem', fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
                  <span>{sv.activeTables} tables</span>
                  <span>{sv.covers} covers</span>
                  <span>{formatCurrency(sv.sales)} sales</span>
                  <span style={{ color: 'var(--d-success)', fontWeight: 500 }}>{formatCurrency(sv.tips)} tips</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
