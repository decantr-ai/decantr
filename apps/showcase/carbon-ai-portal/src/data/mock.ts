export interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  pinned?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
}

export interface ConversationMessages {
  [conversationId: string]: Message[];
}

export const conversations: Conversation[] = [
  {
    id: 'c1',
    title: 'Refactor authentication flow',
    preview: 'Let me walk through the OAuth callback handler...',
    timestamp: '2m',
    pinned: true,
  },
  {
    id: 'c2',
    title: 'PostgreSQL query optimization',
    preview: 'The EXPLAIN ANALYZE output suggests a sequential scan...',
    timestamp: '18m',
  },
  {
    id: 'c3',
    title: 'Design system color tokens',
    preview: 'A muted stormy-blue palette reads as trustworthy...',
    timestamp: '1h',
  },
  {
    id: 'c4',
    title: 'TypeScript generics review',
    preview: 'Conditional types can infer from the input shape...',
    timestamp: '3h',
  },
  {
    id: 'c5',
    title: 'Kubernetes ingress setup',
    preview: 'You will want to configure the TLS secret first...',
    timestamp: 'Yesterday',
  },
  {
    id: 'c6',
    title: 'React server components patterns',
    preview: 'Server components do not re-render on the client...',
    timestamp: 'Yesterday',
  },
  {
    id: 'c7',
    title: 'Vector database selection',
    preview: 'For under ten million vectors, pgvector is sufficient...',
    timestamp: '2d',
  },
  {
    id: 'c8',
    title: 'Migration from REST to GraphQL',
    preview: 'Start by mapping existing endpoints to resolvers...',
    timestamp: '3d',
  },
  {
    id: 'c9',
    title: 'Rate limiting strategies',
    preview: 'Token bucket works well for bursty traffic...',
    timestamp: '5d',
  },
  {
    id: 'c10',
    title: 'CSS container queries',
    preview: 'Container queries let components adapt independently...',
    timestamp: '1w',
  },
];

export const conversationMessages: ConversationMessages = {
  c1: [
    {
      id: 'm1',
      role: 'user',
      content: 'I need to refactor our authentication flow. The current OAuth implementation has a race condition during token refresh.',
      timestamp: '10:42 AM',
    },
    {
      id: 'm2',
      role: 'assistant',
      content: 'Race conditions in token refresh typically surface when multiple requests attempt to refresh simultaneously. The cleanest pattern is a single-flight refresh: queue concurrent requests behind one refresh promise. Let me show you the approach.\n\nFirst, wrap the refresh logic in a module-scoped promise that de-duplicates calls. When a 401 comes back, check if a refresh is in flight — if so, await it, otherwise start a new one.',
      timestamp: '10:42 AM',
      model: 'carbon-4',
    },
    {
      id: 'm3',
      role: 'user',
      content: 'Can you show me the implementation?',
      timestamp: '10:44 AM',
    },
    {
      id: 'm4',
      role: 'assistant',
      content: 'Here is a minimal single-flight refresh wrapper. It coalesces concurrent refresh attempts into a single network call and clears the promise on completion so subsequent 401s can trigger a new refresh.\n\nThe key insight is that `refreshPromise` lives at module scope, so every call site shares it. When the refresh resolves, we null it out. Any request that hit a 401 while refresh was in flight simply awaits the same promise and retries with the new token.',
      timestamp: '10:45 AM',
      model: 'carbon-4',
    },
  ],
  c2: [
    {
      id: 'm1',
      role: 'user',
      content: 'My PostgreSQL query is slow. Running EXPLAIN ANALYZE shows a sequential scan on a 4M row table.',
      timestamp: '9:12 AM',
    },
    {
      id: 'm2',
      role: 'assistant',
      content: 'A sequential scan on 4M rows usually means either a missing index or a predicate the planner cannot use. Share the query and the EXPLAIN output and I can point to the exact issue. In most cases adding a composite index on the WHERE columns (in selectivity order) resolves it.',
      timestamp: '9:13 AM',
      model: 'carbon-4',
    },
  ],
  c3: [
    {
      id: 'm1',
      role: 'user',
      content: 'What colors should I use for a serious, trustworthy developer tool?',
      timestamp: '8:01 AM',
    },
    {
      id: 'm2',
      role: 'assistant',
      content: 'A muted stormy-blue palette reads as trustworthy and technical without feeling cold. Pair a desaturated slate background with a single accent blue — something around hue 210, saturation 25%, lightness 55%. Keep contrast ratios at WCAG AA and use neutral grays for secondary text.',
      timestamp: '8:02 AM',
      model: 'carbon-4',
    },
  ],
};

export const defaultMessages: Message[] = conversationMessages.c1;

export const suggestedPrompts = [
  'Explain this codebase',
  'Review my pull request',
  'Debug a failing test',
  'Design a database schema',
];

export interface UserSettings {
  name: string;
  email: string;
  timezone: string;
  language: string;
  theme: 'carbon' | 'light';
  notifications: {
    email: boolean;
    product: boolean;
    security: boolean;
  };
  mfa: {
    enabled: boolean;
    method: 'app' | 'sms' | null;
  };
}

export const defaultSettings: UserSettings = {
  name: 'Avery Chen',
  email: 'avery@carbonlabs.ai',
  timezone: 'America/Los_Angeles',
  language: 'English',
  theme: 'carbon',
  notifications: {
    email: true,
    product: true,
    security: true,
  },
  mfa: {
    enabled: true,
    method: 'app',
  },
};

export interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export const sessions: Session[] = [
  { id: 's1', device: 'MacBook Pro · Chrome', location: 'San Francisco, US', lastActive: 'Active now', current: true },
  { id: 's2', device: 'iPhone 15 · Safari', location: 'San Francisco, US', lastActive: '2 hours ago', current: false },
  { id: 's3', device: 'iPad Pro · Safari', location: 'Oakland, US', lastActive: 'Yesterday', current: false },
];

// Simulate a streaming AI response token-by-token
export function streamResponse(
  prompt: string,
  onToken: (chunk: string) => void,
  onDone: () => void,
): () => void {
  const response = generateResponse(prompt);
  const tokens = response.split(/(\s+)/);
  let i = 0;
  let cancelled = false;

  function tick() {
    if (cancelled) return;
    if (i >= tokens.length) {
      onDone();
      return;
    }
    onToken(tokens[i]);
    i += 1;
    const delay = 20 + Math.random() * 45;
    setTimeout(tick, delay);
  }

  setTimeout(tick, 180);

  return () => {
    cancelled = true;
  };
}

function generateResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi ')) {
    return 'Hello. How can I help you today? I can review code, explain concepts, or work through a problem with you step by step.';
  }
  if (lower.includes('code') || lower.includes('function') || lower.includes('refactor')) {
    return 'I can help with that. Could you paste the relevant code or describe the current behavior and what you want it to do? I will walk through the changes carefully and flag anything that might break downstream.';
  }
  if (lower.includes('database') || lower.includes('sql') || lower.includes('query')) {
    return 'For query performance, start with EXPLAIN ANALYZE to see the actual plan. Sequential scans on large tables usually mean a missing index or a predicate the planner cannot use directly. Share the query and I will suggest specific optimizations.';
  }
  return 'That is an interesting question. Let me think through it carefully. The answer depends on a few factors — the scale of your data, the consistency requirements, and the expected access patterns. Could you share more context so I can give you a specific recommendation rather than general advice?';
}
