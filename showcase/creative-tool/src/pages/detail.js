import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, Chip, Separator, icon } from 'decantr/components';

const { div, span, h2, h3, p, code } = tags;

// ─── Color utilities ────────────────────────────────────────────
function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
}

function contrastColor(hex) {
  return luminance(hex) > 0.5 ? '#1e1b2e' : '#ffffff';
}

function hexToRgb(hex) {
  return `${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}`;
}

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return '0°, 0%, ' + Math.round(l * 100) + '%';
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return `${Math.round(h * 360)}\u00B0, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
}

function wcagLevel(ratio) {
  if (ratio >= 7) return { label: 'AAA', variant: 'success' };
  if (ratio >= 4.5) return { label: 'AA', variant: 'success' };
  if (ratio >= 3) return { label: 'AA Large', variant: 'warning' };
  return { label: 'Fail', variant: 'error' };
}

// ─── Mock data ──────────────────────────────────────────────────
const palette = {
  name: 'Lavender Dreams',
  mood: 'Pastel',
  description: 'Violet monochrome from deep purple to whisper white. Perfect for soft, elegant interfaces with depth through lightness variation.',
  colors: [
    { hex: '#a78bfa', name: 'Violet 400' },
    { hex: '#c4b5fd', name: 'Violet 300' },
    { hex: '#ddd6fe', name: 'Violet 200' },
    { hex: '#ede9fe', name: 'Violet 100' },
    { hex: '#f5f3ff', name: 'Violet 50' },
  ],
  tags: ['Monochromatic', 'Pastel', 'Elegant', 'UI Friendly'],
};

const relatedPalette = {
  name: 'Cotton Candy',
  colors: ['#f8b4c8', '#c4b4f8', '#b4d8f8', '#b4f8d8', '#f8e8b4'],
};

// ─── Detail Header ──────────────────────────────────────────────
function DetailHeader() {
  return div({ class: css('cy-pastel-mesh _r4 _p6 _flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      div({ class: css('_flex _col _gap2') },
        div({ class: css('_flex _aic _gap2') },
          icon('palette', { size: '1.25rem', class: css('_fgprimary') }),
          h2({ class: css('_heading3 d-gradient-text') }, palette.name)
        ),
        p({ class: css('_textsm _fgmuted _mw[500px] _lh[1.6]') }, palette.description)
      ),
      div({ class: css('_flex _gap2') },
        Button({ variant: 'outline', size: 'sm', class: css('cy-squish') }, icon('heart', { size: '0.875rem' }), ' Save'),
        Button({ variant: 'outline', size: 'sm', class: css('cy-squish') }, icon('share', { size: '0.875rem' }), ' Share'),
        Button({ variant: 'primary', size: 'sm', class: css('cy-glow cy-squish') }, icon('download', { size: '0.875rem' }), ' Export')
      )
    ),
    div({ class: css('_flex _gap2 _wrap') },
      ...palette.tags.map(tag => Chip({ label: tag, variant: 'outline', size: 'sm' })),
      Badge({ variant: 'outline', size: 'sm' }, palette.mood)
    )
  );
}

// ─── Large Specimen Grid ────────────────────────────────────────
function SpecimenGrid() {
  return div({ class: css('_flex _col _gap4') },
    // Full-width strip
    Card({ class: css('cy-pillow-strong _flex _col _gap0') },
      div({ class: css('_flex _r4 _overflow[hidden]') },
        ...palette.colors.map(c =>
          div({
            class: css('_flex1 _h32 _trans[flex_0.3s_ease] _h:flex[2] _cursor[pointer] cy-squish'),
            style: `background:${c.hex}`,
            onclick: () => navigator.clipboard.writeText(c.hex),
          },
            div({ class: css('_flex _col _aic _jcc _hfull _opacity0 _h:opacity100 _trans[opacity_0.2s_ease]') },
              span({ class: css('_heading4 _bold'), style: `color:${contrastColor(c.hex)}` }, c.hex),
              span({ class: css('_textsm _opacity70'), style: `color:${contrastColor(c.hex)}` }, c.name)
            )
          )
        )
      )
    ),

    // Individual specimens with details
    div({ class: css('_grid _gc1 _sm:gc2 _lg:gc5 _gap4 d-stagger') },
      ...palette.colors.map(c => {
        const ratio = contrastRatio(c.hex, '#ffffff');
        const darkRatio = contrastRatio(c.hex, '#1e1b2e');
        const wcagWhite = wcagLevel(parseFloat(ratio));
        const wcagDark = wcagLevel(parseFloat(darkRatio));

        return Card({ class: css('cy-pillow cy-squish _flex _col _gap0') },
          // Swatch
          div({ class: css('_h24 _r4 cy-swatch _flex _aic _jcc'), style: `background:${c.hex}` },
            span({ class: css('_heading4 _bold _opacity0 _h:opacity100 _trans[opacity_0.2s_ease]'), style: `color:${contrastColor(c.hex)}` }, c.hex)
          ),
          // Info
          Card.Body({ class: css('_flex _col _gap2') },
            span({ class: css('_textsm _bold') }, c.name),
            Separator({}),
            div({ class: css('_flex _col _gap1 _textxs _fontmono _fgmuted') },
              div({ class: css('_flex _jcsb') },
                span({}, 'HEX'),
                code({}, c.hex)
              ),
              div({ class: css('_flex _jcsb') },
                span({}, 'RGB'),
                code({}, hexToRgb(c.hex))
              ),
              div({ class: css('_flex _jcsb') },
                span({}, 'HSL'),
                code({}, hexToHsl(c.hex))
              ),
            ),
            Separator({}),
            div({ class: css('_flex _col _gap1 _textxs') },
              div({ class: css('_flex _aic _jcsb') },
                span({ class: css('_fgmuted') }, 'vs White'),
                div({ class: css('_flex _aic _gap2') },
                  span({ class: css('_fontmono') }, `${ratio}:1`),
                  Badge({ variant: wcagWhite.variant, size: 'sm' }, wcagWhite.label)
                )
              ),
              div({ class: css('_flex _aic _jcsb') },
                span({ class: css('_fgmuted') }, 'vs Dark'),
                div({ class: css('_flex _aic _gap2') },
                  span({ class: css('_fontmono') }, `${darkRatio}:1`),
                  Badge({ variant: wcagDark.variant, size: 'sm' }, wcagDark.label)
                )
              ),
            )
          )
        );
      })
    )
  );
}

// ─── Comparison Panel ───────────────────────────────────────────
function ComparisonPanel() {
  return Card({ class: css('cy-pillow _flex _col _gap4') },
    Card.Header({},
      div({ class: css('_flex _aic _jcsb _wfull') },
        span({ class: css('cy-label') }, 'COMPARE WITH'),
        Badge({ variant: 'outline', size: 'sm' }, 'Related')
      )
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap4') },
        // Current
        div({ class: css('_flex _col _gap2') },
          span({ class: css('_textsm _bold') }, palette.name),
          div({ class: css('_flex _r3 _overflow[hidden] _h10') },
            ...palette.colors.map(c =>
              div({ class: css('_flex1'), style: `background:${c.hex}` })
            )
          )
        ),
        // VS
        div({ class: css('_flex _aic _gap3') },
          Separator({ class: css('_flex1') }),
          span({ class: css('cy-label') }, 'VS'),
          Separator({ class: css('_flex1') })
        ),
        // Related
        div({ class: css('_flex _col _gap2') },
          span({ class: css('_textsm _bold') }, relatedPalette.name),
          div({ class: css('_flex _r3 _overflow[hidden] _h10') },
            ...relatedPalette.colors.map(c =>
              div({ class: css('_flex1'), style: `background:${c}` })
            )
          )
        ),
      )
    ),
    Card.Footer({},
      Button({ variant: 'ghost', size: 'sm', class: css('_wfull _textxs cy-squish') }, 'View Cotton Candy Detail')
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function DetailPage() {
  onMount(() => {
    document.title = 'Lavender Dreams — Chromaform';
  });

  return div({ class: css('d-page-enter _flex _col _gap6') },
    DetailHeader(),
    SpecimenGrid(),
    ComparisonPanel()
  );
}
