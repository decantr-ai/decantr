import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  Bot,
  Brain,
  CheckCircle2,
  Clock3,
  Code2,
  Cpu,
  Database,
  Eye,
  GitBranch,
  Globe,
  Layers3,
  Lock,
  Search,
  Settings2,
  Shield,
  Sparkles,
  Store,
  Target,
  UserRound,
  Wrench,
  Zap,
} from 'lucide-react';

export type AgentStatus = 'active' | 'processing' | 'error' | 'idle';
export type TimelineType = 'action' | 'decision' | 'error' | 'tool_call' | 'reasoning' | 'info';
export type IntentCategory = 'action' | 'tool' | 'decision';

export interface AppCommand {
  label: string;
  route: string;
  description: string;
  icon: LucideIcon;
  shortcut?: string;
  requiresAuth?: boolean;
}

export interface TimelineEvent {
  id: string;
  type: TimelineType;
  summary: string;
  timestamp: string;
  detail?: string;
}

export interface StatItem {
  label: string;
  value: number;
  valueText?: string;
  format?: (value: number) => string;
  trend?: number;
  icon?: LucideIcon;
  tone?: 'accent' | 'primary' | 'success' | 'warning';
}

export interface AgentNode {
  id: string;
  name: string;
  model: string;
  status: AgentStatus;
  requests: number;
  latency: number;
  zone: string;
  x: number;
  y: number;
}

export interface MarketplaceAgent {
  id: string;
  name: string;
  author: string;
  category: string;
  description: string;
  badge?: string | null;
  installs: number;
  rating: number;
  icon: LucideIcon;
  prompt: string;
}

export interface IntentVector {
  label: string;
  confidence: number;
  category: IntentCategory;
  angle: number;
}

export const appCommands: AppCommand[] = [
  { label: 'Home', route: '/', description: 'Return to the public landing page.', icon: Zap },
  { label: 'Log In', route: '/login', description: 'Enter the gateway flow and sign into the workspace.', icon: Lock },
  { label: 'Register', route: '/register', description: 'Create a new operator account and deploy your first agent.', icon: UserRound },
  { label: 'Go to Agents', route: '/agents', description: 'Open the live swarm workspace.', icon: Bot, shortcut: 'G A', requiresAuth: true },
  { label: 'Go to Marketplace', route: '/marketplace', description: 'Browse deployable agent templates.', icon: Store, shortcut: 'G M', requiresAuth: true },
  { label: 'Go to Transparency', route: '/transparency', description: 'Inspect model observability and confidence surfaces.', icon: Eye, shortcut: 'G T', requiresAuth: true },
  { label: 'Inference Log', route: '/transparency/inference', description: 'Trace individual inference events and tool calls.', icon: Activity, requiresAuth: true },
  { label: 'Confidence Explorer', route: '/transparency/confidence', description: 'View intent confidence distribution and breakdowns.', icon: Target, requiresAuth: true },
  { label: 'Agent Configuration', route: '/agents/config', description: 'Tune models, retries, webhooks, and guard rails.', icon: Settings2, requiresAuth: true },
];

export const marketingFeatures = [
  {
    title: 'Autonomous agents',
    description: 'Deploy self-managing operators that can plan, act, observe, and recover without constant manual supervision.',
    icon: Bot,
  },
  {
    title: 'Swarm orchestration',
    description: 'Coordinate specialized agents through a live topology that makes ownership, latency, and handoffs immediately legible.',
    icon: GitBranch,
  },
  {
    title: 'Operational guard rails',
    description: 'Apply retry limits, escalation rules, and rate controls so experiments stay safe as they move into production traffic.',
    icon: Shield,
  },
  {
    title: 'Full transparency',
    description: 'Inspect confidence, reasoning, tool calls, and inference traces from the same workspace your operators use every day.',
    icon: Eye,
  },
  {
    title: 'Shared templates',
    description: 'Start from curated marketplace agents for research, code, security, and data workflows instead of rebuilding common loops.',
    icon: Layers3,
  },
  {
    title: 'High-signal analytics',
    description: 'Surface the few metrics that change decisions quickly, rather than surrounding the operator with decorative telemetry.',
    icon: BarChart3,
  },
];

export const marketingSteps = [
  {
    title: 'Configure',
    description: 'Choose your model, safety rules, and integration footprint before any live traffic reaches the swarm.',
  },
  {
    title: 'Deploy',
    description: 'Launch a curated template or a custom agent from the marketplace into the active workspace in one step.',
  },
  {
    title: 'Observe',
    description: 'Watch the topology, event stream, and model telemetry update together as requests move between agents.',
  },
  {
    title: 'Refine',
    description: 'Tighten prompts, reliability settings, and thresholds using real operational evidence instead of hunches.',
  },
];

