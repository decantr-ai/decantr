import { tags } from 'decantr/tags';
import { list, onMount } from 'decantr/core';
import { createSignal, createMemo } from 'decantr/state';
import { css } from 'decantr/css';
import { Button, Card, Chip, Input, icon } from 'decantr/components';

const { div, span, h2, h3, p, code } = tags;

// ─── Color Math Utilities ───────────────────────────────────────
function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * Math.max(0, Math.min(1, color))).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hslToRgb(h, s, l) {
  const hex = hslToHex(h, s, l);
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastColor(hex) {
  return luminance(hex) > 0.5 ? '#1e1b2e' : '#ffffff';
}

// ─── Harmony Generators ─────────────────────────────────────────
function generateComplementary(h, s, l) {
  return [
    hslToHex(h, s, l),
    hslToHex(h, s, Math.min(1, l * 1.3)),
    hslToHex(h + 180, s, l),
    hslToHex(h + 180, s, Math.min(1, l * 1.3)),
    hslToHex(h + 180, s * 0.6, Math.min(1, l * 1.5)),
  ];
}

function generateAnalogous(h, s, l) {
  return [
    hslToHex(h - 30, s, l),
    hslToHex(h - 15, s, Math.min(1, l * 1.1)),
    hslToHex(h, s, l),
    hslToHex(h + 15, s, Math.min(1, l * 1.1)),
    hslToHex(h + 30, s, l),
  ];
}

function generateTriadic(h, s, l) {
  return [
    hslToHex(h, s, l),
    hslToHex(h, s * 0.7, Math.min(1, l * 1.3)),
    hslToHex(h + 120, s, l),
    hslToHex(h + 240, s, l),
    hslToHex(h + 240, s * 0.7, Math.min(1, l * 1.3)),
  ];
}

function generateMonochromatic(h, s, l) {
  return [
    hslToHex(h, s, Math.max(0.1, l * 0.5)),
    hslToHex(h, s, Math.max(0.15, l * 0.7)),
    hslToHex(h, s, l),
    hslToHex(h, s * 0.8, Math.min(0.95, l * 1.3)),
    hslToHex(h, s * 0.5, Math.min(0.95, l * 1.6)),
  ];
}

function generateSplitComplementary(h, s, l) {
  return [
    hslToHex(h, s, l),
    hslToHex(h, s * 0.7, Math.min(1, l * 1.3)),
    hslToHex(h + 150, s, l),
    hslToHex(h + 210, s, l),
    hslToHex(h + 180, s * 0.5, Math.min(1, l * 1.5)),
  ];
}

function generateTetradic(h, s, l) {
  return [
    hslToHex(h, s, l),
    hslToHex(h + 90, s, l),
    hslToHex(h + 180, s, l),
    hslToHex(h + 270, s, l),
    hslToHex(h, s * 0.5, Math.min(1, l * 1.4)),
  ];
}

const harmonies = {
  'Complementary': generateComplementary,
  'Analogous': generateAnalogous,
  'Triadic': generateTriadic,
  'Monochromatic': generateMonochromatic,
  'Split Comp.': generateSplitComplementary,
  'Tetradic': generateTetradic,
};

const harmonyNames = Object.keys(harmonies);

// ─── Color Input ────────────────────────────────────────────────
function ColorInput({ baseColor, setBaseColor }) {
  return div({ class: css('cy-dimple _p5 _r4 _flex _aic _gap4') },
    div({ class: css('_w14 _h14 _r3 cy-swatch _shrink0 _trans[background_0.3s_ease]'), style: () => `background:${baseColor()}` }),
    div({ class: css('_flex _col _gap1 _flex1') },
      span({ class: css('cy-label _mb1') }, 'BASE COLOR'),
      Input({
        value: baseColor,
        onchange: e => {
          const v = e.target.value.trim();
          if (/^#[0-9a-fA-F]{6}$/.test(v)) setBaseColor(v);
        },
        placeholder: '#a78bfa',
        class: css('_fontmono'),
      })
    ),
    div({ class: css('_flex _col _gap1 _textxs _fgmuted _fontmono') },
      span({}, () => {
        const [h, s, l] = hexToHsl(baseColor());
        return `H: ${Math.round(h)}\u00B0`;
      }),
      span({}, () => {
        const [h, s, l] = hexToHsl(baseColor());
        return `S: ${Math.round(s * 100)}%`;
      }),
      span({}, () => {
        const [h, s, l] = hexToHsl(baseColor());
        return `L: ${Math.round(l * 100)}%`;
      }),
    )
  );
}

// ─── Palette Row ────────────────────────────────────────────────
function PaletteRow({ name, colors }) {
  return Card({ class: css('cy-pillow _flex _col _gap0') },
    div({ class: css('_flex _r4 _overflow[hidden]') },
      ...colors.map(hex =>
        div({
          class: css('_flex1 _h24 _trans[flex_0.3s_ease,transform_0.3s_ease] _h:flex[2] _cursor[pointer] cy-squish'),
          style: `background:${hex}`,
          onclick: () => navigator.clipboard.writeText(hex),
        },
          div({ class: css('_flex _col _aic _jcc _hfull _opacity0 _h:opacity100 _trans[opacity_0.2s_ease]') },
            span({ class: css('_textsm _bold'), style: `color:${contrastColor(hex)}` }, hex),
            span({ class: css('_textxs _opacity70'), style: `color:${contrastColor(hex)}` }, 'Click to copy')
          )
        )
      )
    ),
    Card.Body({ class: css('_flex _aic _jcsb _py3') },
      div({ class: css('_flex _aic _gap2') },
        span({ class: css('_textsm _bold') }, name),
        span({ class: css('cy-label') }, `${colors.length} COLORS`)
      ),
      div({ class: css('_flex _gap1') },
        ...colors.map(hex =>
          div({ class: css('_w4 _h4 _rfull cy-soft'), style: `background:${hex}` })
        )
      )
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function WorkspacePage() {
  const [baseColor, setBaseColor] = createSignal('#a78bfa');
  const [activeHarmony, setActiveHarmony] = createSignal('Complementary');

  const palettes = createMemo(() => {
    const hex = baseColor();
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return [];
    const [h, s, l] = hexToHsl(hex);
    const active = activeHarmony();
    if (active === 'All') {
      return harmonyNames.map(name => ({
        name,
        colors: harmonies[name](h, s, l),
      }));
    }
    return [{
      name: active,
      colors: harmonies[active](h, s, l),
    }];
  });

  onMount(() => {
    document.title = 'Workspace — Chromaform';
  });

  return div({ class: css('d-page-enter _flex _col _gap6') },
    // Page header
    div({ class: css('_flex _aic _gap2') },
      icon('palette', { size: '1.25rem', class: css('_fgprimary') }),
      h2({ class: css('_heading4 d-gradient-text') }, 'Palette Workspace')
    ),

    // Color input
    ColorInput({ baseColor, setBaseColor }),

    // Harmony filter chips
    div({ class: css('_flex _gap2 _wrap') },
      Chip({
        label: 'All',
        variant: () => activeHarmony() === 'All' ? 'primary' : 'outline',
        onclick: () => setActiveHarmony('All'),
        class: css('cy-squish'),
      }),
      ...harmonyNames.map(name =>
        Chip({
          label: name,
          variant: () => activeHarmony() === name ? 'primary' : 'outline',
          onclick: () => setActiveHarmony(name),
          class: css('cy-squish'),
        })
      )
    ),

    // Palette results
    list(palettes, (palette) => palette.name,
      (palette) => PaletteRow({ name: palette.name, colors: palette.colors })
    )
  );
}
