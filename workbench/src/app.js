import { mount, h } from 'decantr/core';
import { createSignal, createEffect } from 'decantr/state';
import { css, setStyle, getStyleList, setMode, getMode, getResolvedMode } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Select, Badge, icon } from 'decantr/components';
import { ActionSection } from './sections/action.js';
import { InputSection } from './sections/form.js';
import { FormAdvancedSection } from './sections/form-advanced.js';
import { DisplaySection } from './sections/display.js';
import { DataSection } from './sections/data.js';
import { LayoutSection } from './sections/layout.js';
import { NavigationSection } from './sections/navigation.js';
import { FeedbackSection } from './sections/feedback.js';
import { TypographySection } from './sections/typography.js';
import { ChartSection } from './sections/charts.js';
import { IconSection } from './sections/icons.js';

const { div, header, main, nav, section, h1, h2, h3, p, span, button, input, a, small, strong, code } = tags;

// ─── Categories ──────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'action', label: 'Action', children: ['Button', 'Toggle', 'ToggleGroup', 'Dropdown', 'Spinner'], section: ActionSection },
  { id: 'input', label: 'Form Basic', children: ['Input', 'InputNumber', 'InputOTP', 'Rate', 'Textarea', 'Checkbox', 'Switch', 'Select', 'Combobox', 'Mentions', 'Label', 'RadioGroup', 'Slider', 'RangeSlider', 'InputGroup', 'CompactGroup'], section: InputSection },
  { id: 'form-advanced', label: 'Form Advanced', children: ['ColorPicker', 'DatePicker', 'DateRangePicker', 'TimePicker', 'TimeRangePicker', 'Upload', 'Transfer', 'Cascader', 'TreeSelect', 'Form/Field'], section: FormAdvancedSection },
  { id: 'display', label: 'Display', children: ['Card', 'Badge', 'Tag', 'Table', 'DataTable', 'Descriptions', 'Statistic', 'Avatar', 'AvatarGroup', 'Progress', 'Skeleton', 'Chip', 'Empty'], section: DisplaySection },
  { id: 'data', label: 'Data', children: ['List', 'Tree', 'Calendar', 'Carousel', 'Image', 'Timeline', 'HoverCard'], section: DataSection },
  { id: 'layout', label: 'Layout', children: ['Tabs', 'Accordion', 'Collapsible', 'Space', 'AspectRatio', 'Resizable', 'Splitter', 'ScrollArea', 'Separator', 'Pagination', 'Breadcrumb'], section: LayoutSection },
  { id: 'navigation', label: 'Navigation', children: ['Menu', 'NavigationMenu', 'Steps', 'Segmented', 'ContextMenu', 'BackTop', 'Affix'], section: NavigationSection },
  { id: 'feedback', label: 'Feedback', children: ['Modal', 'AlertDialog', 'Sheet', 'Drawer', 'Command', 'Popconfirm', 'Popover', 'Tooltip', 'Alert', 'Result', 'Toast', 'Notification', 'Message', 'FloatButton', 'Tour'], section: FeedbackSection },
  { id: 'typography', label: 'Typography', children: ['Title', 'Text', 'Paragraph', 'Link', 'Blockquote', 'Kbd', 'Watermark', 'VisuallyHidden'], section: TypographySection },
  { id: 'chart', label: 'Chart', children: ['Line', 'Bar', 'Area', 'Scatter', 'Bubble', 'Histogram', 'BoxPlot', 'Candlestick', 'Waterfall', 'RangeBar', 'RangeArea', 'Heatmap', 'Combination', 'Pie', 'Radar', 'Radial', 'Gauge', 'Funnel', 'Treemap', 'Sunburst', 'Sankey', 'Chord', 'Sparkline', 'Swimlane', 'OrgChart'], section: ChartSection },
  { id: 'icons', label: 'Icons', children: ['Essential', 'Custom', 'Sizes'], section: IconSection },
];

const TOTAL_COMPONENTS = CATEGORIES.reduce((n, c) => n + c.children.length, 0);

// Build flat search index: { name, categoryId, categoryLabel }
const SEARCH_INDEX = [];
for (const cat of CATEGORIES) {
  for (const child of cat.children) {
    SEARCH_INDEX.push({ name: child, categoryId: cat.id, categoryLabel: cat.label });
  }
}