export const pricingPlans = [
  {
    name: 'Starter',
    monthly: 29,
    annual: 23,
    description: 'For small operator teams validating their first production agents.',
    features: ['5 active agents', '10k requests / month', 'Core swarm canvas', 'Marketplace access', 'Email alerts'],
  },
  {
    name: 'Pro',
    monthly: 99,
    annual: 79,
    description: 'For teams running multiple swarms with observability and template reuse.',
    badge: 'Most adopted',
    features: ['25 active agents', '100k requests / month', 'Confidence explorer', 'Inference log retention', 'Priority support', 'Webhook fanout'],
  },
  {
    name: 'Enterprise',
    monthly: 299,
    annual: 239,
    description: 'For organizations that need policy control, large fleets, and dedicated support.',
    features: ['Unlimited agents', 'Unlimited requests', 'Dedicated environments', 'Advanced guard rails', 'SAML + SCIM', 'Joint incident review'],
  },
];

export const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CTO, DataForge',
    avatar: 'SC',
    quote: 'The swarm view changed how we operate. It makes ownership and failure modes obvious before they become incidents.',
  },
  {
    name: 'Marcus Rivera',
    role: 'ML Lead, Nexus AI',
    avatar: 'MR',
    quote: 'The transparency workflow is the first observability surface that feels designed for actual model operators instead of generic dashboards.',
  },
  {
    name: 'Emily Zhang',
    role: 'VP Engineering, Cortex',
    avatar: 'EZ',
    quote: 'We moved from brittle scripts to a reusable agent marketplace in weeks. The system feels authored, not improvised.',
  },
];

export const heroProof = [
  { label: 'Live operator workspaces', value: '4 fleets' },
  { label: 'Median model latency', value: '142 ms' },
  { label: 'Inference trace retention', value: '30 days' },
  { label: 'Confidence checks per hour', value: '18.2k' },
];

export const agentNodes: AgentNode[] = [
  { id: 'agent-001', name: 'DataCrawler', model: 'gpt-4o', status: 'active', requests: 142, latency: 120, zone: 'Ingress', x: 72, y: 196 },
  { id: 'agent-002', name: 'Summarizer', model: 'claude-3-sonnet', status: 'active', requests: 89, latency: 340, zone: 'Synthesis', x: 332, y: 88 },
  { id: 'agent-003', name: 'CodeReviewer', model: 'gpt-4o', status: 'processing', requests: 56, latency: 890, zone: 'Quality', x: 332, y: 314 },
  { id: 'agent-005', name: 'Dispatcher', model: 'claude-3-opus', status: 'idle', requests: 0, latency: 0, zone: 'Routing', x: 624, y: 196 },
  { id: 'agent-004', name: 'Sentinel', model: 'mistral-large', status: 'error', requests: 12, latency: 2100, zone: 'Guard', x: 884, y: 196 },
];

export const agentConnections = [
  ['agent-001', 'agent-002'],
  ['agent-001', 'agent-003'],
  ['agent-002', 'agent-005'],
  ['agent-003', 'agent-005'],
  ['agent-005', 'agent-004'],
] as const;

export const overviewEvents: TimelineEvent[] = [
  { id: '1', type: 'action', summary: 'DataCrawler started a new batch crawl for 500 queued URLs.', timestamp: '14:23:01', detail: 'Batch ID: batch_7f3a2. Priority: high. Queue shard: production-ingress.' },
  { id: '2', type: 'decision', summary: 'Summarizer selected structured extraction for the active content family.', timestamp: '14:23:12', detail: 'Confidence: 0.94. Alternative path: raw text extraction (0.72).' },
  { id: '3', type: 'tool_call', summary: 'CodeReviewer invoked the lint and static analysis pipeline.', timestamp: '14:23:15', detail: 'eslint --fix applied to 12 files. 3 warnings resolved, 0 errors remaining.' },
  { id: '4', type: 'error', summary: 'Sentinel hit an upstream rate limit and opened a circuit-breaker recommendation.', timestamp: '14:23:18', detail: 'Error: 429 Too Many Requests. Retry-after: 30s. Escalation path prepared.' },
  { id: '5', type: 'reasoning', summary: 'Dispatcher re-ranked the queue after a reliability degradation signal.', timestamp: '14:23:22', detail: 'Urgency: 0.7. Complexity: 0.3. Priority was raised for blocked customer workflows.' },
  { id: '6', type: 'info', summary: 'Control plane checkpoint saved after 142 completed tasks.', timestamp: '14:23:35' },
];

