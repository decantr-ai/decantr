import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: string;
}

export function DataTable<T extends Record<string, unknown>>({ columns, data, keyField }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const perPage = 10;

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey], bv = b[sortKey];
    if (typeof av === 'string' && typeof bv === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
    return 0;
  });

  const pageData = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(data.length / perPage);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table className="d-data">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} className="d-data-header" style={{ cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' }} onClick={() => col.sortable && toggleSort(col.key)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map(row => (
              <tr key={String(row[keyField])} className="d-data-row">
                {columns.map(col => (
                  <td key={col.key} className="d-data-cell">
                    {col.render ? col.render(row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
          <span>{page * perPage + 1}–{Math.min((page + 1) * perPage, data.length)} of {data.length}</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button className="d-interactive" data-variant="ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Prev</button>
            <button className="d-interactive" data-variant="ghost" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
