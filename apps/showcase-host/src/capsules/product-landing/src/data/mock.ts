import {
  Zap, Shield, BarChart3, Layers, Globe, Cpu,
  Sparkles, Lock, Workflow, Eye, Rocket, Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ── Features ── */
export interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
}

export const FEATURES: Feature[] = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Sub-second load times with edge-optimized delivery and intelligent caching across 200+ PoPs worldwide.', color: '#FDA303' },
  { icon: Shield, title: 'Enterprise Security', desc: 'SOC 2 Type II certified with end-to-end encryption, SSO, and granular role-based access controls.', color: '#0AF3EB' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Live dashboards with conversion funnels, cohort analysis, and AI-powered anomaly detection.', color: '#FE4474' },
  { icon: Layers, title: 'Composable Architecture', desc: 'Modular building blocks that snap together. Swap any component without breaking others.', color: '#00E0AB' },
  { icon: Globe, title: 'Global Scale', desc: 'Deploy to any region with automatic failover, multi-region replication, and 99.99% uptime SLA.', color: '#FC8D0D' },
  { icon: Cpu, title: 'AI-Powered', desc: 'Built-in machine learning models that optimize content, personalize experiences, and predict user intent.', color: '#6500C6' },
];

/* ── Workflow steps ── */
export interface WorkflowStep {
  title: string;
  desc: string;
  icon: LucideIcon;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { title: 'Design', desc: 'Describe your vision and let the system generate a production-ready design specification.', icon: Sparkles },
  { title: 'Build', desc: 'Compose your application from pre-built patterns with full type safety and accessibility.', icon: Workflow },
  { title: 'Launch', desc: 'Deploy globally with one command. Zero-config CDN, SSL, and edge functions included.', icon: Rocket },
  { title: 'Grow', desc: 'Monitor performance, A/B test variants, and iterate based on real user behavior data.', icon: BarChart3 },
];

/* ── Pricing ── */
export interface PricingTier {
  name: string;
  monthly: number;
  annual: number;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Starter',
    monthly: 0,
    annual: 0,
    description: 'Perfect for side projects and experiments.',
    features: ['3 projects', '10k page views/mo', 'Community support', 'Basic analytics', 'Custom domain'],
    highlighted: false,
    cta: 'Get Started Free',
  },
  {
    name: 'Pro',
    monthly: 49,
    annual: 39,
    description: 'For teams shipping production applications.',
    features: ['Unlimited projects', '1M page views/mo', 'Priority support', 'Advanced analytics', 'Custom domains', 'Team collaboration', 'CI/CD integration'],
    highlighted: true,
    cta: 'Start Pro Trial',
  },
  {
    name: 'Enterprise',
    monthly: 199,
    annual: 159,
    description: 'For organizations with advanced requirements.',
    features: ['Unlimited everything', 'Unlimited page views', 'Dedicated support', 'Full observability', 'SSO & SAML', 'SLA guarantee', 'Custom integrations', 'Audit logs'],
    highlighted: false,
    cta: 'Talk to Sales',
  },
];

/* ── Testimonials ── */
export interface Testimonial {
  name: string;
  role: string;
  company: string;
  text: string;
  avatar: string;
}

export const TESTIMONIALS: Testimonial[] = [
  { name: 'Sarah Chen', role: 'CTO', company: 'Hyperforge', text: 'We shipped our entire product redesign in two weeks. The composable architecture let us move faster than we ever imagined.', avatar: 'SC' },
  { name: 'Marcus Rivera', role: 'VP Engineering', company: 'Nexus AI', text: 'The analytics alone paid for the subscription. We saw a 34% increase in conversions after switching.', avatar: 'MR' },
  { name: 'Emily Zhang', role: 'Lead Designer', company: 'Cortex', text: 'Finally a platform that respects design tokens. Every component renders exactly as specified in our design system.', avatar: 'EZ' },
];

/* ── Social proof logos ── */
export const LOGOS = [
  'Hyperforge', 'Nexus AI', 'Cortex', 'DataForge', 'Vertex Labs', 'Arclight',
];

/* ── Blog posts ── */
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  author: string;
}

export const BLOG_POSTS: BlogPost[] = [
  { id: 'composable-architecture', title: 'Why Composable Architecture Wins', excerpt: 'How modular design patterns help teams ship faster while maintaining consistency across products.', date: '2026-03-28', category: 'Architecture', readTime: '6 min', author: 'Sarah Chen' },
  { id: 'design-tokens-at-scale', title: 'Design Tokens at Scale', excerpt: 'A practical guide to managing design tokens across multiple teams and platforms without drift.', date: '2026-03-22', category: 'Design Systems', readTime: '8 min', author: 'Emily Zhang' },
  { id: 'edge-first-performance', title: 'Edge-First Performance', excerpt: 'Moving compute closer to users with edge functions, streaming, and intelligent caching strategies.', date: '2026-03-15', category: 'Performance', readTime: '5 min', author: 'Marcus Rivera' },
  { id: 'ai-powered-ux', title: 'AI-Powered UX: Beyond Chatbots', excerpt: 'How machine learning is transforming user experience design, from personalization to predictive interfaces.', date: '2026-03-08', category: 'AI/ML', readTime: '7 min', author: 'Sarah Chen' },
  { id: 'accessibility-first', title: 'Accessibility-First Development', excerpt: 'Building inclusive products from day one. Patterns, testing strategies, and tools that make a11y easy.', date: '2026-03-01', category: 'Accessibility', readTime: '6 min', author: 'Emily Zhang' },
  { id: 'zero-downtime-deploys', title: 'Zero-Downtime Deployments', excerpt: 'Techniques for shipping updates without interrupting users — blue-green, canary, and rolling strategies.', date: '2026-02-22', category: 'DevOps', readTime: '5 min', author: 'Marcus Rivera' },
];

/* ── Resources ── */
export interface Resource {
  title: string;
  description: string;
  category: string;
  icon: LucideIcon;
  href: string;
}

export const RESOURCES: Resource[] = [
  { title: 'Getting Started Guide', description: 'Set up your first project in under 5 minutes with our step-by-step guide.', category: 'Guide', icon: Rocket, href: '#' },
  { title: 'API Reference', description: 'Complete API documentation with examples, types, and interactive playground.', category: 'Documentation', icon: Cpu, href: '#' },
  { title: 'Design System Kit', description: 'Figma templates, design tokens, and component specs for designers.', category: 'Design', icon: Layers, href: '#' },
  { title: 'Security Whitepaper', description: 'Detailed overview of our security architecture, compliance, and data handling.', category: 'Security', icon: Lock, href: '#' },
  { title: 'Migration Playbook', description: 'Step-by-step playbook for migrating from legacy systems with zero downtime.', category: 'Guide', icon: Workflow, href: '#' },
  { title: 'Community Forum', description: 'Connect with other developers, share patterns, and get help from the community.', category: 'Community', icon: Users, href: '#' },
  { title: 'Video Tutorials', description: 'Hands-on video walkthroughs covering setup, advanced patterns, and best practices.', category: 'Learning', icon: Eye, href: '#' },
  { title: 'Changelog', description: 'Stay up to date with every release, improvement, and new feature.', category: 'Updates', icon: Sparkles, href: '#' },
];
