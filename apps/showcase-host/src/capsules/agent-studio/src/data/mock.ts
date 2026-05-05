export interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  tools: string[];
  status: 'active' | 'draft' | 'archived' | 'error';
  version: string;
  updated: string;
  runs: number;
  avgLatency: number;
  successRate: number;
  systemPrompt: string;
}

export interface PromptVersion {
  version: string;
  content: string;
  author: string;
  timestamp: string;
  message: string;
  tokens: number;
}

export interface Prompt {
  id: string;
  name: string;
  description: string;
  tags: string[];
  versions: PromptVersion[];
  currentVersion: string;
  updated: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'data' | 'search' | 'compute' | 'api' | 'file';
  calls: number;
  avgLatency: number;
  errorRate: number;
  schema: string;
  version: string;
  updated: string;
}

export interface EvalTestCase {
  id: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  latency: number;
  score: number;
}

export interface EvalResult {
  id: string;
  name: string;
  agent: string;
  model: string;
  status: 'passed' | 'failed' | 'running' | 'regression';
  score: number;
  passed: number;
  failed: number;
  total: number;
  duration: number;
  timestamp: string;
  cases: EvalTestCase[];
}

export interface TraceSpan {
  id: string;
  name: string;
  kind: 'llm' | 'tool' | 'retrieval' | 'agent';
  start: number;
  duration: number;
  status: 'ok' | 'error';
  input?: string;
  output?: string;
  tokens?: { prompt: number; completion: number };
  depth: number;
}

export interface Trace {
  id: string;
  agent: string;
  user: string;
  status: 'ok' | 'error';
  duration: number;
  tokens: number;
  cost: number;
  spans: TraceSpan[];
  timestamp: string;
  input: string;
  output: string;
}

export const agents: Agent[] = [
  {
    id: 'research-synth',
    name: 'Research Synthesizer',
    description: 'Multi-source research agent that synthesizes papers, web results, and internal docs into structured briefs.',
    model: 'claude-opus-4-6',
    tools: ['web-search', 'pdf-extract', 'vector-search', 'summarize'],
    status: 'active',
    version: 'v12.3.1',
    updated: '2 hours ago',
    runs: 24718,
    avgLatency: 3420,
    successRate: 98.2,
    systemPrompt: 'You are a precise research synthesizer. Given a topic, search multiple sources, extract citations, and produce a structured brief with sections: Summary, Key Findings, Evidence, Open Questions. Always cite sources with [n] notation.',
  },
  {
    id: 'code-review',
    name: 'Code Review Agent',
    description: 'Static analysis and design-pattern code reviewer with repository context awareness.',
    model: 'gpt-5-turbo',
    tools: ['git-diff', 'ast-parse', 'lint', 'test-run'],
    status: 'active',
    version: 'v8.1.0',
    updated: '14 minutes ago',
    runs: 91204,
    avgLatency: 1890,
    successRate: 96.7,
    systemPrompt: 'Review code diffs for correctness, style, security, and performance. Cite specific line numbers. Suggest minimal fixes.',
  },
  {
    id: 'support-triage',
    name: 'Support Triage',
    description: 'Classifies and routes inbound customer tickets to the correct queue with sentiment detection.',
    model: 'claude-sonnet-4-5',
    tools: ['zendesk-search', 'kb-lookup', 'sentiment'],
    status: 'active',
    version: 'v4.2.7',
    updated: '1 day ago',
    runs: 48201,
    avgLatency: 820,
    successRate: 99.1,
    systemPrompt: 'Classify incoming tickets. Return JSON { queue, priority, sentiment, summary }.',
  },
  {
    id: 'sql-analyst',
    name: 'SQL Analyst',
    description: 'Natural-language to SQL agent with schema awareness and result interpretation.',
    model: 'claude-opus-4-6',
    tools: ['schema-intro', 'query-run', 'chart-gen'],
    status: 'draft',
    version: 'v0.9.2',
    updated: '3 days ago',
    runs: 412,
    avgLatency: 5210,
    successRate: 89.4,
    systemPrompt: 'Translate natural language requests into SQL. Always verify schema before generating.',
  },
  {
    id: 'doc-writer',
    name: 'Documentation Writer',
    description: 'Generates technical docs from source code comments and type signatures.',
    model: 'gpt-5-turbo',
    tools: ['git-read', 'ast-parse', 'markdown-gen'],
    status: 'active',
    version: 'v6.0.0',
    updated: '5 hours ago',
    runs: 8102,
    avgLatency: 4100,
    successRate: 94.3,
    systemPrompt: 'Write concise technical documentation. Match existing voice. Include examples.',
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Transcribes meetings and extracts action items with owner assignment.',
    model: 'claude-sonnet-4-5',
    tools: ['transcribe', 'diarize', 'summarize'],
    status: 'error',
    version: 'v2.1.3',
    updated: '6 hours ago',
    runs: 2041,
    avgLatency: 12400,
    successRate: 72.1,
    systemPrompt: 'Extract action items with owner, deadline, and context from transcripts.',
  },
  {
    id: 'email-compose',
    name: 'Email Composer',
    description: 'Drafts context-aware email replies matching user voice and tone.',
    model: 'claude-sonnet-4-5',
    tools: ['inbox-search', 'calendar-read'],
    status: 'archived',
    version: 'v3.4.1',
    updated: '2 weeks ago',
    runs: 15820,
    avgLatency: 1520,
    successRate: 97.8,
    systemPrompt: 'Draft email replies matching the user\'s voice based on recent sent items.',
  },
];

