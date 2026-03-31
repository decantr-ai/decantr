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
    description: 'AI chatbot platform with dashboard, settings, and marketing pages',
  },
];

export const currentShowcase = showcases.find(
  (s) => s.slug === 'carbon-ai-portal'
)!;
