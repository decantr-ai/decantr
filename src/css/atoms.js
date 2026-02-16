const scale = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];
const extScale = { 14: 3.5, 16: 4, 20: 5, 24: 6, 32: 8, 40: 10, 48: 12, 56: 14, 64: 16 };

function rem(n) {
  if (n === 0) return '0';
  const val = scale[n] ?? extScale[n];
  return val !== undefined ? `${val}rem` : `${n * 0.25}rem`;
}

/** @type {Map<string, string>} */
export const atomMap = new Map();

// Spacing: p, px, py, pt, pr, pb, pl, m, mx, my, mt, mr, mb, ml
const spacingProps = {
  p: 'padding', px: 'padding-inline', py: 'padding-block',
  pt: 'padding-top', pr: 'padding-right', pb: 'padding-bottom', pl: 'padding-left',
  m: 'margin', mx: 'margin-inline', my: 'margin-block',
  mt: 'margin-top', mr: 'margin-right', mb: 'margin-bottom', ml: 'margin-left',
  gap: 'gap', gx: 'column-gap', gy: 'row-gap'
};

for (const [prefix, prop] of Object.entries(spacingProps)) {
  for (let i = 0; i <= 12; i++) {
    atomMap.set(`${prefix}${i}`, `${prop}:${rem(i)}`);
  }
  for (const n of Object.keys(extScale)) {
    atomMap.set(`${prefix}${n}`, `${prop}:${rem(Number(n))}`);
  }
}

// Width/Height
for (const [prefix, prop] of [['w', 'width'], ['h', 'height'], ['mw', 'max-width'], ['mh', 'max-height']]) {
  atomMap.set(`${prefix}100`, `${prop}:100%`);
  atomMap.set(`${prefix}screen`, `${prop}:100vw`);
  atomMap.set(`${prefix}auto`, `${prop}:auto`);
  atomMap.set(`${prefix}full`, `${prop}:100%`);
  atomMap.set(`${prefix}fit`, `${prop}:fit-content`);
  for (let i = 0; i <= 12; i++) {
    atomMap.set(`${prefix}${i}`, `${prop}:${rem(i)}`);
  }
  for (const n of Object.keys(extScale)) {
    atomMap.set(`${prefix}${n}`, `${prop}:${rem(Number(n))}`);
  }
}

// Display
for (const v of ['block', 'inline', 'flex', 'grid', 'none', 'contents']) {
  atomMap.set(v, `display:${v}`);
}
atomMap.set('iflex', 'display:inline-flex');
atomMap.set('igrid', 'display:inline-grid');

// Flexbox
atomMap.set('col', 'flex-direction:column');
atomMap.set('row', 'flex-direction:row');
atomMap.set('wrap', 'flex-wrap:wrap');
atomMap.set('nowrap', 'flex-wrap:nowrap');
atomMap.set('grow', 'flex-grow:1');
atomMap.set('grow0', 'flex-grow:0');
atomMap.set('shrink', 'flex-shrink:1');
atomMap.set('shrink0', 'flex-shrink:0');
atomMap.set('flex1', 'flex:1 1 0%');

// Alignment
atomMap.set('center', 'align-items:center;justify-content:center');
atomMap.set('aic', 'align-items:center');
atomMap.set('ais', 'align-items:stretch');
atomMap.set('aifs', 'align-items:flex-start');
atomMap.set('aife', 'align-items:flex-end');
atomMap.set('jcc', 'justify-content:center');
atomMap.set('jcsb', 'justify-content:space-between');
atomMap.set('jcsa', 'justify-content:space-around');
atomMap.set('jcfs', 'justify-content:flex-start');
atomMap.set('jcfe', 'justify-content:flex-end');

// Position
for (const v of ['relative', 'absolute', 'fixed', 'sticky']) {
  atomMap.set(v, `position:${v}`);
}
atomMap.set('rel', 'position:relative');
atomMap.set('abs', 'position:absolute');
atomMap.set('top0', 'top:0');
atomMap.set('right0', 'right:0');
atomMap.set('bottom0', 'bottom:0');
atomMap.set('left0', 'left:0');
atomMap.set('inset0', 'inset:0');

// Typography
const fontSizes = { t10: '0.625', t12: '0.75', t14: '0.875', t16: '1', t18: '1.125', t20: '1.25', t24: '1.5', t28: '1.75', t32: '2', t36: '2.25', t40: '2.5', t48: '3' };
for (const [cls, size] of Object.entries(fontSizes)) {
  atomMap.set(cls, `font-size:${size}rem`);
}
atomMap.set('bold', 'font-weight:700');
atomMap.set('medium', 'font-weight:500');
atomMap.set('normal', 'font-weight:400');
atomMap.set('light', 'font-weight:300');
atomMap.set('italic', 'font-style:italic');
atomMap.set('underline', 'text-decoration:underline');
atomMap.set('strike', 'text-decoration:line-through');
atomMap.set('nounder', 'text-decoration:none');
atomMap.set('upper', 'text-transform:uppercase');
atomMap.set('lower', 'text-transform:lowercase');
atomMap.set('cap', 'text-transform:capitalize');
atomMap.set('tl', 'text-align:left');
atomMap.set('tc', 'text-align:center');
atomMap.set('tr', 'text-align:right');
atomMap.set('lh1', 'line-height:1');
atomMap.set('lh1a', 'line-height:1.25');
atomMap.set('lh1b', 'line-height:1.5');
atomMap.set('lh2', 'line-height:2');

// Colors (CSS custom properties --c0 through --c9)
for (let i = 0; i <= 9; i++) {
  atomMap.set(`bg${i}`, `background:var(--c${i})`);
  atomMap.set(`fg${i}`, `color:var(--c${i})`);
  atomMap.set(`bc${i}`, `border-color:var(--c${i})`);
}

// Borders
atomMap.set('b0', 'border:0');
atomMap.set('b1', 'border:1px solid');
atomMap.set('b2', 'border:2px solid');
for (let i = 0; i <= 8; i++) {
  atomMap.set(`r${i}`, `border-radius:${rem(i)}`);
}
atomMap.set('rfull', 'border-radius:9999px');
atomMap.set('rcircle', 'border-radius:50%');

// Overflow
atomMap.set('ohidden', 'overflow:hidden');
atomMap.set('oauto', 'overflow:auto');
atomMap.set('oscroll', 'overflow:scroll');
atomMap.set('ovisible', 'overflow:visible');

// Cursor
atomMap.set('pointer', 'cursor:pointer');
atomMap.set('grab', 'cursor:grab');

// Opacity
for (let i = 0; i <= 10; i++) {
  atomMap.set(`op${i}`, `opacity:${i / 10}`);
}

// Transitions
atomMap.set('trans', 'transition:all 0.2s ease');
atomMap.set('transfast', 'transition:all 0.1s ease');
atomMap.set('transslow', 'transition:all 0.4s ease');
atomMap.set('transnone', 'transition:none');

// Z-index
for (const z of [0, 10, 20, 30, 40, 50]) {
  atomMap.set(`z${z}`, `z-index:${z}`);
}

// Shadow
atomMap.set('shadow', 'box-shadow:0 1px 3px rgba(0,0,0,0.12),0 1px 2px rgba(0,0,0,0.06)');
atomMap.set('shadowmd', 'box-shadow:0 4px 6px rgba(0,0,0,0.1),0 2px 4px rgba(0,0,0,0.06)');
atomMap.set('shadowlg', 'box-shadow:0 10px 15px rgba(0,0,0,0.1),0 4px 6px rgba(0,0,0,0.05)');
atomMap.set('shadowno', 'box-shadow:none');
