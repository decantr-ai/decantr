import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon, Separator } from 'decantr/components';
import { getIconPath } from 'decantr/icons';

const { div, h2, h3, p, span, section, pre } = tags;

// ─── Icon Groups ────────────────────────────────────────────────
const ICON_GROUPS = [
  { id: 'navigation', label: 'Navigation', desc: 'Arrows, chevrons, and directional indicators', icons: ['check', 'x', 'plus', 'minus', 'chevron-down', 'chevron-up', 'chevron-left', 'chevron-right', 'chevrons-left', 'chevrons-right', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down'] },
  { id: 'actions', label: 'Actions', desc: 'Common interactive operations and controls', icons: ['search', 'menu', 'more-horizontal', 'more-vertical', 'external-link', 'home', 'bell', 'bell-ring', 'settings', 'star', 'edit', 'trash', 'copy', 'eye', 'eye-off', 'filter', 'filter-x', 'download', 'upload', 'refresh', 'loader', 'log-out', 'log-in', 'undo', 'redo', 'share', 'share-2', 'rotate-cw', 'rotate-ccw', 'scissors', 'zap', 'power', 'move'] },
  { id: 'feedback', label: 'Feedback', desc: 'Status indicators, alerts, and validation', icons: ['info', 'alert-triangle', 'alert-circle', 'check-circle', 'x-circle', 'circle-dot', 'flag', 'ban'] },
  { id: 'people', label: 'People & Security', desc: 'User accounts, permissions, and authentication', icons: ['user', 'users', 'user-plus', 'user-minus', 'shield', 'lock', 'unlock', 'key'] },
  { id: 'content', label: 'Content', desc: 'Files, documents, and media', icons: ['file', 'file-text', 'folder', 'save', 'printer', 'bookmark', 'bookmark-plus', 'archive', 'clipboard', 'paperclip', 'link', 'hash', 'tag', 'image'] },
  { id: 'communication', label: 'Communication', desc: 'Messaging, social, and engagement', icons: ['mail', 'phone', 'video', 'send', 'at-sign', 'message-square', 'message-circle', 'reply', 'heart', 'heart-crack', 'thumbs-up', 'thumbs-down', 'smile', 'frown', 'meh', 'laugh', 'angry', 'award'] },
  { id: 'layout', label: 'Layout', desc: 'Grids, panels, and spatial arrangement', icons: ['layout-dashboard', 'layout-grid', 'calendar', 'clock', 'sidebar', 'panel-left', 'panel-right', 'maximize', 'minimize', 'expand', 'shrink', 'grip-vertical', 'grid-3x3', 'kanban', 'columns', 'rows', 'layers', 'inbox'] },
  { id: 'data', label: 'Data', desc: 'Tables, charts, sorting, and analytics', icons: ['list', 'list-ordered', 'bar-chart', 'pie-chart', 'trending-up', 'trending-down', 'activity', 'percent', 'table', 'table-rows', 'table-columns', 'table-cells', 'sort-asc', 'sort-desc', 'arrow-up-down', 'spreadsheet', 'pivot-table', 'group', 'ungroup'] },
  { id: 'commerce', label: 'Commerce', desc: 'Shopping, payments, and logistics', icons: ['credit-card', 'shopping-cart', 'shopping-bag', 'store', 'wallet', 'dollar-sign', 'receipt', 'gift', 'coupon', 'barcode', 'qr-code', 'price-tag', 'percent-circle', 'shipping', 'returns', 'truck', 'package', 'box', 'boxes', 'container', 'pallet', 'forklift'] },
  { id: 'infrastructure', label: 'Infrastructure', desc: 'Development, servers, and system tools', icons: ['code', 'terminal', 'server', 'database', 'cloud', 'cloud-upload', 'cloud-download', 'wifi', 'wifi-off', 'moon', 'sun', 'cpu', 'hard-drive', 'wrench', 'tool', 'hammer', 'screwdriver', 'nut', 'plug', 'cog', 'sliders-horizontal', 'gauge', 'toggle-left', 'toggle-right'] },
  { id: 'places', label: 'Places', desc: 'Buildings, locations, and geography', icons: ['globe', 'map', 'map-pin', 'compass', 'route', 'building', 'building-2', 'hospital', 'factory', 'warehouse', 'landmark', 'door-open', 'garage', 'fence', 'construction', 'anchor', 'plane'] },
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

// ─── Icon Cell ──────────────────────────────────────────────────
function iconCell(name, navigateTo) {
  const groupId = GROUP_MAP[name] || ICON_GROUPS[0].id;
  return div({
    class: 'de-icon-cell' + (STRUCTURAL.has(name) ? ' de-structural' : ''),
    onclick: () => navigateTo(`/icons/${groupId}/${name}`),
    title: name,
  },
    icon(name, { size: '1.25rem' }),
    span({ class: 'de-icon-cell-name' }, name)
  );
}

// ─── Icon Group View ────────────────────────────────────────────
export function IconGroupView(groupId, navigateTo) {
  const group = ICON_GROUPS.find(g => g.id === groupId);
  if (!group) return div({}, p({ class: css('_fgmutedfg') }, 'Group not found.'));

  return section({ class: css('_flex _col _gap4') },
    h2({ class: css('_heading4') }, `Icons \u2014 ${group.label}`),
    p({ class: css('_body _fgmutedfg') }, `${group.icons.length} icons. ${group.desc}`),
    div({ class: 'de-icon-grid' },
      ...group.icons.map(name => iconCell(name, navigateTo))
    )
  );
}

// ─── Icon Detail View ───────────────────────────────────────────
export function IconDetail(iconName) {
  const svgPath = getIconPath(iconName);
  if (!svgPath) return div({}, p({ class: css('_fgmutedfg') }, `Unknown icon: ${iconName}`));

  const isStructural = STRUCTURAL.has(iconName);

  // Size comparison
  const sizes = div({ class: css('_flex _col _gap3') },
    h3({ class: css('_heading6') }, 'Sizes'),
    div({ class: 'de-icon-preview-sizes' },
      ...['1rem', '1.25rem', '1.5rem', '2rem', '3rem'].map(size =>
        div({ class: 'de-icon-preview-size' },
          icon(iconName, { size }),
          span({ class: 'de-icon-preview-label' }, size)
        )
      )
    )
  );

  // Usage snippets
  const usage = div({ class: css('_flex _col _gap3') },
    h3({ class: css('_heading6') }, 'Usage'),
    pre({ class: 'de-icon-code' },
      `import { icon } from 'decantr/components';\n\n` +
      `// Default size (1.25em)\nicon('${iconName}')\n\n` +
      `// Custom size\nicon('${iconName}', { size: '2rem' })\n\n` +
      `// In a button\nButton({ 'aria-label': '${iconName}' }, icon('${iconName}'))`
    )
  );

  // SVG source
  const svgSource = div({ class: css('_flex _col _gap3') },
    h3({ class: css('_heading6') }, 'SVG Source'),
    pre({ class: 'de-icon-code' }, svgPath)
  );

  return div({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _aic _gap4 _mb2') },
      div({ class: 'de-demo-box' }, icon(iconName, { size: '3rem' })),
      div({ class: css('_flex _col _gap1') },
        h2({ class: css('_heading4') }, iconName),
        isStructural
          ? span({ class: css('_caption _fgprimary') }, 'Structural \u2014 used by framework components')
          : null
      )
    ),
    sizes,
    Separator({}),
    usage,
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
