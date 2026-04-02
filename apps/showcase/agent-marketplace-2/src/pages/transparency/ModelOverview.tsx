import { css } from '@decantr/css';
import { TrendingUp, TrendingDown, Activity, Cpu, Clock, BarChart3 } from 'lucide-react';
import { NeuralFeedbackLoop } from '../../components/NeuralFeedbackLoop';

const stats = [
  { label: 'Total Inferences', value: '1.24M', trend: '+12.3%', up: true, icon: BarChart3 },
  { label: 'Avg Latency', value: '142ms', trend: '-8.1%', up: false, icon: Clock },
  { label: 'Active Models', value: '7', trend: '+2', up: true, icon: Cpu },
  { label: 'Error Rate', value: '0.03%', trend: '-0.01%', up: false, icon: Activity },
];

export function ModelOverview() {
  return (
    <div className={css('_flex _col _gap6 _p6')}>
      <h1 className={css('_textxl _fontsemi')}>Model Overview</h1>

      {/* Stats row */}
      <div className="d-section" data-density="compact">
        <h3
          className={css('_textsm _fontsemi _mb4') + ' d-label'}
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}
        >
          Key Metrics
        </h3>
        <div className={css('_grid _gc4 _gap3')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {stats.map(({ label, value, trend, up, icon: Icon }) => (
            <div key={label} className={css('_flex _col _gap2 _p4') + ' d-surface carbon-card'}>
              <div className={css('_flex _aic _jcsb')}>
                <span className={css('_textxs') + ' d-label'}>{label}</span>
                <Icon size={14} style={{ color: 'var(--d-text-muted)' }} />
              </div>
              <span className={css('_text2xl _fontbold') + ' mono-data'}>{value}</span>
              <div className={css('_flex _aic _gap1')}>
                {up
                  ? <TrendingUp size={12} style={{ color: 'var(--d-success)' }} />
                  : <TrendingDown size={12} style={{ color: 'var(--d-success)' }} />
                }
                <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-success)' }}>
                  {trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Neural feedback */}
      <div className="d-section" data-density="compact">
        <NeuralFeedbackLoop title="Feedback Summary" />
      </div>
    </div>
  );
}
