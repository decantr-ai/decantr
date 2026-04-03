import { css } from '@decantr/css';
import { AgentTimeline, type TimelineEvent, type TimelineSummary } from '@/components/AgentTimeline';

const mockSummary: TimelineSummary = {
  agentName: 'inference-pipeline',
  modelId: 'gpt-4-turbo-2024',
  status: 'active',
  eventCount: 24,
  elapsed: '12m 34s',
  tokens: '48.2k',
};

const mockEvents: TimelineEvent[] = [
  {
    id: 'evt-001',
    type: 'info',
    summary: 'Pipeline initialized — loading model weights',
    timestamp: '14:23:01.234',
  },
  {
    id: 'evt-002',
    type: 'action',
    summary: 'Token preprocessing started',
    timestamp: '14:23:01.891',
    detail: 'Input tokenized into 1,247 tokens using cl100k_base encoding.\nSpecial tokens injected: [BOS], [INST], [/INST].\nPadding applied to reach batch alignment boundary (1,280).',
  },
  {
    id: 'evt-003',
    type: 'tool_call',
    summary: 'Embedding lookup — token → vector projection',
    timestamp: '14:23:02.103',
    detail: 'Mapped 1,247 tokens to 4096-dim embedding vectors.\nPositional encoding applied (RoPE, base=10000).\nBatch shape: [1, 1280, 4096].',
  },
  {
    id: 'evt-004',
    type: 'reasoning',
    summary: 'Evaluating attention routing strategy',
    timestamp: '14:23:02.447',
    detail: 'Context length 1,247 tokens falls within flash-attention threshold.\nSelected: FlashAttention-2 with causal mask.\nKV-cache allocated: 2.4 GB across 32 layers.',
  },
  {
    id: 'evt-005',
    type: 'action',
    summary: 'Attention computation — layers 0-15 forward pass',
    timestamp: '14:23:03.012',
  },
  {
    id: 'evt-006',
    type: 'action',
    summary: 'Attention computation — layers 16-31 forward pass',
    timestamp: '14:23:04.338',
  },
  {
    id: 'evt-007',
    type: 'decision',
    summary: 'MoE gating — selected experts 3, 7 for final block',
    timestamp: '14:23:05.102',
    detail: 'Expert routing scores: [0.04, 0.11, 0.08, 0.31, 0.02, 0.06, 0.09, 0.29].\nTop-2 selected: expert-3 (0.31), expert-7 (0.29).\nLoad balancing loss: 0.0012.',
  },
  {
    id: 'evt-008',
    type: 'error',
    summary: 'Numerical overflow detected in softmax — layer 28',
    timestamp: '14:23:05.447',
    detail: 'Max logit exceeded fp16 range (65504) at position 1,102.\nRecovery: re-computed with fp32 accumulation.\nLatency penalty: +12ms.',
  },
  {
    id: 'evt-009',
    type: 'action',
    summary: 'Logit normalization and temperature scaling',
    timestamp: '14:23:05.891',
  },
  {
    id: 'evt-010',
    type: 'decision',
    summary: 'Confidence scoring — top-1 probability 0.847',
    timestamp: '14:23:06.234',
    detail: 'Token probability distribution:\n  top-1: "deploy" — p=0.847\n  top-2: "launch" — p=0.091\n  top-3: "start"  — p=0.034\nEntropy: 0.72 nats. Confidence threshold met.',
  },
  {
    id: 'evt-011',
    type: 'tool_call',
    summary: 'Output decoding — nucleus sampling (top-p=0.9)',
    timestamp: '14:23:07.102',
    detail: 'Generated 342 tokens in 1.87s (183 tok/s).\nSampling parameters: temperature=0.7, top_p=0.9, repeat_penalty=1.1.\nStop condition: EOS token at position 342.',
  },
  {
    id: 'evt-012',
    type: 'reasoning',
    summary: 'Post-processing — safety filter and format validation',
    timestamp: '14:23:08.991',
    detail: 'Content filter: passed (score 0.02, threshold 0.80).\nJSON schema validation: passed.\nResponse length: 342 tokens, 1,847 characters.',
  },
  {
    id: 'evt-013',
    type: 'info',
    summary: 'Pipeline complete — response delivered to client',
    timestamp: '14:23:09.447',
  },
  {
    id: 'evt-014',
    type: 'action',
    summary: 'KV-cache eviction — freeing 2.4 GB VRAM',
    timestamp: '14:23:09.891',
  },
  {
    id: 'evt-015',
    type: 'info',
    summary: 'Telemetry flush — metrics written to observability sink',
    timestamp: '14:23:10.102',
  },
];

export function InferenceLog() {
  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '1.5rem' }}>
      <section className="d-section" data-density="compact">
        <div
          className="d-label"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
        >
          INFERENCE TRACE
        </div>
        <AgentTimeline events={mockEvents} summary={mockSummary} />
      </section>
    </div>
  );
}
