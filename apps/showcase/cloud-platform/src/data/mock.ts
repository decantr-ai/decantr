/* ── Mock Data: Cloud Platform ── */

export interface CloudApp {
  id: string;
  name: string;
  framework: string;
  status: 'healthy' | 'degraded' | 'incident' | 'deploying';
  region: string;
  url: string;
  lastDeploy: string;
  branch: string;
  requests24h: number;
  errors24h: number;
  p99Latency: number;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  lastActive: string;
  projects: number;
}

export interface ActivityEvent {
  id: string;
  user: string;
  userAvatar: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'deploy' | 'config' | 'team' | 'billing' | 'incident' | 'security';
}

export interface CloudService {
  id: string;
  name: string;
  type: 'compute' | 'database' | 'storage' | 'cdn' | 'dns' | 'auth' | 'queue' | 'cache';
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  uptime: number;
  latency: number;
  dependsOn: string[];
}

export interface ApiToken {
  id: string;
  name: string;
  prefix: string;
  scope: string[];
  createdAt: string;
  lastUsed: string;
  expiresAt: string;
  createdBy: string;
}

export interface UsageMetric {
  label: string;
  value: number;
  limit: number;
  unit: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
  requestId?: string;
}

export interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  category: 'security' | 'data' | 'access' | 'audit' | 'encryption';
  status: 'passed' | 'failed' | 'pending' | 'na';
  lastChecked: string;
}

export interface BillingKpi {
  label: string;
  value: string;
  change: number;
  icon: string;
}

export interface PricingTier {
  name: string;
  price: number;
  period: string;
  recommended: boolean;
  features: string[];
  cta: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
}

export interface StatusService {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  uptime: number;
  incidents: number;
  lastIncident: string;
}

export interface ChartData {
  label: string;
  values: number[];
  color: string;
}

/* ── Apps ── */

export const cloudApps: CloudApp[] = [
  { id: 'app-1', name: 'acme-web', framework: 'Next.js', status: 'healthy', region: 'us-east-1', url: 'acme-web.vercel.app', lastDeploy: '3m ago', branch: 'main', requests24h: 284100, errors24h: 12, p99Latency: 142 },
  { id: 'app-2', name: 'acme-api', framework: 'Hono', status: 'healthy', region: 'us-east-1', url: 'api.acmecorp.io', lastDeploy: '1h ago', branch: 'main', requests24h: 1240000, errors24h: 48, p99Latency: 89 },
  { id: 'app-3', name: 'dashboard-v2', framework: 'Vite + React', status: 'deploying', region: 'eu-west-1', url: 'dash.acmecorp.io', lastDeploy: 'deploying...', branch: 'feat/charts', requests24h: 42300, errors24h: 3, p99Latency: 210 },
  { id: 'app-4', name: 'docs-site', framework: 'Astro', status: 'healthy', region: 'us-west-2', url: 'docs.acmecorp.io', lastDeploy: '2d ago', branch: 'main', requests24h: 18700, errors24h: 0, p99Latency: 65 },
  { id: 'app-5', name: 'auth-service', framework: 'Express', status: 'degraded', region: 'us-east-1', url: 'auth.acmecorp.io', lastDeploy: '6h ago', branch: 'hotfix/rate-limit', requests24h: 890000, errors24h: 234, p99Latency: 312 },
  { id: 'app-6', name: 'webhook-relay', framework: 'Cloudflare Workers', status: 'healthy', region: 'global', url: 'hooks.acmecorp.io', lastDeploy: '5h ago', branch: 'main', requests24h: 2100000, errors24h: 7, p99Latency: 23 },
];

/* ── Team ── */

export const teamMembers: TeamMember[] = [
  { id: 'tm-1', name: 'Sarah Chen', avatar: 'SC', email: 'sarah@acmecorp.io', role: 'owner', lastActive: '2m ago', projects: 6 },
  { id: 'tm-2', name: 'Marcus Johnson', avatar: 'MJ', email: 'marcus@acmecorp.io', role: 'admin', lastActive: '15m ago', projects: 4 },
  { id: 'tm-3', name: 'Aisha Patel', avatar: 'AP', email: 'aisha@acmecorp.io', role: 'developer', lastActive: '1h ago', projects: 3 },
  { id: 'tm-4', name: 'James Wilson', avatar: 'JW', email: 'james@acmecorp.io', role: 'developer', lastActive: '3h ago', projects: 2 },
  { id: 'tm-5', name: 'Lin Wei', avatar: 'LW', email: 'lin@acmecorp.io', role: 'developer', lastActive: '1d ago', projects: 5 },
  { id: 'tm-6', name: 'David Kim', avatar: 'DK', email: 'david@acmecorp.io', role: 'viewer', lastActive: '2d ago', projects: 1 },
];

