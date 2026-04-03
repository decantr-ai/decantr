import { useParams } from 'react-router-dom';
import { css } from '@decantr/css';
import { AgentTimeline, type TimelineEvent, type TimelineSummary } from '@/components/AgentTimeline';
import { NeuralFeedbackRow, type FeedbackMetric } from '@/components/NeuralFeedbackLoop';

/* ── Mock Data ── */

interface AgentRecord {
  name: string;
  modelId: string;
  status: 'active' | 'idle' | 'error' | 'completed';
  elapsed: string;
  tokens: string;
}

const AGENT_LOOKUP: Record<string, AgentRecord> = {
  'sentinel-alpha': { name: 'sentinel-alpha', modelId: 'gpt-4-turbo', status: 'active', elapsed: '4h 12m', tokens: '184,320' },
  'recon-bravo': { name: 'recon-bravo', modelId: 'claude-3', status: 'idle', elapsed: '1h 47m', tokens: '62,100' },
  'analyst-echo': { name: 'analyst-echo', modelId: 'gpt-4-turbo', status: 'active', elapsed: '6h 03m', tokens: '291,040' },
  'monitor-delta': { name: 'monitor-delta', modelId: 'mistral-large', status: 'error', elapsed: '0h 38m', tokens: '12,800' },
  'scout-foxtrot': { name: 'scout-foxtrot', modelId: 'claude-3', status: 'active', elapsed: '2h 55m', tokens: '97,500' },
  'dispatch-golf': { name: 'dispatch-golf', modelId: 'gpt-4-turbo', status: 'idle', elapsed: '3h 21m', tokens: '143,680' },
};

function eventsFor(id: string): TimelineEvent[] {
  return [
    { id: `${id}-01`, type: 'action', summary: 'Initialized execution context', timestamp: '14:32:07', detail: `Agent: ${id}\nContext: primary\nWorker pool: 4 threads` },
    { id: `${id}-02`, type: 'tool_call', summary: 'Called fetch_data(source="warehouse-prod")', timestamp: '14:31:42', detail: 'Tool: fetch_data\nPayload: 2.4MB\nLatency: 340ms' },
    { id: `${id}-03`, type: 'reasoning', summary: 'Evaluating 5 candidate strategies for task decomposition', timestamp: '14:30:55' },
    { id: `${id}-04`, type: 'decision', summary: 'Selected parallel execution over sequential batch', timestamp: '14:30:18', detail: 'Strategy: parallel_fanout\nEstimated speedup: 3.2x\nRisk: low' },
    { id: `${id}-05`, type: 'action', summary: 'Dispatched 4 sub-tasks to worker pool', timestamp: '14:29:33' },
    { id: `${id}-06`, type: 'tool_call', summary: 'Called vector_search(index="embeddings-v3", k=50)', timestamp: '14:28:47', detail: 'Tool: vector_search\nResults: 50 matches\nTop score: 0.94\nLatency: 67ms' },
    { id: `${id}-07`, type: 'error', summary: 'Worker 3 exceeded memory threshold (512MB)', timestamp: '14:27:12', detail: 'Worker: 3\nAllocated: 518MB\nLimit: 512MB\nAction: graceful restart' },
    { id: `${id}-08`, type: 'info', summary: 'Checkpoint saved to persistent storage', timestamp: '14:26:08' },
    { id: `${id}-09`, type: 'action', summary: 'Merged sub-task results into final output', timestamp: '14:25:30', detail: 'Merge strategy: weighted_average\nOutput size: 1.8MB' },
    { id: `${id}-10`, type: 'decision', summary: 'Confidence threshold met, proceeding to commit', timestamp: '14:24:55' },
  ];
}

const FEEDBACK_METRICS: FeedbackMetric[] = [
  { label: 'Confidence', value: 87, max: 100, unit: '%', trend: 'up' },
  { label: 'Token Rate', value: 1240, max: 2000, unit: 'tok/s', trend: 'stable' },
  { label: 'Latency', value: 142, max: 500, unit: 'ms', trend: 'down' },
];

/* ── Component ── */

export function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const agentId = id ?? 'sentinel-alpha';
  const agent = AGENT_LOOKUP[agentId] ?? AGENT_LOOKUP['sentinel-alpha'];
  const events = eventsFor(agentId);

  const summary: TimelineSummary = {
    agentName: agent.name,
    modelId: agent.modelId,
    status: agent.status,
    eventCount: events.length,
    elapsed: agent.elapsed,
    tokens: agent.tokens,
  };

  return (
    <div className={css('_flex _col _gap6')}>
      {/* ── Timeline Section ── */}
      <div className="d-section" data-density="compact">
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          AGENT: {agent.name.toUpperCase()}
        </div>
        <AgentTimeline events={events} summary={summary} />
      </div>

      {/* ── Neural Feedback Loop Section ── */}
      <div className="d-section" data-density="compact">
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          PERFORMANCE METRICS
        </div>
        <div className="d-surface carbon-card">
          <NeuralFeedbackRow metrics={FEEDBACK_METRICS} />
        </div>
      </div>
    </div>
  );
}
