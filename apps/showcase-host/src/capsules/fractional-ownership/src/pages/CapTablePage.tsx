import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { ShareBar, ShareLegend } from '@/components/ShareBar';
import { DonutChart } from '@/components/DonutChart';
import { shareholders, shareClasses, shareClassAllocations } from '@/data/mock';
import { formatMoney } from '@/components/Money';

export function CapTablePage() {
  const totalShares = shareClasses.reduce((sum, sc) => sum + sc.issued, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Cap Table" description="Share classes, ownership distribution, and shareholder registry." />

      {/* Share class summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--d-content-gap)' }}>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '1rem' }}>Share Class Distribution</SectionLabel>
          <div style={{ marginBottom: '1rem' }}>
            <ShareBar items={shareClassAllocations} />
          </div>
          <ShareLegend items={shareClassAllocations} />
        </div>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SectionLabel style={{ marginBottom: '1rem', alignSelf: 'flex-start' }}>Ownership Breakdown</SectionLabel>
          <DonutChart
            items={shareClassAllocations}
            centerLabel="Total Shares"
            centerValue={`${(totalShares / 1_000_000).toFixed(1)}M`}
          />
        </div>
      </div>

      {/* Share classes table */}
      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--d-surface-p)', borderBottom: '1px solid var(--d-border)' }}>
          <SectionLabel>Share Classes</SectionLabel>
        </div>
        <table className="d-data" style={{ minWidth: 700 }}>
          <thead>
            <tr>
              <th className="d-data-header">Class</th>
              <th className="d-data-header">Type</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Authorised</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Issued</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Price/Share</th>
              <th className="d-data-header">Voting</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Liq. Pref</th>
            </tr>
          </thead>
          <tbody>
            {shareClasses.map(sc => (
              <tr key={sc.id} className="d-data-row">
                <td className="d-data-cell">
                  <Link to={`/cap-table/${sc.id}`} style={{ textDecoration: 'none', color: 'var(--d-text)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="fo-sector-dot" style={{ background: sc.color }} />
                    {sc.name}
                  </Link>
                </td>
                <td className="d-data-cell" style={{ textTransform: 'capitalize' }}>{sc.type}</td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right' }}>{sc.authorised.toLocaleString()}</td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right' }}>{sc.issued.toLocaleString()}</td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right' }}>${sc.pricePerShare.toFixed(3)}</td>
                <td className="d-data-cell">
                  <span className="fo-pill" data-status={sc.votingRights ? 'active' : 'closed'}>
                    {sc.votingRights ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right' }}>{sc.liquidationPref.toFixed(1)}x</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shareholders */}
      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--d-surface-p)', borderBottom: '1px solid var(--d-border)' }}>
          <SectionLabel>Shareholder Registry</SectionLabel>
        </div>
        <table className="d-data" style={{ minWidth: 800 }}>
          <thead>
            <tr>
              <th className="d-data-header">Shareholder</th>
              <th className="d-data-header">Class</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Shares</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Ownership</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Invested</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Current Value</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Vested</th>
            </tr>
          </thead>
          <tbody>
            {shareholders.map(sh => (
              <tr key={sh.id} className="d-data-row">
                <td className="d-data-cell">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="fo-avatar" style={{ width: 24, height: 24, fontSize: '0.55rem' }}>{sh.avatar}</div>
                    <span style={{ fontWeight: 500 }}>{sh.name}</span>
                  </div>
                </td>
                <td className="d-data-cell" style={{ fontSize: '0.8rem' }}>{sh.shareClass}</td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right' }}>{sh.shares.toLocaleString()}</td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right' }}>{sh.ownership.toFixed(2)}%</td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right' }}>{formatMoney(sh.invested, true)}</td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right' }}>{formatMoney(sh.currentValue, true)}</td>
                <td className="d-data-cell">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ flex: 1, height: 4, background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-sm)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${sh.vestingPct}%`, background: sh.vestingPct === 100 ? 'var(--d-success)' : 'var(--d-primary)', borderRadius: 'var(--d-radius-sm)' }} />
                    </div>
                    <span className="fo-mono" style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', minWidth: 32, textAlign: 'right' }}>{sh.vestingPct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
