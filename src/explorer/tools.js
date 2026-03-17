/**
 * Tools explorer — Theme Studio.
 * Theme Studio allows live style creation with 10 seeds + 6 personality traits.
 */
import { createSignal, createEffect, createMemo, batch } from 'decantr/state';
import { onDestroy } from 'decantr/core';
import { css, registerStyle, setStyle, setMode, getStyle, getMode, getStyleList } from 'decantr/css';
import { tags } from 'decantr/tags';
import { injectExplorerCSS } from './styles.js';
injectExplorerCSS();
import {
  Button, ColorPicker, Input, Select, Segmented, Tabs, Badge,
  Checkbox, Switch, Card, Chip, Alert, Drawer, icon
} from 'decantr/components';
import { derive, defaultSeed, defaultPersonality, deriveMonochromeSeed, hexToRgb, contrast } from 'decantr/css/derive.js';
import { auradecantism } from 'decantr/css/styles/auradecantism.js';
import { clean } from 'decantr/css/styles/addons/clean.js';
import { retro } from 'decantr/css/styles/addons/retro.js';
import { glassmorphism } from 'decantr/css/styles/addons/glassmorphism.js';
import { commandCenter } from 'decantr/css/styles/addons/command-center.js';

const { div, h2, h3, h4, p, span, pre, code, section, strong, label } = tags;

// ─── Style presets ────────────────────────────────────────────────

const BUILT_IN_STYLES = [auradecantism, clean, retro, glassmorphism, commandCenter];

const PRESET_OPTIONS = [
  { value: '__blank', label: 'Blank' },
  ...BUILT_IN_STYLES.map(s => ({ value: s.id, label: s.name })),
];

const PERSONALITY_OPTIONS = {
  radius: [
    { value: 'sharp', label: 'Sharp' },
    { value: 'rounded', label: 'Rounded' },
    { value: 'pill', label: 'Pill' },
  ],
  elevation: [
    { value: 'flat', label: 'Flat' },
    { value: 'subtle', label: 'Subtle' },
    { value: 'raised', label: 'Raised' },
    { value: 'glass', label: 'Glass' },
    { value: 'brutalist', label: 'Brutalist' },
  ],
  motion: [
    { value: 'instant', label: 'Instant' },
    { value: 'snappy', label: 'Snappy' },
    { value: 'smooth', label: 'Smooth' },
    { value: 'bouncy', label: 'Bouncy' },
  ],
  borders: [
    { value: 'none', label: 'None' },
    { value: 'thin', label: 'Thin' },
    { value: 'bold', label: 'Bold' },
  ],
  density: [
    { value: 'compact', label: 'Compact' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'spacious', label: 'Spacious' },
  ],
  gradient: [
    { value: 'none', label: 'None' },
    { value: 'subtle', label: 'Subtle' },
    { value: 'vivid', label: 'Vivid' },
    { value: 'mesh', label: 'Mesh' },
  ],
};

const SEED_KEYS = ['primary', 'accent', 'tertiary', 'neutral', 'success', 'warning', 'error', 'info', 'bg', 'bgDark'];
const PERSONALITY_KEYS = ['radius', 'elevation', 'motion', 'borders', 'density', 'gradient'];

