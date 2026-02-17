/**
 * Landing page scaffold: welcome + pricing + footer.
 */

import { welcomeJs, iconName, iconExpr, iconImport } from './shared.js';

export function landingFiles(opts) {
  return [
    ['src/app.js', appJs(opts)],
    ['src/sections/welcome.js', welcomeJs(opts)],
    ['src/sections/pricing.js', pricingJs(opts)],
    ['src/sections/footer.js', footerJs(opts)],
    ['test/welcome.test.js', welcomeTestJs(opts)]
  ];
}

function appJs(opts) {
  return `import { h, mount } from 'decantr/core';
import { setTheme } from 'decantr/css';
import { setStyle } from 'decantr/css';
import { Welcome } from './sections/welcome.js';
import { Pricing } from './sections/pricing.js';
import { Footer } from './sections/footer.js';

setTheme('${opts.theme}');
setStyle('${opts.style}');

function App() {
  return h('div', null,
    Welcome(),
    Pricing(),
    Footer()
  );
}

mount(document.getElementById('app'), App);
`;
}

function pricingJs(opts) {
  const hasIcons = !!opts.icons;

  const planIcons = { Starter: 'star', Pro: 'bolt', Enterprise: 'shield' };

  const planNameExpr = hasIcons
    ? `              h('h3', { style: { fontSize: '1.25rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' } },
                  plan.planIcon, plan.name
                )`
    : `              h('h3', { style: { fontSize: '1.25rem', fontWeight: '600' } }, plan.name)`;

  const featureItem = hasIcons
    ? `                  h('li', { style: { padding: '0.375rem 0', color: 'var(--c4)', display: 'flex', alignItems: 'center', gap: '0.5rem' } },
                    ${iconExpr('check', opts, { size: '1em', 'aria-hidden': 'true' })}, f
                  )`
    : `                  h('li', { style: { padding: '0.375rem 0', color: 'var(--c4)' } }, '\\u2713 ' + f)`;

  const plansDef = hasIcons
    ? `const plans = [
  { name: 'Starter', price: 'Free', features: ['5 projects', 'Community support', 'Basic themes'], cta: 'Get Started', planIcon: ${iconExpr('star', opts)} },
  { name: 'Pro', price: '$29/mo', features: ['Unlimited projects', 'Priority support', 'All themes & styles', 'Custom components'], cta: 'Go Pro', popular: true, planIcon: ${iconExpr('bolt', opts)} },
  { name: 'Enterprise', price: 'Custom', features: ['Everything in Pro', 'Dedicated support', 'SLA guarantee', 'Custom integrations'], cta: 'Contact Sales', planIcon: ${iconExpr('shield', opts)} }
];`
    : `const plans = [
  { name: 'Starter', price: 'Free', features: ['5 projects', 'Community support', 'Basic themes'], cta: 'Get Started' },
  { name: 'Pro', price: '$29/mo', features: ['Unlimited projects', 'Priority support', 'All themes & styles', 'Custom components'], cta: 'Go Pro', popular: true },
  { name: 'Enterprise', price: 'Custom', features: ['Everything in Pro', 'Dedicated support', 'SLA guarantee', 'Custom integrations'], cta: 'Contact Sales' }
];`;

  return `import { h } from 'decantr/core';
import { Card, Button, Badge } from 'decantr/components';
${iconImport(opts)}
${plansDef}

export function Pricing() {
  return h('section', {
    style: { padding: '5rem 2rem', background: 'var(--c2)', borderTop: '1px solid var(--c5)', borderBottom: '1px solid var(--c5)' }
  },
    h('div', { style: { maxWidth: '1080px', margin: '0 auto' } },
      h('h2', { style: { fontSize: '2rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem' } },
        'Simple pricing'
      ),
      h('div', {
        style: {
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem', alignItems: 'start'
        }
      },
        ...plans.map(plan => {
          const card = Card({},
            Card.Header({},
              h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
${planNameExpr},
                plan.popular ? Badge({ status: 'success', count: 'Popular' }) : null
              )
            ),
            Card.Body({},
              h('p', { style: { fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' } }, plan.price),
              h('ul', { style: { listStyle: 'none', padding: '0', marginBottom: '1.5rem' } },
                ...plan.features.map(f =>
${featureItem}
                )
              ),
              Button({ variant: plan.popular ? 'primary' : 'secondary', block: true }, plan.cta)
            )
          );
          return card;
        })
      )
    )
  );
}
`;
}

function footerJs(opts) {
  const hasIcons = !!opts.icons;

  const footerBottom = hasIcons
    ? `    h('div', {
      style: { maxWidth: '1080px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid var(--c5)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }
    },
      h('a', { href: 'https://github.com/david-aimi/decantr', target: '_blank', 'aria-label': 'Source code', style: { color: 'var(--c4)' } },
        ${iconExpr('code', opts, { size: '1.25em', 'aria-hidden': 'true' })}
      ),
      h('span', { style: { color: 'var(--c4)', fontSize: '0.875rem' } }, '\\u00a9 2025 decantr. All rights reserved.')
    )`
    : `    h('div', {
      style: { maxWidth: '1080px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid var(--c5)', textAlign: 'center', color: 'var(--c4)', fontSize: '0.875rem' }
    }, '\\u00a9 2025 decantr. All rights reserved.')`;

  return `import { h } from 'decantr/core';
${iconImport(opts)}
const links = {
  Product: ['Features', 'Pricing', 'Docs', 'Changelog'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Legal: ['Privacy', 'Terms', 'License']
};

export function Footer() {
  return h('footer', {
    style: { padding: '3rem 2rem', borderTop: '1px solid var(--c5)' }
  },
    h('div', {
      style: {
        maxWidth: '1080px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '2rem'
      }
    },
      h('div', null,
        h('p', { style: { fontWeight: '700', color: 'var(--c1)', marginBottom: '0.5rem' } }, '${opts.name}'),
        h('p', { style: { color: 'var(--c4)', fontSize: '0.875rem' } }, 'Built with decantr.')
      ),
      ...Object.entries(links).map(([category, items]) =>
        h('div', null,
          h('p', { style: { fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.875rem' } }, category),
          ...items.map(item =>
            h('a', { href: '#', style: { display: 'block', color: 'var(--c4)', fontSize: '0.875rem', padding: '0.25rem 0' } }, item)
          )
        )
      )
    ),
${footerBottom}
  );
}
`;
}

function welcomeTestJs(opts) {
  return `import { describe, it, assert, render } from 'decantr/test';
import { Welcome } from '../src/sections/welcome.js';

describe('Welcome', () => {
  it('renders project name', () => {
    const { container } = render(() => Welcome());
    assert.ok(container.textContent.includes('${opts.name}'));
  });

  it('renders Get Started button', () => {
    const { container } = render(() => Welcome());
    assert.ok(container.textContent.includes('Get Started'));
  });

  it('renders feature cards', () => {
    const { container } = render(() => Welcome());
    assert.ok(container.textContent.includes('Lightning Fast'));
    assert.ok(container.textContent.includes('Zero Dependencies'));
  });
});
`;
}
