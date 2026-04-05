import { Download } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { DonutChart } from '@/components/DonutChart';
import { AllocationLegend } from '@/components/AllocationBar';
import { assetAllocations, sectorAllocations } from '@/data/mock';

export function AllocationsPage() {
  const totalAssets = assetAllocations.reduce((s, a) => s + a.value, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Allocations"
        description="Breakdown of your portfolio across asset classes and sectors."
        actions={
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
            <Download size={13} /> Export
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'var(--d-content-gap)' }}>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '1rem' }}>By Asset Class</SectionLabel>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <DonutChart
              items={assetAllocations}
              centerLabel="Total"
              centerValue={`$${(totalAssets / 1000).toFixed(0)}K`}
            />
            <div style={{ flex: 1, minWidth: 200 }}>
              <AllocationLegend items={assetAllocations} />
            </div>
          </div>
        </div>

        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '1rem' }}>By Sector</SectionLabel>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <DonutChart
              items={sectorAllocations}
              centerLabel="Sectors"
              centerValue="7"
            />
            <div style={{ flex: 1, minWidth: 200 }}>
              <AllocationLegend items={sectorAllocations} />
            </div>
          </div>
        </div>
      </div>

      {/* Allocation table */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '1rem' }}>Allocation Details</SectionLabel>
        <table className="d-data" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead className="d-data-header">
            <tr style={{ textAlign: 'left' }}>
              <th className="d-data-cell" style={{ padding: '0.625rem 0.5rem' }}>Asset Class</th>
              <th className="d-data-cell" style={{ padding: '0.625rem 0.5rem', textAlign: 'right' }}>Market Value</th>
              <th className="d-data-cell" style={{ padding: '0.625rem 0.5rem', textAlign: 'right' }}>Target %</th>
              <th className="d-data-cell" style={{ padding: '0.625rem 0.5rem', textAlign: 'right' }}>Actual %</th>
              <th className="d-data-cell" style={{ padding: '0.625rem 0.5rem', textAlign: 'right' }}>Drift</th>
            </tr>
          </thead>
          <tbody>
            {assetAllocations.map((a, i) => {
              const targets = [50, 15, 15, 10, 5, 5];
              const target = targets[i] ?? a.pct;
              const drift = a.pct - target;
              return (
                <tr key={a.label} className="d-data-row" style={{ borderTop: '1px solid var(--d-border)' }}>
                  <td className="d-data-cell" style={{ padding: '0.625rem 0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="fd-sector-dot" style={{ background: a.color }} />
                      {a.label}
                    </div>
                  </td>
                  <td className="d-data-cell fd-mono" style={{ padding: '0.625rem 0.5rem', textAlign: 'right' }}>
                    ${a.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="d-data-cell fd-mono" style={{ padding: '0.625rem 0.5rem', textAlign: 'right', color: 'var(--d-text-muted)' }}>
                    {target.toFixed(2)}%
                  </td>
                  <td className="d-data-cell fd-mono" style={{ padding: '0.625rem 0.5rem', textAlign: 'right' }}>
                    {a.pct.toFixed(2)}%
                  </td>
                  <td
                    className="d-data-cell fd-mono"
                    style={{ padding: '0.625rem 0.5rem', textAlign: 'right', color: Math.abs(drift) < 1 ? 'var(--d-text-muted)' : drift > 0 ? 'var(--d-warning)' : 'var(--d-info)' }}
                  >
                    {drift >= 0 ? '+' : ''}{drift.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
