import { css } from '@decantr/css';
import { Activity, Cpu, Gauge, TrendingUp } from 'lucide-react';

interface MetricCard {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: typeof Activity;
}

const metrics: MetricCard[] = [
  { label: 'Confidence', value: '94.2%', trend: '+2.1%', trendUp: true, icon: Gauge },
  { label: 'Token Rate', value: '1,247/s', trend: '+12%', trendUp: true, icon: Activity },
  { label: 'Processing', value: 'Active', trend: 'Stage 3/5', trendUp: true, icon: Cpu },
  { label: 'Throughput', value: '89.7%', trend: '-0.3%', trendUp: false, icon: TrendingUp },
];

export function NeuralFeedbackLoop({ title = 'Neural Feedback' }: { title?: string }) {
  return (
    <div className={css('_flex _col _gap4')}>
      <h3
        className={css('_textsm _fontsemi') + ' d-label'}
        style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}
      >
        {title}
      </h3>

      {/* Pulse visualization */}
      <div className={css('_flex _aic _jcc _py6 _rel')} role="status" aria-label="Neural feedback visualization">
        <div
          className="neon-glow"
          style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            border: '2px solid var(--d-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Inner ring */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '1px solid var(--d-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            <span className={css('_text2xl _fontbold') + ' mono-data neon-text-glow'} style={{ color: 'var(--d-accent)' }}>
              94.2%
            </span>
            <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
              CONFIDENCE
            </span>
          </div>

          {/* Orbiting dots */}
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--d-accent)',
                top: `${50 + 45 * Math.sin((i * Math.PI) / 2)}%`,
                left: `${50 + 45 * Math.cos((i * Math.PI) / 2)}%`,
                transform: 'translate(-50%, -50%)',
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className={css('_grid _gc2 _gap3')}>
        {metrics.map(({ label, value, trend, trendUp, icon: Icon }) => (
          <div key={label} className={css('_flex _col _gap1 _p3') + ' d-surface carbon-card'}>
            <div className={css('_flex _aic _jcsb')}>
              <span className={css('_textxs') + ' d-label'}>{label}</span>
              <Icon size={14} style={{ color: 'var(--d-text-muted)' }} />
            </div>
            <span className={css('_textlg _fontbold') + ' mono-data'}>{value}</span>
            <span
              className={css('_textxs') + ' mono-data'}
              style={{ color: trendUp ? 'var(--d-success)' : 'var(--d-error)' }}
            >
              {trend}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
