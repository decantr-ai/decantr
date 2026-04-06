export interface Project {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  scenes: number;
  status: 'draft' | 'rendering' | 'completed';
  updatedAt: string;
  resolution: string;
}

export interface Character {
  id: string;
  name: string;
  avatar: string;
  description: string;
  appearances: number;
  consistency: number;
  tags: string[];
  createdAt: string;
}

export interface Prompt {
  id: string;
  title: string;
  text: string;
  version: number;
  scene: string;
  status: 'active' | 'draft' | 'archived';
  updatedAt: string;
  tokens: number;
}

export interface RenderJob {
  id: string;
  projectTitle: string;
  scene: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  progress: number;
  gpu: string;
  startedAt: string;
  duration: string;
  resolution: string;
  model: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  scenes: number;
  duration: string;
  thumbnail: string;
}

export const projects: Project[] = [
  { id: 'p1', title: 'Neon City — Cyberpunk Short', thumbnail: '🌃', duration: '02:34', scenes: 8, status: 'completed', updatedAt: '2h ago', resolution: '4K' },
  { id: 'p2', title: 'Product Launch — SaaS Demo', thumbnail: '🚀', duration: '01:15', scenes: 5, status: 'rendering', updatedAt: '15m ago', resolution: '1080p' },
  { id: 'p3', title: 'Ocean Dreams — Nature Doc', thumbnail: '🌊', duration: '05:22', scenes: 14, status: 'completed', updatedAt: '1d ago', resolution: '4K' },
  { id: 'p4', title: 'Brand Story — Cinematic', thumbnail: '🎬', duration: '03:45', scenes: 11, status: 'draft', updatedAt: '3h ago', resolution: '4K' },
  { id: 'p5', title: 'Tutorial — Getting Started', thumbnail: '📚', duration: '04:10', scenes: 9, status: 'completed', updatedAt: '5d ago', resolution: '1080p' },
  { id: 'p6', title: 'Music Video — Synthwave', thumbnail: '🎵', duration: '03:30', scenes: 12, status: 'draft', updatedAt: '12h ago', resolution: '4K' },
];

export const characters: Character[] = [
  { id: 'c1', name: 'Detective Kai', avatar: 'DK', description: 'Hardboiled detective in a rain-soaked cyberpunk city. Trenchcoat, scar across left cheek, silver hair.', appearances: 12, consistency: 94, tags: ['cyberpunk', 'protagonist'], createdAt: '2w ago' },
  { id: 'c2', name: 'Aria Nova', avatar: 'AN', description: 'Holographic AI companion. Translucent blue-white form, geometric features, soft glow.', appearances: 8, consistency: 97, tags: ['AI', 'companion', 'cyberpunk'], createdAt: '2w ago' },
  { id: 'c3', name: 'Marcus Stone', avatar: 'MS', description: 'Corporate antagonist. Sharp suit, steel-gray eyes, slicked-back dark hair, always in shadow.', appearances: 6, consistency: 91, tags: ['antagonist', 'corporate'], createdAt: '10d ago' },
  { id: 'c4', name: 'Luna the Guide', avatar: 'LG', description: 'Tutorial narrator. Friendly, approachable, casual clothing, warm smile, expressive hands.', appearances: 9, consistency: 88, tags: ['narrator', 'tutorial'], createdAt: '5d ago' },
  { id: 'c5', name: 'Captain Reef', avatar: 'CR', description: 'Marine biologist exploring underwater worlds. Wetsuit, diving gear, sun-weathered face.', appearances: 14, consistency: 92, tags: ['nature', 'protagonist'], createdAt: '1w ago' },
];

