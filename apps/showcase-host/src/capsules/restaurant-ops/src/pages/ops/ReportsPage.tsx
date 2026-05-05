import { css } from '@decantr/css';
import { FileText, Download } from 'lucide-react';
import { reports, weeklyRevenue, formatCurrency } from '../../data/mock';
import { MiniBarChart } from '../../components/MiniChart';

export function ReportsPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div>
        <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Reports</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Financial and operational reporting</p>
      </div>

      {/* Weekly revenue chart */}
      <div className="bistro-warm-card" style={{ cursor: 'default' }}>
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.75rem' }}>
          <span className="bistro-handwritten" style={{ fontSize: '1rem' }}>Weekly Revenue</span>
          <span className={css('_textsm _fontmedium')} style={{ color: 'var(--d-success)' }}>
            {formatCurrency(weeklyRevenue.reduce((s, d) => s + d.revenue, 0))} total
          </span>
        </div>
        <MiniBarChart data={weeklyRevenue.map(d => ({ label: d.day, value: d.revenue }))} height={160} barColor="var(--d-primary)" />
      </div>

      {/* Report list */}
      <table className="d-data">
        <thead>
          <tr>
            <th className="d-data-header">Report</th>
            <th className="d-data-header">Type</th>
            <th className="d-data-header">Frequency</th>
            <th className="d-data-header">Last Run</th>
            <th className="d-data-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.id} className="d-data-row">
              <td className="d-data-cell">
                <div className={css('_flex _aic _gap2')}>
                  <FileText size={14} style={{ color: 'var(--d-primary)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 500 }}>{r.name}</span>
                </div>
              </td>
              <td className="d-data-cell">
                <span className="d-annotation">{r.type}</span>
              </td>
              <td className="d-data-cell" style={{ color: 'var(--d-text-muted)' }}>{r.frequency}</td>
              <td className="d-data-cell" style={{ color: 'var(--d-text-muted)' }}>{r.lastRun}</td>
              <td className="d-data-cell">
                <div className={css('_flex _aic _gap2')}>
                  <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    Run Now
                  </button>
                  <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem' }} aria-label="Download">
                    <Download size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
