/* ── Mock Data: Multi-Tenant Platform ── */

export interface Organization {
  id: string;
  name: string;
  slug: string;
  initials: string;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  members: number;
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'admin' | 'developer' | 'billing' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  lastActive: string;
  mfa: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scope: string[];
  environment: 'live' | 'test';
  createdAt: string;
  lastUsed: string;
  createdBy: string;
  status: 'active' | 'revoked';
}

export interface Webhook {
  id: string;
  url: string;
  description: string;
  events: string[];
  status: 'active' | 'failed' | 'paused';
  secret: string;
  createdAt: string;
  successRate: number;
  lastDelivery: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: 'delivered' | 'failed' | 'retry';
  statusCode: number;
  duration: number;
  timestamp: string;
  attempt: number;
  payload: string;
}

export interface UsageMeter {
  label: string;
  value: number;
  limit: number;
  unit: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  actorAvatar: string;
  action: string;
  resource: string;
  resourceType: string;
  timestamp: string;
  ip: string;
  type: 'create' | 'update' | 'delete' | 'auth' | 'api' | 'billing' | 'invite';
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'draft';
  period: string;
  dueDate: string;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  title: string;
  description: string;
  category: string;
}

export interface Kpi {
  label: string;
  value: string;
  change: number;
  icon: string;
}

export interface ChartSeries {
  label: string;
  values: number[];
  color: string;
}

/* ── Organizations ── */

export const organizations: Organization[] = [
  { id: 'org-1', name: 'Acme Corp', slug: 'acme', initials: 'AC', plan: 'Enterprise', members: 42, createdAt: '2024-03-14' },
  { id: 'org-2', name: 'Globex Industries', slug: 'globex', initials: 'GI', plan: 'Pro', members: 18, createdAt: '2024-08-22' },
  { id: 'org-3', name: 'Initech', slug: 'initech', initials: 'IN', plan: 'Pro', members: 12, createdAt: '2025-01-05' },
  { id: 'org-4', name: 'Stark Industries', slug: 'stark', initials: 'SI', plan: 'Enterprise', members: 87, createdAt: '2023-11-30' },
  { id: 'org-5', name: 'Wayne Enterprises', slug: 'wayne', initials: 'WE', plan: 'Starter', members: 4, createdAt: '2026-02-18' },
];

/* ── Members ── */

export const members: Member[] = [
  { id: 'm-1', name: 'Sarah Chen', email: 'sarah@acmecorp.io', avatar: 'SC', role: 'owner', status: 'active', joinedAt: '2024-03-14', lastActive: '2m ago', mfa: true },
  { id: 'm-2', name: 'Marcus Johnson', email: 'marcus@acmecorp.io', avatar: 'MJ', role: 'admin', status: 'active', joinedAt: '2024-04-02', lastActive: '12m ago', mfa: true },
  { id: 'm-3', name: 'Aisha Patel', email: 'aisha@acmecorp.io', avatar: 'AP', role: 'developer', status: 'active', joinedAt: '2024-05-18', lastActive: '1h ago', mfa: true },
  { id: 'm-4', name: 'James Wilson', email: 'james@acmecorp.io', avatar: 'JW', role: 'developer', status: 'active', joinedAt: '2024-06-21', lastActive: '3h ago', mfa: false },
  { id: 'm-5', name: 'Lin Wei', email: 'lin@acmecorp.io', avatar: 'LW', role: 'developer', status: 'active', joinedAt: '2024-09-03', lastActive: '1d ago', mfa: true },
  { id: 'm-6', name: 'David Kim', email: 'david@acmecorp.io', avatar: 'DK', role: 'billing', status: 'active', joinedAt: '2024-11-15', lastActive: '2d ago', mfa: true },
  { id: 'm-7', name: 'Priya Sharma', email: 'priya@acmecorp.io', avatar: 'PS', role: 'viewer', status: 'active', joinedAt: '2025-01-08', lastActive: '5d ago', mfa: false },
  { id: 'm-8', name: 'Tom Brady', email: 'tom@acmecorp.io', avatar: 'TB', role: 'developer', status: 'pending', joinedAt: '2026-04-03', lastActive: 'never', mfa: false },
  { id: 'm-9', name: 'Elena Rodriguez', email: 'elena@acmecorp.io', avatar: 'ER', role: 'viewer', status: 'inactive', joinedAt: '2024-07-12', lastActive: '42d ago', mfa: false },
];

