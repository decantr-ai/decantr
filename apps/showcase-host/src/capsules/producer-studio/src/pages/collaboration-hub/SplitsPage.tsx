import { useState } from 'react';
import { SidebarMainShell } from '@/components/SidebarMainShell';
import { SPLITS } from '@/data/mock';

const NAV_ITEMS = [
  { label: 'Session', to: '/session', icon: '&#9835;' },
  { label: 'Tracks', to: '/tracks', icon: '&#9836;' },
  { label: 'Collab', to: '/collab', icon: '&#9834;' },
  { label: 'Rooms', to: '/rooms', icon: '&#127908;' },
];

const ROLE_COLORS: Record<string, string> = {
  producer: '#D946EF',
  songwriter: '#3B82F6',
  performer: '#FBBF24',
  engineer: '#A8A29E',
  mixer: '#22D3EE',
};

export function SplitsPage() {
  const [selected, setSelected] = useState(SPLITS[0].id);
  const activeSplit = SPLITS.find((s) => s.id === selected) ?? SPLITS[0];

  return (
    <SidebarMainShell navItems={NAV_ITEMS}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-text)', margin: 0 }}>Royalty Splits</h1>

        {/* Split calculator */}
        <div className="d-surface" style={{ maxWidth: 640 }}>
          <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '1rem' }}>SPLIT CALCULATOR</div>

          {/* Track selector */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {SPLITS.map((s) => (
              <button
                key={s.id}
                className="d-interactive"
                data-variant={selected === s.id ? 'primary' : 'ghost'}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                onClick={() => setSelected(s.id)}
              >
                {s.trackTitle}
              </button>
            ))}
          </div>

          {/* Collaborator rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {activeSplit.collaborators.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 6, height: 24, background: 'var(--d-border)', borderRadius: 3, cursor: 'grab', opacity: 0.5 }} />
                <div
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--d-surface-raised)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6875rem', fontWeight: 700, color: 'var(--d-primary)',
                    flexShrink: 0,
                  }}
                >
                  {c.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--d-text)' }}>{c.name}</div>
                  <span
                    className="d-annotation"
                    style={{
                      background: `color-mix(in srgb, ${ROLE_COLORS[c.role]} 15%, transparent)`,
                      color: ROLE_COLORS[c.role],
                      fontSize: '0.5625rem',
                    }}
                  >
                    {c.role}
                  </span>
                </div>
                {/* Slider + percent */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 180 }}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={c.percent}
                    readOnly
                    style={{ flex: 1, accentColor: 'var(--d-primary)' }}
                  />
                  <span style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--d-text)',
                    minWidth: 45,
                    textAlign: 'right',
                  }}>
                    {c.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Total badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderStyle: 'dashed' }}>
              + Add Collaborator
            </button>
            <span
              className="d-annotation"
              data-status={activeSplit.status === 'valid' ? 'success' : 'error'}
              style={{ fontSize: '0.8125rem', padding: '0.25rem 0.75rem' }}
            >
              {activeSplit.totalPercent}%
              {activeSplit.status === 'invalid' && ' — needs 100%'}
            </span>
          </div>

          {/* Presets */}
          <div style={{ display: 'flex', gap: '0.375rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {['50/50', '70/30', 'Equal', 'Custom'].map((p) => (
              <button key={p} className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem' }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Splits data table */}
        <div>
          <div className="d-label" style={{ color: 'var(--d-accent)', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
            ALL SPLITS
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="d-data" style={{ minWidth: 600 }}>
              <thead>
                <tr>
                  <th className="d-data-header">Track</th>
                  <th className="d-data-header">Contributors</th>
                  <th className="d-data-header">Total</th>
                  <th className="d-data-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {SPLITS.map((s) => (
                  <tr key={s.id} className="d-data-row">
                    <td className="d-data-cell" style={{ fontWeight: 500 }}>{s.trackTitle}</td>
                    <td className="d-data-cell" style={{ color: 'var(--d-text-muted)' }}>
                      {s.collaborators.map((c) => `${c.name} (${c.percent}%)`).join(', ')}
                    </td>
                    <td className="d-data-cell" style={{ fontFamily: 'ui-monospace, monospace' }}>{s.totalPercent}%</td>
                    <td className="d-data-cell">
                      <span className="d-annotation" data-status={s.status === 'valid' ? 'success' : 'error'}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SidebarMainShell>
  );
}
