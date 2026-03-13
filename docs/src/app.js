import { setStyle, setMode } from 'decantr/css';
import { mount } from 'decantr/core';
import { tags } from 'decantr/tags';
import { createRouter } from 'decantr/router';
import { docsSiteCSS } from './style.js';
import { NavHeader } from './components/nav-header.js';
import { HomePage } from './pages/home.js';
import { HowItWorksPage } from './pages/how-it-works.js';

setStyle('auradecantism');
setMode('dark');

// Inject docs-specific CSS extras (animations, utilities, chart overrides)
const docsStyle = document.createElement('style');
docsStyle.setAttribute('data-decantr-docs', '');
docsStyle.textContent = docsSiteCSS;
document.head.appendChild(docsStyle);

const { div } = tags;

// Scroll-triggered reveal animations
function setupScrollReveal() {
  if (typeof IntersectionObserver === 'undefined') return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('ds-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.ds-reveal:not(.ds-visible)').forEach((el) => observer.observe(el));
}

const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: HomePage },
    { path: '/how-it-works', component: HowItWorksPage },
  ],
  scrollBehavior: 'top',
  afterEach: () => requestAnimationFrame(setupScrollReveal),
});

function App() {
  return div({ class: '_flex _col' },
    NavHeader(),
    router.outlet(),
  );
}

const root = document.getElementById('app');
mount(root, App);
root.classList.add('ds-ready');

// Initial scroll reveal setup
requestAnimationFrame(setupScrollReveal);
