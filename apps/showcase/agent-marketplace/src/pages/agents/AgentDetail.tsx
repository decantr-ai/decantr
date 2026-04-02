import { useParams } from 'react-router-dom';
import { css } from '@decantr/css';
import { Bot, Clock, Cpu, Zap, Activity } from 'lucide-react';
import { AgentTimeline, generateTimelineEvents } from '../../components/AgentTimeline';
import { NeuralFeedbackLoop } from '../../components/NeuralFeedbackLoop';

const agentData: Record<string, { name: string; model: string; status: 'active' | 'error' | 'idle'; uptime: string; version: string }> = {
  a1: { name: 'Classifier-v3', model: 'GPT-4o', status: 'active', uptime: '14d 6h', version: '3.2.1' },
  a2: { name: 'Summarizer-v2', model: 'Claude-3', status: 'active', uptime: '7d 12h', version: '2.1.0' },
  a3: { name: 'Router-Alpha', model: 'Mistral-7B', status: 'error', uptime: '0d 0h', version: '0.9.3' },
  a4: { name: 'Embedder-v1', model: 'text-embed-3', status: 'idle', uptime: '30d 2h', version: '1.0.4' },
  a5: { name: 'Guardian-v1', model: 'GPT-4o-mini', status: 'active', uptime: '21d 18h', version: '1.3.0' },
  a6: { name: 'Orchestrator', model: 'Claude-3.5', status: 'active', uptime: '45d 8h', version: '4.0.0' },
};

const events = generateTimelineEvents(15);

export function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const agent = agentData[id ?? ''] ?? { name: 'Unknown Agent', model: 'N/A', status: 'idle' as const, uptime: '--', version: '--' };

  const statusColor = agent.status === 'active' ? 'var(--d-success)' : agent.status === 'error' ? 'var(--d-error)' : 'var(--d-text-muted)';

  return (
    <div className={css('_flex _col _gap6')}>
      {/* Agent header card */}
      <div className={css('_flex _aic _gap4 _p4') + ' d-surface carbon-glass'}>
        <div className="status-ring" data-status={agent.status} style={{ width: '56px', height: '56px', flexShrink: 0 }}>
          <Bot size={24} />
        </div>
        <div className={css('_flex _col _gap1 _flex1')}>
          <div className={css('_flex _aic _gap2')}>
            <h2 className={css('_textxl _fontsemi') + ' mono-data neon-text-glow'}>{agent.name}</h2>
            <span className="d-annotation" data-status={agent.status === 'active' ? 'success' : agent.status === 'error' ? 'error' : 'info'}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
              {agent.status}
            </span>
          </div>
          <div className={css('_flex _gap4 _textxs _wrap') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
            <span className={css('_flex _aic _gap1')}><Cpu size={12} /> Model: {agent.model}</span>
            <span className={css('_flex _aic _gap1')}><Clock size={12} /> Uptime: {agent.uptime}</span>
            <span className={css('_flex _aic _gap1')}><Zap size={12} /> Version: {agent.version}</span>
          </div>
        </div>
        <div className={css('_flex _gap2')}>
          <button className="d-interactive neon-glow-hover" data-variant="primary">
            <Activity size={14} /> Restart
          </button>
          <button className="d-interactive" data-variant="ghost">Configure</button>
        </div>
      </div>

      {/* Agent history timeline */}
      <section className="d-section" data-density="compact">
        <AgentTimeline events={events} title="Agent History" />
      </section>

      {/* Neural feedback inspector */}
      <section className="d-section" data-density="compact">
        <NeuralFeedbackLoop
          title="Feedback Inspector"
          confidence={agent.status === 'error' ? 0.12 : 0.91}
          processingStage={agent.status === 'error' ? 'halted' : 'active'}
        />
      </section>
    </div>
  );
}