export const prompts: Prompt[] = [
  {
    id: 'system-research',
    name: 'system.research.v12',
    description: 'System prompt for research synthesizer agent',
    tags: ['system', 'research', 'production'],
    currentVersion: 'v12.3.1',
    updated: '2 hours ago',
    versions: [
      { version: 'v12.3.1', content: 'You are a precise research synthesizer. Given a topic, search multiple sources, extract citations, and produce a structured brief.\n\nSections: Summary, Key Findings, Evidence, Open Questions.\nAlways cite sources with [n] notation.', author: 'kaito', timestamp: '2 hours ago', message: 'tighten citation format', tokens: 124 },
      { version: 'v12.3.0', content: 'You are a research synthesizer. Search sources, extract citations, produce structured briefs.\n\nUse these sections: Summary, Findings, Evidence, Questions.', author: 'kaito', timestamp: '2 days ago', message: 'restructure sections', tokens: 118 },
      { version: 'v12.2.0', content: 'You are a research agent. Search sources and summarize findings with citations.', author: 'maya', timestamp: '1 week ago', message: 'simplify system prompt', tokens: 82 },
    ],
  },
  {
    id: 'tool-websearch',
    name: 'tool.web_search.v4',
    description: 'Web search tool invocation template',
    tags: ['tool', 'search'],
    currentVersion: 'v4.1.0',
    updated: '1 day ago',
    versions: [
      { version: 'v4.1.0', content: 'Search the web for: {query}\nMaximum results: {max_results}\nFocus: {focus}', author: 'kaito', timestamp: '1 day ago', message: 'add focus param', tokens: 45 },
      { version: 'v4.0.0', content: 'Search for: {query}\nMax: {max_results}', author: 'priya', timestamp: '4 days ago', message: 'initial v4', tokens: 22 },
    ],
  },
  {
    id: 'classify-ticket',
    name: 'classify.ticket.v7',
    description: 'Support ticket classification prompt',
    tags: ['classification', 'support', 'production'],
    currentVersion: 'v7.2.4',
    updated: '3 hours ago',
    versions: [
      { version: 'v7.2.4', content: 'Classify the ticket into: { queue: "billing" | "tech" | "sales", priority: 1-5, sentiment: "positive" | "neutral" | "negative", summary: string }', author: 'priya', timestamp: '3 hours ago', message: 'add summary field', tokens: 88 },
      { version: 'v7.2.3', content: 'Classify ticket: { queue, priority, sentiment }', author: 'priya', timestamp: '1 day ago', message: 'tune priority scale', tokens: 54 },
    ],
  },
  {
    id: 'review-diff',
    name: 'review.diff.v3',
    description: 'Code diff review prompt',
    tags: ['code', 'review'],
    currentVersion: 'v3.0.2',
    updated: '6 hours ago',
    versions: [
      { version: 'v3.0.2', content: 'Review the following diff for: correctness, security, performance, style.\n\nDiff:\n{diff}\n\nReturn issues with line numbers and suggested fixes.', author: 'kaito', timestamp: '6 hours ago', message: 'add security focus', tokens: 94 },
    ],
  },
  {
    id: 'extract-actions',
    name: 'extract.actions.v2',
    description: 'Meeting action item extraction',
    tags: ['extraction', 'meeting'],
    currentVersion: 'v2.1.0',
    updated: '2 days ago',
    versions: [
      { version: 'v2.1.0', content: 'Extract action items as JSON: [{ owner, task, deadline, context }]', author: 'maya', timestamp: '2 days ago', message: 'add context', tokens: 38 },
    ],
  },
];

