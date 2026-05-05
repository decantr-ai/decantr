import TierUpgradeCard from '../../components/TierUpgradeCard';
import { KPIGrid } from '../../components/KPIGrid';
import { tierPlans, billingKPIs } from '../../data/mock';

export default function BillingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="d-label" data-anchor="">
        Billing &amp; Plans
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--d-gap-6)',
        }}
      >
        {tierPlans.map((plan) => (
          <TierUpgradeCard key={plan.id} plan={plan} />
        ))}
      </div>

      <KPIGrid kpis={billingKPIs} />
    </div>
  );
}