/* ── Activity ── */

export const activityFeed: ActivityEvent[] = [
  { id: 'ev-1', user: 'Sarah Chen', userAvatar: 'SC', action: 'deployed', target: 'acme-web@v3.14.2 to production', timestamp: '3m ago', type: 'deploy' },
  { id: 'ev-2', user: 'Marcus Johnson', userAvatar: 'MJ', action: 'updated env variable', target: 'DATABASE_URL on acme-api', timestamp: '18m ago', type: 'config' },
  { id: 'ev-3', user: 'Aisha Patel', userAvatar: 'AP', action: 'created branch deploy', target: 'dashboard-v2 feat/charts', timestamp: '45m ago', type: 'deploy' },
  { id: 'ev-4', user: 'System', userAvatar: 'SY', action: 'auto-scaled', target: 'acme-api from 3 to 8 instances', timestamp: '1h ago', type: 'config' },
  { id: 'ev-5', user: 'Sarah Chen', userAvatar: 'SC', action: 'invited', target: 'David Kim as viewer', timestamp: '2h ago', type: 'team' },
  { id: 'ev-6', user: 'System', userAvatar: 'SY', action: 'detected elevated error rate', target: 'auth-service (5xx > threshold)', timestamp: '3h ago', type: 'incident' },
  { id: 'ev-7', user: 'James Wilson', userAvatar: 'JW', action: 'rotated API token', target: 'ci-deploy-token', timestamp: '4h ago', type: 'security' },
  { id: 'ev-8', user: 'Lin Wei', userAvatar: 'LW', action: 'deployed', target: 'webhook-relay@v1.8.0 to production', timestamp: '5h ago', type: 'deploy' },
  { id: 'ev-9', user: 'Marcus Johnson', userAvatar: 'MJ', action: 'upgraded plan', target: 'Pro to Enterprise', timestamp: '1d ago', type: 'billing' },
  { id: 'ev-10', user: 'Aisha Patel', userAvatar: 'AP', action: 'deployed', target: 'docs-site@v2.1.0 to production', timestamp: '2d ago', type: 'deploy' },
];

/* ── Services ── */

export const cloudServices: CloudService[] = [
  { id: 'svc-1', name: 'Compute Engine', type: 'compute', status: 'operational', uptime: 99.99, latency: 45, dependsOn: [] },
  { id: 'svc-2', name: 'PostgreSQL', type: 'database', status: 'operational', uptime: 99.98, latency: 12, dependsOn: ['svc-1'] },
  { id: 'svc-3', name: 'Object Storage', type: 'storage', status: 'operational', uptime: 99.999, latency: 28, dependsOn: [] },
  { id: 'svc-4', name: 'Edge CDN', type: 'cdn', status: 'operational', uptime: 99.99, latency: 8, dependsOn: ['svc-3'] },
  { id: 'svc-5', name: 'DNS', type: 'dns', status: 'operational', uptime: 100.0, latency: 3, dependsOn: [] },
  { id: 'svc-6', name: 'Auth Gateway', type: 'auth', status: 'degraded', uptime: 99.91, latency: 156, dependsOn: ['svc-2', 'svc-7'] },
  { id: 'svc-7', name: 'Redis Cache', type: 'cache', status: 'operational', uptime: 99.97, latency: 2, dependsOn: ['svc-1'] },
  { id: 'svc-8', name: 'Message Queue', type: 'queue', status: 'operational', uptime: 99.96, latency: 18, dependsOn: ['svc-1'] },
];

/* ── Tokens ── */

export const apiTokens: ApiToken[] = [
  { id: 'tk-1', name: 'ci-deploy-token', prefix: 'dct_7f3a', scope: ['deploy:write', 'env:read'], createdAt: '2025-11-01', lastUsed: '3m ago', expiresAt: '2026-05-01', createdBy: 'Sarah Chen' },
  { id: 'tk-2', name: 'monitoring-read', prefix: 'dct_9b1e', scope: ['metrics:read', 'logs:read'], createdAt: '2025-10-15', lastUsed: '1h ago', expiresAt: '2026-04-15', createdBy: 'Marcus Johnson' },
  { id: 'tk-3', name: 'github-integration', prefix: 'dct_2c8d', scope: ['deploy:write', 'webhook:write'], createdAt: '2025-09-20', lastUsed: '45m ago', expiresAt: '2026-03-20', createdBy: 'Sarah Chen' },
  { id: 'tk-4', name: 'staging-full-access', prefix: 'dct_4e6f', scope: ['*'], createdAt: '2025-12-01', lastUsed: '2d ago', expiresAt: '2026-06-01', createdBy: 'Aisha Patel' },
  { id: 'tk-5', name: 'analytics-export', prefix: 'dct_1a3b', scope: ['analytics:read', 'export:write'], createdAt: '2025-08-10', lastUsed: '5d ago', expiresAt: '2026-02-10', createdBy: 'Lin Wei' },
];

