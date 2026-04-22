import { useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  heroProof,
  marketingFeatures,
  marketingSteps,
  pricingPlans,
  testimonials,
} from '../../data/mock';
import { css } from '@decantr/css';

export function HomePage() {
  const navigate = useNavigate();
  const [annualBilling, setAnnualBilling] = useState(false);

  const renderedPlans = useMemo(
    () => pricingPlans.map((plan) => ({
      ...plan,
      displayPrice: annualBilling ? plan.annual : plan.monthly,
    })),
    [annualBilling],
  );

  return (
    <div className="marketing-shell">
      <section className="marketing-hero">
        <div className="marketing-hero__inner">
          <div className="marketing-hero__copy carbon-fade-slide">
            <span className="marketing-hero__badge">
              <Zap size={14} />
              Operational beta is live
            </span>
            <h1 className="marketing-hero__title">
              Deploy autonomous <span className="marketing-hero__title-accent">agent swarms</span> with confidence.
            </h1>
            <p className="marketing-hero__subtitle">
              AgentOps combines a deployable marketplace, a live swarm workspace, and model transparency tooling in one
              operator-first product surface. No noisy chrome. No mystery handoffs.
            </p>
            <div className="marketing-hero__actions">
              <button type="button" className="d-interactive" data-variant="primary" onClick={() => navigate('/register')}>
                Deploy your first agent
                <ArrowRight size={15} />
              </button>
              <button type="button" className="d-interactive" data-variant="ghost" onClick={() => navigate('/marketplace')}>
                Browse the marketplace
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <aside className="d-surface carbon-glass marketing-hero__visual carbon-fade-slide">
            <div className="section-heading">
              <span className="mono-kicker">Mission control snapshot</span>
              <strong>Live operator signal</strong>
            </div>
            <div className="hero-proof-grid">
              {heroProof.map((item) => (
                <div key={item.label} className="hero-proof-card">
                  <div className="hero-proof-card__value mono-data">{item.value}</div>
                  <div className="hero-proof-card__label">{item.label}</div>
                </div>
              ))}
            </div>
            <span className="d-annotation" data-status="info">Marketplace templates, confidence loops, and live guard rail visibility.</span>
          </aside>
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-section__inner page-stack">
          <div className="section-heading">
            <span className="d-label">Capabilities</span>
            <h2 className={css('_fontsemi _textxl')}>A marketplace that stays grounded in operator reality</h2>
            <p className="section-heading__description">
              The public landing page is intentionally product-forward: it shows what the platform lets you do, not generic SaaS filler.
            </p>
          </div>
          <div className="feature-grid">
            {marketingFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="d-surface carbon-card feature-card carbon-fade-slide">
                  <span className="feature-card__icon">
                    <Icon size={18} />
                  </span>
                  <div className={css('_flex _col _gap2')}>
                    <h3 className="feature-card__title">{feature.title}</h3>
                    <p className="feature-card__description">{feature.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-section__inner page-stack">
          <div className="section-heading">
            <span className="d-label">How it works</span>
            <h2 className={css('_fontsemi _textxl')}>From configuration to production traffic in four deliberate steps</h2>
          </div>
          <div className="steps-grid">
            {marketingSteps.map((step, index) => (
              <article key={step.title} className="d-surface carbon-card step-card carbon-fade-slide">
                <span className="step-card__number">{index + 1}</span>
                <div className={css('_flex _col _gap2')}>
                  <h3 className="feature-card__title">{step.title}</h3>
                  <p className="step-card__description">{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-section__inner page-stack">
          <div className="section-heading">
            <span className="d-label">Pricing</span>
            <h2 className={css('_fontsemi _textxl')}>Pricing that maps to real operator scale</h2>
            <p className="section-heading__description">
              The pricing surface is compact on purpose. It explains the scaling model without drowning the user in decorative enterprise fluff.
            </p>
          </div>

          <div className={css('_flex _aic _gap3 _wrap')}>
            <div className="pricing-toggle" role="tablist" aria-label="Billing cadence">
              <button type="button" className="pricing-toggle__option" data-active={!annualBilling} onClick={() => setAnnualBilling(false)}>
                Monthly
              </button>
              <button type="button" className="pricing-toggle__option" data-active={annualBilling} onClick={() => setAnnualBilling(true)}>
                Annual
              </button>
            </div>
            {annualBilling ? <span className="d-annotation" data-status="success">Save 20%</span> : null}
          </div>

          <div className="plan-grid">
            {renderedPlans.map((plan) => (
              <article key={plan.name} className="d-surface carbon-card plan-card carbon-fade-slide" data-featured={plan.badge ? 'true' : 'false'}>
                {plan.badge ? <span className="d-annotation plan-card__tag" data-status="info">{plan.badge}</span> : null}
                <div className={css('_flex _col _gap2')}>
                  <h3 className={css('_fontsemi _textlg')}>{plan.name}</h3>
                  <p className="plan-card__description">{plan.description}</p>
                </div>
                <div className="plan-card__price">
                  <strong className="plan-card__value mono-data">${plan.displayPrice}</strong>
                  <span className={css('_textsm _fgmuted')}>/mo</span>
                </div>
                <ul className="plan-card__features">
                  {plan.features.map((feature) => (
                    <li key={feature} className="plan-card__feature">
                      <Check size={14} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" className="d-interactive" data-variant={plan.badge ? 'primary' : 'ghost'} onClick={() => navigate('/register')}>
                  {plan.badge ? 'Start with Pro' : 'Deploy with this plan'}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-section__inner page-stack">
          <div className="section-heading">
            <span className="d-label">Testimonials</span>
            <h2 className={css('_fontsemi _textxl')}>What teams value once the surface meets the workload</h2>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="d-surface carbon-card testimonial-card carbon-fade-slide">
                <p className="testimonial-card__text">“{testimonial.quote}”</p>
                <div className="testimonial-card__author">
                  <span className="testimonial-card__avatar">{testimonial.avatar}</span>
                  <div className={css('_flex _col _gap1')}>
                    <strong>{testimonial.name}</strong>
                    <span className={css('_textsm _fgmuted')}>
                      {testimonial.role}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-section__inner">
          <div className="d-surface carbon-glass cta-block carbon-fade-slide">
            <span className="d-label">Call to action</span>
            <h2 className="cta-block__title">Ready to move from prompts to durable agent operations?</h2>
            <p className="cta-block__copy">
              Start with a curated template, wire the integrations you already trust, and keep the live system observable from day one.
            </p>
            <div className={css('_flex _aic _jcc _gap3 _wrap')}>
              <button type="button" className="d-interactive" data-variant="primary" onClick={() => navigate('/register')}>
                Deploy your first agent
              </button>
              <button type="button" className="d-interactive" data-variant="ghost" onClick={() => navigate('/login')}>
                Open operator workspace
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