export const prompts: Prompt[] = [
  { id: 'pr1', title: 'Neon City — Opening Shot', text: 'A sweeping aerial shot of a rain-drenched cyberpunk cityscape at night. Neon signs reflect in puddles on rooftops. Camera slowly descends through layers of smog and holographic billboards.', version: 3, scene: 'Scene 1', status: 'active', updatedAt: '2h ago', tokens: 142 },
  { id: 'pr2', title: 'Detective Entrance', text: 'Detective Kai emerges from a narrow alley into a crowded market street. Steam rises from food stalls. The camera follows from behind as Kai pushes through the crowd, trenchcoat billowing.', version: 5, scene: 'Scene 2', status: 'active', updatedAt: '3h ago', tokens: 189 },
  { id: 'pr3', title: 'Aria Hologram Reveal', text: 'In a dimly lit apartment, Kai activates a holographic projector. Aria Nova materializes in a swirl of blue particles, her geometric features crystallizing into focus.', version: 2, scene: 'Scene 3', status: 'active', updatedAt: '1d ago', tokens: 156 },
  { id: 'pr4', title: 'Product Demo — Dashboard', text: 'Clean transition to a modern SaaS dashboard. Smooth zoom into data visualization widgets. Ambient soft lighting, minimal interface.', version: 1, scene: 'Scene 1', status: 'draft', updatedAt: '5h ago', tokens: 98 },
  { id: 'pr5', title: 'Ocean Intro — Coral Reef', text: 'Underwater establishing shot of a vibrant coral reef. Sunlight filters through crystal-clear water. Schools of tropical fish move in formation.', version: 4, scene: 'Scene 1', status: 'active', updatedAt: '1d ago', tokens: 112 },
  { id: 'pr6', title: 'Corporate Confrontation', text: 'Stark boardroom. Marcus Stone sits at the head of a long table. Camera slowly pushes in as he speaks. Dramatic shadows from venetian blinds.', version: 2, scene: 'Scene 5', status: 'archived', updatedAt: '3d ago', tokens: 134 },
];

export const renderJobs: RenderJob[] = [
  { id: 'r1', projectTitle: 'Product Launch', scene: 'Scene 3 — Feature Showcase', status: 'rendering', progress: 67, gpu: 'A100 80GB', startedAt: '12m ago', duration: '~4m remaining', resolution: '1080p', model: 'Sora v2' },
  { id: 'r2', projectTitle: 'Neon City', scene: 'Scene 1 — Opening Shot', status: 'completed', progress: 100, gpu: 'H100 80GB', startedAt: '45m ago', duration: '8m 22s', resolution: '4K', model: 'Sora v2' },
  { id: 'r3', projectTitle: 'Product Launch', scene: 'Scene 1 — Hero Intro', status: 'completed', progress: 100, gpu: 'A100 80GB', startedAt: '1h ago', duration: '5m 14s', resolution: '1080p', model: 'Sora v2' },
  { id: 'r4', projectTitle: 'Neon City', scene: 'Scene 2 — Market Chase', status: 'queued', progress: 0, gpu: '—', startedAt: '—', duration: 'Pending', resolution: '4K', model: 'Sora v2' },
  { id: 'r5', projectTitle: 'Brand Story', scene: 'Scene 4 — Testimonial', status: 'failed', progress: 34, gpu: 'A100 80GB', startedAt: '2h ago', duration: 'Failed at 34%', resolution: '4K', model: 'Runway Gen-3' },
  { id: 'r6', projectTitle: 'Ocean Dreams', scene: 'Scene 7 — Deep Dive', status: 'rendering', progress: 23, gpu: 'H100 80GB', startedAt: '3m ago', duration: '~12m remaining', resolution: '4K', model: 'Sora v2' },
  { id: 'r7', projectTitle: 'Neon City', scene: 'Scene 5 — Rooftop', status: 'queued', progress: 0, gpu: '—', startedAt: '—', duration: 'Pending', resolution: '4K', model: 'Sora v2' },
];

export const templates: Template[] = [
  { id: 't1', title: 'Product Demo', description: 'Clean SaaS product walkthrough with smooth transitions', category: 'Marketing', scenes: 5, duration: '01:00', thumbnail: '🖥️' },
  { id: 't2', title: 'Cinematic Short', description: 'Dramatic narrative template with scene transitions', category: 'Film', scenes: 8, duration: '03:00', thumbnail: '🎥' },
  { id: 't3', title: 'Social Ad (Vertical)', description: 'Quick-cut vertical format for Instagram/TikTok', category: 'Social', scenes: 3, duration: '00:30', thumbnail: '📱' },
  { id: 't4', title: 'Nature Documentary', description: 'Sweeping nature visuals with narration pacing', category: 'Documentary', scenes: 10, duration: '05:00', thumbnail: '🌿' },
  { id: 't5', title: 'Tutorial Walkthrough', description: 'Step-by-step guide with screen recordings', category: 'Education', scenes: 6, duration: '04:00', thumbnail: '📖' },
  { id: 't6', title: 'Music Video', description: 'Beat-synced cuts with dynamic camera movement', category: 'Music', scenes: 12, duration: '03:30', thumbnail: '🎶' },
];

