/* ── Mock Data ── */

export interface Game {
  id: string;
  title: string;
  genre: string;
  coverGradient: string;
  players: number;
  rating: number;
  tags: string[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  wins: number;
  winRate: number;
  change: 'up' | 'down' | 'same';
}

export interface CommunityPost {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  excerpt: string;
  date: string;
  category: 'news' | 'patch' | 'event' | 'community';
  reactions: number;
  comments: number;
  featured?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  title: string;
  level: number;
  xp: number;
  xpToNext: number;
  rank: number;
  guildRole: string;
  joinDate: string;
  gamesPlayed: number;
  wins: number;
  hoursPlayed: number;
  achievements: Achievement[];
  recentActivity: ActivityEvent[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedDate: string;
  progress?: number;
}

export interface ActivityEvent {
  id: string;
  user: string;
  userAvatar: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'achievement' | 'match' | 'rank' | 'social' | 'milestone';
}

export interface GuildStat {
  label: string;
  value: string;
  change: number;
  icon: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

/* ── Games ── */

export const games: Game[] = [
  { id: 'g1', title: 'Neon Siege', genre: 'FPS', coverGradient: 'linear-gradient(135deg, #3b82f6, #a855f7)', players: 12400, rating: 4.8, tags: ['competitive', 'fps', 'ranked'] },
  { id: 'g2', title: 'Void Runners', genre: 'Battle Royale', coverGradient: 'linear-gradient(135deg, #06d6a0, #3b82f6)', players: 8900, rating: 4.6, tags: ['battle-royale', 'survival'] },
  { id: 'g3', title: 'Crystal Forge', genre: 'MMORPG', coverGradient: 'linear-gradient(135deg, #a855f7, #ec4899)', players: 24100, rating: 4.9, tags: ['mmorpg', 'crafting', 'open-world'] },
  { id: 'g4', title: 'Shadow Tactics', genre: 'Strategy', coverGradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', players: 5600, rating: 4.3, tags: ['strategy', 'tactics', 'turn-based'] },
  { id: 'g5', title: 'Drift Protocol', genre: 'Racing', coverGradient: 'linear-gradient(135deg, #22c55e, #06d6a0)', players: 3200, rating: 4.5, tags: ['racing', 'multiplayer'] },
  { id: 'g6', title: 'Arcane Duels', genre: 'Card Game', coverGradient: 'linear-gradient(135deg, #ec4899, #a855f7)', players: 7800, rating: 4.7, tags: ['card-game', 'competitive', 'ranked'] },
  { id: 'g7', title: 'Titan Clash', genre: 'MOBA', coverGradient: 'linear-gradient(135deg, #ef4444, #f59e0b)', players: 18300, rating: 4.4, tags: ['moba', 'competitive', 'team'] },
  { id: 'g8', title: 'Starfield Ops', genre: 'Sci-Fi Shooter', coverGradient: 'linear-gradient(135deg, #3b82f6, #22c55e)', players: 9100, rating: 4.6, tags: ['shooter', 'sci-fi', 'co-op'] },
  { id: 'g9', title: 'Rune Keeper', genre: 'Roguelike', coverGradient: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', players: 4200, rating: 4.8, tags: ['roguelike', 'dungeon-crawler'] },
];

/* ── Leaderboard ── */

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'PhantomX', avatar: 'PX', score: 98450, wins: 342, winRate: 78.4, change: 'same' },
  { rank: 2, name: 'CyberNova', avatar: 'CN', score: 94200, wins: 318, winRate: 75.1, change: 'up' },
  { rank: 3, name: 'NightBlade', avatar: 'NB', score: 91800, wins: 305, winRate: 73.8, change: 'up' },
  { rank: 4, name: 'BlazeFury', avatar: 'BF', score: 89100, wins: 298, winRate: 71.2, change: 'down' },
  { rank: 5, name: 'IronWolf', avatar: 'IW', score: 86500, wins: 284, winRate: 69.9, change: 'same' },
  { rank: 6, name: 'PixelStorm', avatar: 'PS', score: 83200, wins: 271, winRate: 68.3, change: 'up' },
  { rank: 7, name: 'VoidWalker', avatar: 'VW', score: 80900, wins: 262, winRate: 66.7, change: 'down' },
  { rank: 8, name: 'ShadowMerc', avatar: 'SM', score: 78400, wins: 253, winRate: 65.2, change: 'same' },
  { rank: 9, name: 'NeonDrift', avatar: 'ND', score: 75100, wins: 241, winRate: 63.8, change: 'up' },
  { rank: 10, name: 'RuneForge', avatar: 'RF', score: 72800, wins: 232, winRate: 62.1, change: 'down' },
];

/* ── Community Posts ── */

export const communityPosts: CommunityPost[] = [
  { id: 'p1', title: 'Season 4 Ranked Reset — What You Need to Know', author: 'GuildMaster', authorAvatar: 'GM', excerpt: 'New ranked season drops next week. Placement matches are back with revised MMR calculations and fresh rewards.', date: '2h ago', category: 'news', reactions: 234, comments: 89, featured: true },
  { id: 'p2', title: 'Crystal Forge: Patch 2.4 Balance Changes', author: 'DevTeam', authorAvatar: 'DT', excerpt: 'Major balance pass on tank classes. Shield values reduced by 15%, healing throughput buffed for support roles.', date: '5h ago', category: 'patch', reactions: 156, comments: 67 },
  { id: 'p3', title: 'Weekend Tournament: $5K Prize Pool', author: 'EventCoord', authorAvatar: 'EC', excerpt: 'Sign up now for this weekend\'s community tournament. Teams of 5. Double elimination bracket.', date: '8h ago', category: 'event', reactions: 312, comments: 145 },
  { id: 'p4', title: 'New Member Introduction Thread', author: 'CommunityMod', authorAvatar: 'CM', excerpt: 'Welcome all new guild members! Introduce yourself, share your main games, and find teammates here.', date: '12h ago', category: 'community', reactions: 89, comments: 234 },
  { id: 'p5', title: 'Neon Siege: Pro Tips for Climbing Ranked', author: 'PhantomX', authorAvatar: 'PX', excerpt: 'After hitting top 100 this season, here are my key strategies for consistent ranked gains in Neon Siege.', date: '1d ago', category: 'community', reactions: 445, comments: 178 },
  { id: 'p6', title: 'Guild Wars Event — Register Your Squad', author: 'EventCoord', authorAvatar: 'EC', excerpt: 'Inter-guild competition starts in two weeks. Each guild can enter up to 3 squads of 5 players.', date: '1d ago', category: 'event', reactions: 267, comments: 92 },
];

/* ── User Profiles ── */

export const userProfiles: UserProfile[] = [
  {
    id: 'u1',
    name: 'NightBlade',
    avatar: 'NB',
    title: 'Guild Champion',
    level: 42,
    xp: 8400,
    xpToNext: 10000,
    rank: 3,
    guildRole: 'Officer',
    joinDate: 'Mar 2024',
    gamesPlayed: 1247,
    wins: 892,
    hoursPlayed: 2340,
    achievements: [],
    recentActivity: [],
  },
  {
    id: 'u2',
    name: 'PhantomX',
    avatar: 'PX',
    title: 'Legendary Tactician',
    level: 58,
    xp: 9200,
    xpToNext: 10000,
    rank: 1,
    guildRole: 'Guild Master',
    joinDate: 'Jan 2024',
    gamesPlayed: 1890,
    wins: 1342,
    hoursPlayed: 3100,
    achievements: [],
    recentActivity: [],
  },
];

/* ── Achievements ── */

export const achievements: Achievement[] = [
  { id: 'a1', name: 'First Blood', description: 'Win your first ranked match', icon: 'sword', rarity: 'common', earnedDate: '2024-03-15' },
  { id: 'a2', name: 'Streak Master', description: 'Win 10 matches in a row', icon: 'flame', rarity: 'rare', earnedDate: '2024-04-02' },
  { id: 'a3', name: 'Guild Champion', description: 'Lead your team to a tournament victory', icon: 'trophy', rarity: 'epic', earnedDate: '2024-05-20' },
  { id: 'a4', name: 'Legend Status', description: 'Reach the top 10 global leaderboard', icon: 'crown', rarity: 'legendary', earnedDate: '2024-06-10' },
  { id: 'a5', name: 'Team Player', description: 'Complete 100 co-op missions', icon: 'users', rarity: 'rare', earnedDate: '2024-04-18' },
  { id: 'a6', name: 'Speed Demon', description: 'Finish a match in under 5 minutes', icon: 'zap', rarity: 'common', earnedDate: '2024-03-22' },
  { id: 'a7', name: 'Untouchable', description: 'Win a match without taking damage', icon: 'shield', rarity: 'epic', earnedDate: '2024-07-01' },
  { id: 'a8', name: 'Collector', description: 'Unlock 50 unique items', icon: 'gem', rarity: 'rare', earnedDate: '2024-05-05', progress: 100 },
];

/* ── Activity Feed ── */

export const activityFeed: ActivityEvent[] = [
  { id: 'e1', user: 'PhantomX', userAvatar: 'PX', action: 'earned achievement', target: 'Legend Status', timestamp: '10m ago', type: 'achievement' },
  { id: 'e2', user: 'CyberNova', userAvatar: 'CN', action: 'won a ranked match in', target: 'Neon Siege', timestamp: '25m ago', type: 'match' },
  { id: 'e3', user: 'NightBlade', userAvatar: 'NB', action: 'climbed to rank', target: '#3 Global', timestamp: '1h ago', type: 'rank' },
  { id: 'e4', user: 'BlazeFury', userAvatar: 'BF', action: 'joined the guild', target: 'Shadow Legion', timestamp: '2h ago', type: 'social' },
  { id: 'e5', user: 'IronWolf', userAvatar: 'IW', action: 'reached level', target: '50', timestamp: '3h ago', type: 'milestone' },
  { id: 'e6', user: 'PixelStorm', userAvatar: 'PS', action: 'completed tournament in', target: 'Crystal Forge', timestamp: '4h ago', type: 'match' },
  { id: 'e7', user: 'VoidWalker', userAvatar: 'VW', action: 'unlocked rare item', target: 'Shadow Blade', timestamp: '5h ago', type: 'achievement' },
  { id: 'e8', user: 'NeonDrift', userAvatar: 'ND', action: 'set new personal record in', target: 'Drift Protocol', timestamp: '6h ago', type: 'milestone' },
];

/* ── Guild Stats ── */

export const guildStats: GuildStat[] = [
  { label: 'Active Players', value: '1,247', change: 12.4, icon: 'users' },
  { label: 'Matches Today', value: '3,891', change: 8.2, icon: 'swords' },
  { label: 'Win Rate', value: '67.3%', change: 2.1, icon: 'trending-up' },
  { label: 'Tournaments Won', value: '24', change: -3.5, icon: 'trophy' },
];

/* ── Hall of Fame Stats ── */

export const hallOfFameStats = [
  { label: 'Total Matches', value: '248,910' },
  { label: 'Unique Players', value: '12,847' },
  { label: 'Tournaments', value: '156' },
  { label: 'Prize Pool', value: '$84,200' },
];

/* ── Hall of Fame Timeline ── */

export const hallOfFameTimeline = [
  { date: 'Season 4', title: 'PhantomX dominates ranked', description: 'First player to reach 98K score in a single season.' },
  { date: 'Season 3', title: 'Guild Wars Championship', description: 'Shadow Legion defeats Nova Corps in a 5-game grand finals.' },
  { date: 'Season 2', title: 'Crystal Forge Launch', description: 'MMORPG launches with 24K concurrent players on day one.' },
  { date: 'Season 1', title: 'Platform Founded', description: 'Gaming Platform launches with 3 games and 500 founding members.' },
];

/* ── Testimonials ── */

export const testimonials: Testimonial[] = [
  { id: 't1', quote: 'Best gaming community I\'ve ever been part of. The ranked system is fair and the people are incredible.', author: 'PhantomX', role: 'Guild Master', avatar: 'PX' },
  { id: 't2', quote: 'The tournament system is top-notch. Weekly events keep things fresh and competitive.', author: 'CyberNova', role: 'Tournament Champion', avatar: 'CN' },
  { id: 't3', quote: 'Went from casual to competitive in two months. The community mentoring program is unreal.', author: 'BlazeFury', role: 'Rising Star', avatar: 'BF' },
];

/* ── Join Page Perks ── */

export const guildPerks = [
  { icon: 'trophy', title: 'Weekly Tournaments', description: 'Compete for prizes every weekend with organized brackets and live commentary.' },
  { icon: 'users', title: 'Squad Finder', description: 'Never play solo again. Find teammates that match your skill level and play style.' },
  { icon: 'trending-up', title: 'Ranked Progression', description: 'Track your growth with detailed stats, match history, and seasonal rankings.' },
  { icon: 'shield', title: 'Anti-Cheat', description: 'Play fair. Our advanced anti-cheat ensures a level playing field for everyone.' },
  { icon: 'zap', title: 'Low Latency', description: 'Dedicated servers with sub-20ms ping. No lag, no excuses.' },
  { icon: 'gem', title: 'Exclusive Rewards', description: 'Earn unique cosmetics, badges, and titles through gameplay achievements.' },
];

// Populate user profiles with achievements and activity
userProfiles[0].achievements = achievements.slice(0, 6);
userProfiles[0].recentActivity = activityFeed.filter(e => e.user === 'NightBlade' || Math.random() > 0.5).slice(0, 5);
userProfiles[1].achievements = achievements;
userProfiles[1].recentActivity = activityFeed.slice(0, 5);
