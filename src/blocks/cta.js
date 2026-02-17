import { h } from '../core/index.js';
import { Button } from '../components/button.js';
import { injectBlockBase } from './_base.js';

/**
 * @param {Object} [props]
 * @param {string} props.headline
 * @param {string} [props.description]
 * @param {{ label: string, onclick?: Function, variant?: string }} [props.cta]
 * @param {string} [props.variant] - default|highlight
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function CTA(props = {}) {
  injectBlockBase();

  const { headline, description, cta, variant = 'default', class: cls } = props;

  const content = h('div', { class: 'd-cta-content' });

  content.appendChild(h('h2', { class: 'd-cta-headline' }, headline));

  if (description) {
    content.appendChild(h('p', { class: 'd-cta-desc' }, description));
  }

  if (cta) {
    const action = h('div', { class: 'd-cta-action' },
      Button({ variant: cta.variant || 'primary', size: 'lg', onclick: cta.onclick }, cta.label)
    );
    content.appendChild(action);
  }

  return h('section', {
    class: `d-cta${variant === 'highlight' ? ' d-cta-highlight' : ''}${cls ? ' ' + cls : ''}`
  }, content);
}