// ─── Hash routing helpers ────────────────────────────────────────
function getHash() {
  const h = window.location.hash.slice(1) || '/';
  return h.startsWith('/') ? h : '/' + h;
}

function setHash(path) {
  window.location.hash = '#' + path;
}

function parseRoute(hash) {
  if (hash === '/' || hash === '') return { page: 'home', category: null };
  if (hash === '/tokens') return { page: 'tokens', category: null };
  if (hash === '/recipes') return { page: 'recipes', category: null };
  const m = hash.match(/^\/components\/([a-z-]+)$/);
  if (m) return { page: 'category', category: m[1] };
  return { page: 'home', category: null };
}

// ─── Viewport sizes ──────────────────────────────────────────────
const VIEWPORTS = [
  { id: 'mobile', label: 'Mobile', width: 360, icon: '\u{1F4F1}' },
  { id: 'tablet', label: 'Tablet', width: 768, icon: '\u{1F4CB}' },
  { id: 'desktop', label: 'Desktop', width: 1024, icon: '\u{1F5A5}' },
  { id: 'full', label: 'Full', width: 0, icon: '\u{2B1C}' },
];

// ─── Token Inspector ─────────────────────────────────────────────
function TokensPage() {
  const style = getComputedStyle(document.documentElement);
  const getToken = (name) => style.getPropertyValue(name).trim();

  const roles = ['primary', 'accent', 'tertiary', 'success', 'warning', 'error', 'info'];
  const roleSuffixes = ['', '-fg', '-hover', '-active', '-subtle', '-subtle-fg', '-border'];

  function colorSwatch(token) {
    const val = getToken(token);
    return div({ class: 'wb-swatch' },
      div({ class: 'wb-swatch-color', style: `background:${val || 'transparent'}` }),
      div({ class: css('_flex _col') },
        span({ class: 'wb-swatch-label' }, token.replace('--d-', '')),
        span({ class: 'wb-swatch-value' }, val || 'unset')
      )
    );
  }

  // Color palette section
  function colorSection() {
    const swatches = [];
    for (const role of roles) {
      for (const suffix of roleSuffixes) {
        swatches.push(colorSwatch(`--d-${role}${suffix}`));
      }
    }
    return div({ class: 'wb-section-block' },
      h3({ class: 'wb-section-title' }, 'Color Palette'),
      p({ class: css('_textsm _fg4 _mb4') }, `${roles.length} roles \u00d7 ${roleSuffixes.length} variants = ${roles.length * roleSuffixes.length} tokens`),
      div({ class: 'wb-token-grid' }, ...swatches)
    );
  }

  // Neutral / surface tokens
  function neutralSection() {
    const neutralTokens = ['--d-bg', '--d-fg', '--d-muted', '--d-muted-fg', '--d-border', '--d-border-strong', '--d-ring', '--d-overlay'];
    return div({ class: 'wb-section-block' },
      h3({ class: 'wb-section-title' }, 'Neutral Tokens'),
      div({ class: 'wb-token-grid' }, ...neutralTokens.map(t => colorSwatch(t)))
    );
  }

  // Surfaces
  function surfaceSection() {
    const levels = [0, 1, 2, 3];
    return div({ class: 'wb-section-block' },
      h3({ class: 'wb-section-title' }, 'Surface Levels'),
      div({ class: css('_grid _gc4 _gap3') },
        ...levels.map(i => {
          const bg = getToken(`--d-surface-${i}`);
          const fg = getToken(`--d-surface-${i}-fg`);
          const border = getToken(`--d-surface-${i}-border`);
          return div({
            class: 'wb-surface-card',
            style: `background:${bg};color:${fg};border:1px solid ${border}`
          },
            strong({}, `Surface ${i}`),
            small({}, `bg: ${bg}`),
            small({}, `fg: ${fg}`)
          );
        })
      )
    );
  }

  // Typography scale
  function typographySection() {
    const sizes = [
      ['--d-text-xs', 'xs'],
      ['--d-text-sm', 'sm'],
      ['--d-text-base', 'base'],
      ['--d-text-md', 'md'],
      ['--d-text-lg', 'lg'],
      ['--d-text-xl', 'xl'],
      ['--d-text-2xl', '2xl'],
      ['--d-text-3xl', '3xl'],
      ['--d-text-4xl', '4xl'],
    ];
    return div({ class: 'wb-section-block' },
      h3({ class: 'wb-section-title' }, 'Typography Scale'),
      div({ class: css('_flex _col _gap1') },
        ...sizes.map(([token, label]) => {
          const val = getToken(token);
          return div({ class: 'wb-type-sample' },
            span({ class: 'wb-type-label' }, `${token}`),
            span({ style: `font-size:${val || '1rem'}` }, `The quick brown fox (${val})`)
          );
        })
      )
    );
  }

  // Spacing scale
  function spacingSection() {
    const spacings = [
      ['--d-sp-1', '0.25rem'], ['--d-sp-1-5', '0.375rem'], ['--d-sp-2', '0.5rem'],
      ['--d-sp-2-5', '0.625rem'], ['--d-sp-3', '0.75rem'], ['--d-sp-4', '1rem'],
      ['--d-sp-5', '1.25rem'], ['--d-sp-6', '1.5rem'], ['--d-sp-8', '2rem'],
      ['--d-sp-10', '2.5rem'], ['--d-sp-12', '3rem'], ['--d-sp-16', '4rem'],
    ];
    return div({ class: 'wb-section-block' },
      h3({ class: 'wb-section-title' }, 'Spacing Scale'),
      div({ class: css('_flex _col _gap1') },
        ...spacings.map(([token, fallback]) => {
          const val = getToken(token) || fallback;
          return div({ class: 'wb-spacing-row' },
            span({ class: 'wb-spacing-label' }, token.replace('--d-', '')),
            div({ class: 'wb-spacing-bar', style: `width:${val}` }),
            span({ class: 'wb-spacing-label' }, val)
          );
        })
      )
    );
  }

  // Elevation
  function elevationSection() {
    const levels = [0, 1, 2, 3];
    return div({ class: 'wb-section-block' },
      h3({ class: 'wb-section-title' }, 'Elevation'),
      div({ class: css('_grid _gc4 _gap4') },
        ...levels.map(i => {
          const shadow = getToken(`--d-elevation-${i}`);
          return div({ class: 'wb-elevation-box', style: `box-shadow:${shadow}` },
            `elevation-${i}`
          );
        })
      )
    );
  }

  // Motion
  function motionSection() {
    const durations = ['--d-duration-instant', '--d-duration-fast', '--d-duration-normal', '--d-duration-slow'];
    const easings = ['--d-easing-standard', '--d-easing-decelerate', '--d-easing-accelerate', '--d-easing-bounce'];
    return div({ class: 'wb-section-block' },
      h3({ class: 'wb-section-title' }, 'Motion'),
      p({ class: css('_textsm _fg4 _mb3') }, 'Hover each box to see the transition in action.'),
      div({ class: css('_flex _col _gap4') },
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_fwtitle _fg4') }, 'Durations'),
          div({ class: css('_flex _gap3 _wrap') },
            ...durations.map(token => {
              const val = getToken(token) || '0s';
              const box = div({
                class: 'wb-motion-box',
                title: `${token}: ${val}`,
                style: `transition: transform ${val} ease`
              });
              box.addEventListener('mouseenter', () => { box.style.transform = 'scale(1.3)'; });
              box.addEventListener('mouseleave', () => { box.style.transform = 'scale(1)'; });
              return div({ class: css('_flex _col _aic _gap1') },
                box,
                small({ class: css('_t10 _fg4'), style: 'font-family:monospace' }, token.replace('--d-duration-', '')),
                small({ class: css('_t10 _fg4') }, val)
              );
            })
          )
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_fwtitle _fg4') }, 'Easings'),
          div({ class: css('_flex _gap3 _wrap') },
            ...easings.map(token => {
              const val = getToken(token) || 'ease';
              const dur = getToken('--d-duration-normal') || '0.2s';
              const box = div({
                class: 'wb-motion-box',
                title: `${token}: ${val}`,
                style: `transition: transform ${dur} ${val}; background: var(--d-accent)`
              });
              box.addEventListener('mouseenter', () => { box.style.transform = 'translateY(-12px)'; });
              box.addEventListener('mouseleave', () => { box.style.transform = 'translateY(0)'; });
              return div({ class: css('_flex _col _aic _gap1') },
                box,
                small({ class: css('_t10 _fg4'), style: 'font-family:monospace' }, token.replace('--d-easing-', '')),
                small({ class: css('_t10 _fg4') }, val)
              );
            })
          )
        )
      )
    );
  }

  // Chart tokens
  function chartSection() {
    const chartTokens = Array.from({ length: 8 }, (_, i) => `--d-chart-${i}`);
    return div({ class: 'wb-section-block' },
      h3({ class: 'wb-section-title' }, 'Chart Palette'),
      div({ class: css('_flex _gap2 _wrap') },
        ...chartTokens.map(token => {
          const val = getToken(token);
          return div({ class: css('_flex _col _aic _gap1') },
            div({ style: `width:3rem;height:3rem;border-radius:var(--d-radius);background:${val};border:1px solid var(--d-border)` }),
            small({ class: css('_t10 _fg4'), style: 'font-family:monospace' }, token.replace('--d-chart-', 'chart-')),
            small({ class: css('_t10 _fg4') }, val)
          );
        })
      )
    );
  }

  return section({ class: css('_flex _col _gap8') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_text2xl _fwheading _lhtight _lsheading') }, 'Token Inspector'),
      p({ class: css('_textsm _fg4') }, 'Live view of all active design tokens. Values update when you switch styles or modes.')
    ),
    colorSection(),
    neutralSection(),
    surfaceSection(),
    typographySection(),
    spacingSection(),
    elevationSection(),
    motionSection(),
    chartSection()
  );
}

