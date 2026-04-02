import { css } from '@decantr/css';
import { Target, TrendingUp, BarChart3, Percent } from 'lucide-react';

interface IntentVector {
  label: string;
  confidence: number;
  category: string;
}

const intents: IntentVector[] = [
  { label: 'Data Retrieval', confidence: 92, category: 'action' },
  { label: 'Analysis Request', confidence: 78, category: 'reasoning' },
  { label: 'Configuration Update', confidence: 65, category: 'admin' },
  { label: 'Anomaly Report', confidence: 54, category: 'alert' },
  { label: 'Scaling Decision', confidence: 41, category: 'orchestration' },
  { label: 'Health Check', confidence: 33, category: 'monitoring' },
];

const detailStats = [
  { label: 'Mean Confidence', value: '72.4%', icon: Percent },
  { label: 'Std Deviation', value: '8.3%', icon: BarChart3 },
  { label: 'P95 Latency', value: '234ms', icon: TrendingUp },
  { label: 'Inference Count', value: '4,891', icon: Target },
];

export function ConfidenceExplorer() {
  return (
    <div className={css('_flex _col _gap6 _p6')}>
      <h1 className={css('_textxl _fontsemi')}>Confidence Explorer</h1>

      {/* Intent radar visualization */}
      <div className="d-section" data-density="compact">
        <h3
          className={css('_textsm _fontsemi _mb4') + ' d-label'}
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}
        >
          Confidence Distribution
        </h3>

        <div className={css('_flex _gap6')} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Radar visual */}
          <div
            className={css('_flex _aic _jcc _rel') + ' d-surface carbon-card'}
            style={{ width: '280px', height: '280px', borderRadius: '50%', flexShrink: 0 }}
            role="img"
            aria-label="Intent confidence radar showing 6 categories"
          >
            {/* Concentric rings */}
            {[100, 75, 50, 25].map(ring => (
              <div
                key={ring}
                style={{
                  position: 'absolute',
                  width: `${ring * 2.4}px`,
                  height: `${ring * 2.4}px`,
                  borderRadius: '50%',
                  border: '1px solid var(--d-border)',
                  opacity: 0.3,
                }}
              />
            ))}

            {/* Intent vectors */}
            {intents.map((intent, i) => {
              const angle = (i * 60 - 90) * (Math.PI / 180);
              const radius = (intent.confidence / 100) * 120;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              return (
                <div
                  key={intent.label}
                  style={{
                    position: 'absolute',
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div
                    className="neon-glow"
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'var(--d-accent)',
                    }}
                    title={`${intent.label}: ${intent.confidence}%`}
                  />
                </div>
              );
            })}

            {/* Center label */}
            <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)', zIndex: 1 }}>
              RADAR
            </span>
          </div>

          {/* Intent list */}
          <div className={css('_flex _col _gap2 _flex1')} style={{ minWidth: '280px' }}>
            {intents.map(intent => (
              <div
                key={intent.label}
                className={css('_flex _aic _gap3 _p3 _rounded')}
                style={{ background: 'var(--d-surface)' }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: intent.confidence > 70 ? 'var(--d-success)' :
                               intent.confidence > 50 ? 'var(--d-warning)' : 'var(--d-text-muted)',
                    flexShrink: 0,
                  }}
                />
                <div className={css('_flex _col _flex1')}>
                  <span className={css('_textsm _fontmedium')}>{intent.label}</span>
                  <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                    {intent.category}
                  </span>
                </div>
                <span className={css('_textsm _fontbold') + ' mono-data'}>
                  {intent.confidence}%
                </span>
                {/* Bar */}
                <div style={{ width: '80px', height: '4px', borderRadius: '2px', background: 'var(--d-border)' }}>
                  <div
                    style={{
                      width: `${intent.confidence}%`,
                      height: '100%',
                      borderRadius: '2px',
                      background: intent.confidence > 70 ? 'var(--d-success)' :
                                 intent.confidence > 50 ? 'var(--d-warning)' : 'var(--d-text-muted)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metric breakdown */}
      <div className="d-section" data-density="compact">
        <h3
          className={css('_textsm _fontsemi _mb4') + ' d-label'}
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}
        >
          Metric Breakdown
        </h3>
        <div className={css('_grid _gc4 _gap3')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {detailStats.map(({ label, value, icon: Icon }) => (
            <div key={label} className={css('_flex _col _gap2 _p4') + ' d-surface carbon-card'}>
              <div className={css('_flex _aic _jcsb')}>
                <span className={css('_textxs') + ' d-label'}>{label}</span>
                <Icon size={14} style={{ color: 'var(--d-text-muted)' }} />
              </div>
              <span className={css('_textlg _fontbold') + ' mono-data'}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
