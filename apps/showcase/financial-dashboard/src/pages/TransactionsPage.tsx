import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search, Filter } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { Sparkline } from '@/components/Sparkline';
import { transactions } from '@/data/mock';
import { formatMoney } from '@/components/Money';

const categories = ['All', 'Income', 'Housing', 'Groceries', 'Dining', 'Transportation', 'Utilities', 'Entertainment', 'Health & Fitness', 'Travel', 'Shopping', 'Debt', 'Transfer', 'Investment Income'];

export function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (category !== 'All' && t.category !== category) return false;
      if (search && !(
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.merchant.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase())
      )) return false;
      return true;
    });
  }, [search, category]);

  // Build a 14-day spending trend per category for the sparklines row
  const trendSparklines = useMemo(() => {
    const cats = ['Groceries', 'Dining', 'Transportation', 'Utilities', 'Entertainment'] as const;
    return cats.map(cat => ({
      label: cat,
      total: transactions.filter(t => t.category === cat).reduce((s, t) => s + Math.abs(t.amount), 0),
      data: Array.from({ length: 14 }, () => Math.random() * 100 + 20),
    }));
  }, []);

  const totalIn = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Transactions"
        description={`${filtered.length} transactions · ${formatMoney(totalIn)} in · ${formatMoney(totalOut)} out`}
        actions={
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
            <Download size={13} /> Export CSV
          </button>
        }
      />

      {/* Trend sparklines */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <SectionLabel style={{ marginBottom: '1rem' }}>Category Trends (14 days)</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          {trendSparklines.map(t => (
            <div key={t.label}>
              <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginBottom: '0.25rem' }}>{t.label}</div>
              <div className="fd-mono" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                {formatMoney(t.total)}
              </div>
              <Sparkline data={t.data} width={140} height={28} />
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
            <input
              className="d-control"
              type="text"
              placeholder="Search description, merchant, or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Filter size={13} style={{ color: 'var(--d-text-muted)' }} />
            <select className="d-control" value={category} onChange={e => setCategory(e.target.value)} style={{ minWidth: 160 }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <table className="d-data" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead className="d-data-header">
            <tr style={{ textAlign: 'left' }}>
              <th className="d-data-cell" style={{ padding: '0.5rem', width: 96 }}>Date</th>
              <th className="d-data-cell" style={{ padding: '0.5rem' }}>Description</th>
              <th className="d-data-cell" style={{ padding: '0.5rem', width: 140 }}>Category</th>
              <th className="d-data-cell" style={{ padding: '0.5rem', width: 140 }}>Account</th>
              <th className="d-data-cell" style={{ padding: '0.5rem', width: 80 }}>Status</th>
              <th className="d-data-cell" style={{ padding: '0.5rem', textAlign: 'right', width: 120 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="d-data-row" style={{ borderTop: '1px solid var(--d-border)' }}>
                <td className="d-data-cell fd-mono" style={{ padding: '0.5rem', color: 'var(--d-text-muted)' }}>{t.date}</td>
                <td className="d-data-cell" style={{ padding: '0.5rem' }}>
                  <Link to={`/transactions/${t.id}`} style={{ fontWeight: 500, textDecoration: 'none', color: 'var(--d-text)' }}>
                    {t.description}
                  </Link>
                  <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{t.merchant}</div>
                </td>
                <td className="d-data-cell" style={{ padding: '0.5rem' }}>
                  <span className="fd-pill">{t.category}</span>
                </td>
                <td className="d-data-cell" style={{ padding: '0.5rem', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{t.account}</td>
                <td className="d-data-cell" style={{ padding: '0.5rem' }}>
                  <span className="fd-pill" data-status={t.status}>{t.status}</span>
                </td>
                <td
                  className="d-data-cell fd-mono"
                  style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600, color: t.amount > 0 ? 'var(--d-success)' : 'var(--d-text)' }}
                >
                  {t.amount > 0 ? '+' : ''}{formatMoney(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--d-text-muted)' }}>
            No transactions match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
