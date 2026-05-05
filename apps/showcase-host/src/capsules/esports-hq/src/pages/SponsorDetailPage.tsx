import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ChartGrid } from '@/components/ChartGrid';
import { sponsors, sponsorChartData } from '@/data/mock';

export function SponsorDetailPage() {
  const { id } = useParams();
  const sponsor = sponsors.find(s => s.id === id) || sponsors[0];

  const impressionData = sponsorChartData.map(d => ({ label: d.month, value: d.impressions }));
  const activationData = sponsorChartData.map(d => ({ label: d.month, value: d.activations * 10000 }));

  return (
    <div className="gg-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)' }}>
      <Link to="/sponsors" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Sponsors
      </Link>

      {/* Header */}
      <div className="d-surface neon-glow" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--d-radius)',
          background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          fontWeight: 700,
          flexShrink: 0,
        }}>
          {sponsor.logo}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>{sponsor.name}</h1>
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>
            <span className="d-annotation" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{sponsor.tier}</span>
            <span
              className="d-annotation"
              data-status={sponsor.status === 'active' ? 'success' : sponsor.status === 'negotiating' ? 'warning' : 'error'}
              style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}
            >
              {sponsor.status}
            </span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--d-gap-4)' }}>
        {[
          { label: 'Deal Value', value: `$${sponsor.dealValue.toLocaleString()}` },
          { label: 'Total Impressions', value: sponsor.impressions.toLocaleString() },
          { label: 'Activations', value: String(sponsor.activations) },
          { label: 'Contract Period', value: `${sponsor.startDate} - ${sponsor.endDate}` },
        ].map(kpi => (
          <div key={kpi.label} className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
            <div className="d-label" style={{ marginBottom: '0.25rem' }}>{kpi.label}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, fontFamily: 'var(--d-font-mono, monospace)' }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--d-gap-4)' }}>
        <ChartGrid title="Monthly Impressions" data={impressionData} color="var(--d-primary)" />
        <ChartGrid title="Monthly Activation Value" data={activationData} color="var(--d-accent)" />
      </div>
    </div>
  );
}
