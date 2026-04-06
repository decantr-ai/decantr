/* Mock data for Producer Studio */

export type TrackStatus = 'mastered' | 'mixing' | 'recording' | 'draft';
export type StemType = 'vocals' | 'drums' | 'bass' | 'synth' | 'guitar' | 'keys' | 'fx' | 'master';
export type CollabRole = 'producer' | 'songwriter' | 'performer' | 'engineer' | 'mixer';
export type RoomStatus = 'live' | 'idle' | 'recording' | 'closed';

export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  duration: string;
  status: TrackStatus;
  genre: string;
  createdAt: string;
  updatedAt: string;
  stems: Stem[];
  versions: Version[];
}

export interface Stem {
  id: string;
  name: string;
  type: StemType;
  gainDb: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
  armed: boolean;
  color: string;
  waveform: number[];
}

export interface Version {
  id: string;
  label: string;
  author: string;
  timestamp: string;
  changes: string;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: CollabRole;
  avatar: string;
  joinedAt: string;
  tracksContributed: number;
  splitPercent: number;
}

export interface SplitEntry {
  id: string;
  trackTitle: string;
  collaborators: { name: string; role: CollabRole; percent: number }[];
  status: 'valid' | 'invalid';
  totalPercent: number;
}

export interface SessionRoom {
  id: string;
  name: string;
  host: string;
  status: RoomStatus;
  participants: { name: string; avatar: string; muted: boolean }[];
  createdAt: string;
  bpm: number;
  key: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

function generateWaveform(length: number = 64): number[] {
  return Array.from({ length }, () => Math.random() * 0.8 + 0.1);
}

const STEM_COLORS: Record<StemType, string> = {
  vocals: '#22D3EE',
  drums: '#D946EF',
  bass: '#FBBF24',
  synth: '#A5B4FC',
  guitar: '#34D399',
  keys: '#F97316',
  fx: '#F43F5E',
  master: '#E0E7FF',
};

export const TRACKS: Track[] = [
  {
    id: 'trk_midnight_pulse',
    title: 'Midnight Pulse',
    artist: 'VXNE',
    bpm: 128,
    key: 'Am',
    duration: '3:42',
    status: 'mastered',
    genre: 'Electronic',
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-04-04T18:30:00Z',
    stems: [
      { id: 's1', name: 'Lead Vocal', type: 'vocals', gainDb: -3.2, pan: 0, muted: false, soloed: false, armed: false, color: STEM_COLORS.vocals, waveform: generateWaveform() },
      { id: 's2', name: 'Kick & Snare', type: 'drums', gainDb: -1.5, pan: 0, muted: false, soloed: false, armed: false, color: STEM_COLORS.drums, waveform: generateWaveform() },
      { id: 's3', name: 'Sub Bass', type: 'bass', gainDb: -4.0, pan: 0, muted: false, soloed: false, armed: false, color: STEM_COLORS.bass, waveform: generateWaveform() },
      { id: 's4', name: 'Pad Synth', type: 'synth', gainDb: -8.2, pan: -20, muted: false, soloed: false, armed: false, color: STEM_COLORS.synth, waveform: generateWaveform() },
      { id: 's5', name: 'Hi-Hats', type: 'drums', gainDb: -6.0, pan: 15, muted: false, soloed: false, armed: false, color: STEM_COLORS.drums, waveform: generateWaveform() },
    ],
    versions: [
      { id: 'v1', label: 'Final Master', author: 'VXNE', timestamp: '2026-04-04T18:30:00Z', changes: 'Mastered with +1dB limiter, widened stereo field' },
      { id: 'v2', label: 'Mix v3', author: 'DJ Kael', timestamp: '2026-04-03T14:00:00Z', changes: 'Boosted sub bass, reduced pad volume' },
      { id: 'v3', label: 'Mix v2', author: 'VXNE', timestamp: '2026-04-01T09:15:00Z', changes: 'Added vocal reverb, adjusted hi-hat pan' },
      { id: 'v4', label: 'Initial recording', author: 'VXNE', timestamp: '2026-03-15T10:00:00Z', changes: 'Initial session recording — all stems laid down' },
    ],
  },
  {
    id: 'trk_neon_rain',
    title: 'Neon Rain',
    artist: 'VXNE ft. Luna',
    bpm: 140,
    key: 'Cm',
    duration: '4:18',
    status: 'mixing',
    genre: 'Drum & Bass',
    createdAt: '2026-03-28T14:00:00Z',
    updatedAt: '2026-04-05T11:20:00Z',
    stems: [
      { id: 's1', name: 'Luna Vocal', type: 'vocals', gainDb: -2.8, pan: 0, muted: false, soloed: false, armed: false, color: STEM_COLORS.vocals, waveform: generateWaveform() },
      { id: 's2', name: 'Amen Break', type: 'drums', gainDb: -1.0, pan: 0, muted: false, soloed: false, armed: false, color: STEM_COLORS.drums, waveform: generateWaveform() },
      { id: 's3', name: 'Reese Bass', type: 'bass', gainDb: -3.5, pan: 0, muted: false, soloed: false, armed: false, color: STEM_COLORS.bass, waveform: generateWaveform() },
      { id: 's4', name: 'Atmospheric Pad', type: 'synth', gainDb: -10.0, pan: -30, muted: false, soloed: false, armed: false, color: STEM_COLORS.synth, waveform: generateWaveform() },
      { id: 's5', name: 'FX Risers', type: 'fx', gainDb: -12.0, pan: 0, muted: true, soloed: false, armed: false, color: STEM_COLORS.fx, waveform: generateWaveform() },
      { id: 's6', name: 'Guitar Loop', type: 'guitar', gainDb: -7.0, pan: 25, muted: false, soloed: false, armed: false, color: STEM_COLORS.guitar, waveform: generateWaveform() },
    ],
    versions: [
      { id: 'v1', label: 'Mix v2', author: 'VXNE', timestamp: '2026-04-05T11:20:00Z', changes: 'Balanced guitar, unmuted FX for bridge' },
      { id: 'v2', label: 'Mix v1', author: 'VXNE', timestamp: '2026-04-02T16:00:00Z', changes: 'First rough mix attempt' },
      { id: 'v3', label: 'Stems recorded', author: 'Luna', timestamp: '2026-03-28T14:00:00Z', changes: 'Vocal session complete' },
    ],
  },
  {
    id: 'trk_deep_currents',
    title: 'Deep Currents',
    artist: 'VXNE',
    bpm: 122,
    key: 'Fm',
    duration: '5:01',
    status: 'recording',
    genre: 'Deep House',
    createdAt: '2026-04-02T09:00:00Z',
    updatedAt: '2026-04-05T16:45:00Z',
    stems: [
      { id: 's1', name: 'Main Drums', type: 'drums', gainDb: -2.0, pan: 0, muted: false, soloed: false, armed: false, color: STEM_COLORS.drums, waveform: generateWaveform() },
      { id: 's2', name: 'Deep Bass', type: 'bass', gainDb: -3.0, pan: 0, muted: false, soloed: false, armed: true, color: STEM_COLORS.bass, waveform: generateWaveform() },
      { id: 's3', name: 'Keys', type: 'keys', gainDb: -6.0, pan: -10, muted: false, soloed: false, armed: false, color: STEM_COLORS.keys, waveform: generateWaveform() },
    ],
    versions: [
      { id: 'v1', label: 'Session 3', author: 'VXNE', timestamp: '2026-04-05T16:45:00Z', changes: 'Added keys, tracking bass' },
      { id: 'v2', label: 'Session 2', author: 'VXNE', timestamp: '2026-04-03T10:00:00Z', changes: 'Drums laid down' },
    ],
  },
  {
    id: 'trk_crystal_caves',
    title: 'Crystal Caves',
    artist: 'VXNE & Prism',
    bpm: 150,
    key: 'Gm',
    duration: '3:28',
    status: 'draft',
    genre: 'Trance',
    createdAt: '2026-04-05T08:00:00Z',
    updatedAt: '2026-04-05T08:00:00Z',
    stems: [
      { id: 's1', name: 'Pluck Lead', type: 'synth', gainDb: -4.0, pan: 0, muted: false, soloed: false, armed: false, color: STEM_COLORS.synth, waveform: generateWaveform() },
    ],
    versions: [
      { id: 'v1', label: 'Initial idea', author: 'Prism', timestamp: '2026-04-05T08:00:00Z', changes: 'Pluck melody sketch' },
    ],
  },
  {
    id: 'trk_urban_echo',
    title: 'Urban Echo',
    artist: 'VXNE ft. MC Drift',
    bpm: 95,
    key: 'Dm',
    duration: '3:55',
    status: 'mastered',
    genre: 'Hip Hop',
    createdAt: '2026-02-20T12:00:00Z',
    updatedAt: '2026-03-10T20:00:00Z',
    stems: [
      { id: 's1', name: 'MC Vocal', type: 'vocals', gainDb: -2.5, pan: 0, muted: false, soloed: false, armed: false, color: STEM_COLORS.vocals, waveform: generateWaveform() },
      { id: 's2', name: 'Boom Bap Kit', type: 'drums', gainDb: -1.8, pan: 0, muted: false, soloed: false, armed: false, color: STEM_COLORS.drums, waveform: generateWaveform() },
      { id: 's3', name: '808 Sub', type: 'bass', gainDb: -3.5, pan: 0, muted: false, soloed: false, armed: false, color: STEM_COLORS.bass, waveform: generateWaveform() },
      { id: 's4', name: 'Piano Chops', type: 'keys', gainDb: -7.0, pan: -15, muted: false, soloed: false, armed: false, color: STEM_COLORS.keys, waveform: generateWaveform() },
    ],
    versions: [
      { id: 'v1', label: 'Master Final', author: 'VXNE', timestamp: '2026-03-10T20:00:00Z', changes: 'Final master, loudness -14 LUFS' },
    ],
  },
];

export const COLLABORATORS: Collaborator[] = [
  { id: 'col_vxne', name: 'VXNE', email: 'vxne@studio.io', role: 'producer', avatar: 'VX', joinedAt: '2026-01-01T00:00:00Z', tracksContributed: 5, splitPercent: 40 },
  { id: 'col_luna', name: 'Luna', email: 'luna@music.co', role: 'performer', avatar: 'LU', joinedAt: '2026-02-15T00:00:00Z', tracksContributed: 1, splitPercent: 25 },
  { id: 'col_kael', name: 'DJ Kael', email: 'kael@beats.fm', role: 'mixer', avatar: 'DK', joinedAt: '2026-01-20T00:00:00Z', tracksContributed: 2, splitPercent: 15 },
  { id: 'col_prism', name: 'Prism', email: 'prism@synth.io', role: 'songwriter', avatar: 'PR', joinedAt: '2026-03-01T00:00:00Z', tracksContributed: 1, splitPercent: 20 },
  { id: 'col_drift', name: 'MC Drift', email: 'drift@flow.net', role: 'performer', avatar: 'MD', joinedAt: '2026-02-10T00:00:00Z', tracksContributed: 1, splitPercent: 30 },
  { id: 'col_echo', name: 'Echo Engineer', email: 'echo@master.io', role: 'engineer', avatar: 'EE', joinedAt: '2026-03-15T00:00:00Z', tracksContributed: 3, splitPercent: 10 },
];

export const SPLITS: SplitEntry[] = [
  { id: 'sp_midnight', trackTitle: 'Midnight Pulse', collaborators: [{ name: 'VXNE', role: 'producer', percent: 60 }, { name: 'DJ Kael', role: 'mixer', percent: 25 }, { name: 'Echo Engineer', role: 'engineer', percent: 15 }], status: 'valid', totalPercent: 100 },
  { id: 'sp_neon', trackTitle: 'Neon Rain', collaborators: [{ name: 'VXNE', role: 'producer', percent: 40 }, { name: 'Luna', role: 'performer', percent: 35 }, { name: 'DJ Kael', role: 'mixer', percent: 15 }], status: 'invalid', totalPercent: 90 },
  { id: 'sp_urban', trackTitle: 'Urban Echo', collaborators: [{ name: 'VXNE', role: 'producer', percent: 50 }, { name: 'MC Drift', role: 'performer', percent: 30 }, { name: 'Echo Engineer', role: 'engineer', percent: 20 }], status: 'valid', totalPercent: 100 },
  { id: 'sp_crystal', trackTitle: 'Crystal Caves', collaborators: [{ name: 'VXNE', role: 'producer', percent: 50 }, { name: 'Prism', role: 'songwriter', percent: 50 }], status: 'valid', totalPercent: 100 },
  { id: 'sp_deep', trackTitle: 'Deep Currents', collaborators: [{ name: 'VXNE', role: 'producer', percent: 100 }], status: 'valid', totalPercent: 100 },
];

export const SESSION_ROOMS: SessionRoom[] = [
  {
    id: 'room_night_session',
    name: 'Night Session',
    host: 'VXNE',
    status: 'live',
    participants: [
      { name: 'VXNE', avatar: 'VX', muted: false },
      { name: 'Luna', avatar: 'LU', muted: true },
      { name: 'DJ Kael', avatar: 'DK', muted: false },
    ],
    createdAt: '2026-04-05T21:00:00Z',
    bpm: 128,
    key: 'Am',
  },
  {
    id: 'room_bass_lab',
    name: 'Bass Lab',
    host: 'DJ Kael',
    status: 'live',
    participants: [
      { name: 'DJ Kael', avatar: 'DK', muted: false },
      { name: 'Echo Engineer', avatar: 'EE', muted: false },
    ],
    createdAt: '2026-04-05T19:30:00Z',
    bpm: 140,
    key: 'Fm',
  },
  {
    id: 'room_vocal_booth',
    name: 'Vocal Booth',
    host: 'Luna',
    status: 'recording',
    participants: [
      { name: 'Luna', avatar: 'LU', muted: false },
      { name: 'VXNE', avatar: 'VX', muted: true },
    ],
    createdAt: '2026-04-05T20:15:00Z',
    bpm: 95,
    key: 'Dm',
  },
  {
    id: 'room_remix_zone',
    name: 'Remix Zone',
    host: 'Prism',
    status: 'idle',
    participants: [],
    createdAt: '2026-04-04T15:00:00Z',
    bpm: 150,
    key: 'Gm',
  },
];

export const ACTIVITY_FEED: ActivityItem[] = [
  { id: 'a1', user: 'VXNE', action: 'bounced "Midnight Pulse" final master', timestamp: '2026-04-05T18:30:00Z', avatar: 'VX' },
  { id: 'a2', user: 'Luna', action: 'uploaded vocal take 3 for "Neon Rain"', timestamp: '2026-04-05T16:20:00Z', avatar: 'LU' },
  { id: 'a3', user: 'DJ Kael', action: 'adjusted mix on "Midnight Pulse"', timestamp: '2026-04-05T14:00:00Z', avatar: 'DK' },
  { id: 'a4', user: 'Prism', action: 'created session "Crystal Caves"', timestamp: '2026-04-05T08:00:00Z', avatar: 'PR' },
  { id: 'a5', user: 'Echo Engineer', action: 'mastered "Urban Echo" at -14 LUFS', timestamp: '2026-04-04T20:00:00Z', avatar: 'EE' },
  { id: 'a6', user: 'VXNE', action: 'started recording session "Deep Currents"', timestamp: '2026-04-04T09:00:00Z', avatar: 'VX' },
  { id: 'a7', user: 'MC Drift', action: 'recorded vocals for "Urban Echo"', timestamp: '2026-04-03T15:00:00Z', avatar: 'MD' },
  { id: 'a8', user: 'DJ Kael', action: 'opened "Bass Lab" session room', timestamp: '2026-04-03T19:30:00Z', avatar: 'DK' },
];

export const CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm1', sender: 'VXNE', text: 'yo the kick hits hard on this one, try layering a 909', timestamp: '21:02', isOwn: true },
  { id: 'm2', sender: 'DJ Kael', text: 'done, check the new stem. also sidechained the bass', timestamp: '21:04', isOwn: false },
  { id: 'm3', sender: 'Luna', text: 'love the vibe! should I lay down a vocal hook on the drop?', timestamp: '21:06', isOwn: false },
  { id: 'm4', sender: 'VXNE', text: 'yes! something ethereal, keep it breathy', timestamp: '21:07', isOwn: true },
  { id: 'm5', sender: 'DJ Kael', text: 'I can add a filter sweep into the drop to build tension', timestamp: '21:08', isOwn: false },
  { id: 'm6', sender: 'VXNE', text: 'perfect. lets run through the arrangement once more', timestamp: '21:10', isOwn: true },
];

export const getTrackById = (id: string) => TRACKS.find((t) => t.id === id);
export const getRoomById = (id: string) => SESSION_ROOMS.find((r) => r.id === id);
