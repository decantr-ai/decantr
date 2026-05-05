import { css } from '@decantr/css';
import { Target, Calendar, TrendingDown } from 'lucide-react';
import { targets } from '@/data/mock';
import { ProgressRing } from '@/components/ProgressRing';
import { EmissionsChart } from '@/components/EmissionsChart';

const statusLabels: Record<string, { label: string; status: 'success' | 'warning' | 'error' }> = {
  'on-track': { label: 'On Track', status: 'success' },
  'at-risk': { label: 'At Risk', status: 'warning' },
  'behind': { label: 'Behind', status: 'error' },
};

export function TargetsPage() {
  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Reduction Targets</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Science-based targets and progress tracking</p>
      </div>

      {/* Progress Rings Overview */}
      <div className="d-surface earth-card">
        <div className={css('_flex _wrap _jcsa _gap6')} style={{ padding: '1.5rem 0' }}>
          {targets.map(t => (
            <ProgressRing
              key={t.id}
              value={t.current}
              max={t.baseline}
              size={140}
              label={t.label}
              status={t.status}
            />
          ))}
        </div>
      </div>

      {/* Target Detail Cards */}
      <div className={css('_grid _gc1 lg:_gc2 _gap4')}>
        {targets.map((t, i) => {
          const s = statusLabels[t.status];
          const reduced = t.baseline - t.current;
          const remaining = t.current - t.goal;
          return (
            <div key={t.id} className="d-surface earth-card entrance-fade" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={css('_flex _jcsb _aic')} style={{ marginBottom: '0.75rem' }}>
                <div className={css('_flex _aic _gap2')}>
                  <Target size={16} style={{ color: 'var(--d-primary)' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t.label}</h3>
                </div>
                <span className="d-annotation" data-status={s.status}>{s.label}</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>{t.description}</p>
              <div className={css('_grid _gc3 _gap4')} style={{ fontSize: '0.8125rem' }}>
                <div>
                  <div className="d-label" style={{ marginBottom: '0.25rem' }}>Baseline</div>
                  <span style={{ fontWeight: 600 }}>{t.baseline.toLocaleString()} {t.unit}</span>
                </div>
                <div>
                  <div className="d-label" style={{ marginBottom: '0.25rem' }}>Current</div>
                  <span style={{ fontWeight: 600 }}>{t.current.toLocaleString()} {t.unit}</span>
                </div>
                <div>
                  <div className="d-label" style={{ marginBottom: '0.25rem' }}>Goal ({t.year})</div>
                  <span style={{ fontWeight: 600 }}>{t.goal.toLocaleString()} {t.unit}</span>
                </div>
              </div>
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--d-bg)', borderRadius: 'var(--d-radius-sm)', fontSize: '0.8125rem' }}>
                <div className={css('_flex _jcsb')}>
                  <span className={css('_flex _aic _gap1')}><TrendingDown size={12} /> Reduced: <strong>{reduced.toLocaleString()} {t.unit}</strong></span>
                  <span className={css('_flex _aic _gap1')}><Calendar size={12} /> Remaining: <strong>{remaining.toLocaleString()} {t.unit}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="d-surface earth-card">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>Emissions Trend</div>
        <EmissionsChart />
      </div>
    </div>
  );
}
