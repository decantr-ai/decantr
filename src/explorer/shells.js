import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { createSignal, createEffect } from 'decantr/state';
import { Tabs, Separator, Chip, Button, Slider, Switch } from 'decantr/components';
import { resolveShellConfig, buildGridTemplate } from 'decantr/components/shell.js';
import { activeShellConfig, setActiveShellConfig } from './shell-config.js';
import { injectExplorerCSS } from './styles.js';
injectExplorerCSS();

const { div, h2, h3, h4, p, span, code, pre, section, button } = tags;

// ─── Skeleton data (loaded from registry) ───────────────────────

let skeletonsData = {};
let skeletonsLoaded = false;

async function loadSkeletons() {
  if (skeletonsLoaded) return skeletonsData;
  try {
    const resp = await fetch('/__decantr/registry/skeletons.json');
    const data = await resp.json();
    skeletonsData = data.skeletons || {};
    skeletonsLoaded = true;
  } catch {
    skeletonsLoaded = true;
  }
  return skeletonsData;
}

// ─── CSS Miniature Thumbnail ────────────────────────────────────

const REGION_COLORS = {
  header: 'var(--d-surface-1)',
  nav: 'var(--d-surface-1)',
  body: 'var(--d-surface-0)',
  footer: 'var(--d-surface-1)',
  aside: 'var(--d-surface-1)'
};

const REGION_LABELS = {
  header: 'Header',
  nav: 'Nav',
  body: 'Body',
  footer: 'Footer',
  aside: 'Aside'
};

/**
 * Proportional grid template for thumbnail previews.
 * Uses fr units instead of absolute px so the layout scales to any container.
 */
function buildThumbnailTemplate(cfg) {
  const { grid } = cfg;
  const areas = grid.areas.map(row => `"${row.join(' ')}"`).join(' ');

  // Columns: nav/aside → 1fr, body/header → 3fr
  const firstRow = grid.areas[0];
  const colDefs = [];
  for (let c = 0; c < firstRow.length; c++) {
    const regionSet = new Set();
    for (const row of grid.areas) regionSet.add(row[c]);
    colDefs.push((regionSet.has('nav') && regionSet.size === 1) || (regionSet.has('aside') && regionSet.size === 1) ? '1fr' : '3fr');
  }

  // Rows: header/footer → 1fr, body → 3fr
  const rowDefs = [];
  for (let r = 0; r < grid.areas.length; r++) {
    const regionSet = new Set(grid.areas[r]);
    rowDefs.push((regionSet.has('body') && !regionSet.has('header') && !regionSet.has('footer')) ? '3fr' : '1fr');
  }

  return { areas, columns: colDefs.join(' '), rows: rowDefs.join(' ') };
}

function ShellThumbnail(presetId) {
  let cfg;
  try { cfg = resolveShellConfig(presetId); }
  catch { return div({ class: css('_p4 _fgmutedfg _caption') }, 'Invalid'); }

  const tpl = buildThumbnailTemplate(cfg);

  // Dynamic grid template — runtime value from config resolution
  const thumb = div({
    class: css('_grid _border _bcborder _radius _overflow[hidden] _minh[140px]'),
    style: () => `grid-template-areas:${tpl.areas};grid-template-columns:${tpl.columns};grid-template-rows:${tpl.rows}`
  });

  // Add region cells
  const rendered = new Set();
  for (const row of cfg.grid.areas) {
    for (const cell of row) {
      if (rendered.has(cell)) continue;
      rendered.add(cell);
      // grid-area + background are dynamic (cell-dependent runtime values)
      thumb.appendChild(div({
        class: css('_flex _center _border _bcborder _textxs _fgmuted _uppercase _ls[0.05em]'),
        style: () => `grid-area:${cell};background:${REGION_COLORS[cell] || 'var(--d-bg)'}`
      }, REGION_LABELS[cell] || cell));
    }
  }

  return thumb;
}

// ─── Live Preview ───────────────────────────────────────────────

