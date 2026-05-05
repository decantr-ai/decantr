import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { TrendingDown, TrendingUp, ArrowRight } from 'lucide-react';
import { emissionsKpis, targets } from '@/data/mock';
import { SankeyDiagram } from '@/components/SankeyDiagram';
import { ProgressRing } from '@/components/ProgressRing';

export function EmissionsOverviewPage() {
  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Emissions Overview</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>FY 2025 carbon accounting summary across all scopes</p>
      </div>

      {/* KPI Grid */}
      <div className={css('_grid _gc2 lg:_gc3 _gap4')}>
        {emissionsKpis.map((kpi, i) => (
          <div key={i} className="d-surface earth-card" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>{kpi.label}</div>
            <div className={css('_flex _aic _gap2')}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{kpi.value}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{kpi.unit}</span>
            </div>
            <div className={css('_flex _aic _gap1')} style={{ marginTop: '0.375rem' }}>
              {kpi.trend === 'down' ? (
                <TrendingDown size={14} style={{ color: 'var(--d-success)' }} />
              ) : (
                <TrendingUp size={14} style={{ color: 'var(--d-warning)' }} />
              )}
              <span className="d-annotation" data-status={kpi.trend === 'down' ? 'success' : 'warning'}>
                {kpi.change} YoY
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sankey Diagram */}
      <div className="d-surface earth-card">
        <div className={css('_flex _jcsb _aic')} style={{ marginBottom: '1rem' }}>
          <div>
            <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.25rem' }}>Emissions Flow</div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Source to Scope Sankey</h2>
          </div>
          <div className={css('_flex _gap2')}>
            {[1, 2, 3].map(s => (
              <Link key={s} to={`/emissions/scope/${s}`} className="d-interactive" data-variant="ghost" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', textDecoration: 'none' }}>
                Scope {s} <ArrowRight size={12} />
              </Link>
            ))}
          </div>
        </div>
        <SankeyDiagram />
      </div>

      {/* Target Progress Rings */}
      <div className="d-surface earth-card">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>Reduction Targets</div>
        <div className={css('_flex _wrap _jcsa _gap6')} style={{ padding: '1rem 0' }}>
          {targets.map(t => (
            <Link key={t.id} to="/emissions/targets" style={{ textDecoration: 'none', color: 'inherit' }}>
              <ProgressRing
                value={t.current}
                max={t.baseline}
                label={t.label}
                status={t.status}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
