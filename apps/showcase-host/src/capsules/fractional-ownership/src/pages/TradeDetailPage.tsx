import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { recentTrades } from '@/data/mock';
import { formatMoney } from '@/components/Money';

export function TradeDetailPage() {
  const { id } = useParams();
  const trade = recentTrades.find(t => t.id === id) ?? recentTrades[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '42rem' }}>
      <Link to="/trades" className="d-interactive" data-variant="ghost" style={{ alignSelf: 'flex-start', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
        <ArrowLeft size={14} /> Back to trades
      </Link>

      <PageHeader
        title={`Trade ${trade.id.toUpperCase()}`}
        description={`${trade.side.toUpperCase()} ${trade.shares.toLocaleString()} shares of ${trade.asset}`}
        actions={
          <span className="fo-pill" data-status={trade.status === 'filled' ? 'active' : trade.status === 'partial' ? 'pending' : 'rejected'}>
            {trade.status}
          </span>
        }
      />

      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {[
            { label: 'Date', value: trade.date },
            { label: 'Asset', value: trade.asset },
            { label: 'Side', value: trade.side.toUpperCase() },
            { label: 'Shares', value: trade.shares.toLocaleString() },
            { label: 'Price/Share', value: `$${trade.price.toFixed(2)}` },
            { label: 'Total', value: formatMoney(trade.total) },
            { label: 'Counterparty', value: trade.counterparty },
            { label: 'Status', value: trade.status },
          ].map(item => (
            <div key={item.label}>
              <div className="d-label" style={{ marginBottom: '0.25rem' }}>{item.label}</div>
              <div className="fo-mono" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