/* ── API Keys ── */

export const apiKeys: ApiKey[] = [
  { id: 'key-1', name: 'Production Backend', prefix: 'sk_live_7f3a', scope: ['read', 'write'], environment: 'live', createdAt: '2025-11-01', lastUsed: '3m ago', createdBy: 'Sarah Chen', status: 'active' },
  { id: 'key-2', name: 'CI/CD Pipeline', prefix: 'sk_live_9b1e', scope: ['write', 'deploy'], environment: 'live', createdAt: '2025-10-15', lastUsed: '1h ago', createdBy: 'Marcus Johnson', status: 'active' },
  { id: 'key-3', name: 'Staging Environment', prefix: 'sk_test_2c8d', scope: ['read', 'write', 'delete'], environment: 'test', createdAt: '2025-09-20', lastUsed: '45m ago', createdBy: 'Aisha Patel', status: 'active' },
  { id: 'key-4', name: 'Mobile App (iOS)', prefix: 'sk_live_4e6f', scope: ['read'], environment: 'live', createdAt: '2025-08-10', lastUsed: '5m ago', createdBy: 'James Wilson', status: 'active' },
  { id: 'key-5', name: 'Analytics Export', prefix: 'sk_live_1a3b', scope: ['read', 'export'], environment: 'live', createdAt: '2025-07-01', lastUsed: '2d ago', createdBy: 'Lin Wei', status: 'active' },
  { id: 'key-6', name: 'Legacy Integration', prefix: 'sk_live_6d9c', scope: ['read'], environment: 'live', createdAt: '2024-12-05', lastUsed: '89d ago', createdBy: 'David Kim', status: 'revoked' },
];

/* ── Webhooks ── */

export const webhooks: Webhook[] = [
  { id: 'wh-1', url: 'https://api.acmecorp.io/webhooks/events', description: 'Main event handler', events: ['user.created', 'user.updated', 'org.updated'], status: 'active', secret: 'whsec_7f3a8b1e2c8d4e6f', createdAt: '2025-11-01', successRate: 99.8, lastDelivery: '1m ago' },
  { id: 'wh-2', url: 'https://hooks.slack.com/services/T00/B00/XXX', description: 'Slack notifications', events: ['user.created', 'billing.invoice.paid'], status: 'active', secret: 'whsec_9b1e3c5d7f2a4b8e', createdAt: '2025-10-20', successRate: 100, lastDelivery: '18m ago' },
  { id: 'wh-3', url: 'https://api.datadog.com/intake/webhook', description: 'Metrics forwarding', events: ['*'], status: 'active', secret: 'whsec_2c8d4e6f1a3b5d9c', createdAt: '2025-09-15', successRate: 98.2, lastDelivery: '45s ago' },
  { id: 'wh-4', url: 'https://api.stripe.com/webhooks/sync', description: 'Billing sync', events: ['billing.*', 'plan.*'], status: 'failed', secret: 'whsec_4e6f1a3b5d9c7f2a', createdAt: '2025-12-01', successRate: 62.1, lastDelivery: '3h ago' },
  { id: 'wh-5', url: 'https://api.segment.io/v1/track', description: 'Analytics tracking', events: ['user.*'], status: 'paused', secret: 'whsec_1a3b5d9c7f2a8b1e', createdAt: '2025-08-10', successRate: 100, lastDelivery: '7d ago' },
];

