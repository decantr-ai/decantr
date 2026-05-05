import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { recentTrades } from '@/data/mock';
import { formatMoney } from '@/components/Money';

export function TradesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Trade History" description="All secondary market trades across your fractional positions." />

      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="d-data" style={{ minWidth: 700 }}>
          <thead>
            <tr>
              <th className="d-data-header">Date</th>
              <th className="d-data-header">Asset</th>
              <th className="d-data-header">Side</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Shares</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Price</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Total</th>
              <th className="d-data-header">Counterparty</th>
              <th className="d-data-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentTrades.map(t => (
              <tr key={t.id} className="d-data-row">
                <td className="d-data-cell fo-mono" style={{ color: 'var(--d-text-muted)' }}>{t.date}</td>
                <td className="d-data-cell">
                  <Link to={`/trades/${t.id}`} style={{ textDecoration: 'none', color: 'var(--d-text)', fontWeight: 500 }}>
                    {t.asset}
                  </Link>
                </td>
                <td className="d-data-cell">
                  <span className="fo-pill" data-status={t.side === 'buy' ? 'active' : 'closed'}>{t.side}</span>
                </td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right' }}>{t.shares.toLocaleString()}</td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right' }}>${t.price.toFixed(2)}</td>
                <td className="d-data-cell fo-mono" style={{ textAlign: 'right' }}>{formatMoney(t.total)}</td>
                <td className="d-data-cell" style={{ color: 'var(--d-text-muted)', fontSize: '0.8rem' }}>{t.counterparty}</td>
                <td className="d-data-cell">
                  <span className="fo-pill" data-status={t.status === 'filled' ? 'active' : t.status === 'partial' ? 'pending' : 'rejected'}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
