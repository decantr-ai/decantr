/* ── Mock Data: SaaS Dashboard (Northwind) ── */

export interface Kpi {
  label: string;
  value: string;
  change: number;
  icon: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'invited' | 'suspended';
  lastActive: string;
  joined: string;
}

export interface Project {
  id: string;
  name: string;
  members: number;
  status: 'active' | 'paused' | 'archived';
  progress: number;
  updated: string;
}

export interface UsageMeter {
  label: string;
  value: number;
  limit: number;
  unit: string;
  icon: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'refunded';
  period: string;
  downloadUrl: string;
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

export interface ChartSeries {
  label: string;
  values: number[];
  color: string;
}

export interface ChartDef {
  title: string;
  type: 'area' | 'line' | 'bar';
  series: ChartSeries[];
  labels: string[];
}

export interface Permission {
  key: string;
  label: string;
  description: string;
}

export interface Role {
  key: string;
  label: string;
}

export interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

export interface PricingTier {
  name: string;
  price: number;
  period: string;
  recommended: boolean;
  features: string[];
  cta: string;
  current: boolean;
}

/* ── Dashboard KPIs ── */

export const dashboardKpis: Kpi[] = [
  { label: 'MRR', value: '$48,200', change: 12.4, icon: 'dollar-sign' },
  { label: 'Active Users', value: '3,847', change: 8.1, icon: 'users' },
  { label: 'Conversion', value: '3.24%', change: 0.8, icon: 'trending-up' },
  { label: 'Churn', value: '1.8%', change: -0.4, icon: 'user-minus' },
];

export const analyticsKpis: Kpi[] = [
  { label: 'Page Views', value: '124K', change: 14.2, icon: 'eye' },
  { label: 'Sessions', value: '48.2K', change: 9.6, icon: 'activity' },
  { label: 'Avg Session', value: '4m 12s', change: 6.2, icon: 'clock' },
  { label: 'Bounce Rate', value: '28.4%', change: -3.1, icon: 'arrow-down-right' },
];

/* ── Team Members ── */

export const teamMembers: TeamMember[] = [
  { id: 'tm-1', name: 'Sarah Chen', avatar: 'SC', email: 'sarah@northwind.io', role: 'owner', status: 'active', lastActive: '2m ago', joined: '2024-01-15' },
  { id: 'tm-2', name: 'Marcus Johnson', avatar: 'MJ', email: 'marcus@northwind.io', role: 'admin', status: 'active', lastActive: '15m ago', joined: '2024-02-03' },
  { id: 'tm-3', name: 'Aisha Patel', avatar: 'AP', email: 'aisha@northwind.io', role: 'admin', status: 'active', lastActive: '1h ago', joined: '2024-03-22' },
  { id: 'tm-4', name: 'James Wilson', avatar: 'JW', email: 'james@northwind.io', role: 'member', status: 'active', lastActive: '3h ago', joined: '2024-05-10' },
  { id: 'tm-5', name: 'Lin Wei', avatar: 'LW', email: 'lin@northwind.io', role: 'member', status: 'active', lastActive: '1d ago', joined: '2024-06-18' },
  { id: 'tm-6', name: 'David Kim', avatar: 'DK', email: 'david@northwind.io', role: 'member', status: 'active', lastActive: '2d ago', joined: '2024-08-01' },
  { id: 'tm-7', name: 'Priya Sharma', avatar: 'PS', email: 'priya@northwind.io', role: 'viewer', status: 'active', lastActive: '4d ago', joined: '2024-09-14' },
  { id: 'tm-8', name: 'Carlos Rivera', avatar: 'CR', email: 'carlos@northwind.io', role: 'member', status: 'invited', lastActive: 'never', joined: '2026-04-01' },
  { id: 'tm-9', name: 'Emma Larsen', avatar: 'EL', email: 'emma@northwind.io', role: 'viewer', status: 'suspended', lastActive: '21d ago', joined: '2024-11-05' },
];

/* ── Projects ── */

export const projects: Project[] = [
  { id: 'pr-1', name: 'Northwind Web', members: 6, status: 'active', progress: 78, updated: '3m ago' },
  { id: 'pr-2', name: 'Mobile App v2', members: 4, status: 'active', progress: 42, updated: '1h ago' },
  { id: 'pr-3', name: 'Billing Migration', members: 3, status: 'active', progress: 91, updated: '2h ago' },
  { id: 'pr-4', name: 'API Gateway', members: 5, status: 'paused', progress: 35, updated: '2d ago' },
  { id: 'pr-5', name: 'Legacy Migration', members: 2, status: 'archived', progress: 100, updated: '18d ago' },
];

/* ── Usage Meters ── */

export const usageMeters: UsageMeter[] = [
  { label: 'Team Seats', value: 9, limit: 15, unit: 'seats', icon: 'users' },
  { label: 'API Requests', value: 842000, limit: 1000000, unit: '/mo', icon: 'activity' },
  { label: 'Storage', value: 18.4, limit: 50, unit: 'GB', icon: 'database' },
  { label: 'Bandwidth', value: 342, limit: 500, unit: 'GB', icon: 'wifi' },
  { label: 'Projects', value: 12, limit: 25, unit: 'projects', icon: 'folder' },
  { label: 'Workflow Runs', value: 4200, limit: 10000, unit: '/mo', icon: 'zap' },
];

/* ── Invoices ── */

export const invoices: Invoice[] = [
  { id: 'inv-1', number: 'INV-2026-004', date: '2026-04-01', amount: 240.00, status: 'paid', period: 'Apr 2026', downloadUrl: '#' },
  { id: 'inv-2', number: 'INV-2026-003', date: '2026-03-01', amount: 240.00, status: 'paid', period: 'Mar 2026', downloadUrl: '#' },
  { id: 'inv-3', number: 'INV-2026-002', date: '2026-02-15', amount: 18.40, status: 'paid', period: 'Feb 2026 overage', downloadUrl: '#' },
  { id: 'inv-4', number: 'INV-2026-001', date: '2026-02-01', amount: 200.00, status: 'paid', period: 'Feb 2026', downloadUrl: '#' },
  { id: 'inv-5', number: 'INV-2025-012', date: '2026-01-01', amount: 200.00, status: 'paid', period: 'Jan 2026', downloadUrl: '#' },
  { id: 'inv-6', number: 'INV-2025-011', date: '2025-12-01', amount: 200.00, status: 'paid', period: 'Dec 2025', downloadUrl: '#' },
  { id: 'inv-7', number: 'INV-2025-010', date: '2025-11-01', amount: 160.00, status: 'paid', period: 'Nov 2025', downloadUrl: '#' },
  { id: 'inv-8', number: 'INV-2025-009', date: '2025-10-01', amount: 160.00, status: 'refunded', period: 'Oct 2025', downloadUrl: '#' },
];

/* ── Activity Events (audit trail) ── */

export const activityEvents: ActivityEvent[] = [
  { id: 'ev-1', user: 'Sarah Chen', userAvatar: 'SC', action: 'invited', target: 'carlos@northwind.io as member', timestamp: '3m ago', type: 'team' },
  { id: 'ev-2', user: 'Marcus Johnson', userAvatar: 'MJ', action: 'changed role', target: 'Aisha Patel to admin', timestamp: '18m ago', type: 'team' },
  { id: 'ev-3', user: 'Sarah Chen', userAvatar: 'SC', action: 'exported', target: 'April analytics report', timestamp: '45m ago', type: 'config' },
  { id: 'ev-4', user: 'System', userAvatar: 'SY', action: 'paid invoice', target: 'INV-2026-004 ($240.00)', timestamp: '1h ago', type: 'billing' },
  { id: 'ev-5', user: 'Aisha Patel', userAvatar: 'AP', action: 'updated', target: 'billing preferences', timestamp: '2h ago', type: 'config' },
  { id: 'ev-6', user: 'James Wilson', userAvatar: 'JW', action: 'enabled 2FA', target: 'on account', timestamp: '3h ago', type: 'security' },
  { id: 'ev-7', user: 'Marcus Johnson', userAvatar: 'MJ', action: 'rotated', target: 'API signing key', timestamp: '5h ago', type: 'security' },
  { id: 'ev-8', user: 'System', userAvatar: 'SY', action: 'flagged', target: 'unusual login from new IP', timestamp: '6h ago', type: 'incident' },
  { id: 'ev-9', user: 'Lin Wei', userAvatar: 'LW', action: 'created', target: 'Mobile App v2 project', timestamp: '1d ago', type: 'config' },
  { id: 'ev-10', user: 'Sarah Chen', userAvatar: 'SC', action: 'upgraded plan', target: 'Pro → Business', timestamp: '2d ago', type: 'billing' },
];

/* ── Charts ── */

export const dashboardCharts: ChartDef[] = [
  {
    title: 'Revenue (30d)',
    type: 'area',
    labels: ['Mar 7', 'Mar 14', 'Mar 21', 'Mar 28', 'Apr 4'],
    series: [
      { label: 'MRR', values: [42100, 43800, 45200, 46900, 48200], color: 'var(--d-accent)' },
    ],
  },
  {
    title: 'Active Users (7d)',
    type: 'bar',
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    series: [
      { label: 'DAU', values: [3420, 3580, 3712, 3650, 3847, 2940, 2810], color: 'var(--d-primary)' },
    ],
  },
];

export const analyticsCharts: ChartDef[] = [
  {
    title: 'Page Views (14d)',
    type: 'area',
    labels: ['1', '3', '5', '7', '9', '11', '13'],
    series: [
      { label: 'Views', values: [8200, 9100, 8700, 10200, 11400, 12100, 12800], color: 'var(--d-accent)' },
    ],
  },
  {
    title: 'Sessions by Source',
    type: 'bar',
    labels: ['Direct', 'Organic', 'Social', 'Email', 'Referral'],
    series: [
      { label: 'Sessions', values: [18400, 14200, 8100, 5200, 2300], color: 'var(--d-primary)' },
    ],
  },
  {
    title: 'Conversion Funnel',
    type: 'bar',
    labels: ['Visit', 'Signup', 'Trial', 'Paid'],
    series: [
      { label: 'Users', values: [12400, 3800, 1200, 402], color: 'var(--d-accent)' },
    ],
  },
  {
    title: 'Retention (weekly)',
    type: 'line',
    labels: ['W0', 'W1', 'W2', 'W3', 'W4', 'W5'],
    series: [
      { label: 'Cohort', values: [100, 72, 58, 49, 44, 41], color: 'var(--d-primary)' },
    ],
  },
];

export const sparklines: { label: string; value: string; change: number; data: number[] }[] = [
  { label: 'Signups', value: '402', change: 18.2, data: [12, 14, 11, 16, 18, 14, 22, 19, 24, 21, 28, 32] },
  { label: 'Trials Started', value: '186', change: 12.4, data: [8, 9, 7, 11, 10, 12, 14, 13, 15, 16, 14, 18] },
  { label: 'Paid Conversions', value: '48', change: 6.8, data: [3, 4, 2, 5, 4, 5, 6, 5, 7, 6, 8, 7] },
  { label: 'Cancellations', value: '12', change: -14.2, data: [5, 4, 6, 3, 4, 3, 4, 2, 3, 2, 2, 1] },
];

/* ── Permissions Matrix ── */

export const permissions: Permission[] = [
  { key: 'billing.read', label: 'View billing', description: 'View invoices, plans, and payment history' },
  { key: 'billing.write', label: 'Manage billing', description: 'Change plan, update payment method, manage invoices' },
  { key: 'team.read', label: 'View team', description: 'See team members and roles' },
  { key: 'team.invite', label: 'Invite members', description: 'Send invitations to new team members' },
  { key: 'team.manage', label: 'Manage roles', description: 'Change member roles and remove members' },
  { key: 'projects.read', label: 'View projects', description: 'View all projects and their contents' },
  { key: 'projects.write', label: 'Edit projects', description: 'Create, update, and archive projects' },
  { key: 'analytics.read', label: 'View analytics', description: 'Access analytics dashboards and reports' },
  { key: 'analytics.export', label: 'Export data', description: 'Export analytics and audit data' },
  { key: 'settings.write', label: 'Manage settings', description: 'Change workspace and organization settings' },
];

export const roles: Role[] = [
  { key: 'owner', label: 'Owner' },
  { key: 'admin', label: 'Admin' },
  { key: 'member', label: 'Member' },
  { key: 'viewer', label: 'Viewer' },
];

export const rolePermissions: Record<string, string[]> = {
  owner: permissions.map(p => p.key),
  admin: ['billing.read', 'billing.write', 'team.read', 'team.invite', 'team.manage', 'projects.read', 'projects.write', 'analytics.read', 'analytics.export', 'settings.write'],
  member: ['team.read', 'projects.read', 'projects.write', 'analytics.read'],
  viewer: ['team.read', 'projects.read', 'analytics.read'],
};

/* ── Sessions ── */

export const sessions: Session[] = [
  { id: 's-1', device: 'MacBook Pro · Chrome', location: 'San Francisco, CA', ip: '73.140.22.18', lastActive: 'now', current: true },
  { id: 's-2', device: 'iPhone 15 · Safari', location: 'San Francisco, CA', ip: '73.140.22.18', lastActive: '42m ago', current: false },
  { id: 's-3', device: 'Windows · Firefox', location: 'New York, NY', ip: '172.58.140.9', lastActive: '3d ago', current: false },
  { id: 's-4', device: 'iPad · Safari', location: 'Los Angeles, CA', ip: '98.176.44.21', lastActive: '12d ago', current: false },
];

/* ── Pricing Tiers ── */

export const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: 0,
    period: '/mo',
    recommended: false,
    current: false,
    features: ['3 team members', '5 projects', '10K API requests', 'Community support', 'Basic analytics'],
    cta: 'Downgrade',
  },
  {
    name: 'Pro',
    price: 24,
    period: '/mo per seat',
    recommended: false,
    current: false,
    features: ['15 team members', '25 projects', '1M API requests', 'Priority support', 'Advanced analytics', 'Custom roles', 'Audit log'],
    cta: 'Switch to Pro',
  },
  {
    name: 'Business',
    price: 48,
    period: '/mo per seat',
    recommended: true,
    current: true,
    features: ['Unlimited members', 'Unlimited projects', '10M API requests', 'Dedicated support', 'SSO / SAML', 'Custom roles', 'Full audit log', 'SOC 2 report'],
    cta: 'Current Plan',
  },
  {
    name: 'Enterprise',
    price: 0,
    period: 'custom',
    recommended: false,
    current: false,
    features: ['Everything in Business', 'Dedicated infrastructure', 'Custom SLA', 'On-prem option', 'Dedicated CSM', 'Security review'],
    cta: 'Contact Sales',
  },
];

