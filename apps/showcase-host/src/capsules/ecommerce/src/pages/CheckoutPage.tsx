import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Lock, CreditCard, Truck, Package } from 'lucide-react';
import { initialCart, getProduct } from '@/data/mock';

const steps = [
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: Package },
] as const;

type StepId = typeof steps[number]['id'];

export function CheckoutPage() {
  const [step, setStep] = useState<StepId>('shipping');
  const [done, setDone] = useState(false);

  const rows = initialCart.map(i => ({ ...i, product: getProduct(i.productId)! })).filter(r => r.product);
  const subtotal = rows.reduce((a, r) => a + r.product.price * r.quantity, 0);
  const shipping = subtotal > 75 ? 0 : 8;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (done) {
    return (
      <div style={{ maxWidth: 520, margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <CheckCircle2 size={56} style={{ margin: '0 auto 1rem', color: 'var(--d-success)' }} />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Order confirmed</h1>
        <p style={{ color: 'var(--d-text-muted)', marginBottom: '0.5rem' }}>Order #VIN-3058 · ${total.toFixed(2)}</p>
        <p style={{ color: 'var(--d-text-muted)', marginBottom: '2rem' }}>A receipt is on its way to your inbox.</p>
        <div style={{ display: 'inline-flex', gap: '0.75rem' }}>
          <Link to="/orders/VIN-3058" className="ec-button-primary">Track your order</Link>
          <Link to="/shop" className="d-interactive">Keep shopping</Link>
        </div>
      </div>
    );
  }

  const stepIdx = steps.findIndex(s => s.id === step);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Stepper */}
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <div
            key={s.id}
            className="ec-step"
            data-active={step === s.id ? 'true' : undefined}
            data-done={i < stepIdx ? 'true' : undefined}
          >
            <span className="ec-step-dot">{i < stepIdx ? '✓' : i + 1}</span>
            {s.label}
          </div>
        ))}
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '2rem', alignItems: 'start' }}>
        {/* Form */}
        <div className="ec-card" style={{ padding: '2rem' }}>
          {step === 'shipping' && <ShippingForm onNext={() => setStep('payment')} />}
          {step === 'payment' && <PaymentForm onBack={() => setStep('shipping')} onNext={() => setStep('review')} />}
          {step === 'review' && <ReviewStep onBack={() => setStep('payment')} onPlace={() => setDone(true)} />}
        </div>

        {/* Summary */}
        <aside className="ec-card" style={{ padding: '1.5rem', position: 'sticky', top: 80 }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Order · {rows.length} items</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', maxHeight: 240, overflowY: 'auto', paddingRight: '0.25rem' }}>
            {rows.map(r => (
              <div key={r.productId} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--d-radius)', background: 'var(--d-surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                  {r.product.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.product.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>Qty {r.quantity}</div>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>${(r.product.price * r.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--d-border)', marginTop: '1rem', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--d-text-muted)' }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--d-text-muted)' }}><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--d-text-muted)' }}><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: '0.4rem', borderTop: '1px solid var(--d-border)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '1rem', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
            <Lock size={11} /> Secured with 256-bit SSL
          </div>
        </aside>
      </div>
    </div>
  );
}

function ShippingForm({ onNext }: { onNext: () => void }) {
  return (
    <form onSubmit={e => { e.preventDefault(); onNext(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>Shipping address</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Labeled label="First name"><input className="ec-input" defaultValue="Maya" required /></Labeled>
        <Labeled label="Last name"><input className="ec-input" defaultValue="Rivera" required /></Labeled>
      </div>
      <Labeled label="Email"><input className="ec-input" type="email" defaultValue="maya@vinea.shop" required /></Labeled>
      <Labeled label="Address"><input className="ec-input" placeholder="Start typing…" defaultValue="1428 Willow Lane" required /></Labeled>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
        <Labeled label="City"><input className="ec-input" defaultValue="Brooklyn" required /></Labeled>
        <Labeled label="State"><input className="ec-input" defaultValue="NY" required /></Labeled>
        <Labeled label="ZIP"><input className="ec-input" defaultValue="11201" required /></Labeled>
      </div>
      <Labeled label="Country">
        <select className="ec-input" defaultValue="US">
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="UK">United Kingdom</option>
        </select>
      </Labeled>
      <button type="submit" className="ec-button-primary" style={{ alignSelf: 'flex-end', padding: '0.75rem 1.5rem', marginTop: '0.5rem' }}>Continue to payment</button>
    </form>
  );
}

function PaymentForm({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <form onSubmit={e => { e.preventDefault(); onNext(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Payment method</h2>
      <div className="ec-card" style={{ padding: '1rem', background: 'color-mix(in srgb, var(--d-primary) 4%, transparent)', border: '1px solid var(--d-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: 'var(--d-radius)' }}>
        <CreditCard size={18} style={{ color: 'var(--d-primary)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Visa ending in 4242</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Expires 03/28 · Saved</div>
        </div>
        <span className="ec-badge">Default</span>
      </div>
      <Labeled label="Card number"><input className="ec-input" placeholder="1234 5678 9012 3456" defaultValue="4242 4242 4242 4242" /></Labeled>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        <Labeled label="Expiry"><input className="ec-input" placeholder="MM/YY" defaultValue="03/28" /></Labeled>
        <Labeled label="CVC"><input className="ec-input" placeholder="123" defaultValue="123" /></Labeled>
        <Labeled label="ZIP"><input className="ec-input" defaultValue="11201" /></Labeled>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>
        <input type="checkbox" defaultChecked /> Save card for next time
      </label>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <button type="button" onClick={onBack} className="d-interactive" data-variant="ghost">Back</button>
        <button type="submit" className="ec-button-primary" style={{ padding: '0.75rem 1.5rem' }}>Review order</button>
      </div>
    </form>
  );
}

function ReviewStep({ onBack, onPlace }: { onBack: () => void; onPlace: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Review & place order</h2>
      <ReviewBlock title="Ship to" body="Maya Rivera · 1428 Willow Lane, Brooklyn NY 11201 · United States" />
      <ReviewBlock title="Payment" body="Visa ending in 4242" />
      <ReviewBlock title="Delivery" body="Standard shipping · Arrives in 3–5 business days" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <button type="button" onClick={onBack} className="d-interactive" data-variant="ghost">Back</button>
        <button type="button" onClick={onPlace} className="ec-button-primary" style={{ padding: '0.75rem 1.75rem' }}>
          <Lock size={14} /> Place order
        </button>
      </div>
    </div>
  );
}

function ReviewBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="d-label" style={{ marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ fontSize: '0.875rem' }}>{body}</div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--d-text-muted)' }}>{label}</span>
      {children}
    </label>
  );
}
