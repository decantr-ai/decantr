import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  AudioWaveform,
  BadgeCheck,
  Bell,
  CheckCircle2,
  Circle,
  Clock3,
  Disc3,
  Gauge,
  Headphones,
  Library,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Mic2,
  MonitorSpeaker,
  PanelRight,
  Percent,
  Phone,
  Play,
  QrCode,
  Radio,
  Rewind,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Square,
  Trash2,
  UploadCloud,
  UserCircle,
  X
} from 'lucide-react';

const AUTH_KEY = 'decantr_ps_authenticated';

type Stem = {
  id: string;
  name: string;
  color: string;
  gain: number;
  pan: number;
  armed?: boolean;
  muted?: boolean;
  waveform: number[];
};

type Track = {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  duration: string;
  genre: string;
  status: 'mastered' | 'mixing' | 'recording';
  updated: string;
  stems: Stem[];
  versions: Array<{ id: string; label: string; author: string; time: string; note: string }>;
};

type Collaborator = {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  status: string;
  master: number;
  publishing: number;
  signed: boolean;
};

type Room = {
  id: string;
  name: string;
  host: string;
  status: 'live' | 'recording' | 'idle';
  bpm: number;
  key: string;
  latency: number;
  participants: string[];
  cue: string;
};

function seededWave(seed: number, length = 48): number[] {
  return Array.from({ length }, (_, index) => {
    const a = Math.sin((index + seed) * 0.62) * 0.32;
    const b = Math.cos((index + seed * 2) * 0.21) * 0.22;
    const c = ((index * seed) % 9) / 28;
    return Math.max(0.12, Math.min(0.96, 0.44 + a + b + c));
  });
}

const stems: Stem[] = [
  { id: 'lead', name: 'Lead Vocal', color: '#22d3ee', gain: -3.2, pan: 0, waveform: seededWave(2) },
  { id: 'drums', name: 'Kick & Snare', color: '#d946ef', gain: -1.5, pan: 0, waveform: seededWave(5) },
  { id: 'bass', name: 'Sub Bass', color: '#fbbf24', gain: -4, pan: 0, waveform: seededWave(7) },
  { id: 'pad', name: 'Pad Synth', color: '#a5b4fc', gain: -8.2, pan: -18, waveform: seededWave(11) },
  { id: 'hats', name: 'Hi-Hats', color: '#34d399', gain: -6, pan: 22, armed: true, waveform: seededWave(13) },
  { id: 'fx', name: 'FX Riser', color: '#f97316', gain: -9.4, pan: 8, muted: true, waveform: seededWave(17) }
];

const tracks: Track[] = [
  {
    id: 'midnight-pulse',
    title: 'Midnight Pulse',
    artist: 'VXNE',
    bpm: 128,
    key: 'Am',
    duration: '3:42',
    genre: 'Electronic',
    status: 'mastered',
    updated: 'Today 18:30',
    stems,
    versions: [
      { id: 'v4', label: 'Final master', author: 'VXNE', time: 'Today 18:30', note: 'Limiter +1dB, vocal air, widened hats' },
      { id: 'v3', label: 'Mix v3', author: 'DJ Kael', time: 'Yesterday 14:00', note: 'Sub tightened, pad ducked under vocal' },
      { id: 'v2', label: 'Vocal comp', author: 'Luna', time: 'Apr 9 21:12', note: 'Hook doubled and cleaned' }
    ]
  },
  {
    id: 'neon-rain',
    title: 'Neon Rain',
    artist: 'VXNE ft. Luna',
    bpm: 140,
    key: 'Cm',
    duration: '4:18',
    genre: 'Drum & Bass',
    status: 'mixing',
    updated: 'Today 11:20',
    stems: stems.slice(0, 5).map((stem, index) => ({ ...stem, waveform: seededWave(index + 21) })),
    versions: [
      { id: 'v2', label: 'Mix v2', author: 'VXNE', time: 'Today 11:20', note: 'Balanced guitar loop and bridge risers' },
      { id: 'v1', label: 'Stems recorded', author: 'Luna', time: 'Apr 8 16:00', note: 'Lead vocal and doubles delivered' }
    ]
  },
  {
    id: 'deep-currents',
    title: 'Deep Currents',
    artist: 'VXNE',
    bpm: 122,
    key: 'Fm',
    duration: '5:01',
    genre: 'Deep House',
    status: 'recording',
    updated: 'Apr 7 16:45',
    stems: stems.slice(1, 5).map((stem, index) => ({ ...stem, waveform: seededWave(index + 31) })),
    versions: [
      { id: 'v2', label: 'Session 3', author: 'VXNE', time: 'Apr 7 16:45', note: 'Keys added, bass re-armed' },
      { id: 'v1', label: 'Drum pass', author: 'VXNE', time: 'Apr 6 10:00', note: 'Main drums laid down' }
    ]
  }
];

