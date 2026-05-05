import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, DollarSign, Clock, BarChart3, Utensils } from 'lucide-react';
import { dailyKpis, hourlySales, formatCurrency } from '../../data/mock';
import { KpiCard } from '../../components/KpiCard';
import { MiniBarChart } from '../../components/MiniChart';

export function DashboardPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className={css('_flex _aic _jcsb')}>
        <div>
          <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Daily Dashboard</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>April 6, 2026 — Dinner Service</p>
        </div>
        <Link to="/ops/reports" className="d-interactive" style={{ textDecoration: 'none', fontSize: '0.8125rem' }}>
          <BarChart3 size={14} /> Reports
        </Link>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.75rem' }}>
        <KpiCard label="Revenue" value={formatCurrency(dailyKpis.revenue)} sub={`Goal: ${formatCurrency(dailyKpis.revenueGoal)}`} icon={DollarSign} trend="up" />
        <KpiCard label="Covers" value={`${dailyKpis.covers} / ${dailyKpis.coversGoal}`} icon={Users} trend="up" sub={`${Math.round((dailyKpis.covers / dailyKpis.coversGoal) * 100)}% of goal`} />
        <KpiCard label="Avg Check" value={formatCurrency(dailyKpis.avgCheck)} icon={Utensils} />
        <KpiCard label="Table Turns" value={String(dailyKpis.tablesTurned)} icon={TrendingUp} />
        <KpiCard label="Wait Time" value={`${dailyKpis.waitTime} min`} icon={Clock} trend={dailyKpis.waitTime > 15 ? 'down' : 'up'} />
        <KpiCard label="Satisfaction" value={`${dailyKpis.satisfaction} / 5`} icon={TrendingUp} trend="up" />
      </div>

      {/* Hourly sales chart */}
      <div className="bistro-warm-card" style={{ cursor: 'default' }}>
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.75rem' }}>
          <span className="bistro-handwritten" style={{ fontSize: '1rem' }}>Hourly Sales</span>
          <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Today</span>
        </div>
        <MiniBarChart data={hourlySales.map(h => ({ label: h.hour.replace(' ', ''), value: h.sales }))} height={140} />
      </div>

      {/* Cost breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="bistro-warm-card" style={{ cursor: 'default' }}>
          <span className="d-label">Food Cost</span>
          <div className={css('_flex _aic _jcsb')} style={{ marginTop: '0.5rem' }}>
            <span className="bistro-handwritten" style={{ fontSize: '1.5rem', color: dailyKpis.foodCostPct > 33 ? 'var(--d-warning)' : 'var(--d-success)' }}>
              {dailyKpis.foodCostPct}%
            </span>
            <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Target: 30%</span>
          </div>
          <div className="depletion-bar" style={{ marginTop: '0.5rem', height: 10 }}>
            <div className="depletion-bar-fill" style={{ width: `${dailyKpis.foodCostPct}%`, background: dailyKpis.foodCostPct > 33 ? 'var(--d-warning)' : 'var(--d-success)' }} />
          </div>
        </div>
        <div className="bistro-warm-card" style={{ cursor: 'default' }}>
          <span className="d-label">Labor Cost</span>
          <div className={css('_flex _aic _jcsb')} style={{ marginTop: '0.5rem' }}>
            <span className="bistro-handwritten" style={{ fontSize: '1.5rem', color: dailyKpis.laborCostPct > 30 ? 'var(--d-warning)' : 'var(--d-success)' }}>
              {dailyKpis.laborCostPct}%
            </span>
            <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Target: 28%</span>
          </div>
          <div className="depletion-bar" style={{ marginTop: '0.5rem', height: 10 }}>
            <div className="depletion-bar-fill" style={{ width: `${dailyKpis.laborCostPct}%`, background: dailyKpis.laborCostPct > 30 ? 'var(--d-warning)' : 'var(--d-success)' }} />
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="bistro-warm-card" style={{ cursor: 'default' }}>
        <span className="d-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Today&apos;s Activity</span>
        <div className={css('_flex _col _gap2')}>
          {[
            { time: '6:45 PM', text: 'Table 13 bar guest seated', icon: Users },
            { time: '6:30 PM', text: 'Reservation: Garcia party arrived', icon: Clock },
            { time: '6:18 PM', text: 'Rush ticket fired — Table 8', icon: TrendingUp },
            { time: '5:45 PM', text: 'Low stock alert: Branzino (40%)', icon: BarChart3 },
            { time: '5:30 PM', text: 'Thompson party of 7 seated at T8', icon: Users },
          ].map((a, i) => (
            <div key={i} className={css('_flex _aic _gap3')} style={{ padding: '0.25rem 0', borderBottom: i < 4 ? '1px solid var(--d-border)' : undefined }}>
              <a.icon size={14} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
              <span className={css('_textsm')} style={{ flex: 1 }}>{a.text}</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', whiteSpace: 'nowrap' }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
