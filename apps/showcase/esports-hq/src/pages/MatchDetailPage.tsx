import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Scoreboard } from '@/components/Scoreboard';
import { Timeline } from '@/components/Timeline';
import { scrims, matchEvents, players } from '@/data/mock';
import { Sparkline } from '@/components/Sparkline';

export function MatchDetailPage() {
  const { id } = useParams();
  const scrim = scrims.find(s => s.id === id) || scrims[0];
  const activePlayers = players.filter(p => p.game === scrim.game && p.status === 'active').slice(0, 5);

  return (
    <div className="gg-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)' }}>
      <Link to="/scrims" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Scrims
      </Link>

      <Scoreboard scrim={scrim} />

      {/* Player performance in this match */}
      <div>
        <div className="d-label" style={{ marginBottom: '0.75rem', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
          Player Performance
        </div>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)', overflow: 'auto' }}>
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Player</th>
                <th className="d-data-header">Role</th>
                <th className="d-data-header">K/D</th>
                <th className="d-data-header">Win%</th>
                <th className="d-data-header">Form</th>
              </tr>
            </thead>
            <tbody>
              {activePlayers.map(p => (
                <tr key={p.id} className="d-data-row">
                  <td className="d-data-cell">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: 'var(--d-radius-full)',
                        background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.55rem',
                        fontWeight: 700,
                      }}>
                        {p.avatar}
                      </div>
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                    </div>
                  </td>
                  <td className="d-data-cell" style={{ color: 'var(--d-text-muted)' }}>{p.role}</td>
                  <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, monospace)', fontWeight: 600 }}>{p.kd.toFixed(2)}</td>
                  <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, monospace)' }}>{p.winRate}%</td>
                  <td className="d-data-cell"><Sparkline data={p.sparkline} width={60} height={18} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Match timeline */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div className="d-label" style={{ marginBottom: '0.75rem', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
          Match Timeline
        </div>
        <Timeline events={matchEvents} />
      </div>
    </div>
  );
}