export const agentDetailEvents: TimelineEvent[] = [
  { id: 'd1', type: 'action', summary: 'Initiated a fresh crawl batch for a regulated data source.', timestamp: '15:01:02', detail: 'Request ID: req_8a2f3. Origin: regulated-ingress. Retry profile: strict.' },
  { id: 'd2', type: 'tool_call', summary: 'HTTP client fetched the current source page and metadata bundle.', timestamp: '15:01:04', detail: 'Response: 200 OK. Duration: 340ms. Payload size: 12.4KB.' },
  { id: 'd3', type: 'reasoning', summary: 'Evaluated extraction strategy against content shape and error history.', timestamp: '15:01:05', detail: 'Structured data and repeatable selectors detected. Regex fallback rejected for stability reasons.' },
  { id: 'd4', type: 'decision', summary: 'Selected structured extraction mode over raw ingestion.', timestamp: '15:01:06', detail: 'Confidence: 0.94. Alternative confidence: 0.72. Drift risk reduced by 18%.' },
  { id: 'd5', type: 'action', summary: 'Persisted 47 normalized records into the destination result set.', timestamp: '15:01:12', detail: 'Table: crawl_results. Rows inserted: 47. Duration: 89ms.' },
  { id: 'd6', type: 'error', summary: 'Encountered a DNS resolution failure on a secondary source.', timestamp: '15:01:18', detail: 'Error: ENOTFOUND for https://api.defunct-service.io/v2. Fallback resolver initiated.' },
];

export const marketplaceAgents: MarketplaceAgent[] = [
  {
    id: 'market-data-crawler',
    name: 'DataCrawler Pro',
    author: 'agentops',
    category: 'Data',
    description: 'High-throughput crawl and extraction agent with route-aware rate limiting, schema normalization, and checkpoint recovery.',
    badge: 'Featured',
    installs: 1240,
    rating: 4.9,
    icon: Database,
    prompt: 'Scrape product pricing pages, normalize schema, and raise an alert on structural drift.',
  },
  {
    id: 'market-code-review',
    name: 'CodeReview Agent',
    author: 'devtools-ai',
    category: 'Code',
    description: 'Reviews pull requests with style, correctness, and risk summaries built for real engineering workflows.',
    installs: 980,
    rating: 4.8,
    icon: Code2,
    prompt: 'Review a branch for regressions, explain the likely impact, and suggest the highest-value tests.',
  },
  {
    id: 'market-sentinel',
    name: 'Sentinel Guard',
    author: 'sec-ai',
    category: 'Security',
    description: 'Monitors request paths, policy violations, and incident thresholds across internal and public APIs.',
    badge: 'Popular',
    installs: 2100,
    rating: 4.9,
    icon: Shield,
    prompt: 'Inspect the live request stream, detect abuse patterns, and escalate only when thresholds are crossed.',
  },
  {
    id: 'market-research',
    name: 'ResearchBot',
    author: 'lab-ai',
    category: 'Research',
    description: 'Aggregates primary sources, summarizes findings, and keeps citations attached to every response.',
    installs: 650,
    rating: 4.7,
    icon: Sparkles,
    prompt: 'Research the competitive landscape, summarize the strongest signals, and preserve source-level evidence.',
  },
  {
    id: 'market-api-mapper',
    name: 'APIMapper',
    author: 'integration-lab',
    category: 'Automation',
    description: 'Discovers endpoints, drafts structured docs, and validates integration assumptions against live responses.',
    installs: 520,
    rating: 4.6,
    icon: Globe,
    prompt: 'Read an OpenAPI spec, verify key endpoints against staging, and summarize authentication requirements.',
  },
  {
    id: 'market-classifier',
    name: 'Classifier Chain',
    author: 'agentops',
    category: 'Research',
    description: 'Routes incoming tasks into confidence-scored classes and logs the decision path for auditability.',
    badge: 'New',
    installs: 430,
    rating: 4.8,
    icon: Brain,
    prompt: 'Classify support tickets, assign workflow owners, and show the ranked reasons behind each decision.',
  },
];

export const marketplaceCategories = ['All', 'Data', 'Code', 'Security', 'Research', 'Automation'] as const;

export const overviewStats: StatItem[] = [
  { label: 'Active agents', value: 4, icon: Bot, tone: 'accent', trend: 1.8 },
  { label: 'Requests today', value: 28460, format: (value) => `${(value / 1000).toFixed(1)}k`, icon: Activity, tone: 'primary', trend: 6.1 },
  { label: 'Mean latency', value: 142, format: (value) => `${value}ms`, icon: Clock3, tone: 'warning', trend: -3.2 },
  { label: 'Guard rail passes', value: 96, format: (value) => `${value}%`, icon: CheckCircle2, tone: 'success', trend: 0.5 },
];

export const modelOverviewStats: StatItem[] = [
  { label: 'Total inferences', value: 284600, format: (value) => `${(value / 1000).toFixed(1)}k`, trend: 12.4, icon: Zap, tone: 'accent' },
  { label: 'Average latency', value: 142, format: (value) => `${value}ms`, trend: -3.2, icon: Clock3, tone: 'warning' },
  { label: 'Active models', value: 7, trend: 2.0, icon: Cpu, tone: 'primary' },
  { label: 'Accuracy score', value: 96, format: (value) => `${value}%`, trend: 0.8, icon: BarChart3, tone: 'success' },
];

