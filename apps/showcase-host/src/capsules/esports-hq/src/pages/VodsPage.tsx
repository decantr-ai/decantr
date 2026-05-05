import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock } from 'lucide-react';
import { vods } from '@/data/mock';

export function VodsPage() {
  const [resultFilter, setResultFilter] = useState<string>('');

  const filtered = vods.filter(v => !resultFilter || v.result === resultFilter);

  return (
    <div className="gg-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>VOD Library</h1>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>
            {vods.length} recordings, {vods.reduce((sum, v) => sum + v.annotations, 0)} total annotations.
          </p>
        </div>
        <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.8rem' }}>
          + Upload VOD
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {['', 'win', 'loss', 'draw'].map(f => (
          <button
            key={f}
            className="d-interactive"
            data-variant={resultFilter === f ? 'primary' : 'ghost'}
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', textTransform: 'capitalize' }}
            onClick={() => setResultFilter(f)}
          >
            {f || 'All'}
          </button>
        ))}
      </div>

      {/* Data table */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)', overflow: 'auto' }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Title</th>
              <th className="d-data-header">Opponent</th>
              <th className="d-data-header">Map</th>
              <th className="d-data-header">Date</th>
              <th className="d-data-header">Duration</th>
              <th className="d-data-header">Annotations</th>
              <th className="d-data-header">Result</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(vod => (
              <tr key={vod.id} className="d-data-row" style={{ cursor: 'pointer' }}>
                <td className="d-data-cell">
                  <Link to={`/vods/${vod.id}`} style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 500 }}>
                    {vod.title}
                  </Link>
                </td>
                <td className="d-data-cell">{vod.opponent}</td>
                <td className="d-data-cell">{vod.mapName}</td>
                <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, monospace)' }}>{vod.date}</td>
                <td className="d-data-cell">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} style={{ color: 'var(--d-text-muted)' }} />
                    {vod.duration}
                  </span>
                </td>
                <td className="d-data-cell">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MessageSquare size={12} style={{ color: 'var(--d-text-muted)' }} />
                    {vod.annotations}
                  </span>
                </td>
                <td className="d-data-cell">
                  <span
                    className="d-annotation"
                    data-status={vod.result === 'win' ? 'success' : vod.result === 'loss' ? 'error' : 'warning'}
                    style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}
                  >
                    {vod.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card grid view */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--d-gap-4)' }}>
        {filtered.map(vod => (
          <Link key={vod.id} to={`/vods/${vod.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="d-surface gg-achievement-shine" data-interactive style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                height: 140,
                background: vod.thumbnail,
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
                  <span style={{
                    background: 'rgba(0,0,0,0.7)',
                    padding: '0.125rem 0.5rem',
                    borderRadius: 'var(--d-radius-sm)',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--d-font-mono, monospace)',
                  }}>
                    {vod.duration}
                  </span>
                </div>
                <div style={{ position: 'absolute', top: 8, left: 8 }}>
                  <span
                    className="d-annotation"
                    data-status={vod.result === 'win' ? 'success' : vod.result === 'loss' ? 'error' : 'warning'}
                    style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}
                  >
                    {vod.result}
                  </span>
                </div>
              </div>
              <div style={{ padding: '0.75rem 1rem' }}>
                <div style={{ fontWeight: 500, fontSize: '0.85rem', marginBottom: '0.25rem' }}>{vod.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                  <span>{vod.mapName}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MessageSquare size={11} /> {vod.annotations}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
