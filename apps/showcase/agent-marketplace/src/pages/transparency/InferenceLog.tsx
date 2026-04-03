import { AgentTimeline, type TimelineEvent } from '../../components/AgentTimeline';

const MOCK_EVENTS: TimelineEvent[] = [
  { id: '1', type: 'action', summary: 'Inference request received — gpt-4o', timestamp: '15:01:02', detail: 'Request ID: req_8a2f3. Tokens: 1240 input. Model: gpt-4o. Temperature: 0.7.' },
  { id: '2', type: 'reasoning', summary: 'Token budget analysis — 4096 max output', timestamp: '15:01:03', detail: 'Input tokens: 1240. Remaining budget: 2856 tokens. Context window utilization: 30.3%.' },
  { id: '3', type: 'tool_call', summary: 'Function call: search_database(query="agent metrics")', timestamp: '15:01:04', detail: 'Duration: 45ms. Results: 12 rows. Cached: false.' },
  { id: '4', type: 'decision', summary: 'Selected retrieval-augmented response strategy', timestamp: '15:01:05', detail: 'Confidence: 0.91. Alternatives: direct_answer(0.67), clarification(0.42).' },
  { id: '5', type: 'action', summary: 'Generated response — 342 tokens', timestamp: '15:01:08', detail: 'Output tokens: 342. Finish reason: stop. Latency: 3.2s. Cost: $0.0047.' },
  { id: '6', type: 'info', summary: 'Response cached for 5 min TTL', timestamp: '15:01:08' },
  { id: '7', type: 'action', summary: 'Inference request received — claude-3-sonnet', timestamp: '15:01:12', detail: 'Request ID: req_9b3g4. Tokens: 890 input. Model: claude-3-sonnet.' },
  { id: '8', type: 'tool_call', summary: 'Function call: analyze_sentiment(text=...)', timestamp: '15:01:13', detail: 'Duration: 120ms. Result: positive (0.87). Cached: true.' },
  { id: '9', type: 'reasoning', summary: 'Evaluating response quality threshold', timestamp: '15:01:14', detail: 'Quality score: 0.89. Threshold: 0.80. Pass. No regeneration needed.' },
  { id: '10', type: 'action', summary: 'Generated response — 567 tokens', timestamp: '15:01:16', detail: 'Output tokens: 567. Finish reason: stop. Latency: 2.1s. Cost: $0.0031.' },
  { id: '11', type: 'error', summary: 'Rate limit warning — approaching 80% capacity', timestamp: '15:01:20', detail: 'Current rate: 82 req/min. Limit: 100 req/min. Throttling recommended.' },
  { id: '12', type: 'decision', summary: 'Activated request throttling at 80% threshold', timestamp: '15:01:21', detail: 'New rate limit: 60 req/min. Duration: 5 minutes. Auto-recovery enabled.' },
];

export function InferenceLog() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontWeight: 600, fontSize: '1.25rem', marginBottom: '0.25rem' }}>Inference Log</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Trace every inference request, tool call, and decision across your models.</p>
      </div>

      <AgentTimeline
        events={MOCK_EVENTS}
        title="Inference Trace"
        agentName="Multi-Model Pipeline"
        modelId="gpt-4o / claude-3-sonnet"
      />
    </div>
  );
}