const collaborators: Collaborator[] = [
  { id: 'kael', name: 'DJ Kael', role: 'Producer / Mixer', initials: 'DK', color: '#22d3ee', status: 'editing drums', master: 30, publishing: 25, signed: true },
  { id: 'luna', name: 'Luna', role: 'Vocalist / Songwriter', initials: 'L', color: '#d946ef', status: 'reviewing hook', master: 20, publishing: 35, signed: false },
  { id: 'drift', name: 'MC Drift', role: 'Performer', initials: 'MD', color: '#fbbf24', status: 'live in room', master: 15, publishing: 20, signed: true },
  { id: 'prism', name: 'Prism', role: 'Engineer', initials: 'P', color: '#34d399', status: 'bounce QA', master: 10, publishing: 5, signed: false },
  { id: 'juno', name: 'Juno Park', role: 'A&R', initials: 'JP', color: '#a5b4fc', status: 'awaiting split', master: 25, publishing: 15, signed: false }
];

const rooms: Room[] = [
  { id: 'control-a', name: 'Control Room A', host: 'DJ Kael', status: 'live', bpm: 128, key: 'Am', latency: 24, participants: ['DK', 'L', 'MD'], cue: 'Hook comp pass' },
  { id: 'vocal-booth', name: 'Vocal Booth', host: 'Luna', status: 'recording', bpm: 140, key: 'Cm', latency: 31, participants: ['L', 'P'], cue: 'Bridge doubles' },
  { id: 'mastering', name: 'Mastering Review', host: 'Prism', status: 'idle', bpm: 122, key: 'Fm', latency: 18, participants: ['P', 'JP'], cue: 'Limiter A/B' }
];

function useAuth() {
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem(AUTH_KEY) === 'true');
  const login = () => {
    localStorage.setItem(AUTH_KEY, 'true');
    setAuthenticated(true);
  };
  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
  };
  return { authenticated, login, logout };
}

function Protected({ children }: { children: ReactNode }) {
  const { authenticated } = useAuth();
  const location = useLocation();
  if (!authenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="ps2-root">
      <div className="ps2-registry-strip">
        <a href="/registry" className="ps2-registry-link">decantr.ai</a>
        <span className="ps2-registry-badge">Producer Studio</span>
      </div>
      {children}
    </div>
  );
}

function PublicNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="ps2-public-nav">
      <Link to="/" className="ps2-brand"><Disc3 size={18} /> Producer Studio</Link>
      <nav className="ps2-public-links">
        <a href="#cockpit">Cockpit</a>
        <a href="#workflow">Workflow</a>
        <a href="#pricing">Pricing</a>
        <Link to="/login">Sign in</Link>
        <Link to="/register" className="ps2-primary-cta">Start producing</Link>
      </nav>
      <button className="ps2-icon-button ps2-mobile-only" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      {open && (
        <div className="ps2-mobile-menu">
          <a href="#cockpit" onClick={() => setOpen(false)}>Cockpit</a>
          <a href="#workflow" onClick={() => setOpen(false)}>Workflow</a>
          <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
          <Link to="/register" onClick={() => setOpen(false)}>Start producing</Link>
        </div>
      )}
    </header>
  );
}

function TransportBar({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`ps2-transport ${compact ? 'compact' : ''}`} aria-label="DAW transport controls">
      <div className="ps2-transport-controls">
        <button className="ps2-icon-button" type="button" aria-label="Rewind"><Rewind size={16} /></button>
        <button className="ps2-play-button" type="button" aria-label="Play"><Play size={18} fill="currentColor" /></button>
        <button className="ps2-icon-button" type="button" aria-label="Stop"><Square size={14} fill="currentColor" /></button>
        <button className="ps2-record-button" type="button"><Circle size={12} fill="currentColor" /> Rec</button>
      </div>
      <div className="ps2-transport-center">
        <span>01:24.32</span>
        <div className="ps2-progress"><span /></div>
      </div>
      <div className="ps2-transport-meta">
        <span>128 BPM</span>
        <span>Am</span>
        <span><Gauge size={14} /> 24ms</span>
      </div>
    </section>
  );
}

