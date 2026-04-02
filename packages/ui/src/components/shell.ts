/**
 * Shell — Configurable layout system with named grid regions.
 * Supports 10 preset configs (sidebar-main, top-nav-main, centered, etc.)
 * and custom grid-area configurations with reactive nav collapse states.
 *
 * @module decantr/components/shell
 */
import { h, onDestroy } from '../runtime/index.js';
import { createSignal, createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createDisclosure } from './_behaviors.js';

import { component } from '../runtime/component.js';
export interface resolveShellConfigProps {
  class?: string;
  [key: string]: unknown;
}

export interface buildGridTemplateProps {
  class?: string;
  [key: string]: unknown;
}

export interface ShellProps {
  config?: string|Object;
  navState?: (...args: unknown[]) => unknown;
  onNavStateChange?: (...args: unknown[]) => unknown;
  class?: string;
  inset?: unknown;
  dimensions?: unknown;
  [key: string]: unknown;
}

const { div } = tags;

// ─── Preset Configs ─────────────────────────────────────────────

const DEFAULTS = {
  nav: { position: 'left', width: '240px', collapseTo: '64px', collapseBelow: null, defaultState: 'expanded' },
  header: { height: '52px', sticky: true },
  body: { scroll: true, maxWidth: null },
  footer: { height: 'auto', sticky: false },
  aside: { width: '280px', collapsible: true }
};

const PRESETS = {
  'sidebar-main': {
    regions: ['header', 'nav', 'body'],
    grid: { areas: [['nav', 'header'], ['nav', 'body']] },
    nav: { position: 'left' },
    header: { sticky: true },
    body: { scroll: true }
  },
  'sidebar-right': {
    regions: ['header', 'nav', 'body'],
    grid: { areas: [['header', 'nav'], ['body', 'nav']] },
    nav: { position: 'right' },
    header: { sticky: true },
    body: { scroll: true }
  },
  'sidebar-main-footer': {
    regions: ['header', 'nav', 'body', 'footer'],
    grid: { areas: [['nav', 'header'], ['nav', 'body'], ['nav', 'footer']] },
    nav: { position: 'left' },
    header: { sticky: true },
    body: { scroll: true },
    footer: { sticky: false }
  },
  'sidebar-aside': {
    regions: ['header', 'nav', 'body', 'aside'],
    grid: { areas: [['nav', 'header', 'aside'], ['nav', 'body', 'aside']] },
    nav: { position: 'left' },
    header: { sticky: true },
    body: { scroll: true },
    aside: { width: '280px' }
  },
  'top-nav-main': {
    regions: ['header', 'body'],
    grid: { areas: [['header'], ['body']] },
    nav: { position: 'top' },
    header: { sticky: true },
    body: { scroll: true }
  },
  'top-nav-footer': {
    regions: ['header', 'body', 'footer'],
    grid: { areas: [['header'], ['body'], ['footer']] },
    nav: { position: 'top' },
    header: { sticky: true },
    body: { scroll: true },
    footer: { sticky: false }
  },
  'centered': {
    regions: ['body'],
    grid: { areas: [['body']] },
    nav: { position: 'left', defaultState: 'hidden' },
    body: { scroll: false }
  },
  'full-bleed': {
    regions: ['header', 'body'],
    grid: { areas: [['header'], ['body']] },
    nav: { position: 'top', defaultState: 'hidden' },
    header: { sticky: true },
    body: { scroll: true }
  },
  'minimal-header': {
    regions: ['header', 'body'],
    grid: { areas: [['header'], ['body']] },
    nav: { position: 'top', defaultState: 'hidden' },
    header: { sticky: true, height: '44px' },
    body: { scroll: true }
  },
  'top-nav-sidebar': {
    regions: ['header', 'nav', 'body'],
    grid: { areas: [['header', 'header'], ['nav', 'body']] },
    nav: { position: 'left' },
    header: { sticky: true },
    body: { scroll: true }
  }
};

// ─── Config Resolution ──────────────────────────────────────────

function mergeSection(defaults: any, override: any) {
  if (!override) return { ...defaults };
  return { ...defaults, ...override };
}

/**
 * Resolve a shell config — string preset ID or custom config object.
 * @param {string|Object} config
 * @returns {Object} resolved config
 */
