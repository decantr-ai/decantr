// Mock data for the agent marketplace showcase

export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error' | 'warning';
  type: string;
  model: string;
  confidence: number;
  tokensUsed: number;
  tasksCompleted: number;
  description: string;
  lastActive: string;
  tags: string[];
  category: string;
}

export interface TimelineEvent {
  id: string;
  type: 'action' | 'decision' | 'tool_call' | 'reasoning' | 'error' | 'info';
  title: string;
  description: string;
  timestamp: string;
  agentId: string;
  expanded?: boolean;
}

export interface PricingTier {
  name: string;
  price: number;
  annualPrice: number;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

export const agents: Agent[] = [
  {
    id: 'agent-001',
    name: 'Sentinel-7',
    status: 'active',
    type: 'Monitor',
    model: 'GPT-4o',
    confidence: 0.94,
    tokensUsed: 124800,
    tasksCompleted: 1847,
    description: 'Real-time infrastructure monitoring agent with anomaly detection capabilities.',
    lastActive: '2 min ago',
    tags: ['monitoring', 'infra', 'anomaly'],
    category: 'monitoring',
  },
  {
    id: 'agent-002',
    name: 'Codex-Prime',
    status: 'active',
    type: 'Generator',
    model: 'Claude 3.5',
    confidence: 0.91,
    tokensUsed: 89200,
    tasksCompleted: 923,
    description: 'Code generation and refactoring agent specialized in TypeScript and React.',
    lastActive: '5 min ago',
    tags: ['code-gen', 'typescript', 'react'],
    category: 'generation',
  },
  {
    id: 'agent-003',
    name: 'DataWeaver',
    status: 'idle',
    type: 'Analyzer',
    model: 'GPT-4o',
    confidence: 0.87,
    tokensUsed: 56100,
    tasksCompleted: 412,
    description: 'Data pipeline orchestration and ETL transformation agent.',
    lastActive: '1 hour ago',
    tags: ['data', 'etl', 'pipeline'],
    category: 'analysis',
  },
  {
    id: 'agent-004',
    name: 'Guardian-X',
    status: 'error',
    type: 'Security',
    model: 'Claude 3.5',
    confidence: 0.23,
    tokensUsed: 34500,
    tasksCompleted: 156,
    description: 'Security scanning and vulnerability assessment agent. Currently in error state.',
    lastActive: '30 min ago',
    tags: ['security', 'scanning', 'vuln'],
    category: 'security',
  },
  {
    id: 'agent-005',
    name: 'Orchestron',
    status: 'active',
    type: 'Orchestrator',
    model: 'GPT-4o',
    confidence: 0.96,
    tokensUsed: 201400,
    tasksCompleted: 3201,
    description: 'Multi-agent orchestration and task distribution controller.',
    lastActive: '1 min ago',
    tags: ['orchestration', 'scheduling', 'multi-agent'],
    category: 'orchestration',
  },
  {
    id: 'agent-006',
    name: 'NLP-Nexus',
    status: 'warning',
    type: 'Processor',
    model: 'GPT-4o',
    confidence: 0.72,
    tokensUsed: 67800,
    tasksCompleted: 589,
    description: 'Natural language processing and intent classification agent.',
    lastActive: '15 min ago',
    tags: ['nlp', 'classification', 'intent'],
    category: 'analysis',
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'evt-001',
    type: 'action',
    title: 'Deployed monitoring probe',
    description: 'Sentinel-7 deployed a new monitoring probe to us-east-1 cluster.',
    timestamp: '2 min ago',
    agentId: 'agent-001',
  },
  {
    id: 'evt-002',
    type: 'decision',
    title: 'Escalation threshold reached',
    description: 'CPU utilization exceeded 85% for 5 consecutive minutes. Escalating to orchestrator.',
    timestamp: '5 min ago',
    agentId: 'agent-001',
  },
  {
    id: 'evt-003',
    type: 'tool_call',
    title: 'Invoked code_review tool',
    description: 'Codex-Prime analyzed 47 files across 3 pull requests for type safety violations.',
    timestamp: '12 min ago',
    agentId: 'agent-002',
  },
  {
    id: 'evt-004',
    type: 'error',
    title: 'Authentication failure',
    description: 'Guardian-X failed to authenticate with the vulnerability scanning API. Token expired.',
    timestamp: '30 min ago',
    agentId: 'agent-004',
  },
  {
    id: 'evt-005',
    type: 'reasoning',
    title: 'Task prioritization analysis',
    description: 'Orchestron evaluated 12 pending tasks and determined optimal execution order based on dependency graph.',
    timestamp: '45 min ago',
    agentId: 'agent-005',
  },
  {
    id: 'evt-006',
    type: 'info',
    title: 'Model warm-up complete',
    description: 'NLP-Nexus completed model initialization. Ready for inference requests.',
    timestamp: '1 hour ago',
    agentId: 'agent-006',
  },
  {
    id: 'evt-007',
    type: 'action',
    title: 'Data pipeline triggered',
    description: 'DataWeaver initiated daily ETL pipeline for analytics dataset refresh.',
    timestamp: '1.5 hours ago',
    agentId: 'agent-003',
  },
  {
    id: 'evt-008',
    type: 'decision',
    title: 'Auto-scaling decision',
    description: 'Orchestron decided to scale inference pool from 3 to 5 instances based on queue depth.',
    timestamp: '2 hours ago',
    agentId: 'agent-005',
  },
];

export const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: 29,
    annualPrice: 24,
    description: 'For individual developers experimenting with agent workflows.',
    features: [
      'Up to 3 agents',
      '10K tokens/month',
      'Basic monitoring',
      'Community support',
      'Single workspace',
    ],
    highlighted: false,
    cta: 'Start Free Trial',
  },
  {
    name: 'Pro',
    price: 99,
    annualPrice: 79,
    description: 'For teams building production agent systems.',
    features: [
      'Up to 25 agents',
      '500K tokens/month',
      'Advanced monitoring',
      'Priority support',
      'Team workspaces',
      'Custom integrations',
      'Audit logs',
    ],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: 399,
    annualPrice: 329,
    description: 'For organizations with complex orchestration needs.',
    features: [
      'Unlimited agents',
      'Unlimited tokens',
      'Full observability',
      'Dedicated support',
      'SSO & SAML',
      'Custom SLAs',
      'On-premise option',
      'White-label',
    ],
    highlighted: false,
    cta: 'Contact Sales',
  },
];

