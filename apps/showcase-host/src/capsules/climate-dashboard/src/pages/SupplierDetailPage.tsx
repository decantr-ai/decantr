import { useParams, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ArrowLeft, Globe, Truck, CheckCircle, XCircle } from 'lucide-react';
import { suppliers } from '@/data/mock';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

function EmissionBar({ value, max }: { value: number; max: number }) {
  const pct = useAnimatedValue((value / max) * 100, 800);
  return (
    <div style={{ height: 8, borderRadius: 4, background: 'var(--d-border)', width: '100%' }}>
      <div style={{ height: '100%', borderRadius: 4, background: 'var(--d-primary)', width: `${pct}%` }} />
    </div>
  );
}

export function SupplierDetailPage() {
  const { id } = useParams();
  const supplier = suppliers.find(s => s.id === id);

  if (!supplier) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--d-text-muted)', marginBottom: '1rem' }}>Supplier not found</p>
        <Link to="/suppliers" className="d-interactive" style={{ textDecoration: 'none' }}>Back to suppliers</Link>
      </div>
    );
  }

  const maxEmissions = Math.max(...suppliers.map(s => s.emissions));

  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <Link to="/suppliers" className={css('_flex _aic _gap1')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none', marginBottom: '0.5rem' }}>
          <ArrowLeft size={14} /> Back to suppliers
        </Link>
        <div className={css('_flex _aic _gap3')}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{supplier.name}</h1>
          <span className="d-annotation" data-status={supplier.status === 'compliant' ? 'success' : supplier.status === 'at-risk' ? 'warning' : 'error'}>
            {supplier.status}
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className={css('_grid _gc2 lg:_gc4 _gap4')}>
        <div className="d-surface earth-card">
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>Tier</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Tier {supplier.tier}</div>
        </div>
        <div className="d-surface earth-card">
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>Emissions</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{supplier.emissions.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>tCO2e</div>
        </div>
        <div className="d-surface earth-card">
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>Region</div>
          <div className={css('_flex _aic _gap2')}>
            <Globe size={16} style={{ color: 'var(--d-accent)' }} />
            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>{supplier.country}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{supplier.region}</div>
        </div>
        <div className="d-surface earth-card">
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>SBTi Status</div>
          <div className={css('_flex _aic _gap2')}>
            {supplier.sbtiCommitted ? (
              <>
                <CheckCircle size={18} style={{ color: 'var(--d-success)' }} />
                <span style={{ fontWeight: 600, color: 'var(--d-success)' }}>Committed</span>
              </>
            ) : (
              <>
                <XCircle size={18} style={{ color: 'var(--d-text-muted)' }} />
                <span style={{ fontWeight: 600, color: 'var(--d-text-muted)' }}>Not committed</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Emissions breakdown */}
      <div className="d-surface earth-card">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>Emissions Profile</div>
        <div className={css('_flex _col _gap4')}>
          <div>
            <div className={css('_flex _jcsb')} style={{ marginBottom: '0.375rem', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 500 }}>{supplier.category}</span>
              <span style={{ fontWeight: 600 }}>{supplier.emissions.toLocaleString()} tCO2e</span>
            </div>
            <EmissionBar value={supplier.emissions} max={maxEmissions} />
          </div>
          <div style={{ padding: '1rem', background: 'var(--d-bg)', borderRadius: 'var(--d-radius-sm)', fontSize: '0.875rem' }}>
            <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem' }}>
              <Truck size={16} style={{ color: 'var(--d-accent)' }} />
              <span style={{ fontWeight: 600 }}>Supply Chain Details</span>
            </div>
            <div className={css('_grid _gc2 _gap3')} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
              <div>Category: <strong style={{ color: 'var(--d-text)' }}>{supplier.category}</strong></div>
              <div>Region: <strong style={{ color: 'var(--d-text)' }}>{supplier.region}</strong></div>
              <div>Coordinates: <strong style={{ color: 'var(--d-text)' }}>{supplier.lat}, {supplier.lng}</strong></div>
              <div>Tier Level: <strong style={{ color: 'var(--d-text)' }}>Tier {supplier.tier}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
