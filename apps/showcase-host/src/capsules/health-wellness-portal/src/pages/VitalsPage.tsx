import { Plus, Download } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { VitalCard } from '@/components/VitalCard';
import { Sparkline } from '@/components/Sparkline';
import { vitals } from '@/data/mock';

export function VitalsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400 }}>
      <PageHeader
        title="Vitals"
        description="Track what matters. Every reading is color-coded and clearly labeled."
        actions={
          <>
            <button className="d-interactive" style={{ padding: '0.625rem 1rem', fontSize: '0.875rem' }}>
              <Download size={16} /> Download
            </button>
            <button className="hw-button-primary" style={{ padding: '0.625rem 1.125rem', fontSize: '0.9375rem' }}>
              <Plus size={18} /> Log Reading
            </button>
          </>
        }
      />

      {/* Chart grid — cards */}
      <div>
        <SectionLabel style={{ marginBottom: '0.875rem' }}>Current Readings</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {vitals.map(v => (
            <VitalCard key={v.id} vital={v} />
          ))}
        </div>
      </div>

      {/* Data table with sparkline cells */}
      <div>
        <SectionLabel style={{ marginBottom: '0.875rem' }}>History (last 7 days)</SectionLabel>
        <div className="hw-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Measurement</th>
                <th className="d-data-header">Current</th>
                <th className="d-data-header">Normal Range</th>
                <th className="d-data-header">7-day Trend</th>
                <th className="d-data-header">Status</th>
                <th className="d-data-header">Last Reading</th>
              </tr>
            </thead>
            <tbody>
              {vitals.map(v => (
                <tr key={v.id} className="d-data-row">
                  <td className="d-data-cell" style={{ fontWeight: 600 }}>{v.name}</td>
                  <td className="d-data-cell">
                    <span style={{ fontSize: '1rem', fontWeight: 700 }}>{v.value}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginLeft: '0.25rem' }}>{v.unit}</span>
                  </td>
                  <td className="d-data-cell" style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>{v.range}</td>
                  <td className="d-data-cell" style={{ width: 120 }}>
                    <Sparkline data={v.trend} label={v.name} />
                  </td>
                  <td className="d-data-cell">
                    <span className="hw-vital-status" data-status={v.status} style={{ fontSize: '0.75rem' }}>
                      {v.statusLabel}
                    </span>
                  </td>
                  <td className="d-data-cell" style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>{v.lastReading}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