export const webhookDeliveries: WebhookDelivery[] = [
  { id: 'd-1', webhookId: 'wh-1', event: 'user.created', status: 'delivered', statusCode: 200, duration: 142, timestamp: '14:32:01', attempt: 1, payload: '{"id":"u_7f3a","email":"new@acme.io"}' },
  { id: 'd-2', webhookId: 'wh-1', event: 'user.updated', status: 'delivered', statusCode: 200, duration: 89, timestamp: '14:31:48', attempt: 1, payload: '{"id":"u_9b1e","role":"admin"}' },
  { id: 'd-3', webhookId: 'wh-4', event: 'billing.invoice.paid', status: 'failed', statusCode: 500, duration: 30000, timestamp: '14:28:12', attempt: 3, payload: '{"invoice":"inv_2c8d","amount":12000}' },
  { id: 'd-4', webhookId: 'wh-1', event: 'org.updated', status: 'delivered', statusCode: 200, duration: 124, timestamp: '14:25:33', attempt: 1, payload: '{"org":"org-1","name":"Acme Corp"}' },
  { id: 'd-5', webhookId: 'wh-4', event: 'billing.subscription.updated', status: 'retry', statusCode: 503, duration: 15024, timestamp: '14:22:18', attempt: 2, payload: '{"sub":"sub_4e6f","status":"active"}' },
  { id: 'd-6', webhookId: 'wh-3', event: 'user.login', status: 'delivered', statusCode: 202, duration: 67, timestamp: '14:20:45', attempt: 1, payload: '{"user":"u_7f3a","ip":"10.0.0.1"}' },
  { id: 'd-7', webhookId: 'wh-2', event: 'user.created', status: 'delivered', statusCode: 200, duration: 203, timestamp: '14:18:02', attempt: 1, payload: '{"id":"u_9b1e"}' },
  { id: 'd-8', webhookId: 'wh-4', event: 'billing.invoice.created', status: 'failed', statusCode: 404, duration: 124, timestamp: '14:14:51', attempt: 1, payload: '{"invoice":"inv_1a3b"}' },
];

/* ── Usage Meters ── */

export const usageMeters: UsageMeter[] = [
  { label: 'API Requests', value: 847000, limit: 1000000, unit: '' },
  { label: 'Active Users', value: 3420, limit: 5000, unit: '' },
  { label: 'Webhook Deliveries', value: 128400, limit: 250000, unit: '' },
  { label: 'Storage', value: 18.4, limit: 50, unit: 'GB' },
  { label: 'Seats', value: 42, limit: 100, unit: '' },
  { label: 'Data Transfer', value: 284, limit: 500, unit: 'GB' },
];

export const usageCharts: { title: string; data: ChartSeries[] }[] = [
  {
    title: 'API Requests (30d)',
    data: [
      { label: 'Success', values: [28000, 31000, 29000, 34000, 32000, 36000, 38000, 35000, 37000, 40000, 42000, 39000, 41000, 43000, 45000], color: 'var(--d-success)' },
      { label: 'Errors', values: [120, 85, 210, 95, 140, 180, 220, 160, 190, 175, 140, 210, 195, 180, 165], color: 'var(--d-error)' },
    ],
  },
  {
    title: 'Active Users (30d)',
    data: [
      { label: 'DAU', values: [2100, 2300, 2500, 2400, 2600, 2800, 3000, 2900, 3100, 3200, 3400, 3300, 3500, 3600, 3420], color: 'var(--d-primary)' },
    ],
  },
];

/* ── Audit Events ── */