function Waveform({ stem, bars = 42 }: { stem: Stem; bars?: number }) {
  return (
    <div className="ps2-waveform" aria-hidden="true">
      {stem.waveform.slice(0, bars).map((value, index) => (
        <span
          key={`${stem.id}-${index}`}
          style={{ '--bar-height': `${Math.round(value * 76)}%`, '--bar-color': stem.color } as CSSProperties}
        />
      ))}
    </div>
  );
}

function ArrangementCanvas({ preview = false }: { preview?: boolean }) {
  const markers = ['Intro', 'Verse', 'Hook', 'Drop', 'Bridge'];
  return (
    <section className={`ps2-arrangement ${preview ? 'preview' : ''}`} id="cockpit">
      <div className="ps2-ruler">
        {markers.map((marker, index) => (
          <span key={marker} style={{ left: `${8 + index * 21}%` }}>{marker}</span>
        ))}
      </div>
      <div className="ps2-playhead" />
      <div className="ps2-cursor ps2-cursor-kael">DK</div>
      <div className="ps2-cursor ps2-cursor-luna">Luna</div>
      {stems.slice(0, preview ? 4 : 6).map((stem, index) => (
        <div className="ps2-track-row" key={stem.id}>
          <div className="ps2-track-head">
            <span className="ps2-stem-dot" style={{ background: stem.color }} />
            <strong>{stem.name}</strong>
            <small>{stem.gain.toFixed(1)} dB</small>
          </div>
          <div className="ps2-track-lane">
            <div className="ps2-region" style={{ left: `${6 + index * 3}%`, width: `${58 - index * 2}%`, borderColor: stem.color }}>
              <Waveform stem={stem} />
            </div>
            {!preview && index < 3 && <div className="ps2-automation-line" />}
          </div>
        </div>
      ))}
    </section>
  );
}

function MixerConsole({ compact = false }: { compact?: boolean }) {
  const visible = compact ? stems.slice(0, 4) : stems;
  return (
    <section className={`ps2-mixer ${compact ? 'compact' : ''}`} aria-label="Mixer console">
      {visible.map((stem, index) => (
        <article className="ps2-channel" key={stem.id}>
          <strong style={{ color: stem.color }}>{stem.name.split(' ')[0]}</strong>
          <div className="ps2-inserts"><span>EQ</span><span>Comp</span>{!compact && <span>Sat</span>}</div>
          <div className="ps2-knob" style={{ '--knob-angle': `${130 + stem.pan}deg` } as CSSProperties} />
          <div className="ps2-mini-buttons"><span>M</span><span>S</span><span className={stem.armed ? 'armed' : ''}>R</span></div>
          <div className="ps2-fader-bank">
            <span className="ps2-meter" style={{ '--meter-level': `${64 + index * 4}%` } as CSSProperties} />
            <span className="ps2-fader"><i style={{ bottom: `${62 + stem.gain * 2}%` }} /></span>
            <span className="ps2-meter alt" style={{ '--meter-level': `${56 + index * 5}%` } as CSSProperties} />
          </div>
          <small>{stem.gain.toFixed(1)}</small>
        </article>
      ))}
      <article className="ps2-channel master">
        <strong>Master</strong>
        <div className="ps2-inserts"><span>Limit</span><span>LUFS</span></div>
        <div className="ps2-fader-bank">
          <span className="ps2-meter" style={{ '--meter-level': '82%' } as CSSProperties} />
          <span className="ps2-fader"><i style={{ bottom: '72%' }} /></span>
          <span className="ps2-meter alt" style={{ '--meter-level': '78%' } as CSSProperties} />
        </div>
        <small>-9.1 LUFS</small>
      </article>
    </section>
  );
}

function PresenceStack({ people = collaborators.slice(0, 4) }: { people?: Collaborator[] }) {
  return (
    <div className="ps2-presence" aria-label="Active collaborators">
      {people.map((person) => (
        <span key={person.id} style={{ borderColor: person.color }}>{person.initials}</span>
      ))}
    </div>
  );
}

