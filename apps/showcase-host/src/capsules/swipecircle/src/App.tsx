import { useMemo, useState } from 'react';
import { HashRouter, Link, Navigate, NavLink, Route, Routes, useParams } from 'react-router-dom';
import {
  Bell,
  Camera,
  Check,
  Heart,
  Home,
  MessageCircle,
  Settings,
  Sparkles,
  Star,
  User,
  Users,
  X,
} from 'lucide-react';

const people = [
  {
    id: 'maya',
    name: 'Maya',
    age: 29,
    city: 'Brooklyn',
    score: '94%',
    image: 'linear-gradient(135deg, #ff8a7a, #ffc1a6 46%, #7c3aed)',
    line: 'Designs tiny rituals, collects photo booths, makes very serious playlists.',
    interests: ['ceramics', 'night markets', 'film', 'badminton'],
  },
  {
    id: 'leo',
    name: 'Leo',
    age: 31,
    city: 'Oakland',
    score: '91%',
    image: 'linear-gradient(135deg, #f472b6, #fb7185 42%, #fde68a)',
    line: 'Weekend climber, weeknight dumpling critic, always building something impractical.',
    interests: ['climbing', 'dumplings', 'synths', 'zines'],
  },
  {
    id: 'nora',
    name: 'Nora',
    age: 27,
    city: 'Austin',
    score: '89%',
    image: 'linear-gradient(135deg, #fb7185, #f97316 46%, #c084fc)',
    line: 'Plants everywhere, strong opinions about tacos, currently learning drums.',
    interests: ['plants', 'drums', 'tacos', 'bookstores'],
  },
];

const chats = [
  { id: 'maya', preview: 'Coffee after the gallery thing?', time: '2m' },
  { id: 'leo', preview: 'I found the best tiny listening bar.', time: '18m' },
  { id: 'nora', preview: 'Your match prompt was too good.', time: '1h' },
];

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="swipe-shell">
      <div className="swipe-phone">
        <header className="swipe-status">
          <span>SwipeCircle</span>
          <span>9:41</span>
        </header>
        <section className="swipe-screen">{children}</section>
        <nav className="swipe-tabs" aria-label="SwipeCircle navigation">
          <NavLink to="/discover" className={({ isActive }) => (isActive ? 'swipecircle-tab-active' : undefined)}>
            <Home size={19} />
          </NavLink>
          <NavLink to="/matches" className={({ isActive }) => (isActive ? 'swipecircle-tab-active' : undefined)}>
            <Users size={19} />
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => (isActive ? 'swipecircle-tab-active' : undefined)}>
            <MessageCircle size={19} />
          </NavLink>
          <NavLink to="/me" className={({ isActive }) => (isActive ? 'swipecircle-tab-active' : undefined)}>
            <User size={19} />
          </NavLink>
        </nav>
      </div>
    </main>
  );
}

function LandingPage() {
  return (
    <main className="swipe-landing">
      <nav className="swipe-landing-nav">
        <Link to="/" className="swipe-brand">
          <Heart size={18} />
          SwipeCircle
        </Link>
        <div>
          <Link to="/login">Log in</Link>
          <Link to="/signup" className="swipecircle-pill">Join</Link>
        </div>
      </nav>
      <section className="swipe-hero">
        <div className="swipe-hero-copy">
          <span className="swipe-eyebrow">Social discovery with taste</span>
          <h1>Meet people through the things you actually notice.</h1>
          <p>
            SwipeCircle turns ratings, prompts, tiny moments, and shared interests into a warmer way to discover your next favorite person.
          </p>
          <div className="swipe-hero-actions">
            <Link to="/discover" className="swipecircle-pill">Open demo</Link>
            <Link to="/signup">Create profile</Link>
          </div>
        </div>
        <div className="swipe-hero-phone" aria-hidden="true">
          <ProfileCard person={people[0]} stacked />
        </div>
      </section>
    </main>
  );
}

function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  return (
    <main className="swipe-auth">
      <section className="swipe-auth-card">
        <Link to="/" className="swipe-brand">
          <Heart size={18} />
          SwipeCircle
        </Link>
        <div>
          <span className="swipe-eyebrow">{mode === 'login' ? 'Welcome back' : 'Start your circle'}</span>
          <h1>{mode === 'login' ? 'Log in to keep swiping.' : 'Build a profile with a little sparkle.'}</h1>
        </div>
        <label>
          Email
          <input defaultValue={mode === 'login' ? 'maya@example.com' : ''} placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type="password" defaultValue="swipecircle" />
        </label>
        <Link to={mode === 'login' ? '/discover' : '/onboarding/profile'} className="swipecircle-pill">
          {mode === 'login' ? 'Continue' : 'Create account'}
        </Link>
      </section>
    </main>
  );
}

function OnboardingPage({ step }: { step: 'profile' | 'interests' }) {
  const interests = ['coffee walks', 'film photos', 'new restaurants', 'karaoke', 'bike rides', 'ceramics'];
  return (
    <main className="swipe-auth">
      <section className="swipe-auth-card swipe-onboarding">
        <span className="swipe-eyebrow">Step {step === 'profile' ? '1' : '2'} of 2</span>
        <h1>{step === 'profile' ? 'Add the first-glance details.' : 'Pick the signals people can match on.'}</h1>
        {step === 'profile' ? (
          <div className="swipe-upload">
            <Camera size={24} />
            <strong>Profile photo</strong>
            <span>Drop in something candid.</span>
          </div>
        ) : (
          <div className="swipe-chip-grid">
            {interests.map((interest, index) => (
              <button key={interest} className={index < 3 ? 'swipecircle-chip-selected' : ''}>
                {index < 3 ? <Check size={14} /> : null}
                {interest}
              </button>
            ))}
          </div>
        )}
        <Link to={step === 'profile' ? '/onboarding/interests' : '/discover'} className="swipecircle-pill">
          {step === 'profile' ? 'Next' : 'Start swiping'}
        </Link>
      </section>
    </main>
  );
}

