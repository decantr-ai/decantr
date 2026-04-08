// Mock data for the registry platform showcase

export interface ContentItem {
  id: string;
  type: 'pattern' | 'theme' | 'blueprint' | 'shell' | 'archetype';
  name: string;
  slug: string;
  namespace: string;
  description: string;
  version: string;
  downloads: number;
  updatedAt: string;
  author: string;
}

export interface KPI {
  label: string;
  value: number;
  trend: number;
  icon: string;
}

export interface ActivityEvent {
  id: string;
  user: string;
  initials: string;
  action: string;
  timestamp: string;
  date: string;
  dotColor: string;
}

export interface ApiKey {
  id: string;
  name: string;
  maskedKey: string;
  fullKey: string;
  scopes: string[];
  createdAt: string;
  lastUsed: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  initials: string;
}

export interface ModerationItem {
  id: string;
  content: ContentItem;
  submitter: { name: string; initials: string; reputation: number; level: string };
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
}

export interface TierPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular: boolean;
  current: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  pattern: '#F58882',
  theme: '#FDA303',
  blueprint: '#0AF3EB',
  shell: '#00E0AB',
  archetype: '#6500C6',
};

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type] ?? '#A1A1AA';
}

export const contentItems: ContentItem[] = [
  { id: '1', type: 'pattern', name: 'Hero Section', slug: 'hero-section', namespace: '@official', description: 'Full-width hero with headline, subtext, and CTA buttons. Supports background image and gradient overlays.', version: '2.1.0', downloads: 12847, updatedAt: '2026-04-01', author: 'decantr' },
  { id: '2', type: 'pattern', name: 'Search Filter Bar', slug: 'search-filter-bar', namespace: '@official', description: 'Search input with type and namespace dropdown filters for browsing registry content.', version: '1.8.0', downloads: 9432, updatedAt: '2026-03-28', author: 'decantr' },
  { id: '3', type: 'theme', name: 'Luminarum', slug: 'luminarum', namespace: '@official', description: 'Warm coral and amber accents on rich dark canvas. Vibrant yet refined.', version: '3.0.0', downloads: 18291, updatedAt: '2026-04-05', author: 'decantr' },
  { id: '4', type: 'blueprint', name: 'SaaS Dashboard', slug: 'saas-dashboard', namespace: '@official', description: 'Complete SaaS admin dashboard with analytics, user management, and billing.', version: '1.5.0', downloads: 7623, updatedAt: '2026-03-30', author: 'decantr' },
  { id: '5', type: 'shell', name: 'Sidebar Main', slug: 'sidebar-main', namespace: '@official', description: 'Collapsible sidebar with header bar and scrollable main content area.', version: '2.0.0', downloads: 14102, updatedAt: '2026-04-02', author: 'decantr' },
  { id: '6', type: 'pattern', name: 'Content Card Grid', slug: 'content-card-grid', namespace: '@official', description: 'Responsive grid of content cards with type badges, metadata, and quick actions.', version: '1.6.0', downloads: 11205, updatedAt: '2026-03-25', author: 'decantr' },
  { id: '7', type: 'theme', name: 'Carbon', slug: 'carbon', namespace: '@official', description: 'Deep charcoal surfaces with electric blue accents. Designed for data-heavy interfaces.', version: '2.4.0', downloads: 15678, updatedAt: '2026-04-03', author: 'decantr' },
  { id: '8', type: 'pattern', name: 'KPI Grid', slug: 'kpi-grid', namespace: '@official', description: 'Grid of key performance indicator cards with trend indicators and sparklines.', version: '1.3.0', downloads: 8901, updatedAt: '2026-03-20', author: 'decantr' },
  { id: '9', type: 'blueprint', name: 'Registry Platform', slug: 'registry-platform', namespace: '@official', description: 'Design registry with browsing, publishing, and moderation workflows.', version: '1.0.0', downloads: 3421, updatedAt: '2026-04-06', author: 'decantr' },
  { id: '10', type: 'archetype', name: 'Auth Flow', slug: 'auth-flow', namespace: '@official', description: 'Login, registration, and password recovery with OAuth support.', version: '2.2.0', downloads: 6789, updatedAt: '2026-03-22', author: 'decantr' },
  { id: '11', type: 'pattern', name: 'Activity Feed', slug: 'activity-feed', namespace: '@community', description: 'Chronological timeline of events with avatars and timestamps.', version: '1.1.0', downloads: 4523, updatedAt: '2026-03-18', author: 'sarah_dev' },
  { id: '12', type: 'pattern', name: 'JSON Viewer', slug: 'json-viewer', namespace: '@community', description: 'Collapsible JSON viewer with syntax highlighting and copy-to-clipboard.', version: '1.4.0', downloads: 5678, updatedAt: '2026-03-15', author: 'alex_code' },
];