function SessionInspector({ track = tracks[0] }: { track?: Track }) {
  return (
    <aside className="ps2-inspector">
      <div className="ps2-panel-heading"><PanelRight size={16} /> Inspector</div>
      <section>
        <small>Selected region</small>
        <strong>{track.title} / Lead Vocal</strong>
        <p>Hook comp, take 04. Automation: volume +2.1 dB into chorus.</p>
      </section>
      <section>
        <small>Export readiness</small>
        <div className="ps2-status-row good"><CheckCircle2 size={15} /> Stems aligned</div>
        <div className="ps2-status-row warn"><AlertTriangle size={15} /> Split signatures pending review</div>
      </section>
      <section>
        <small>Collaborators</small>
        {collaborators.slice(0, 3).map((person) => (
          <div className="ps2-person-row" key={person.id}>
            <span style={{ background: person.color }}>{person.initials}</span>
            <div><strong>{person.name}</strong><small>{person.status}</small></div>
          </div>
        ))}
      </section>
    </aside>
  );
}

function ProductCockpit({ preview = false }: { preview?: boolean }) {
  return (
    <div className={`ps2-cockpit ${preview ? 'home-preview' : ''}`}>
      <div className="ps2-cockpit-titlebar">
        <div>
          <span className="ps2-live-dot" />
          <div>
            <strong>Midnight Pulse</strong>
            <small>Live arrangement / 6 stems / Split check armed</small>
          </div>
        </div>
        <div className="ps2-cockpit-actions">
          <span><Headphones size={14} /> Control Room A</span>
          <PresenceStack people={collaborators.slice(0, 3)} />
        </div>
      </div>
      <TransportBar compact={preview} />
      <div className="ps2-cockpit-grid">
        <ArrangementCanvas preview={preview} />
        <SessionInspector />
      </div>
      <MixerConsole compact={preview} />
    </div>
  );
}

function HomePage() {
  return (
    <AppFrame>
      <PublicNav />
      <main className="ps2-home">
        <section className="ps2-home-hero">
          <div className="ps2-hero-copy">
            <span className="ps2-eyebrow"><Sparkles size={14} /> Browser DAW cockpit</span>
            <h1>Producer Studio</h1>
            <p>A commercial-grade browser studio for arranging stems, mixing takes, running live rooms, and clearing split readiness from the same working session.</p>
            <div className="ps2-hero-metrics" aria-label="Studio status">
              <span><strong>24ms</strong> room latency</span>
              <span><strong>6</strong> active stems</span>
              <span><strong>100%</strong> master split</span>
            </div>
            <div className="ps2-hero-actions">
              <Link to="/register" className="ps2-primary-cta">Start producing</Link>
              <Link to="/login" className="ps2-ghost-cta">Open live session</Link>
            </div>
          </div>
          <ProductCockpit preview />
        </section>
        <section className="ps2-proof-strip" id="workflow">
          {[
            ['Arrange', 'Beat-grid waveform regions, automation lanes, named markers.', AudioWaveform],
            ['Mix', 'Channel strips, insert slots, live meters, and master bus.', MonitorSpeaker],
            ['Collab', 'Live rooms, shared transport, presence, cue markers.', Radio],
            ['Split', 'Master and publishing percentages validated before release.', Percent]
          ].map(([title, copy, Icon]) => (
            <article key={title as string}>
              <Icon size={20} />
              <h2>{title as string}</h2>
              <p>{copy as string}</p>
            </article>
          ))}
        </section>
        <section className="ps2-pricing-band" id="pricing">
          <div>
            <span className="ps2-eyebrow">Pricing</span>
            <h2>Plans that scale with the session.</h2>
          </div>
          {['Free crate', 'Studio', 'Label'].map((tier, index) => (
            <article key={tier} className={index === 1 ? 'featured' : ''}>
              <small>{tier}</small>
              <strong>{index === 0 ? '$0' : index === 1 ? '$19' : 'custom'}</strong>
              <span>{index === 0 ? '3 sessions' : index === 1 ? 'Unlimited stems' : 'Rights ops'}</span>
            </article>
          ))}
        </section>
      </main>
    </AppFrame>
  );
}

const navItems = [
  { label: 'Session', route: '/session', icon: SlidersHorizontal, match: '/session' },
  { label: 'Tracks', route: '/tracks', icon: Library, match: '/tracks' },
  { label: 'Splits', route: '/collab/splits', icon: Percent, match: '/collab' },
  { label: 'Rooms', route: '/rooms', icon: Radio, match: '/rooms' }
];

