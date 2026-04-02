import { css } from '@decantr/css';
import { Filter, Download, Play, Pause } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { TimelineEvent } from '../../components/TimelineEvent';

const FILTER_CHIPS = ['All', 'Actions', 'Decisions', 'Tool Calls', 'Reasoning', 'Errors'] as const;

const INFERENCE_TRACE = [
  { type: 'action' as const, title: 'gpt-4o: generate_code(target=react, spec=auth-form)', description: 'Input: 2,847 tokens | Output: 1,423 tokens | Confidence: 0.94 | Temperature: 0.3', timestamp: '14:23:47.012', duration: '1.8s' },
  { type: 'reasoning' as const, title: 'claude-3.5: chain_of_thought_evaluation', description: 'Evaluated 3 candidate approaches for data pipeline optimization. Selected parallel chunked strategy based on dataset size (12.4GB) and memory constraints.', timestamp: '14:23:45.891', duration: '420ms' },
  { type: 'tool_call' as const, title: 'gpt-4o: vector_search(index=embeddings, k=10)', description: 'Returned 10 results | Top similarity: 0.94 | Index: production-v3 | Latency: 23ms', timestamp: '14:23:44.201', duration: '23ms' },
  { type: 'decision' as const, title: 'claude-3.5: route_selection(strategy=cost_optimized)', description: 'Routing decision: us-east-1 primary → eu-west-1 fallback. Estimated cost savings: 34% vs default routing.', timestamp: '14:23:42.876', duration: '180ms' },
  { type: 'error' as const, title: 'gpt-4o-mini: rate_limit_exceeded', description: 'HTTP 429 — Rate limit: 60 req/min exceeded. Retry after 2.4s. Queue depth: 12 requests pending.', timestamp: '14:23:41.003' },
  { type: 'action' as const, title: 'mistral-large: embed_document(format=markdown, chunks=47)', description: 'Processed 47 chunks | Total tokens: 34,892 | Avg chunk: 742 tokens | Model: text-embedding-3-large', timestamp: '14:23:38.445', duration: '3.2s' },
  { type: 'tool_call' as const, title: 'claude-3.5: sql_query(table=agent_metrics)', description: 'SELECT agent_id, avg(latency_ms) FROM agent_metrics WHERE timestamp > now() - interval \'1h\' GROUP BY agent_id', timestamp: '14:23:36.112', duration: '45ms' },
  { type: 'reasoning' as const, title: 'gpt-4o: safety_evaluation(content_filter=strict)', description: 'Content safety check passed. Categories: violence=0.01, self_harm=0.00, sexual=0.00, hate=0.00. All below threshold (0.3).', timestamp: '14:23:34.890', duration: '90ms' },
  { type: 'decision' as const, title: 'claude-3.5: model_selection(task=code_review)', description: 'Selected gpt-4o for code review task based on benchmark scores (HumanEval: 94.2%) and available capacity.', timestamp: '14:23:32.445', duration: '12ms' },
  { type: 'action' as const, title: 'gpt-4o: stream_response(tokens=2847, format=markdown)', description: 'Streaming 2,847 tokens at 847 tok/s. First token latency: 142ms. Total stream time: 3.36s.', timestamp: '14:23:30.001', duration: '3.36s' },
];

export function InferenceLog() {
  return (
    <>
      <PageHeader
        title="Inference Log"
        subtitle="Real-time inference trace across all models"
        actions={
          <>
            <button className="d-interactive neon-glow-hover" data-variant="ghost" style={{ border: '1px solid transparent' }}>
              <Pause size={14} /> Pause
            </button>
            <button className="d-interactive neon-glow-hover" data-variant="ghost" style={{ border: '1px solid transparent' }}>
              <Download size={14} /> Export
            </button>
          </>
        }
      />

      {/* Summary bar */}
      <div className={css('_flex _gap4 _wrap')} style={{ marginBottom: 'var(--d-gap-4)' }}>
        {[
          { label: 'Total', value: '1,247', color: 'var(--d-text)' },
          { label: 'Actions', value: '487', color: 'var(--d-accent)' },
          { label: 'Decisions', value: '234', color: 'var(--d-success)' },
          { label: 'Tool Calls', value: '312', color: 'var(--d-info)' },
          { label: 'Errors', value: '14', color: 'var(--d-error)' },
        ].map((s) => (
          <div key={s.label} className={css('_flex _aic _gap2')}>
            <span className="mono-data" style={{ fontSize: '1.125rem', fontWeight: 600, color: s.color }}>{s.value}</span>
            <span className="mono-data" style={{ fontSize: '0.625rem', color: 'var(--d-text-muted)', textTransform: 'uppercase' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className={css('_flex _gap2 _wrap')} style={{ marginBottom: 'var(--d-gap-6)' }}>
        {FILTER_CHIPS.map((chip, i) => (
          <button
            key={chip}
            className="d-interactive neon-glow-hover"
            data-variant={i === 0 ? undefined : 'ghost'}
            style={{
              fontSize: '0.75rem',
              padding: 'var(--d-gap-1) var(--d-gap-3)',
              ...(i === 0 ? { background: 'var(--d-accent)', color: 'var(--d-bg)', borderColor: 'var(--d-accent)' } : { border: '1px solid var(--d-border)' }),
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Inference trace timeline */}
      <section className="d-section" style={{ paddingTop: 0 }}>
        <div className={css('_flex _col')}>
          {INFERENCE_TRACE.map((event, i) => (
            <TimelineEvent key={i} {...event} />
          ))}
        </div>
      </section>

      {/* Live indicator */}
      <div className={css('_flex _aic _jcc _gap2')} style={{ padding: 'var(--d-gap-4)', borderTop: '1px solid var(--d-border)' }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 'var(--d-radius-full)',
            background: 'var(--d-success)',
            boxShadow: '0 0 8px var(--d-success)',
            animation: 'neon-pulse 2s ease-in-out infinite',
          }}
        />
        <span className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
          Live — streaming at 847 events/s
        </span>
      </div>
    </>
  );
}
