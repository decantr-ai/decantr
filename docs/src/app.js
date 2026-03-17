import { setStyle, setMode } from 'decantr/css';
import { mount } from 'decantr/core';
import { tags } from 'decantr/tags';
import { createRouter } from 'decantr/router';
import { docsSiteCSS } from './style.js';
import { HomePage } from './pages/home.js';

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

// Lazy-load pages
const lazyDocsHome = () => import('./pages/docs-home.js').then(m => m.DocsHomePage);
const lazyTutorial = () => import('./pages/tutorial.js').then(m => m.TutorialPage);
const lazyCookbook = () => import('./pages/cookbook.js').then(m => m.CookbookPage);
const lazyExplorer = () => import('./pages/explorer-page.js').then(m => m.ExplorerPage);
const lazyGallery = () => import('./pages/gallery.js').then(m => m.GalleryPage);

const router = createRouter({
  mode: 'hash',
  routes: [
    // Landing page
    { path: '/', component: HomePage },

    // Documentation
    { path: '/docs', component: lazyDocsHome },
    { path: '/docs/tutorial/:step', component: lazyTutorial },
    { path: '/docs/cookbook/:recipe', component: lazyCookbook },

    // Showcase gallery
    { path: '/gallery', component: lazyGallery },

    // Unified explorer (replaces both /workbench and /docs/{section} routes)
    { path: '/explorer', component: lazyExplorer },
    { path: '/explorer/:section', component: lazyExplorer },
    { path: '/explorer/:section/:group', component: lazyExplorer },
    { path: '/explorer/:section/:group/:item', component: lazyExplorer },
  ],
  scrollBehavior: 'top',
  afterEach: (to) => {
    const path = to.path;

    if (path === '/') {
      document.title = 'decantr — Describe it. Build it. Ship it.';
    } else if (path === '/gallery') {
      document.title = 'Showcase Gallery — decantr';
    } else if (path.startsWith('/explorer')) {
      const section = path.split('/')[2];
      if (section) {
        const name = section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ');
        document.title = `${name} — decantr explorer`;
      } else {
        document.title = 'Explorer — decantr';
      }
    } else if (path.startsWith('/docs')) {
      const base = path.split('/')[2];
      if (base) {
        const name = base.charAt(0).toUpperCase() + base.slice(1).replace(/-/g, ' ');
        document.title = `${name} — decantr docs`;
      } else {
        document.title = 'Documentation — decantr';
      }
    } else {
      document.title = 'decantr';
    }

    requestAnimationFrame(setupScrollReveal);
  },
});

function App() {
  return div(router.outlet());
}

const root = document.getElementById('app');
mount(root, App);
root.classList.add('ds-ready');

// Initial scroll reveal setup
requestAnimationFrame(setupScrollReveal);
