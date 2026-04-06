import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Sparkline } from '@/components/Sparkline';
import { assets } from '@/data/mock';
import { formatMoney } from '@/components/Money';

export function AssetsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Fractional Assets" description="Browse and manage your fractional positions across all asset classes." />

      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="d-data" style={{ minWidth: 800 }}>
          <thead>
            <tr>
              <th className="d-data-header">Asset</th>
              <th className="d-data-header">Type</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Valuation</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Price/Share</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Return</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>IRR</th>
              <th className="d-data-header">Trend</th>
              <th className="d-data-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(a => (
              <tr key={a.id} className="d-data-row">
                <td className="d-data-cell">
                  <Link to={`/assets/${a.id}`} style={{ textDecoration: 'none', color: 'var(--d-text)', fontWeight: 500 }}>
                    {a.name}
                  </Link>
                  {a.location && <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{a.location}</div>}
                </td>
                <td className="d-data-cell" style={{ textTransform: 'capitalize' }}>{a.type.replace('-', ' ')}</td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right' }}>{formatMoney(a.valuation, true)}</td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right' }}>${a.pricePerShare.toFixed(2)}</td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right', color: a.returnPct >= 0 ? 'var(--d-success)' : 'var(--d-error)' }}>
                  +{a.returnPct.toFixed(2)}%
                </td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right' }}>{a.irr.toFixed(1)}%</td>
                <td className="d-data-cell">
                  <Sparkline data={a.sparkline} width={64} height={20} />
                </td>
                <td className="d-data-cell">
                  <span className="fo-pill" data-status={a.status}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
