import { useState } from 'react';
import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import type { PricingTier } from '../../data/types';

interface PricingProps {
  tiers: PricingTier[];
}

export function Pricing({ tiers }: PricingProps) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div id="pricing">
      <section
        className={css('_flex _col _aic _px6') + ' d-section'}
        role="region"
        aria-label="Pricing plans"
      >
        <p className="section-overline">PRICING</p>

        <h2 className={css('_heading2 _textc _mb6')}>
          Simple, Transparent Pricing
        </h2>

        {/* Billing toggle */}
        <div className={css('_flex _aic _jcc _mb8')}>
          <div className="pricing-toggle" role="radiogroup" aria-label="Billing period">
            <button
              type="button"
              className="pricing-toggle-option"
              role="radio"
              aria-checked={billing === 'monthly'}
              {...(billing === 'monthly' ? { 'data-active': '' } : {})}
              onClick={() => setBilling('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className="pricing-toggle-option"
              role="radio"
              aria-checked={billing === 'annual'}
              {...(billing === 'annual' ? { 'data-active': '' } : {})}
              onClick={() => setBilling('annual')}
            >
              Annual
              <span
                className="d-annotation"
                data-status="success"
                style={{ marginLeft: '0.375rem', fontSize: '0.65rem' }}
              >
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Tier grid */}
        <div
          className={css('_grid _gc1 _md:gc3 _gap4 _aic _wfull')}
          style={{ maxWidth: 1000 }}
        >
          {tiers.map((tier) => {
            const price =
              billing === 'monthly' ? tier.price.monthly : tier.price.annual;

            return (
              <div
                key={tier.name}
                className={
                  css('_flex _col _gap4 _p6') +
                  ' d-surface carbon-card' +
                  (tier.recommended ? ' neon-border-glow' : '')
                }
                style={{
                  position: 'relative',
                  transform: tier.recommended ? 'scale(1.02)' : undefined,
                }}
                aria-label={`${tier.name} plan: $${price} per month${tier.recommended ? ', recommended' : ''}`}
              >
                {/* Popular badge */}
                {tier.recommended && (
                  <span
                    className="d-annotation"
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: 16,
                      background:
                        'color-mix(in srgb, var(--d-accent) 15%, transparent)',
                      color: 'var(--d-accent)',
                      border:
                        '1px solid color-mix(in srgb, var(--d-accent) 30%, transparent)',
                    }}
                  >
                    Popular
                  </span>
                )}

                {/* Plan name */}
                <h4 className={css('_heading4 _fontmedium')}>{tier.name}</h4>

                {/* Price */}
                <div className={css('_flex _aife _gap1')}>
                  <span
                    className={css('_heading1') + ' mono-data'}
                    aria-live="polite"
                  >
                    ${price}
                  </span>
                  <span className={css('_textsm _fgmuted _mb1')}>/mo</span>
                </div>

                {/* Feature list */}
                <ul className={css('_flex _col _gap2')} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className={css('_flex _row _aic _gap2 _textsm')}
                    >
                      <Check
                        size={16}
                        style={{ color: 'var(--d-success)', flexShrink: 0 }}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  to="/register"
                  className={css('_px4 _py3 _textsm _textc _wfull _mt4') + ' d-interactive'}
                  data-variant={tier.recommended ? 'primary' : 'ghost'}
                  style={{ justifyContent: 'center' }}
                >
                  {tier.recommended ? 'Get Started' : 'Choose Plan'}
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
