// Centralized mock data for the registry-platform showcase

export type ContentType = 'pattern' | 'theme' | 'blueprint' | 'shell' | 'archetype';

export interface ContentItem {
  id: string;
  type: ContentType;
  name: string;
  slug: string;
  namespace: string;
  description: string;
  version: string;
  downloads: number;
  updatedAt: string;
  author: string;
  tags?: string[];
}

export interface KPIStat {
  label: string;
  value: number;
  trend: number;
  icon: string;
}

export interface ActivityEvent {
  id: string;
  user: string;
  avatar?: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'publish' | 'update' | 'review' | 'download' | 'comment';
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
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
  avatar?: string;
}

export interface ModerationItem {
  id: string;
  content: ContentItem;
  submitter: { name: string; email: string; reputation: number; level: string };
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

// ── Content items ──
export const CONTENT_ITEMS: ContentItem[] = [
  { id: '1', type: 'pattern', name: 'Hero Section', slug: 'hero', namespace: '@official', description: 'Full-width hero with headline, subtext, CTA buttons, and optional media.', version: '2.1.0', downloads: 12840, updatedAt: '2026-03-28', author: 'decantr', tags: ['landing', 'marketing'] },
  { id: '2', type: 'pattern', name: 'Search Filter Bar', slug: 'search-filter-bar', namespace: '@official', description: 'Search input with type and namespace dropdown filters for browsing registry content.', version: '1.4.0', downloads: 9210, updatedAt: '2026-03-30', author: 'decantr', tags: ['search', 'filter'] },
  { id: '3', type: 'theme', name: 'Luminarum', slug: 'luminarum', namespace: '@official', description: 'Vibrant dark theme with warm coral and amber accents. Pill-shaped elements.', version: '3.0.0', downloads: 18500, updatedAt: '2026-04-01', author: 'decantr', tags: ['dark', 'vibrant'] },
  { id: '4', type: 'blueprint', name: 'Registry Platform', slug: 'registry-platform', namespace: '@official', description: 'Complete design registry with browsing, publishing, API keys, and admin moderation.', version: '1.0.0', downloads: 3420, updatedAt: '2026-04-02', author: 'decantr', tags: ['registry', 'platform'] },
  { id: '5', type: 'pattern', name: 'Content Card Grid', slug: 'content-card-grid', namespace: '@official', description: 'Responsive grid of registry content cards with type badges and quick actions.', version: '1.2.0', downloads: 7650, updatedAt: '2026-03-25', author: 'decantr', tags: ['grid', 'cards'] },
  { id: '6', type: 'shell', name: 'Sidebar Main', slug: 'sidebar-main', namespace: '@official', description: 'Collapsible sidebar with header bar and scrollable main content area.', version: '1.1.0', downloads: 11200, updatedAt: '2026-03-20', author: 'decantr', tags: ['dashboard', 'sidebar'] },
  { id: '7', type: 'theme', name: 'Carbon Neon', slug: 'carbon-neon', namespace: '@official', description: 'High-contrast dark theme with neon green accents and glassmorphic surfaces.', version: '2.5.0', downloads: 15300, updatedAt: '2026-03-22', author: 'decantr', tags: ['dark', 'neon'] },
  { id: '8', type: 'pattern', name: 'KPI Grid', slug: 'kpi-grid', namespace: '@official', description: 'Grid of key performance indicator cards with metrics, trends, and sparklines.', version: '1.3.0', downloads: 6800, updatedAt: '2026-03-18', author: 'decantr', tags: ['dashboard', 'metrics'] },
  { id: '9', type: 'blueprint', name: 'Agent Marketplace', slug: 'agent-marketplace', namespace: '@official', description: 'AI agent deployment platform with marketplace, monitoring, and transparency views.', version: '1.2.0', downloads: 4100, updatedAt: '2026-03-15', author: 'decantr', tags: ['ai', 'agents'] },
  { id: '10', type: 'archetype', name: 'SaaS Dashboard', slug: 'saas-dashboard', namespace: '@official', description: 'Full-featured SaaS dashboard with analytics, user management, and settings.', version: '2.0.0', downloads: 8900, updatedAt: '2026-03-28', author: 'decantr', tags: ['saas', 'dashboard'] },
  { id: '11', type: 'pattern', name: 'Auth Form', slug: 'auth-form', namespace: '@official', description: 'Unified authentication form with login, register, forgot-password, and MFA presets.', version: '1.5.0', downloads: 14200, updatedAt: '2026-04-01', author: 'decantr', tags: ['auth', 'form'] },
  { id: '12', type: 'pattern', name: 'Activity Feed', slug: 'activity-feed', namespace: '@official', description: 'Chronological list of activity events with avatars, timestamps, and actions.', version: '1.1.0', downloads: 5300, updatedAt: '2026-03-12', author: 'decantr', tags: ['feed', 'timeline'] },
  { id: '13', type: 'shell', name: 'Top Nav Main', slug: 'top-nav-main', namespace: '@official', description: 'Horizontal navigation bar with full-width main content below.', version: '1.0.0', downloads: 10800, updatedAt: '2026-03-10', author: 'decantr', tags: ['nav', 'public'] },
  { id: '14', type: 'theme', name: 'Terminal Glow', slug: 'terminal-glow', namespace: '@community', description: 'Retro terminal aesthetic with phosphor green on deep black. Monospace everything.', version: '1.0.0', downloads: 2100, updatedAt: '2026-03-08', author: 'alex_dev', tags: ['retro', 'terminal'] },
  { id: '15', type: 'pattern', name: 'JSON Viewer', slug: 'json-viewer', namespace: '@official', description: 'Collapsible JSON viewer with syntax highlighting and copy-to-clipboard.', version: '1.2.0', downloads: 4500, updatedAt: '2026-03-05', author: 'decantr', tags: ['code', 'json'] },
  { id: '16', type: 'blueprint', name: 'Portfolio Starter', slug: 'portfolio-starter', namespace: '@community', description: 'Minimal portfolio with project showcase, about section, and contact form.', version: '1.1.0', downloads: 6700, updatedAt: '2026-03-01', author: 'maria_ui', tags: ['portfolio', 'personal'] },
  { id: '17', type: 'pattern', name: 'Tier Upgrade Card', slug: 'tier-upgrade-card', namespace: '@official', description: 'Pricing tier card with plan name, feature list, and upgrade CTA.', version: '1.0.0', downloads: 3200, updatedAt: '2026-02-28', author: 'decantr', tags: ['pricing', 'billing'] },
  { id: '18', type: 'pattern', name: 'Team Member Row', slug: 'team-member-row', namespace: '@official', description: 'Team member display row with avatar, name, role badge, and management actions.', version: '1.0.0', downloads: 2800, updatedAt: '2026-02-25', author: 'decantr', tags: ['team', 'settings'] },
];

// ── Registry KPIs ──
export const REGISTRY_KPIS: KPIStat[] = [
  { label: 'Total Items', value: 116, trend: 12.5, icon: 'Package' },
  { label: 'Downloads (30d)', value: 48200, trend: 8.3, icon: 'Download' },
  { label: 'Contributors', value: 34, trend: 15.0, icon: 'Users' },
  { label: 'Themes', value: 20, trend: 5.0, icon: 'Palette' },
];

// ── Dashboard KPIs ──
export const DASHBOARD_KPIS: KPIStat[] = [
  { label: 'Published Items', value: 12, trend: 20.0, icon: 'Package' },
  { label: 'Total Downloads', value: 8420, trend: 14.2, icon: 'Download' },
  { label: 'API Calls (30d)', value: 15600, trend: -3.1, icon: 'Activity' },
  { label: 'Reputation', value: 142, trend: 8.5, icon: 'Star' },
];

// ── Billing KPIs ──
export const BILLING_KPIS: KPIStat[] = [
  { label: 'Current Plan', value: 29, trend: 0, icon: 'CreditCard' },
  { label: 'API Usage', value: 78, trend: 12.0, icon: 'Activity' },
  { label: 'Storage Used', value: 64, trend: 5.0, icon: 'HardDrive' },
  { label: 'Team Seats', value: 3, trend: 0, icon: 'Users' },
];

// ── Team KPIs ──
export const TEAM_KPIS: KPIStat[] = [
  { label: 'Members', value: 5, trend: 25.0, icon: 'Users' },
  { label: 'Active This Week', value: 4, trend: 0, icon: 'Activity' },
  { label: 'Items Published', value: 23, trend: 10.0, icon: 'Package' },
  { label: 'Pending Invites', value: 2, trend: 0, icon: 'Mail' },
];

// ── Activity events ──
export const ACTIVITY_EVENTS: ActivityEvent[] = [
  { id: '1', user: 'Sarah Chen', action: 'published', target: 'hero pattern v2.1.0', timestamp: '2h ago', type: 'publish' },
  { id: '2', user: 'Alex Rivera', action: 'updated', target: 'carbon-neon theme', timestamp: '4h ago', type: 'update' },
  { id: '3', user: 'Jordan Park', action: 'reviewed', target: 'sidebar-main shell', timestamp: '6h ago', type: 'review' },
  { id: '4', user: 'You', action: 'published', target: 'search-filter-bar v1.4.0', timestamp: '1d ago', type: 'publish' },
  { id: '5', user: 'Maria Santos', action: 'downloaded', target: 'luminarum theme', timestamp: '1d ago', type: 'download' },
  { id: '6', user: 'Sam Wilson', action: 'commented on', target: 'auth-form pattern', timestamp: '2d ago', type: 'comment' },
  { id: '7', user: 'You', action: 'updated', target: 'kpi-grid v1.3.0', timestamp: '3d ago', type: 'update' },
  { id: '8', user: 'Lin Zhang', action: 'published', target: 'terminal-glow theme', timestamp: '3d ago', type: 'publish' },
];

// ── API Keys ──
export const API_KEYS: ApiKey[] = [
  { id: '1', name: 'Production', key: 'sk-prod-****...3f2a', scopes: ['read', 'write'], createdAt: '2026-01-15', lastUsed: '2h ago' },
  { id: '2', name: 'CI/CD Pipeline', key: 'sk-ci-****...8b1c', scopes: ['read'], createdAt: '2026-02-20', lastUsed: '1d ago' },
  { id: '3', name: 'Development', key: 'sk-dev-****...5e4d', scopes: ['read', 'write', 'admin'], createdAt: '2026-03-01', lastUsed: '5m ago' },
];

// ── Team Members ──
export const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'You', email: 'you@decantr.dev', role: 'owner', joinedAt: '2025-06-01' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@decantr.dev', role: 'admin', joinedAt: '2025-09-15' },
  { id: '3', name: 'Alex Rivera', email: 'alex@decantr.dev', role: 'member', joinedAt: '2025-11-20' },
  { id: '4', name: 'Jordan Park', email: 'jordan@decantr.dev', role: 'member', joinedAt: '2026-01-10' },
  { id: '5', name: 'Lin Zhang', email: 'lin@decantr.dev', role: 'member', joinedAt: '2026-03-05' },
];

