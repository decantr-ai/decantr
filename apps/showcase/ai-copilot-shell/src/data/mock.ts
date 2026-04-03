// ── Workspace items ──

export interface WorkspaceItem {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  updatedAt: string;
  tags: string[];
}

export const workspaceItems: WorkspaceItem[] = [
  {
    id: 'proj-1',
    title: 'API Gateway Refactor',
    description: 'Migrate REST endpoints to GraphQL federation with rate limiting and auth middleware.',
    status: 'active',
    updatedAt: '2 hours ago',
    tags: ['backend', 'infrastructure'],
  },
  {
    id: 'proj-2',
    title: 'Design System v3',
    description: 'Component library upgrade with new token system, dark mode, and accessibility improvements.',
    status: 'active',
    updatedAt: '4 hours ago',
    tags: ['frontend', 'design'],
  },
  {
    id: 'proj-3',
    title: 'ML Pipeline Optimization',
    description: 'Reduce inference latency by 40% through model quantization and batch processing.',
    status: 'draft',
    updatedAt: '1 day ago',
    tags: ['ml', 'performance'],
  },
  {
    id: 'proj-4',
    title: 'User Onboarding Flow',
    description: 'Redesign the first-run experience with progressive disclosure and contextual tooltips.',
    status: 'active',
    updatedAt: '3 days ago',
    tags: ['product', 'ux'],
  },
  {
    id: 'proj-5',
    title: 'Data Export Pipeline',
    description: 'Build CSV/JSON export with streaming for large datasets and scheduled delivery.',
    status: 'archived',
    updatedAt: '1 week ago',
    tags: ['backend', 'data'],
  },
];

// ── Copilot conversations ──

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: string;
}

export const copilotMessages: CopilotMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'How should I structure the auth middleware for the API gateway?',
    timestamp: '10:24 AM',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'For the API Gateway refactor, I\'d recommend a layered middleware approach:\n\n1. **Token validation** — Verify JWT signatures and expiry at the edge\n2. **Rate limiting** — Per-user token bucket with Redis backing\n3. **Permission check** — Role-based access control against the route manifest\n\nThis keeps each concern isolated and testable. Want me to generate the middleware chain?',
    timestamp: '10:24 AM',
    context: 'API Gateway Refactor',
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'Yes, generate the middleware chain. Use TypeScript with Express-style handlers.',
    timestamp: '10:25 AM',
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content: '```typescript\nimport { Request, Response, NextFunction } from \'express\';\n\nconst validateToken = async (req: Request, res: Response, next: NextFunction) => {\n  const token = req.headers.authorization?.split(\' \')[1];\n  if (!token) return res.status(401).json({ error: \'Missing token\' });\n  \n  try {\n    req.user = await verifyJWT(token);\n    next();\n  } catch {\n    res.status(401).json({ error: \'Invalid token\' });\n  }\n};\n\nconst rateLimit = createRateLimiter({\n  windowMs: 60_000,\n  max: 100,\n  keyGenerator: (req) => req.user?.id ?? req.ip,\n});\n```\n\nThis gives you token validation and rate limiting. Shall I add the RBAC layer next?',
    timestamp: '10:25 AM',
    context: 'API Gateway Refactor',
  },
  {
    id: 'msg-5',
    role: 'user',
    content: 'Add the RBAC layer with route-level permissions.',
    timestamp: '10:26 AM',
  },
  {
    id: 'msg-6',
    role: 'assistant',
    content: '```typescript\ninterface RoutePermission {\n  path: string;\n  method: string;\n  roles: string[];\n}\n\nconst routeManifest: RoutePermission[] = [\n  { path: \'/api/users\', method: \'GET\', roles: [\'admin\', \'viewer\'] },\n  { path: \'/api/users\', method: \'POST\', roles: [\'admin\'] },\n  { path: \'/api/reports\', method: \'GET\', roles: [\'admin\', \'analyst\'] },\n];\n\nconst checkPermission = (req: Request, res: Response, next: NextFunction) => {\n  const route = routeManifest.find(\n    r => req.path.startsWith(r.path) && r.method === req.method\n  );\n  if (!route) return next();\n  if (!route.roles.includes(req.user.role)) {\n    return res.status(403).json({ error: \'Insufficient permissions\' });\n  }\n  next();\n};\n```\n\nThe full chain: `validateToken → rateLimit → checkPermission → handler`',
    timestamp: '10:26 AM',
    context: 'API Gateway Refactor',
  },
];

