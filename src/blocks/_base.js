/**
 * Base structural CSS for content blocks.
 * Injected once on first block render.
 */

let injected = false;

const BLOCK_CSS = [
  // Hero
  '.d-hero{padding:4rem 2rem;text-align:center}',
  '.d-hero-left{text-align:left}',
  '.d-hero-content{max-width:48rem;margin:0 auto}',
  '.d-hero-headline{font-size:2.5rem;font-weight:800;line-height:1.1;margin:0 0 1rem}',
  '.d-hero-desc{font-size:1.125rem;line-height:1.6;margin:0 0 2rem}',
  '.d-hero-actions{display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap}',
  '.d-hero-left .d-hero-actions{justify-content:flex-start}',
  '.d-hero-image{margin-top:2rem;max-width:100%}',

  // Features
  '.d-features{display:grid;gap:1.5rem;padding:3rem 2rem}',
  '.d-features-2{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}',
  '.d-features-3{grid-template-columns:repeat(auto-fit,minmax(250px,1fr))}',
  '.d-features-4{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}',
  '.d-feature-item{padding:1.5rem}',
  '.d-feature-icon{font-size:1.5rem;margin-bottom:0.75rem}',
  '.d-feature-title{font-size:1rem;font-weight:600;margin:0 0 0.5rem}',
  '.d-feature-desc{font-size:0.875rem;line-height:1.5;margin:0}',

  // Pricing
  '.d-pricing{display:flex;gap:1.5rem;padding:3rem 2rem;justify-content:center;flex-wrap:wrap;align-items:stretch}',
  '.d-pricing-card{flex:1;min-width:250px;max-width:340px;display:flex;flex-direction:column}',
  '.d-pricing-header{padding:1.5rem;text-align:center}',
  '.d-pricing-name{font-size:1rem;font-weight:600;margin:0 0 0.5rem}',
  '.d-pricing-price{font-size:2.5rem;font-weight:800;line-height:1}',
  '.d-pricing-period{font-size:0.875rem;font-weight:400}',
  '.d-pricing-features{padding:0 1.5rem;flex:1}',
  '.d-pricing-features ul{list-style:none;margin:0;padding:0}',
  '.d-pricing-features li{padding:0.375rem 0;font-size:0.875rem}',
  '.d-pricing-features li::before{content:"\\2713 ";font-weight:700}',
  '.d-pricing-cta{padding:1.5rem;text-align:center}',
  '.d-pricing-highlighted{transform:scale(1.05);z-index:1}',

  // Testimonials
  '.d-testimonials{display:grid;gap:1.5rem;padding:3rem 2rem;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}',
  '.d-testimonial{padding:1.5rem}',
  '.d-testimonial-quote{font-size:0.9375rem;line-height:1.6;margin:0 0 1rem;font-style:italic}',
  '.d-testimonial-quote::before{content:"\\201C"}',
  '.d-testimonial-quote::after{content:"\\201D"}',
  '.d-testimonial-author{display:flex;align-items:center;gap:0.75rem}',
  '.d-testimonial-name{font-size:0.875rem;font-weight:600}',
  '.d-testimonial-role{font-size:0.75rem}',

  // CTA
  '.d-cta{padding:4rem 2rem;text-align:center}',
  '.d-cta-content{max-width:36rem;margin:0 auto}',
  '.d-cta-headline{font-size:1.75rem;font-weight:700;margin:0 0 0.75rem}',
  '.d-cta-desc{font-size:1rem;line-height:1.5;margin:0 0 1.5rem}',
  '.d-cta-action{display:flex;gap:0.75rem;justify-content:center}',

  // Footer
  '.d-footer{padding:3rem 2rem 1.5rem}',
  '.d-footer-columns{display:flex;gap:3rem;flex-wrap:wrap;margin-bottom:2rem}',
  '.d-footer-column{min-width:150px}',
  '.d-footer-column-title{font-size:0.875rem;font-weight:600;margin:0 0 0.75rem}',
  '.d-footer-column ul{list-style:none;margin:0;padding:0}',
  '.d-footer-link{display:block;font-size:0.8125rem;text-decoration:none;padding:0.25rem 0}',
  '.d-footer-copyright{font-size:0.75rem;padding-top:1.5rem}'
].join('');

export function injectBlockBase() {
  if (injected) return;
  if (typeof document === 'undefined') return;
  injected = true;
  let el = document.querySelector('[data-decantr-blocks]');
  if (!el) {
    el = document.createElement('style');
    el.setAttribute('data-decantr-blocks', '');
    document.head.appendChild(el);
  }
  el.textContent = BLOCK_CSS;
}

export function resetBlockBase() {
  injected = false;
}
