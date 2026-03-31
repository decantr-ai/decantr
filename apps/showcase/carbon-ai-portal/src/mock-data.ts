// ---------------------------------------------------------------------------
// Mock data for the Carbon AI Portal showcase
// ---------------------------------------------------------------------------

// -- Interfaces -------------------------------------------------------------

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'flat';
}

export interface Conversation {
  id: string;
  user: string;
  topic: string;
  status: 'active' | 'resolved' | 'waiting';
  messages: number;
  lastActive: string;
}

export interface NavItem {
  label: string;
  path: string;
}

export interface SettingsSection {
  id: string;
  label: string;
  description: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
}

// -- Data -------------------------------------------------------------------

export const chatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'How do I handle errors in an async function in TypeScript?',
    timestamp: '2026-03-31T09:12:00Z',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content:
      'You can wrap the body of your `async` function in a `try / catch` block:\n\n```ts\nasync function fetchData(url: string): Promise<Response> {\n  try {\n    const res = await fetch(url);\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    return res;\n  } catch (err) {\n    console.error("Request failed:", err);\n    throw err;\n  }\n}\n```\n\nA few tips:\n- Always **re-throw** or return a sensible default so callers know something went wrong.\n- Use a **custom error class** when you need to distinguish between error types downstream.\n- Consider a result-type pattern (`{ ok: true; data } | { ok: false; error }`) for more explicit control flow.',
    timestamp: '2026-03-31T09:12:08Z',
  },
  {
    id: 'msg-3',
    role: 'user',
    content:
      'That makes sense. Can you show me the result-type pattern you mentioned?',
    timestamp: '2026-03-31T09:13:22Z',
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content:
      'Sure! Here is a minimal implementation:\n\n```ts\ntype Result<T, E = Error> =\n  | { ok: true; data: T }\n  | { ok: false; error: E };\n\nasync function safeFetch(url: string): Promise<Result<Response>> {\n  try {\n    const res = await fetch(url);\n    if (!res.ok) {\n      return { ok: false, error: new Error(`HTTP ${res.status}`) };\n    }\n    return { ok: true, data: res };\n  } catch (err) {\n    return { ok: false, error: err as Error };\n  }\n}\n```\n\nThe caller can then use a **type guard**:\n\n```ts\nconst result = await safeFetch("/api/users");\nif (result.ok) {\n  console.log(result.data); // fully typed as Response\n} else {\n  console.error(result.error.message);\n}\n```\n\nThis avoids `try/catch` at every call site and keeps error handling **explicit** in the return type.',
    timestamp: '2026-03-31T09:13:35Z',
  },
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: 'Total Conversations', value: '12,847', change: '+14.2%', trend: 'up' },
  { label: 'Active Users', value: '3,421', change: '+8.7%', trend: 'up' },
  { label: 'Avg Response Time', value: '1.2s', change: '-23.5%', trend: 'down' },
  { label: 'Resolution Rate', value: '94.6%', change: '+2.1%', trend: 'up' },
];

export const recentConversations: Conversation[] = [
  {
    id: 'conv-1',
    user: 'Sarah Chen',
    topic: 'Debugging a memory leak in Node.js',
    status: 'active',
    messages: 12,
    lastActive: '2 min ago',
  },
  {
    id: 'conv-2',
    user: 'Marcus Rivera',
    topic: 'Setting up CI/CD with GitHub Actions',
    status: 'resolved',
    messages: 8,
    lastActive: '1 hour ago',
  },
  {
    id: 'conv-3',
    user: 'Priya Patel',
    topic: 'React Server Components best practices',
    status: 'waiting',
    messages: 5,
    lastActive: '3 hours ago',
  },
  {
    id: 'conv-4',
    user: 'James Okafor',
    topic: 'Optimizing SQL queries for large datasets',
    status: 'active',
    messages: 19,
    lastActive: '10 min ago',
  },
  {
    id: 'conv-5',
    user: 'Lena Johansson',
    topic: 'Migrating from REST to GraphQL',
    status: 'resolved',
    messages: 14,
    lastActive: '1 day ago',
  },
];

export const sidebarNav: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Chat', path: '/chat' },
  { label: 'Conversations', path: '/conversations' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Settings', path: '/settings' },
];

export const topNavItems: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Features', path: '/features' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Docs', path: '/docs' },
];

export const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    label: 'Profile',
    description: 'Manage your account details and preferences.',
  },
  {
    id: 'api-keys',
    label: 'API Keys',
    description: 'Create and revoke API keys for programmatic access.',
  },
  {
    id: 'team',
    label: 'Team',
    description: 'Invite members and configure team permissions.',
  },
  {
    id: 'billing',
    label: 'Billing',
    description: 'View invoices and update your payment method.',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Choose which alerts and digests you receive.',
  },
];

export const features: Feature[] = [
  {
    title: 'Context-Aware Responses',
    description:
      'Our AI retains full conversation history and codebase context, delivering answers that understand your project — not just your question.',
    icon: 'brain',
  },
  {
    title: 'Real-Time Analytics',
    description:
      'Track response quality, resolution rates, and user satisfaction with a live dashboard built for engineering teams.',
    icon: 'chart',
  },
  {
    title: 'Seamless Integrations',
    description:
      'Connect to Slack, GitHub, Jira, and your internal tools in minutes. Deploy on-prem or use our managed cloud.',
    icon: 'plug',
  },
];

export const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'For individuals exploring AI-assisted development.',
    features: [
      '100 messages / month',
      'Single user',
      'Community support',
      'Basic analytics',
    ],
  },
  {
    name: 'Pro',
    price: '$29/mo',
    description: 'For developers and small teams shipping faster.',
    features: [
      'Unlimited messages',
      'Up to 10 team members',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organizations with advanced security and scale needs.',
    features: [
      'Unlimited everything',
      'SSO & SAML',
      'Dedicated account manager',
      'On-prem deployment',
      'SLA guarantee',
      'Audit logs',
    ],
  },
];

export const teamMembers: TeamMember[] = [
  {
    name: 'Amara Osei',
    role: 'CEO & Co-founder',
    avatar: '/avatars/amara.jpg',
  },
  {
    name: 'Daniel Park',
    role: 'CTO & Co-founder',
    avatar: '/avatars/daniel.jpg',
  },
  {
    name: 'Fatima Al-Rashid',
    role: 'Head of AI Research',
    avatar: '/avatars/fatima.jpg',
  },
  {
    name: 'Leo Andersen',
    role: 'Lead Product Designer',
    avatar: '/avatars/leo.jpg',
  },
];
