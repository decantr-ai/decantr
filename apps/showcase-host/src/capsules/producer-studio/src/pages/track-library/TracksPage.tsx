import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SidebarMainShell } from '@/components/SidebarMainShell';
import { TRACKS } from '@/data/mock';

const NAV_ITEMS = [
  { label: 'Session', to: '/session', icon: '&#9835;' },
  { label: 'Tracks', to: '/tracks', icon: '&#9836;' },
  { label: 'Collab', to: '/collab', icon: '&#9834;' },
  { label: 'Rooms', to: '/rooms', icon: '&#127908;' },
];

const STATUS_COLOR: Record<string, string> = {
  mastered: 'success',
  mixing: 'info',
  recording: 'warning',
  draft: undefined as unknown as string,
};

export function TracksPage() {
  const [search, setSearch] = useState('');
  const filtered = TRACKS.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase()) ||
    t.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SidebarMainShell navItems={NAV_ITEMS}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-text)', margin: 0 }}>Track Library</h1>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            className="d-control"
            placeholder="Search tracks, artists, genres..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 400 }}
          />
          <span className="d-label" style={{ color: 'var(--d-text-muted)' }}>{filtered.length} tracks</span>
        </div>

        {/* Data table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="d-data" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th className="d-data-header">Title</th>
                <th className="d-data-header">Artist</th>
                <th className="d-data-header">BPM</th>
                <th className="d-data-header">Key</th>
                <th className="d-data-header">Duration</th>
                <th className="d-data-header">Genre</th>
                <th className="d-data-header">Status</th>
                <th className="d-data-header">Stems</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="d-data-row">
                  <td className="d-data-cell">
                    <Link to={`/tracks/${t.id}`} style={{ color: 'var(--d-primary)', fontWeight: 500, textDecoration: 'none' }}>
                      {t.title}
                    </Link>
                  </td>
                  <td className="d-data-cell" style={{ color: 'var(--d-text-muted)' }}>{t.artist}</td>
                  <td className="d-data-cell" style={{ fontFamily: 'ui-monospace, monospace' }}>{t.bpm}</td>
                  <td className="d-data-cell">{t.key}</td>
                  <td className="d-data-cell" style={{ fontFamily: 'ui-monospace, monospace' }}>{t.duration}</td>
                  <td className="d-data-cell" style={{ color: 'var(--d-text-muted)' }}>{t.genre}</td>
                  <td className="d-data-cell">
                    <span className="d-annotation" data-status={STATUS_COLOR[t.status]}>{t.status}</span>
                  </td>
                  <td className="d-data-cell">{t.stems.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarMainShell>
  );
}
