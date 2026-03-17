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

// Lazy-load doc pages
const lazyDocsHome = () => import('./pages/docs-home.js').then(m => m.DocsHomePage);
const lazyTutorial = () => import('./pages/tutorial.js').then(m => m.TutorialPage);
const lazyCookbook = () => import('./pages/cookbook.js').then(m => m.CookbookPage);
const lazyGallery = () => import('./pages/gallery.js').then(m => m.GalleryPage);
const lazyExplorer = () => import('./pages/explorer.js').then(m => m.ExplorerPage);
const lazyWorkbench = () => import('./pages/workbench.js').then(m => m.WorkbenchPage);

const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: HomePage },
    {
      path: '/docs',
      component: lazyDocsHome,
    },
    { path: '/docs/tutorial/:step', component: lazyTutorial },
    { path: '/docs/cookbook/:recipe', component: lazyCookbook },
    { path: '/docs/components', component: lazyGallery },
    { path: '/docs/components/:id', component: lazyGallery },
    // Explorer sections — all handled by generic explorer page
    { path: '/docs/patterns', component: lazyExplorer },
    { path: '/docs/patterns/:group/:id', component: lazyExplorer },
    { path: '/docs/patterns/:id', component: lazyExplorer },
    { path: '/docs/icons', component: lazyExplorer },
    { path: '/docs/icons/:group', component: lazyExplorer },
    { path: '/docs/icons/:group/:id', component: lazyExplorer },
    { path: '/docs/tokens', component: lazyExplorer },
    { path: '/docs/foundations', component: lazyExplorer },
    { path: '/docs/foundations/:section', component: lazyExplorer },
    { path: '/docs/archetypes', component: lazyExplorer },
    { path: '/docs/archetypes/:id', component: lazyExplorer },
    { path: '/docs/charts', component: lazyExplorer },
    { path: '/docs/charts/:group', component: lazyExplorer },
    { path: '/docs/charts/:group/:type', component: lazyExplorer },
    { path: '/docs/shells', component: lazyExplorer },
    { path: '/docs/recipes', component: lazyExplorer },
    { path: '/docs/recipes/:id', component: lazyExplorer },
    { path: '/docs/tools', component: lazyExplorer },
    // Workbench — full explorer with HUD controls, sidebar, and viewport sim
    { path: '/workbench', component: lazyWorkbench },
    { path: '/workbench/:section', component: lazyWorkbench },
    { path: '/workbench/:section/:group', component: lazyWorkbench },
    { path: '/workbench/:section/:group/:item', component: lazyWorkbench },
  ],
  scrollBehavior: 'top',
  afterEach: (to) => {
    // Dynamic page title
    const titles = {
      '/': 'decantr — The Most Powerful UI Framework',
      '/docs': 'Documentation — decantr',
      '/workbench': 'Workbench — decantr',
    };
    if (to.path.startsWith('/workbench')) {
      const section = to.path.split('/')[2];
      if (section) {
        const name = section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ');
        document.title = `${name} — decantr workbench`;
      } else {
        document.title = titles['/workbench'];
      }
    } else {
      const base = to.path.split('/')[2];
      if (base) {
        const name = base.charAt(0).toUpperCase() + base.slice(1).replace(/-/g, ' ');
        document.title = `${name} — decantr docs`;
      } else {
        document.title = titles[to.path] || 'decantr';
      }
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
