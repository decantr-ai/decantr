/**
 * Landing page scaffold: hero + features + pricing + footer.
 */

export function landingFiles(opts) {
  return [
    ['src/app.js', appJs(opts)],
    ['src/sections/hero.js', heroJs()],
    ['src/sections/features.js', featuresJs()],
    ['src/sections/pricing.js', pricingJs()],
    ['src/sections/footer.js', footerJs()],
    ['test/hero.test.js', heroTestJs()]
  ];
}

function appJs(opts) {
  return `import { h, mount } from 'decantr/core';
import { setTheme } from 'decantr/css';
import { setStyle } from 'decantr/css';
import { Hero } from './sections/hero.js';
import { Features } from './sections/features.js';
import { Pricing } from './sections/pricing.js';
import { Footer } from './sections/footer.js';

setTheme('${opts.theme}');
setStyle('${opts.style}');

function App() {
  return h('div', null,
    Hero(),
    Features(),
    Pricing(),
    Footer()
  );
}

mount(document.getElementById('app'), App);
`;
}

function heroJs() {
  return `import { h } from 'decantr/core';
import { Button } from 'decantr/components';

export function Hero() {
  return h('section', {
    style: {
      padding: '6rem 2rem', textAlign: 'center', background: 'var(--c2)',
      borderBottom: '1px solid var(--c5)'
    }
  },
    h('div', { style: { maxWidth: '680px', margin: '0 auto' } },
      h('h1', { style: { fontSize: '3rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem' } },
        'Build something ',
        h('span', { style: { color: 'var(--c1)' } }, 'extraordinary')
      ),
      h('p', { style: { fontSize: '1.25rem', color: 'var(--c4)', lineHeight: '1.6', marginBottom: '2rem' } },
        'The modern platform for teams who ship fast. Zero friction, infinite possibilities.'
      ),
      h('div', { style: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' } },
        Button({ variant: 'primary', size: 'lg' }, 'Get Started'),
        Button({ size: 'lg' }, 'Learn More')
      )
    )
  );
}
`;
}

function featuresJs() {
  return `import { h } from 'decantr/core';
import { Card } from 'decantr/components';

const features = [
  { title: 'Lightning Fast', desc: 'Sub-millisecond rendering with signal-based reactivity. No virtual DOM overhead.' },
  { title: 'Zero Dependencies', desc: 'Pure JavaScript, CSS, and HTML. Nothing to install, nothing to break.' },
  { title: 'AI-Native', desc: 'Designed for AI agents to read, generate, and maintain. Machine-readable manifests.' },
  { title: 'Tiny Bundle', desc: 'Under 2KB gzipped for a hello world. Your users will thank you.' },
  { title: 'Beautiful Defaults', desc: '7 themes and 7 design styles. Pick your aesthetic, switch at runtime.' },
  { title: 'Built-in Testing', desc: 'Test runner with DOM helpers. No config, no setup, just write tests.' }
];

export function Features() {
  return h('section', {
    style: { padding: '5rem 2rem' }
  },
    h('div', { style: { maxWidth: '1080px', margin: '0 auto' } },
      h('h2', { style: { fontSize: '2rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem' } },
        'Everything you need'
      ),
      h('div', {
        style: {
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }
      },
        ...features.map(f =>
          Card({ hoverable: true },
            h('h3', { style: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' } }, f.title),
            h('p', { style: { color: 'var(--c4)', lineHeight: '1.6' } }, f.desc)
          )
        )
      )
    )
  );
}
`;
}

function pricingJs() {
  return `import { h } from 'decantr/core';
import { Card, Button, Badge } from 'decantr/components';

const plans = [
  { name: 'Starter', price: 'Free', features: ['5 projects', 'Community support', 'Basic themes'], cta: 'Get Started' },
  { name: 'Pro', price: '$29/mo', features: ['Unlimited projects', 'Priority support', 'All themes & styles', 'Custom components'], cta: 'Go Pro', popular: true },
  { name: 'Enterprise', price: 'Custom', features: ['Everything in Pro', 'Dedicated support', 'SLA guarantee', 'Custom integrations'], cta: 'Contact Sales' }
];

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
                h('h3', { style: { fontSize: '1.25rem', fontWeight: '600' } }, plan.name),
                plan.popular ? Badge({ status: 'success', count: 'Popular' }) : null
              )
            ),
            Card.Body({},
              h('p', { style: { fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' } }, plan.price),
              h('ul', { style: { listStyle: 'none', padding: '0', marginBottom: '1.5rem' } },
                ...plan.features.map(f =>
                  h('li', { style: { padding: '0.375rem 0', color: 'var(--c4)' } }, '\\u2713 ' + f)
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

function footerJs() {
  return `import { h } from 'decantr/core';

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
        h('p', { style: { fontWeight: '700', color: 'var(--c1)', marginBottom: '0.5rem' } }, 'decantr'),
        h('p', { style: { color: 'var(--c4)', fontSize: '0.875rem' } }, 'AI-first web framework.')
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
    h('div', {
      style: { maxWidth: '1080px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid var(--c5)', textAlign: 'center', color: 'var(--c4)', fontSize: '0.875rem' }
    }, '\\u00a9 2025 decantr. All rights reserved.')
  );
}
`;
}

function heroTestJs() {
  return `import { describe, it, assert, render } from 'decantr/test';
import { Hero } from '../src/sections/hero.js';

describe('Hero', () => {
  it('renders headline', () => {
    const { container } = render(() => Hero());
    assert.ok(container.textContent.includes('extraordinary'));
  });

  it('renders CTA buttons', () => {
    const { container } = render(() => Hero());
    assert.ok(container.textContent.includes('Get Started'));
    assert.ok(container.textContent.includes('Learn More'));
  });
});
`;
}