// ── Moderation queue ──
export const MODERATION_ITEMS: ModerationItem[] = [
  {
    id: '1',
    content: { id: 'm1', type: 'pattern', name: 'Data Table Pro', slug: 'data-table-pro', namespace: '@community', description: 'Advanced data table with sorting, filtering, pagination, and inline editing.', version: '1.0.0', downloads: 0, updatedAt: '2026-04-02', author: 'dev_marcus' },
    submitter: { name: 'Marcus Johnson', email: 'marcus@dev.io', reputation: 45, level: 'Contributor' },
    submittedAt: '2026-04-02',
    status: 'pending',
  },
  {
    id: '2',
    content: { id: 'm2', type: 'theme', name: 'Ocean Breeze', slug: 'ocean-breeze', namespace: '@community', description: 'Calming blue palette with subtle wave-inspired gradients and soft shadows.', version: '1.0.0', downloads: 0, updatedAt: '2026-04-01', author: 'aria_design' },
    submitter: { name: 'Aria Kim', email: 'aria@design.co', reputation: 128, level: 'Trusted' },
    submittedAt: '2026-04-01',
    status: 'pending',
  },
  {
    id: '3',
    content: { id: 'm3', type: 'blueprint', name: 'E-commerce Starter', slug: 'ecommerce-starter', namespace: '@community', description: 'Complete e-commerce template with product listing, cart, checkout, and order management.', version: '0.9.0', downloads: 0, updatedAt: '2026-03-30', author: 'shop_dev' },
    submitter: { name: 'Tom Baker', email: 'tom@shop.dev', reputation: 8, level: 'Newcomer' },
    submittedAt: '2026-03-30',
    status: 'pending',
  },
  {
    id: '4',
    content: { id: 'm4', type: 'pattern', name: 'Kanban Board', slug: 'kanban-board', namespace: '@community', description: 'Drag-and-drop kanban board with columns, cards, labels, and assignees.', version: '1.0.0', downloads: 0, updatedAt: '2026-03-29', author: 'pm_tools' },
    submitter: { name: 'Nina Patel', email: 'nina@pm.tools', reputation: 210, level: 'Expert' },
    submittedAt: '2026-03-29',
    status: 'pending',
  },
];