function ShellPreview(presetId, configSignals) {
  const container = div({ class: css('_border _bcborder _radius _overflow[hidden] _minh[300px]') });

  createEffect(() => {
    const navPos = configSignals.navPosition();
    const navMode = configSignals.navMode();
    const showHeader = configSignals.showHeader();
    const showFooter = configSignals.showFooter();
    const showAside = configSignals.showAside();
    const sidebarW = configSignals.sidebarWidth() + 'px';
    const headerH = configSignals.headerHeight() + 'px';
    const asideW = configSignals.asideWidth() + 'px';

    const isTop = navPos === 'top';
    const hasSidebar = !isTop && navMode !== 'hidden';

    // Build areas
    const areas = [];

    if (showHeader) {
      const row = [];
      if (hasSidebar && navPos === 'left') row.push('nav');
      row.push('header');
      if (hasSidebar && navPos === 'right') row.push('nav');
      if (showAside) row.push('aside');
      areas.push(row);
    }

    // Body row
    const bodyRow = [];
    if (hasSidebar && navPos === 'left') bodyRow.push('nav');
    bodyRow.push('body');
    if (hasSidebar && navPos === 'right') bodyRow.push('nav');
    if (showAside) bodyRow.push('aside');
    areas.push(bodyRow);

    if (showFooter) {
      const footerRow = [];
      if (hasSidebar && navPos === 'left') footerRow.push('nav');
      footerRow.push('footer');
      if (hasSidebar && navPos === 'right') footerRow.push('nav');
      if (showAside) footerRow.push('aside');
      areas.push(footerRow);
    }

    // Build template strings
    const areasStr = areas.map(r => `"${r.join(' ')}"`).join(' ');

    const cols = [];
    if (hasSidebar && navPos === 'left') cols.push(navMode === 'rail' ? 'var(--de-shell-rail-w, 64px)' : sidebarW);
    cols.push('1fr');
    if (hasSidebar && navPos === 'right') cols.push(navMode === 'rail' ? 'var(--de-shell-rail-w, 64px)' : sidebarW);
    if (showAside) cols.push(asideW);

    const rowDefs = [];
    if (showHeader) rowDefs.push(headerH);
    rowDefs.push('1fr');
    if (showFooter) rowDefs.push('auto');

    container.innerHTML = '';
    // Dynamic grid template — computed from reactive signals
    const grid = div({
      class: css('_grid _h[300px]'),
      style: () => `grid-template-areas:${areasStr};grid-template-columns:${cols.join(' ')};grid-template-rows:${rowDefs.join(' ')};transition:all var(--d-duration-fast) var(--d-easing-standard)`
    });

    // Render regions
    const renderedRegions = new Set();
    for (const row of areas) {
      for (const cell of row) {
        if (renderedRegions.has(cell)) continue;
        renderedRegions.add(cell);

        let content = REGION_LABELS[cell] || cell;
        if (cell === 'header' && isTop) content = 'Header + Nav';
        if (cell === 'body') content = 'Main Content';

        // grid-area + background are dynamic per-cell
        grid.appendChild(div({
          class: css('_flex _center _border _bcborder _p2 _fgmutedfg _textsm'),
          style: () => `grid-area:${cell};background:${REGION_COLORS[cell] || 'var(--d-bg)'}`
        }, content));
      }
    }

    container.appendChild(grid);
  });

  return container;
}

// ─── Configurator Controls ──────────────────────────────────────