export const auditEvents: AuditEvent[] = [
  { id: 'a-1', actor: 'Sarah Chen', actorAvatar: 'SC', action: 'created', resource: 'Production Backend', resourceType: 'api_key', timestamp: '2026-04-05 14:32:01', ip: '203.0.113.42', type: 'create' },
  { id: 'a-2', actor: 'Marcus Johnson', actorAvatar: 'MJ', action: 'updated', resource: 'webhook wh-1', resourceType: 'webhook', timestamp: '2026-04-05 14:18:22', ip: '203.0.113.18', type: 'update' },
  { id: 'a-3', actor: 'Aisha Patel', actorAvatar: 'AP', action: 'invited', resource: 'tom@acmecorp.io', resourceType: 'member', timestamp: '2026-04-05 13:45:17', ip: '198.51.100.7', type: 'invite' },
  { id: 'a-4', actor: 'System', actorAvatar: 'SY', action: 'triggered MFA challenge', resource: 'james@acmecorp.io', resourceType: 'session', timestamp: '2026-04-05 12:22:08', ip: '198.51.100.201', type: 'auth' },
  { id: 'a-5', actor: 'David Kim', actorAvatar: 'DK', action: 'viewed', resource: 'Invoice INV-2026-04', resourceType: 'invoice', timestamp: '2026-04-05 11:14:45', ip: '203.0.113.9', type: 'billing' },
  { id: 'a-6', actor: 'Sarah Chen', actorAvatar: 'SC', action: 'revoked', resource: 'Legacy Integration', resourceType: 'api_key', timestamp: '2026-04-05 10:08:33', ip: '203.0.113.42', type: 'delete' },
  { id: 'a-7', actor: 'Marcus Johnson', actorAvatar: 'MJ', action: 'called', resource: 'POST /v1/users', resourceType: 'api_call', timestamp: '2026-04-05 09:52:17', ip: '203.0.113.18', type: 'api' },
  { id: 'a-8', actor: 'System', actorAvatar: 'SY', action: 'rotated secret', resource: 'webhook wh-3', resourceType: 'webhook', timestamp: '2026-04-05 08:00:00', ip: 'internal', type: 'update' },
  { id: 'a-9', actor: 'Lin Wei', actorAvatar: 'LW', action: 'logged in', resource: 'via SSO', resourceType: 'session', timestamp: '2026-04-05 07:34:21', ip: '198.51.100.88', type: 'auth' },
  { id: 'a-10', actor: 'Sarah Chen', actorAvatar: 'SC', action: 'upgraded plan', resource: 'Pro to Enterprise', resourceType: 'subscription', timestamp: '2026-04-04 18:22:11', ip: '203.0.113.42', type: 'billing' },
  { id: 'a-11', actor: 'Priya Sharma', actorAvatar: 'PS', action: 'exported', resource: 'audit log (90 days)', resourceType: 'export', timestamp: '2026-04-04 16:18:04', ip: '198.51.100.55', type: 'api' },
  { id: 'a-12', actor: 'Aisha Patel', actorAvatar: 'AP', action: 'updated role', resource: 'James Wilson → developer', resourceType: 'member', timestamp: '2026-04-04 14:05:32', ip: '198.51.100.7', type: 'update' },
];

/* ── Invoices ── */

export const invoices: Invoice[] = [
  { id: 'inv-1', number: 'INV-2026-04', date: '2026-04-01', amount: 4158, status: 'paid', period: 'April 2026', dueDate: '2026-04-15' },
  { id: 'inv-2', number: 'INV-2026-03', date: '2026-03-01', amount: 3960, status: 'paid', period: 'March 2026', dueDate: '2026-03-15' },
  { id: 'inv-3', number: 'INV-2026-02', date: '2026-02-01', amount: 3960, status: 'paid', period: 'February 2026', dueDate: '2026-02-15' },
  { id: 'inv-4', number: 'INV-2026-01', date: '2026-01-01', amount: 3762, status: 'paid', period: 'January 2026', dueDate: '2026-01-15' },
  { id: 'inv-5', number: 'INV-2025-12', date: '2025-12-01', amount: 3762, status: 'paid', period: 'December 2025', dueDate: '2025-12-15' },
  { id: 'inv-6', number: 'INV-2025-11', date: '2025-11-01', amount: 3564, status: 'paid', period: 'November 2025', dueDate: '2025-11-15' },
  { id: 'inv-7', number: 'INV-2025-10', date: '2025-10-01', amount: 3564, status: 'paid', period: 'October 2025', dueDate: '2025-10-15' },
  { id: 'inv-8', number: 'INV-2026-05', date: '2026-05-01', amount: 4356, status: 'draft', period: 'May 2026 (projected)', dueDate: '2026-05-15' },
];