export const workspaceDetailMessages: CopilotMessage[] = [
  {
    id: 'det-1',
    role: 'assistant',
    content: 'I\'m looking at the **API Gateway Refactor** project. Here\'s what I can see:\n\n- 3 open tasks, 2 in progress\n- Last commit: `feat: add JWT validation middleware`\n- Test coverage: 84%\n\nWhat would you like to work on?',
    timestamp: '10:30 AM',
    context: 'API Gateway Refactor',
  },
  {
    id: 'det-2',
    role: 'user',
    content: 'Show me the test coverage gaps.',
    timestamp: '10:31 AM',
  },
  {
    id: 'det-3',
    role: 'assistant',
    content: 'The coverage gaps are concentrated in two areas:\n\n| Module | Coverage | Missing |\n|--------|----------|--------|\n| `rate-limiter.ts` | 62% | Redis connection failure, window reset edge case |\n| `rbac.ts` | 71% | Wildcard route matching, nested role inheritance |\n| `jwt.ts` | 98% | Only missing expired token with clock skew |\n\nI\'d prioritize `rate-limiter.ts` — the Redis failure path is a production risk. Want me to generate those test cases?',
    timestamp: '10:31 AM',
    context: 'API Gateway Refactor',
  },
];

// ── Settings ──

export interface CopilotSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  contextWindow: string;
  autoSuggestions: boolean;
  inlineSuggestions: boolean;
  codeGeneration: boolean;
  language: string;
  permissions: {
    readFiles: boolean;
    writeFiles: boolean;
    executeCommands: boolean;
    accessNetwork: boolean;
  };
}

export const copilotSettings: CopilotSettings = {
  model: 'claude-opus-4-20250514',
  temperature: 0.3,
  maxTokens: 4096,
  contextWindow: '200K',
  autoSuggestions: true,
  inlineSuggestions: true,
  codeGeneration: true,
  language: 'TypeScript',
  permissions: {
    readFiles: true,
    writeFiles: true,
    executeCommands: false,
    accessNetwork: true,
  },
};

export interface AppSettings {
  displayName: string;
  email: string;
  avatar: string;
  theme: 'dark' | 'light' | 'system';
  notifications: boolean;
  compactMode: boolean;
  timezone: string;
}

export const appSettings: AppSettings = {
  displayName: 'Alex Chen',
  email: 'alex@example.com',
  avatar: 'AC',
  theme: 'dark',
  notifications: true,
  compactMode: false,
  timezone: 'America/New_York',
};

// ── Marketing features ──

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    icon: 'brain',
    title: 'Context-Aware Suggestions',
    description: 'The copilot reads your current workspace and provides relevant suggestions based on what you are working on.',
  },
  {
    icon: 'code',
    title: 'Code Generation',
    description: 'Generate boilerplate, tests, and documentation from natural language descriptions with one-click accept.',
  },
  {
    icon: 'shield',
    title: 'Permission Controls',
    description: 'Fine-grained control over what the AI can access. Read-only, write, or execute — you decide the boundaries.',
  },
  {
    icon: 'zap',
    title: 'Keyboard-First',
    description: 'Cmd+K to open, natural language to query. The copilot stays out of your way until you need it.',
  },
  {
    icon: 'git-branch',
    title: 'Version Aware',
    description: 'Understands your git history, branch context, and recent changes to provide grounded suggestions.',
  },
  {
    icon: 'lock',
    title: 'Private by Default',
    description: 'Your code never leaves your environment. All inference runs locally or through your own API keys.',
  },
];

export interface Step {
  number: number;
  title: string;
  description: string;
}

export const howItWorksSteps: Step[] = [
  {
    number: 1,
    title: 'Open the Copilot',
    description: 'Press Cmd+K or click the Ask AI button to open the copilot panel alongside your workspace.',
  },
  {
    number: 2,
    title: 'Ask or Accept',
    description: 'Type a question in natural language, or review and accept inline suggestions as you work.',
  },
  {
    number: 3,
    title: 'Apply with Confidence',
    description: 'Review generated code diffs, accept or reject changes, and watch the copilot learn from your preferences.',
  },
];

// ── Nav items ──

export interface NavItem {
  icon: string;
  label: string;
  href: string;
  group?: string;
}

export const sidebarNavItems: NavItem[] = [
  { icon: 'layout-dashboard', label: 'Workspace', href: '/workspace', group: 'Main' },
  { icon: 'bot', label: 'Copilot Config', href: '/copilot/config', group: 'AI' },
  { icon: 'settings', label: 'Settings', href: '/settings', group: 'Account' },
];
