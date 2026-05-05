import { Download, FileText, BarChart2, PieChart, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

const reports = [
  { id: 'r-1', name: 'Deal Pipeline Summary', description: 'Overview of all active and historical deals with stage distribution', icon: BarChart2, lastGenerated: '2026-04-06', format: 'PDF' },
  { id: 'r-2', name: 'Investor Engagement Report', description: 'Document views, login frequency, and engagement scoring per investor', icon: PieChart, lastGenerated: '2026-04-05', format: 'PDF' },
  { id: 'r-3', name: 'Document Access Log', description: 'Complete log of document views and downloads with timestamps', icon: FileText, lastGenerated: '2026-04-06', format: 'CSV' },
  { id: 'r-4', name: 'Q&A Status Report', description: 'Open questions, response times, and category breakdown', icon: FileText, lastGenerated: '2026-04-04', format: 'PDF' },
  { id: 'r-5', name: 'Due Diligence Progress', description: 'Stage gate completion, approval status, and timeline tracking', icon: TrendingUp, lastGenerated: '2026-04-03', format: 'PDF' },
];

export function ReportsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Reports" description="Generate and download compliance and analytics reports." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {reports.map(r => {
          const Icon = r.icon;
          return (
            <div key={r.id} className="dr-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--d-radius-sm)', background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} style={{ color: 'var(--d-primary)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="serif-display" style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.15rem' }}>{r.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{r.description}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono-data" style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>Last: {r.lastGenerated}</div>
                  <div className="d-annotation" style={{ marginTop: 2 }}>{r.format}</div>
                </div>
                <button className="d-interactive" style={{ fontSize: '0.75rem' }}>
                  <Download size={13} /> Download
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