export const renderLogs = [
  { time: '00:00:01', level: 'info' as const, message: 'Initializing render pipeline — Sora v2 model loaded' },
  { time: '00:00:02', level: 'info' as const, message: 'Scene 3 prompt parsed: 142 tokens, 1080p target' },
  { time: '00:00:03', level: 'info' as const, message: 'GPU allocated: NVIDIA A100 80GB (cuda:0)' },
  { time: '00:00:05', level: 'info' as const, message: 'Character consistency check: Detective Kai — 94% match' },
  { time: '00:00:08', level: 'info' as const, message: 'Frame generation started — 720 frames @ 30fps' },
  { time: '00:02:14', level: 'info' as const, message: 'Frame 240/720 rendered — 33% complete' },
  { time: '00:04:32', level: 'warn' as const, message: 'VRAM pressure: 72.4GB / 80GB — reducing batch size' },
  { time: '00:05:01', level: 'info' as const, message: 'Frame 480/720 rendered — 67% complete' },
  { time: '00:06:18', level: 'info' as const, message: 'Temporal coherence pass running...' },
  { time: '00:07:45', level: 'info' as const, message: 'Upscaling to final resolution...' },
  { time: '00:08:12', level: 'success' as const, message: 'Render complete — output: scene_03_final.mp4 (142MB)' },
];

export interface Appearance {
  sceneId: string;
  sceneName: string;
  project: string;
  timecode: string;
  consistencyScore: number;
}

export const characterAppearances: Appearance[] = [
  { sceneId: 's1', sceneName: 'Opening Shot', project: 'Neon City', timecode: '00:00:12', consistencyScore: 96 },
  { sceneId: 's2', sceneName: 'Market Chase', project: 'Neon City', timecode: '00:01:05', consistencyScore: 93 },
  { sceneId: 's3', sceneName: 'Alley Confrontation', project: 'Neon City', timecode: '00:01:48', consistencyScore: 91 },
  { sceneId: 's4', sceneName: 'Apartment Scene', project: 'Neon City', timecode: '00:02:10', consistencyScore: 95 },
  { sceneId: 's5', sceneName: 'Rooftop Finale', project: 'Neon City', timecode: '00:02:30', consistencyScore: 94 },
];

export const pricingPlans = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 29,
    annualPrice: 24,
    features: [
      { label: '10 renders / month', included: true },
      { label: '720p resolution', included: true },
      { label: '3 character slots', included: true },
      { label: '5GB storage', included: true },
      { label: 'Priority rendering', included: false },
      { label: 'API access', included: false },
    ],
    recommended: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 79,
    annualPrice: 66,
    features: [
      { label: '100 renders / month', included: true },
      { label: '4K resolution', included: true },
      { label: 'Unlimited characters', included: true },
      { label: '50GB storage', included: true },
      { label: 'Priority rendering', included: true },
      { label: 'API access', included: false },
    ],
    recommended: true,
  },
  {
    id: 'studio',
    name: 'Studio',
    monthlyPrice: 199,
    annualPrice: 166,
    features: [
      { label: 'Unlimited renders', included: true },
      { label: '8K resolution', included: true },
      { label: 'Unlimited characters', included: true },
      { label: '500GB storage', included: true },
      { label: 'Priority rendering', included: true },
      { label: 'API access', included: true },
    ],
    recommended: false,
  },
];

export const sessions = [
  { id: 'sess1', device: 'MacBook Pro — Chrome', location: 'San Francisco, CA', lastActive: 'Now', current: true },
  { id: 'sess2', device: 'iPhone 15 — Safari', location: 'San Francisco, CA', lastActive: '2h ago', current: false },
  { id: 'sess3', device: 'iPad Air — Safari', location: 'Los Angeles, CA', lastActive: '3d ago', current: false },
];