/* ── API Endpoints (for console) ── */

export const apiEndpoints: ApiEndpoint[] = [
  { method: 'GET', path: '/v1/organizations', title: 'List organizations', description: 'Return all organizations the authenticated user belongs to.', category: 'Organizations' },
  { method: 'GET', path: '/v1/organizations/:id', title: 'Retrieve organization', description: 'Fetch a single organization by ID.', category: 'Organizations' },
  { method: 'POST', path: '/v1/organizations', title: 'Create organization', description: 'Create a new organization. The caller becomes the owner.', category: 'Organizations' },
  { method: 'PATCH', path: '/v1/organizations/:id', title: 'Update organization', description: 'Update organization metadata. Owner/admin only.', category: 'Organizations' },
  { method: 'GET', path: '/v1/members', title: 'List members', description: 'List all members of the current organization.', category: 'Members' },
  { method: 'POST', path: '/v1/members/invite', title: 'Invite member', description: 'Send an invitation email to a new team member.', category: 'Members' },
  { method: 'PATCH', path: '/v1/members/:id', title: 'Update member role', description: 'Change a member role. Owner/admin only.', category: 'Members' },
  { method: 'DELETE', path: '/v1/members/:id', title: 'Remove member', description: 'Remove a member from the organization.', category: 'Members' },
  { method: 'GET', path: '/v1/api-keys', title: 'List API keys', description: 'List all API keys for the current organization.', category: 'API Keys' },
  { method: 'POST', path: '/v1/api-keys', title: 'Create API key', description: 'Create a new API key. The plaintext is shown once.', category: 'API Keys' },
  { method: 'DELETE', path: '/v1/api-keys/:id', title: 'Revoke API key', description: 'Permanently revoke an API key.', category: 'API Keys' },
  { method: 'GET', path: '/v1/webhooks', title: 'List webhooks', description: 'List all configured webhook endpoints.', category: 'Webhooks' },
  { method: 'POST', path: '/v1/webhooks', title: 'Create webhook', description: 'Create a new webhook endpoint with event subscriptions.', category: 'Webhooks' },
  { method: 'GET', path: '/v1/webhooks/:id/deliveries', title: 'List deliveries', description: 'List recent delivery attempts for a webhook.', category: 'Webhooks' },
];

/* ── Overview KPIs ── */

export const overviewKpis: Kpi[] = [
  { label: 'API Requests (30d)', value: '847K', change: 12.4, icon: 'activity' },
  { label: 'Active Users', value: '3,420', change: 8.1, icon: 'users' },
  { label: 'Webhook Success', value: '98.2%', change: 0.4, icon: 'zap' },
  { label: 'MRR', value: '$4,158', change: 5.2, icon: 'dollar-sign' },
];

/* ── Quick Actions ── */

export const quickActions = [
  { label: 'Invite team member', icon: 'user-plus', route: '/members' },
  { label: 'Create API key', icon: 'key', route: '/api/keys' },
  { label: 'Configure webhook', icon: 'zap', route: '/api/webhooks' },
  { label: 'View audit log', icon: 'shield', route: '/audit' },
];

/* ── Marketing ── */

export const platformFeatures = [
  { icon: 'users', title: 'Multi-Tenant Architecture', description: 'Isolated organizations with per-tenant data, billing, and access control. Scale from 1 to 10,000 tenants.' },
  { icon: 'key', title: 'API Keys & SDKs', description: 'Scoped API keys with environment separation. Official SDKs for TypeScript, Python, Go, and Ruby.' },
  { icon: 'zap', title: 'Webhooks with Retry', description: 'Exponential backoff, delivery logs, and replay. Every webhook is signed and idempotent.' },
  { icon: 'shield', title: 'Audit Trail', description: 'Every administrative action logged with actor, IP, and timestamp. SOC 2 Type II compliant.' },
  { icon: 'credit-card', title: 'Usage-Based Billing', description: 'Metered billing with prepaid credits, overages, and per-seat pricing. Stripe-powered.' },
  { icon: 'lock', title: 'Enterprise SSO', description: 'SAML 2.0, SCIM provisioning, and MFA enforcement. Identity sync with Okta, Azure AD, Google Workspace.' },
];

