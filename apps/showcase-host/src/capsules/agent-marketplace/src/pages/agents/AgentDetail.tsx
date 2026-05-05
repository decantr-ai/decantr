import { Link, useParams } from 'react-router-dom';
import { Bot, Clock3, Cpu, Hash } from 'lucide-react';
import { css } from '@decantr/css';
import { AgentTimeline } from '../../components/AgentTimeline';
import { NeuralFeedbackLoop } from '../../components/NeuralFeedbackLoop';
import { PageHeader, SectionHeader } from '../../components/PageHeader';
import { agentDetailEvents, agentFeedbackMetrics } from '../../data/mock';

export function AgentDetail() {
  const { id } = useParams();
  const agentId = id ?? 'agent-001';

  const summaryCards = [
    { label: 'Tasks completed', value: '142' },
    { label: 'Tokens used', value: '284.6k' },
    { label: 'Mean latency', value: '120ms' },
    { label: 'Uptime', value: '14h 32m' },
  ];

  return (
    <div className="page-stack">
      <Link to="/agents" className="back-link">
        Back to swarm overview
      </Link>

      <div className="agent-header">
        <div className="agent-header__identity">
          <div className="status-ring" data-status="active">
            <Bot size={18} />
          </div>
          <div className={css('_flex _col _gap2')}>
            <PageHeader
              label="Agent detail"
              title="DataCrawler"
              description="A deep-dive into execution history, confidence, and reliability posture for the currently selected agent."
            />
            <div className="agent-header__meta">
              <span><Hash size={12} /> {agentId}</span>
              <span><Cpu size={12} /> gpt-4o</span>
              <span><Clock3 size={12} /> 14h 32m</span>
            </div>
          </div>
        </div>
        <span className="d-annotation" data-status="success">Active</span>
      </div>

      <div className="summary-grid">
        {summaryCards.map((item) => (
          <article key={item.label} className="d-surface carbon-card summary-card">
            <div className="summary-card__copy">
              <span className="stats-card__label">{item.label}</span>
              <strong className="summary-card__value mono-data">{item.value}</strong>
            </div>
          </article>
        ))}
      </div>

      <div className="page-stack">
        <SectionHeader
          label="Agent history"
          title="Execution trace"
          description="Timeline events keep tool calls, decisions, and failures compact until the operator expands the detail for context."
        />
        <AgentTimeline events={agentDetailEvents} title="Execution history" agentName="DataCrawler" modelId="gpt-4o" />
      </div>

      <div className="page-stack">
        <SectionHeader
          label="Feedback inspector"
          title="Confidence, throughput, and model stability"
          description="The neural feedback loop stays focused on one metric at a time so the instrument reads clearly instead of becoming a generic dashboard widget."
        />
        <div className="feedback-grid">
          {agentFeedbackMetrics.map((metric) => (
            <article key={metric.label} className="d-surface carbon-card feedback-panel">
              <NeuralFeedbackLoop
                label={metric.label}
                value={metric.value}
                maxValue={metric.maxValue}
                unit={metric.unit}
                trend={metric.trend}
                status={metric.status}
              />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