/* ── Usage ── */

export const usageMetrics: UsageMetric[] = [
  { label: 'Compute Hours', value: 847, limit: 1000, unit: 'hrs' },
  { label: 'Bandwidth', value: 342, limit: 500, unit: 'GB' },
  { label: 'Function Invocations', value: 4.2, limit: 10, unit: 'M' },
  { label: 'Storage', value: 18.4, limit: 50, unit: 'GB' },
  { label: 'Build Minutes', value: 1240, limit: 2000, unit: 'min' },
  { label: 'Concurrent Builds', value: 3, limit: 5, unit: '' },
];

export const usageCharts: { title: string; type: string; data: ChartData[] }[] = [
  {
    title: 'Requests (7d)',
    type: 'area',
    data: [
      { label: 'Successful', values: [12400, 13200, 11800, 14500, 13900, 15200, 14800], color: 'var(--d-success)' },
      { label: 'Failed', values: [45, 32, 67, 28, 41, 53, 38], color: 'var(--d-error)' },
    ],
  },
  {
    title: 'Latency p99 (7d)',
    type: 'line',
    data: [
      { label: 'p99', values: [142, 138, 156, 131, 148, 139, 144], color: 'var(--d-primary)' },
      { label: 'p50', values: [45, 42, 48, 40, 46, 43, 44], color: 'var(--d-accent)' },
    ],
  },
  {
    title: 'Bandwidth (7d)',
    type: 'bar',
    data: [
      { label: 'Egress', values: [48, 52, 45, 58, 54, 61, 56], color: 'var(--d-primary)' },
    ],
  },
  {
    title: 'Error Rate (7d)',
    type: 'line',
    data: [
      { label: 'Error %', values: [0.36, 0.24, 0.57, 0.19, 0.30, 0.35, 0.26], color: 'var(--d-error)' },
    ],
  },
];

/* ── Logs ── */

export const logEntries: LogEntry[] = [
  { id: 'l-1', timestamp: '14:32:01.234', level: 'info', message: 'Request completed 200 GET /api/users (142ms)', source: 'acme-api', requestId: 'req_7f3a8b1e' },
  { id: 'l-2', timestamp: '14:32:00.891', level: 'info', message: 'Cache HIT for key user:session:u1', source: 'redis-cache' },
  { id: 'l-3', timestamp: '14:31:59.445', level: 'warn', message: 'Rate limit approaching: 847/1000 requests in window', source: 'auth-service', requestId: 'req_2c8d4e6f' },
  { id: 'l-4', timestamp: '14:31:58.102', level: 'error', message: 'Connection timeout after 30000ms to PostgreSQL primary', source: 'db-pool', requestId: 'req_9b1e3c5d' },
  { id: 'l-5', timestamp: '14:31:57.778', level: 'info', message: 'Deploy webhook received for acme-web@v3.14.2', source: 'webhook-relay' },
  { id: 'l-6', timestamp: '14:31:56.334', level: 'debug', message: 'DNS resolution for api.acmecorp.io: 3.2ms', source: 'dns-resolver' },
  { id: 'l-7', timestamp: '14:31:55.091', level: 'info', message: 'Build completed in 48.2s — output: 2.4MB', source: 'build-service' },
  { id: 'l-8', timestamp: '14:31:54.667', level: 'warn', message: 'SSL certificate for *.acmecorp.io expires in 14 days', source: 'cert-manager' },
  { id: 'l-9', timestamp: '14:31:53.220', level: 'info', message: 'Auto-scale triggered: 3 → 5 instances (CPU > 75%)', source: 'compute-engine' },
  { id: 'l-10', timestamp: '14:31:52.890', level: 'error', message: 'Failed to process webhook: payload too large (5.2MB > 1MB limit)', source: 'webhook-relay', requestId: 'req_4e6f1a3b' },
  { id: 'l-11', timestamp: '14:31:51.445', level: 'info', message: 'Metrics flush: 12,847 datapoints written', source: 'metrics-collector' },
  { id: 'l-12', timestamp: '14:31:50.102', level: 'info', message: 'CDN cache purge completed for zone acmecorp.io', source: 'edge-cdn' },
];

