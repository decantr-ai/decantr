/* ── Esports HQ Mock Data ── */

export interface Player {
  id: string;
  name: string;
  avatar: string;
  role: string;
  game: string;
  kd: number;
  winRate: number;
  mood: 'great' | 'good' | 'neutral' | 'tired' | 'tilted';
  sparkline: number[];
  status: 'active' | 'benched' | 'injured' | 'tryout';
  earnings: number;
}

export interface TeamKpi {
  label: string;
  value: string;
  change: number;
  icon: string;
}

export interface Scrim {
  id: string;
  opponent: string;
  opponentLogo: string;
  date: string;
  time: string;
  game: string;
  map: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  score?: { us: number; them: number };
}

export interface VodEntry {
  id: string;
  title: string;
  game: string;
  opponent: string;
  date: string;
  duration: string;
  annotations: number;
  thumbnail: string;
  result: 'win' | 'loss' | 'draw';
  mapName: string;
}

export interface VodAnnotation {
  id: string;
  timestamp: string;
  seconds: number;
  author: string;
  authorAvatar: string;
  text: string;
  type: 'callout' | 'mistake' | 'highlight' | 'strategy';
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  tier: 'title' | 'premium' | 'standard';
  dealValue: number;
  impressions: number;
  activations: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'negotiating' | 'expired';
}

