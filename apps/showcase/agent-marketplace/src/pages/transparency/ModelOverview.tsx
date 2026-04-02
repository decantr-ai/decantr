import { css } from '@decantr/css';
import { Brain, Cpu, Zap, Clock, TrendingUp, Activity } from 'lucide-react';
import { NeuralFeedbackLoop } from '../../components/NeuralFeedbackLoop';

interface ModelStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: typeof Brain;
}

const stats: ModelStat[] = [
  { label: 'Total Inferences', value: '1.24M', change: '+12.4%', trend: 'up', icon: Zap },
  { label: 'Avg Confidence', value: '91.2%', change: '+2.1%', trend: 'up', icon: TrendingUp },
  { label: 'Avg Latency', value: '142ms', change: '-8.3%', trend: 'down', icon: Clock },
  { label: 'Active Models', value: '7', change: '+1', trend: 'up', icon: Cpu },
  { label: 'Error Rate', value: '0.3%', change: '-0.1%', trend: 'down', icon: Activity },
  { label: 'Token Usage', value: '8.4B', change: '+18.7%', trend: 'up', icon: Brain },
];

function StatsOverview() {
  return (
    <div className={css('_flex _col _gap4')}>
      <h3
        className="d-label"
        style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}
      >
        Model KPIs
      </h3>
      <div className={css('_grid _gc2 _lg:gc3 _gap3')}>
        {stats.map(stat => {
          const Icon = stat.icon;
          const isPositive = (stat.trend === 'up' && !stat.label.includes('Error') && !stat.label.includes('Latency'))
            || (stat.trend === 'down' && (stat.label.includes('Error') || stat.label.includes('Latency')));
          return (
            <div key={stat.label} className={css('_flex _col _gap2 _p3') + ' d-surface carbon-glass'}>
              <div className={css('_flex _aic _jcsb')}>
                <span className={css('_textxs') + ' d-label mono-data'}>{stat.label}</span>
                <Icon size={14} style={{ color: 'var(--d-accent)', opacity: 0.6 }} />
              </div>
              <span className={css('_textxl _fontsemi') + ' mono-data neon-text-glow'}>
                {stat.value}
              </span>
              <span
                className={css('_textxs') + ' mono-data'}
                style={{ color: isPositive ? 'var(--d-success)' : 'var(--d-error)' }}
              >
                {stat.change} vs last week
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ModelOverview() {
  return (
    <div className={css('_flex _col _gap6')}>
      <section className="d-section" data-density="compact">
        <StatsOverview />
      </section>

      <section className="d-section" data-density="compact">
        <NeuralFeedbackLoop
          title="Feedback Summary"
          confidence={0.91}
          processingStage="nominal"
        />
      </section>
    </div>
  );
}
