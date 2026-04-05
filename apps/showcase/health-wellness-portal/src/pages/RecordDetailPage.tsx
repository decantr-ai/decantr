import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Share2, FileText } from 'lucide-react';
import { healthRecords } from '@/data/mock';

export function RecordDetailPage() {
  const { id } = useParams();
  const record = healthRecords.find(r => r.id === id) ?? healthRecords[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 960 }}>
      <Link
        to="/records"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          fontSize: '0.875rem', color: 'var(--d-text-muted)',
          textDecoration: 'none', fontWeight: 500, width: 'fit-content',
        }}
      >
        <ArrowLeft size={16} /> Back to records
      </Link>

      {/* Detail header */}
      <div className="hw-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: 'var(--d-radius-lg)',
            background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)',
            color: 'var(--d-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }} aria-hidden>
            <FileText size={28} />
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <span className="d-annotation" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>{record.category}</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
              {record.name}
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--d-text-muted)' }}>
              From {record.provider} · {record.date}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button className="d-interactive" style={{ padding: '0.625rem 1rem', fontSize: '0.875rem' }}>
              <Share2 size={16} /> Share
            </button>
            <button className="hw-button-primary" style={{ padding: '0.625rem 1.125rem', fontSize: '0.9375rem' }}>
              <Download size={18} /> Download
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="hw-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.75rem' }}>Summary</h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--d-text)', lineHeight: 1.7 }}>{record.summary}</p>
      </div>

      {/* Sample values (mocked) */}
      {record.type === 'lab' && (
        <div className="hw-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--d-border)' }}>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 600 }}>Results</h2>
          </div>
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Test</th>
                <th className="d-data-header">Result</th>
                <th className="d-data-header">Reference Range</th>
                <th className="d-data-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Glucose', value: '142 mg/dL', range: '70–140 mg/dL', status: 'elevated' as const, label: 'Slightly Elevated' },
                { name: 'Sodium', value: '140 mmol/L', range: '135–145 mmol/L', status: 'normal' as const, label: 'Normal' },
                { name: 'Potassium', value: '4.2 mmol/L', range: '3.5–5.0 mmol/L', status: 'normal' as const, label: 'Normal' },
                { name: 'Creatinine', value: '0.9 mg/dL', range: '0.6–1.2 mg/dL', status: 'normal' as const, label: 'Normal' },
                { name: 'BUN', value: '14 mg/dL', range: '7–20 mg/dL', status: 'normal' as const, label: 'Normal' },
              ].map(row => (
                <tr key={row.name} className="d-data-row">
                  <td className="d-data-cell" style={{ fontWeight: 600 }}>{row.name}</td>
                  <td className="d-data-cell" style={{ fontWeight: 600 }}>{row.value}</td>
                  <td className="d-data-cell" style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>{row.range}</td>
                  <td className="d-data-cell">
                    <span className="hw-vital-status" data-status={row.status} style={{ fontSize: '0.75rem' }}>
                      {row.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
