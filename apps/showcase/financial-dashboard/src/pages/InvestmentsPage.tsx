import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search, ArrowUpDown } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { Sparkline } from '@/components/Sparkline';
import { Chart } from '@/components/Chart';
import { holdings } from '@/data/mock';
import { formatMoney, formatPct } from '@/components/Money';

type SortKey = 'symbol' | 'marketValue' | 'gainPct' | 'allocation';

export function InvestmentsPage() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('marketValue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const totals = useMemo(() => {
    const marketValue = holdings.reduce((s, h) => s + h.marketValue, 0);
    const costBasis = holdings.reduce((s, h) => s + h.costBasis, 0);
    const gainAbs = marketValue - costBasis;
    const gainPct = (gainAbs / costBasis) * 100;
    return { marketValue, costBasis, gainAbs, gainPct };
  }, []);

  const filtered = useMemo(() => {
    let list = holdings.filter(h => {
      if (!search) return true;
      return (
        h.symbol.toLowerCase().includes(search.toLowerCase()) ||
        h.name.toLowerCase().includes(search.toLowerCase())
      );
    });
    list = [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return list;
  }, [search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const performanceChart = {
    title: 'Portfolio Value (12M)',
    type: 'area' as const,
    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    series: [
      { label: 'Value', values: [892000, 918000, 896000, 942000, 978000, 962000, 1008000, 1042000, 1084000, 1118000, 1156000, 1195000], color: 'var(--d-accent)' },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Investments"
        description={`${holdings.length} holdings · ${formatMoney(totals.marketValue)} market value`}
        actions={
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
            <Download size={13} /> Export
          </button>
        }
      />

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--d-content-gap)' }}>
        <div className="fd-card fd-kpi-accent" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>Market Value</div>
          <div className="fd-mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatMoney(totals.marketValue)}</div>
        </div>
        <div className="fd-card fd-kpi-accent" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>Cost Basis</div>
          <div className="fd-mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatMoney(totals.costBasis)}</div>
        </div>
        <div className="fd-card fd-kpi-accent" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>Unrealized Gain</div>
          <div
            className="fd-mono"
            style={{ fontSize: '1.5rem', fontWeight: 700, color: totals.gainAbs >= 0 ? 'var(--d-success)' : 'var(--d-error)' }}
          >
            {totals.gainAbs >= 0 ? '+' : ''}{formatMoney(totals.gainAbs)}
          </div>
        </div>
        <div className="fd-card fd-kpi-accent" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>Return</div>
          <div
            className="fd-mono"
            style={{ fontSize: '1.5rem', fontWeight: 700, color: totals.gainPct >= 0 ? 'var(--d-success)' : 'var(--d-error)' }}
          >
            {formatPct(totals.gainPct)}
          </div>
        </div>
      </div>

      {/* Performance chart */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '1rem' }}>Portfolio Performance</SectionLabel>
        <Chart chart={performanceChart} height={200} />
      </div>

      {/* Holdings table */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <SectionLabel>Holdings</SectionLabel>
          <div style={{ position: 'relative', minWidth: 240 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
            <input
              className="d-control"
              type="text"
              placeholder="Search symbol or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2rem' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="d-data" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: 900 }}>
            <thead className="d-data-header">
              <tr style={{ textAlign: 'left' }}>
                <th className="d-data-cell" style={{ padding: '0.5rem', cursor: 'pointer' }} onClick={() => toggleSort('symbol')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>Symbol <ArrowUpDown size={10} /></span>
                </th>
                <th className="d-data-cell" style={{ padding: '0.5rem' }}>Name</th>
                <th className="d-data-cell" style={{ padding: '0.5rem', textAlign: 'right' }}>Shares</th>
                <th className="d-data-cell" style={{ padding: '0.5rem', textAlign: 'right' }}>Price</th>
                <th className="d-data-cell" style={{ padding: '0.5rem', textAlign: 'center' }}>Trend</th>
                <th className="d-data-cell" style={{ padding: '0.5rem', textAlign: 'right', cursor: 'pointer' }} onClick={() => toggleSort('marketValue')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>Market Value <ArrowUpDown size={10} /></span>
                </th>
                <th className="d-data-cell" style={{ padding: '0.5rem', textAlign: 'right', cursor: 'pointer' }} onClick={() => toggleSort('gainPct')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>Gain/Loss <ArrowUpDown size={10} /></span>
                </th>
                <th className="d-data-cell" style={{ padding: '0.5rem', textAlign: 'right', cursor: 'pointer' }} onClick={() => toggleSort('allocation')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>% <ArrowUpDown size={10} /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(h => (
                <tr key={h.id} className="d-data-row" style={{ borderTop: '1px solid var(--d-border)' }}>
                  <td className="d-data-cell" style={{ padding: '0.625rem 0.5rem' }}>
                    <Link to={`/investments/${h.id}`} className="fd-mono" style={{ fontWeight: 600, textDecoration: 'none', color: 'var(--d-accent)' }}>
                      {h.symbol}
                    </Link>
                  </td>
                  <td className="d-data-cell" style={{ padding: '0.625rem 0.5rem' }}>
                    <div style={{ fontSize: '0.8rem' }}>{h.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{h.sector}</div>
                  </td>
                  <td className="d-data-cell fd-mono" style={{ padding: '0.625rem 0.5rem', textAlign: 'right' }}>{h.shares.toLocaleString()}</td>
                  <td className="d-data-cell fd-mono" style={{ padding: '0.625rem 0.5rem', textAlign: 'right' }}>
                    <div>${h.price.toFixed(2)}</div>
                    <div style={{ fontSize: '0.7rem', color: h.dayChange >= 0 ? 'var(--d-success)' : 'var(--d-error)' }}>
                      {h.dayChange >= 0 ? '+' : ''}{h.dayChange.toFixed(2)}%
                    </div>
                  </td>
                  <td className="d-data-cell" style={{ padding: '0.625rem 0.5rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block' }}>
                      <Sparkline data={h.sparkline} width={72} height={22} positive={h.gainPct >= 0} />
                    </div>
                  </td>
                  <td className="d-data-cell fd-mono" style={{ padding: '0.625rem 0.5rem', textAlign: 'right', fontWeight: 500 }}>
                    {formatMoney(h.marketValue)}
                  </td>
                  <td
                    className="d-data-cell fd-mono"
                    style={{ padding: '0.625rem 0.5rem', textAlign: 'right', color: h.gainPct >= 0 ? 'var(--d-success)' : 'var(--d-error)', fontWeight: 500 }}
                  >
                    <div>{h.gainAbs >= 0 ? '+' : ''}{formatMoney(h.gainAbs)}</div>
                    <div style={{ fontSize: '0.7rem' }}>{formatPct(h.gainPct)}</div>
                  </td>
                  <td className="d-data-cell fd-mono" style={{ padding: '0.625rem 0.5rem', textAlign: 'right', color: 'var(--d-text-muted)' }}>
                    {h.allocation.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
