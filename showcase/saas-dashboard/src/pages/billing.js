import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, DataTable, Separator, icon } from 'decantr/components';

const { div, span, h2, ul, li } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const plans = [
  {
    name: 'Starter', price: 29, period: '/mo', featured: false,
    features: ['5 team members', '10 GB storage', 'Basic analytics', 'Email support', 'API access'],
  },
  {
    name: 'Pro', price: 79, period: '/mo', featured: true,
    features: ['25 team members', '100 GB storage', 'Advanced analytics', 'Priority support', 'API access', 'Custom domains', 'SSO integration'],
  },
  {
    name: 'Enterprise', price: 199, period: '/mo', featured: false,
    features: ['Unlimited members', '1 TB storage', 'Full analytics suite', 'Dedicated support', 'API access', 'Custom domains', 'SSO integration', 'SLA guarantee', 'Audit logs'],
  },
];

const invoices = [
  { date: 'Mar 1, 2026', description: 'Pro Plan — Monthly', amount: '$79.00', status: 'paid' },
  { date: 'Feb 1, 2026', description: 'Pro Plan — Monthly', amount: '$79.00', status: 'paid' },
  { date: 'Jan 15, 2026', description: 'Add-on: Extra Storage 50 GB', amount: '$12.00', status: 'paid' },
  { date: 'Jan 1, 2026', description: 'Pro Plan — Monthly', amount: '$79.00', status: 'paid' },
  { date: 'Dec 1, 2025', description: 'Pro Plan — Monthly', amount: '$79.00', status: 'paid' },
  { date: 'Nov 14, 2025', description: 'Upgrade: Starter → Pro', amount: '$50.00', status: 'paid' },
  { date: 'Nov 1, 2025', description: 'Starter Plan — Monthly', amount: '$29.00', status: 'refunded' },
];

// ─── KPI Grid ───────────────────────────────────────────────────
function BillingKpis() {
  return div({ class: css('_grid _gc1 _sm:gc3 _gap4 d-stagger-scale') },
    Card({ class: css('d-glass') },
      Card.Body({ class: css('_flex _col _gap2 _center') },
        icon('crown', { size: '1.5em', class: css('_fgprimary') }),
        span({ class: css('_textxs _fgmuted _uppercase') }, 'Current Plan'),
        span({ class: css('d-gradient-text _heading4 _bold') }, 'Pro'),
        span({ class: css('_textxs _fgmuted') }, 'Renews Apr 1, 2026')
      )
    ),
    Card({ class: css('d-glass') },
      Card.Body({ class: css('_flex _col _gap2 _center') },
        icon('receipt', { size: '1.5em', class: css('_fgprimary') }),
        span({ class: css('_textxs _fgmuted _uppercase') }, 'Next Invoice'),
        span({ class: css('d-gradient-text _heading4 _bold') }, '$79.00'),
        span({ class: css('_textxs _fgmuted') }, 'Due Apr 1, 2026')
      )
    ),
    Card({ class: css('d-glass') },
      Card.Body({ class: css('_flex _col _gap2 _center') },
        icon('credit-card', { size: '1.5em', class: css('_fgprimary') }),
        span({ class: css('_textxs _fgmuted _uppercase') }, 'Payment Method'),
        span({ class: css('_heading5 _bold') }, '•••• 4242'),
        span({ class: css('_textxs _fgmuted') }, 'Visa — Expires 12/27')
      )
    ),
  );
}

// ─── Pricing Table ──────────────────────────────────────────────
function PricingTable() {
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('d-gradient-text _heading5') }, 'Plans'),
    div({ class: css('_grid _gc1 _md:gc3 _gap4 d-stagger-up') },
      ...plans.map(plan =>
        Card({ class: css('d-glass _flex _col'), hover: true },
          Card.Header({ class: css('_flex _col _gap1 _center') },
            plan.featured ? Badge({ variant: 'primary', size: 'sm' }, 'Most Popular') : null,
            span({ class: css('_heading5 _bold') }, plan.name),
            div({ class: css('_flex _aic _aife _gap1') },
              span({ class: css('d-gradient-text _heading3 _bold') }, `$${plan.price}`),
              span({ class: css('_textxs _fgmuted') }, plan.period)
            )
          ),
          Card.Body({ class: css('_flex _col _gap3 _flex1') },
            Separator(),
            ul({ class: css('_flex _col _gap2 _flex1') },
              ...plan.features.map(f =>
                li({ class: css('_flex _aic _gap2 _textsm') },
                  icon('check', { size: '1em', class: css('_fgsuccess') }),
                  span({}, f)
                )
              )
            ),
            Button({
              variant: plan.featured ? 'primary' : 'outline',
              class: css('_wfull'),
            }, plan.featured ? 'Current Plan' : 'Switch Plan')
          )
        )
      )
    )
  );
}

// ─── Invoice History ────────────────────────────────────────────
function InvoiceHistory() {
  const statusVariant = s => s === 'paid' ? 'success' : s === 'refunded' ? 'warning' : 'error';

  const columns = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'status', label: 'Status' },
  ];

  const data = invoices.map(inv => ({
    ...inv,
    status: Badge({ variant: statusVariant(inv.status), size: 'sm' }, inv.status),
  }));

  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('d-gradient-text _heading5') }, 'Invoice History'),
      Button({ variant: 'ghost', size: 'sm' }, icon('download', { size: '1em' }), ' Export')
    ),
    Card({ class: css('d-glass') },
      Card.Body({},
        DataTable({ columns, data, sortable: true, paginate: true, pageSize: 5 })
      )
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function BillingPage() {
  onMount(() => { document.title = 'Billing — SaaS Dashboard'; });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    BillingKpis(),
    PricingTable(),
    InvoiceHistory()
  );
}
