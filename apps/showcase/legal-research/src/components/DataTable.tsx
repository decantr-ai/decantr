import { css } from '@decantr/css';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  getRowKey: (item: T) => string;
}

export function DataTable<T>({ columns, data, onRowClick, getRowKey }: DataTableProps<T>) {
  return (
    <table className="d-data">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className="d-data-header" style={{ width: col.width }}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr
            key={getRowKey(item)}
            className="d-data-row"
            onClick={() => onRowClick?.(item)}
            style={{ cursor: onRowClick ? 'pointer' : undefined }}
          >
            {columns.map((col) => (
              <td key={col.key} className="d-data-cell">
                {col.render(item)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
