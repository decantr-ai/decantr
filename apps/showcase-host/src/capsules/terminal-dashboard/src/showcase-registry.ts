export interface ShowcaseEntry {
  slug: string;
  name: string;
  theme: string;
  description: string;
}

export const showcases: ShowcaseEntry[] = [
  {
    slug: 'carbon-ai-portal',
    name: 'Carbon AI Portal',
    theme: 'carbon/dark',
    description: 'AI chatbot platform',
  },
  {
    slug: 'terminal-dashboard',
    name: 'Terminal Dashboard',
    theme: 'terminal/dark',
    description: 'Developer monitoring dashboard',
  },
];

export const currentShowcase = showcases.find(s => s.slug === 'terminal-dashboard')!;
