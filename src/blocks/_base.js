/**
 * Base structural CSS for content blocks.
 * Injected once on first block render.
 */

let injected = false;

const BLOCK_CSS = [
  // Hero
  '.d-hero{padding:var(--d-sp-16) var(--d-sp-8);text-align:center}',
  '.d-hero-left{text-align:left}',
  '.d-hero-content{max-width:48rem;margin:0 auto}',
  '.d-hero-headline{font-size:var(--d-text-4xl);font-weight:var(--d-fw-heading);line-height:var(--d-lh-tight);margin:0 0 var(--d-sp-4)}',
  '.d-hero-desc{font-size:var(--d-text-lg);line-height:var(--d-lh-relaxed);margin:0 0 var(--d-sp-8)}',
  '.d-hero-actions{display:flex;gap:var(--d-sp-3);justify-content:center;flex-wrap:wrap}',
  '.d-hero-left .d-hero-actions{justify-content:flex-start}',
  '.d-hero-image{margin-top:var(--d-sp-8);max-width:100%}',

  // Features
  '.d-features{display:grid;gap:var(--d-sp-6);padding:var(--d-sp-12) var(--d-sp-8)}',
  '.d-features-2{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}',
  '.d-features-3{grid-template-columns:repeat(auto-fit,minmax(250px,1fr))}',
  '.d-features-4{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}',
  '.d-feature-item{padding:var(--d-sp-6)}',
  '.d-feature-icon{font-size:var(--d-text-2xl);margin-bottom:var(--d-sp-3)}',
  '.d-feature-title{font-size:var(--d-text-md);font-weight:var(--d-fw-title);margin:0 0 var(--d-sp-2)}',
  '.d-feature-desc{font-size:var(--d-text-base);line-height:var(--d-lh-normal);margin:0}',

  // Pricing
  '.d-pricing{display:flex;gap:var(--d-sp-6);padding:var(--d-sp-12) var(--d-sp-8);justify-content:center;flex-wrap:wrap;align-items:stretch}',
  '.d-pricing-card{flex:1;min-width:250px;max-width:340px;display:flex;flex-direction:column}',
  '.d-pricing-header{padding:var(--d-sp-6);text-align:center}',
  '.d-pricing-name{font-size:var(--d-text-md);font-weight:var(--d-fw-title);margin:0 0 var(--d-sp-2)}',
  '.d-pricing-price{font-size:var(--d-text-4xl);font-weight:var(--d-fw-heading);line-height:var(--d-lh-none)}',
  '.d-pricing-period{font-size:var(--d-text-base);font-weight:400}',
  '.d-pricing-features{padding:0 var(--d-sp-6);flex:1}',
  '.d-pricing-features ul{list-style:none;margin:0;padding:0}',
  '.d-pricing-features li{padding:0.375rem 0;font-size:var(--d-text-base)}',
  '.d-pricing-features li::before{content:"\\2713 ";font-weight:700}',
  '.d-pricing-cta{padding:var(--d-sp-6);text-align:center}',
  '.d-pricing-highlighted{transform:scale(1.05);z-index:1}',

  // Testimonials
  '.d-testimonials{display:grid;gap:var(--d-sp-6);padding:var(--d-sp-12) var(--d-sp-8);grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}',
  '.d-testimonial{padding:var(--d-sp-6)}',
  '.d-testimonial-quote{font-size:0.9375rem;line-height:var(--d-lh-relaxed);margin:0 0 var(--d-sp-4);font-style:italic}',
  '.d-testimonial-quote::before{content:"\\201C"}',
  '.d-testimonial-quote::after{content:"\\201D"}',
  '.d-testimonial-author{display:flex;align-items:center;gap:var(--d-sp-3)}',
  '.d-testimonial-name{font-size:var(--d-text-base);font-weight:var(--d-fw-title)}',
  '.d-testimonial-role{font-size:var(--d-text-sm)}',

  // CTA
  '.d-cta{padding:var(--d-sp-16) var(--d-sp-8);text-align:center}',
  '.d-cta-content{max-width:36rem;margin:0 auto}',
  '.d-cta-headline{font-size:1.75rem;font-weight:var(--d-fw-heading);margin:0 0 var(--d-sp-3)}',
  '.d-cta-desc{font-size:var(--d-text-md);line-height:var(--d-lh-normal);margin:0 0 var(--d-sp-6)}',
  '.d-cta-action{display:flex;gap:var(--d-sp-3);justify-content:center}',

  // Footer
  '.d-footer{padding:var(--d-sp-12) var(--d-sp-8) var(--d-sp-6)}',
  '.d-footer-columns{display:flex;gap:var(--d-sp-12);flex-wrap:wrap;margin-bottom:var(--d-sp-8)}',
  '.d-footer-column{min-width:150px}',
  '.d-footer-column-title{font-size:var(--d-text-base);font-weight:var(--d-fw-title);margin:0 0 var(--d-sp-3)}',
  '.d-footer-column ul{list-style:none;margin:0;padding:0}',
  '.d-footer-link{display:block;font-size:0.8125rem;text-decoration:none;padding:var(--d-sp-1) 0}',
  '.d-footer-copyright{font-size:var(--d-text-sm);padding-top:var(--d-sp-6)}',

  // ProfileHero
  '.d-profile-hero{padding:var(--d-sp-16) var(--d-sp-8);text-align:center}',
  '.d-profile-hero-content{max-width:48rem;margin:0 auto}',
  '.d-profile-hero-status{display:inline-flex;align-items:center;gap:var(--d-sp-2);margin-bottom:var(--d-sp-6)}',
  '.d-profile-hero-name{font-size:2.75rem;font-weight:var(--d-fw-heading);line-height:var(--d-lh-tight);margin:0 0 var(--d-sp-4)}',
  '.d-profile-hero-subtitle{font-size:var(--d-text-xl);line-height:var(--d-lh-normal);margin:0 0 var(--d-sp-8)}',
  '.d-profile-hero-actions{display:flex;gap:var(--d-sp-3);justify-content:center;flex-wrap:wrap}',
  '.d-profile-hero-about{display:flex;align-items:flex-start;gap:var(--d-sp-8);text-align:left}',
  '.d-profile-hero-bio{font-size:var(--d-text-md);line-height:1.7;margin:0 0 var(--d-sp-6)}',
  '.d-profile-hero-contact{display:flex;gap:var(--d-sp-6);flex-wrap:wrap}',
  '.d-profile-hero-contact-item{display:flex;align-items:center;gap:var(--d-sp-2);font-size:var(--d-text-base)}',

  // ExpertiseGrid
  '.d-expertise-grid{padding:var(--d-sp-12) var(--d-sp-8)}',
  '.d-expertise-grid-title{font-size:var(--d-text-2xl);font-weight:var(--d-fw-heading);margin:0 0 var(--d-sp-6);text-align:center}',
  '.d-expertise-grid-items{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--d-sp-4)}',
  '.d-expertise-item{display:flex;align-items:center;gap:var(--d-sp-3);padding:var(--d-sp-3) var(--d-sp-4)}',
  '.d-expertise-item-icon{font-size:var(--d-text-xl);flex-shrink:0}',
  '.d-expertise-item-name{font-size:var(--d-text-base);font-weight:var(--d-fw-title)}',
  '.d-expertise-item-level{font-size:var(--d-text-sm);margin-top:0.125rem}',

  // StatsRow
  '.d-stats-row{display:flex;gap:var(--d-sp-6);padding:var(--d-sp-12) var(--d-sp-8);justify-content:center;flex-wrap:wrap}',
  '.d-stats-row-title{width:100%;font-size:var(--d-text-2xl);font-weight:var(--d-fw-heading);text-align:center;margin:0 0 var(--d-sp-2)}',
  '.d-stat-card{flex:1;min-width:180px;max-width:300px;padding:var(--d-sp-6);text-align:center}',
  '.d-stat-value{font-size:var(--d-text-3xl);font-weight:var(--d-fw-heading);line-height:var(--d-lh-none)}',
  '.d-stat-label{font-size:var(--d-text-base);margin-top:var(--d-sp-2)}',

  // IdentityGrid
  '.d-identity-grid{padding:var(--d-sp-12) var(--d-sp-8)}',
  '.d-identity-grid-title{font-size:var(--d-text-2xl);font-weight:var(--d-fw-heading);margin:0 0 var(--d-sp-6);text-align:center}',
  '.d-identity-grid-items{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:var(--d-sp-6)}',
  '.d-identity-card{padding:var(--d-sp-6)}',
  '.d-identity-card-icon{font-size:var(--d-text-2xl);margin-bottom:var(--d-sp-3)}',
  '.d-identity-card-title{font-size:var(--d-text-md);font-weight:var(--d-fw-title);margin:0 0 var(--d-sp-2)}',
  '.d-identity-card-desc{font-size:var(--d-text-base);line-height:var(--d-lh-normal);margin:0 0 var(--d-sp-3)}',
  '.d-identity-card-quote{font-size:0.8125rem;font-style:italic;line-height:var(--d-lh-normal);margin:0}',

  // SkillCategories
  '.d-skill-categories{padding:var(--d-sp-12) var(--d-sp-8)}',
  '.d-skill-categories-title{font-size:var(--d-text-2xl);font-weight:var(--d-fw-heading);margin:0 0 var(--d-sp-6);text-align:center}',
  '.d-skill-categories-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:var(--d-sp-6)}',
  '.d-skill-category{padding:var(--d-sp-6)}',
  '.d-skill-category-name{font-size:var(--d-text-md);font-weight:var(--d-fw-title);margin:0 0 var(--d-sp-4)}',
  '.d-skill-category-list{list-style:none;margin:0;padding:0}',
  '.d-skill-category-item{padding:0.375rem 0;font-size:var(--d-text-base);display:flex;align-items:center;gap:var(--d-sp-2)}',

  // CertificationRow
  '.d-cert-row{padding:var(--d-sp-12) var(--d-sp-8)}',
  '.d-cert-row-title{font-size:var(--d-text-2xl);font-weight:var(--d-fw-heading);margin:0 0 var(--d-sp-6);text-align:center}',
  '.d-cert-row-items{display:flex;gap:var(--d-sp-4);justify-content:center;flex-wrap:wrap}',
  '.d-cert-pill{display:inline-flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-2) var(--d-sp-4);font-size:var(--d-text-base);font-weight:500}',

  // Timeline
  '.d-timeline{padding:var(--d-sp-12) var(--d-sp-8)}',
  '.d-timeline-title{font-size:var(--d-text-2xl);font-weight:var(--d-fw-heading);margin:0 0 var(--d-sp-8);text-align:center}',
  '.d-timeline-list{position:relative;padding-left:var(--d-sp-8)}',
  '.d-timeline-list::before{content:"";position:absolute;left:var(--d-sp-2);top:0;bottom:0;width:2px;background:var(--c5)}',
  '.d-timeline-item{position:relative;padding:0 0 var(--d-sp-8) var(--d-sp-6)}',
  '.d-timeline-dot{position:absolute;left:-1.75rem;top:var(--d-sp-1);width:var(--d-sp-3);height:var(--d-sp-3);border-radius:50%;background:var(--c1)}',
  '.d-timeline-period{font-size:var(--d-text-sm);font-weight:var(--d-fw-title);margin:0 0 var(--d-sp-1)}',
  '.d-timeline-role{font-size:var(--d-text-md);font-weight:var(--d-fw-title);margin:0 0 var(--d-sp-1)}',
  '.d-timeline-company{font-size:var(--d-text-base);margin:0 0 var(--d-sp-2)}',
  '.d-timeline-desc{font-size:0.8125rem;line-height:var(--d-lh-normal);margin:0}',

  // ProjectGrid
  '.d-project-grid{padding:var(--d-sp-12) var(--d-sp-8)}',
  '.d-project-grid-title{font-size:var(--d-text-2xl);font-weight:var(--d-fw-heading);margin:0 0 var(--d-sp-6);text-align:center}',
  '.d-project-grid-items{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:var(--d-sp-6)}',
  '.d-project-card{padding:var(--d-sp-6);display:flex;flex-direction:column}',
  '.d-project-card-header{display:flex;align-items:center;gap:var(--d-sp-3);margin-bottom:var(--d-sp-3)}',
  '.d-project-card-icon{font-size:var(--d-text-xl)}',
  '.d-project-card-name{font-size:var(--d-text-md);font-weight:var(--d-fw-title);margin:0}',
  '.d-project-card-desc{font-size:var(--d-text-base);line-height:var(--d-lh-normal);margin:0 0 var(--d-sp-4);flex:1}',
  '.d-project-card-tags{display:flex;gap:var(--d-sp-2);flex-wrap:wrap;margin-bottom:var(--d-sp-4)}',
  '.d-project-card-metrics{display:flex;gap:var(--d-sp-4);margin-bottom:var(--d-sp-4);font-size:0.8125rem}',
  '.d-project-card-metric{display:flex;align-items:center;gap:var(--d-sp-1)}',
  '.d-project-card-links{display:flex;gap:var(--d-sp-3);margin-top:auto}',

  // TechGrid
  '.d-tech-grid{padding:var(--d-sp-12) var(--d-sp-8)}',
  '.d-tech-grid-title{font-size:var(--d-text-2xl);font-weight:var(--d-fw-heading);margin:0 0 var(--d-sp-6);text-align:center}',
  '.d-tech-grid-items{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:var(--d-sp-4)}',
  '.d-tech-item{display:flex;flex-direction:column;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-4);text-align:center}',
  '.d-tech-item-icon{font-size:var(--d-text-2xl)}',
  '.d-tech-item-name{font-size:0.8125rem;font-weight:500}',

  // HobbyGrid
  '.d-hobby-grid{padding:var(--d-sp-12) var(--d-sp-8)}',
  '.d-hobby-grid-title{font-size:var(--d-text-2xl);font-weight:var(--d-fw-heading);margin:0 0 var(--d-sp-6);text-align:center}',
  '.d-hobby-grid-items{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:var(--d-sp-6)}',
  '.d-hobby-card{padding:var(--d-sp-6)}',
  '.d-hobby-card-icon{font-size:var(--d-text-3xl);margin-bottom:var(--d-sp-4)}',
  '.d-hobby-card-name{font-size:var(--d-text-lg);font-weight:var(--d-fw-title);margin:0 0 var(--d-sp-2)}',
  '.d-hobby-card-desc{font-size:var(--d-text-base);line-height:var(--d-lh-normal);margin:0 0 var(--d-sp-4)}',
  '.d-hobby-card-stats{display:flex;gap:var(--d-sp-4);flex-wrap:wrap;margin-bottom:var(--d-sp-3);font-size:0.8125rem}',
  '.d-hobby-card-tags{display:flex;gap:var(--d-sp-2);flex-wrap:wrap}',

  // PhotoGallery
  '.d-photo-gallery{padding:var(--d-sp-12) var(--d-sp-8)}',
  '.d-photo-gallery-title{font-size:var(--d-text-2xl);font-weight:var(--d-fw-heading);margin:0 0 var(--d-sp-6);text-align:center}',
  '.d-photo-gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--d-sp-4)}',
  '.d-photo-gallery-item{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:var(--d-text-base)}',

  // ContactSplit
  '.d-contact-split{padding:var(--d-sp-12) var(--d-sp-8)}',
  '.d-contact-split-title{font-size:var(--d-text-2xl);font-weight:var(--d-fw-heading);margin:0 0 var(--d-sp-6);text-align:center}',
  '.d-contact-split-layout{display:grid;grid-template-columns:1fr 1fr;gap:var(--d-sp-8)}',
  '@media(max-width:768px){.d-contact-split-layout{grid-template-columns:1fr}}',
  '.d-contact-split-form{display:flex;flex-direction:column;gap:var(--d-sp-4)}',
  '.d-contact-split-field label{display:block;font-size:var(--d-text-base);font-weight:500;margin-bottom:0.375rem}',
  '.d-contact-split-info{display:flex;flex-direction:column;gap:var(--d-sp-6)}',
  '.d-contact-split-methods{display:flex;flex-direction:column;gap:var(--d-sp-4)}',
  '.d-contact-split-method{display:flex;align-items:center;gap:var(--d-sp-3);font-size:var(--d-text-base)}',
  '.d-contact-split-cards{display:flex;flex-direction:column;gap:var(--d-sp-4)}',
  '.d-contact-split-card{padding:var(--d-sp-4);font-size:var(--d-text-base)}',

  // SocialSidebar
  '.d-social-sidebar{position:fixed;left:var(--d-sp-4);top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:var(--d-sp-3);z-index:40}',
  '.d-social-sidebar a{display:flex;align-items:center;justify-content:center;width:2.25rem;height:2.25rem;border-radius:50%;text-decoration:none;transition:transform 0.2s ease}',
  '.d-social-sidebar a:hover{transform:scale(1.15)}',
  '@media(max-width:768px){.d-social-sidebar{display:none}}'
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