export const tools: Tool[] = [
  {
    id: 'web-search',
    name: 'web_search',
    description: 'Performs web search via Brave Search API with freshness and region controls.',
    category: 'search',
    calls: 124_820,
    avgLatency: 420,
    errorRate: 0.8,
    version: 'v2.1.0',
    updated: '3 days ago',
    schema: JSON.stringify({
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        max_results: { type: 'integer', minimum: 1, maximum: 20, default: 10 },
        freshness: { type: 'string', enum: ['day', 'week', 'month', 'year'] },
        region: { type: 'string', default: 'us-en' },
      },
      required: ['query'],
    }, null, 2),
  },
  {
    id: 'pdf-extract',
    name: 'pdf_extract',
    description: 'Extracts text and tables from PDF documents with OCR fallback.',
    category: 'file',
    calls: 8_421,
    avgLatency: 2100,
    errorRate: 2.3,
    version: 'v1.4.2',
    updated: '1 week ago',
    schema: JSON.stringify({
      type: 'object',
      properties: {
        url: { type: 'string', format: 'uri' },
        pages: { type: 'string', description: 'Page range e.g. "1-5"' },
        ocr: { type: 'boolean', default: false },
      },
      required: ['url'],
    }, null, 2),
  },
  {
    id: 'vector-search',
    name: 'vector_search',
    description: 'Semantic search over embedded document corpus.',
    category: 'search',
    calls: 91_302,
    avgLatency: 180,
    errorRate: 0.3,
    version: 'v3.0.0',
    updated: '2 days ago',
    schema: JSON.stringify({
      type: 'object',
      properties: {
        query: { type: 'string' },
        collection: { type: 'string' },
        top_k: { type: 'integer', default: 5 },
        filter: { type: 'object' },
      },
      required: ['query', 'collection'],
    }, null, 2),
  },
  {
    id: 'query-run',
    name: 'query_run',
    description: 'Executes SQL queries against configured data warehouses.',
    category: 'data',
    calls: 3_204,
    avgLatency: 890,
    errorRate: 4.1,
    version: 'v0.8.1',
    updated: '5 days ago',
    schema: JSON.stringify({
      type: 'object',
      properties: {
        warehouse: { type: 'string', enum: ['snowflake', 'bigquery', 'postgres'] },
        sql: { type: 'string' },
        limit: { type: 'integer', default: 1000 },
      },
      required: ['warehouse', 'sql'],
    }, null, 2),
  },
  {
    id: 'ast-parse',
    name: 'ast_parse',
    description: 'Parses source files into abstract syntax trees.',
    category: 'compute',
    calls: 18_420,
    avgLatency: 95,
    errorRate: 0.5,
    version: 'v2.0.3',
    updated: '1 day ago',
    schema: JSON.stringify({
      type: 'object',
      properties: {
        source: { type: 'string' },
        language: { type: 'string', enum: ['ts', 'py', 'go', 'rs'] },
      },
      required: ['source', 'language'],
    }, null, 2),
  },
  {
    id: 'sentiment',
    name: 'sentiment',
    description: 'Classifies sentiment of text as positive/neutral/negative.',
    category: 'api',
    calls: 52_104,
    avgLatency: 120,
    errorRate: 0.1,
    version: 'v1.2.0',
    updated: '2 weeks ago',
    schema: JSON.stringify({
      type: 'object',
      properties: {
        text: { type: 'string' },
      },
      required: ['text'],
    }, null, 2),
  },
];

