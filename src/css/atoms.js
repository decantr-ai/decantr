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
    atomMap.set(`_${prefix}${i}`, `${prop}:${rem(i)}`);
  }
  for (const n of Object.keys(extScale)) {
    atomMap.set(`_${prefix}${n}`, `${prop}:${rem(Number(n))}`);
  }
}

// Negative margins: _-m2, _-mt4, _-mx1, etc.
const negMarginProps = {
  '-m': 'margin', '-mx': 'margin-inline', '-my': 'margin-block',
  '-mt': 'margin-top', '-mr': 'margin-right', '-mb': 'margin-bottom', '-ml': 'margin-left'
};

for (const [prefix, prop] of Object.entries(negMarginProps)) {
  for (let i = 1; i <= 12; i++) {
    atomMap.set(`_${prefix}${i}`, `${prop}:-${rem(i)}`);
  }
  for (const n of Object.keys(extScale)) {
    const num = Number(n);
    if (num <= 32) {
      atomMap.set(`_${prefix}${n}`, `${prop}:-${rem(num)}`);
    }
  }
}

// Auto margins
atomMap.set('_ma', 'margin:auto');
atomMap.set('_mxa', 'margin-inline:auto');
atomMap.set('_mya', 'margin-block:auto');
atomMap.set('_mta', 'margin-top:auto');
atomMap.set('_mra', 'margin-right:auto');
atomMap.set('_mba', 'margin-bottom:auto');
atomMap.set('_mla', 'margin-left:auto');

// Width/Height
for (const [prefix, prop] of [['w', 'width'], ['h', 'height'], ['mw', 'max-width'], ['mh', 'max-height']]) {
  const unit = (prop === 'height' || prop === 'max-height') ? 'vh' : 'vw';
  atomMap.set(`_${prefix}100`, `${prop}:100%`);
  atomMap.set(`_${prefix}screen`, `${prop}:100${unit}`);
  atomMap.set(`_${prefix}auto`, `${prop}:auto`);
  atomMap.set(`_${prefix}full`, `${prop}:100%`);
  atomMap.set(`_${prefix}fit`, `${prop}:fit-content`);
  for (let i = 0; i <= 12; i++) {
    atomMap.set(`_${prefix}${i}`, `${prop}:${rem(i)}`);
  }
  for (const n of Object.keys(extScale)) {
    atomMap.set(`_${prefix}${n}`, `${prop}:${rem(Number(n))}`);
  }
}

// Min-width/height
for (const [prefix, prop] of [['minw', 'min-width'], ['minh', 'min-height']]) {
  const unit = prop === 'min-height' ? 'vh' : 'vw';
  atomMap.set(`_${prefix}full`, `${prop}:100%`);
  atomMap.set(`_${prefix}screen`, `${prop}:100${unit}`);
  atomMap.set(`_${prefix}fit`, `${prop}:fit-content`);
  atomMap.set(`_${prefix}min`, `${prop}:min-content`);
  atomMap.set(`_${prefix}max`, `${prop}:max-content`);
  for (let i = 0; i <= 12; i++) {
    atomMap.set(`_${prefix}${i}`, `${prop}:${rem(i)}`);
  }
  for (const n of Object.keys(extScale)) {
    atomMap.set(`_${prefix}${n}`, `${prop}:${rem(Number(n))}`);
  }
}

// Content sizing keywords
atomMap.set('_wmin', 'width:min-content');
atomMap.set('_wmax', 'width:max-content');
atomMap.set('_hmin', 'height:min-content');
atomMap.set('_hmax', 'height:max-content');
atomMap.set('_mwmin', 'max-width:min-content');
atomMap.set('_mwmax', 'max-width:max-content');
atomMap.set('_mhmin', 'max-height:min-content');
atomMap.set('_mhmax', 'max-height:max-content');

// Display
for (const v of ['block', 'inline', 'flex', 'grid', 'none', 'contents']) {
  atomMap.set(`_${v}`, `display:${v}`);
}
atomMap.set('_iflex', 'display:inline-flex');
atomMap.set('_igrid', 'display:inline-grid');

// Flexbox
atomMap.set('_col', 'flex-direction:column');
atomMap.set('_row', 'flex-direction:row');
atomMap.set('_colr', 'flex-direction:column-reverse');
atomMap.set('_rowr', 'flex-direction:row-reverse');
atomMap.set('_wrap', 'flex-wrap:wrap');
atomMap.set('_nowrap', 'flex-wrap:nowrap');
atomMap.set('_wrapr', 'flex-wrap:wrap-reverse');
atomMap.set('_grow', 'flex-grow:1');
atomMap.set('_grow0', 'flex-grow:0');
atomMap.set('_shrink', 'flex-shrink:1');
atomMap.set('_shrink0', 'flex-shrink:0');
atomMap.set('_flex1', 'flex:1 1 0%');
atomMap.set('_flexauto', 'flex:1 1 auto');
atomMap.set('_flexnone', 'flex:none');
atomMap.set('_flexinit', 'flex:0 1 auto');

