import type { IRAppNode, GeneratedFile, IRRoute, IRNavItem } from '@decantr/generator-core';

function pascalCase(str: string): string {
  return str.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function generateRouteEntries(routes: IRRoute[]): string {
  return routes
    .map(r => `    '${r.path}': () => import('./pages/${r.pageId}.js')`)
    .join(',\n');
}

function generateNavItems(nav: IRNavItem[]): string {
  return nav
    .map(n => `      { href: '${n.href}', icon: '${n.icon}', label: '${n.label}' }`)
    .join(',\n');
}

function buildSidebarMainApp(app: IRAppNode): string {
  const { theme, shell, routes, routing } = app;
  const recipe = shell.config.recipe;
  const brand = shell.config.brand;
  const nav = shell.config.nav;

  // Recipe decoration classes
  const rootClass = recipe?.root || '';
  const navClass = recipe?.nav || '';
  const brandClass = recipe?.brand || '';
  const navStyle = recipe?.navStyle || 'minimal';
  const defaultNavState = recipe?.defaultNavState || 'expanded';

  // Style setup
  let styleSetup = `  setStyle('${theme.style}');\n  setMode('${theme.mode}');`;
  if (theme.shape) {
    styleSetup += `\n  // Shape: ${theme.shape}`;
  }
  if (theme.isAddon) {
    styleSetup = `  // Register addon style\n  // import '${theme.style}/style.css';\n${styleSetup}`;
  }

  // Dimensions
  let dimensionsProp = '';
  if (recipe?.dimensions) {
    const dims = recipe.dimensions;
    const entries: string[] = [];
    if (dims.navWidth) entries.push(`navWidth: '${dims.navWidth}'`);
    if (dims.headerHeight) entries.push(`headerHeight: '${dims.headerHeight}'`);
    if (entries.length > 0) dimensionsProp = `\n      dimensions: { ${entries.join(', ')} },`;
  }

  return `import { tags } from 'decantr/tags';
import { h, mount, component, onMount, onDestroy } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { css, setStyle, setMode } from 'decantr/css';
import { createRouter, link, navigate, useRoute } from 'decantr/router';
import { Shell, Breadcrumb, Command, Popover, Dropdown, Button, icon } from 'decantr/components';

${styleSetup}

const router = createRouter({
  mode: '${routing}',
  routes: {
${generateRouteEntries(routes)}
  },
  fallback: () => import('./pages/not-found.js'),
});

export default component('App', () => {
  const { div, span } = tags;
  const [navState, setNavState] = createSignal('${defaultNavState}');

  // Keyboard shortcuts
  onMount(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === '\\\\') {
        e.preventDefault();
        setNavState(s => s === 'expanded' ? 'rail' : 'expanded');
      }
    };
    document.addEventListener('keydown', handler);
    onDestroy(() => document.removeEventListener('keydown', handler));
  });

  const navItems = [
${generateNavItems(nav)}
  ];

  return Shell({
    class: '${rootClass}',${dimensionsProp}
  },
    Shell.Nav({ class: '${navClass}', state: navState() },
      div({ class: css('_flex _aic _jcsb _p3') },
        navState() === 'expanded' ? span({ class: css('_heading5 ${brandClass}') }, '${brand}') : null,
        Button({ variant: 'ghost', size: 'sm', onclick: () => setNavState(s => s === 'expanded' ? 'rail' : 'expanded') }, icon('panel-left'))
      ),
      ...navItems.map(item =>
        link(item.href, { class: css(\`d-shell-nav-item d-shell-nav-style-${navStyle} \${useRoute().path === item.href ? 'd-shell-nav-item-active' : ''}\`) },
          icon(item.icon),
          navState() === 'expanded' ? span({}, item.label) : null
        )
      )
    ),
    Shell.Header({},
      Breadcrumb({}),
      div({ class: css('_flex _aic _gap2') },
        Command({}),
        Popover({}, icon('bell')),
        Dropdown({}, icon('user'))
      )
    ),
    Shell.Body({ class: 'd-page-enter' },
      router.view()
    )
  );
});
`;
}

function buildTopNavApp(app: IRAppNode): string {
  const { theme, routes, routing, shell } = app;
  const brand = shell.config.brand;
  const nav = shell.config.nav;

  return `import { tags } from 'decantr/tags';
import { mount, component } from 'decantr/core';
import { css, setStyle, setMode } from 'decantr/css';
import { createRouter, link, useRoute } from 'decantr/router';
import { Button, icon } from 'decantr/components';

setStyle('${theme.style}');
setMode('${theme.mode}');

const router = createRouter({
  mode: '${routing}',
  routes: {
${generateRouteEntries(routes)}
  },
  fallback: () => import('./pages/not-found.js'),
});

export default component('App', () => {
  const { div, nav, span } = tags;

  return div({ class: css('_flex _col _hfull') },
    nav({ class: css('_flex _aic _jcsb _px6 _py3 _borderB') },
      span({ class: css('_heading5') }, '${brand}'),
      div({ class: css('_flex _gap4') },
${nav.map(n => `        link('${n.href}', { class: css('d-shell-nav-item') }, '${n.label}')`).join(',\n')}
      )
    ),
    div({ class: css('_flex1 _overflow[auto] d-page-enter') },
      router.view()
    )
  );
});
`;
}

function buildFullBleedApp(app: IRAppNode): string {
  const { theme, routes, routing } = app;

  return `import { tags } from 'decantr/tags';
import { mount, component } from 'decantr/core';
import { css, setStyle, setMode } from 'decantr/css';
import { createRouter } from 'decantr/router';

setStyle('${theme.style}');
setMode('${theme.mode}');

const router = createRouter({
  mode: '${routing}',
  routes: {
${generateRouteEntries(routes)}
  },
  fallback: () => import('./pages/not-found.js'),
});

export default component('App', () => {
  const { div } = tags;

  return div({ class: css('_flex _col _hfull d-page-enter') },
    router.view()
  );
});
`;
}

/** Emit src/app.js from the IR app tree */
export function emitApp(app: IRAppNode): GeneratedFile {
  const shellType = app.shell.config.type;

  let content: string;
  switch (shellType) {
    case 'sidebar-main':
      content = buildSidebarMainApp(app);
      break;
    case 'top-nav-main':
      content = buildTopNavApp(app);
      break;
    case 'full-bleed':
    case 'centered':
    case 'minimal-header':
    default:
      content = buildFullBleedApp(app);
      break;
  }

  return { path: 'src/app.js', content };
}
