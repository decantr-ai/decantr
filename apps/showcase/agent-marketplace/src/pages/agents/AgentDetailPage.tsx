import { useParams, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Bot, ArrowLeft, Tag, Cpu, Hash, Inbox } from 'lucide-react';
import { agents, timelineEvents } from '../../data';
import { StatusRing } from '../../components/StatusRing';
import { AgentTimeline } from '../../components/AgentTimeline';
import { NeuralFeedback } from '../../components/NeuralFeedback';
import { SectionLabel } from '../../components/SectionLabel';
import { EmptyState } from '../../components/EmptyState';

export function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const agent = agents.find((a) => a.id === id);

  if (!agent) {
    return (
      <EmptyState
        icon={Inbox}
        message={`Agent "${id}" not found.`}
        action={{ label: 'Back to Agents', onClick: () => window.history.back() }}
      />
    );
  }

  const agentEvents = timelineEvents.filter((e) => e.agentId === agent.id);

  return (
    <div className={css('_flex _col _gap6')}>
      {/* Header with back link */}
      <div className={css('_flex _aic _gap3')}>
        <Link
          to="/agents"
          className={css('_flex _aic _gap1 _pointer _textsm _fgmuted _trans') + ' d-interactive'}
          data-variant="ghost"
          style={{ padding: '0.25rem 0.5rem' }}
        >
          <ArrowLeft size={14} /> Agents
        </Link>
      </div>

      {/* Agent profile card */}
      <div className="d-section" data-density="compact">
        <div className={css('_flex _aic _gap4 _mb4')}>
          <StatusRing status={agent.status} size={56}>
            <Bot
              size={24}
              style={{
                color: agent.status === 'error'
                  ? 'var(--d-error)'
                  : agent.status === 'active'
                  ? 'var(--d-success)'
                  : 'var(--d-text-muted)',
              }}
            />
          </StatusRing>
          <div className={css('_flex _col _gap1')}>
            <h1 className={css('_textxl _fontsemi')}>{agent.name}</h1>
            <div className={css('_flex _aic _gap2')}>
              <span
                className="d-annotation"
                data-status={agent.status === 'active' ? 'success' : agent.status === 'error' ? 'error' : 'warning'}
              >
                {agent.status}
              </span>
              <span className={css('_textxs _fgmuted') + ' mono-data'}>{agent.type}</span>
              <span className={css('_textxs _fgmuted') + ' mono-data'}>{agent.model}</span>
            </div>
          </div>
        </div>

        <p className={css('_textsm _fgmuted _mb4')} style={{ lineHeight: 1.6 }}>
          {agent.description}
        </p>

        {/* Stats row */}
        <div className={css('_grid _gc2 _md:gc4 _gap3 _mb4')}>
          <div className={css('_flex _col _gap1 _p3') + ' d-surface carbon-card'}>
            <span className={css('_textxs _fgmuted') + ' d-label'}>
              <Cpu size={10} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Confidence
            </span>
            <span className={css('_textlg _fontsemi') + ' mono-data neon-text-glow'}>
              {Math.round(agent.confidence * 100)}%
            </span>
          </div>
          <div className={css('_flex _col _gap1 _p3') + ' d-surface carbon-card'}>
            <span className={css('_textxs _fgmuted') + ' d-label'}>
              <Hash size={10} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Tokens Used
            </span>
            <span className={css('_textlg _fontsemi') + ' mono-data neon-text-glow'}>
              {agent.tokensUsed.toLocaleString()}
            </span>
          </div>
          <div className={css('_flex _col _gap1 _p3') + ' d-surface carbon-card'}>
            <span className={css('_textxs _fgmuted') + ' d-label'}>Tasks Done</span>
            <span className={css('_textlg _fontsemi') + ' mono-data neon-text-glow'}>
              {agent.tasksCompleted.toLocaleString()}
            </span>
          </div>
          <div className={css('_flex _col _gap1 _p3') + ' d-surface carbon-card'}>
            <span className={css('_textxs _fgmuted') + ' d-label'}>Last Active</span>
            <span className={css('_textsm _fontsemi') + ' mono-data'}>{agent.lastActive}</span>
          </div>
        </div>

        {/* Tags */}
        <div className={css('_flex _wrap _gap2')}>
          {agent.tags.map((tag) => (
            <span key={tag} className={css('_flex _aic _gap1 _textxs') + ' d-annotation'}>
              <Tag size={10} /> {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Agent history timeline */}
      <AgentTimeline
        events={agentEvents.length > 0 ? agentEvents : timelineEvents.slice(0, 3)}
        label="Agent History"
      />

      {/* Neural feedback inspector */}
      <NeuralFeedback
        confidence={agent.confidence}
        tokenRate={Math.round(agent.tokensUsed / 60)}
        stage={agent.status === 'active' ? 'Processing' : agent.status === 'error' ? 'Halted' : 'Standby'}
        label="Feedback Inspector"
      />
    </div>
  );
}
