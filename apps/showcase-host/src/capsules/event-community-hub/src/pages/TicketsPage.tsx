import { useState } from 'react';
import { css } from '@decantr/css';
import { CreditCard, Check, Lock } from 'lucide-react';
import { events } from '../data/mock';
import { Stepper } from '../components/Stepper';

export function TicketsPage() {
  const event = events[0];
  const [step, setStep] = useState(0);
  const [selectedTier, setSelectedTier] = useState(event.tiers[0].id);
  const [qty, setQty] = useState(1);

  const tier = event.tiers.find((t) => t.id === selectedTier)!;
  const subtotal = tier.price * qty;
  const fees = subtotal * 0.1;
  const total = subtotal + fees;

  return (
    <div className={css('_flex _col _gap6')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <Stepper steps={['Select Tickets', 'Attendee Info', 'Payment']} current={step} />

      {step === 0 && (
        <div className="feature-tile">
          <div className={css('_flex _aic _gap3')} style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--d-border)' }}>
            <img src={event.image} alt="" style={{ width: 64, height: 64, borderRadius: 'var(--d-radius)', objectFit: 'cover' }} />
            <div>
              <div className="display-heading" style={{ fontSize: '1.125rem' }}>{event.title}</div>
              <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
                {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })} · {event.venue}
              </div>
            </div>
          </div>

          <h2 className="display-heading" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Pick your tier</h2>
          <div className={css('_flex _col _gap3')} style={{ marginBottom: '1.5rem' }}>
            {event.tiers.map((t, i) => (
              <div
                key={t.id}
                className="tier-card"
                data-selected={selectedTier === t.id ? 'true' : undefined}
                data-featured={i === 1 ? 'true' : undefined}
                onClick={() => setSelectedTier(t.id)}
              >
                <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.5rem' }}>
                  <div className="display-heading" style={{ fontSize: '1.0625rem' }}>{t.name}</div>
                  <div className="display-heading gradient-pink-violet" style={{ fontSize: '1.25rem' }}>
                    {t.price === 0 ? 'Free' : `$${t.price.toFixed(0)}`}
                  </div>
                </div>
                <div className={css('_flex _aic _gap2')} style={{ flexWrap: 'wrap', marginBottom: '0.625rem' }}>
                  {t.perks.map((p) => (
                    <span key={p} className={css('_textsm')} style={{ color: 'var(--d-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Check size={12} style={{ color: 'var(--d-secondary)' }} /> {p}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '0.75rem', color: t.remaining < 10 ? 'var(--d-warning)' : 'var(--d-text-muted)', fontWeight: 600 }}>
                  {t.remaining} left
                </div>
              </div>
            ))}
          </div>

          <div className={css('_flex _aic _jcsb')} style={{ padding: '1rem', background: 'var(--d-bg)', borderRadius: 'var(--d-radius)', border: '1px solid var(--d-border)', marginBottom: '1.25rem' }}>
            <span className={css('_fontmedium')}>Quantity</span>
            <div className={css('_flex _aic _gap2')}>
              <button className="d-interactive" data-variant="ghost" onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: '0.375rem 0.625rem' }}>−</button>
              <span className="display-heading" style={{ fontSize: '1.125rem', minWidth: 24, textAlign: 'center' }}>{qty}</span>
              <button className="d-interactive" data-variant="ghost" onClick={() => setQty(qty + 1)} style={{ padding: '0.375rem 0.625rem' }}>+</button>
            </div>
          </div>

          <button className="d-interactive cta-glossy" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }} onClick={() => setStep(1)}>
            Continue to Info →
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="feature-tile">
          <h2 className="display-heading" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Your info</h2>
          <div className={css('_flex _col _gap3')} style={{ marginBottom: '1.5rem' }}>
            <label className={css('_flex _col _gap1')}>
              <span className={css('_textsm _fontmedium')}>Full name</span>
              <input className="d-control" placeholder="Juno Rivers" />
            </label>
            <label className={css('_flex _col _gap1')}>
              <span className={css('_textsm _fontmedium')}>Email</span>
              <input className="d-control" type="email" placeholder="you@pulse.events" />
            </label>
            <label className={css('_flex _col _gap1')}>
              <span className={css('_textsm _fontmedium')}>Phone</span>
              <input className="d-control" type="tel" placeholder="+1 555 0123" />
            </label>
          </div>
          <div className={css('_flex _gap2')}>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.75rem 1rem' }} onClick={() => setStep(0)}>← Back</button>
            <button className="d-interactive cta-glossy" style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }} onClick={() => setStep(2)}>
              Continue to Payment →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="feature-tile">
          <h2 className="display-heading" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            <Lock size={18} style={{ display: 'inline', verticalAlign: '-3px', color: 'var(--d-secondary)', marginRight: '0.5rem' }} />
            Payment
          </h2>
          <div className={css('_flex _col _gap3')} style={{ marginBottom: '1.5rem' }}>
            <label className={css('_flex _col _gap1')}>
              <span className={css('_textsm _fontmedium')}>Card number</span>
              <div style={{ position: 'relative' }}>
                <input className="d-control" placeholder="4242 4242 4242 4242" style={{ paddingLeft: '2.5rem' }} />
                <CreditCard size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
              </div>
            </label>
            <div className={css('_flex _gap2')}>
              <label className={css('_flex _col _gap1')} style={{ flex: 1 }}>
                <span className={css('_textsm _fontmedium')}>Expiry</span>
                <input className="d-control" placeholder="MM / YY" />
              </label>
              <label className={css('_flex _col _gap1')} style={{ flex: 1 }}>
                <span className={css('_textsm _fontmedium')}>CVC</span>
                <input className="d-control" placeholder="123" />
              </label>
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'var(--d-bg)', borderRadius: 'var(--d-radius)', border: '1px solid var(--d-border)', marginBottom: '1.25rem' }}>
            <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--d-text-muted)' }}>{tier.name} × {qty}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--d-text-muted)' }}>Service fee</span>
              <span>${fees.toFixed(2)}</span>
            </div>
            <div className={css('_flex _aic _jcsb')} style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--d-border)' }}>
              <span className={css('_fontmedium')}>Total</span>
              <span className="display-heading gradient-pink-violet" style={{ fontSize: '1.25rem' }}>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className={css('_flex _gap2')}>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.75rem 1rem' }} onClick={() => setStep(1)}>← Back</button>
            <button className="d-interactive cta-glossy" style={{ flex: 1, justifyContent: 'center', padding: '0.875rem' }}>
              Complete Purchase
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
