export type Event = {
  id: string;
  title: string;
  image: string;
  description: string;
  category: string;
  date: string; // ISO
  endDate?: string;
  venue: string;
  city: string;
  organizerId: string;
  attendees: number;
  capacity: number;
  priceFrom: number;
  tags: string[];
  tiers: TicketTier[];
};

export type TicketTier = {
  id: string;
  name: string;
  price: number;
  perks: string[];
  remaining: number;
};

export type Organizer = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followers: number;
  eventsHosted: number;
};

export type Attendee = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  location: string;
  going: number;
};

export type Post = {
  id: string;
  authorId: string;
  body: string;
  image?: string;
  createdAt: string;
  eventId?: string;
  reactions: { emoji: string; count: number }[];
  commentCount: number;
};

export type Comment = {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
};

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=900&q=80`;

const avatar = (n: number) => `https://i.pravatar.cc/160?img=${n}`;

export const organizers: Organizer[] = [
  { id: 'me', name: 'Juno Rivers', handle: '@juno', avatar: avatar(14), bio: 'Throwing parties since Y2K. Based in Brooklyn.', followers: 8420, eventsHosted: 52 },
  { id: 'kai', name: 'Kai Matsuda', handle: '@kaibeats', avatar: avatar(22), bio: 'Underground electronic. Tokyo ↔ Berlin.', followers: 21400, eventsHosted: 78 },
  { id: 'rio', name: 'Rio Santos', handle: '@rio', avatar: avatar(31), bio: 'Festival producer. Sunshine and bass.', followers: 14200, eventsHosted: 41 },
  { id: 'mel', name: 'Mel Okafor', handle: '@melodic', avatar: avatar(44), bio: 'Rooftops, community, good sound.', followers: 6300, eventsHosted: 28 },
  { id: 'ash', name: 'Ash Petrov', handle: '@ash.fm', avatar: avatar(5), bio: 'Art markets and immersive nights.', followers: 9900, eventsHosted: 36 },
];

export const attendees: Attendee[] = [
  { id: 'u1', name: 'Luna Park', handle: '@luna', avatar: avatar(7), location: 'Brooklyn, NY', going: 14 },
  { id: 'u2', name: 'Theo Vance', handle: '@theo', avatar: avatar(12), location: 'LA, CA', going: 8 },
  { id: 'u3', name: 'Sage Wu', handle: '@sagewu', avatar: avatar(19), location: 'Austin, TX', going: 22 },
  { id: 'u4', name: 'Nadia Reyes', handle: '@nadia', avatar: avatar(25), location: 'Miami, FL', going: 17 },
  { id: 'u5', name: 'Ollie Brown', handle: '@ollie', avatar: avatar(33), location: 'Portland, OR', going: 11 },
  { id: 'u6', name: 'Zara Khan', handle: '@zara', avatar: avatar(40), location: 'Chicago, IL', going: 19 },
  { id: 'u7', name: 'Miles Echo', handle: '@miles', avatar: avatar(48), location: 'SF, CA', going: 6 },
  { id: 'u8', name: 'Indigo Shah', handle: '@indigo', avatar: avatar(52), location: 'NYC, NY', going: 31 },
];

const tiers = (base: number): TicketTier[] => [
  { id: 'ga', name: 'General Admission', price: base, perks: ['Entry', 'Welcome drink'], remaining: 142 },
  { id: 'vip', name: 'VIP', price: base * 2.2, perks: ['Fast entry', 'VIP lounge', 'Open bar', 'Swag bag'], remaining: 34 },
  { id: 'early', name: 'Early Bird', price: base * 0.7, perks: ['Entry', 'Limited release'], remaining: 3 },
];