export const deployedModels = [
  { model: 'gpt-4o', provider: 'OpenAI', requests: '45.2k', latency: '120ms', status: 'active' as AgentStatus },
  { model: 'claude-3-opus', provider: 'Anthropic', requests: '28.1k', latency: '340ms', status: 'active' as AgentStatus },
  { model: 'claude-3-sonnet', provider: 'Anthropic', requests: '12.8k', latency: '180ms', status: 'active' as AgentStatus },
  { model: 'mistral-large', provider: 'Mistral', requests: '8.4k', latency: '95ms', status: 'active' as AgentStatus },
  { model: 'gpt-4o-mini', provider: 'OpenAI', requests: '67.3k', latency: '45ms', status: 'active' as AgentStatus },
  { model: 'llama-3-70b', provider: 'Meta', requests: '3.1k', latency: '210ms', status: 'idle' as AgentStatus },
  { model: 'gemini-pro', provider: 'Google', requests: '0', latency: '--', status: 'error' as AgentStatus },
];

export const inferenceEvents: TimelineEvent[] = [
  { id: 'i1', type: 'action', summary: 'Inference request received for gpt-4o.', timestamp: '15:01:02', detail: 'Input tokens: 1240. Temperature: 0.7. Request ID: req_8a2f3.' },
  { id: 'i2', type: 'reasoning', summary: 'Token budget and context utilization evaluated.', timestamp: '15:01:03', detail: 'Remaining budget: 2856 tokens. Window utilization: 30.3%.' },
  { id: 'i3', type: 'tool_call', summary: 'Tool call executed against the internal search database.', timestamp: '15:01:04', detail: 'Duration: 45ms. Results: 12 rows. Cached: false.' },
  { id: 'i4', type: 'decision', summary: 'Selected retrieval-augmented response strategy.', timestamp: '15:01:05', detail: 'Confidence: 0.91. Direct answer fallback was rejected.' },
  { id: 'i5', type: 'action', summary: 'Generated response and persisted trace artifacts.', timestamp: '15:01:08', detail: 'Output tokens: 342. Cost: $0.0047. Finish reason: stop.' },
  { id: 'i6', type: 'error', summary: 'Rate limit warning tripped at 82 requests per minute.', timestamp: '15:01:20', detail: 'Throttling recommendation emitted with an auto-recovery timer of 5 minutes.' },
];

export const confidenceVectors: IntentVector[] = [
  { label: 'Data extraction', confidence: 92, category: 'action', angle: 28 },
  { label: 'Summarization', confidence: 87, category: 'action', angle: 74 },
  { label: 'Code generation', confidence: 78, category: 'tool', angle: 118 },
  { label: 'Classification', confidence: 95, category: 'decision', angle: 160 },
  { label: 'Translation', confidence: 64, category: 'action', angle: 206 },
  { label: 'Reasoning', confidence: 88, category: 'decision', angle: 248 },
  { label: 'Search', confidence: 71, category: 'tool', angle: 300 },
  { label: 'Analysis', confidence: 83, category: 'decision', angle: 338 },
];

export const confidenceStats: StatItem[] = [
  { label: 'Average confidence', value: 82, format: (value) => `${value}%`, trend: 3.1, icon: Target, tone: 'accent' },
  { label: 'Intent families', value: 8, trend: 0.4, icon: Cpu, tone: 'primary' },
  { label: 'Strongest category', value: 95, valueText: 'Classification', icon: BarChart3, tone: 'success' },
  { label: 'Decisions / min', value: 24, trend: 5.2, icon: Clock3, tone: 'warning' },
];

export const agentFeedbackMetrics = [
  { label: 'Confidence', value: 94, unit: '%', trend: 2.3, status: 'active' as const },
  { label: 'Token rate', value: 340, maxValue: 500, unit: '/s', trend: -1.2, status: 'processing' as const },
  { label: 'Accuracy', value: 97, unit: '%', trend: 0.5, status: 'active' as const },
];

export const modelFeedbackMetrics = [
  { label: 'Confidence', value: 94, unit: '%', trend: 2.3, status: 'active' as const },
  { label: 'Throughput', value: 780, maxValue: 1000, unit: '/s', trend: 5.1, status: 'processing' as const },
  { label: 'Error rate', value: 3, maxValue: 100, unit: '%', trend: -0.5, status: 'idle' as const },
];

export const configurationTabs = [
  { id: 'model', label: 'Model settings' },
  { id: 'reliability', label: 'Reliability' },
  { id: 'integrations', label: 'Integrations' },
] as const;