// Flex-basis
atomMap.set('_basisa', 'flex-basis:auto');
atomMap.set('_basis0', 'flex-basis:0');
for (let i = 1; i <= 12; i++) {
  atomMap.set(`_basis${i}`, `flex-basis:${rem(i)}`);
}
for (const n of Object.keys(extScale)) {
  atomMap.set(`_basis${n}`, `flex-basis:${rem(Number(n))}`);
}
atomMap.set('_basis25', 'flex-basis:25%');
atomMap.set('_basis33', 'flex-basis:33.333%');
atomMap.set('_basis50', 'flex-basis:50%');
atomMap.set('_basis66', 'flex-basis:66.667%');
atomMap.set('_basis75', 'flex-basis:75%');
atomMap.set('_basisfull', 'flex-basis:100%');

// Order
for (let i = 0; i <= 12; i++) {
  atomMap.set(`_ord${i}`, `order:${i}`);
}
atomMap.set('_ord-1', 'order:-1');
atomMap.set('_ordfirst', 'order:-9999');
atomMap.set('_ordlast', 'order:9999');

// Alignment
atomMap.set('_center', 'align-items:center;justify-content:center');
atomMap.set('_aic', 'align-items:center');
atomMap.set('_ais', 'align-items:stretch');
atomMap.set('_aifs', 'align-items:flex-start');
atomMap.set('_aife', 'align-items:flex-end');
atomMap.set('_aibs', 'align-items:baseline');
atomMap.set('_jcc', 'justify-content:center');
atomMap.set('_jcsb', 'justify-content:space-between');
atomMap.set('_jcsa', 'justify-content:space-around');
atomMap.set('_jcse', 'justify-content:space-evenly');
atomMap.set('_jcfs', 'justify-content:flex-start');
atomMap.set('_jcfe', 'justify-content:flex-end');

// align-content
atomMap.set('_acc', 'align-content:center');
atomMap.set('_acsb', 'align-content:space-between');
atomMap.set('_acsa', 'align-content:space-around');
atomMap.set('_acse', 'align-content:space-evenly');
atomMap.set('_acfs', 'align-content:flex-start');
atomMap.set('_acfe', 'align-content:flex-end');
atomMap.set('_acs', 'align-content:stretch');

// align-self
atomMap.set('_asc', 'align-self:center');
atomMap.set('_ass', 'align-self:stretch');
atomMap.set('_asfs', 'align-self:flex-start');
atomMap.set('_asfe', 'align-self:flex-end');
atomMap.set('_asa', 'align-self:auto');
atomMap.set('_asbs', 'align-self:baseline');

// justify-items
atomMap.set('_jic', 'justify-items:center');
atomMap.set('_jis', 'justify-items:stretch');
atomMap.set('_jifs', 'justify-items:start');
atomMap.set('_jife', 'justify-items:end');

// justify-self
atomMap.set('_jsc', 'justify-self:center');
atomMap.set('_jss', 'justify-self:stretch');
atomMap.set('_jsfs', 'justify-self:start');
atomMap.set('_jsfe', 'justify-self:end');
atomMap.set('_jsa', 'justify-self:auto');

// place shorthands
atomMap.set('_pic', 'place-items:center');
atomMap.set('_pis', 'place-items:stretch');
atomMap.set('_pcc', 'place-content:center');
atomMap.set('_pcse', 'place-content:space-evenly');
atomMap.set('_pcsb', 'place-content:space-between');

// Grid system — template columns/rows
for (let i = 1; i <= 12; i++) {
  atomMap.set(`_gc${i}`, `grid-template-columns:repeat(${i},minmax(0,1fr))`);
}
atomMap.set('_gcnone', 'grid-template-columns:none');
for (let i = 1; i <= 6; i++) {
  atomMap.set(`_gr${i}`, `grid-template-rows:repeat(${i},minmax(0,1fr))`);
}
atomMap.set('_grnone', 'grid-template-rows:none');

// Grid column/row span
for (let i = 1; i <= 12; i++) {
  atomMap.set(`_span${i}`, `grid-column:span ${i}/span ${i}`);
}
atomMap.set('_spanfull', 'grid-column:1/-1');
for (let i = 1; i <= 6; i++) {
  atomMap.set(`_rspan${i}`, `grid-row:span ${i}/span ${i}`);
}
atomMap.set('_rspanfull', 'grid-row:1/-1');

