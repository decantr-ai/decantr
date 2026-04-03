import type { PricingTier, Testimonial, Feature, HowItWorksStep } from './types';

export const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: { monthly: 29, annual: 24 },
    features: [
      '5 agents',
      '10k inferences/mo',
      'Basic monitoring',
      'Email support',
      '1 workspace',
    ],
    recommended: false,
  },
  {
    name: 'Pro',
    price: { monthly: 79, annual: 63 },
    features: [
      '25 agents',
      '100k inferences/mo',
      'Advanced monitoring',
      'Real-time alerts',
      'Priority support',
      '5 workspaces',
      'Custom agent templates',
      'API access',
    ],
    recommended: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: 199, annual: 159 },
    features: [
      'Unlimited agents',
      'Unlimited inferences',
      'Full observability suite',
      'Dedicated support',
      'Unlimited workspaces',
      'Custom models',
      'SSO/SAML',
      'SLA guarantee',
    ],
    recommended: false,
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      'We replaced our entire manual orchestration layer with this platform in under a week. Our agent fleet now handles 10x the throughput with half the operational overhead.',
    author: 'Jessica Dao',
    role: 'VP of Engineering',
    company: 'Meridian AI',
    avatar: 'JD',
  },
  {
    quote:
      'The real-time monitoring alone justified the switch. We can see exactly how each agent is performing, catch anomalies before they cascade, and trace every decision back to its root.',
    author: 'Marcus Chen',
    role: 'Head of ML Infrastructure',
    company: 'Stratos Labs',
    avatar: 'MC',
  },
  {
    quote:
      'Scaling from 3 agents to 200 was seamless. The scheduler handles load balancing automatically and the confidence analytics give us the visibility we never had before.',
    author: 'Priya Sharma',
    role: 'CTO',
    company: 'NeuralPath',
    avatar: 'PS',
  },
  {
    quote:
      'Our compliance team loves the audit trail. Every tool call, every decision, every reasoning step is logged and searchable. It turned agent orchestration from a black box into a glass box.',
    author: 'Tom Eriksson',
    role: 'Director of AI Operations',
    company: 'Veridian Health',
    avatar: 'TE',
  },
  {
    quote:
      'The marketplace changed our approach entirely. Instead of building agents from scratch, we deploy pre-built specialists and customize them for our domain in hours, not weeks.',
    author: 'Amara Obi',
    role: 'Lead Architect',
    company: 'DataForge',
    avatar: 'AO',
  },
  {
    quote:
      'We evaluated five orchestration platforms. This was the only one that handled multi-model routing gracefully. Running GPT-4, Claude, and open-source models side by side with automatic failover is a game changer.',
    author: 'Ryan Kessler',
    role: 'Staff Engineer',
    company: 'Apex Robotics',
    avatar: 'RK',
  },
];

export const features: Feature[] = [
  {
    icon: 'Bot',
    title: 'Agent Orchestration',
    description:
      'Deploy and manage autonomous agent swarms with intelligent task routing, automatic failover, and collaborative multi-agent workflows that scale with your workload.',
  },
  {
    icon: 'Activity',
    title: 'Real-time Monitoring',
    description:
      'Track agent performance, latency, token usage, and error rates across your entire fleet with live dashboards and customizable alerting thresholds.',
  },
  {
    icon: 'Brain',
    title: 'Neural Feedback',
    description:
      'Bio-mimetic visualization of AI processing pipelines that surfaces reasoning chains, decision branches, and confidence distributions in an intuitive neural map.',
  },
  {
    icon: 'Target',
    title: 'Confidence Analytics',
    description:
      'Deep visibility into model confidence scores, calibration curves, and prediction reliability so you can trust automated decisions and catch uncertainty early.',
  },
  {
    icon: 'Shield',
    title: 'Secure Configuration',
    description:
      'Granular control over agent parameters, API keys, model access, and resource limits with role-based permissions and a complete audit trail for every change.',
  },
  {
    icon: 'Store',
    title: 'Marketplace',
    description:
      'Browse and deploy pre-built agents from a curated catalog of specialists covering classification, extraction, summarization, code analysis, and more.',
  },
];

export const howItWorksSteps: HowItWorksStep[] = [
  {
    number: 1,
    title: 'Deploy',
    description:
      'Spin up your first agent in minutes with pre-configured templates or build a custom agent from scratch using our SDK and visual configuration tools.',
  },
  {
    number: 2,
    title: 'Connect',
    description:
      'Link agents into collaborative swarms with declarative routing rules, shared context, and automatic dependency resolution between agent capabilities.',
  },
  {
    number: 3,
    title: 'Monitor',
    description:
      'Real-time observability across your entire fleet with live metrics, event timelines, anomaly detection, and drill-down analysis for every agent interaction.',
  },
  {
    number: 4,
    title: 'Scale',
    description:
      'Expand from one agent to thousands with elastic auto-scaling, intelligent load distribution, and cost-optimized model routing that adapts to demand patterns.',
  },
];