// ─── Recipes placeholder ─────────────────────────────────────────
function RecipesPage() {
  return section({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_text2xl _fwheading _lhtight _lsheading') }, 'Integration Recipes'),
      p({ class: css('_textsm _fg4') }, 'Common component composition patterns.')
    ),
    div({ class: css('_p8 _tc'), style: 'border:1px dashed var(--d-border);border-radius:var(--d-radius)' },
      p({ class: css('_textlg _fg4') }, 'Coming soon'),
      p({ class: css('_textsm _fg4 _mt2') }, 'Recipes will show multi-component compositions: form layouts, dashboard panels, data tables with filters, etc.')
    )
  );
}

// ─── Home page ───────────────────────────────────────────────────
function HomePage(navigateTo) {
  return section({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_text2xl _fwheading _lhtight _lsheading') }, 'Decantr Workbench'),
      p({ class: css('_textsm _fg4') },
        `${TOTAL_COMPONENTS} components across ${CATEGORIES.length} categories. Select a category to explore.`
      )
    ),
    div({ class: 'wb-home-grid' },
      ...CATEGORIES.map(cat =>
        div({
          class: 'wb-home-card',
          onclick: () => navigateTo(`/components/${cat.id}`)
        },
          div({ class: css('_flex _jcsb _aic _mb2') },
            h3({}, cat.label),
            span({ class: 'wb-count' }, String(cat.children.length))
          ),
          p({}, cat.children.slice(0, 5).join(', ') + (cat.children.length > 5 ? `, +${cat.children.length - 5} more` : ''))
        )
      ),
      div({
        class: 'wb-home-card',
        onclick: () => navigateTo('/tokens')
      },
        div({ class: css('_flex _jcsb _aic _mb2') },
          h3({}, 'Token Inspector'),
          span({ class: 'wb-count' }, '170+')
        ),
        p({}, 'Colors, typography, spacing, elevation, motion, and chart tokens')
      ),
      div({
        class: 'wb-home-card',
        onclick: () => navigateTo('/recipes')
      },
        div({ class: css('_flex _jcsb _aic _mb2') },
          h3({}, 'Recipes'),
          span({ class: 'wb-count' }, '\u2014')
        ),
        p({}, 'Multi-component composition patterns')
      )
    )
  );
}

