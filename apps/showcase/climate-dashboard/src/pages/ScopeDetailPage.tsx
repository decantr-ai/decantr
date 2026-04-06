import { useParams, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { TrendingDown, TrendingUp, Minus, ArrowLeft } from 'lucide-react';
import { scopeBreakdowns } from '@/data/mock';
import { EmissionsChart } from '@/components/EmissionsChart';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

function BarFill({ pct, color }: { pct: number; color: string }) {
  const animated = useAnimatedValue(pct, 800);
  return (
    <div style={{ height: 8, borderRadius: 4, background: 'var(--d-border)', flex: 1 }}>
      <div style={{ height: '100%', borderRadius: 4, background: color, width: `${animated}%`, transition: 'width 0.3s ease' }} />
    </div>
  );
}

export function ScopeDetailPage() {
  const { id } = useParams();
  const scope = scopeBreakdowns[id || '1'];

  if (!scope) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--d-text-muted)' }}>Scope not found</p>
        <Link to="/emissions" className="d-interactive" style={{ marginTop: '1rem', textDecoration: 'none' }}>Back to overview</Link>
      </div>
    );
  }

  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <Link to="/emissions" className={css('_flex _aic _gap1')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none', marginBottom: '0.5rem' }}>
          <ArrowLeft size={14} /> Back to overview
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{scope.label}</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>{scope.description}</p>
      </div>

      <div className="d-surface earth-card">
        <div className={css('_flex _aic _gap3')} style={{ marginBottom: '1.5rem' }}>
          <div>
            <div className="d-label" style={{ marginBottom: '0.25rem' }}>Total</div>
            <span style={{ fontSize: '2rem', fontWeight: 700 }}>{scope.total.toLocaleString()}</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginLeft: '0.5rem' }}>tCO2e</span>
          </div>
        </div>

        <div className={css('_flex _col _gap4')}>
          {scope.categories.map((cat, i) => (
            <div key={i} style={{ animationDelay: `${i * 80}ms` }} className="entrance-fade">
              <div className={css('_flex _jcsb _aic')} style={{ marginBottom: '0.375rem' }}>
                <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{cat.name}</span>
                <div className={css('_flex _aic _gap3')}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{cat.emissions.toLocaleString()} tCO2e</span>
                  <div className={css('_flex _aic _gap1')}>
                    {cat.trend === 'down' ? <TrendingDown size={12} style={{ color: 'var(--d-success)' }} /> :
                     cat.trend === 'up' ? <TrendingUp size={12} style={{ color: 'var(--d-error)' }} /> :
                     <Minus size={12} style={{ color: 'var(--d-text-muted)' }} />}
                    <span className="d-annotation" data-status={cat.trend === 'down' ? 'success' : cat.trend === 'up' ? 'error' : 'info'}>
                      {cat.change}
                    </span>
                  </div>
                </div>
              </div>
              <BarFill pct={cat.percentage} color="var(--d-primary)" />
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>{cat.percentage}% of scope</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scope navigation */}
      <div className={css('_flex _gap3')}>
        {['1', '2', '3'].map(s => (
          <Link
            key={s}
            to={`/emissions/scope/${s}`}
            className="d-interactive"
            data-variant={s === id ? 'primary' : undefined}
            style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}
          >
            Scope {s}
          </Link>
        ))}
      </div>

      {/* Monthly Chart */}
      <div className="d-surface earth-card">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>Monthly Trend</div>
        <EmissionsChart />
      </div>
    </div>
  );
}