/* ── Compliance ── */

export const complianceItems: ComplianceItem[] = [
  { id: 'c-1', title: 'TLS 1.3 Enforcement', description: 'All endpoints require TLS 1.3 minimum', category: 'encryption', status: 'passed', lastChecked: '1h ago' },
  { id: 'c-2', title: 'MFA for Admin Accounts', description: 'Multi-factor authentication enabled for all admin roles', category: 'access', status: 'passed', lastChecked: '1h ago' },
  { id: 'c-3', title: 'Data Retention Policy', description: 'Logs and analytics data retained for 90 days max', category: 'data', status: 'passed', lastChecked: '2h ago' },
  { id: 'c-4', title: 'API Token Rotation', description: 'All tokens rotated within 180-day window', category: 'security', status: 'failed', lastChecked: '1h ago' },
  { id: 'c-5', title: 'Audit Log Completeness', description: 'All administrative actions logged with actor and timestamp', category: 'audit', status: 'passed', lastChecked: '30m ago' },
  { id: 'c-6', title: 'Encryption at Rest', description: 'All stored data encrypted with AES-256', category: 'encryption', status: 'passed', lastChecked: '2h ago' },
  { id: 'c-7', title: 'SOC 2 Type II', description: 'Annual SOC 2 Type II audit compliance', category: 'audit', status: 'pending', lastChecked: '7d ago' },
  { id: 'c-8', title: 'GDPR Data Processing', description: 'Data processing agreements in place for all sub-processors', category: 'data', status: 'passed', lastChecked: '3h ago' },
  { id: 'c-9', title: 'Least Privilege Access', description: 'Role-based access controls enforced across all services', category: 'access', status: 'passed', lastChecked: '1h ago' },
  { id: 'c-10', title: 'Vulnerability Scanning', description: 'Weekly automated vulnerability scans on all deployments', category: 'security', status: 'passed', lastChecked: '1d ago' },
];

/* ── Status Board ── */

export const statusServices: StatusService[] = [
  { name: 'Compute Engine', status: 'operational', uptime: 99.99, incidents: 0, lastIncident: '42d ago' },
  { name: 'PostgreSQL', status: 'operational', uptime: 99.98, incidents: 1, lastIncident: '14d ago' },
  { name: 'Object Storage', status: 'operational', uptime: 99.999, incidents: 0, lastIncident: '90d ago' },
  { name: 'Edge CDN', status: 'operational', uptime: 99.99, incidents: 0, lastIncident: '28d ago' },
  { name: 'DNS', status: 'operational', uptime: 100.0, incidents: 0, lastIncident: 'never' },
  { name: 'Auth Gateway', status: 'degraded', uptime: 99.91, incidents: 2, lastIncident: '3h ago' },
  { name: 'Redis Cache', status: 'operational', uptime: 99.97, incidents: 1, lastIncident: '21d ago' },
  { name: 'Message Queue', status: 'operational', uptime: 99.96, incidents: 0, lastIncident: '56d ago' },
  { name: 'Build Pipeline', status: 'operational', uptime: 99.94, incidents: 1, lastIncident: '7d ago' },
  { name: 'Analytics', status: 'maintenance', uptime: 99.92, incidents: 0, lastIncident: '35d ago' },
];

/* ── Billing ── */

export const billingKpis: BillingKpi[] = [
  { label: 'Current Month', value: '$2,847', change: 12.4, icon: 'dollar-sign' },
  { label: 'Projected', value: '$3,210', change: 8.1, icon: 'trending-up' },
  { label: 'Credits Remaining', value: '$1,450', change: -22.3, icon: 'wallet' },
  { label: 'Cost Per Request', value: '$0.0023', change: -5.2, icon: 'activity' },
];

export const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: 0,
    period: '/mo',
    recommended: false,
    features: ['3 projects', '100GB bandwidth', '100K function invocations', 'Community support', 'Shared compute'],
    cta: 'Current Plan',
  },
  {
    name: 'Pro',
    price: 20,
    period: '/mo per member',
    recommended: true,
    features: ['Unlimited projects', '1TB bandwidth', '1M function invocations', 'Priority support', 'Dedicated compute', 'Custom domains', 'Team management'],
    cta: 'Deploy Now',
  },
  {
    name: 'Enterprise',
    price: 99,
    period: '/mo per member',
    recommended: false,
    features: ['Everything in Pro', '10TB bandwidth', '10M function invocations', 'Dedicated support', 'SLA guarantee', 'SOC 2 compliance', 'SSO / SAML', 'Audit logs'],
    cta: 'Contact Sales',
  },
];

