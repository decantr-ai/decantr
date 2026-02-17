import { h } from '../core/index.js';
import { Card } from '../components/card.js';
import { Button } from '../components/button.js';
import { injectBlockBase } from './_base.js';

/**
 * @param {Object} [props]
 * @param {{ name: string, price: string, period?: string, features: string[], cta?: { label: string, onclick?: Function, variant?: string }, highlighted?: boolean }[]} props.plans
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Pricing(props = {}) {
  injectBlockBase();

  const { plans = [], class: cls } = props;

  const section = h('section', { class: `d-pricing${cls ? ' ' + cls : ''}` });

  for (const plan of plans) {
    const cardClass = `d-pricing-card${plan.highlighted ? ' d-pricing-highlighted' : ''}`;
    const card = Card({ hoverable: true, class: cardClass });

    // Header
    const header = h('div', { class: 'd-pricing-header' },
      h('div', { class: 'd-pricing-name' }, plan.name),
      h('div', { class: 'd-pricing-price' },
        plan.price,
        plan.period ? h('span', { class: 'd-pricing-period' }, `/${plan.period}`) : null
      )
    );
    card.appendChild(header);

    // Features
    if (plan.features && plan.features.length) {
      const ul = h('ul', null, ...plan.features.map(f => h('li', null, f)));
      card.appendChild(h('div', { class: 'd-pricing-features' }, ul));
    }

    // CTA
    if (plan.cta) {
      const ctaBtn = Button({
        variant: plan.cta.variant || (plan.highlighted ? 'primary' : 'outline'),
        block: true,
        onclick: plan.cta.onclick
      }, plan.cta.label);
      card.appendChild(h('div', { class: 'd-pricing-cta' }, ctaBtn));
    }

    section.appendChild(card);
  }

  return section;
}
