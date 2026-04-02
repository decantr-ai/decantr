import { css } from '@decantr/css';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Bot, Clock, Cpu, Zap, BarChart3, Settings } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { StatusRing } from '../../components/StatusRing';
import { TimelineEvent } from '../../components/TimelineEvent';
import { NeuralFeedback } from '../../components/NeuralFeedback';

const AGENT_DATA: Record<string, { name: string; model: string; status: 'active' | 'idle' | 'error' | 'warning'; uptime: string; tasks: number; confidence: number; tokPerSec: number; stage: string }> = {
  a1: { name: 'CodeGen Alpha', model: 'gpt-4o', status: 'active', uptime: '14d 6h', tasks: 142, confidence: 94, tokPerSec: 847, stage: 'inference' },
  a2: { name: 'Data Miner v3', model: 'claude-3.5', status: 'active', uptime: '7d 12h', tasks: 89, confidence: 87, tokPerSec: 623, stage: 'extraction' },
  a3: { name: 'Safety Monitor', model: 'gpt-4o-mini', status: 'warning', uptime: '3d 2h', tasks: 12, confidence: 62, tokPerSec: 310, stage: 'analysis' },
  a4: { name: 'Search Index', model: 'mistral-large', status: 'idle', uptime: '—', tasks: 0, confidence: 0, tokPerSec: 0, stage: 'idle' },
  a5: { name: 'Deploy Bot', model: 'claude-3.5', status: 'error', uptime: '1d 8h', tasks: 3, confidence: 15, tokPerSec: 0, stage: 'disconnected' },
  a6: { name: 'Test Runner', model: 'gpt-4o', status: 'active', uptime: '10d 4h', tasks: 57, confidence: 91, tokPerSec: 512, stage: 'execution' },
};

const HISTORY = [
  { type: 'action' as const, title: 'Completed batch inference #847', description: 'Processed 1,200 requests with 99.2% success rate.', timestamp: '4m ago', duration: '2.1s' },
  { type: 'decision' as const, title: 'Switched to streaming mode', description: 'Detected high concurrency — switched from batch to streaming pipeline.', timestamp: '18m ago', duration: '50ms' },
  { type: 'tool_call' as const, title: 'Called vector_search()', description: 'Queried embeddings index for semantic similarity matching.', timestamp: '24m ago', duration: '180ms' },
  { type: 'reasoning' as const, title: 'Evaluated fallback strategy', description: 'Primary endpoint latency exceeded 500ms threshold. Evaluating region failover.', timestamp: '41m ago' },
  { type: 'action' as const, title: 'Checkpoint saved', description: 'Model state checkpoint written to persistent storage.', timestamp: '1h ago', duration: '340ms' },
];

export function AgentDetail() {
  const { id } = useParams();
  const agent = AGENT_DATA[id || 'a1'] || AGENT_DATA.a1;

  return (
    <>
      <Link
        to="/agents"
        className={css('_flex _aic _gap1') + ' d-interactive neon-glow-hover'}
        data-variant="ghost"
        style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: 'var(--d-gap-4)', border: '1px solid transparent', alignSelf: 'flex-start' }}
      >
        <ArrowLeft size={14} /> All Agents
      </Link>

      {/* Agent header */}
      <div className={css('_flex _aic _gap4') + ' neon-entrance'} style={{ marginBottom: 'var(--d-gap-6)' }}>
        <StatusRing status={agent.status} size={56}>
          <Bot size={24} style={{ color: 'var(--d-accent)' }} />
        </StatusRing>
        <div className={css('_flex _col _gap1')}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{agent.name}</h1>
          <div className={css('_flex _aic _gap3')}>
            <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
              <Cpu size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {agent.model}
            </span>
            <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
              <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {agent.uptime}
            </span>
            <span
              className="d-annotation"
              data-status={agent.status === 'active' ? 'success' : agent.status === 'error' ? 'error' : agent.status === 'warning' ? 'warning' : 'info'}
            >
              {agent.status}
            </span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Link to="/agents/config" className="d-interactive neon-glow-hover" data-variant="ghost" style={{ border: '1px solid transparent' }}>
            <Settings size={14} /> Configure
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className={css('_flex _gap4 _wrap')}
        style={{ marginBottom: 'var(--d-gap-6)' }}
      >
        {[
          { label: 'Tasks', value: String(agent.tasks), icon: Zap },
          { label: 'Confidence', value: `${agent.confidence}%`, icon: BarChart3 },
          { label: 'Throughput', value: `${agent.tokPerSec} tok/s`, icon: Cpu },
        ].map((stat) => (
          <div key={stat.label} className={css('_flex _aic _gap3') + ' d-surface carbon-glass neon-entrance'} style={{ flex: 1, minWidth: 160 }}>
            <stat.icon size={16} style={{ color: 'var(--d-accent)' }} />
            <div>
              <div className="mono-data" style={{ fontSize: '1.125rem', fontWeight: 600 }}>{stat.value}</div>
              <div className="mono-data" style={{ fontSize: '0.625rem', color: 'var(--d-text-muted)', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: history + neural feedback */}
      <div className={css('_flex _gap6 _wrap')} style={{ alignItems: 'flex-start' }}>
        {/* Agent history — timeline */}
        <section className="d-section" style={{ flex: 2, minWidth: 300, paddingTop: 0 }}>
          <h2 className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--d-gap-4)' }}>
            Agent History
          </h2>
          <div className={css('_flex _col')}>
            {HISTORY.map((event, i) => (
              <TimelineEvent key={i} {...event} />
            ))}
          </div>
        </section>

        {/* Neural feedback loop */}
        <section className="d-section" style={{ flex: 1, minWidth: 260, paddingTop: 0 }}>
          <h2 className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--d-gap-4)' }}>
            Feedback Inspector
          </h2>
          <NeuralFeedback
            confidence={agent.confidence}
            tokensPerSec={agent.tokPerSec}
            stage={agent.stage}
            label={agent.name}
          />
        </section>
      </div>
    </>
  );
}