// ─── Contrast pairs (mirrors derive.js validateContrast() PAIRS) ─
const CONTRAST_PAIRS = [
  // Text contrast (WCAG AA 4.5:1)
  ['--d-primary', '--d-primary-fg', 'Primary / fg', 4.5],
  ['--d-accent', '--d-accent-fg', 'Accent / fg', 4.5],
  ['--d-tertiary', '--d-tertiary-fg', 'Tertiary / fg', 4.5],
  ['--d-success', '--d-success-fg', 'Success / fg', 4.5],
  ['--d-warning', '--d-warning-fg', 'Warning / fg', 4.5],
  ['--d-error', '--d-error-fg', 'Error / fg', 4.5],
  ['--d-info', '--d-info-fg', 'Info / fg', 4.5],
  ['--d-bg', '--d-fg', 'Background / Foreground', 4.5],
  ['--d-bg', '--d-muted-fg', 'Background / Muted fg', 4.5],
  ['--d-surface-0', '--d-surface-0-fg', 'Surface 0 / fg', 4.5],
  ['--d-surface-1', '--d-surface-1-fg', 'Surface 1 / fg', 4.5],
  ['--d-surface-2', '--d-surface-2-fg', 'Surface 2 / fg', 4.5],
  ['--d-surface-3', '--d-surface-3-fg', 'Surface 3 / fg', 4.5],
  ['--d-primary-subtle', '--d-primary-subtle-fg', 'Primary subtle / fg', 4.5],
  ['--d-accent-subtle', '--d-accent-subtle-fg', 'Accent subtle / fg', 4.5],
  ['--d-tertiary-subtle', '--d-tertiary-subtle-fg', 'Tertiary subtle / fg', 4.5],
  ['--d-error-subtle', '--d-error-subtle-fg', 'Error subtle / fg', 4.5],
  ['--d-success-subtle', '--d-success-subtle-fg', 'Success subtle / fg', 4.5],
  ['--d-warning-subtle', '--d-warning-subtle-fg', 'Warning subtle / fg', 4.5],
  ['--d-info-subtle', '--d-info-subtle-fg', 'Info subtle / fg', 4.5],
  // Non-text contrast (WCAG 1.4.11 3:1)
  ['--d-bg', '--d-border', 'Background / Border', 3],
  ['--d-surface-1', '--d-surface-1-border', 'Surface 1 / Border', 3],
  ['--d-surface-2', '--d-surface-2-border', 'Surface 2 / Border', 3],
  ['--d-surface-3', '--d-surface-3-border', 'Surface 3 / Border', 3],
  ['--d-field-bg', '--d-field-placeholder', 'Field / Placeholder', 3],
  ['--d-selected-bg', '--d-selected-fg', 'Selected bg / fg', 4.5],
  ['--d-chrome-bg', '--d-chrome-fg', 'Chrome bg / fg', 4.5],
];

// ─── Token categories for dynamic grouping ──────────────────────
const TOKEN_CATEGORIES = [
  { label: 'Palette', match: k => /^--d-(primary|accent|tertiary|success|warning|error|info)($|-)/.test(k) && !/subtle/.test(k), type: 'color' },
  { label: 'Palette Subtle', match: k => /^--d-(primary|accent|tertiary|success|warning|error|info)-subtle/.test(k), type: 'color' },
  { label: 'Neutral', match: k => /^--d-(bg|fg|muted|muted-fg|border|border-strong|ring|overlay)$/.test(k), type: 'color' },
  { label: 'Surfaces', match: k => /^--d-surface-/.test(k), type: 'color' },
  { label: 'Elevation', match: k => /^--d-elevation-/.test(k), type: 'value' },
  { label: 'Field', match: k => /^--d-field-/.test(k), type: 'color' },
  { label: 'Interactive States', match: k => /^--d-(item-|selected-|disabled-|icon-)/.test(k), type: 'color' },
  { label: 'Table', match: k => /^--d-table-/.test(k), type: 'color' },
  { label: 'Chart', match: k => /^--d-chart-/.test(k), type: 'color' },
  { label: 'Overlay', match: k => /^--d-overlay-/.test(k), type: 'color' },
  { label: 'Scrollbar', match: k => /^--d-scrollbar-/.test(k), type: 'value' },
  { label: 'Skeleton', match: k => /^--d-skeleton-/.test(k), type: 'value' },
  { label: 'Interaction', match: k => /^--d-(hover-|active-|focus-ring-|selection-)/.test(k), type: 'value' },
  { label: 'Motion', match: k => /^--d-(duration-|easing-|motion-)/.test(k), type: 'value' },
  { label: 'Radius', match: k => /^--d-radius/.test(k), type: 'value' },
  { label: 'Border', match: k => /^--d-border-(width|style)/.test(k), type: 'value' },
  { label: 'Density', match: k => /^--d-density-/.test(k), type: 'value' },
  { label: 'Gradient', match: k => /^--d-gradient-/.test(k), type: 'value' },
  { label: 'Typography', match: k => /^--d-(font|text-|lh-|fw-|ls-)/.test(k), type: 'value' },
  { label: 'Spacing', match: k => /^--d-(sp-|pad$|compound-|offset-|panel-max|tree-indent)/.test(k), type: 'value' },
  { label: 'Z-Index', match: k => /^--d-z-/.test(k), type: 'value' },
  { label: 'Glass', match: k => /^--d-glass-/.test(k), type: 'value' },
  { label: 'Layout', match: k => /^--d-(content-width|sidebar-width|drawer-|prose-width)/.test(k), type: 'value' },
  { label: 'Chrome', match: k => /^--d-chrome-/.test(k), type: 'color' },
  { label: 'Component', match: () => true, type: 'value' },
];

