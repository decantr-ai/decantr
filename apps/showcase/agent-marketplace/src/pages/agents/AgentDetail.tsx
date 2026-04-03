import { css } from '@decantr/css';
import { useParams, Link } from 'react-router-dom';
import { Bot, ArrowLeft, Clock, Cpu, Hash } from 'lucide-react';
import { AgentTimeline, type TimelineEvent } from '../../components/AgentTimeline';
import { NeuralFeedbackLoop } from '../../components/NeuralFeedbackLoop';

const MOCK_AGENT = {
  id: 'agent-001',
  name: 'DataCrawler',
  status: 'active' as const,
  model: 'gpt-4o',
  uptime: '14h 32m',
  tasks: 142,
  tokensUsed: 284600,
  avgLatency: 120,
};

const MOCK_EVENTS: TimelineEvent[] = [
  { id: '1', type: 'action', summary: 'Initiated batch crawl of 500 URLs', timestamp: '14:23:01', detail: 'Batch ID: batch_7f3a2. Source: production queue. Priority: high.' },
  { id: '2', type: 'tool_call', summary: 'HTTP client: GET api.example.com/data', timestamp: '14:23:03', detail: 'Response: 200 OK. Body: 12.4KB. Duration: 340ms.' },
  { id: '3', type: 'reasoning', summary: 'Evaluating extraction strategy for HTML content', timestamp: '14:23:05', detail: 'Content-type: text/html. Structured data detected. Choosing CSS selector extraction over regex.' },
  { id: '4', type: 'decision', summary: 'Selected structured extraction mode', timestamp: '14:23:06', detail: 'Confidence: 0.94. Alternative: raw text (0.72). Reasoning: structured data present in page.' },
  { id: '5', type: 'action', summary: 'Extracted 47 records from page', timestamp: '14:23:12' },
  { id: '6', type: 'tool_call', summary: 'Database: INSERT batch_results', timestamp: '14:23:14', detail: '47 rows inserted. Table: crawl_results. Duration: 89ms.' },
  { id: '7', type: 'action', summary: 'Moving to next URL in queue', timestamp: '14:23:15' },
  { id: '8', type: 'error', summary: 'DNS resolution failed for target URL', timestamp: '14:23:18', detail: 'Error: ENOTFOUND. URL: https://api.defunct-service.io/v2. Retrying with fallback resolver.' },
  { id: '9', type: 'reasoning', summary: 'Analyzing error pattern — 3 DNS failures in last 10 minutes', timestamp: '14:23:20', detail: 'Pattern suggests upstream DNS instability. Recommending circuit breaker activation.' },
  { id: '10', type: 'info', summary: 'Checkpoint saved — 142 tasks completed', timestamp: '14:23:30' },
];

export function AgentDetail() {
  const { id } = useParams();
  const agent = { ...MOCK_AGENT, id: id || MOCK_AGENT.id };

  return (
    <div className={css('_flex _col _gap6')}>
      {/* Breadcrumb back link */}
      <Link to="/agents" className={css('_flex _aic _gap2 _textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Overview
      </Link>

      {/* Agent header */}
      <div className={css('_flex _aic _jcsb _wrap _gap4')}>
        <div className={css('_flex _aic _gap4')}>
          <div className="status-ring" data-status={agent.status}>
            <Bot size={20} />
          </div>
          <div>
            <h1 className={css('_fontsemi _textxl')}>{agent.name}</h1>
            <div className={css('_flex _aic _gap3 _wrap')}>
              <span className={css('_flex _aic _gap1 _textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                <Hash size={12} /> {agent.id}
              </span>
              <span className={css('_flex _aic _gap1 _textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                <Cpu size={12} /> {agent.model}
              </span>
              <span className={css('_flex _aic _gap1 _textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                <Clock size={12} /> {agent.uptime}
              </span>
            </div>
          </div>
        </div>
        <span className="d-annotation" data-status="success">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--d-success)' }} />
          {agent.status}
        </span>
      </div>

      {/* Quick stats */}
      <div className={css('_grid _gap4')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {[
          { label: 'Tasks Completed', value: agent.tasks.toLocaleString() },
          { label: 'Tokens Used', value: (agent.tokensUsed / 1000).toFixed(1) + 'k' },
          { label: 'Avg Latency', value: agent.avgLatency + 'ms' },
          { label: 'Uptime', value: agent.uptime },
        ].map(s => (
          <div key={s.label} className="d-surface carbon-card">
            <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{s.label}</span>
            <span className={css('_textxl _fontbold _block') + ' mono-data'}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Agent Timeline */}
      <div>
        <span className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem', display: 'block' }}>
          Agent History
        </span>
        <AgentTimeline
          events={MOCK_EVENTS}
          agentName={agent.name}
          modelId={agent.model}
        />
      </div>

      {/* Neural Feedback Loop */}
      <div>
        <span className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem', display: 'block' }}>
          Feedback Inspector
        </span>
        <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="d-surface carbon-card" style={{ display: 'flex', justifyContent: 'center' }}>
            <NeuralFeedbackLoop label="Confidence" value={94} trend={2.3} status="active" />
          </div>
          <div className="d-surface carbon-card" style={{ display: 'flex', justifyContent: 'center' }}>
            <NeuralFeedbackLoop label="Token Rate" value={340} maxValue={500} unit="/s" trend={-1.2} status="processing" />
          </div>
          <div className="d-surface carbon-card" style={{ display: 'flex', justifyContent: 'center' }}>
            <NeuralFeedbackLoop label="Accuracy" value={97} trend={0.5} status="active" />
          </div>
        </div>
      </div>
    </div>
  );
}