export const evals: EvalResult[] = [
  {
    id: 'eval-001',
    name: 'research-synth.accuracy',
    agent: 'Research Synthesizer',
    model: 'claude-opus-4-6',
    status: 'passed',
    score: 94.2,
    passed: 47,
    failed: 3,
    total: 50,
    duration: 342000,
    timestamp: '2 hours ago',
    cases: Array.from({ length: 10 }, (_, i) => ({
      id: `tc-${i + 1}`,
      input: `Summarize paper on ${['transformers', 'diffusion', 'RLHF', 'MoE', 'rope', 'flash-attn', 'GQA', 'SFT', 'PPO', 'DPO'][i]}`,
      expected: 'Structured brief with 4 sections',
      actual: 'Structured brief with 4 sections',
      passed: i !== 3,
      latency: 2800 + i * 180,
      score: i !== 3 ? 0.95 : 0.42,
    })),
  },
  {
    id: 'eval-002',
    name: 'code-review.precision',
    agent: 'Code Review Agent',
    model: 'gpt-5-turbo',
    status: 'regression',
    score: 87.1,
    passed: 87,
    failed: 13,
    total: 100,
    duration: 189000,
    timestamp: '6 hours ago',
    cases: Array.from({ length: 10 }, (_, i) => ({
      id: `tc-${i + 1}`,
      input: `Review diff #${i + 1}`,
      expected: '3 issues found',
      actual: i % 3 === 0 ? '2 issues found' : '3 issues found',
      passed: i % 3 !== 0,
      latency: 1800 + i * 50,
      score: i % 3 !== 0 ? 0.92 : 0.61,
    })),
  },
  {
    id: 'eval-003',
    name: 'support-triage.classification',
    agent: 'Support Triage',
    model: 'claude-sonnet-4-5',
    status: 'passed',
    score: 98.5,
    passed: 197,
    failed: 3,
    total: 200,
    duration: 164000,
    timestamp: '1 day ago',
    cases: Array.from({ length: 10 }, (_, i) => ({
      id: `tc-${i + 1}`,
      input: `Ticket #${i + 1}`,
      expected: 'queue: tech',
      actual: 'queue: tech',
      passed: true,
      latency: 820 + i * 20,
      score: 0.99,
    })),
  },
  {
    id: 'eval-004',
    name: 'sql-analyst.correctness',
    agent: 'SQL Analyst',
    model: 'claude-opus-4-6',
    status: 'failed',
    score: 72.3,
    passed: 29,
    failed: 11,
    total: 40,
    duration: 208000,
    timestamp: '3 days ago',
    cases: Array.from({ length: 10 }, (_, i) => ({
      id: `tc-${i + 1}`,
      input: `NL query #${i + 1}`,
      expected: 'Valid SQL',
      actual: i % 4 === 0 ? 'Invalid SQL' : 'Valid SQL',
      passed: i % 4 !== 0,
      latency: 5200 + i * 400,
      score: i % 4 !== 0 ? 0.88 : 0.31,
    })),
  },
  {
    id: 'eval-005',
    name: 'doc-writer.quality',
    agent: 'Documentation Writer',
    model: 'gpt-5-turbo',
    status: 'running',
    score: 0,
    passed: 18,
    failed: 2,
    total: 30,
    duration: 82000,
    timestamp: 'running',
    cases: [],
  },
];