function ShellConfigurator(presetId, configSignals) {
  const { navPosition, setNavPosition, navMode, setNavMode,
          showHeader, setShowHeader, showFooter, setShowFooter,
          showAside, setShowAside, sidebarWidth, setSidebarWidth,
          headerHeight, setHeaderHeight, asideWidth, setAsideWidth } = configSignals;

  function segmentedControl(label, options, getter, setter) {
    return div({ class: css('_flex _aic _jcsb _gap4 _py2') },
      span({ class: css('_caption _fgmutedfg') }, label),
      div({ class: css('_flex _gap1') },
        ...options.map(opt =>
          button({
            class: () => css('_px3 _py1 _radius _caption _cursor[pointer] _border _bcborder _trans') +
              (getter() === opt.value ? ' ' + css('_bgprimary/20 _fgprimary _bcprimary/40') : ' ' + css('_bgmuted/10 _fgmutedfg')),
            onclick: () => setter(opt.value)
          }, opt.label)
        )
      )
    );
  }

  function toggleControl(label, getter, setter) {
    return div({ class: css('_flex _aic _jcsb _py2') },
      span({ class: css('_caption _fgmutedfg') }, label),
      Switch({ checked: getter, onchange: setter, size: 'sm' })
    );
  }

  function sliderControl(label, getter, setter, min, max, unit = 'px') {
    return div({ class: css('_flex _col _gap1 _py2') },
      div({ class: css('_flex _aic _jcsb') },
        span({ class: css('_caption _fgmutedfg') }, label),
        span({ class: css('_caption _fgmutedfg _fontmono') }, () => getter() + unit)
      ),
      Slider({ value: getter, onchange: setter, min, max, step: 4 })
    );
  }

  const isTopNav = () => navPosition() === 'top';

  return div({ class: css('_flex _col _gap2 _p4 _border _bcborder _radius') },
    h4({ class: css('_heading6 _mb2') }, 'Configuration'),

    segmentedControl('Nav Position', [
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' },
      { value: 'top', label: 'Top' }
    ], navPosition, setNavPosition),

    segmentedControl('Nav Mode', [
      { value: 'full', label: 'Full' },
      { value: 'rail', label: 'Rail' },
      { value: 'hidden', label: 'Hidden' }
    ], navMode, (v) => { if (!isTopNav()) setNavMode(v); }),

    Separator({}),

    toggleControl('Header', showHeader, setShowHeader),
    toggleControl('Footer', showFooter, setShowFooter),
    toggleControl('Aside Panel', showAside, setShowAside),

    Separator({}),

    sliderControl('Sidebar Width', sidebarWidth, setSidebarWidth, 48, 400),
    sliderControl('Header Height', headerHeight, setHeaderHeight, 36, 80),
    sliderControl('Aside Width', asideWidth, setAsideWidth, 200, 480),

    Separator({}),

    // Apply to Workbench toggle
    div({ class: css('_flex _aic _jcsb _py2') },
      span({ class: css('_caption _fgprimary _bold') }, 'Apply to Workbench'),
      Switch({
        checked: () => !!activeShellConfig(),
        onchange: (checked) => {
          if (checked) {
            setActiveShellConfig({
              presetId,
              navPosition: navPosition(),
              navMode: navMode(),
              showHeader: showHeader(),
              showFooter: showFooter(),
              showAside: showAside(),
              sidebarWidth: sidebarWidth(),
              headerHeight: headerHeight(),
              asideWidth: asideWidth()
            });
          } else {
            setActiveShellConfig(null);
          }
        },
        size: 'sm'
      })
    )
  );
}

// ─── Code Tab ───────────────────────────────────────────────────

function ShellCodeTab(presetId, configSignals) {
  const codeContainer = div({ class: css('_flex _col _gap3') });

  createEffect(() => {
    const navPos = configSignals.navPosition();
    const navMode = configSignals.navMode();
    const showHeader = configSignals.showHeader();
    const showFooter = configSignals.showFooter();
    const showAside = configSignals.showAside();

    const subComponents = [];
    if (showHeader) subComponents.push("  Shell.Header({}, 'Header content')");
    if (navPos !== 'top' && navMode !== 'hidden') subComponents.push("  Shell.Nav({}, navContent)");
    subComponents.push("  Shell.Body({}, mainContent)");
    if (showFooter) subComponents.push("  Shell.Footer({}, 'Footer')");
    if (showAside) subComponents.push("  Shell.Aside({}, asideContent)");

    const codeStr = `import { Shell } from 'decantr/components';
import { createSignal } from 'decantr/state';

const [navState, setNavState] = createSignal('${navMode === 'rail' ? 'rail' : 'expanded'}');

Shell({
  config: '${presetId}',
  navState,
  onNavStateChange: setNavState
},
${subComponents.join(',\n')}
)`;

    codeContainer.innerHTML = '';

    const copyBtn = Button({
      variant: 'outline', size: 'sm',
      onclick: () => {
        navigator.clipboard?.writeText(codeStr);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy Code'; }, 1500);
      }
    }, 'Copy Code');

    codeContainer.appendChild(
      div({ class: css('_flex _jce _mb2') }, copyBtn)
    );
    codeContainer.appendChild(
      pre({ class: css('_p4 _bgmuted/10 _radius _overflow[auto] _caption _fontmono _border _bcborder _whitespace[pre-wrap] _wb[break-word]') }, codeStr)
    );
  });

  return codeContainer;
}

