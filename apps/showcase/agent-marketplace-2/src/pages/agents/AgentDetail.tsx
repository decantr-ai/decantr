import { useParams, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Bot, ArrowLeft, Settings, RotateCcw } from 'lucide-react';
import { AgentTimeline } from '../../components/AgentTimeline';
import { NeuralFeedbackLoop } from '../../components/NeuralFeedbackLoop';

export function AgentDetail() {
  const { id } = useParams();

  return (
    <div className={css('_flex _col _gap6 _p6')}>
      {/* Breadcrumb */}
      <div className={css('_flex _aic _gap2 _textsm')} style={{ color: 'var(--d-text-muted)' }}>
        <Link to="/agents" className={css('_flex _aic _gap1')} style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>
          <ArrowLeft size={14} />
          Agents
        </Link>
        <span>/</span>
        <span className="mono-data">{id}</span>
      </div>

      {/* Agent header */}
      <div className={css('_flex _aic _jcsb')}>
        <div className={css('_flex _aic _gap3')}>
          <div className="status-ring" data-status="active">
            <Bot size={20} />
          </div>
          <div className={css('_flex _col')}>
            <h1 className={css('_textxl _fontsemi')}>Data Ingestion Agent</h1>
            <span className={css('_textsm') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
              ID: {id} &middot; Type: Collector &middot; Uptime: 47h 23m
            </span>
          </div>
        </div>
        <div className={css('_flex _gap2')}>
          <button className={'d-interactive'} data-variant="ghost">
            <RotateCcw size={14} />
            <span className={css('_textsm')}>Restart</span>
          </button>
          <Link to="/agents/config" className={'d-interactive'} data-variant="ghost" style={{ textDecoration: 'none' }}>
            <Settings size={14} />
            <span className={css('_textsm')}>Configure</span>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className={css('_grid _gc4 _gap3')}>
        {[
          { label: 'Total Requests', value: '14,209' },
          { label: 'Avg Latency', value: '45ms' },
          { label: 'Error Rate', value: '0.02%' },
          { label: 'Throughput', value: '312/s' },
        ].map(s => (
          <div key={s.label} className={css('_flex _col _gap1 _p3') + ' d-surface carbon-card'}>
            <span className={css('_textxs') + ' d-label'}>{s.label}</span>
            <span className={css('_textlg _fontbold') + ' mono-data'}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Timeline + Feedback side by side on larger screens */}
      <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        <div className="d-section" data-density="compact">
          <AgentTimeline title="Agent History" />
        </div>
        <div className="d-section" data-density="compact">
          <NeuralFeedbackLoop title="Feedback Inspector" />
        </div>
      </div>
    </div>
  );
}