export const testimonials: Testimonial[] = [
  {
    quote: 'AgentSwarm reduced our incident response time by 73%. The orchestration layer is unlike anything we\'ve seen.',
    author: 'Sarah Chen',
    role: 'VP Engineering',
    company: 'Meridian Labs',
  },
  {
    quote: 'We went from manually coordinating 8 agents to fully autonomous orchestration in under a week.',
    author: 'Marcus Rodriguez',
    role: 'CTO',
    company: 'Nexus AI',
  },
  {
    quote: 'The transparency dashboard alone justified the investment. We finally understand what our agents are doing.',
    author: 'Aisha Patel',
    role: 'Head of AI Ops',
    company: 'DataForge',
  },
];

export const features = [
  {
    title: 'Swarm Orchestration',
    description: 'Coordinate multi-agent workflows with dependency-aware task scheduling and automatic load balancing.',
    icon: 'Workflow' as const,
  },
  {
    title: 'Real-Time Monitoring',
    description: 'Live dashboards showing agent status, token consumption, and performance metrics across your entire fleet.',
    icon: 'Activity' as const,
  },
  {
    title: 'Neural Feedback Loops',
    description: 'Visualize agent reasoning chains, confidence distributions, and decision pathways in real-time.',
    icon: 'Brain' as const,
  },
  {
    title: 'Agent Marketplace',
    description: 'Discover, deploy, and configure pre-built agents for common workflows from a curated registry.',
    icon: 'Store' as const,
  },
  {
    title: 'Security & Compliance',
    description: 'Enterprise-grade access controls, audit trails, and sandboxed execution environments for every agent.',
    icon: 'Shield' as const,
  },
  {
    title: 'Model Transparency',
    description: 'Full inference logging, confidence tracking, and explainability tools for regulatory compliance.',
    icon: 'Eye' as const,
  },
];

export const howItWorksSteps = [
  {
    step: 1,
    title: 'Deploy Agents',
    description: 'Choose from pre-built agents or create custom ones with our SDK. Deploy to your infrastructure in minutes.',
  },
  {
    step: 2,
    title: 'Configure Swarms',
    description: 'Define orchestration rules, set task dependencies, and establish communication protocols between agents.',
  },
  {
    step: 3,
    title: 'Monitor & Optimize',
    description: 'Track performance in real-time. The system auto-tunes agent parameters based on observed outcomes.',
  },
];

export const marketplaceAgents: Agent[] = [
  ...agents,
  {
    id: 'mkt-001',
    name: 'DocuBot',
    status: 'active',
    type: 'Generator',
    model: 'Claude 3.5',
    confidence: 0.89,
    tokensUsed: 45000,
    tasksCompleted: 780,
    description: 'Automated documentation generation from code analysis and commit history.',
    lastActive: '10 min ago',
    tags: ['docs', 'automation', 'code-analysis'],
    category: 'generation',
  },
  {
    id: 'mkt-002',
    name: 'TestForge',
    status: 'active',
    type: 'Generator',
    model: 'GPT-4o',
    confidence: 0.92,
    tokensUsed: 78400,
    tasksCompleted: 1120,
    description: 'AI-powered test generation with coverage optimization and mutation testing.',
    lastActive: '3 min ago',
    tags: ['testing', 'quality', 'automation'],
    category: 'generation',
  },
  {
    id: 'mkt-003',
    name: 'LogHound',
    status: 'idle',
    type: 'Monitor',
    model: 'GPT-4o',
    confidence: 0.85,
    tokensUsed: 32100,
    tasksCompleted: 290,
    description: 'Intelligent log analysis with pattern detection and anomaly alerting.',
    lastActive: '2 hours ago',
    tags: ['logs', 'monitoring', 'alerting'],
    category: 'monitoring',
  },
];

export const modelMetrics = {
  totalInferences: 284719,
  avgConfidence: 0.87,
  avgLatency: 142,
  errorRate: 0.023,
  tokensProcessed: 12400000,
  activeModels: 4,
};

export const confidenceDistribution = [
  { range: '0.0-0.2', count: 12, color: 'var(--d-error)' },
  { range: '0.2-0.4', count: 34, color: 'var(--d-warning)' },
  { range: '0.4-0.6', count: 89, color: 'var(--d-warning)' },
  { range: '0.6-0.8', count: 234, color: 'var(--d-info)' },
  { range: '0.8-1.0', count: 467, color: 'var(--d-success)' },
];