export const events: Event[] = [
  {
    id: 'neon-bloom-2026',
    title: 'Neon Bloom Festival',
    image: img('1533174072545-7a4b6ad7a6c3'),
    description: 'Two days of electronic music, immersive light installations, and rooftop sunrise sets. Neon Bloom returns with our biggest lineup yet.',
    category: 'Music Festival',
    date: '2026-05-23T18:00:00Z',
    endDate: '2026-05-24T04:00:00Z',
    venue: 'Pier 94',
    city: 'Brooklyn, NY',
    organizerId: 'kai',
    attendees: 3420,
    capacity: 5000,
    priceFrom: 65,
    tags: ['electronic', 'festival', '18+', 'immersive'],
    tiers: tiers(65),
  },
  {
    id: 'sunset-sessions-vol7',
    title: 'Sunset Sessions Vol. 7',
    image: img('1470229722913-7c0e2dbbafd3'),
    description: 'Golden hour DJs on a Williamsburg rooftop. House, disco, and a skyline that delivers every time.',
    category: 'Rooftop Party',
    date: '2026-04-18T17:00:00Z',
    venue: 'The Penthouse',
    city: 'Brooklyn, NY',
    organizerId: 'mel',
    attendees: 280,
    capacity: 350,
    priceFrom: 25,
    tags: ['rooftop', 'house', 'disco'],
    tiers: tiers(25),
  },
  {
    id: 'underground-tape-fair',
    title: 'Underground Tape Fair',
    image: img('1514525253161-7a46d19cd819'),
    description: 'Rare cassettes, zines, local labels. Browse, trade, listen. Free entry, DJ sets all day.',
    category: 'Market',
    date: '2026-04-12T12:00:00Z',
    venue: 'Warehouse 22',
    city: 'LA, CA',
    organizerId: 'ash',
    attendees: 640,
    capacity: 800,
    priceFrom: 0,
    tags: ['market', 'vinyl', 'community'],
    tiers: tiers(0),
  },
  {
    id: 'hypercolor-2026',
    title: 'Hypercolor: Immersive Art Night',
    image: img('1492684223066-81342ee5ff30'),
    description: 'Five artists, one warehouse. Projection mapping, sound baths, and interactive rooms.',
    category: 'Art Experience',
    date: '2026-05-03T20:00:00Z',
    venue: 'The Silo',
    city: 'Austin, TX',
    organizerId: 'ash',
    attendees: 412,
    capacity: 500,
    priceFrom: 35,
    tags: ['art', 'immersive', 'projection'],
    tiers: tiers(35),
  },
  {
    id: 'bass-cathedral',
    title: 'Bass Cathedral',
    image: img('1459749411175-04bf5292ceea'),
    description: 'Dub, jungle, and bass music in a repurposed cathedral. Two rooms, eight DJs, all night long.',
    category: 'Club Night',
    date: '2026-04-26T22:00:00Z',
    venue: 'St. Joseph Hall',
    city: 'Chicago, IL',
    organizerId: 'kai',
    attendees: 520,
    capacity: 700,
    priceFrom: 20,
    tags: ['bass', 'dub', 'jungle'],
    tiers: tiers(20),
  },
  {
    id: 'summerwave-day-fest',
    title: 'Summerwave Day Fest',
    image: img('1501612780327-45045538702b'),
    description: 'Beach bass, food trucks, and swimwear. A one-day coastal festival under the sun.',
    category: 'Day Festival',
    date: '2026-07-11T12:00:00Z',
    venue: 'Ocean Lot',
    city: 'Miami, FL',
    organizerId: 'rio',
    attendees: 1820,
    capacity: 2500,
    priceFrom: 45,
    tags: ['beach', 'festival', 'day'],
    tiers: tiers(45),
  },
  {
    id: 'community-potluck-night',
    title: 'Community Potluck + Vinyl Night',
    image: img('1517457373958-b7bdd4587205'),
    description: 'Bring a dish, leave with new friends. Slow selections all evening.',
    category: 'Community',
    date: '2026-04-08T19:00:00Z',
    venue: 'The Common',
    city: 'Portland, OR',
    organizerId: 'mel',
    attendees: 68,
    capacity: 90,
    priceFrom: 0,
    tags: ['community', 'vinyl', 'free'],
    tiers: tiers(0),
  },
  {
    id: 'afterhours-lab',
    title: 'Afterhours Lab: Live Techno',
    image: img('1506157786151-b8491531f063'),
    description: 'Live modular sets. Doors at 1am. Stay until sunrise.',
    category: 'Afterhours',
    date: '2026-05-10T01:00:00Z',
    venue: 'The Bunker',
    city: 'Berlin, DE',
    organizerId: 'kai',
    attendees: 210,
    capacity: 300,
    priceFrom: 30,
    tags: ['techno', 'live', 'afterhours'],
    tiers: tiers(30),
  },
];

export const posts: Post[] = [
  {
    id: 'p1',
    authorId: 'u1',
    body: 'Who else is going to Neon Bloom?? Already have my outfit planned 💅',
    image: img('1540039155733-5bb30b53aa14'),
    createdAt: '2026-04-04T14:22:00Z',
    eventId: 'neon-bloom-2026',
    reactions: [
      { emoji: '🔥', count: 42 },
      { emoji: '💖', count: 18 },
      { emoji: '🪩', count: 7 },
    ],
    commentCount: 12,
  },
  {
    id: 'p2',
    authorId: 'u3',
    body: 'Last night at Sunset Sessions was unreal. That sunset set from @melodic hit different.',
    image: img('1464375117522-1311d6a5b81f'),
    createdAt: '2026-04-03T09:15:00Z',
    eventId: 'sunset-sessions-vol7',
    reactions: [
      { emoji: '🌅', count: 31 },
      { emoji: '🔥', count: 22 },
    ],
    commentCount: 6,
  },
  {
    id: 'p3',
    authorId: 'u6',
    body: 'Looking for a ride to Hypercolor from Houston — DM me if you have a spot!',
    createdAt: '2026-04-02T18:40:00Z',
    eventId: 'hypercolor-2026',
    reactions: [
      { emoji: '🚗', count: 8 },
      { emoji: '✨', count: 4 },
    ],
    commentCount: 3,
  },
  {
    id: 'p4',
    authorId: 'u8',
    body: 'PSA: Early bird tickets for Bass Cathedral dropped to 14 left. Don\'t sleep.',
    createdAt: '2026-04-02T12:05:00Z',
    eventId: 'bass-cathedral',
    reactions: [
      { emoji: '⚠️', count: 15 },
      { emoji: '🔊', count: 9 },
    ],
    commentCount: 4,
  },
  {
    id: 'p5',
    authorId: 'u4',
    body: 'Summerwave vibes incoming 🌊 Anyone want to share a hotel?',
    image: img('1492684223066-81342ee5ff30'),
    createdAt: '2026-04-01T20:20:00Z',
    eventId: 'summerwave-day-fest',
    reactions: [
      { emoji: '🌊', count: 27 },
      { emoji: '🏖️', count: 19 },
      { emoji: '💖', count: 11 },
    ],
    commentCount: 8,
  },
];

export const comments: Comment[] = [
  { id: 'c1', authorId: 'u2', body: 'Omgg same. Let\'s link up at the entrance!', createdAt: '2026-04-04T14:45:00Z' },
  { id: 'c2', authorId: 'u5', body: 'The lineup this year is stacked.', createdAt: '2026-04-04T15:02:00Z' },
  { id: 'c3', authorId: 'u7', body: 'First time going — any tips?', createdAt: '2026-04-04T15:30:00Z' },
];

export const reactionEmojis = ['🔥', '💖', '🪩', '🌊', '✨', '🎉'];
