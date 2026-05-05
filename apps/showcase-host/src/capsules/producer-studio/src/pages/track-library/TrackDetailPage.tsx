import { useParams, Link } from 'react-router-dom';
import { SidebarMainShell } from '@/components/SidebarMainShell';
import { WaveformTrack } from '@/components/WaveformTrack';
import { getTrackById, TRACKS } from '@/data/mock';

const NAV_ITEMS = [
  { label: 'Session', to: '/session', icon: '&#9835;' },
  { label: 'Tracks', to: '/tracks', icon: '&#9836;' },
  { label: 'Collab', to: '/collab', icon: '&#9834;' },
  { label: 'Rooms', to: '/rooms', icon: '&#127908;' },
];

export function TrackDetailPage() {
  const { id } = useParams();
  const track = getTrackById(id ?? '') ?? TRACKS[0];

  return (
    <SidebarMainShell navItems={NAV_ITEMS}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
          <Link to="/tracks" style={{ color: 'var(--d-accent)' }}>Tracks</Link>
          <span> / </span>
          <span style={{ color: 'var(--d-text)' }}>{track.title}</span>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-text)', margin: '0 0 0.25rem' }}>{track.title}</h1>
            <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
              {track.artist} &middot; {track.bpm} BPM &middot; {track.key} &middot; {track.duration} &middot; {track.genre}
            </div>
          </div>
          <div className="d-annotation" data-status={track.status === 'mastered' ? 'success' : track.status === 'mixing' ? 'info' : 'warning'}>
            {track.status}
          </div>
        </div>

        {/* Waveform preview */}
        <div>
          <div className="d-label" style={{ color: 'var(--d-accent)', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
            WAVEFORM PREVIEW
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {track.stems.map((stem) => (
              <WaveformTrack key={stem.id} stem={stem} />
            ))}
          </div>
        </div>

        {/* Version history */}
        <div>
          <div className="d-label" style={{ color: 'var(--d-accent)', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
            VERSION HISTORY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {track.versions.map((v, i) => (
              <div
                key={v.id}
                className="d-surface"
                style={{
                  padding: '0.75rem',
                  borderLeft: i === 0 ? '2px solid var(--d-primary)' : '2px solid var(--d-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--d-text)' }}>{v.label}</span>
                  <span className="d-label" style={{ fontSize: '0.625rem' }}>
                    {new Date(v.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.25rem' }}>
                  by {v.author}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                  {v.changes}
                </div>
                {i === 0 && (
                  <div className="d-annotation" data-status="success" style={{ marginTop: '0.5rem' }}>current</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SidebarMainShell>
  );
}
