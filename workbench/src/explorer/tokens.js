import { css } from 'decantr/css';
import { tags } from 'decantr/tags';

const { div, h2, h3, p, span, section, small, strong, code } = tags;

// Token data — loaded from registry, cached locally
let tokenData = null;

async function loadTokenData() {
  if (tokenData) return tokenData;
  try {
    const resp = await fetch('/__decantr/registry/tokens.json');
    tokenData = (await resp.json()).groups || {};
  } catch {
    tokenData = {};
  }
  return tokenData;
}

function colorSwatch(token) {
  const style = getComputedStyle(document.documentElement);
  const val = style.getPropertyValue(token).trim();
  return div({ class: 'de-swatch' },
    div({ class: 'de-swatch-color', style: `background:${val || 'transparent'}` }),
    div({ class: css('_flex _col') },
      span({ class: 'de-swatch-label' }, token.replace('--d-', '')),
      span({ class: 'de-swatch-value' }, val || 'unset')
    )
  );
}

function paletteSection(data) {
  const roles = data?.roles || ['primary', 'accent', 'tertiary', 'success', 'warning', 'error', 'info'];
  const suffixes = data?.suffixes || ['', '-fg', '-hover', '-active', '-subtle', '-subtle-fg', '-border'];
  const swatches = [];
  for (const role of roles) {
    for (const suffix of suffixes) {
      swatches.push(colorSwatch(`--d-${role}${suffix}`));
    }
  }
  return div({ class: 'de-section-block' },
    h3({ class: 'de-section-title' }, 'Color Palette'),
    p({ class: css('_caption _fgmutedfg _mb3') }, `${roles.length} roles x ${suffixes.length} variants = ${roles.length * suffixes.length} tokens`),
    div({ class: 'de-token-grid' }, ...swatches)
  );
}

function neutralSection(data) {
  const tokens = data?.tokens || ['--d-bg', '--d-fg', '--d-muted', '--d-muted-fg', '--d-border', '--d-border-strong', '--d-ring', '--d-overlay'];
  return div({ class: 'de-section-block' },
    h3({ class: 'de-section-title' }, 'Neutral'),
    div({ class: 'de-token-grid' }, ...tokens.map(t => colorSwatch(t)))
  );
}

function surfaceSection(data) {
  const style = getComputedStyle(document.documentElement);
  const levels = data?.levels || [0, 1, 2, 3];
  return div({ class: 'de-section-block' },
    h3({ class: 'de-section-title' }, 'Surfaces'),
    div({ class: css('_grid _gc4 _gap3') },
      ...levels.map(i => {
        const bg = style.getPropertyValue(`--d-surface-${i}`).trim();
        const fg = style.getPropertyValue(`--d-surface-${i}-fg`).trim();
        const border = style.getPropertyValue(`--d-surface-${i}-border`).trim();
        return div({
          class: 'de-surface-card',
          style: `background:${bg};color:${fg};border:1px solid ${border}`
        }, strong({}, `Surface ${i}`), small({}, `bg: ${bg}`), small({}, `fg: ${fg}`));
      })
    )
  );
}

function typographySection(data) {
  const style = getComputedStyle(document.documentElement);
  const sizes = data?.tokens || [['--d-text-xs', 'xs'], ['--d-text-sm', 'sm'], ['--d-text-base', 'base'], ['--d-text-md', 'md'], ['--d-text-lg', 'lg'], ['--d-text-xl', 'xl'], ['--d-text-2xl', '2xl'], ['--d-text-3xl', '3xl'], ['--d-text-4xl', '4xl']];
  return div({ class: 'de-section-block' },
    h3({ class: 'de-section-title' }, 'Typography'),
    div({ class: css('_flex _col _gap1') },
      ...sizes.map(([token]) => {
        const val = style.getPropertyValue(token).trim();
        return div({ class: 'de-type-sample' },
          span({ class: 'de-type-label' }, token),
          span({ style: `font-size:${val || '1rem'}` }, `The quick brown fox (${val})`)
        );
      })
    )
  );
}

function spacingSection(data) {
  const style = getComputedStyle(document.documentElement);
  const spacings = data?.tokens || [['--d-sp-1', '0.25rem'], ['--d-sp-1-5', '0.375rem'], ['--d-sp-2', '0.5rem'], ['--d-sp-3', '0.75rem'], ['--d-sp-4', '1rem'], ['--d-sp-5', '1.25rem'], ['--d-sp-6', '1.5rem'], ['--d-sp-8', '2rem'], ['--d-sp-10', '2.5rem'], ['--d-sp-12', '3rem'], ['--d-sp-16', '4rem']];
  return div({ class: 'de-section-block' },
    h3({ class: 'de-section-title' }, 'Spacing'),
    div({ class: css('_flex _col _gap1') },
      ...spacings.map(([token, fallback]) => {
        const val = style.getPropertyValue(token).trim() || fallback;
        return div({ class: 'de-spacing-row' },
          span({ class: 'de-spacing-label' }, token.replace('--d-', '')),
          div({ class: 'de-spacing-bar', style: `width:${val}` }),
          span({ class: 'de-spacing-label' }, val)
        );
      })
    )
  );
}