function StudioShell({ children, title, actions }: { children: ReactNode; title: string; actions?: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <AppFrame>
      <div className="ps2-shell">
        <aside className={`ps2-sidebar ${open ? 'open' : ''}`}>
          <Link to="/session" className="ps2-brand"><Disc3 size={18} /> Studio</Link>
          <nav>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.route} to={item.route} className={location.pathname.startsWith(item.match) ? 'active' : ''} onClick={() => setOpen(false)}>
                  <Icon size={17} /> {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ps2-sidebar-footer">
            <Link to="/settings/profile"><Settings size={16} /> Settings</Link>
            <button type="button" onClick={() => { logout(); navigate('/'); }}><LogOut size={16} /> Sign out</button>
          </div>
        </aside>
        <div className="ps2-main">
          <header className="ps2-studio-header">
            <button className="ps2-icon-button ps2-mobile-only" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div><small>Producer Studio</small><h1>{title}</h1></div>
            <div className="ps2-header-actions">{actions ?? <PresenceStack />}</div>
          </header>
          {children}
        </div>
        <nav className="ps2-bottom-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.route} to={item.route} className={location.pathname.startsWith(item.match) ? 'active' : ''}>
                <Icon size={18} /><span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </AppFrame>
  );
}

function SessionPage() {
  const [panel, setPanel] = useState<'arrangement' | 'mixer' | 'inspector' | 'crate'>('arrangement');
  const panelOptions = [
    ['arrangement', 'Arrange'],
    ['mixer', 'Mixer'],
    ['inspector', 'Inspect'],
    ['crate', 'Stems']
  ] as const;
  return (
    <StudioShell title="Midnight Pulse" actions={<><span className="ps2-sync-pill"><Activity size={14} /> Live sync</span><PresenceStack /></>}>
      <main className="ps2-workspace">
        <TransportBar />
        <div className="ps2-panel-tabs">
          {panelOptions.map(([name, label]) => (
            <button key={name} className={panel === name ? 'active' : ''} type="button" onClick={() => setPanel(name)}>{label}</button>
          ))}
        </div>
        <div className="ps2-workspace-grid">
          <div className={`ps2-workspace-panel arrangement-panel ${panel === 'arrangement' ? 'active' : ''}`}><ArrangementCanvas /></div>
          <div className={`ps2-workspace-panel inspector-panel ${panel === 'inspector' ? 'active' : ''}`}><SessionInspector /></div>
        </div>
        <div className={`ps2-workspace-panel mixer-panel ${panel === 'mixer' ? 'active' : ''}`}><MixerConsole /></div>
        <div className={`ps2-workspace-panel crate-panel ${panel === 'crate' ? 'active' : ''}`}><StemBrowser compact /></div>
      </main>
    </StudioShell>
  );
}

function SessionDetailPage() {
  const { id } = useParams();
  const track = tracks.find((item) => item.id === id) ?? tracks[0];
  return (
    <StudioShell title={`${track.title} review`}>
      <main className="ps2-workspace detail-page">
        <TransportBar compact />
        <div className="ps2-workspace-grid">
          <ArrangementCanvas preview />
          <SessionInspector track={track} />
        </div>
        <VersionTimeline track={track} />
        <MixerConsole compact />
      </main>
    </StudioShell>
  );
}

function StemBrowser({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`ps2-stem-browser ${compact ? 'compact' : ''}`}>
      <div className="ps2-browser-toolbar">
        <label><Search size={16} /><input placeholder="Search stems, BPM, key, collaborator" /></label>
        <button type="button"><UploadCloud size={16} /> Drop stems</button>
      </div>
      {tracks.map((track) => (
        <Link to={`/tracks/${track.id}`} className="ps2-track-card" key={track.id}>
          <div>
            <strong>{track.title}</strong>
            <small>{track.artist} / {track.bpm} BPM / {track.key} / {track.genre}</small>
          </div>
          <Waveform stem={track.stems[0]} bars={compact ? 24 : 38} />
          <span className={`ps2-status-pill ${track.status}`}>{track.status}</span>
        </Link>
      ))}
    </section>
  );
}

function TracksPage() {
  return (
    <StudioShell title="Track crate">
      <main className="ps2-list-page"><StemBrowser /></main>
    </StudioShell>
  );
}