/* ── Marketing page data ── */

export const marketingFeatures = [
  { icon: 'bar-chart-3', title: 'KPI dashboards', description: 'Every number that matters, scannable in three seconds. Trend indicators, sparklines, and alerts.' },
  { icon: 'users', title: 'Team workspaces', description: 'Invite your team, assign roles, and manage fine-grained permissions from a single console.' },
  { icon: 'trending-up', title: 'Deep analytics', description: 'Funnel analysis, cohort retention, and source attribution. Export-ready, always fresh.' },
  { icon: 'credit-card', title: 'Usage billing', description: 'See what you use and what you owe. Upgrade or downgrade in a click, no invoice surprises.' },
  { icon: 'shield', title: 'Audit trail', description: 'Every admin action logged with actor, target, and timestamp. Compliance without spreadsheets.' },
  { icon: 'bell', title: 'Smart alerts', description: 'Get notified when something breaks, spikes, or needs attention. Slack, email, or webhook.' },
];

export const marketingStats = [
  { label: 'Teams', value: '14K+' },
  { label: 'Events / month', value: '8.2B' },
  { label: 'Uptime', value: '99.99%' },
  { label: 'Countries', value: '96' },
];

export const testimonials = [
  { quote: 'Northwind replaced four tools for us. We ship faster and the dashboards are the only thing our execs actually open on Mondays.', author: 'Riley Park', role: 'Head of Product, Luna Labs', avatar: 'RP' },
  { quote: 'The audit log alone pays for the plan. Our SOC 2 audit went from three weeks to two days of exports.', author: 'Jordan Hayes', role: 'CTO, Cipher Security', avatar: 'JH' },
  { quote: 'I onboarded my entire team in under an hour. The role system is how permissions should work everywhere.', author: 'Samira Okafor', role: 'Engineering Manager, Kite', avatar: 'SO' },
];

/* ── Quick Actions ── */

export const quickActions = [
  { id: 'qa-1', icon: 'user-plus', label: 'Invite member', description: 'Add a teammate to the workspace', route: '/team' },
  { id: 'qa-2', icon: 'folder-plus', label: 'New project', description: 'Start a fresh project workspace', route: '/dashboard' },
  { id: 'qa-3', icon: 'download', label: 'Export report', description: 'Download analytics as CSV or PDF', route: '/analytics' },
  { id: 'qa-4', icon: 'credit-card', label: 'Update billing', description: 'Change plan or payment method', route: '/billing' },
  { id: 'qa-5', icon: 'key', label: 'Rotate API key', description: 'Generate a new signing key', route: '/settings/security' },
  { id: 'qa-6', icon: 'bell', label: 'Configure alerts', description: 'Set thresholds and notifications', route: '/settings/preferences' },
  { id: 'qa-7', icon: 'shield', label: 'Review audit log', description: 'See recent admin activity', route: '/dashboard' },
  { id: 'qa-8', icon: 'settings', label: 'Workspace settings', description: 'Name, slug, and timezone', route: '/settings/profile' },
];