export interface ActivityEvent {
  id: string;
  user: string;
  userAvatar: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'match' | 'roster' | 'sponsor' | 'vod' | 'scrim';
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

export interface MatchEvent {
  id: string;
  timestamp: string;
  seconds: number;
  type: 'kill' | 'death' | 'objective' | 'round-start' | 'round-end' | 'timeout';
  description: string;
  player?: string;
}

/* ── Players ── */

export const players: Player[] = [
  { id: 'p1', name: 'PhantomX', avatar: 'PX', role: 'Entry Fragger', game: 'Neon Siege', kd: 1.42, winRate: 68.3, mood: 'great', sparkline: [1.2, 1.3, 1.5, 1.4, 1.6, 1.42], status: 'active', earnings: 42000 },
  { id: 'p2', name: 'CyberNova', avatar: 'CN', role: 'Support', game: 'Neon Siege', kd: 0.98, winRate: 71.2, mood: 'good', sparkline: [0.9, 1.0, 0.95, 1.1, 0.92, 0.98], status: 'active', earnings: 38000 },
  { id: 'p3', name: 'BlazeFury', avatar: 'BF', role: 'AWPer', game: 'Neon Siege', kd: 1.65, winRate: 62.1, mood: 'neutral', sparkline: [1.8, 1.7, 1.5, 1.6, 1.7, 1.65], status: 'active', earnings: 55000 },
  { id: 'p4', name: 'IronWolf', avatar: 'IW', role: 'IGL', game: 'Neon Siege', kd: 1.15, winRate: 73.8, mood: 'good', sparkline: [1.1, 1.2, 1.0, 1.15, 1.18, 1.15], status: 'active', earnings: 48000 },
  { id: 'p5', name: 'PixelStorm', avatar: 'PS', role: 'Lurker', game: 'Neon Siege', kd: 1.28, winRate: 65.9, mood: 'tired', sparkline: [1.4, 1.35, 1.25, 1.2, 1.3, 1.28], status: 'active', earnings: 36000 },
  { id: 'p6', name: 'VoidWalker', avatar: 'VW', role: 'Flex', game: 'Neon Siege', kd: 1.08, winRate: 59.4, mood: 'tilted', sparkline: [1.3, 1.2, 1.1, 0.95, 1.0, 1.08], status: 'benched', earnings: 28000 },
  { id: 'p7', name: 'NeonDrift', avatar: 'ND', role: 'Entry Fragger', game: 'Void Runners', kd: 1.55, winRate: 70.1, mood: 'great', sparkline: [1.4, 1.5, 1.6, 1.55, 1.5, 1.55], status: 'active', earnings: 31000 },
  { id: 'p8', name: 'RuneForge', avatar: 'RF', role: 'Support', game: 'Void Runners', kd: 0.88, winRate: 66.7, mood: 'good', sparkline: [0.8, 0.85, 0.9, 0.88, 0.92, 0.88], status: 'tryout', earnings: 12000 },
];

/* ── Team KPIs ── */

export const teamKpis: TeamKpi[] = [
  { label: 'Win Rate', value: '67.3%', change: 4.2, icon: 'trending-up' },
  { label: 'Active Players', value: '8', change: 0, icon: 'users' },
  { label: 'Scrims This Week', value: '12', change: 20, icon: 'swords' },
  { label: 'Prize Earnings', value: '$289K', change: 12.5, icon: 'trophy' },
  { label: 'VODs Reviewed', value: '47', change: -8.3, icon: 'video' },
  { label: 'Sponsor Deals', value: '6', change: 50, icon: 'handshake' },
];

/* ── Scrims ── */

export const scrims: Scrim[] = [
  { id: 's1', opponent: 'Nova Corps', opponentLogo: 'NC', date: '2026-04-06', time: '18:00', game: 'Neon Siege', map: 'Ascent', status: 'live', score: { us: 8, them: 6 } },
  { id: 's2', opponent: 'Apex Predators', opponentLogo: 'AP', date: '2026-04-06', time: '20:00', game: 'Neon Siege', map: 'Haven', status: 'scheduled' },
  { id: 's3', opponent: 'Frost Titans', opponentLogo: 'FT', date: '2026-04-07', time: '15:00', game: 'Neon Siege', map: 'Bind', status: 'scheduled' },
  { id: 's4', opponent: 'Dark Horizon', opponentLogo: 'DH', date: '2026-04-05', time: '19:00', game: 'Neon Siege', map: 'Split', status: 'completed', score: { us: 13, them: 9 } },
  { id: 's5', opponent: 'Storm Riders', opponentLogo: 'SR', date: '2026-04-05', time: '16:00', game: 'Void Runners', map: 'Circuit', status: 'completed', score: { us: 2, them: 3 } },
  { id: 's6', opponent: 'Zenith eSports', opponentLogo: 'ZE', date: '2026-04-04', time: '18:00', game: 'Neon Siege', map: 'Icebox', status: 'completed', score: { us: 13, them: 11 } },
  { id: 's7', opponent: 'Phantom Brigade', opponentLogo: 'PB', date: '2026-04-08', time: '17:00', game: 'Neon Siege', map: 'Fracture', status: 'scheduled' },
  { id: 's8', opponent: 'Nova Corps', opponentLogo: 'NC', date: '2026-04-03', time: '20:00', game: 'Neon Siege', map: 'Lotus', status: 'cancelled' },
];

/* ── VODs ── */

export const vods: VodEntry[] = [
  { id: 'v1', title: 'Grand Finals vs Nova Corps', game: 'Neon Siege', opponent: 'Nova Corps', date: '2026-04-05', duration: '1h 23m', annotations: 24, thumbnail: 'linear-gradient(135deg, #3b82f6, #a855f7)', result: 'win', mapName: 'Ascent' },
  { id: 'v2', title: 'Scrim Review: Apex Predators', game: 'Neon Siege', opponent: 'Apex Predators', date: '2026-04-04', duration: '48m', annotations: 12, thumbnail: 'linear-gradient(135deg, #ef4444, #f59e0b)', result: 'loss', mapName: 'Haven' },
  { id: 'v3', title: 'Ranked Grind: Solo Queue', game: 'Neon Siege', opponent: 'Ladder', date: '2026-04-03', duration: '2h 10m', annotations: 8, thumbnail: 'linear-gradient(135deg, #22c55e, #3b82f6)', result: 'win', mapName: 'Bind' },
  { id: 'v4', title: 'Tournament QF vs Frost Titans', game: 'Neon Siege', opponent: 'Frost Titans', date: '2026-04-02', duration: '55m', annotations: 18, thumbnail: 'linear-gradient(135deg, #06d6a0, #a855f7)', result: 'win', mapName: 'Split' },
  { id: 'v5', title: 'Void Runners Invitational', game: 'Void Runners', opponent: 'Storm Riders', date: '2026-04-01', duration: '37m', annotations: 6, thumbnail: 'linear-gradient(135deg, #ec4899, #f59e0b)', result: 'loss', mapName: 'Circuit' },
  { id: 'v6', title: 'New Strat: Double AWP Setup', game: 'Neon Siege', opponent: 'Dark Horizon', date: '2026-03-30', duration: '1h 05m', annotations: 31, thumbnail: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', result: 'win', mapName: 'Icebox' },
];

/* ── VOD Annotations ── */

export const vodAnnotations: VodAnnotation[] = [
  { id: 'a1', timestamp: '02:34', seconds: 154, author: 'Coach Viper', authorAvatar: 'CV', text: 'BlazeFury missed the flash timing here. Should peek 200ms earlier for the trade.', type: 'mistake' },
  { id: 'a2', timestamp: '05:12', seconds: 312, author: 'IronWolf', authorAvatar: 'IW', text: 'This execute is clean. Notice how PhantomX clears site before the plant.', type: 'highlight' },
  { id: 'a3', timestamp: '08:45', seconds: 525, author: 'Coach Viper', authorAvatar: 'CV', text: 'Need to rotate faster here. 15 seconds wasted watching mid when they already took B control.', type: 'callout' },
  { id: 'a4', timestamp: '12:01', seconds: 721, author: 'CyberNova', authorAvatar: 'CN', text: 'New smoke lineup for A site. Blocks their AWP angle from long.', type: 'strategy' },
  { id: 'a5', timestamp: '15:30', seconds: 930, author: 'Coach Viper', authorAvatar: 'CV', text: 'Perfect retake. 2v4 clutch by PhantomX. Save this for highlight reel.', type: 'highlight' },
  { id: 'a6', timestamp: '18:22', seconds: 1102, author: 'BlazeFury', authorAvatar: 'BF', text: 'Should have saved the AWP here. Economy was already broken.', type: 'mistake' },
  { id: 'a7', timestamp: '22:10', seconds: 1330, author: 'Coach Viper', authorAvatar: 'CV', text: 'Run this fake execute in the next scrim. Their B rotations are always slow.', type: 'strategy' },
];

/* ── Sponsors ── */

export const sponsors: Sponsor[] = [
  { id: 'sp1', name: 'HyperGear', logo: 'HG', tier: 'title', dealValue: 120000, impressions: 2400000, activations: 34, startDate: '2026-01-01', endDate: '2026-12-31', status: 'active' },
  { id: 'sp2', name: 'NeonDrink Energy', logo: 'NE', tier: 'premium', dealValue: 75000, impressions: 1800000, activations: 22, startDate: '2026-02-01', endDate: '2026-08-31', status: 'active' },
  { id: 'sp3', name: 'CloudSync VPN', logo: 'CS', tier: 'standard', dealValue: 35000, impressions: 950000, activations: 15, startDate: '2026-03-01', endDate: '2027-02-28', status: 'active' },
  { id: 'sp4', name: 'PixelForge Monitors', logo: 'PF', tier: 'premium', dealValue: 65000, impressions: 1200000, activations: 19, startDate: '2026-01-15', endDate: '2026-07-15', status: 'active' },
  { id: 'sp5', name: 'SteelFrame Chairs', logo: 'SF', tier: 'standard', dealValue: 28000, impressions: 680000, activations: 11, startDate: '2025-10-01', endDate: '2026-03-31', status: 'expired' },
  { id: 'sp6', name: 'RapidByte ISP', logo: 'RB', tier: 'title', dealValue: 150000, impressions: 0, activations: 0, startDate: '2026-05-01', endDate: '2027-04-30', status: 'negotiating' },
];

/* ── Activity Feed ── */

export const activityFeed: ActivityEvent[] = [
  { id: 'e1', user: 'PhantomX', userAvatar: 'PX', action: 'went 28-12 in scrim vs', target: 'Nova Corps', timestamp: '15m ago', type: 'match' },
  { id: 'e2', user: 'Coach Viper', userAvatar: 'CV', action: 'added 5 annotations to', target: 'Grand Finals VOD', timestamp: '1h ago', type: 'vod' },
  { id: 'e3', user: 'IronWolf', userAvatar: 'IW', action: 'scheduled scrim with', target: 'Apex Predators', timestamp: '2h ago', type: 'scrim' },
  { id: 'e4', user: 'Admin', userAvatar: 'AD', action: 'renewed sponsorship with', target: 'HyperGear', timestamp: '3h ago', type: 'sponsor' },
  { id: 'e5', user: 'Coach Viper', userAvatar: 'CV', action: 'moved VoidWalker to', target: 'Bench', timestamp: '5h ago', type: 'roster' },
  { id: 'e6', user: 'RuneForge', userAvatar: 'RF', action: 'completed tryout for', target: 'Void Runners Squad', timestamp: '8h ago', type: 'roster' },
  { id: 'e7', user: 'BlazeFury', userAvatar: 'BF', action: 'hit career-high 1.65 K/D in', target: 'Weekly Stats', timestamp: '12h ago', type: 'match' },
  { id: 'e8', user: 'CyberNova', userAvatar: 'CN', action: 'uploaded VOD for', target: 'Scrim vs Dark Horizon', timestamp: '1d ago', type: 'vod' },
];

/* ── Match Events (for match detail timeline) ── */

export const matchEvents: MatchEvent[] = [
  { id: 'me1', timestamp: '00:00', seconds: 0, type: 'round-start', description: 'Round 1 - Pistol Round' },
  { id: 'me2', timestamp: '00:45', seconds: 45, type: 'kill', description: 'PhantomX gets opening pick on AWPer', player: 'PhantomX' },
  { id: 'me3', timestamp: '01:12', seconds: 72, type: 'kill', description: 'BlazeFury double kill with AWP', player: 'BlazeFury' },
  { id: 'me4', timestamp: '01:38', seconds: 98, type: 'objective', description: 'Bomb planted on A site' },
  { id: 'me5', timestamp: '01:55', seconds: 115, type: 'round-end', description: 'Round 1 Won - 1:0' },
  { id: 'me6', timestamp: '02:30', seconds: 150, type: 'round-start', description: 'Round 2 - Force Buy' },
  { id: 'me7', timestamp: '03:05', seconds: 185, type: 'death', description: 'PixelStorm caught off rotation', player: 'PixelStorm' },
  { id: 'me8', timestamp: '03:42', seconds: 222, type: 'kill', description: 'IronWolf clutch 1v2', player: 'IronWolf' },
  { id: 'me9', timestamp: '04:10', seconds: 250, type: 'round-end', description: 'Round 2 Won - 2:0' },
  { id: 'me10', timestamp: '05:00', seconds: 300, type: 'timeout', description: 'Tactical timeout called by opponent' },
];

/* ── Testimonials for marketing page ── */

export const testimonials: Testimonial[] = [
  { id: 't1', quote: 'Esports HQ transformed how we manage our roster. Player form tracking alone saved us from making bad trades.', author: 'Coach Viper', role: 'Head Coach, Shadow Legion', avatar: 'CV' },
  { id: 't2', quote: 'The VOD annotator is incredible. Frame-by-frame review with team commentary changed our prep entirely.', author: 'IronWolf', role: 'IGL, Shadow Legion', avatar: 'IW' },
  { id: 't3', quote: 'Our sponsor ROI visibility went from guesswork to data-driven. Activation tracking is a game changer.', author: 'Sarah Chen', role: 'Partnerships Lead', avatar: 'SC' },
];

/* ── Marketing Features ── */

export const marketingFeatures = [
  { icon: 'users', title: 'Roster Management', description: 'Track player form with sparklines, K/D ratios, mood indicators, and performance trends across matches.' },
  { icon: 'calendar', title: 'Scrim Scheduler', description: 'Map team availability to opponent windows. Auto-detect conflicts, send invites, and track scrim history.' },
  { icon: 'video', title: 'VOD Annotator', description: 'Frame-by-frame review with timestamped annotations, drawing tools, and shareable coaching notes.' },
  { icon: 'bar-chart', title: 'Live Scoreboards', description: 'Real-time match tracking with round-by-round breakdowns, economy graphs, and player performance.' },
  { icon: 'handshake', title: 'Sponsor Dashboards', description: 'Track deal value, impressions, and activation metrics. Prove ROI to your partners with hard data.' },
  { icon: 'shield', title: 'Secure & Fast', description: 'End-to-end encrypted data, role-based access, and sub-100ms response times across all tools.' },
];

/* ── Sponsor chart data (monthly impressions) ── */

export const sponsorChartData = [
  { month: 'Jan', impressions: 180000, activations: 3 },
  { month: 'Feb', impressions: 220000, activations: 4 },
  { month: 'Mar', impressions: 310000, activations: 6 },
  { month: 'Apr', impressions: 290000, activations: 5 },
  { month: 'May', impressions: 340000, activations: 7 },
  { month: 'Jun', impressions: 380000, activations: 9 },
];
