import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon, Separator, Slider, Switch } from 'decantr/components';
import { createSignal, createEffect } from 'decantr/state';
import { getIconPath } from 'decantr/icons';

const { div, h2, h3, p, span, section, pre, label } = tags;

// ─── Icon Groups ────────────────────────────────────────────────
const ICON_GROUPS = [
  { id: 'navigation', label: 'Navigation', desc: 'Arrows, chevrons, and directional indicators', icons: ['check', 'x', 'plus', 'minus', 'chevron-down', 'chevron-up', 'chevron-left', 'chevron-right', 'chevrons-left', 'chevrons-right', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down', 'navigation'] },
  { id: 'actions', label: 'Actions', desc: 'Common interactive operations and controls', icons: ['search', 'menu', 'more-horizontal', 'more-vertical', 'external-link', 'home', 'bell', 'bell-ring', 'settings', 'star', 'edit', 'trash', 'copy', 'eye', 'eye-off', 'filter', 'filter-x', 'download', 'upload', 'refresh', 'loader', 'log-out', 'log-in', 'undo', 'redo', 'share', 'share-2', 'rotate-cw', 'rotate-ccw', 'scissors', 'zap', 'power', 'move', 'scan', 'wand', 'sparkles', 'eraser'] },
  { id: 'feedback', label: 'Feedback', desc: 'Status indicators, alerts, and validation', icons: ['info', 'alert-triangle', 'alert-circle', 'check-circle', 'x-circle', 'circle-dot', 'flag', 'ban', 'alarm'] },
  { id: 'people', label: 'People & Security', desc: 'User accounts, permissions, and authentication', icons: ['user', 'users', 'user-plus', 'user-minus', 'user-check', 'user-x', 'users-round', 'shield', 'shield-check', 'shield-x', 'shield-alert', 'lock', 'lock-keyhole', 'unlock', 'key', 'fingerprint', 'eye-scan', 'id-card', 'passport'] },
  { id: 'content', label: 'Content', desc: 'Files, documents, and media', icons: ['file', 'file-text', 'file-plus', 'file-minus', 'file-check', 'file-x', 'file-search', 'file-code', 'file-spreadsheet', 'file-image', 'file-audio', 'file-video', 'files', 'folder', 'folder-open', 'folder-plus', 'folder-check', 'save', 'printer', 'bookmark', 'bookmark-plus', 'archive', 'clipboard', 'paperclip', 'link', 'unlink', 'hash', 'tag', 'image'] },
  { id: 'communication', label: 'Communication', desc: 'Messaging, social, and engagement', icons: ['mail', 'phone', 'video', 'send', 'at-sign', 'at', 'message-square', 'message-circle', 'reply', 'rss', 'podcast', 'microphone', 'microphone-off', 'headphones', 'megaphone', 'newspaper', 'radio', 'tv', 'cast', 'heart', 'heart-crack', 'thumbs-up', 'thumbs-down', 'smile', 'frown', 'meh', 'laugh', 'angry', 'award'] },
  { id: 'time', label: 'Time', desc: 'Clocks, calendars, scheduling, and deadlines', icons: ['clock', 'timer', 'hourglass', 'alarm-clock', 'watch', 'watch-smart', 'history', 'calendar', 'calendar-check', 'calendar-plus', 'calendar-x'] },
  { id: 'layout', label: 'Layout', desc: 'Grids, panels, and spatial arrangement', icons: ['layout-dashboard', 'layout-grid', 'sidebar', 'panel-left', 'panel-right', 'maximize', 'minimize', 'expand', 'shrink', 'grip-vertical', 'grid-3x3', 'kanban', 'columns', 'rows', 'layers', 'inbox', 'blocks'] },
  { id: 'data', label: 'Data', desc: 'Tables, sorting, and structured data', icons: ['list', 'list-ordered', 'table', 'table-rows', 'table-columns', 'table-cells', 'sort-asc', 'sort-desc', 'arrow-up-down', 'spreadsheet', 'pivot-table', 'group', 'ungroup'] },
  { id: 'charts', label: 'Charts & Analytics', desc: 'Chart types, trends, and analytics concepts', icons: ['bar-chart', 'bar-chart-horizontal', 'stacked-bar-chart', 'line-chart', 'area-chart', 'pie-chart', 'chart-donut', 'histogram', 'chart-scatter', 'bubble-chart', 'chart-radar', 'chart-heatmap', 'chart-treemap', 'chart-sankey', 'chart-funnel', 'chart-waterfall', 'chart-gantt', 'candlestick-chart', 'trending-up', 'trending-down', 'activity', 'percent', 'analytics', 'metric', 'kpi-card', 'benchmark', 'sparkline', 'trendline', 'chart-comparison', 'chart-correlation', 'chart-forecast', 'chart-growth', 'chart-decline', 'chart-distribution'] },
  { id: 'commerce', label: 'Commerce', desc: 'Shopping, payments, and logistics', icons: ['credit-card', 'shopping-cart', 'shopping-bag', 'store', 'wallet', 'dollar-sign', 'receipt', 'gift', 'coupon', 'barcode', 'qr-code', 'price-tag', 'percent-circle', 'shipping', 'returns', 'truck', 'package', 'box', 'boxes', 'container', 'pallet', 'forklift'] },
  { id: 'business', label: 'Business & Finance', desc: 'Banking, contracts, and professional tools', icons: ['calculator', 'bank', 'coins', 'piggy-bank', 'invoice', 'contract', 'signature', 'stamp', 'briefcase', 'handshake', 'scale', 'target', 'crown', 'lighthouse'] },
  { id: 'media', label: 'Media & Creative', desc: 'Photography, design tools, and text formatting', icons: ['camera', 'camera-off', 'film', 'palette', 'brush', 'pen-tool', 'eyedropper', 'crop', 'type', 'align-left', 'align-center', 'align-right', 'align-justify', 'pencil', 'pen'] },
  { id: 'devices', label: 'Devices & Technology', desc: 'Hardware, connectivity, and device types', icons: ['smartphone', 'tablet', 'laptop', 'monitor', 'bluetooth', 'usb', 'battery', 'battery-charging', 'battery-low', 'signal', 'satellite', 'robot', 'chip'] },
  { id: 'infrastructure', label: 'Infrastructure', desc: 'Development, servers, and system tools', icons: ['code', 'terminal', 'server', 'database', 'cloud', 'cloud-upload', 'cloud-download', 'cloud-cog', 'cloud-lightning', 'wifi', 'wifi-off', 'moon', 'sun', 'cpu', 'hard-drive', 'wrench', 'tool', 'hammer', 'screwdriver', 'nut', 'plug', 'cog', 'sliders-horizontal', 'gauge', 'toggle-left', 'toggle-right', 'bug', 'cctv'] },
  { id: 'workflow', label: 'Workflow & Dev', desc: 'Version control, CI/CD, and project management', icons: ['git-branch', 'git-merge', 'git-pull-request', 'git-commit', 'milestone', 'workflow', 'variable', 'regex', 'binary', 'webhook', 'api', 'container-ship'] },
  { id: 'healthcare', label: 'Healthcare', desc: 'Medical, wellness, and accessibility', icons: ['stethoscope', 'pill', 'syringe', 'heart-pulse', 'bandage', 'thermometer', 'brain', 'dna', 'accessibility', 'baby', 'apple', 'dumbbell'] },
  { id: 'education', label: 'Education', desc: 'Learning, achievements, and school', icons: ['book', 'book-open', 'graduation-cap', 'notebook', 'presentation', 'trophy', 'medal', 'school', 'lightbulb', 'puzzle'] },
  { id: 'transport', label: 'Transportation', desc: 'Vehicles, travel, and logistics', icons: ['car', 'bus', 'train', 'bicycle', 'ship', 'rocket', 'helicopter', 'taxi', 'parking', 'fuel', 'map-compass'] },
  { id: 'food', label: 'Food & Hospitality', desc: 'Dining, beverages, and culinary', icons: ['utensils', 'coffee', 'wine', 'pizza', 'cake', 'chef-hat', 'grape', 'wheat'] },
  { id: 'home', label: 'Home & Real Estate', desc: 'Furniture, property, and living spaces', icons: ['house', 'apartment', 'sofa', 'lamp', 'bed', 'bath', 'garden', 'door-closed', 'window', 'air-conditioning'] },
  { id: 'weather', label: 'Weather', desc: 'Climate, nature, and environment', icons: ['umbrella', 'wind', 'droplet', 'snowflake', 'sunrise', 'sunset', 'leaf', 'tree', 'mountain'] },
  { id: 'places', label: 'Places', desc: 'Buildings, locations, and geography', icons: ['globe', 'map', 'map-pin', 'compass', 'route', 'building', 'building-2', 'hospital', 'factory', 'warehouse', 'landmark', 'door-open', 'garage', 'fence', 'construction', 'anchor', 'plane'] },
  { id: 'shapes', label: 'Shapes & Symbols', desc: 'Geometric shapes and common symbols', icons: ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'infinity', 'asterisk', 'hash-tag', 'parentheses'] },
];

// Structural icons used internally by framework components
const STRUCTURAL = new Set([
  'chevron-down', 'chevron-up', 'chevron-left', 'chevron-right',
  'check', 'x', 'calendar', 'clock', 'search', 'arrow-up',
  'grip-vertical', 'info', 'check-circle', 'alert-triangle', 'x-circle',
]);

// Reverse lookup: icon name → group id
const GROUP_MAP = {};
for (const g of ICON_GROUPS) for (const name of g.icons) GROUP_MAP[name] = g.id;

// ─── Weight/Fill Control Bar ────────────────────────────────────
function iconControlBar(weightSignal, filledSignal) {
  const [weight, setWeight] = weightSignal;
  const [filled, setFilled] = filledSignal;
  return div({ class: css('_flex _aic _gap4 _p3 _bgmuted _r2 _mb2') },
    div({ class: css('_flex _aic _gap2 _flex1') },
      label({ class: css('_caption _fgmutedfg') }, 'Weight'),
      Slider({ min: 0.5, max: 4, step: 0.5, value: weight(), showValue: true, onChange: setWeight })
    ),
    div({ class: css('_flex _aic _gap2') },
      Switch({ label: 'Filled', checked: filled(), onChange: setFilled })
    )
  );
}

// ─── Icon Cell ──────────────────────────────────────────────────
function iconCell(name, navigateTo, weight, filled) {
  const groupId = GROUP_MAP[name] || ICON_GROUPS[0].id;
  return div({
    class: 'de-icon-cell' + (STRUCTURAL.has(name) ? ' de-structural' : ''),
    onclick: () => navigateTo(`/icons/${groupId}/${name}`),
    title: name,
  },
    icon(name, { size: '1.25rem', weight, filled }),
    span({ class: 'de-icon-cell-name' }, name)
  );
}

// ─── Icon Group View ────────────────────────────────────────────
export function IconGroupView(groupId, navigateTo) {
  const group = ICON_GROUPS.find(g => g.id === groupId);
  if (!group) return div({}, p({ class: css('_fgmutedfg') }, 'Group not found.'));

  const weightSignal = createSignal(2);
  const filledSignal = createSignal(false);
  const [weight] = weightSignal;
  const [filled] = filledSignal;

  const gridContainer = div({ class: 'de-icon-grid' });

  function rebuildGrid() {
    gridContainer.innerHTML = '';
    const w = weight();
    const f = filled();
    for (const name of group.icons) {
      gridContainer.appendChild(iconCell(name, navigateTo, w, f));
    }
  }

  rebuildGrid();
  createEffect(() => { weight(); filled(); rebuildGrid(); });

  return section({ class: css('_flex _col _gap4') },
    h2({ class: css('_heading4') }, `Icons \u2014 ${group.label}`),
    p({ class: css('_body _fgmutedfg') }, `${group.icons.length} icons. ${group.desc}`),
    iconControlBar(weightSignal, filledSignal),
    gridContainer
  );
}

// ─── Icon Detail View ───────────────────────────────────────────
export function IconDetail(iconName) {
  const svgPath = getIconPath(iconName);
  if (!svgPath) return div({}, p({ class: css('_fgmutedfg') }, `Unknown icon: ${iconName}`));

  const isStructural = STRUCTURAL.has(iconName);
  const weightSignal = createSignal(2);
  const filledSignal = createSignal(false);
  const [weight] = weightSignal;
  const [filled] = filledSignal;

  // Reactive preview + sizes
  const previewBox = div({ class: 'de-demo-box' });
  const sizesRow = div({ class: 'de-icon-preview-sizes' });
  const usageBlock = pre({ class: 'de-icon-code' });

  function rebuildPreview() {
    const w = weight();
    const f = filled();
    previewBox.innerHTML = '';
    previewBox.appendChild(icon(iconName, { size: '3rem', weight: w, filled: f }));
    sizesRow.innerHTML = '';
    for (const size of ['1rem', '1.25rem', '1.5rem', '2rem', '3rem']) {
      const cell = div({ class: 'de-icon-preview-size' },
        icon(iconName, { size, weight: w, filled: f }),
        span({ class: 'de-icon-preview-label' }, size)
      );
      sizesRow.appendChild(cell);
    }
    // Update usage snippets
    const wOpt = w !== 2 ? `, weight: ${w}` : '';
    const fOpt = f ? `, filled: true` : '';
    const optsStr = (wOpt || fOpt) ? `, {${wOpt}${fOpt} }` : '';
    usageBlock.textContent =
      `import { icon } from 'decantr/components';\n\n` +
      `// Default size (1.25em)\nicon('${iconName}'${optsStr})\n\n` +
      `// Custom size\nicon('${iconName}', { size: '2rem'${wOpt}${fOpt} })\n\n` +
      `// In a button\nButton({ 'aria-label': '${iconName}' }, icon('${iconName}'${optsStr}))`;
  }

  rebuildPreview();
  createEffect(() => { weight(); filled(); rebuildPreview(); });

  // SVG source
  const svgSource = div({ class: css('_flex _col _gap3') },
    h3({ class: css('_heading6') }, 'SVG Source'),
    pre({ class: 'de-icon-code' }, svgPath)
  );

  return div({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _aic _gap4 _mb2') },
      previewBox,
      div({ class: css('_flex _col _gap1') },
        h2({ class: css('_heading4') }, iconName),
        isStructural
          ? span({ class: css('_caption _fgprimary') }, 'Structural \u2014 used by framework components')
          : null
      )
    ),
    iconControlBar(weightSignal, filledSignal),
    div({ class: css('_flex _col _gap3') },
      h3({ class: css('_heading6') }, 'Sizes'),
      sizesRow
    ),
    Separator({}),
    div({ class: css('_flex _col _gap3') },
      h3({ class: css('_heading6') }, 'Usage'),
      usageBlock
    ),
    Separator({}),
    svgSource
  );
}

// ─── Sidebar Data Loader ────────────────────────────────────────
export async function loadIconItems() {
  return ICON_GROUPS.map(g => ({
    id: g.id,
    label: g.label,
  }));
}