// ─── Sidebar items ───────────────────────────────────────────────

export async function loadToolItems() {
  return [
    { id: 'theme-studio', label: 'Theme Studio' },
  ];
}

// ─── Theme Studio ────────────────────────────────────────────────

export function ThemeStudio() {
  // Capture original style/mode to restore on unmount
  const originalStyleId = getStyle();
  const originalMode = getMode();

  // Seed signals
  const seeds = {};
  const seedSetters = {};
  for (const key of SEED_KEYS) {
    const [get, set] = createSignal(defaultSeed[key] || '#888888');
    seeds[key] = get;
    seedSetters[key] = set;
  }

  // Personality signals
  const personality = {};
  const personalitySetters = {};
  for (const key of PERSONALITY_KEYS) {
    const [get, set] = createSignal(defaultPersonality[key]);
    personality[key] = get;
    personalitySetters[key] = set;
  }

  const [previewMode, setPreviewMode] = createSignal('dark');
  const [styleName, setStyleName] = createSignal('my-custom-style');
  const [sheetOpen, setSheetOpen] = createSignal(false);

  // Compose seed + personality objects from signals
  const seedObj = createMemo(() => {
    const obj = {};
    for (const key of SEED_KEYS) obj[key] = seeds[key]();
    return obj;
  });

  const personalityObj = createMemo(() => {
    const obj = {};
    for (const key of PERSONALITY_KEYS) obj[key] = personality[key]();
    return obj;
  });

  // Derive tokens for inspection
  const tokens = createMemo(() => derive(seedObj(), personalityObj(), previewMode()));

  // Style definition for export
  const styleDef = createMemo(() => ({
    id: '__ts-preview',
    name: styleName(),
    seed: seedObj(),
    personality: personalityObj(),
  }));

  // Export code
  const exportCode = createMemo(() => {
    const def = styleDef();
    const exportDef = { ...def, id: styleName().replace(/\s+/g, '-').toLowerCase() };
    return `import { registerStyle, setStyle } from 'decantr/css';\n\nregisterStyle(${JSON.stringify(exportDef, null, 2)});\nsetStyle('${exportDef.id}');`;
  });

  // Live preview: register + apply style
  let rafId = null;
  createEffect(() => {
    const def = styleDef();
    previewMode(); // track
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      registerStyle(def);
      setStyle('__ts-preview');
      setMode(previewMode());
    });
  });

  // Restore on unmount
  onDestroy(() => {
    if (rafId) cancelAnimationFrame(rafId);
    setStyle(originalStyleId);
    setMode(originalMode);
  });

  // Load preset
  function loadPreset(presetId) {
    const style = presetId === '__blank'
      ? { seed: { ...defaultSeed }, personality: { ...defaultPersonality } }
      : BUILT_IN_STYLES.find(s => s.id === presetId) || { seed: { ...defaultSeed }, personality: { ...defaultPersonality } };

    batch(() => {
      for (const key of SEED_KEYS) {
        seedSetters[key](style.seed?.[key] || defaultSeed[key] || '#888888');
      }
      for (const key of PERSONALITY_KEYS) {
        personalitySetters[key](style.personality?.[key] || defaultPersonality[key]);
      }
    });
  }

  // Auto-derive from primary
  function autoDerive() {
    const mono = deriveMonochromeSeed(seeds.primary());
    batch(() => {
      for (const [key, val] of Object.entries(mono)) {
        if (seedSetters[key]) seedSetters[key](val);
      }
    });
  }

  // ─── Build UI ──────────────────────────────────────────────────

  // Toolbar
  const toolbar = div({ class: 'de-ts-toolbar' },
    Select({
      options: PRESET_OPTIONS,
      value: () => '__blank',
      onchange: loadPreset,
      size: 'sm',
      'aria-label': 'Load preset'
    }),
    Segmented({
      value: previewMode,
      options: [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }],
      size: 'sm',
      onchange: setPreviewMode
    }),
    Button({ size: 'sm', onclick: autoDerive }, icon('refresh', { size: '1em' }), 'Auto-Derive'),
    Button({ size: 'sm', variant: 'primary', onclick: () => setSheetOpen(true) }, icon('copy', { size: '1em' }), 'Export Code'),
  );

  // Seeds tab
  function buildSeedsTab() {
    const grid = div({ class: 'de-ts-seed-grid' });
    for (const key of SEED_KEYS) {
      const swatch = div({ class: 'de-ts-seed-swatch' });
      createEffect(() => { swatch.style.background = seeds[key](); });

      const hexLabel = span({ class: 'de-ts-seed-hex' });
      createEffect(() => { hexLabel.textContent = seeds[key](); });

      const picker = ColorPicker({
        value: seeds[key],
        size: 'sm',
        onchange: (v) => { if (v.toLowerCase() !== seeds[key]().toLowerCase()) seedSetters[key](v); }
      });

      grid.appendChild(
        div({ class: 'de-ts-seed-well' },
          span({ class: 'de-ts-seed-label' }, key),
          swatch,
          hexLabel,
          picker
        )
      );
    }
    return grid;
  }

  // Personality tab
  function buildPersonalityTab() {
    const container = div({ class: css('_flex _col') });
    for (const key of PERSONALITY_KEYS) {
      container.appendChild(
        div({ class: 'de-ts-personality-row' },
          span({ class: 'de-ts-personality-label' }, key),
          Segmented({
            value: personality[key],
            options: PERSONALITY_OPTIONS[key],
            size: 'sm',
            onchange: (v) => personalitySetters[key](v)
          })
        )
      );
    }
    return container;
  }

  // Tokens tab — dynamic categorization of ALL derive() output
  function buildTokensTab() {
    const container = div({ class: css('_flex _col _gap6') });

    createEffect(() => {
      const t = tokens();
      container.replaceChildren();

      // Categorize all token keys
      const allKeys = Object.keys(t).sort();
      const grouped = TOKEN_CATEGORIES.map(cat => ({ ...cat, keys: [] }));
      const claimed = new Set();

      for (const key of allKeys) {
        for (const group of grouped) {
          if (!claimed.has(key) && group.match(key)) {
            group.keys.push(key);
            claimed.add(key);
            break;
          }
        }
      }

      for (const group of grouped) {
        if (group.keys.length === 0) continue;
        const isColor = group.type === 'color';

        const heading = div({ class: css('_flex _aic _gap2') },
          h4({ class: css('_heading6 _fgmutedfg') }, group.label),
          Badge({}, `${group.keys.length}`)
        );

        const rows = div({ class: css('_flex _col _gap1 _ovy[auto] _maxh[var(--de-ts-section-max-h)]') });
        for (const key of group.keys) {
          const val = t[key];
          if (val == null) continue;
          if (isColor && (val.startsWith('#') || val.startsWith('rgb') || val.startsWith('var('))) {
            const swatch = div({ class: 'de-ts-token-swatch' });
            swatch.style.background = val;
            rows.appendChild(
              div({ class: 'de-ts-token-row' },
                swatch,
                span({ class: 'de-ts-token-name' }, key),
                span({ class: 'de-ts-token-value' }, val)
              )
            );
          } else {
            rows.appendChild(
              div({ class: 'de-ts-token-row' },
                span({ class: 'de-ts-token-name' }, key),
                span({ class: 'de-ts-token-value' }, val)
              )
            );
          }
        }

        container.appendChild(
          div({ class: 'de-ts-token-section' }, heading, rows)
        );
      }
    });

    return container;
  }

  // Preview tab
  function buildPreviewTab() {
    return div({ class: 'de-ts-preview-strip' },
      div({ class: 'de-ts-preview-cell' },
        span({ class: 'de-ts-preview-label' }, 'Buttons'),
        div({ class: css('_flex _gap2 _wrap') },
          Button({ variant: 'primary' }, 'Primary'),
          Button({ variant: 'outline' }, 'Outline'),
          Button({ variant: 'ghost' }, 'Ghost'),
          Button({ variant: 'destructive' }, 'Destructive'),
        )
      ),
      div({ class: 'de-ts-preview-cell' },
        span({ class: 'de-ts-preview-label' }, 'Form'),
        Input({ placeholder: 'Type something...' }),
        div({ class: css('_flex _gap3 _aic') },
          Checkbox({ label: 'Check' }),
          Switch({ label: 'Toggle' }),
        )
      ),
      div({ class: 'de-ts-preview-cell' },
        span({ class: 'de-ts-preview-label' }, 'Badges'),
        div({ class: css('_flex _gap2 _wrap') },
          Badge({ variant: 'primary' }, 'Primary'),
          Badge({ variant: 'success' }, 'Success'),
          Badge({ variant: 'warning' }, 'Warning'),
          Badge({ variant: 'destructive' }, 'Error'),
        )
      ),
      div({ class: 'de-ts-preview-cell' },
        span({ class: 'de-ts-preview-label' }, 'Chips & Alert'),
        div({ class: css('_flex _gap2 _wrap') },
          Chip({ label: 'Default' }),
          Chip({ label: 'Primary', variant: 'primary' }),
        ),
        Alert({ variant: 'info' }, 'This is a preview alert.'),
      ),
    );
  }

  // Resolve var(--d-*) references one level deep to get actual hex values
  function resolveTokenValue(t, key) {
    let val = t[key];
    if (!val) return null;
    const varMatch = val.match(/^var\((--d-[^)]+)\)$/);
    if (varMatch) val = t[varMatch[1]];
    return val && val.startsWith('#') ? val : null;
  }

  // Contrast tab
  function buildContrastTab() {
    const grid = div({ class: 'de-ts-contrast-grid' });

    createEffect(() => {
      const t = tokens();
      grid.replaceChildren();
      for (const [bgToken, fgToken, label, minRatio] of CONTRAST_PAIRS) {
        const bgHex = resolveTokenValue(t, bgToken);
        const fgHex = resolveTokenValue(t, fgToken);
        if (!bgHex || !fgHex) continue;

        const bgRgb = hexToRgb(bgHex);
        const fgRgb = hexToRgb(fgHex);
        const ratio = contrast(bgRgb, fgRgb);

        let pass, variant;
        if (minRatio >= 4.5) {
          pass = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail';
          variant = pass === 'Fail' ? 'destructive' : pass === 'AAA' ? 'success' : 'warning';
        } else {
          pass = ratio >= minRatio ? 'Pass' : 'Fail';
          variant = pass === 'Fail' ? 'destructive' : 'success';
        }

        const bgSwatch = div({ class: 'de-ts-contrast-swatch' });
        bgSwatch.style.background = bgHex;
        const fgSwatch = div({ class: 'de-ts-contrast-swatch' });
        fgSwatch.style.background = fgHex;

        grid.appendChild(
          div({ class: 'de-ts-contrast-card' },
            bgSwatch,
            fgSwatch,
            div({ class: 'de-ts-contrast-info' },
              span({ class: 'de-ts-contrast-label' }, label),
              span({ class: 'de-ts-contrast-ratio' }, `${ratio.toFixed(2)}:1`),
            ),
            Badge({ variant }, pass)
          )
        );
      }
    });

    return grid;
  }

  // Export drawer
  const exportDrawer = Drawer({
    visible: sheetOpen,
    onClose: () => setSheetOpen(false),
    side: 'right',
    title: 'Export Style Code',
  },
    div({ class: css('_flex _col _gap3') },
      Input({
        value: styleName,
        placeholder: 'Style name',
        onchange: (e) => setStyleName(e.target ? e.target.value : e),
        'aria-label': 'Style name'
      }),
      (() => {
        const codeBlock = pre({ class: 'de-ts-export-code' });
        createEffect(() => { codeBlock.textContent = exportCode(); });
        return codeBlock;
      })(),
      Button({
        variant: 'primary',
        onclick: () => { if (navigator.clipboard) navigator.clipboard.writeText(exportCode()); }
      }, icon('copy', { size: '1em' }), 'Copy to Clipboard'),
    )
  );

  // Tabs
  const tabContent = Tabs({
    tabs: [
      { id: 'seeds', label: 'Seeds', content: buildSeedsTab },
      { id: 'personality', label: 'Personality', content: buildPersonalityTab },
      { id: 'tokens', label: 'Tokens', content: buildTokensTab },
      { id: 'preview', label: 'Preview', content: buildPreviewTab },
      { id: 'contrast', label: 'Contrast', content: buildContrastTab },
    ]
  });

  return div({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, 'Theme Studio'),
      p({ class: css('_body _fgmutedfg') }, 'Create custom Decantr styles. Changes apply live to the entire workbench.')
    ),
    toolbar,
    tabContent,
    exportDrawer
  );
}

