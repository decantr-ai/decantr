import { h } from '../core/index.js';
import { Button } from '../components/button.js';
import { injectBlockBase } from './_base.js';

/**
 * @param {Object} [props]
 * @param {string} props.headline
 * @param {string} [props.description]
 * @param {{ label: string, onclick?: Function, variant?: string }} [props.cta]
 * @param {{ label: string, onclick?: Function, variant?: string }} [props.ctaSecondary]
 * @param {Node} [props.image]
 * @param {string} [props.align] - center|left (default: center)
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Hero(props = {}) {
  injectBlockBase();

  const { headline, description, cta, ctaSecondary, image, align = 'center', class: cls } = props;

  const content = h('div', { class: 'd-hero-content' });

  content.appendChild(h('h1', { class: 'd-hero-headline' }, headline));

  if (description) {
    content.appendChild(h('p', { class: 'd-hero-desc' }, description));
  }

  if (cta || ctaSecondary) {
    const actions = h('div', { class: 'd-hero-actions' });
    if (cta) {
      actions.appendChild(Button({ variant: cta.variant || 'primary', size: 'lg', onclick: cta.onclick }, cta.label));
    }
    if (ctaSecondary) {
      actions.appendChild(Button({ variant: ctaSecondary.variant || 'outline', size: 'lg', onclick: ctaSecondary.onclick }, ctaSecondary.label));
    }
    content.appendChild(actions);
  }

  const section = h('section', { class: `d-hero${align === 'left' ? ' d-hero-left' : ''}${cls ? ' ' + cls : ''}` }, content);

  if (image) {
    const imgWrap = h('div', { class: 'd-hero-image' }, image);
    section.appendChild(imgWrap);
  }

  return section;
}
