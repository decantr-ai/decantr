import { css } from '@decantr/css';
import { KPIGrid } from '@/components/KPIGrid';
import { TierUpgradeCard } from '@/components/TierUpgradeCard';
import { BILLING_KPIS, PRICING_TIERS } from '@/data/mock';

export function BillingPage() {
  return (
    <div className={css('_flex _col _gap6')}>
      <h3 className={css('_textlg _fontsemi')}>Billing &amp; Plans</h3>

      {/* Current Usage */}
      <section className="d-section" data-density="compact">
        <span
          className={css('_db _mb4') + ' d-label'}
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Current Usage
        </span>
        <KPIGrid kpis={BILLING_KPIS} />
      </section>

      {/* Plans */}
      <section className="d-section" data-density="compact">
        <span
          className={css('_db _mb4') + ' d-label'}
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Plans
        </span>

        <div
          className={css('_grid _gap4')}
          style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
        >
          {PRICING_TIERS.map((tier) => (
            <TierUpgradeCard
              key={tier.name}
              tier={tier}
              highlighted={tier.highlighted}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
