import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import { resetBlockBase } from '../src/blocks/_base.js';
import { Hero } from '../src/blocks/hero.js';
import { Features } from '../src/blocks/features.js';
import { Pricing } from '../src/blocks/pricing.js';
import { Testimonials } from '../src/blocks/testimonials.js';
import { CTA } from '../src/blocks/cta.js';
import { Footer } from '../src/blocks/footer.js';

let cleanup;

before(() => {
  const env = createDOM();
  cleanup = env.cleanup;
});

after(() => {
  if (cleanup) cleanup();
});

beforeEach(() => {
  resetBlockBase();
  document.body.innerHTML = '';
  document.head.querySelectorAll('[data-decantr-blocks]').forEach(el => el.remove());
});

describe('Hero', () => {
  it('renders headline and description', () => {
    const el = Hero({ headline: 'Hello', description: 'World' });
    assert.ok(el.classList.contains('d-hero'));
    assert.ok(el.querySelector('.d-hero-headline'));
    assert.equal(el.querySelector('.d-hero-headline').textContent, 'Hello');
    assert.ok(el.querySelector('.d-hero-desc'));
    assert.equal(el.querySelector('.d-hero-desc').textContent, 'World');
  });

  it('renders CTA buttons', () => {
    const el = Hero({
      headline: 'Test',
      cta: { label: 'Primary' },
      ctaSecondary: { label: 'Secondary' }
    });
    const actions = el.querySelector('.d-hero-actions');
    assert.ok(actions);
    const buttons = actions.querySelectorAll('.d-btn');
    assert.equal(buttons.length, 2);
  });

  it('applies left alignment class', () => {
    const el = Hero({ headline: 'Test', align: 'left' });
    assert.ok(el.classList.contains('d-hero-left'));
  });

  it('renders image slot', () => {
    const img = document.createElement('img');
    const el = Hero({ headline: 'Test', image: img });
    assert.ok(el.querySelector('.d-hero-image'));
  });

  it('applies custom class', () => {
    const el = Hero({ headline: 'Test', class: 'my-hero' });
    assert.ok(el.classList.contains('my-hero'));
  });
});

describe('Features', () => {
  it('renders feature items in grid', () => {
    const el = Features({
      items: [
        { title: 'Fast', description: 'Very fast' },
        { title: 'Secure', description: 'Very secure' }
      ]
    });
    assert.ok(el.classList.contains('d-features'));
    const items = el.querySelectorAll('.d-feature-item');
    assert.equal(items.length, 2);
  });

  it('applies column class', () => {
    const el = Features({ items: [{ title: 'A', description: 'B' }], columns: 4 });
    assert.ok(el.classList.contains('d-features-4'));
  });

  it('renders icon when provided', () => {
    const el = Features({
      items: [{ icon: 'rocket', title: 'Launch', description: 'Go' }]
    });
    assert.ok(el.querySelector('.d-feature-icon'));
  });

  it('defaults to 3 columns', () => {
    const el = Features({ items: [] });
    assert.ok(el.classList.contains('d-features-3'));
  });
});

describe('Pricing', () => {
  it('renders plan cards', () => {
    const el = Pricing({
      plans: [
        { name: 'Free', price: '$0', features: ['Feature 1'] },
        { name: 'Pro', price: '$10', period: 'mo', features: ['Feature 1', 'Feature 2'], highlighted: true }
      ]
    });
    assert.ok(el.classList.contains('d-pricing'));
    const cards = el.querySelectorAll('.d-pricing-card');
    assert.equal(cards.length, 2);
  });

  it('renders highlighted plan with class', () => {
    const el = Pricing({
      plans: [{ name: 'Pro', price: '$10', features: [], highlighted: true }]
    });
    assert.ok(el.querySelector('.d-pricing-highlighted'));
  });

  it('renders price period', () => {
    const el = Pricing({
      plans: [{ name: 'Pro', price: '$10', period: 'mo', features: [] }]
    });
    assert.ok(el.querySelector('.d-pricing-period'));
    assert.equal(el.querySelector('.d-pricing-period').textContent, '/mo');
  });

  it('renders CTA button', () => {
    const el = Pricing({
      plans: [{ name: 'Pro', price: '$10', features: [], cta: { label: 'Buy' } }]
    });
    assert.ok(el.querySelector('.d-pricing-cta'));
    assert.ok(el.querySelector('.d-btn'));
  });
});