export const testimonials = [
  { quote: 'We migrated from Auth0 + Stripe + custom webhooks to this platform in 3 weeks. It just works.', author: 'Priya Patel', title: 'CTO, Stripe' },
  { quote: 'The audit log alone saved us 6 months of SOC 2 prep work. We passed on first attempt.', author: 'Marcus Chen', title: 'Head of Security, Linear' },
  { quote: 'Per-org API keys and webhook signing are table stakes — they nailed it. Developer experience is unmatched.', author: 'Sarah Rodriguez', title: 'Platform Lead, Vercel' },
];

export const pricingTiers = [
  { name: 'Starter', price: 0, period: '/mo', recommended: false, features: ['Up to 5 members', '10K API requests/mo', '3 webhooks', 'Community support', '7-day audit log'], cta: 'Start Free' },
  { name: 'Pro', price: 49, period: '/mo per org', recommended: true, features: ['Unlimited members', '1M API requests/mo', 'Unlimited webhooks', 'Priority support', '90-day audit log', 'Custom roles', 'Usage alerts'], cta: 'Start Trial' },
  { name: 'Enterprise', price: 499, period: '/mo per org', recommended: false, features: ['Everything in Pro', '10M API requests/mo', 'SAML SSO + SCIM', 'Dedicated support + SLA', 'Unlimited audit retention', 'Custom contracts', 'On-premise option'], cta: 'Contact Sales' },
];

export const docCategories = [
  { icon: 'book-open', title: 'Getting Started', description: 'Quickstart guides and core concepts', count: 12 },
  { icon: 'key', title: 'Authentication', description: 'API keys, OAuth, SSO, MFA', count: 8 },
  { icon: 'users', title: 'Organizations & Teams', description: 'Multi-tenant patterns, roles, invites', count: 15 },
  { icon: 'zap', title: 'Webhooks', description: 'Events, signing, retries, replay', count: 9 },
  { icon: 'credit-card', title: 'Billing', description: 'Plans, usage, invoices, metering', count: 11 },
  { icon: 'shield', title: 'Security & Compliance', description: 'Audit logs, SOC 2, data retention', count: 7 },
  { icon: 'code', title: 'API Reference', description: 'Complete REST API documentation', count: 64 },
  { icon: 'terminal', title: 'SDKs', description: 'TypeScript, Python, Go, Ruby libraries', count: 4 },
];

export const platformStats = [
  { label: 'Organizations', value: '28K+' },
  { label: 'API Requests/day', value: '2.4B' },
  { label: 'Webhooks Delivered', value: '180M/mo' },
  { label: 'Uptime SLA', value: '99.99%' },
];

/* ── Sessions ── */

export interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

export const sessions: Session[] = [
  { id: 's-1', device: 'MacBook Pro 14"', browser: 'Chrome 128', location: 'San Francisco, CA', ip: '203.0.113.42', lastActive: 'now', current: true },
  { id: 's-2', device: 'iPhone 15', browser: 'Safari 17', location: 'San Francisco, CA', ip: '198.51.100.88', lastActive: '2h ago', current: false },
  { id: 's-3', device: 'iPad Pro', browser: 'Safari 17', location: 'Oakland, CA', ip: '198.51.100.55', lastActive: '2d ago', current: false },
  { id: 's-4', device: 'Windows Desktop', browser: 'Firefox 126', location: 'Austin, TX', ip: '203.0.113.18', lastActive: '14d ago', current: false },
];
