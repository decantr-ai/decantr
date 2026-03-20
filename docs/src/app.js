import { setStyle, setMode, setShape } from 'decantr/css';
import { mount } from 'decantr/core';
import { tags } from 'decantr/tags';
import { createRouter } from 'decantr/router';
import { registerIcons } from 'decantr/components';
import { docsSiteCSS } from './style.js';
import { HomePage } from './pages/home.js';
import { NavHeader } from './components/nav-header.js';

registerIcons({
  'github': '<path d="M15 22v-4a4.8 4.8 0 00-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 004 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  'x-brand': '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
  'refresh-cw': '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>',
  'discord': '<path d="M18.9 5.2a15.8 15.8 0 00-4-1.2c-.2.3-.4.7-.5 1a14.7 14.7 0 00-4.4 0c-.2-.4-.4-.7-.5-1a15.8 15.8 0 00-4 1.2A16.3 16.3 0 003 17.6a16 16 0 004.9 2.5c.4-.5.7-1.1 1-1.7a10 10 0 01-1.6-.8l.4-.3a11.3 11.3 0 009.6 0l.4.3c-.5.3-1 .6-1.6.8.3.6.6 1.1 1 1.7a16 16 0 004.9-2.5A16.3 16.3 0 0018.9 5.2zM8.7 14.8c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.9 2.1-1.9 2.1zm6.6 0c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.9 2.1-1.9 2.1z"/>',
});

setStyle('auradecantism');
setMode('dark');
setShape('pill');

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
const lazyWorkflow = () => import('./pages/workflow.js').then(m => m.WorkflowPage);
const lazyExplorer = () => import('./pages/explorer-page.js').then(m => m.ExplorerPage).catch(() => () => div('Explorer failed to load'));
const lazyGallery = () => import('./pages/gallery.js').then(m => m.GalleryPage).catch(e => { console.error('Gallery load failed:', e); return () => div('Gallery failed to load'); });
const lazyShowcase = () => import('./pages/showcase.js').then(m => m.ShowcasePage);

// New prompt-first docs pages (Start Here)
const lazyQuickSetup = () => import('./pages/docs/quick-setup.js').then(m => m.QuickSetupPage);
const lazyFirstPrompt = () => import('./pages/docs/first-prompt.js').then(m => m.FirstPromptPage);
const lazyDecantation = () => import('./pages/docs/decantation.js').then(m => m.DecantationPage);

// Building section
const lazyBuildingPages = () => import('./pages/docs/building/pages.js').then(m => m.AddingPagesPage);
const lazyBuildingFeatures = () => import('./pages/docs/building/features.js').then(m => m.AddingFeaturesPage);
const lazyBuildingPrompts = () => import('./pages/docs/building/prompts.js').then(m => m.PromptPatternsPage);
const lazyBuildingEssence = () => import('./pages/docs/building/essence.js').then(m => m.WorkingWithEssencePage);

// Styling section
const lazyStylingThemes = () => import('./pages/docs/styling/themes.js').then(m => m.ThemesRecipesPage);
const lazyStylingColors = () => import('./pages/docs/styling/colors.js').then(m => m.CustomizingColorsPage);
const lazyStylingEffects = () => import('./pages/docs/styling/effects.js').then(m => m.VisualEffectsPage);

// Customizing section
const lazyCustomizingPatterns = () => import('./pages/docs/customizing/patterns.js').then(m => m.CreatingPatternsPage);
const lazyCustomizingThemes = () => import('./pages/docs/customizing/themes.js').then(m => m.CreatingThemesPage);
const lazyCustomizingPublishing = () => import('./pages/docs/customizing/publishing.js').then(m => m.PublishingPage);

const router = createRouter({
  mode: 'hash',
  routes: [
    // Landing page
    { path: '/', component: HomePage },

    // Documentation - Home
    { path: '/docs', component: lazyDocsHome },

    // Documentation - Start Here
    { path: '/docs/quick-setup', component: lazyQuickSetup },
    { path: '/docs/first-prompt', component: lazyFirstPrompt },
    { path: '/docs/decantation', component: lazyDecantation },

    // Documentation - Building
    { path: '/docs/building/pages', component: lazyBuildingPages },
    { path: '/docs/building/features', component: lazyBuildingFeatures },
    { path: '/docs/building/prompts', component: lazyBuildingPrompts },
    { path: '/docs/building/essence', component: lazyBuildingEssence },

    // Documentation - Styling
    { path: '/docs/styling/themes', component: lazyStylingThemes },
    { path: '/docs/styling/colors', component: lazyStylingColors },
    { path: '/docs/styling/effects', component: lazyStylingEffects },

    // Documentation - Customizing
    { path: '/docs/customizing/patterns', component: lazyCustomizingPatterns },
    { path: '/docs/customizing/themes', component: lazyCustomizingThemes },
    { path: '/docs/customizing/publishing', component: lazyCustomizingPublishing },

    // Documentation - Legacy routes (tutorial, cookbook, workflow)
    { path: '/docs/tutorial/:step', component: lazyTutorial },
    { path: '/docs/cookbook/:recipe', component: lazyCookbook },
    { path: '/docs/workflow/:page', component: lazyWorkflow },

    // Showcase gallery
    { path: '/gallery', component: lazyGallery },

    // Showcase page (tabbed: Apps, Components, Themes)
    { path: '/showcase', component: lazyShowcase },

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
  return div({ class: '_flex _col _minh[100vh]' },
    NavHeader(),
    router.outlet()
  );
}

const root = document.getElementById('app');
mount(root, App);
root.classList.add('ds-ready');

// Initial scroll reveal setup
requestAnimationFrame(setupScrollReveal);
