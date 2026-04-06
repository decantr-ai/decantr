import { useParams, Link } from 'react-router-dom';
import { SidebarAsideShell } from '@/components/SidebarAsideShell';
import { WaveformTrack } from '@/components/WaveformTrack';
import { StemStack } from '@/components/StemStack';
import { getTrackById, TRACKS } from '@/data/mock';

const NAV_ITEMS = [
  { label: 'Session', to: '/session', icon: '&#9835;' },
  { label: 'Tracks', to: '/tracks', icon: '&#9836;' },
  { label: 'Collab', to: '/collab', icon: '&#9834;' },
  { label: 'Rooms', to: '/rooms', icon: '&#127908;' },
];

export function SessionDetailPage() {
  const { id } = useParams();
  const track = getTrackById(id ?? '') ?? TRACKS[0];

  return (
    <SidebarAsideShell
      navItems={NAV_ITEMS}
      aside={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="d-label" style={{ color: 'var(--d-accent)', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
            SESSION INFO
          </div>
          <div className="d-surface" style={{ padding: '0.75rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--d-text)', marginBottom: '0.5rem' }}>{track.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
              <span>Artist: {track.artist}</span>
              <span>BPM: {track.bpm}</span>
              <span>Key: {track.key}</span>
              <span>Duration: {track.duration}</span>
              <span>Genre: {track.genre}</span>
            </div>
            <div className="d-annotation" data-status={track.status === 'mastered' ? 'success' : track.status === 'mixing' ? 'info' : 'warning'} style={{ marginTop: '0.5rem' }}>
              {track.status}
            </div>
          </div>
          <div className="d-label" style={{ color: 'var(--d-accent)', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
            STEMS ({track.stems.length})
          </div>
          {track.stems.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ color: 'var(--d-text)' }}>{s.name}</span>
              <span style={{ color: 'var(--d-text-muted)', marginLeft: 'auto' }}>{s.gainDb > 0 ? '+' : ''}{s.gainDb.toFixed(1)} dB</span>
            </div>
          ))}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
          <Link to="/session" style={{ color: 'var(--d-accent)' }}>Sessions</Link>
          <span> / </span>
          <span style={{ color: 'var(--d-text)' }}>{track.title}</span>
        </div>

        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-text)', margin: 0 }}>{track.title}</h1>

        {/* Waveform tracks */}
        <div>
          <div className="d-label" style={{ color: 'var(--d-accent)', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
            TRACKS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {track.stems.map((stem) => (
              <WaveformTrack key={stem.id} stem={stem} />
            ))}
          </div>
        </div>

        {/* Mixer */}
        <div>
          <div className="d-label" style={{ color: 'var(--d-accent)', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
            MIXER
          </div>
          <StemStack stems={track.stems} />
        </div>
      </div>
    </SidebarAsideShell>
  );
}
