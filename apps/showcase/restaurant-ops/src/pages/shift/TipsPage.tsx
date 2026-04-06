import { useState } from 'react';
import { css } from '@decantr/css';
import { DollarSign, Calculator } from 'lucide-react';
import { servers, tipHistory, formatCurrency } from '../../data/mock';

export function TipsPage() {
  const [method, setMethod] = useState<'equal' | 'hours' | 'sales'>('hours');
  const totalTips = servers.reduce((s, sv) => s + sv.tips, 0);

  const calcShare = (sv: typeof servers[0]) => {
    if (method === 'equal') return totalTips / servers.length;
    if (method === 'sales') {
      const totalSales = servers.reduce((s, sv) => s + sv.sales, 0);
      return totalSales > 0 ? (sv.sales / totalSales) * totalTips : 0;
    }
    // hours — approximate by shift start offset
    return sv.tips; // use actual tips as proxy
  };

  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div>
        <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Tip Pool</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Calculator and distribution history</p>
      </div>

      {/* Calculator */}
      <div className="bistro-warm-card" style={{ cursor: 'default' }}>
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem' }}>
          <Calculator size={18} style={{ color: 'var(--d-primary)' }} />
          <span className="bistro-handwritten" style={{ fontSize: '1.125rem' }}>Tonight&apos;s Pool</span>
          <span className="bistro-handwritten" style={{ fontSize: '1.125rem', marginLeft: 'auto', color: 'var(--d-success)' }}>{formatCurrency(totalTips)}</span>
        </div>

        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem' }}>
          <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Split by:</span>
          {(['equal', 'hours', 'sales'] as const).map(m => (
            <button key={m} className="d-interactive" data-variant={method === m ? 'primary' : 'ghost'}
              onClick={() => setMethod(m)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', textTransform: 'capitalize' }}>
              {m}
            </button>
          ))}
        </div>

        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Server</th>
              <th className="d-data-header">Sales</th>
              <th className="d-data-header">Share</th>
            </tr>
          </thead>
          <tbody>
            {servers.map(sv => (
              <tr key={sv.id} className="d-data-row">
                <td className="d-data-cell">
                  <div className={css('_flex _aic _gap2')}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: 'var(--d-surface-raised)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.625rem', color: 'var(--d-primary)', border: '1px solid var(--d-border)',
                    }}>{sv.avatar}</div>
                    <span style={{ fontWeight: 500 }}>{sv.name}</span>
                  </div>
                </td>
                <td className="d-data-cell">{formatCurrency(sv.sales)}</td>
                <td className="d-data-cell" style={{ fontWeight: 600, color: 'var(--d-success)' }}>{formatCurrency(calcShare(sv))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* History */}
      <div>
        <span className="d-label" style={{ marginBottom: '0.5rem', display: 'block', borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>Recent Distributions</span>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Date</th>
              <th className="d-data-header">Total Tips</th>
              <th className="d-data-header">Servers</th>
              <th className="d-data-header">Method</th>
              <th className="d-data-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {tipHistory.map(t => (
              <tr key={t.id} className="d-data-row">
                <td className="d-data-cell" style={{ fontWeight: 500 }}>{t.date}</td>
                <td className="d-data-cell">{formatCurrency(t.totalTips)}</td>
                <td className="d-data-cell">{t.serverCount}</td>
                <td className="d-data-cell" style={{ textTransform: 'capitalize' }}>{t.poolMethod}</td>
                <td className="d-data-cell">
                  <span className="d-annotation" data-status={t.distributed ? 'success' : 'warning'}>
                    {t.distributed ? 'Distributed' : 'Pending'}
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
