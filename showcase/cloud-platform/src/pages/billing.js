import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, Statistic, icon } from 'decantr/components';

const { div, span, h2, ul, li } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const plans = [
  {
    name: 'Hobby', price: '$0', period: '/mo', featured: false, cta: 'Current Plan',
    features: ['1 app', '256 MB RAM', 'Shared CPU', 'Community support', '1 GB storage'],
  },
  {
    name: 'Pro', price: '$29', period: '/mo', featured: true, cta: 'Upgrade',
    features: ['Unlimited apps', '2 GB RAM per app', 'Dedicated CPU', 'Priority support', '50 GB storage', 'Custom domains', 'Auto-scaling'],
  },
  {
    name: 'Enterprise', price: 'Custom', period: '', featured: false, cta: 'Contact Sales',
    features: ['Unlimited apps', 'Custom resources', 'GPU machines', 'Dedicated support', '1 TB storage', 'SSO & RBAC', 'SLA guarantee', 'Audit logs', 'Private networking'],
  },
];

// ─── KPI Grid ───────────────────────────────────────────────────
function BillingKpis() {
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('_heading5 _bold') }, 'Billing Overview'),
    div({ class: css('_grid _gc1 _sm:gc3 _gap4 d-stagger') },
      Statistic({
        label: 'Current Balance',
        value: 247.5,
        prefix: '$',
        animate: 1200,
      }),
      Statistic({
        label: 'Monthly Estimate',
        value: 312,
        prefix: '$',
        trend: 'up',
        trendValue: '+26%',
        animate: 1200,
      }),
      Statistic({
        label: 'Credits Remaining',
        value: 50,
        prefix: '$',
        animate: 1200,
      })
    )
  );
}

// ─── Pricing Table ──────────────────────────────────────────────
function PricingTable() {
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('_heading5 _bold') }, 'Plans'),
    div({ class: css('_grid _gc1 _md:gc3 _gap4 d-stagger-up') },
      ...plans.map(plan =>
        Card({ class: css('_flex _col'), hover: true },
          Card.Header({ class: css('_flex _col _gap1 _center') },
            plan.featured ? Badge({ variant: 'primary', size: 'sm' }, 'Recommended') : null,
            span({ class: css('_heading5 _bold') }, plan.name),
            div({ class: css('_flex _aic _aife _gap1') },
              span({ class: css('_heading3 _bold _fgprimary') }, plan.price),
              plan.period ? span({ class: css('_textxs _fgmuted') }, plan.period) : null
            )
          ),
          Card.Body({ class: css('_flex _col _gap3 _flex1') },
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
            }, plan.cta)
          )
        )
      )
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function BillingPage() {
  onMount(() => {
    document.title = 'Billing — CloudLaunch';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    BillingKpis(),
    PricingTable()
  );
}
