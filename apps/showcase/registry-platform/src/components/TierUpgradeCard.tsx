import type { TierPlan } from '../data/mock';

interface TierUpgradeCardProps {
  plan: TierPlan;
  onUpgrade?: (planId: string) => void;
}

export default function TierUpgradeCard({ plan, onUpgrade }: TierUpgradeCardProps) {
  return (
    <div
      className="d-surface"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        borderTop: plan.popular ? '2px solid var(--d-accent)' : undefined,
        position: 'relative',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <h4 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{plan.name}</h4>
        {plan.popular && (
          <span
            className="d-annotation"
            style={{
              background: 'rgba(253, 163, 3, 0.15)',
              color: 'var(--d-accent)',
              fontWeight: 600,
            }}
          >
            Popular
          </span>
        )}
        {plan.current && (
          <span
            className="d-annotation"
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              color: 'var(--d-success)',
              fontWeight: 600,
            }}
          >
            Current
          </span>
        )}
      </div>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1, color: 'var(--d-text)' }}>
          ${plan.price}
        </span>
        <span style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>/mo</span>
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
        {plan.description}
      </p>

      {/* Features */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {plan.features.map((feature) => (
          <li
            key={feature}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              fontSize: '0.8125rem',
              lineHeight: 1.5,
            }}
          >
            <span
              style={{
                color: 'var(--d-success)',
                fontWeight: 700,
                fontSize: '0.875rem',
                lineHeight: '1.3',
                flexShrink: 0,
              }}
            >
              {'\u2713'}
            </span>
            <span style={{ color: 'var(--d-text)' }}>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        type="button"
        className="d-interactive"
        data-variant={plan.current ? undefined : plan.popular ? 'primary' : 'ghost'}
        disabled={plan.current}
        onClick={() => onUpgrade?.(plan.id)}
        style={{
          width: '100%',
          justifyContent: 'center',
          marginTop: '1.5rem',
          padding: '0.625rem 1rem',
        }}
      >
        {plan.current ? 'Current Plan' : 'Upgrade'}
      </button>
    </div>
  );
}
