import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Tag } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { transactions } from '@/data/mock';
import { formatMoney } from '@/components/Money';

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const transaction = transactions.find(t => t.id === id) ?? transactions[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '42rem' }}>
      <Link to="/transactions" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--d-text-muted)', textDecoration: 'none', width: 'fit-content' }}>
        <ArrowLeft size={13} /> Back to transactions
      </Link>

      <PageHeader
        title={transaction.description}
        description={`${transaction.merchant} · ${transaction.date}`}
        actions={
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
            <Download size={13} /> Receipt
          </button>
        }
      />

      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--d-border)' }}>
          <SectionLabel>Amount</SectionLabel>
          <div
            className="fd-mono"
            style={{ fontSize: '2rem', fontWeight: 700, color: transaction.amount > 0 ? 'var(--d-success)' : 'var(--d-text)' }}
          >
            {transaction.amount > 0 ? '+' : ''}{formatMoney(transaction.amount)}
          </div>
        </div>

        <dl style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.875rem 1.5rem', fontSize: '0.875rem' }}>
          <dt style={{ color: 'var(--d-text-muted)' }}>Date</dt>
          <dd className="fd-mono" style={{ margin: 0 }}>{transaction.date}</dd>

          <dt style={{ color: 'var(--d-text-muted)' }}>Merchant</dt>
          <dd style={{ margin: 0, fontWeight: 500 }}>{transaction.merchant}</dd>

          <dt style={{ color: 'var(--d-text-muted)' }}>Category</dt>
          <dd style={{ margin: 0 }}>
            <span className="fd-pill"><Tag size={10} /> {transaction.category}</span>
          </dd>

          <dt style={{ color: 'var(--d-text-muted)' }}>Account</dt>
          <dd className="fd-mono" style={{ margin: 0 }}>{transaction.account}</dd>

          <dt style={{ color: 'var(--d-text-muted)' }}>Status</dt>
          <dd style={{ margin: 0 }}>
            <span className="fd-pill" data-status={transaction.status}>{transaction.status}</span>
          </dd>

          <dt style={{ color: 'var(--d-text-muted)' }}>Transaction ID</dt>
          <dd className="fd-mono" style={{ margin: 0, color: 'var(--d-text-muted)' }}>{transaction.id.toUpperCase()}</dd>
        </dl>
      </div>

      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '0.875rem' }}>Notes</SectionLabel>
        <textarea
          className="d-control"
          placeholder="Add a note about this transaction..."
          rows={3}
          defaultValue={transaction.note ?? ''}
          style={{ resize: 'vertical', fontFamily: 'inherit' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
          <button className="fd-button-accent" type="button" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Save note</button>
          <button className="d-interactive" data-variant="ghost" type="button" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Recategorize</button>
          <button className="d-interactive" data-variant="danger" type="button" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Dispute</button>
        </div>
      </div>
    </div>
  );
}