// ─── Shell Detail (3 tabs) ──────────────────────────────────────

export function ShellDetail(presetId) {
  const container = div({ class: css('_flex _col _gap4') },
    p({ class: css('_body _fgmutedfg') }, 'Loading shell layout...')
  );

  // Config signals
  const [navPosition, setNavPosition] = createSignal('left');
  const [navMode, setNavMode] = createSignal('full');
  const [showHeader, setShowHeader] = createSignal(true);
  const [showFooter, setShowFooter] = createSignal(false);
  const [showAside, setShowAside] = createSignal(false);
  const [sidebarWidth, setSidebarWidth] = createSignal(240);
  const [headerHeight, setHeaderHeight] = createSignal(52);
  const [asideWidth, setAsideWidth] = createSignal(280);

  const configSignals = {
    navPosition, setNavPosition, navMode, setNavMode,
    showHeader, setShowHeader, showFooter, setShowFooter,
    showAside, setShowAside, sidebarWidth, setSidebarWidth,
    headerHeight, setHeaderHeight, asideWidth, setAsideWidth
  };

  loadSkeletons().then(skeletons => {
    container.innerHTML = '';
    const skeleton = skeletons[presetId];

    if (!skeleton) {
      container.appendChild(p({ class: css('_fgmutedfg _body') }, `Shell layout "${presetId}" not found.`));
      return;
    }

    // Initialize config signals from skeleton data
    const cfg = skeleton.config;
    if (cfg) {
      if (cfg.nav?.position) setNavPosition(cfg.nav.position);
      if (cfg.nav?.defaultState === 'hidden') setNavMode('hidden');
      if (cfg.regions?.includes('footer')) setShowFooter(true);
      if (cfg.regions?.includes('aside')) setShowAside(true);
      if (cfg.header?.height) setHeaderHeight(parseInt(cfg.header.height) || 52);
      if (cfg.nav?.width) setSidebarWidth(parseInt(cfg.nav.width) || 240);
      if (cfg.aside?.width) setAsideWidth(parseInt(cfg.aside.width) || 280);
    }

    // Title
    container.appendChild(
      div({ class: css('_flex _col _gap1 _mb3') },
        h2({ class: css('_heading4') }, skeleton.name || presetId),
        p({ class: css('_body _fgmutedfg') }, skeleton.description || 'Configurable shell layout.')
      )
    );

    // Tabs
    container.appendChild(Tabs({
      tabs: [
        {
          id: 'features',
          label: 'Features',
          content: () => featuresTab(skeleton, presetId)
        },
        {
          id: 'configuration',
          label: 'Configuration',
          content: () => div({ class: css('_flex _col _gap4') },
            ShellPreview(presetId, configSignals),
            ShellConfigurator(presetId, configSignals)
          )
        },
        {
          id: 'code',
          label: 'Code',
          content: () => ShellCodeTab(presetId, configSignals)
        }
      ]
    }));
  });

  return container;
}

