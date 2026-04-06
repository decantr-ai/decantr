import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Plus, LayoutGrid, Table } from 'lucide-react';
import { serviceRequests, requestCategories } from '@/data/mock';
import { KanbanBoard } from '@/components/KanbanBoard';

export function RequestsPage() {
  const [view, setView] = useState<'board' | 'table'>('board');
  const [catFilter, setCatFilter] = useState('All');

  const filtered = serviceRequests.filter(r => catFilter === 'All' || r.category === catFilter);

  const priorityStatus: Record<string, string> = {
    urgent: 'error',
    high: 'warning',
    medium: 'info',
    low: 'info',
  };

  const statusAnnotation: Record<string, string> = {
    new: 'info',
    assigned: 'warning',
    'in-progress': 'info',
    resolved: 'success',
  };

  return (
    <div className={css('_flex _col _gap6')}>
      <div className={css('_flex _jcsb _aic _wrap _gap3')}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Service Requests</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Track and manage citizen service requests</p>
        </div>
        <Link to="/requests/new" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>
          <Plus size={16} /> New Request
        </Link>
      </div>

      {/* Filters */}
      <div className={css('_flex _jcsb _aic _wrap _gap3')}>
        <div className={css('_flex _gap1 _wrap')}>
          {requestCategories.map(cat => (
            <button
              key={cat}
              className="d-interactive"
              data-variant={catFilter === cat ? 'primary' : 'ghost'}
              onClick={() => setCatFilter(cat)}
              style={{ padding: '0.25rem 0.625rem', fontSize: '0.8125rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className={css('_flex _gap1')}>
          <button
            className="d-interactive"
            data-variant={view === 'board' ? 'primary' : 'ghost'}
            onClick={() => setView('board')}
            style={{ padding: '0.375rem' }}
            aria-label="Board view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className="d-interactive"
            data-variant={view === 'table' ? 'primary' : 'ghost'}
            onClick={() => setView('table')}
            style={{ padding: '0.375rem' }}
            aria-label="Table view"
          >
            <Table size={16} />
          </button>
        </div>
      </div>

      {/* Board or Table */}
      {view === 'board' ? (
        <KanbanBoard />
      ) : (
        <div className="d-surface gov-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="d-data gov-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th className="d-data-header">ID</th>
                <th className="d-data-header">Title</th>
                <th className="d-data-header">Category</th>
                <th className="d-data-header">Priority</th>
                <th className="d-data-header">Status</th>
                <th className="d-data-header">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => (
                <tr key={req.id} className="d-data-row">
                  <td className="d-data-cell" style={{ fontFamily: 'var(--d-font-mono, monospace)', fontSize: '0.8125rem' }}>
                    <Link to={`/requests/${req.id}`} style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>{req.id}</Link>
                  </td>
                  <td className="d-data-cell" style={{ fontWeight: 500 }}>{req.title}</td>
                  <td className="d-data-cell">{req.category}</td>
                  <td className="d-data-cell">
                    <span className="d-annotation" data-status={priorityStatus[req.priority]}>{req.priority}</span>
                  </td>
                  <td className="d-data-cell">
                    <span className="d-annotation" data-status={statusAnnotation[req.status]}>{req.status}</span>
                  </td>
                  <td className="d-data-cell" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{req.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
