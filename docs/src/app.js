import { setStyle, setMode, css } from 'decantr/css';
import { mount } from 'decantr/core';
import { tags } from 'decantr/tags';
import { docsSiteCSS } from './style.js';
import { HeroSection } from './sections/hero.js';
import { PowerSection } from './sections/power.js';
import { FeaturesSection } from './sections/features.js';
import { QuotesSection } from './sections/quotes.js';
import { PhilosophySection } from './sections/philosophy.js';
import { SiteFooter } from './sections/footer.js';

setStyle('auradecantism');
setMode('dark');

// Inject docs-specific CSS extras (animations, utilities, chart overrides)
const docsStyle = document.createElement('style');
docsStyle.setAttribute('data-decantr-docs', '');
docsStyle.textContent = docsSiteCSS;
document.head.appendChild(docsStyle);

const { div } = tags;

function App() {
  return div({ class: css('_flex _col') },
    HeroSection(),
    PowerSection(),
    FeaturesSection(),
    QuotesSection(),
    PhilosophySection(),
    SiteFooter(),
  );
}

const root = document.getElementById('app');
mount(root, App);
root.classList.add('ds-ready');

// Scroll-triggered reveal animations
if (typeof IntersectionObserver !== 'undefined') {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('ds-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.ds-reveal').forEach((el) => observer.observe(el));
}
