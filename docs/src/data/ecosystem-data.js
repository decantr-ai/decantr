/**
 * Mock community registry data for Ecosystem tab
 * Simulates what the real registry API would return
 */
export const ecosystemItems = [
  {
    id: 'retro-style',
    name: 'Retro',
    type: 'style',
    description: 'Synthwave-inspired with neon accents and CRT effects',
    downloads: 2847,
    author: { username: 'synthdev', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=synthdev' },
  },
  {
    id: 'bioluminescent-style',
    name: 'Bioluminescent',
    type: 'style',
    description: 'Deep sea glow with organic gradients and subtle animations',
    downloads: 1923,
    author: { username: 'oceanix', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=oceanix' },
  },
  {
    id: 'kanban-pattern',
    name: 'Kanban Board',
    type: 'pattern',
    description: 'Drag-and-drop task board with swimlanes and WIP limits',
    downloads: 4521,
    author: { username: 'agiledev', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=agiledev' },
  },
  {
    id: 'chat-interface-pattern',
    name: 'Chat Interface',
    type: 'pattern',
    description: 'Real-time messaging with typing indicators and reactions',
    downloads: 3156,
    author: { username: 'msgmaster', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=msgmaster' },
  },
  {
    id: 'gaming-platform-archetype',
    name: 'Gaming Platform',
    type: 'archetype',
    description: 'Full gaming dashboard with leaderboards, achievements, and profiles',
    downloads: 1284,
    author: { username: 'gamecraft', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=gamecraft' },
  },
  {
    id: 'launchpad-recipe',
    name: 'Launchpad',
    type: 'recipe',
    description: 'Startup-focused visual language with vibrant CTAs',
    downloads: 2103,
    author: { username: 'founderhq', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=founderhq' },
  },
  {
    id: 'timeline-pattern',
    name: 'Timeline',
    type: 'pattern',
    description: 'Vertical timeline with milestones and collapsible details',
    downloads: 1876,
    author: { username: 'chronodev', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=chronodev' },
  },
  {
    id: 'dopamine-style',
    name: 'Dopamine',
    type: 'style',
    description: 'Playful, high-energy design with bold colors and animations',
    downloads: 1542,
    author: { username: 'happyui', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=happyui' },
  },
  {
    id: 'editorial-style',
    name: 'Editorial',
    type: 'style',
    description: 'Magazine-inspired typography and layouts for content sites',
    downloads: 987,
    author: { username: 'typesmith', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=typesmith' },
  },
];

export const ecosystemStats = {
  totalItems: 127,
  totalDownloads: 48293,
  contributors: 43,
};