function featuresTab(skeleton, presetId) {
  const sections = [];

  // Thumbnail preview
  sections.push(
    div({ class: css('_flex _col _gap3') },
      h4({ class: css('_heading5') }, 'Shell Layout'),
      ShellThumbnail(presetId)
    )
  );

  // Layout type
  sections.push(
    div({ class: css('_flex _col _gap2') },
      h4({ class: css('_heading6') }, 'Details'),
      div({ class: css('_flex _gap2 _wrap') },
        Chip({ label: `Layout: ${skeleton.layout || 'grid'}`, size: 'sm' }),
        Chip({ label: `Atoms: ${skeleton.atoms || ''}`, variant: 'outline', size: 'sm' })
      )
    )
  );

  // Config regions
  const cfg = skeleton.config;
  if (cfg) {
    sections.push(Separator({}));
    sections.push(
      div({ class: css('_flex _col _gap2') },
        h4({ class: css('_heading6') }, 'Regions'),
        div({ class: css('_flex _gap2 _wrap') },
          ...cfg.regions.map(r => Chip({ label: r, variant: 'outline', size: 'sm' }))
        )
      )
    );

    if (cfg.nav) {
      sections.push(
        div({ class: css('_flex _col _gap1') },
          h4({ class: css('_heading6') }, 'Nav Config'),
          code({ class: css('_caption _fgmutedfg') }, `Position: ${cfg.nav.position || 'left'}`),
          cfg.nav.width ? code({ class: css('_caption _fgmutedfg') }, `Width: ${cfg.nav.width}`) : null,
          cfg.nav.collapseTo ? code({ class: css('_caption _fgmutedfg') }, `Collapse to: ${cfg.nav.collapseTo}`) : null,
          cfg.nav.collapseBelow ? code({ class: css('_caption _fgmutedfg') }, `Auto-collapse below: ${cfg.nav.collapseBelow}`) : null
        )
      );
    }
  }

  // Configurable options
  const configurable = skeleton.configurable;
  if (configurable) {
    sections.push(Separator({}));
    sections.push(
      div({ class: css('_flex _col _gap2') },
        h4({ class: css('_heading6') }, 'Configurable'),
        configurable.nav?.positions ?
          div({}, span({ class: css('_caption _fgmutedfg') }, `Nav positions: ${configurable.nav.positions.join(', ')}`)) : null,
        configurable.nav?.modes ?
          div({}, span({ class: css('_caption _fgmutedfg') }, `Nav modes: ${configurable.nav.modes.join(', ')}`)) : null,
        configurable.footer?.toggleable ?
          div({}, span({ class: css('_caption _fgmutedfg') }, 'Footer: toggleable')) : null,
        configurable.aside?.toggleable ?
          div({}, span({ class: css('_caption _fgmutedfg') }, 'Aside: toggleable')) : null
      )
    );
  }

  return div({ class: css('_flex _col _gap4') }, ...sections);
}

// ─── Shell List View (gallery) ──────────────────────────────────

export function ShellListView(navigateTo) {
  const container = div({ class: css('_flex _col _gap4') },
    p({ class: css('_body _fgmutedfg') }, 'Loading shell layouts...')
  );

  loadSkeletons().then(skeletons => {
    container.innerHTML = '';
    const entries = Object.entries(skeletons);
    container.appendChild(h2({ class: css('_heading4 _mb2') }, 'Shells'));
    container.appendChild(p({ class: css('_body _fgmutedfg _mb3') }, `${entries.length} configurable shell layouts.`));

    const grid = div({ class: 'de-card-grid' });
    for (const [id, skel] of entries) {
      grid.appendChild(div({
        class: 'de-card-item',
        onclick: () => navigateTo(`/shells/${id}`)
      },
        ShellThumbnail(id),
        div({ class: css('_flex _col _gap2') },
          h3({ class: css('_heading6') }, skel.name || id),
          p({ class: css('_caption _fgmutedfg') }, skel.description || ''),
          skel.config ? div({ class: css('_flex _gap1 _wrap') },
            ...(skel.config.regions || []).map(r =>
              Chip({ label: r, variant: 'outline', size: 'sm' })
            )
          ) : null
        )
      ));
    }
    container.appendChild(grid);
  });

  return container;
}

// ─── Sidebar items loader ───────────────────────────────────────

export async function loadShellItems() {
  try {
    const resp = await fetch('/__decantr/registry/skeletons.json');
    const data = await resp.json();
    return Object.entries(data.skeletons || {}).map(([id, skel]) => ({
      id, label: skel.name || id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
    }));
  } catch {
    return [];
  }
}