// ─── Search Modal ────────────────────────────────────────────────
function SearchModal(visible, setVisible, navigateTo) {
  const [query, setQuery] = createSignal('');
  const [activeIdx, setActiveIdx] = createSignal(0);

  function getFiltered() {
    const q = query().toLowerCase();
    if (!q) return SEARCH_INDEX.slice(0, 20);
    return SEARCH_INDEX.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q)
    );
  }

  function selectItem(item) {
    setVisible(false);
    setQuery('');
    navigateTo(`/components/${item.categoryId}`);
  }

  const inputEl = input({
    class: 'wb-search-input',
    placeholder: 'Search components...',
    oninput: (e) => { setQuery(e.target.value); setActiveIdx(0); },
    onkeydown: (e) => {
      const filtered = getFiltered();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx(Math.min(activeIdx() + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx(Math.max(activeIdx() - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[activeIdx()]) selectItem(filtered[activeIdx()]);
      } else if (e.key === 'Escape') {
        setVisible(false);
        setQuery('');
      }
    }
  });

  const resultsList = div({ class: 'wb-search-results' });
  const emptyMsg = div({ class: 'wb-search-empty' }, 'No matching components.');

  const overlay = div({
    class: 'wb-search-modal',
    style: 'display:none',
    onclick: (e) => {
      if (e.target === overlay) { setVisible(false); setQuery(''); }
    }
  },
    div({ class: 'wb-search-box' },
      inputEl,
      resultsList,
      emptyMsg
    )
  );

  // Render results reactively
  createEffect(() => {
    const filtered = getFiltered();
    const idx = activeIdx();

    while (resultsList.firstChild) resultsList.removeChild(resultsList.firstChild);

    if (filtered.length === 0) {
      emptyMsg.style.display = '';
    } else {
      emptyMsg.style.display = 'none';
      filtered.forEach((item, i) => {
        const el = div({
          class: 'wb-search-item' + (i === idx ? ' wb-active' : ''),
          onclick: () => selectItem(item)
        },
          span({}, item.name),
          span({ class: 'wb-search-item-cat' }, item.categoryLabel)
        );
        resultsList.appendChild(el);
      });
    }
  });

  // Show/hide reactively
  createEffect(() => {
    if (visible()) {
      overlay.style.display = '';
      inputEl.value = '';
      setQuery('');
      setActiveIdx(0);
      requestAnimationFrame(() => inputEl.focus());
    } else {
      overlay.style.display = 'none';
    }
  });

  return overlay;
}

// ─── App ─────────────────────────────────────────────────────────
function App() {
  const styles = getStyleList();
  const [activeStyle, setActiveStyle] = createSignal('auradecantism');
  const [activeMode, setActiveMode] = createSignal('dark');
  const [route, setRoute] = createSignal(parseRoute(getHash()));
  const [sidebarCompact, setSidebarCompact] = createSignal(false);
  const [sidebarFilter, setSidebarFilter] = createSignal('');
  const [viewport, setViewport] = createSignal('full');
  const [searchVisible, setSearchVisible] = createSignal(false);
  const [collapsed, setCollapsed] = createSignal({});

  // Apply style and mode
  createEffect(() => setStyle(activeStyle()));
  createEffect(() => setMode(activeMode()));

  // Hash change listener
  function onHashChange() {
    setRoute(parseRoute(getHash()));
  }
  window.addEventListener('hashchange', onHashChange);

  function navigateTo(path) {
    setHash(path);
  }

  // Keyboard shortcut: Cmd/Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setSearchVisible(!searchVisible());
    }
    if (e.key === 'Escape' && searchVisible()) {
      setSearchVisible(false);
    }
  });

  const styleOptions = styles.map(s => ({ value: s.id, label: s.name }));
  const modeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' },
  ];

  // ─── Content area ────────────────────────────────────────────
  const contentArea = div({ class: 'wb-content' });

  function clearContent() {
    while (contentArea.firstChild) contentArea.removeChild(contentArea.firstChild);
  }

  function renderContent() {
    clearContent();
    const r = route();
    let el;
    if (r.page === 'home') {
      el = HomePage(navigateTo);
    } else if (r.page === 'tokens') {
      el = TokensPage();
    } else if (r.page === 'recipes') {
      el = RecipesPage();
    } else if (r.page === 'category') {
      const cat = CATEGORIES.find(c => c.id === r.category);
      if (cat) {
        // Breadcrumb
        const breadcrumb = div({ class: 'wb-breadcrumb' },
          a({ onclick: () => navigateTo('/') }, 'Home'),
          span({ class: 'wb-sep' }, '/'),
          span({}, cat.label)
        );
        const content = cat.section();
        const wrapper = div({}, breadcrumb, content);
        el = wrapper;
      } else {
        el = p({ class: css('_textsm _fg4') }, 'Category not found.');
      }
    }
    if (el) contentArea.appendChild(el);
  }

  createEffect(renderContent);

  // ─── Viewport wrapper ────────────────────────────────────────
  const mainArea = main({ class: 'wb-main' });

  function updateViewport() {
    while (mainArea.firstChild) mainArea.removeChild(mainArea.firstChild);
    const vp = viewport();
    if (vp === 'full') {
      mainArea.appendChild(contentArea);
    } else {
      const vpDef = VIEWPORTS.find(v => v.id === vp);
      const w = vpDef ? vpDef.width : 0;
      const frame = div({
        class: 'wb-viewport-frame',
        style: `width:${w}px;max-height:calc(100vh - 48px);overflow:auto;margin:1.5rem auto;position:relative`
      },
        div({ class: 'wb-viewport-label' }, `${vpDef.label} \u2014 ${w}px`),
        contentArea
      );
      mainArea.appendChild(frame);
    }
  }

  createEffect(updateViewport);

  // ─── Sidebar ─────────────────────────────────────────────────
  function toggleCollapse(catId) {
    const c = { ...collapsed() };
    c[catId] = !c[catId];
    setCollapsed(c);
  }

  function buildSidebar() {
    const filter = sidebarFilter().toLowerCase();
    const compact = sidebarCompact();
    const r = route();
    const activeCat = r.category;

    const groups = CATEGORIES.map(cat => {
      const matchingChildren = filter
        ? cat.children.filter(c => c.toLowerCase().includes(filter) || cat.label.toLowerCase().includes(filter))
        : cat.children;

      if (filter && matchingChildren.length === 0) return null;

      const isCollapsed = collapsed()[cat.id] && !filter;
      const isActive = activeCat === cat.id;

      if (compact) {
        const btn = button({
          class: css('_flex _center'),
          style: `width:48px;height:36px;border:none;background:${isActive ? 'var(--d-primary-subtle)' : 'none'};cursor:pointer;color:${isActive ? 'var(--d-primary)' : 'var(--d-muted)'};font-size:0.75rem;font-weight:600;font-family:inherit`,
          title: cat.label,
          onclick: () => navigateTo(`/components/${cat.id}`)
        }, cat.label.charAt(0).toUpperCase());
        return btn;
      }

      const headerEl = button({
        class: 'wb-nav-header',
        onclick: () => toggleCollapse(cat.id)
      },
        span({}, cat.label),
        span({ class: 'wb-count' }, String(matchingChildren.length))
      );

      const items = matchingChildren.map(child =>
        button({
          class: 'wb-nav-item' + (isActive ? ' wb-active' : ''),
          onclick: () => navigateTo(`/components/${cat.id}`)
        }, child)
      );

      const itemsContainer = div({ class: 'wb-nav-items' + (isCollapsed ? ' wb-collapsed' : '') }, ...items);

      return div({ class: 'wb-nav-group' }, headerEl, itemsContainer);
    }).filter(Boolean);

    return groups;
  }

  const sidebarContent = div({ class: css('_flex _col _grow'), style: 'overflow-y:auto;padding-top:0.25rem' });

  function refreshSidebar() {
    while (sidebarContent.firstChild) sidebarContent.removeChild(sidebarContent.firstChild);
    const groups = buildSidebar();
    for (const g of groups) sidebarContent.appendChild(g);
  }

  // Refresh sidebar when route, filter, compact, or collapsed changes
  createEffect(() => {
    route(); sidebarFilter(); sidebarCompact(); collapsed();
    refreshSidebar();
  });

  const searchInput = input({
    placeholder: 'Filter...',
    oninput: (e) => setSidebarFilter(e.target.value)
  });

  const sidebarEl = nav({ class: 'wb-sidebar' },
    // Home + Tokens links at top
    div({ class: css('_flex _col'), style: 'border-bottom:1px solid var(--d-border)' },
      button({
        class: 'wb-nav-item',
        style: 'padding-left:0.75rem;font-weight:500',
        onclick: () => navigateTo('/')
      }, 'Home'),
      button({
        class: 'wb-nav-item',
        style: 'padding-left:0.75rem;font-weight:500',
        onclick: () => navigateTo('/tokens')
      }, 'Tokens'),
      button({
        class: 'wb-nav-item',
        style: 'padding-left:0.75rem;font-weight:500',
        onclick: () => navigateTo('/recipes')
      }, 'Recipes')
    ),
    div({ class: 'wb-sidebar-search' }, searchInput),
    sidebarContent
  );

  // Track compact mode
  createEffect(() => {
    if (sidebarCompact()) {
      sidebarEl.classList.add('wb-compact');
      searchInput.parentElement.style.display = 'none';
      // Hide the top nav links text area too
      sidebarEl.firstChild.style.display = 'none';
    } else {
      sidebarEl.classList.remove('wb-compact');
      searchInput.parentElement.style.display = '';
      sidebarEl.firstChild.style.display = '';
    }
  });

  // ─── Header ──────────────────────────────────────────────────
  const isMac = navigator.platform.indexOf('Mac') >= 0;
  const shortcutHint = isMac ? '\u2318K' : 'Ctrl+K';

  const headerEl = header({ class: 'wb-header' },
    div({ class: css('_flex _aic _gap3') },
      button({
        class: css('_flex _center'),
        style: 'width:28px;height:28px;border:1px solid var(--d-border);border-radius:var(--d-radius);background:var(--d-surface-1);cursor:pointer;color:var(--d-fg);font-size:0.75rem',
        title: 'Toggle compact sidebar',
        'aria-label': 'Toggle compact sidebar',
        onclick: () => setSidebarCompact(!sidebarCompact())
      }, '\u2630'),
      h1({ style: 'font-size:0.875rem;font-weight:700;letter-spacing:-0.025em;color:var(--d-fg)' }, 'decantr'),
      span({ style: 'font-size:0.6875rem;color:var(--d-muted);padding:0.125rem 0.375rem;background:var(--d-surface-1);border-radius:9999px' },
        `${TOTAL_COMPONENTS} components`
      )
    ),
    div({ class: css('_flex _aic _gap2') },
      // Viewport simulator
      div({ class: css('_flex _aic _gap1') },
        ...VIEWPORTS.map(vp =>
          button({
            style: () => `border:1px solid ${viewport() === vp.id ? 'var(--d-primary)' : 'var(--d-border)'};border-radius:var(--d-radius);background:${viewport() === vp.id ? 'var(--d-primary-subtle)' : 'var(--d-surface-1)'};cursor:pointer;padding:0.25rem 0.5rem;font-size:0.6875rem;color:${viewport() === vp.id ? 'var(--d-primary)' : 'var(--d-muted)'};font-family:inherit`,
            title: vp.label + (vp.width ? ` (${vp.width}px)` : ''),
            'aria-label': `Viewport: ${vp.label}`,
            onclick: () => setViewport(vp.id)
          }, vp.width ? `${vp.width}` : 'Full')
        )
      ),
      // Divider
      span({ style: 'width:1px;height:1.25rem;background:var(--d-border)' }),
      // Style selector
      span({ style: 'font-size:0.6875rem;color:var(--d-muted)' }, 'Style'),
      Select({
        options: styleOptions,
        value: activeStyle,
        onchange: v => setActiveStyle(v),
        size: 'sm'
      }),
      // Mode selector
      span({ style: 'font-size:0.6875rem;color:var(--d-muted)' }, 'Mode'),
      Select({
        options: modeOptions,
        value: activeMode,
        onchange: v => setActiveMode(v),
        size: 'sm'
      }),
      // Divider
      span({ style: 'width:1px;height:1.25rem;background:var(--d-border)' }),
      // Search
      button({
        style: 'display:flex;align-items:center;gap:0.375rem;border:1px solid var(--d-border);border-radius:var(--d-radius);background:var(--d-surface-1);cursor:pointer;padding:0.25rem 0.625rem;font-size:0.6875rem;color:var(--d-muted);font-family:inherit',
        'aria-label': 'Search components',
        onclick: () => setSearchVisible(true)
      },
        span({}, 'Search'),
        span({ style: 'font-size:0.625rem;padding:0.0625rem 0.375rem;background:var(--d-surface-2);border-radius:var(--d-radius);color:var(--d-muted)' }, shortcutHint)
      )
    )
  );

  // ─── Search modal ────────────────────────────────────────────
  const searchModal = SearchModal(searchVisible, setSearchVisible, navigateTo);

  // ─── Shell ───────────────────────────────────────────────────
  return div({ class: 'wb-shell' },
    headerEl,
    div({ class: 'wb-body' },
      sidebarEl,
      mainArea
    ),
    searchModal
  );
}

mount(document.getElementById('app'), App);
