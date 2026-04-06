import { css } from '@decantr/css';
import { Heart, Users, TrendingUp, Award } from 'lucide-react';
import { loyaltyTiers, customers, formatCurrency } from '../../data/mock';
import { KpiCard } from '../../components/KpiCard';

export function LoyaltyProgramPage() {
  const totalMembers = loyaltyTiers.reduce((s, t) => s + t.members, 0);
  const avgSpend = customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length;

  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div>
        <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Loyalty Program</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Tiers, rewards, and member analytics</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <KpiCard label="Total Members" value={String(totalMembers)} icon={Users} trend="up" sub="+12 this month" />
        <KpiCard label="Avg Spend" value={formatCurrency(avgSpend)} icon={TrendingUp} />
        <KpiCard label="Retention" value="78%" icon={Heart} trend="up" sub="+4% vs last month" />
        <KpiCard label="Active Rewards" value="34" icon={Award} />
      </div>

      {/* Tier cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        {loyaltyTiers.map(t => (
          <div key={t.name} className="bistro-warm-card" style={{ cursor: 'default', borderTop: `3px solid ${t.color}` }}>
            <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.75rem' }}>
              <div className={css('_flex _aic _gap2')}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: t.color }} />
                <span className="bistro-handwritten" style={{ fontSize: '1.125rem' }}>{t.name}</span>
              </div>
              <span className="d-annotation">{t.members} members</span>
            </div>
            <div className={css('_flex _col _gap2')} style={{ fontSize: '0.8125rem' }}>
              <div className={css('_flex _aic _jcsb')}>
                <span style={{ color: 'var(--d-text-muted)' }}>Minimum Spend</span>
                <span className={css('_fontmedium')}>{formatCurrency(t.minSpent)}</span>
              </div>
              <div className={css('_flex _aic _jcsb')}>
                <span style={{ color: 'var(--d-text-muted)' }}>Discount</span>
                <span className={css('_fontmedium')}>{t.discount}%</span>
              </div>
              <hr className="bistro-divider" style={{ margin: '0.5rem 0' }} />
              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.5 }}>{t.perks}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Member distribution bar */}
      <div className="bistro-warm-card" style={{ cursor: 'default' }}>
        <span className="d-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Member Distribution</span>
        <div className={css('_flex')} style={{ height: 32, borderRadius: 'var(--d-radius-full)', overflow: 'hidden' }}>
          {loyaltyTiers.map(t => {
            const pct = (t.members / totalMembers) * 100;
            return (
              <div key={t.name} title={`${t.name}: ${t.members} (${Math.round(pct)}%)`}
                style={{ width: `${pct}%`, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {pct > 12 && <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#fff' }}>{Math.round(pct)}%</span>}
              </div>
            );
          })}
        </div>
        <div className={css('_flex _aic _gap4')} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
          {loyaltyTiers.map(t => (
            <div key={t.name} className={css('_flex _aic _gap1')}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color }} />
              <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