function ProfileCard({ person, stacked = false }: { person: (typeof people)[number]; stacked?: boolean }) {
  return (
    <article className="swipecircle-card swipe-profile-card" data-stacked={stacked}>
      <div className="swipe-photo" style={{ background: person.image }}>
        <span>{person.score} vibe match</span>
      </div>
      <div className="swipe-profile-copy">
        <h2>{person.name}, {person.age}</h2>
        <span>{person.city}</span>
        <p>{person.line}</p>
        <div>
          {person.interests.map((interest) => (
            <em key={interest}>{interest}</em>
          ))}
        </div>
      </div>
    </article>
  );
}

function DiscoverPage() {
  const [index, setIndex] = useState(0);
  const person = people[index % people.length];
  return (
    <Shell>
      <div className="swipe-screen-header">
        <div>
          <span className="swipe-eyebrow">Discover</span>
          <h1>Today’s circle</h1>
        </div>
        <Bell size={19} />
      </div>
      <div className="swipe-deck">
        <ProfileCard person={person} />
      </div>
      <div className="swipecircle-floating-bar">
        <button className="swipecircle-action-button" data-action="skip" onClick={() => setIndex(index + 1)} aria-label="Skip profile">
          <X size={24} />
        </button>
        <button className="swipecircle-action-button" data-action="star" onClick={() => setIndex(index + 1)} aria-label="Super like profile">
          <Star size={22} />
        </button>
        <button className="swipecircle-action-button" data-action="like" onClick={() => setIndex(index + 1)} aria-label="Like profile">
          <Heart size={24} />
        </button>
      </div>
    </Shell>
  );
}

function MatchesPage() {
  return (
    <Shell>
      <div className="swipe-screen-header">
        <div>
          <span className="swipe-eyebrow">Matches</span>
          <h1>New sparks</h1>
        </div>
        <Sparkles size={19} />
      </div>
      <div className="swipe-match-grid">
        {people.map((person) => (
          <Link to={`/u/${person.id}`} className="swipecircle-grid-tile" key={person.id}>
            <span className="swipe-avatar" style={{ background: person.image }} />
            <strong>{person.name}</strong>
            <small>{person.score}</small>
          </Link>
        ))}
      </div>
    </Shell>
  );
}

function ChatListPage() {
  return (
    <Shell>
      <div className="swipe-screen-header">
        <div>
          <span className="swipe-eyebrow">Chat</span>
          <h1>Open loops</h1>
        </div>
      </div>
      <div className="swipe-chat-list">
        {chats.map((chat) => {
          const person = people.find((candidate) => candidate.id === chat.id)!;
          return (
            <Link to={`/chat/${chat.id}`} key={chat.id}>
              <span className="swipe-avatar" style={{ background: person.image }} />
              <div>
                <strong>{person.name}</strong>
                <p>{chat.preview}</p>
              </div>
              <time>{chat.time}</time>
            </Link>
          );
        })}
      </div>
    </Shell>
  );
}

function ChatThreadPage() {
  const { userId } = useParams();
  const person = people.find((candidate) => candidate.id === userId) ?? people[0];
  return (
    <Shell>
      <div className="swipe-screen-header">
        <div>
          <span className="swipe-eyebrow">Chat with {person.name}</span>
          <h1>{person.city}</h1>
        </div>
      </div>
      <div className="swipe-thread">
        <p className="swipecircle-bubble">Your film prompt made me laugh.</p>
        <p className="swipecircle-bubble" data-mine="true">That was my entire strategy.</p>
        <p className="swipecircle-bubble">Bold. Effective. Coffee this weekend?</p>
      </div>
    </Shell>
  );
}

function ProfilePage({ mine = false }: { mine?: boolean }) {
  const { userId } = useParams();
  const person = useMemo(() => people.find((candidate) => candidate.id === userId) ?? people[0], [userId]);
  return (
    <Shell>
      <div className="swipe-screen-header">
        <div>
          <span className="swipe-eyebrow">{mine ? 'Your profile' : 'Profile'}</span>
          <h1>{mine ? 'Maya, 29' : `${person.name}, ${person.age}`}</h1>
        </div>
        <Link to="/settings"><Settings size={19} /></Link>
      </div>
      <ProfileCard person={mine ? people[0] : person} />
    </Shell>
  );
}

function SettingsPage() {
  return (
    <Shell>
      <div className="swipe-screen-header">
        <div>
          <span className="swipe-eyebrow">Settings</span>
          <h1>Control the circle</h1>
        </div>
      </div>
      <div className="swipe-settings">
        {['Discovery radius', 'Photo visibility', 'Match notifications', 'Private mode'].map((item, index) => (
          <label key={item}>
            <span>{item}</span>
            <input type="checkbox" defaultChecked={index !== 3} />
          </label>
        ))}
      </div>
    </Shell>
  );
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/onboarding/profile" element={<OnboardingPage step="profile" />} />
        <Route path="/onboarding/interests" element={<OnboardingPage step="interests" />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/chat" element={<ChatListPage />} />
        <Route path="/chat/:userId" element={<ChatThreadPage />} />
        <Route path="/me" element={<ProfilePage mine />} />
        <Route path="/u/:userId" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