// Grid col/row start/end
for (let i = 1; i <= 13; i++) {
  atomMap.set(`_gcs${i}`, `grid-column-start:${i}`);
  atomMap.set(`_gce${i}`, `grid-column-end:${i}`);
}
for (let i = 1; i <= 7; i++) {
  atomMap.set(`_grs${i}`, `grid-row-start:${i}`);
  atomMap.set(`_gre${i}`, `grid-row-end:${i}`);
}

// Grid auto-fit/auto-fill responsive
for (const size of [160, 200, 220, 250, 280, 300, 320]) {
  atomMap.set(`_gcaf${size}`, `grid-template-columns:repeat(auto-fit,minmax(${size}px,1fr))`);
}
atomMap.set('_gcaf', 'grid-template-columns:repeat(auto-fit,minmax(0,1fr))');
atomMap.set('_gcafl', 'grid-template-columns:repeat(auto-fill,minmax(0,1fr))');

// Grid auto-flow
atomMap.set('_gflowr', 'grid-auto-flow:row');
atomMap.set('_gflowc', 'grid-auto-flow:column');
atomMap.set('_gflowd', 'grid-auto-flow:dense');
atomMap.set('_gflowrd', 'grid-auto-flow:row dense');
atomMap.set('_gflowcd', 'grid-auto-flow:column dense');

// Grid auto columns/rows
atomMap.set('_gacfr', 'grid-auto-columns:minmax(0,1fr)');
atomMap.set('_gacmin', 'grid-auto-columns:min-content');
atomMap.set('_gacmax', 'grid-auto-columns:max-content');
atomMap.set('_garfr', 'grid-auto-rows:minmax(0,1fr)');
atomMap.set('_garmin', 'grid-auto-rows:min-content');
atomMap.set('_garmax', 'grid-auto-rows:max-content');

// Position
for (const v of ['relative', 'absolute', 'fixed', 'sticky']) {
  atomMap.set(`_${v}`, `position:${v}`);
}
atomMap.set('_rel', 'position:relative');
atomMap.set('_abs', 'position:absolute');
atomMap.set('_top0', 'top:0');
atomMap.set('_right0', 'right:0');
atomMap.set('_bottom0', 'bottom:0');
atomMap.set('_left0', 'left:0');
atomMap.set('_inset0', 'inset:0');

// Typography
const fontSizes = { t10: '0.625', t12: '0.75', t14: '0.875', t16: '1', t18: '1.125', t20: '1.25', t24: '1.5', t28: '1.75', t32: '2', t36: '2.25', t40: '2.5', t48: '3' };
for (const [cls, size] of Object.entries(fontSizes)) {
  atomMap.set(`_${cls}`, `font-size:${size}rem`);
}
atomMap.set('_bold', 'font-weight:700');
atomMap.set('_medium', 'font-weight:500');
atomMap.set('_normal', 'font-weight:400');
atomMap.set('_light', 'font-weight:300');
atomMap.set('_italic', 'font-style:italic');
atomMap.set('_underline', 'text-decoration:underline');
atomMap.set('_strike', 'text-decoration:line-through');
atomMap.set('_nounder', 'text-decoration:none');
atomMap.set('_upper', 'text-transform:uppercase');
atomMap.set('_lower', 'text-transform:lowercase');
atomMap.set('_cap', 'text-transform:capitalize');
atomMap.set('_tl', 'text-align:left');
atomMap.set('_tc', 'text-align:center');
atomMap.set('_tr', 'text-align:right');
atomMap.set('_lh1', 'line-height:1');
atomMap.set('_lh1a', 'line-height:1.25');
atomMap.set('_lh1b', 'line-height:1.5');
atomMap.set('_lh2', 'line-height:2');
atomMap.set('_lh125', 'line-height:1.25');
atomMap.set('_lh150', 'line-height:1.5');
atomMap.set('_lh175', 'line-height:1.75');

// Token-backed semantic typography
for (const [name, token, fallback] of [
  ['textxs','xs','0.625rem'],['textsm','sm','0.75rem'],['textbase','base','0.875rem'],
  ['textmd','md','1rem'],['textlg','lg','1.125rem'],['textxl','xl','1.25rem'],
  ['text2xl','2xl','1.5rem'],['text3xl','3xl','2rem'],['text4xl','4xl','2.5rem']
]) atomMap.set(`_${name}`, `font-size:var(--d-text-${token},${fallback})`);

for (const [name, token, fallback] of [
  ['lhtight','tight','1.1'],['lhsnug','snug','1.25'],['lhnormal','normal','1.5'],
  ['lhrelaxed','relaxed','1.6'],['lhloose','loose','1.75']
]) atomMap.set(`_${name}`, `line-height:var(--d-lh-${token},${fallback})`);

