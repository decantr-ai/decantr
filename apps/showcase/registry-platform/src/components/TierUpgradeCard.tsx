import { css } from '@decantr/css';
import { Check, X } from 'lucide-react';
import type { PRICING_TIERS } from '@/data/mock';

interface Props {
  tier: (typeof PRICING_TIERS)[0];
  highlighted?: boolean;
}

export function TierUpgradeCard({ tier, highlighted }: Props) {
  const isHighlighted = highlighted ?? tier.highlighted;
  return (
    <div
      className="d-surface"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderColor: isHighlighted ? 'var(--d-primary)' : undefined,
        borderTopWidth: isHighlighted ? 3 : undefined,
        borderTopColor: isHighlighted ? 'var(--d-primary)' : undefined,
        position: 'relative',
      }}
    >
      {/* Header */}
      <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.5rem' }}>
        <h4 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{tier.name}</h4>
        {tier.current && (
          <span className="d-annotation" data-status="success">Current</span>
        )}
        {isHighlighted && !tier.current && (
          <span className="d-annotation" data-status="info">Popular</span>
        )}
      </div>

      {/* Price */}
      <div className={css('_flex _aic')} style={{ marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
          ${tier.price}
        </span>
        <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginLeft: '0.25rem' }}>/mo</span>
      </div>

      <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
        {tier.description}
      </p>

      {/* Features */}
      <ul className={css('_flex _col _gap2')} style={{ listStyle: 'none', marginBottom: '1.5rem', flex: 1 }}>
        {tier.features.map((feature) => (
          <li key={feature} className={css('_flex _aic _gap2')} style={{ fontSize: '0.875rem' }}>
            <Check size={14} style={{ color: 'var(--d-success)', flexShrink: 0 }} />
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        className="d-interactive"
        data-variant={tier.current ? undefined : 'primary'}
        disabled={tier.current}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {tier.current ? 'Current Plan' : 'Upgrade'}
      </button>
    </div>
  );
}