function elevationSection(data) {
  const style = getComputedStyle(document.documentElement);
  const levels = data?.levels || [0, 1, 2, 3];
  return div({ class: 'de-section-block' },
    h3({ class: 'de-section-title' }, 'Elevation'),
    div({ class: css('_grid _gc4 _gap4') },
      ...levels.map(i => {
        const shadow = style.getPropertyValue(`--d-elevation-${i}`).trim();
        return div({ class: 'de-elevation-box', style: `box-shadow:${shadow}` }, `elevation-${i}`);
      })
    )
  );
}

function motionSection(data) {
  const style = getComputedStyle(document.documentElement);
  const durations = data?.tokens || ['--d-duration-instant', '--d-duration-fast', '--d-duration-normal', '--d-duration-slow'];
  return div({ class: 'de-section-block' },
    h3({ class: 'de-section-title' }, 'Motion'),
    p({ class: css('_caption _fgmutedfg _mb3') }, 'Hover each box to see transition.'),
    div({ class: css('_flex _gap3 _wrap') },
      ...durations.map(token => {
        const val = style.getPropertyValue(token).trim() || '0s';
        const box = div({
          class: 'de-motion-box',
          title: `${token}: ${val}`,
          style: `transition: transform ${val} ease`
        });
        return div({ class: css('_flex _col _aic _gap1') },
          box,
          small({ class: css('_caption _fgmutedfg _fontmono') }, token.replace('--d-duration-', ''))
        );
      })
    )
  );
}

function chartSection(data) {
  const style = getComputedStyle(document.documentElement);
  const count = data?.count || 8;
  const tokens = Array.from({ length: count }, (_, i) => `--d-chart-${i}`);
  return div({ class: 'de-section-block' },
    h3({ class: 'de-section-title' }, 'Chart Palette'),
    div({ class: css('_flex _gap2 _wrap') },
      ...tokens.map(token => {
        const val = style.getPropertyValue(token).trim();
        return div({ class: css('_flex _col _aic _gap1') },
          div({ class: css('_w[3rem] _h[3rem] _radius _b1 _bcborder'), style: `background:${val}` }),
          small({ class: css('_caption _fgmutedfg _fontmono') }, token.replace('--d-chart-', 'chart-'))
        );
      })
    )
  );
}

// Render function mapping (keyed by registry group id)
const RENDER_MAP = {
  palette: paletteSection,
  neutral: neutralSection,
  surfaces: surfaceSection,
  typography: typographySection,
  spacing: spacingSection,
  elevation: elevationSection,
  motion: motionSection,
  chart: chartSection,
};

export function TokensExplorer(group) {
  const container = div({ class: css('_flex _col _gap4') },
    p({ class: css('_body _fgmutedfg') }, 'Loading tokens...')
  );

  loadTokenData().then(data => {
    container.innerHTML = '';

    const renderFn = RENDER_MAP[group];
    if (renderFn && data[group]) {
      container.appendChild(section({ class: css('_flex _col _gap6') },
        div({ class: css('_flex _col _gap1') },
          h2({ class: css('_heading4') }, `Tokens — ${data[group].label || group}`),
          p({ class: css('_body _fgmutedfg') }, 'Live design tokens. Values update when you switch styles or modes.')
        ),
        renderFn(data[group])
      ));
    } else {
      // Show all groups
      const sections = [];
      for (const [id, groupData] of Object.entries(data)) {
        const fn = RENDER_MAP[id];
        if (fn) {
          const el = fn(groupData);
          el.id = 'tokens-' + id;
          sections.push(el);
        }
      }
      container.appendChild(section({ class: css('_flex _col _gap8') },
        div({ class: css('_flex _col _gap1') },
          h2({ class: css('_heading4') }, 'Token Inspector'),
          p({ class: css('_body _fgmutedfg') }, '170+ design tokens. Values update live when you switch styles or modes.')
        ),
        ...sections
      ));
    }
  });

  return container;
}

export async function loadTokenItems() {
  const data = await loadTokenData();
  return Object.entries(data).map(([id, group]) => ({
    id, label: group.label || id
  }));
}