// @ts-expect-error -- strict-mode fix (auto)
export const resolveShellConfig = component<resolveShellConfigProps>((config) => {
  const base = typeof config === 'string' ? PRESETS[config] : config;
  if (!base) throw new Error(`Shell: unknown preset "${config}"`);

  return {
    regions: base.regions || ['header', 'body'],
    grid: base.grid || { areas: [['header'], ['body']] },
    nav: mergeSection(DEFAULTS.nav, base.nav),
    header: mergeSection(DEFAULTS.header, base.header),
    body: mergeSection(DEFAULTS.body, base.body),
    footer: mergeSection(DEFAULTS.footer, base.footer),
    aside: mergeSection(DEFAULTS.aside, base.aside)
  };
})

// ─── Grid Template Generation ───────────────────────────────────

const VALID_REGIONS = new Set(['header', 'nav', 'body', 'footer', 'aside']);

/**
 * Validate that a grid areas matrix is rectangular and uses only valid region names.
 * @param {string[][]} areas
 */
function validateAreas(areas: any) {
  if (!areas || !areas.length) throw new Error('Shell: grid.areas must be a non-empty array');
  const cols = areas[0].length;
  for (let r = 0; r < areas.length; r++) {
    if (areas[r].length !== cols) {
      throw new Error(`Shell: grid.areas row ${r} has ${areas[r].length} columns, expected ${cols}`);
    }
    for (const cell of areas[r]) {
      if (!VALID_REGIONS.has(cell)) {
        throw new Error(`Shell: unknown region "${cell}" in grid.areas`);
      }
    }
  }
}

/**
 * Build CSS grid template values from config + current nav state.
 * @param {Object} cfg - resolved config
 * @param {string} navState - 'expanded' | 'rail' | 'hidden'
 * @returns {{ areas: string, columns: string, rows: string }}
 */
// @ts-expect-error -- strict-mode fix (auto)
export const buildGridTemplate = component<buildGridTemplateProps>((cfg, navState) => {
  const { grid, nav, header, footer, aside } = cfg;
  // @ts-expect-error -- strict-mode fix (auto)
  validateAreas(grid.areas);

  // @ts-expect-error -- strict-mode fix (auto)
  const areas = grid.areas.map((row: any) => `"${row.join(' ')}"`).join(' ');

  // Determine columns from first row
  // @ts-expect-error -- strict-mode fix (auto)
  const firstRow = grid.areas[0];
  const colCount = firstRow.length;
  const colDefs = [];

  // Determine effective nav width
  let navWidth;
  // @ts-expect-error -- strict-mode fix (auto)
  if (navState === 'expanded') navWidth = nav.width || DEFAULTS.nav.width;
  // @ts-expect-error -- strict-mode fix (auto)
  else if (navState === 'rail') navWidth = nav.collapseTo || DEFAULTS.nav.collapseTo;
  else navWidth = '0px';

  for (let c = 0; c < colCount; c++) {
    // Scan this column across all rows to determine its region type
    const regionSet = new Set();
    // @ts-expect-error -- strict-mode fix (auto)
    for (const row of grid.areas) regionSet.add(row[c]);

    if (regionSet.has('nav') && !regionSet.has('body') && !regionSet.has('aside')) {
      colDefs.push(`var(--d-shell-nav-w, ${navWidth})`);
    } else if (regionSet.has('aside') && regionSet.size === 1) {
      // @ts-expect-error -- strict-mode fix (auto)
      colDefs.push(aside.width || DEFAULTS.aside.width);
    } else {
      colDefs.push('1fr');
    }
  }

  // Determine rows
  const rowDefs = [];
  // @ts-expect-error -- strict-mode fix (auto)
  for (let r = 0; r < grid.areas.length; r++) {
    // @ts-expect-error -- strict-mode fix (auto)
    const regionSet = new Set(grid.areas[r]);
    if (regionSet.has('header') && regionSet.size <= 2) {
      // @ts-expect-error -- strict-mode fix (auto)
      rowDefs.push(header.height || DEFAULTS.header.height);
    } else if (regionSet.has('footer') && regionSet.size <= 2) {
      // @ts-expect-error -- strict-mode fix (auto)
      rowDefs.push(footer.height || DEFAULTS.footer.height);
    } else {
      rowDefs.push('1fr');
    }
  }

  return {
    areas,
    columns: colDefs.join(' '),
    rows: rowDefs.join(' ')
  };
})

