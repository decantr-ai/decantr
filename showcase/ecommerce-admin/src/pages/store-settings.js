import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Button, Card, Input, Select, Separator, Switch, Textarea, icon, toast } from 'decantr/components';

const { div, span, h2, h3, p } = tags;

// ─── Step Indicator ────────────────────────────────────────────
function StepIndicator(step) {
  const steps = ['Store Info', 'Shipping', 'Payments', 'Notifications'];
  return div({ class: css('_flex _aic _gap2 _jcc _mb2') },
    ...steps.map((label, i) =>
      div({ class: css('_flex _aic _gap2') },
        div({ class: () => css(`_w8 _h8 _rfull _flex _center _textsm _bold _trans ${step() > i ? '_bgprimary _fgfg' : step() === i ? '_bgprimary/20 _fgprimary _bcprimary _b1' : '_bgmuted/20 _fgmuted'}`) },
          step() > i ? icon('check', { size: '1em' }) : span({}, `${i + 1}`)
        ),
        span({ class: () => css(`_textsm _hidden _md:block ${step() === i ? '_bold _fgfg' : '_fgmuted'}`) }, label),
        i < steps.length - 1 ? div({ class: css('_w8 _h[2px] _bcborder _hidden _md:block') }) : null
      )
    )
  );
}

