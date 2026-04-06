import { Link } from 'react-router-dom';
import { SidebarAsideShell } from '@/components/SidebarAsideShell';
import { WaveformTrack } from '@/components/WaveformTrack';
import { StemStack } from '@/components/StemStack';
import { TRACKS } from '@/data/mock';

const NAV_ITEMS = [
  { label: 'Session', to: '/session', icon: '&#9835;' },
  { label: 'Tracks', to: '/tracks', icon: '&#9836;' },
  { label: 'Collab', to: '/collab', icon: '&#9834;' },
  { label: 'Rooms', to: '/rooms', icon: '&#127908;' },
];

export function SessionPage() {
  const recentTracks = TRACKS.filter((t) => t.status !== 'draft').slice(0, 3);

  return (
    <SidebarAsideShell
      navItems={NAV_ITEMS}
      aside={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="d-label" style={{ color: 'var(--d-accent)', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
            RECENT SESSIONS
          </div>
          {recentTracks.map((t) => (
            <Link
              key={t.id}
              to={`/session/${t.id}`}
              className="d-surface"
              data-interactive
              style={{ display: 'block', textDecoration: 'none', padding: '0.75rem' }}
            >
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--d-text)', marginBottom: '0.25rem' }}>{t.title}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{t.artist} &middot; {t.bpm} BPM &middot; {t.key}</div>
              <div className="d-annotation" data-status={t.status === 'mastered' ? 'success' : t.status === 'mixing' ? 'info' : 'warning'} style={{ marginTop: '0.375rem' }}>
                {t.status}
              </div>
            </Link>
          ))}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Transport bar */}
        <div className="studio-rack" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '1.25rem' }}>&#9664;&#9664;</button>
            <button className="d-interactive neon-glow" data-variant="primary" style={{ padding: '0.25rem 0.75rem', fontSize: '1.25rem' }}>&#9654;</button>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '1.25rem' }}>&#9632;</button>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '1rem', color: 'var(--d-error)' }}>&#9679; REC</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="d-label" style={{ color: 'var(--d-primary)' }}>128 BPM</span>
            <span className="d-label">Am</span>
            <span className="d-label" style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.875rem', color: 'var(--d-primary)' }}>01:24.32</span>
          </div>
        </div>

        {/* Split pane: tracks + mixer */}
        <div>
          <div className="d-label" style={{ color: 'var(--d-accent)', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
            ARRANGEMENT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {TRACKS[0].stems.map((stem) => (
              <WaveformTrack key={stem.id} stem={stem} />
            ))}
          </div>
        </div>

        <div>
          <div className="d-label" style={{ color: 'var(--d-accent)', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
            MIXER
          </div>
          <StemStack stems={TRACKS[0].stems} />
        </div>
      </div>
    </SidebarAsideShell>
  );
}