export const registryKPIs: KPI[] = [
  { label: 'Total Patterns', value: 116, trend: 12.5, icon: 'grid' },
  { label: 'Active Themes', value: 20, trend: 5.0, icon: 'palette' },
  { label: 'Blueprints', value: 19, trend: 8.3, icon: 'layout' },
  { label: 'Total Downloads', value: 142891, trend: 23.7, icon: 'download' },
];

export const dashboardKPIs: KPI[] = [
  { label: 'Published Items', value: 14, trend: 16.7, icon: 'package' },
  { label: 'Total Downloads', value: 34521, trend: 12.3, icon: 'download' },
  { label: 'API Calls (30d)', value: 8943, trend: -3.2, icon: 'activity' },
  { label: 'Reputation Score', value: 187, trend: 8.1, icon: 'star' },
];

export const billingKPIs: KPI[] = [
  { label: 'Current Spend', value: 29, trend: 0, icon: 'dollar' },
  { label: 'API Calls', value: 8943, trend: 12.3, icon: 'activity' },
  { label: 'Storage Used', value: 2.4, trend: 5.1, icon: 'database' },
  { label: 'Team Members', value: 4, trend: 0, icon: 'users' },
];

export const teamKPIs: KPI[] = [
  { label: 'Team Members', value: 4, trend: 0, icon: 'users' },
  { label: 'Pending Invites', value: 2, trend: 100, icon: 'mail' },
  { label: 'Active This Week', value: 3, trend: -25, icon: 'activity' },
  { label: 'Items Published', value: 14, trend: 16.7, icon: 'package' },
];

export const recentActivity: ActivityEvent[] = [
  { id: '1', user: 'You', initials: 'YO', action: 'published pattern hero-section v2.1.0', timestamp: '2h ago', date: 'Today', dotColor: '#00E0AB' },
  { id: '2', user: 'Sarah Chen', initials: 'SC', action: 'forked blueprint saas-dashboard', timestamp: '4h ago', date: 'Today', dotColor: '#0AF3EB' },
  { id: '3', user: 'You', initials: 'YO', action: 'updated theme luminarum to v3.0.0', timestamp: '6h ago', date: 'Today', dotColor: '#FDA303' },
  { id: '4', user: 'Alex Rivera', initials: 'AR', action: 'downloaded pattern search-filter-bar', timestamp: '8h ago', date: 'Today', dotColor: '#FE4474' },
  { id: '5', user: 'You', initials: 'YO', action: 'created API key "CI Pipeline"', timestamp: '1d ago', date: 'Yesterday', dotColor: '#6500C6' },
  { id: '6', user: 'Jordan Kim', initials: 'JK', action: 'submitted pattern nav-sidebar for review', timestamp: '1d ago', date: 'Yesterday', dotColor: '#FDA303' },
  { id: '7', user: 'You', initials: 'YO', action: 'approved pattern activity-feed v1.1.0', timestamp: '2d ago', date: '2026-04-06', dotColor: '#00E0AB' },
];