// ─── Step 1: Store Info ────────────────────────────────────────
function StoreInfoStep() {
  return div({ class: css('_flex _col _gap4') },
    div({},
      h3({ class: css('d-gradient-text _heading6 _bold') }, 'Store Information'),
      p({ class: css('_fgmuted _textsm') }, 'Basic details about your online store')
    ),
    div({ class: css('_grid _gc1 _md:gc2 _gap4') },
      Input({ label: 'Store Name', placeholder: 'My Awesome Store' }),
      Input({ label: 'Contact Email', type: 'email', placeholder: 'hello@store.com' })
    ),
    Textarea({ label: 'Description', placeholder: 'Tell customers about your store...', rows: 3 }),
    Input({ label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000' })
  );
}

// ─── Step 2: Shipping ──────────────────────────────────────────
function ShippingStep() {
  const methods = [
    { name: 'Standard Shipping', est: '5-7 days', price: '$4.99' },
    { name: 'Express Shipping', est: '2-3 days', price: '$12.99' },
    { name: 'Overnight', est: '1 day', price: '$24.99' },
  ];

  return div({ class: css('_flex _col _gap4') },
    div({},
      h3({ class: css('d-gradient-text _heading6 _bold') }, 'Shipping Configuration'),
      p({ class: css('_fgmuted _textsm') }, 'Set up shipping methods and thresholds')
    ),
    Card({ class: css('d-glass') },
      Card.Body({ class: css('_flex _col _gap3') },
        ...methods.map(m =>
          div({ class: css('_flex _aic _jcsb _py2') },
            div({ class: css('_flex _col') },
              span({ class: css('_textsm _medium') }, m.name),
              span({ class: css('_textxs _fgmuted') }, m.est)
            ),
            span({ class: css('_textsm _bold') }, m.price)
          )
        )
      )
    ),
    div({ class: css('_grid _gc1 _md:gc2 _gap4') },
      Input({ label: 'Free Shipping Threshold', type: 'number', placeholder: '50.00' }),
      Select({ label: 'Default Carrier', options: [
        { label: 'USPS', value: 'usps' }, { label: 'FedEx', value: 'fedex' },
        { label: 'UPS', value: 'ups' }, { label: 'DHL', value: 'dhl' },
      ] })
    )
  );
}

// ─── Step 3: Payments ──────────────────────────────────────────
function PaymentsStep() {
  const [cc, setCc] = createSignal(true);
  const [paypal, setPaypal] = createSignal(true);
  const [apple, setApple] = createSignal(false);

  const row = (title, desc, checked, onChange) =>
    div({ class: css('_flex _aic _jcsb _py2') },
      div({ class: css('_flex _col') },
        span({ class: css('_textsm _medium') }, title),
        p({ class: css('_textxs _fgmuted') }, desc)
      ),
      Switch({ checked, onchange: onChange })
    );

  return div({ class: css('_flex _col _gap4') },
    div({},
      h3({ class: css('d-gradient-text _heading6 _bold') }, 'Payment Methods'),
      p({ class: css('_fgmuted _textsm') }, 'Configure accepted payment options')
    ),
    Card({ class: css('d-glass') },
      Card.Body({ class: css('_flex _col _gap2') },
        row('Credit Card', 'Visa, Mastercard, Amex via Stripe', cc, v => setCc(v)),
        Separator(),
        row('PayPal', 'PayPal standard and express checkout', paypal, v => setPaypal(v)),
        Separator(),
        row('Apple Pay', 'One-tap payments on Apple devices', apple, v => setApple(v))
      )
    ),
    Select({ label: 'Store Currency', options: [
      { label: 'USD — US Dollar', value: 'usd' }, { label: 'EUR — Euro', value: 'eur' },
      { label: 'GBP — British Pound', value: 'gbp' }, { label: 'CAD — Canadian Dollar', value: 'cad' },
    ] })
  );
}

// ─── Step 4: Notifications ─────────────────────────────────────
function NotificationsStep() {
  const [orderConfirm, setOrderConfirm] = createSignal(true);
  const [shipUpdate, setShipUpdate] = createSignal(true);
  const [lowStock, setLowStock] = createSignal(false);

  const row = (title, desc, checked, onChange) =>
    div({ class: css('_flex _aic _jcsb _py2') },
      div({ class: css('_flex _col') },
        span({ class: css('_textsm _medium') }, title),
        p({ class: css('_textxs _fgmuted') }, desc)
      ),
      Switch({ checked, onchange: onChange })
    );

  return div({ class: css('_flex _col _gap4') },
    div({},
      h3({ class: css('d-gradient-text _heading6 _bold') }, 'Notification Preferences'),
      p({ class: css('_fgmuted _textsm') }, 'Choose which alerts to send to customers and staff')
    ),
    Card({ class: css('d-glass') },
      Card.Body({ class: css('_flex _col _gap2') },
        row('Order Confirmation', 'Email customers when an order is placed', orderConfirm, v => setOrderConfirm(v)),
        Separator(),
        row('Shipping Updates', 'Notify customers when orders ship or are delivered', shipUpdate, v => setShipUpdate(v)),
        Separator(),
        row('Low Stock Alert', 'Notify staff when product stock falls below reorder point', lowStock, v => setLowStock(v))
      )
    )
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default function StoreSettingsPage() {
  const [step, setStep] = createSignal(0);
  onMount(() => { document.title = 'Store Settings — eCommerce Admin'; });

  const stepContent = [StoreInfoStep, ShippingStep, PaymentsStep, NotificationsStep];

  return div({ class: css('d-page-enter _flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('d-gradient-text _heading5') }, 'Store Settings'),
      span({ class: css('_textxs _fgmuted') }, 'Configure your store in 4 easy steps')
    ),
    Card({ class: css('d-glass') },
      Card.Body({ class: css('_flex _col _gap4 _p5') },
        StepIndicator(step),
        Separator(),
        () => stepContent[step()](),
        Separator(),
        div({ class: css('_flex _jcsb') },
          () => step() > 0
            ? Button({ variant: 'outline', onclick: () => setStep(step() - 1) }, icon('arrow-left', { size: '1em' }), ' Previous')
            : div({}),
          () => step() < 3
            ? Button({ variant: 'primary', onclick: () => setStep(step() + 1) }, 'Next ', icon('arrow-right', { size: '1em' }))
            : Button({ variant: 'primary', onclick: () => toast({ message: 'Settings saved successfully', variant: 'success', duration: 3000 }) }, icon('check', { size: '1em' }), ' Save Settings')
        )
      )
    )
  );
}