atomMap.set('_fwheading', 'font-weight:var(--d-fw-heading,700)');
atomMap.set('_fwtitle', 'font-weight:var(--d-fw-title,600)');
atomMap.set('_fwmedium', 'font-weight:var(--d-fw-medium,500)');
atomMap.set('_lsheading', 'letter-spacing:var(--d-ls-heading,-0.025em)');

// Colors (CSS custom properties --c0 through --c9)
for (let i = 0; i <= 9; i++) {
  atomMap.set(`_bg${i}`, `background:var(--c${i})`);
  atomMap.set(`_fg${i}`, `color:var(--c${i})`);
  atomMap.set(`_bc${i}`, `border-color:var(--c${i})`);
}

// Borders
atomMap.set('_b0', 'border:0');
atomMap.set('_b1', 'border:1px solid');
atomMap.set('_b2', 'border:2px solid');
for (let i = 0; i <= 8; i++) {
  atomMap.set(`_r${i}`, `border-radius:${rem(i)}`);
}
atomMap.set('_rfull', 'border-radius:9999px');
atomMap.set('_rcircle', 'border-radius:50%');

// Overflow
atomMap.set('_ohidden', 'overflow:hidden');
atomMap.set('_oauto', 'overflow:auto');
atomMap.set('_oscroll', 'overflow:scroll');
atomMap.set('_ovisible', 'overflow:visible');
atomMap.set('_oxhidden', 'overflow-x:hidden');
atomMap.set('_oxauto', 'overflow-x:auto');
atomMap.set('_oxscroll', 'overflow-x:scroll');
atomMap.set('_oyhidden', 'overflow-y:hidden');
atomMap.set('_oyauto', 'overflow-y:auto');
atomMap.set('_oyscroll', 'overflow-y:scroll');

// Aspect ratio
atomMap.set('_arsq', 'aspect-ratio:1');
atomMap.set('_ar169', 'aspect-ratio:16/9');
atomMap.set('_ar43', 'aspect-ratio:4/3');
atomMap.set('_ar219', 'aspect-ratio:21/9');
atomMap.set('_ar32', 'aspect-ratio:3/2');
atomMap.set('_ara', 'aspect-ratio:auto');

// Container utilities
atomMap.set('_ctrsm', 'max-width:640px;margin-inline:auto');
atomMap.set('_ctr', 'max-width:960px;margin-inline:auto');
atomMap.set('_ctrlg', 'max-width:1080px;margin-inline:auto');
atomMap.set('_ctrxl', 'max-width:1280px;margin-inline:auto');
atomMap.set('_ctrfull', 'max-width:100%;margin-inline:auto');

// Text & visibility
atomMap.set('_visible', 'visibility:visible');
atomMap.set('_invisible', 'visibility:hidden');
atomMap.set('_wsnw', 'white-space:nowrap');
atomMap.set('_wsnormal', 'white-space:normal');
atomMap.set('_wspre', 'white-space:pre');
atomMap.set('_wsprewrap', 'white-space:pre-wrap');
atomMap.set('_truncate', 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap');
atomMap.set('_clamp2', 'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden');
atomMap.set('_clamp3', 'display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden');

// Cursor
atomMap.set('_pointer', 'cursor:pointer');
atomMap.set('_grab', 'cursor:grab');

// Opacity
for (let i = 0; i <= 10; i++) {
  atomMap.set(`_op${i}`, `opacity:${i / 10}`);
}

// Transitions
atomMap.set('_trans', 'transition:all 0.2s ease');
atomMap.set('_transfast', 'transition:all 0.1s ease');
atomMap.set('_transslow', 'transition:all 0.4s ease');
atomMap.set('_transnone', 'transition:none');

// Z-index
for (const z of [0, 10, 20, 30, 40, 50]) {
  atomMap.set(`_z${z}`, `z-index:${z}`);
}

// Shadow
atomMap.set('_shadow', 'box-shadow:0 1px 3px rgba(0,0,0,0.12),0 1px 2px rgba(0,0,0,0.06)');
atomMap.set('_shadowmd', 'box-shadow:0 4px 6px rgba(0,0,0,0.1),0 2px 4px rgba(0,0,0,0.06)');
atomMap.set('_shadowlg', 'box-shadow:0 10px 15px rgba(0,0,0,0.1),0 4px 6px rgba(0,0,0,0.05)');
atomMap.set('_shadowno', 'box-shadow:none');

// Container queries
atomMap.set('_cqinl', 'container-type:inline-size');
atomMap.set('_cqsz', 'container-type:size');
atomMap.set('_cqnorm', 'container-type:normal');