function TrackDetailPage() {
  const { id } = useParams();
  const track = tracks.find((item) => item.id === id) ?? tracks[0];
  return (
    <StudioShell title={track.title}>
      <main className="ps2-workspace detail-page">
        <TransportBar compact />
        <ArrangementCanvas preview />
        <VersionTimeline track={track} />
      </main>
    </StudioShell>
  );
}

function VersionTimeline({ track }: { track: Track }) {
  return (
    <section className="ps2-version-timeline">
      <div className="ps2-panel-heading"><Clock3 size={16} /> Version history</div>
      {track.versions.map((version) => (
        <article key={version.id}>
          <BadgeCheck size={16} />
          <div><strong>{version.label}</strong><small>{version.author} / {version.time}</small><p>{version.note}</p></div>
        </article>
      ))}
    </section>
  );
}

function CollaboratorsPage() {
  return (
    <StudioShell title="Collaborators">
      <main className="ps2-list-page ps2-collaborator-grid">
        {collaborators.map((person) => <CollaboratorCard key={person.id} person={person} />)}
      </main>
    </StudioShell>
  );
}

function CollaboratorCard({ person }: { person: Collaborator }) {
  return (
    <article className="ps2-collab-card">
      <span className="ps2-avatar" style={{ background: person.color }}>{person.initials}</span>
      <div><h2>{person.name}</h2><p>{person.role}</p><small>{person.status}</small></div>
      <div className="ps2-split-mini"><span>Master {person.master}%</span><span>Publishing {person.publishing}%</span></div>
    </article>
  );
}

function SplitsPage() {
  const masterTotal = collaborators.reduce((sum, person) => sum + person.master, 0);
  const publishingTotal = collaborators.reduce((sum, person) => sum + person.publishing, 0);
  return (
    <StudioShell title="Split workbench">
      <main className="ps2-list-page">
        <section className="ps2-split-workbench">
          <div className="ps2-split-header">
            <div><small>Midnight Pulse</small><h2>Royalty readiness</h2></div>
            <span className={masterTotal === 100 && publishingTotal === 100 ? 'valid-total' : 'invalid-total'}>
              {masterTotal}% master / {publishingTotal}% publishing
            </span>
          </div>
          {collaborators.map((person) => (
            <article className="ps2-split-row" key={person.id}>
              <span className="ps2-avatar" style={{ background: person.color }}>{person.initials}</span>
              <strong>{person.name}</strong>
              <span>{person.role}</span>
              <span>Master {person.master}%</span>
              <span>Pub {person.publishing}%</span>
              <span className={person.signed ? 'signed' : 'pending'}>{person.signed ? 'Signed' : 'Pending'}</span>
            </article>
          ))}
        </section>
      </main>
    </StudioShell>
  );
}

function RoomsPage() {
  return (
    <StudioShell title="Live rooms">
      <main className="ps2-list-page ps2-rooms-grid">
        {rooms.map((room) => <RoomCard key={room.id} room={room} />)}
      </main>
    </StudioShell>
  );
}

function RoomCard({ room }: { room: Room }) {
  return (
    <Link to={`/rooms/${room.id}`} className="ps2-room-card">
      <div className="ps2-room-stage">
        <Radio size={22} />
        <span className={`ps2-status-pill ${room.status}`}>{room.status}</span>
      </div>
      <h2>{room.name}</h2>
      <p>{room.cue}</p>
      <div><span>{room.bpm} BPM</span><span>{room.key}</span><span>{room.latency}ms</span></div>
      <div className="ps2-presence">{room.participants.map((p) => <span key={p}>{p}</span>)}</div>
    </Link>
  );
}

function RoomDetailPage() {
  const { id } = useParams();
  const room = rooms.find((item) => item.id === id) ?? rooms[0];
  return (
    <StudioShell title={room.name}>
      <main className="ps2-workspace room-detail">
        <section className="ps2-live-stage">
          <div><Mic2 size={26} /><span className={`ps2-status-pill ${room.status}`}>{room.status}</span></div>
          <h2>{room.cue}</h2>
          <p>Hosted by {room.host}. Shared transport is locked at {room.bpm} BPM in {room.key}; latency {room.latency}ms.</p>
          <PresenceStack />
        </section>
        <TransportBar compact />
        <section className="ps2-chat-panel">
          <div className="ps2-panel-heading"><MessageSquare size={16} /> Room notes</div>
          <p><strong>DJ Kael:</strong> Punch in at bar 33, same pre-delay.</p>
          <p><strong>Luna:</strong> Keeping take 04. One harmony pass left.</p>
        </section>
      </main>
    </StudioShell>
  );
}