// ─── Shell Sub-Components ───────────────────────────────────────

const SHELL_SECTIONS = ['d-shell-header', 'd-shell-nav', 'd-shell-body', 'd-shell-footer', 'd-shell-aside'];

function isShellSection(node: any) {
  return node && typeof node === 'object' && node.nodeType === 1 &&
    (node.className || '').split(/\s+/).some((cls: any) => SHELL_SECTIONS.includes(cls));
}

// ─── Shell Component ────────────────────────────────────────────

/**
 * @param {Object} [props]
 * @param {string|Object} [props.config='sidebar-main'] - Preset ID or config object
 * @param {Function} [props.navState] - Signal getter: 'expanded' | 'rail' | 'hidden'
 * @param {Function} [props.onNavStateChange] - Called when nav state changes (responsive collapse)
 * @param {string} [props.class]
 * @param {...Node} children - Shell.Header, Shell.Nav, Shell.Body, Shell.Footer, Shell.Aside
 * @returns {HTMLElement}
 */
// @ts-expect-error -- strict-mode fix (auto)
export const Shell = component<ShellProps>((props: ShellProps = {} as ShellProps, ...children: (string | Node)[]) => {
  injectBase();

  const {
    config: configProp = 'sidebar-main',
    inset = false,
    dimensions,
    navState: navStateGetter,
    onNavStateChange,
    class: cls
  } = props;

  // @ts-expect-error -- strict-mode fix (auto)
  const cfg = resolveShellConfig(configProp);

  // Apply theme-driven dimension overrides
  if (dimensions) {
    // @ts-expect-error -- strict-mode fix (auto)
    if (dimensions.nav) Object.assign(cfg.nav, dimensions.nav);
    // @ts-expect-error -- strict-mode fix (auto)
    if (dimensions.header) Object.assign(cfg.header, dimensions.header);
  }
  // @ts-expect-error -- strict-mode fix (auto)
  const isTopNav = cfg.nav.position === 'top';

  // Internal nav state if not externally controlled
  const [internalNav, setInternalNav] = navStateGetter
    ? [navStateGetter, onNavStateChange || (() => {})]
    // @ts-expect-error -- strict-mode fix (auto)
    : createSignal(cfg.nav.defaultState || 'expanded');

  const getNavState = navStateGetter || internalNav;

  // Build grid element
  // @ts-expect-error -- strict-mode fix (auto)
  const el = h('div', { class: cx('d-shell', inset && 'd-shell-inset', cls) });

  // Reactive grid template
  createEffect(() => {
    const state = isTopNav ? 'hidden' : getNavState();
    // @ts-expect-error -- strict-mode fix (auto)
    const tpl = buildGridTemplate(cfg, state);
    // @ts-expect-error -- strict-mode fix (auto)
    el.style.gridTemplateAreas = tpl.areas;
    // @ts-expect-error -- strict-mode fix (auto)
    el.style.gridTemplateColumns = tpl.columns;
    // @ts-expect-error -- strict-mode fix (auto)
    el.style.gridTemplateRows = tpl.rows;
    const navW = state === 'expanded'
      // @ts-expect-error -- strict-mode fix (auto)
      ? (cfg.nav.width || DEFAULTS.nav.width)
      : state === 'rail'
        // @ts-expect-error -- strict-mode fix (auto)
        ? (cfg.nav.collapseTo || DEFAULTS.nav.collapseTo)
        : '0px';
    // Use direct assignment — test DOM doesn't support setProperty
    // @ts-expect-error -- strict-mode fix (auto)
    el.style['--d-shell-nav-w'] = navW;
  });

  // Scan children and attach
  const sections = {};
  for (const child of children) {
    if (!child) continue;
    if (isShellSection(child)) {
      // @ts-expect-error -- strict-mode fix (auto)
      const classes = (child.className || '').split(/\s+/);
      // @ts-expect-error -- strict-mode fix (auto)
      if (classes.includes('d-shell-header')) sections.header = child;
      // @ts-expect-error -- strict-mode fix (auto)
      else if (classes.includes('d-shell-nav')) sections.nav = child;
      // @ts-expect-error -- strict-mode fix (auto)
      else if (classes.includes('d-shell-body')) sections.body = child;
      // @ts-expect-error -- strict-mode fix (auto)
      else if (classes.includes('d-shell-footer')) sections.footer = child;
      // @ts-expect-error -- strict-mode fix (auto)
      else if (classes.includes('d-shell-aside')) sections.aside = child;
    }
    // @ts-expect-error -- strict-mode fix (auto)
    el.appendChild(child);
  }

  // Top-nav mode: move Shell.Nav children into Shell.Header
  // @ts-expect-error -- strict-mode fix (auto)
  if (isTopNav && sections.nav && sections.header) {
    const navContent = div({ class: 'd-shell-nav-inline' });
    // @ts-expect-error -- strict-mode fix (auto)
    while (sections.nav.firstChild) {
      // @ts-expect-error -- strict-mode fix (auto)
      navContent.appendChild(sections.nav.firstChild);
    }
    // Insert nav content between first child and remaining header content
    // @ts-expect-error -- strict-mode fix (auto)
    const headerChildren = [...sections.header.childNodes];
    if (headerChildren.length >= 1) {
      // @ts-expect-error -- strict-mode fix (auto)
      sections.header.insertBefore(navContent, headerChildren[1] || null);
    } else {
      // @ts-expect-error -- strict-mode fix (auto)
      sections.header.appendChild(navContent);
    }
    // Hide the nav element (it still exists in DOM for potential mode switching)
    // @ts-expect-error -- strict-mode fix (auto)
    sections.nav.style.display = 'none';
  }

  // Reactive nav state class for rail mode styling
  createEffect(() => {
    const state = getNavState();
    el.classList.toggle('d-shell-nav-expanded', state === 'expanded');
    el.classList.toggle('d-shell-nav-rail', state === 'rail');
    el.classList.toggle('d-shell-nav-hidden', state === 'hidden');
    // @ts-expect-error -- strict-mode fix (auto)
    if (sections.nav) {
      // @ts-expect-error -- strict-mode fix (auto)
      sections.nav.setAttribute('aria-expanded', String(state === 'expanded'));
    }
  });

  // Responsive collapse via matchMedia
  let mediaCleanup = null;
  // @ts-expect-error -- strict-mode fix (auto)
  if (cfg.nav.collapseBelow && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 };
    // @ts-expect-error -- strict-mode fix (auto)
    const bp = breakpoints[cfg.nav.collapseBelow];
    if (bp) {
      const mql = window.matchMedia(`(max-width: ${bp - 1}px)`);
      let wasExpanded = getNavState() === 'expanded';

      const handler = (e: Event) => {
        // @ts-expect-error -- strict-mode fix (auto)
        if (e.matches) {
          // Below breakpoint — collapse to rail
          wasExpanded = getNavState() === 'expanded';
          const setter = onNavStateChange || setInternalNav;
          setter('rail');
        } else if (wasExpanded) {
          // Above breakpoint — restore expanded
          const setter = onNavStateChange || setInternalNav;
          setter('expanded');
        }
      };

      mql.addEventListener('change', handler);
      // Check initial state
      if (mql.matches) {
        const setter = onNavStateChange || setInternalNav;
        setter('rail');
      }

      mediaCleanup = () => mql.removeEventListener('change', handler);
    }
  }

  onDestroy(() => {
    if (mediaCleanup) mediaCleanup();
  });

  return el;
})