describe('Testimonials', () => {
  it('renders testimonial cards', () => {
    const el = Testimonials({
      items: [
        { quote: 'Great product!', author: 'Jane Doe', role: 'CEO' },
        { quote: 'Love it!', author: 'John Smith' }
      ]
    });
    assert.ok(el.classList.contains('d-testimonials'));
    const quotes = el.querySelectorAll('.d-testimonial-quote');
    assert.equal(quotes.length, 2);
  });

  it('renders author info', () => {
    const el = Testimonials({
      items: [{ quote: 'Nice', author: 'Alice', role: 'Engineer' }]
    });
    assert.ok(el.querySelector('.d-testimonial-name'));
    assert.equal(el.querySelector('.d-testimonial-name').textContent, 'Alice');
    assert.ok(el.querySelector('.d-testimonial-role'));
    assert.equal(el.querySelector('.d-testimonial-role').textContent, 'Engineer');
  });

  it('renders avatar when provided', () => {
    const el = Testimonials({
      items: [{ quote: 'Nice', author: 'Bob', avatar: 'https://example.com/bob.jpg' }]
    });
    assert.ok(el.querySelector('.d-avatar'));
  });
});

describe('CTA', () => {
  it('renders headline and description', () => {
    const el = CTA({ headline: 'Get Started', description: 'Join today' });
    assert.ok(el.classList.contains('d-cta'));
    assert.equal(el.querySelector('.d-cta-headline').textContent, 'Get Started');
    assert.equal(el.querySelector('.d-cta-desc').textContent, 'Join today');
  });

  it('renders action button', () => {
    const el = CTA({ headline: 'Go', cta: { label: 'Sign Up' } });
    assert.ok(el.querySelector('.d-cta-action'));
    assert.ok(el.querySelector('.d-btn'));
  });

  it('applies highlight variant', () => {
    const el = CTA({ headline: 'Go', variant: 'highlight' });
    assert.ok(el.classList.contains('d-cta-highlight'));
  });

  it('applies custom class', () => {
    const el = CTA({ headline: 'Go', class: 'custom' });
    assert.ok(el.classList.contains('custom'));
  });
});

describe('Footer', () => {
  it('renders columns with links', () => {
    const el = Footer({
      columns: [
        { title: 'Product', links: [{ label: 'Features', href: '/features' }] },
        { title: 'Company', links: [{ label: 'About', href: '/about' }] }
      ]
    });
    assert.equal(el.tagName.toLowerCase(), 'footer');
    assert.ok(el.classList.contains('d-footer'));
    const cols = el.querySelectorAll('.d-footer-column');
    assert.equal(cols.length, 2);
  });

  it('renders links as anchors when href provided', () => {
    const el = Footer({
      columns: [{ title: 'Nav', links: [{ label: 'Home', href: '/' }] }]
    });
    const link = el.querySelector('.d-footer-link');
    assert.equal(link.tagName.toLowerCase(), 'a');
    assert.equal(link.getAttribute('href'), '/');
  });

  it('renders links as spans when no href', () => {
    const el = Footer({
      columns: [{ title: 'Nav', links: [{ label: 'Click me' }] }]
    });
    const link = el.querySelector('.d-footer-link');
    assert.equal(link.tagName.toLowerCase(), 'span');
  });

  it('renders copyright', () => {
    const el = Footer({ copyright: '2026 decantr' });
    assert.ok(el.querySelector('.d-footer-copyright'));
    assert.equal(el.querySelector('.d-footer-copyright').textContent, '2026 decantr');
  });

  it('applies custom class', () => {
    const el = Footer({ class: 'my-footer' });
    assert.ok(el.classList.contains('my-footer'));
  });
});

describe('Block CSS injection', () => {
  it('injects block base CSS on first render', () => {
    Hero({ headline: 'Test' });
    const style = document.querySelector('[data-decantr-blocks]');
    assert.ok(style);
    assert.ok(style.textContent.includes('.d-hero'));
    assert.ok(style.textContent.includes('.d-pricing'));
    assert.ok(style.textContent.includes('.d-footer'));
  });
});