function AuthPage({ mode }: { mode: 'login' | 'register' | 'forgot' | 'reset' | 'verify' | 'mfa' | 'phone' }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const title = useMemo(() => ({
    login: 'Sign in',
    register: 'Create studio account',
    forgot: 'Reset password',
    reset: 'Choose a new password',
    verify: 'Verify email',
    mfa: 'Two-factor check',
    phone: 'Verify phone'
  }[mode]), [mode]);
  const Icon = mode === 'mfa' ? QrCode : mode === 'phone' ? Phone : mode === 'verify' ? Mail : LockKeyhole;
  return (
    <AppFrame>
      <main className="ps2-auth-page">
        <Link to="/" className="ps2-brand"><Disc3 size={18} /> Producer Studio</Link>
        <form
          className="ps2-auth-card"
          onSubmit={(event) => {
            event.preventDefault();
            login();
            navigate('/session');
          }}
        >
          <Icon size={28} />
          <h1>{title}</h1>
          <p>Mock auth accepts any input and opens the studio cockpit.</p>
          {mode !== 'verify' && <label>Email<input type="email" defaultValue="producer@studio.test" /></label>}
          {(mode === 'login' || mode === 'register' || mode === 'reset') && <label>Password<input type="password" defaultValue="producerstudio" /></label>}
          {(mode === 'mfa' || mode === 'phone') && <label>Code<input defaultValue="128042" /></label>}
          <button type="submit">{mode === 'register' ? 'Create and enter studio' : 'Record session'}</button>
          <div className="ps2-auth-links">
            <Link to="/register">Create account</Link>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </form>
      </main>
    </AppFrame>
  );
}

function SettingsPage({ page }: { page: 'profile' | 'security' | 'preferences' | 'danger' }) {
  const data = {
    profile: [UserCircle, 'Profile', 'Artist alias, default genre, and collaborator visibility.'],
    security: [Shield, 'Security', 'Password, MFA, connected devices, and session controls.'],
    preferences: [Bell, 'Preferences', 'Meter mode, reduced motion, notifications, and theme.'],
    danger: [Trash2, 'Danger zone', 'Export catalog, delete workspace, or revoke label access.']
  } as const;
  const [Icon, title, copy] = data[page];
  return (
    <StudioShell title={title}>
      <main className="ps2-list-page">
        <section className="ps2-settings-panel">
          <Icon size={28} />
          <h2>{title}</h2>
          <p>{copy}</p>
          <div className="ps2-settings-grid">
            <label>Display name<input defaultValue="VXNE" /></label>
            <label>Default bounce format<select defaultValue="wav"><option value="wav">WAV 24-bit</option><option value="mp3">MP3 320</option></select></label>
            <label><input type="checkbox" defaultChecked /> Show live collaborator cursors</label>
          </div>
        </section>
      </main>
    </StudioShell>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
      <Route path="/reset-password" element={<AuthPage mode="reset" />} />
      <Route path="/verify-email" element={<AuthPage mode="verify" />} />
      <Route path="/mfa-setup" element={<AuthPage mode="mfa" />} />
      <Route path="/mfa-verify" element={<AuthPage mode="mfa" />} />
      <Route path="/phone-verify" element={<AuthPage mode="phone" />} />
      <Route path="/session" element={<Protected><SessionPage /></Protected>} />
      <Route path="/session/:id" element={<Protected><SessionDetailPage /></Protected>} />
      <Route path="/tracks" element={<Protected><TracksPage /></Protected>} />
      <Route path="/tracks/:id" element={<Protected><TrackDetailPage /></Protected>} />
      <Route path="/collab" element={<Protected><CollaboratorsPage /></Protected>} />
      <Route path="/collab/splits" element={<Protected><SplitsPage /></Protected>} />
      <Route path="/rooms" element={<Protected><RoomsPage /></Protected>} />
      <Route path="/rooms/:id" element={<Protected><RoomDetailPage /></Protected>} />
      <Route path="/settings/profile" element={<Protected><SettingsPage page="profile" /></Protected>} />
      <Route path="/settings/security" element={<Protected><SettingsPage page="security" /></Protected>} />
      <Route path="/settings/preferences" element={<Protected><SettingsPage page="preferences" /></Protected>} />
      <Route path="/settings/danger" element={<Protected><SettingsPage page="danger" /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
