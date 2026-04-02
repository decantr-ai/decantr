import { css } from '@decantr/css';
import { Activity, Cpu, Gauge, Zap } from 'lucide-react';
import { SectionLabel } from './SectionLabel';

interface NeuralFeedbackProps {
  confidence: number;
  tokenRate: number;
  stage: string;
  label?: string;
}

/**
 * Neural feedback loop visualization.
 * PulseCore with intensity mapped to metric values.
 * IntensityRing circular gauge.
 */
export function NeuralFeedback({
  confidence,
  tokenRate,
  stage,
  label = 'Neural Feedback',
}: NeuralFeedbackProps) {
  const intensityPercent = Math.round(confidence * 100);

  return (
    <div className="d-section" data-density="compact">
      <SectionLabel>{label}</SectionLabel>

      <div className={css('_flex _wrap _gap4')}>
        {/* PulseCore — radiating circles */}
        <div
          className={css('_flex _col _aic _jcc _p6 _flex1') + ' d-surface carbon-glass'}
          style={{ minWidth: '200px', minHeight: '200px' }}
        >
          <div className={css('_rel _flex _aic _jcc')} style={{ width: 120, height: 120 }}>
            {/* Outer pulse ring */}
            <div
              className={css('_abs _roundedfull')}
              style={{
                inset: 0,
                border: '2px solid var(--d-accent)',
                opacity: 0.3,
                animation: `pulse-ring ${2 + (1 - confidence) * 2}s ease-out infinite`,
              }}
            />
            {/* Middle ring */}
            <div
              className={css('_abs _roundedfull')}
              style={{
                inset: '15px',
                border: '2px solid var(--d-accent)',
                opacity: 0.5,
              }}
            />
            {/* Core */}
            <div
              className={css('_flex _aic _jcc _roundedfull') + ' neon-glow'}
              style={{
                width: 60,
                height: 60,
                background: `color-mix(in srgb, var(--d-accent) ${intensityPercent}%, var(--d-surface))`,
              }}
            >
              <Activity size={24} style={{ color: 'var(--d-text)' }} />
            </div>
          </div>
          <span className={css('_textsm _fgmuted _mt3') + ' mono-data'}>{stage}</span>
        </div>

        {/* Metrics display */}
        <div className={css('_flex _col _gap3 _flex1')} style={{ minWidth: '200px' }}>
          <MetricCard
            icon={Gauge}
            label="Confidence"
            value={`${intensityPercent}%`}
            color={confidence > 0.8 ? 'var(--d-success)' : confidence > 0.5 ? 'var(--d-warning)' : 'var(--d-error)'}
            bar={confidence}
          />
          <MetricCard
            icon={Cpu}
            label="Token Rate"
            value={`${tokenRate.toLocaleString()}/s`}
            color="var(--d-info)"
            bar={Math.min(tokenRate / 1000, 1)}
          />
          <MetricCard
            icon={Zap}
            label="Processing"
            value={stage}
            color="var(--d-accent)"
            bar={0.7}
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  bar,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  color: string;
  bar: number;
}) {
  return (
    <div className={css('_flex _col _gap2 _p4') + ' d-surface carbon-card'}>
      <div className={css('_flex _aic _gap2')}>
        <Icon size={16} style={{ color }} />
        <span className={css('_textxs _fgmuted _uppercase') + ' d-label'}>{label}</span>
      </div>
      <span className={css('_textlg _fontsemi') + ' mono-data neon-text-glow'}>{value}</span>
      <div
        className={css('_w100 _rounded')}
        style={{ height: 4, background: 'var(--d-border)' }}
      >
        <div
          className={css('_rounded')}
          style={{
            height: '100%',
            width: `${bar * 100}%`,
            background: color,
            transition: 'width 0.3s var(--d-easing)',
          }}
        />
      </div>
    </div>
  );
}
