import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Search, Filter, FileText, Plus } from 'lucide-react';
import { reports } from '@/data/mock';

const frameworks = ['All', 'CSRD', 'SEC', 'CDP', 'TCFD', 'GHG Protocol', 'GRI'];
const statuses = ['All', 'draft', 'in-review', 'submitted', 'approved'];

const statusMap: Record<string, { label: string; status: 'info' | 'warning' | 'success' | 'error' }> = {
  'draft': { label: 'Draft', status: 'info' },
  'in-review': { label: 'In Review', status: 'warning' },
  'submitted': { label: 'Submitted', status: 'info' },
  'approved': { label: 'Approved', status: 'success' },
};

export function ReportsPage() {
  const [search, setSearch] = useState('');
  const [fwFilter, setFwFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = reports.filter(r => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (fwFilter !== 'All' && r.framework !== fwFilter) return false;
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className={css('_flex _col _gap6')}>
      <div className={css('_flex _jcsb _aic _wrap _gap3')}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Reporting Center</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Climate disclosure and compliance reporting</p>
        </div>
        <Link to="/reports/builder" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none' }}>
          <Plus size={16} /> New Report
        </Link>
      </div>

      {/* Filters */}
      <div className={css('_flex _gap3 _aic _wrap')}>
        <div className={css('_flex _aic _gap2')} style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ color: 'var(--d-text-muted)' }} />
          <input className="d-control earth-input" placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={css('_flex _aic _gap2 _wrap')}>
          <Filter size={14} style={{ color: 'var(--d-text-muted)' }} />
          {frameworks.map(f => (
            <button key={f} className="d-interactive" data-variant={fwFilter === f ? 'primary' : 'ghost'} onClick={() => setFwFilter(f)} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className={css('_flex _gap2 _wrap')}>
        {statuses.map(s => (
          <button key={s} className="d-interactive" data-variant={statusFilter === s ? 'primary' : 'ghost'} onClick={() => setStatusFilter(s)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', textTransform: 'capitalize' }}>
            {s === 'All' ? 'All Status' : s.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="d-surface earth-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Report</th>
              <th className="d-data-header">Framework</th>
              <th className="d-data-header">Period</th>
              <th className="d-data-header">Completeness</th>
              <th className="d-data-header">Status</th>
              <th className="d-data-header">Assignee</th>
              <th className="d-data-header">Modified</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const s = statusMap[r.status];
              return (
                <tr key={r.id} className="d-data-row">
                  <td className="d-data-cell">
                    <div className={css('_flex _aic _gap2')}>
                      <FileText size={14} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
                      <span style={{ fontWeight: 500 }}>{r.title}</span>
                    </div>
                  </td>
                  <td className="d-data-cell">
                    <span className="earth-badge" style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: 'var(--d-radius-full)', background: 'color-mix(in srgb, var(--d-accent) 15%, transparent)' }}>
                      {r.framework}
                    </span>
                  </td>
                  <td className="d-data-cell">{r.period}</td>
                  <td className="d-data-cell">
                    <div className={css('_flex _aic _gap2')}>
                      <div style={{ width: 60, height: 6, borderRadius: 3, background: 'var(--d-border)' }}>
                        <div style={{ width: `${r.completeness}%`, height: '100%', borderRadius: 3, background: r.completeness === 100 ? 'var(--d-success)' : 'var(--d-primary)', transition: 'width 0.5s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{r.completeness}%</span>
                    </div>
                  </td>
                  <td className="d-data-cell">
                    <span className="d-annotation" data-status={s.status}>{s.label}</span>
                  </td>
                  <td className="d-data-cell" style={{ color: 'var(--d-text-muted)' }}>{r.assignee}</td>
                  <td className="d-data-cell" style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>{r.lastModified}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
