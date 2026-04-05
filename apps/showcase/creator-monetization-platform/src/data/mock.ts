export type Tier = {
  id: string;
  name: string;
  price: number;
  color: 'free' | 'fan' | 'super' | 'patron';
  description: string;
  benefits: string[];
  subscribers: number;
};

export type Creator = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  cover: string;
  bio: string;
  category: string;
  subscribers: number;
  posts: number;
  monthlyRevenue: number;
  tiers: Tier[];
  links: { label: string; url: string }[];
};

export type Post = {
  id: string;
  creatorId: string;
  title: string;
  excerpt: string;
  body: string;
  cover: string;
  tier: 'free' | 'fan' | 'super' | 'patron';
  publishedAt: string;
  likes: number;
  comments: number;
  mediaType: 'article' | 'video' | 'audio' | 'image';
};

export type Subscriber = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  tier: string;
  tierColor: 'fan' | 'super' | 'patron';
  since: string;
  lifetimeValue: number;
  lastActive: string;
};

export type Fan = {
  id: string;
  name: string;
  avatar: string;
  subscriptions: { creatorId: string; tierId: string; since: string; nextBilling: string }[];
};

const AVATARS = [
  'https://i.pravatar.cc/120?img=12',
  'https://i.pravatar.cc/120?img=32',
  'https://i.pravatar.cc/120?img=47',
  'https://i.pravatar.cc/120?img=56',
  'https://i.pravatar.cc/120?img=68',
  'https://i.pravatar.cc/120?img=23',
];

export const tiers: Tier[] = [
  {
    id: 't-free', name: 'Follower', price: 0, color: 'free',
    description: 'Follow for free updates and occasional public posts.',
    benefits: ['Public posts', 'Community updates', 'Monthly newsletter'],
    subscribers: 4820,
  },
  {
    id: 't-fan', name: 'Fan', price: 5, color: 'fan',
    description: 'Support the work and unlock weekly behind-the-scenes content.',
    benefits: ['Everything in Follower', 'Weekly BTS posts', 'Fan-only Discord', 'Early previews'],
    subscribers: 892,
  },
  {
    id: 't-super', name: 'Super Fan', price: 15, color: 'super',
    description: 'Deeper access with downloadable files and monthly Q&A.',
    benefits: ['Everything in Fan', 'HD downloads', 'Monthly livestream Q&A', 'Source files', 'Credits in work'],
    subscribers: 241,
  },
  {
    id: 't-patron', name: 'Patron', price: 50, color: 'patron',
    description: 'The inner circle. Direct access and commissioned work.',
    benefits: ['Everything in Super Fan', '1:1 monthly call', 'Commission a piece', 'Signed print annually', 'Your name in the credits'],
    subscribers: 34,
  },
];

export const creators: Creator[] = [
  {
    id: 'c-1', username: 'mayaink', name: 'Maya Okafor',
    avatar: AVATARS[0],
    cover: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&h=400&fit=crop',
    bio: 'Illustrator and visual essayist. Drawing stories about memory, migration, and the domestic interior.',
    category: 'Illustration',
    subscribers: 5987, posts: 142, monthlyRevenue: 8340,
    tiers, links: [
      { label: 'Instagram', url: 'https://instagram.com' },
      { label: 'Portfolio', url: 'https://mayaink.art' },
    ],
  },
  {
    id: 'c-2', username: 'noahsound', name: 'Noah Bellweather',
    avatar: AVATARS[1],
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=400&fit=crop',
    bio: 'Ambient composer. Field recordings, modular synths, and soft piano for long afternoons.',
    category: 'Music',
    subscribers: 3421, posts: 98, monthlyRevenue: 4920,
    tiers, links: [{ label: 'Bandcamp', url: 'https://bandcamp.com' }],
  },
  {
    id: 'c-3', username: 'irispress', name: 'Iris Chen',
    avatar: AVATARS[2],
    cover: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=400&fit=crop',
    bio: 'Essayist writing on craft, slow media, and the ethics of attention.',
    category: 'Writing',
    subscribers: 2180, posts: 64, monthlyRevenue: 3105,
    tiers, links: [],
  },
];

export const currentCreator = creators[0];

