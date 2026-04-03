export interface ShowcaseEntry {
  slug: string;
  name: string;
  theme: string;
  description: string;
}

export const showcases: ShowcaseEntry[] = [
  {
    slug: 'terminal-dashboard',
    name: 'Terminal Dashboard',
    theme: 'terminal/dark',
    description: 'Developer monitoring dashboard',
  },
  {
    slug: 'agent-marketplace',
    name: 'Agent Marketplace',
    theme: 'carbon-neon/dark',
    description: 'AI agent orchestration platform',
  },
];

export const currentShowcase = showcases.find(s => s.slug === 'agent-marketplace')!;