export const traces: Trace[] = [
  {
    id: 'trc-9f2a3b1c',
    agent: 'Research Synthesizer',
    user: 'kaito@syntax.dev',
    status: 'ok',
    duration: 3420,
    tokens: 2148,
    cost: 0.0421,
    timestamp: '12 min ago',
    input: 'Summarize recent advances in mixture-of-experts architectures',
    output: 'MoE architectures route tokens through specialized expert networks...',
    spans: [
      { id: 's1', name: 'agent.plan', kind: 'agent', start: 0, duration: 280, status: 'ok', depth: 0, tokens: { prompt: 412, completion: 89 } },
      { id: 's2', name: 'web_search', kind: 'tool', start: 280, duration: 420, status: 'ok', depth: 1, input: 'mixture of experts transformers 2024' },
      { id: 's3', name: 'vector_search', kind: 'tool', start: 700, duration: 180, status: 'ok', depth: 1, input: 'MoE routing gate' },
      { id: 's4', name: 'llm.synthesize', kind: 'llm', start: 880, duration: 1840, status: 'ok', depth: 1, tokens: { prompt: 1890, completion: 720 } },
      { id: 's5', name: 'pdf_extract', kind: 'tool', start: 1200, duration: 820, status: 'ok', depth: 2, input: 'arxiv.org/pdf/2401.04088' },
      { id: 's6', name: 'llm.final', kind: 'llm', start: 2720, duration: 700, status: 'ok', depth: 0, tokens: { prompt: 2100, completion: 340 } },
    ],
  },
  {
    id: 'trc-4e8d2a9f',
    agent: 'Code Review Agent',
    user: 'maya@syntax.dev',
    status: 'error',
    duration: 1890,
    tokens: 1240,
    cost: 0.0189,
    timestamp: '28 min ago',
    input: 'Review PR #4821',
    output: 'Error: timeout fetching diff',
    spans: [
      { id: 's1', name: 'agent.plan', kind: 'agent', start: 0, duration: 120, status: 'ok', depth: 0 },
      { id: 's2', name: 'git_diff', kind: 'tool', start: 120, duration: 1500, status: 'error', depth: 1, input: 'PR #4821' },
      { id: 's3', name: 'llm.error', kind: 'llm', start: 1620, duration: 270, status: 'error', depth: 0 },
    ],
  },
  {
    id: 'trc-7c1b5e0d',
    agent: 'Support Triage',
    user: 'priya@syntax.dev',
    status: 'ok',
    duration: 820,
    tokens: 512,
    cost: 0.0042,
    timestamp: '1 hour ago',
    input: 'My dashboard isn\'t loading charts today',
    output: '{ queue: "tech", priority: 3, sentiment: "negative" }',
    spans: [
      { id: 's1', name: 'classify', kind: 'llm', start: 0, duration: 420, status: 'ok', depth: 0, tokens: { prompt: 380, completion: 42 } },
      { id: 's2', name: 'sentiment', kind: 'tool', start: 420, duration: 120, status: 'ok', depth: 1 },
      { id: 's3', name: 'kb_lookup', kind: 'tool', start: 540, duration: 280, status: 'ok', depth: 1 },
    ],
  },
  {
    id: 'trc-3a9f8e2c',
    agent: 'Research Synthesizer',
    user: 'kaito@syntax.dev',
    status: 'ok',
    duration: 4120,
    tokens: 3204,
    cost: 0.0614,
    timestamp: '2 hours ago',
    input: 'Compare RLHF vs DPO training methods',
    output: 'RLHF uses a reward model and PPO while DPO optimizes directly...',
    spans: [
      { id: 's1', name: 'agent.plan', kind: 'agent', start: 0, duration: 320, status: 'ok', depth: 0 },
      { id: 's2', name: 'web_search', kind: 'tool', start: 320, duration: 510, status: 'ok', depth: 1 },
      { id: 's3', name: 'llm.synthesize', kind: 'llm', start: 830, duration: 2890, status: 'ok', depth: 1, tokens: { prompt: 2400, completion: 804 } },
      { id: 's4', name: 'llm.final', kind: 'llm', start: 3720, duration: 400, status: 'ok', depth: 0 },
    ],
  },
];

export const models = [
  'claude-opus-4-6',
  'claude-sonnet-4-5',
  'gpt-5-turbo',
  'gpt-5-mini',
  'gemini-2.5-pro',
  'llama-4-405b',
];