/**
 * Shell.Header — header region
 * @param {Object} [props]
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface ShellHeaderProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
Shell.Header = function ShellHeader(props: ShellHeaderProps = {} as ShellHeaderProps, ...children: (string | Node)[]) {
  const { class: cls } = props;
  return div({ class: cx('d-shell-header', cls), role: 'banner' }, ...children);
};

/**
 * Shell.Nav — sidebar navigation region
 * @param {Object} [props]
 * @param {string} [props.class]
 * @param {string} [props['aria-label']] - Navigation label (default: 'Main')
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface ShellNavProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
Shell.Nav = function ShellNav(props: ShellNavProps = {} as ShellNavProps, ...children: (string | Node)[]) {
  const { class: cls, 'aria-label': ariaLabel = 'Main' } = props;
  return div({ class: cx('d-shell-nav', cls), role: 'navigation', 'aria-label': ariaLabel }, ...children);
};

/**
 * Shell.Body — main content region
 * @param {Object} [props]
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface ShellBodyProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
Shell.Body = function ShellBody(props: ShellBodyProps = {} as ShellBodyProps, ...children: (string | Node)[]) {
  const { class: cls } = props;
  return div({ class: cx('d-shell-body', cls), role: 'main' }, ...children);
};

/**
 * Shell.Footer — optional footer region
 * @param {Object} [props]
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface ShellFooterProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
Shell.Footer = function ShellFooter(props: ShellFooterProps = {} as ShellFooterProps, ...children: (string | Node)[]) {
  const { class: cls } = props;
  return div({ class: cx('d-shell-footer', cls), role: 'contentinfo' }, ...children);
};

/**
 * Shell.Aside — optional aside/inspector region
 * @param {Object} [props]
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface ShellAsideProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
Shell.Aside = function ShellAside(props: ShellAsideProps = {} as ShellAsideProps, ...children: (string | Node)[]) {
  const { class: cls } = props;
  return div({ class: cx('d-shell-aside', cls), role: 'complementary' }, ...children);
};

/**
 * Shell.NavGroup — semantic nav section wrapper
 * @param {Object} [props]
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface ShellNavGroupProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
Shell.NavGroup = function ShellNavGroup(props: ShellNavGroupProps = {} as ShellNavGroupProps, ...children: (string | Node)[]) {
  const { class: cls } = props;
  return div({ class: cx('d-shell-nav-group', cls), role: 'group' }, ...children);
};

/**
 * Shell.NavGroupLabel — label for a nav group (hidden in rail mode via CSS)
 * @param {Object} [props]
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface ShellNavGroupLabelProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
Shell.NavGroupLabel = function ShellNavGroupLabel(props: ShellNavGroupLabelProps = {} as ShellNavGroupLabelProps, ...children: (string | Node)[]) {
  const { class: cls } = props;
  return div({ class: cx('d-shell-nav-group-label', cls) }, ...children);
};

/**
 * Shell.NavFooter — anchored bottom section in sidebar
 * @param {Object} [props]
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface ShellNavFooterProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
Shell.NavFooter = function ShellNavFooter(props: ShellNavFooterProps = {} as ShellNavFooterProps, ...children: (string | Node)[]) {
  const { class: cls } = props;
  return div({ class: cx('d-shell-nav-footer', cls) }, ...children);
};

/**
 * Shell.NavSub — collapsible nested nav items
 * @param {Object} [props]
 * @param {boolean|Function} [props.open=false] - Initial open state
 * @param {Node|Function} [props.trigger] - Trigger element for expand/collapse
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface ShellNavSubProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
Shell.NavSub = function ShellNavSub(props: ShellNavSubProps = {} as ShellNavSubProps, ...children: (string | Node)[]) {
  const { open = false, trigger, class: cls } = props;
  const triggerEl = typeof trigger === 'function' ? trigger() : trigger;
  if (triggerEl) triggerEl.classList.add('d-shell-nav-sub-trigger');
  const content = div({ class: 'd-shell-nav-sub-content' }, ...children);
  const el = div({ class: cx('d-shell-nav-sub', cls) }, triggerEl, content);
  createDisclosure(triggerEl, content, {
    defaultOpen: typeof open === 'function' ? open() : open,
    animate: true
  });
  return el;
};

/**
 * Shell.Trigger — visible toggle button for sidebar collapse
 * @param {Object} [props]
 * @param {Function} [props.onToggle] - Click handler
 * @param {string} [props['aria-label']] - Accessible label
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface ShellTriggerProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
Shell.Trigger = function ShellTrigger(props: ShellTriggerProps = {} as ShellTriggerProps, ...children: (string | Node)[]) {
  const { class: cls, onToggle, 'aria-label': ariaLabel = 'Toggle sidebar' } = props;
  const btn = h('button', {
    type: 'button',
    class: cx('d-shell-trigger', cls),
    'aria-label': ariaLabel
  }, ...children);
  // @ts-expect-error -- strict-mode fix (auto)
  if (onToggle) btn.addEventListener('click', onToggle);
  return btn;
};

// Export presets for external use (workbench, code generation)
// @ts-expect-error -- strict-mode fix (auto)
Shell.PRESETS = PRESETS;