// ── Pricing tiers ──
export const PRICING_TIERS = [
  {
    name: 'Free',
    price: 0,
    description: 'For individuals exploring the registry.',
    features: ['Browse all content', '100 API calls/month', '1 published item', 'Community support'],
    current: false,
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 29,
    description: 'For developers building with Decantr.',
    features: ['Everything in Free', '10,000 API calls/month', 'Unlimited published items', 'API key management', 'Priority support', 'Custom namespaces'],
    current: true,
    highlighted: true,
  },
  {
    name: 'Team',
    price: 79,
    description: 'For teams and organizations.',
    features: ['Everything in Pro', '100,000 API calls/month', 'Team management', 'Admin moderation', 'SSO integration', 'SLA guarantee', 'Dedicated support'],
    current: false,
    highlighted: false,
  },
];

// ── Sample JSON for detail pages ──
export const SAMPLE_JSON = {
  name: "hero",
  type: "pattern",
  version: "2.1.0",
  namespace: "@official",
  description: "Full-width hero with headline, subtext, CTA buttons, and optional media.",
  components: ["Button", "icon"],
  slots: {
    headline: { type: "heading", level: 1 },
    description: { type: "paragraph", muted: true },
    "cta-group": { type: "button-group", direction: "row" },
    media: { type: "media", optional: true }
  },
  presets: ["brand", "split", "vision", "minimal"],
  responsive: {
    mobile: "single-column, stacked",
    tablet: "centered, heading1 scale",
    desktop: "full layout, display scale"
  }
};

// ── Helper: format number ──
export function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toString();
}

// ── Helper: get initials ──
export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Type color map ──
export const TYPE_COLORS: Record<ContentType, string> = {
  pattern: 'var(--d-coral)',
  theme: 'var(--d-amber)',
  blueprint: 'var(--d-cyan)',
  shell: 'var(--d-green)',
  archetype: 'var(--d-purple)',
};