export const paymentHistory: PaymentRecord[] = [
  { id: 'pay-1', date: '2026-04-01', description: 'Pro Plan — April 2026 (6 seats)', amount: 120, status: 'completed' },
  { id: 'pay-2', date: '2026-03-01', description: 'Pro Plan — March 2026 (6 seats)', amount: 120, status: 'completed' },
  { id: 'pay-3', date: '2026-02-15', description: 'Bandwidth overage — 42GB', amount: 8.40, status: 'completed' },
  { id: 'pay-4', date: '2026-02-01', description: 'Pro Plan — February 2026 (5 seats)', amount: 100, status: 'completed' },
  { id: 'pay-5', date: '2026-01-01', description: 'Pro Plan — January 2026 (5 seats)', amount: 100, status: 'completed' },
  { id: 'pay-6', date: '2025-12-15', description: 'Pro Plan upgrade from Starter', amount: 10, status: 'completed' },
];

/* ── Infrastructure KPIs (used on app-detail) ── */

export const infraKpis = [
  { label: 'Requests (24h)', value: '1.24M', change: 8.2, icon: 'activity' },
  { label: 'Error Rate', value: '0.26%', change: -12.4, icon: 'alert-triangle' },
  { label: 'p99 Latency', value: '142ms', change: 3.1, icon: 'clock' },
  { label: 'Uptime (30d)', value: '99.98%', change: 0.01, icon: 'check-circle' },
];

/* ── Marketing Page Data ── */

export const platformFeatures = [
  { icon: 'rocket', title: 'Instant Deploys', description: 'Push to git and deploy in seconds. Zero-config CI/CD with automatic previews for every branch.' },
  { icon: 'globe', title: 'Global Edge Network', description: '300+ edge locations worldwide. Sub-50ms latency for 95% of the global population.' },
  { icon: 'shield', title: 'Enterprise Security', description: 'SOC 2 Type II certified. End-to-end encryption, SSO, and granular access controls.' },
  { icon: 'database', title: 'Managed Databases', description: 'PostgreSQL, Redis, and object storage with automatic backups and point-in-time recovery.' },
  { icon: 'zap', title: 'Serverless Functions', description: 'Auto-scaling compute with zero cold starts. Pay only for what you use.' },
  { icon: 'bar-chart-2', title: 'Real-time Analytics', description: 'Built-in observability with logs, metrics, and distributed tracing.' },
];

export const platformCapabilities = [
  { icon: 'git-branch', title: 'Preview Deployments', description: 'Every pull request gets a unique URL. Review changes in production-like environments.' },
  { icon: 'layers', title: 'Multi-Region', description: 'Deploy to multiple regions with intelligent routing. Automatic failover and disaster recovery.' },
  { icon: 'terminal', title: 'CLI & API', description: 'Full-featured CLI and REST API. Automate every aspect of your infrastructure.' },
  { icon: 'users', title: 'Team Collaboration', description: 'Granular permissions, audit logs, and team-level billing. Built for engineering teams.' },
];

export const platformStats = [
  { label: 'Deployments', value: '12M+' },
  { label: 'Developers', value: '340K+' },
  { label: 'Edge Locations', value: '300+' },
  { label: 'Uptime SLA', value: '99.99%' },
];

export const techLogos = [
  'Next.js', 'React', 'Vite', 'Astro', 'Nuxt', 'Svelte', 'Remix', 'Hono', 'Express', 'Django',
];

export const requestTraceSteps = [
  { name: 'Edge CDN', duration: '3ms', status: 'ok' as const },
  { name: 'DNS Resolution', duration: '2ms', status: 'ok' as const },
  { name: 'TLS Handshake', duration: '8ms', status: 'ok' as const },
  { name: 'Load Balancer', duration: '1ms', status: 'ok' as const },
  { name: 'Auth Middleware', duration: '24ms', status: 'warn' as const },
  { name: 'API Handler', duration: '89ms', status: 'ok' as const },
  { name: 'Database Query', duration: '12ms', status: 'ok' as const },
  { name: 'Response Serialization', duration: '3ms', status: 'ok' as const },
];
