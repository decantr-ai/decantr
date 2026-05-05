import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sponsors } from '@/data/mock';

const tierColors: Record<string, { bg: string; text: string }> = {
  title: { bg: 'linear-gradient(135deg, #f59e0b, #ef4444)', text: '#fff' },
  premium: { bg: 'linear-gradient(135deg, #a855f7, #3b82f6)', text: '#fff' },
  standard: { bg: 'var(--d-surface-raised)', text: 'var(--d-text-muted)' },
};

export function SponsorsPage() {
  const [tierFilter, setTierFilter] = useState<string>('');
  const tiers = [...new Set(sponsors.map(s => s.tier))];
  const filtered = sponsors.filter(s => !tierFilter || s.tier === tierFilter);

  const totalValue = sponsors.filter(s => s.status === 'active').reduce((sum, s) => sum + s.dealValue, 0);

  return (
    <div className="gg-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Sponsor Dashboard</h1>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>
            {sponsors.filter(s => s.status === 'active').length} active deals. Total value: ${totalValue.toLocaleString()}.
          </p>
        </div>
        <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.8rem' }}>
          + Add Sponsor
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="d-interactive"
          data-variant={!tierFilter ? 'primary' : 'ghost'}
          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
          onClick={() => setTierFilter('')}
        >
          All Tiers
        </button>
        {tiers.map(t => (
          <button
            key={t}
            className="d-interactive"
            data-variant={tierFilter === t ? 'primary' : 'ghost'}
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', textTransform: 'capitalize' }}
            onClick={() => setTierFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)', overflow: 'auto' }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Sponsor</th>
              <th className="d-data-header">Tier</th>
              <th className="d-data-header">Deal Value</th>
              <th className="d-data-header">Impressions</th>
              <th className="d-data-header">Activations</th>
              <th className="d-data-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(sponsor => (
              <tr key={sponsor.id} className="d-data-row">
                <td className="d-data-cell">
                  <Link to={`/sponsors/${sponsor.id}`} style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--d-radius-sm)',
                      background: tierColors[sponsor.tier].bg,
                      color: tierColors[sponsor.tier].text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {sponsor.logo}
                    </div>
                    {sponsor.name}
                  </Link>
                </td>
                <td className="d-data-cell">
                  <span className="d-annotation" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{sponsor.tier}</span>
                </td>
                <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, monospace)', fontWeight: 600 }}>
                  ${sponsor.dealValue.toLocaleString()}
                </td>
                <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, monospace)' }}>
                  {sponsor.impressions.toLocaleString()}
                </td>
                <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, monospace)' }}>
                  {sponsor.activations}
                </td>
                <td className="d-data-cell">
                  <span
                    className="d-annotation"
                    data-status={sponsor.status === 'active' ? 'success' : sponsor.status === 'negotiating' ? 'warning' : 'error'}
                    style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}
                  >
                    {sponsor.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--d-gap-4)' }}>
        {filtered.map(sponsor => (
          <Link key={sponsor.id} to={`/sponsors/${sponsor.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="d-surface gg-achievement-shine" data-interactive style={{ padding: 'var(--d-surface-p)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--d-radius)',
                  background: tierColors[sponsor.tier].bg,
                  color: tierColors[sponsor.tier].text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}>
                  {sponsor.logo}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sponsor.name}</div>
                  <span className="d-annotation" style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>{sponsor.tier}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <div>
                  <div className="d-label" style={{ marginBottom: '0.125rem' }}>Value</div>
                  <div style={{ fontWeight: 600, fontFamily: 'var(--d-font-mono, monospace)' }}>
                    ${sponsor.dealValue.toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="d-label" style={{ marginBottom: '0.125rem' }}>Impressions</div>
                  <div style={{ fontFamily: 'var(--d-font-mono, monospace)' }}>
                    {(sponsor.impressions / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