export const posts: Post[] = [
  { id: 'p-1', creatorId: 'c-1', title: 'A year of mornings, illustrated', excerpt: 'A meditation on 365 cups of tea and the light before the city wakes.', body: 'Full essay content...', cover: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=500&fit=crop', tier: 'fan', publishedAt: '2026-03-28', likes: 342, comments: 28, mediaType: 'article' },
  { id: 'p-2', creatorId: 'c-1', title: 'Studio tour — spring cleaning', excerpt: 'Behind the scenes of reorganizing my 200-square-foot studio.', body: '', cover: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=500&fit=crop', tier: 'super', publishedAt: '2026-03-22', likes: 198, comments: 14, mediaType: 'video' },
  { id: 'p-3', creatorId: 'c-1', title: 'Free download: desktop wallpapers', excerpt: 'Five new wallpapers for anyone who wants them.', body: '', cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop', tier: 'free', publishedAt: '2026-03-18', likes: 812, comments: 47, mediaType: 'image' },
  { id: 'p-4', creatorId: 'c-1', title: 'Commission walkthrough #12', excerpt: 'Start to finish: how I built this botanical piece over three weeks.', body: '', cover: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=500&fit=crop', tier: 'patron', publishedAt: '2026-03-12', likes: 124, comments: 22, mediaType: 'video' },
  { id: 'p-5', creatorId: 'c-1', title: 'Reading list: books shaping this year', excerpt: 'Seven books guiding my practice in 2026.', body: '', cover: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&h=500&fit=crop', tier: 'fan', publishedAt: '2026-03-05', likes: 289, comments: 19, mediaType: 'article' },
  { id: 'p-6', creatorId: 'c-1', title: 'Process video: a small gouache', excerpt: 'Short 6-minute process video.', body: '', cover: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=500&fit=crop', tier: 'super', publishedAt: '2026-02-28', likes: 231, comments: 31, mediaType: 'video' },
];

export const subscribers: Subscriber[] = [
  { id: 's-1', name: 'Eleanor Park', handle: 'elpark', avatar: AVATARS[3], tier: 'Super Fan', tierColor: 'super', since: '2025-06-14', lifetimeValue: 135, lastActive: '2 hours ago' },
  { id: 's-2', name: 'Dmitri Volkov', handle: 'dmvolk', avatar: AVATARS[4], tier: 'Patron', tierColor: 'patron', since: '2024-11-02', lifetimeValue: 850, lastActive: '1 day ago' },
  { id: 's-3', name: 'Sade Adebayo', handle: 'sadeart', avatar: AVATARS[5], tier: 'Fan', tierColor: 'fan', since: '2025-09-30', lifetimeValue: 40, lastActive: '5 hours ago' },
  { id: 's-4', name: 'Jonas Weber', handle: 'jweber', avatar: AVATARS[0], tier: 'Super Fan', tierColor: 'super', since: '2025-03-10', lifetimeValue: 195, lastActive: '3 days ago' },
  { id: 's-5', name: 'Marisol Ferreira', handle: 'marisf', avatar: AVATARS[1], tier: 'Fan', tierColor: 'fan', since: '2025-12-08', lifetimeValue: 25, lastActive: '1 hour ago' },
  { id: 's-6', name: 'Theo Nakamura', handle: 'theonka', avatar: AVATARS[2], tier: 'Patron', tierColor: 'patron', since: '2024-08-19', lifetimeValue: 1050, lastActive: 'Just now' },
];

export const revenueSeries = [
  { month: 'Oct', amount: 5420 },
  { month: 'Nov', amount: 6180 },
  { month: 'Dec', amount: 6920 },
  { month: 'Jan', amount: 7210 },
  { month: 'Feb', amount: 7840 },
  { month: 'Mar', amount: 8340 },
];

export const activity = [
  { id: 'a-1', kind: 'subscribe', text: 'Eleanor Park upgraded to Super Fan', time: '2m ago', color: 'super' as const },
  { id: 'a-2', kind: 'comment', text: 'Dmitri Volkov commented on "A year of mornings"', time: '18m ago', color: 'patron' as const },
  { id: 'a-3', kind: 'subscribe', text: 'Marisol Ferreira joined as Fan', time: '1h ago', color: 'fan' as const },
  { id: 'a-4', kind: 'tip', text: 'Theo Nakamura tipped $25', time: '3h ago', color: 'patron' as const },
  { id: 'a-5', kind: 'comment', text: 'Sade Adebayo commented on "Reading list"', time: '4h ago', color: 'fan' as const },
  { id: 'a-6', kind: 'subscribe', text: 'Jonas Weber renewed Super Fan', time: '6h ago', color: 'super' as const },
];

export const fan: Fan = {
  id: 'f-1', name: 'You', avatar: AVATARS[0],
  subscriptions: [
    { creatorId: 'c-1', tierId: 't-super', since: '2025-06-01', nextBilling: '2026-05-01' },
    { creatorId: 'c-2', tierId: 't-fan', since: '2025-11-14', nextBilling: '2026-04-14' },
  ],
};

export function creatorByUsername(username: string): Creator {
  return creators.find((c) => c.username === username) ?? creators[0];
}

export function postById(id: string): Post {
  return posts.find((p) => p.id === id) ?? posts[0];
}

export function subscriberById(id: string): Subscriber {
  return subscribers.find((s) => s.id === id) ?? subscribers[0];
}
