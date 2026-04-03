export type AgentStatus = 'active' | 'idle' | 'error' | 'processing';

export type EventType = 'action' | 'decision' | 'error' | 'tool_call' | 'reasoning' | 'warning';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  model: string;
  tasks: number;
  connections: string[];
  metrics: {
    requests: number;
    latency: number;
    tokens: number;
    uptime: number;
  };
}

export interface TimelineEvent {
  id: string;
  agentId: string;
  type: EventType;
  summary: string;
  detail: string;
  timestamp: number;
  duration?: number;
}

export interface MetricSnapshot {
  label: string;
  value: number;
  unit: string;
  trend: number;
  history: number[];
}

export interface PricingTier {
  name: string;
  price: { monthly: number; annual: number };
  features: string[];
  recommended: boolean;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface HowItWorksStep {
  number: number;
  title: string;
  description: string;
}