export const apiKeys: ApiKey[] = [
  { id: '1', name: 'Production API', maskedKey: 'sk-****...8f3a', fullKey: 'sk-prod-a1b2c3d4e5f6g7h8f3a', scopes: ['read', 'write'], createdAt: '2026-01-15', lastUsed: '2h ago' },
  { id: '2', name: 'CI Pipeline', maskedKey: 'sk-****...2d7e', fullKey: 'sk-ci-z9y8x7w6v5u4t3s2d7e', scopes: ['read'], createdAt: '2026-03-01', lastUsed: '1d ago' },
  { id: '3', name: 'Local Development', maskedKey: 'sk-****...9b1c', fullKey: 'sk-dev-m1n2o3p4q5r6s7t9b1c', scopes: ['read', 'write', 'admin'], createdAt: '2026-02-20', lastUsed: '5m ago' },
];

export const teamMembers: TeamMember[] = [
  { id: '1', name: 'You', email: 'you@decantr.ai', role: 'owner', joinedAt: '2025-11-01', initials: 'YO' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@decantr.ai', role: 'admin', joinedAt: '2025-12-15', initials: 'SC' },
  { id: '3', name: 'Alex Rivera', email: 'alex@decantr.ai', role: 'member', joinedAt: '2026-01-20', initials: 'AR' },
  { id: '4', name: 'Jordan Kim', email: 'jordan@decantr.ai', role: 'member', joinedAt: '2026-02-10', initials: 'JK' },
];

export const moderationQueue: ModerationItem[] = [
  {
    id: '1',
    content: { id: 'm1', type: 'pattern', name: 'Data Table Pro', slug: 'data-table-pro', namespace: '@community', description: 'Advanced data table with sorting, filtering, virtual scroll, and column resizing.', version: '1.0.0', downloads: 0, updatedAt: '2026-04-07', author: 'alex_code' },
    submitter: { name: 'Alex Rivera', initials: 'AR', reputation: 87, level: 'Trusted' },
    submittedAt: '3h ago',
    status: 'pending',
    notes: '',
  },
  {
    id: '2',
    content: { id: 'm2', type: 'theme', name: 'Midnight Bloom', slug: 'midnight-bloom', namespace: '@community', description: 'Deep purple palette with pink accent gradients. Feminine and modern.', version: '1.0.0', downloads: 0, updatedAt: '2026-04-06', author: 'jordan_designs' },
    submitter: { name: 'Jordan Kim', initials: 'JK', reputation: 42, level: 'Contributor' },
    submittedAt: '8h ago',
    status: 'pending',
    notes: '',
  },
  {
    id: '3',
    content: { id: 'm3', type: 'pattern', name: 'Notification Center', slug: 'notification-center', namespace: '@community', description: 'Dropdown notification panel with read/unread states and action buttons.', version: '1.0.0', downloads: 0, updatedAt: '2026-04-05', author: 'new_dev_42' },
    submitter: { name: 'New Developer', initials: 'ND', reputation: 5, level: 'Newcomer' },
    submittedAt: '1d ago',
    status: 'pending',
    notes: '',
  },
];

export const tierPlans: TierPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'For individuals exploring the registry',
    features: ['Browse all content', '5 downloads/day', '1 API key', 'Community support'],
    popular: false,
    current: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    description: 'For developers building with Decantr',
    features: ['Unlimited downloads', '10 API keys', 'Publish content', 'Priority support', 'Private namespaces'],
    popular: true,
    current: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: 79,
    description: 'For teams shipping design systems',
    features: ['Everything in Pro', 'Unlimited API keys', 'Team management', 'Admin moderation', 'SSO/SAML', 'SLA guarantee'],
    popular: false,
    current: false,
  },
];

export const sampleJson = {
  name: "hero-section",
  version: "2.1.0",
  type: "pattern",
  namespace: "@official",
  data: {
    components: ["Hero", "Headline", "Subtext", "CTAButton", "BackgroundImage"],
    slots: {
      headline: { type: "text", required: true },
      subtext: { type: "text", required: false },
      cta_primary: { type: "button", required: true },
      cta_secondary: { type: "button", required: false },
      background: { type: "image", required: false }
    },
    layout: "Stack(center) > [Headline + Subtext + Row > [CTA_Primary + CTA_Secondary]]",
    responsive: {
      mobile: "Stack padding-x-4",
      tablet: "Stack padding-x-8",
      desktop: "Stack padding-x-16 max-width-1200"
    }
  }
};
