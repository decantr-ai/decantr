// ─── Helpers ────────────────────────────────────────────────────
const scale = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];
const extScale = { 14: 3.5, 16: 4, 20: 5, 24: 6, 32: 8, 40: 10, 48: 12, 56: 14, 64: 16 };
const extKeys = new Set(Object.keys(extScale).map(Number));

function rem(n) {
  if (n === 0) return '0';
  const val = scale[n] ?? extScale[n];
  return val !== undefined ? `${val}rem` : `${n * 0.25}rem`;
}

function validSpacing(n) { return (n >= 0 && n <= 12) || extKeys.has(n); }
function validNeg(n) { return (n >= 1 && n <= 12) || (extKeys.has(n) && n <= 32); }

// ─── DIRECT — flat non-numeric atoms ────────────────────────────
const DIRECT = {
  // Display
  block: 'display:block', inline: 'display:inline', flex: 'display:flex',
  grid: 'display:grid', none: 'display:none', contents: 'display:contents',
  iflex: 'display:inline-flex', igrid: 'display:inline-grid',

  // Flexbox
  col: 'flex-direction:column', row: 'flex-direction:row',
  colr: 'flex-direction:column-reverse', rowr: 'flex-direction:row-reverse',
  wrap: 'flex-wrap:wrap', nowrap: 'flex-wrap:nowrap', wrapr: 'flex-wrap:wrap-reverse',
  grow: 'flex-grow:1', grow0: 'flex-grow:0', shrink: 'flex-shrink:1', shrink0: 'flex-shrink:0',
  flex1: 'flex:1 1 0%', flexauto: 'flex:1 1 auto', flexnone: 'flex:none', flexinit: 'flex:0 1 auto',

  // Flex-basis keywords
  basisa: 'flex-basis:auto', basis0: 'flex-basis:0', basisfull: 'flex-basis:100%',
  // Flex-basis percentages
  basis25: 'flex-basis:25%', basis33: 'flex-basis:33.333%', basis50: 'flex-basis:50%',
  basis66: 'flex-basis:66.667%', basis75: 'flex-basis:75%',

  // Order keywords
  ordfirst: 'order:-9999', ordlast: 'order:9999',

  // Auto margins
  ma: 'margin:auto', mxa: 'margin-inline:auto', mya: 'margin-block:auto',
  mta: 'margin-top:auto', mra: 'margin-right:auto', mba: 'margin-bottom:auto', mla: 'margin-left:auto',

  // Alignment
  center: 'align-items:center;justify-content:center',
  aic: 'align-items:center', ais: 'align-items:stretch',
  aifs: 'align-items:flex-start', aife: 'align-items:flex-end', aibs: 'align-items:baseline',
  jcc: 'justify-content:center', jcsb: 'justify-content:space-between',
  jcsa: 'justify-content:space-around', jcse: 'justify-content:space-evenly',
  jcfs: 'justify-content:flex-start', jcfe: 'justify-content:flex-end',
  // align-content
  acc: 'align-content:center', acsb: 'align-content:space-between',
  acsa: 'align-content:space-around', acse: 'align-content:space-evenly',
  acfs: 'align-content:flex-start', acfe: 'align-content:flex-end', acs: 'align-content:stretch',
  // align-self
  asc: 'align-self:center', ass: 'align-self:stretch',
  asfs: 'align-self:flex-start', asfe: 'align-self:flex-end',
  asa: 'align-self:auto', asbs: 'align-self:baseline',
  // justify-items
  jic: 'justify-items:center', jis: 'justify-items:stretch',
  jifs: 'justify-items:start', jife: 'justify-items:end',
  // justify-self
  jsc: 'justify-self:center', jss: 'justify-self:stretch',
  jsfs: 'justify-self:start', jsfe: 'justify-self:end', jsa: 'justify-self:auto',
  // place shorthands
  pic: 'place-items:center', pis: 'place-items:stretch',
  pcc: 'place-content:center', pcse: 'place-content:space-evenly', pcsb: 'place-content:space-between',

  // Grid misc
  gcnone: 'grid-template-columns:none', grnone: 'grid-template-rows:none',
  spanfull: 'grid-column:1/-1', rspanfull: 'grid-row:1/-1',
  gcaf: 'grid-template-columns:repeat(auto-fit,minmax(0,1fr))',
  gcafl: 'grid-template-columns:repeat(auto-fill,minmax(0,1fr))',
  gflowr: 'grid-auto-flow:row', gflowc: 'grid-auto-flow:column', gflowd: 'grid-auto-flow:dense',
  gflowrd: 'grid-auto-flow:row dense', gflowcd: 'grid-auto-flow:column dense',
  gacfr: 'grid-auto-columns:minmax(0,1fr)', gacmin: 'grid-auto-columns:min-content', gacmax: 'grid-auto-columns:max-content',
  garfr: 'grid-auto-rows:minmax(0,1fr)', garmin: 'grid-auto-rows:min-content', garmax: 'grid-auto-rows:max-content',

  // Position
  relative: 'position:relative', absolute: 'position:absolute', fixed: 'position:fixed', sticky: 'position:sticky',
  rel: 'position:relative', abs: 'position:absolute',
  top0: 'top:0', right0: 'right:0', bottom0: 'bottom:0', left0: 'left:0', inset0: 'inset:0',

  // Typography — non-numeric
  bold: 'font-weight:700', medium: 'font-weight:500', normal: 'font-weight:400', light: 'font-weight:300',
  italic: 'font-style:italic', underline: 'text-decoration:underline', strike: 'text-decoration:line-through',
  nounder: 'text-decoration:none', upper: 'text-transform:uppercase', lower: 'text-transform:lowercase',
  cap: 'text-transform:capitalize', tl: 'text-align:left', tc: 'text-align:center', tr: 'text-align:right',
  fontmono: 'font-family:var(--d-font-mono)',

  // Line-height static
  lh1: 'line-height:1', lh1a: 'line-height:1.25', lh1b: 'line-height:1.5', lh2: 'line-height:2',
  lh125: 'line-height:1.25', lh150: 'line-height:1.5', lh175: 'line-height:1.75',

  // Token-backed semantic typography
  textxs: 'font-size:var(--d-text-xs,0.625rem)', textsm: 'font-size:var(--d-text-sm,0.75rem)',
  textbase: 'font-size:var(--d-text-base,0.875rem)', textmd: 'font-size:var(--d-text-md,1rem)',
  textlg: 'font-size:var(--d-text-lg,1.125rem)', textxl: 'font-size:var(--d-text-xl,1.25rem)',
  text2xl: 'font-size:var(--d-text-2xl,1.5rem)', text3xl: 'font-size:var(--d-text-3xl,2rem)',
  text4xl: 'font-size:var(--d-text-4xl,2.5rem)',
  lhtight: 'line-height:var(--d-lh-tight,1.1)', lhsnug: 'line-height:var(--d-lh-snug,1.25)',
  lhnormal: 'line-height:var(--d-lh-normal,1.5)', lhrelaxed: 'line-height:var(--d-lh-relaxed,1.6)',
  lhloose: 'line-height:var(--d-lh-loose,1.75)',
  fwheading: 'font-weight:var(--d-fw-heading,700)', fwtitle: 'font-weight:var(--d-fw-title,600)',
  fwmedium: 'font-weight:var(--d-fw-medium,500)', lsheading: 'letter-spacing:var(--d-ls-heading,-0.025em)',

  // Overflow
  ohidden: 'overflow:hidden', oauto: 'overflow:auto', oscroll: 'overflow:scroll', ovisible: 'overflow:visible',
  oxhidden: 'overflow-x:hidden', oxauto: 'overflow-x:auto', oxscroll: 'overflow-x:scroll',
  oyhidden: 'overflow-y:hidden', oyauto: 'overflow-y:auto', oyscroll: 'overflow-y:scroll',

  // Aspect ratio
  arsq: 'aspect-ratio:1', ar169: 'aspect-ratio:16/9', ar43: 'aspect-ratio:4/3',
  ar219: 'aspect-ratio:21/9', ar32: 'aspect-ratio:3/2', ara: 'aspect-ratio:auto',

  // Container utilities
  ctrsm: 'max-width:640px;margin-inline:auto', ctr: 'max-width:960px;margin-inline:auto',
  ctrlg: 'max-width:1080px;margin-inline:auto', ctrxl: 'max-width:1280px;margin-inline:auto',
  ctrfull: 'max-width:100%;margin-inline:auto',

  // Visibility/whitespace
  visible: 'visibility:visible', invisible: 'visibility:hidden',
  wsnw: 'white-space:nowrap', wsnormal: 'white-space:normal', wspre: 'white-space:pre', wsprewrap: 'white-space:pre-wrap',

  // Cursor
  pointer: 'cursor:pointer', grab: 'cursor:grab',

  // Transitions
  trans: 'transition:all 0.2s ease', transfast: 'transition:all 0.1s ease',
  transslow: 'transition:all 0.4s ease', transnone: 'transition:none',

  // Shadows
  shadow: 'box-shadow:0 1px 3px rgba(0,0,0,0.12),0 1px 2px rgba(0,0,0,0.06)',
  shadowmd: 'box-shadow:0 4px 6px rgba(0,0,0,0.1),0 2px 4px rgba(0,0,0,0.06)',
  shadowlg: 'box-shadow:0 10px 15px rgba(0,0,0,0.1),0 4px 6px rgba(0,0,0,0.05)',
  shadowno: 'box-shadow:none',

  // Borders
  b0: 'border:0', b1: 'border:1px solid', b2: 'border:2px solid',
  rfull: 'border-radius:9999px', rcircle: 'border-radius:50%',

  // Container queries
  cqinl: 'container-type:inline-size', cqsz: 'container-type:size', cqnorm: 'container-type:normal',

  // Logical inset
  insetis0: 'inset-inline-start:0', insetie0: 'inset-inline-end:0',
  insetbs0: 'inset-block-start:0', insetbe0: 'inset-block-end:0',

  // Logical border-radius
  rss: 'border-start-start-radius:var(--d-radius)', rse: 'border-start-end-radius:var(--d-radius)',
  res: 'border-end-start-radius:var(--d-radius)', ree: 'border-end-end-radius:var(--d-radius)',

  // Text alignment logical
  tstart: 'text-align:start', tend: 'text-align:end',

  // Float logical
  floatis: 'float:inline-start', floatie: 'float:inline-end',

  // Inline/block sizing
  wi: 'inline-size:100%', wb: 'block-size:100%',

  // Content sizing keywords
  wmin: 'width:min-content', wmax: 'width:max-content',
  hmin: 'height:min-content', hmax: 'height:max-content',
  mwmin: 'max-width:min-content', mwmax: 'max-width:max-content',
  mhmin: 'max-height:min-content', mhmax: 'max-height:max-content',

  // Size keywords (per prefix)
  w100: 'width:100%', wscreen: 'width:100vw', wauto: 'width:auto', wfull: 'width:100%', wfit: 'width:fit-content',
  h100: 'height:100%', hscreen: 'height:100vh', hauto: 'height:auto', hfull: 'height:100%', hfit: 'height:fit-content',
  mw100: 'max-width:100%', mwscreen: 'max-width:100vw', mwauto: 'max-width:auto', mwfull: 'max-width:100%', mwfit: 'max-width:fit-content',
  mh100: 'max-height:100%', mhscreen: 'max-height:100vh', mhauto: 'max-height:auto', mhfull: 'max-height:100%', mhfit: 'max-height:fit-content',
  minwfull: 'min-width:100%', minwscreen: 'min-width:100vw', minwfit: 'min-width:fit-content', minwmin: 'min-width:min-content', minwmax: 'min-width:max-content',
  minhfull: 'min-height:100%', minhscreen: 'min-height:100vh', minhfit: 'min-height:fit-content', minhmin: 'min-height:min-content', minhmax: 'min-height:max-content',

  // Semantic neutral colors
  bgbg: 'background:var(--d-bg)', fgfg: 'color:var(--d-fg)',
  bgmuted: 'background:var(--d-muted)', fgmuted: 'color:var(--d-muted)',
  fgmutedfg: 'color:var(--d-muted-fg)', bcborder: 'border-color:var(--d-border)', bcstrong: 'border-color:var(--d-border-strong)',
};

// ─── Algorithmic property maps ──────────────────────────────────
const SPACING_PROPS = {
  p: 'padding', px: 'padding-inline', py: 'padding-block',
  pt: 'padding-top', pr: 'padding-right', pb: 'padding-bottom', pl: 'padding-left',
  m: 'margin', mx: 'margin-inline', my: 'margin-block',
  mt: 'margin-top', mr: 'margin-right', mb: 'margin-bottom', ml: 'margin-left',
  gap: 'gap', gx: 'column-gap', gy: 'row-gap'
};

const NEG_MARGIN_PROPS = {
  '-m': 'margin', '-mx': 'margin-inline', '-my': 'margin-block',
  '-mt': 'margin-top', '-mr': 'margin-right', '-mb': 'margin-bottom', '-ml': 'margin-left'
};

const SIZE_PROPS = { w: 'width', h: 'height', mw: 'max-width', mh: 'max-height' };
const MINSIZE_PROPS = { minw: 'min-width', minh: 'min-height' };

const LOGICAL_PROPS = {
  mis: 'margin-inline-start', mie: 'margin-inline-end', mbs: 'margin-block-start', mbe: 'margin-block-end',
  pis: 'padding-inline-start', pie: 'padding-inline-end', pbs: 'padding-block-start', pbe: 'padding-block-end'
};

const FONT_SIZES = { 10: '0.625', 12: '0.75', 14: '0.875', 16: '1', 18: '1.125', 20: '1.25', 24: '1.5', 28: '1.75', 32: '2', 36: '2.25', 40: '2.5', 48: '3' };

const GRAD_DIRS = { R: 'to right', L: 'to left', T: 'to top', B: 'to bottom', BR: 'to bottom right', BL: 'to bottom left', TR: 'to top right', TL: 'to top left' };

const GRAD_COLORS = {
  Primary: 'var(--d-primary)', Accent: 'var(--d-accent)', Tertiary: 'var(--d-tertiary)',
  Success: 'var(--d-success)', Warning: 'var(--d-warning)', Error: 'var(--d-error)',
  Info: 'var(--d-info)', Bg: 'var(--d-bg)', Surface1: 'var(--d-surface-1)', Transparent: 'transparent'
};

const BF_BLUR = { 0: '', 4: 'blur(4px)', 8: 'blur(8px)', 12: 'blur(12px)', 16: 'blur(16px)', 20: 'blur(20px)', 24: 'blur(24px)' };
const BF_SAT = { 100: 'saturate(1)', 125: 'saturate(1.25)', 150: 'saturate(1.5)', 180: 'saturate(1.8)', 200: 'saturate(2)' };
const BF_BRIGHT = { 90: 'brightness(0.9)', 100: 'brightness(1)', 110: 'brightness(1.1)', 120: 'brightness(1.2)' };
const BF = 'backdrop-filter:var(--d-bf-blur, ) var(--d-bf-sat, ) var(--d-bf-bright, );-webkit-backdrop-filter:var(--d-bf-blur, ) var(--d-bf-sat, ) var(--d-bf-bright, )';

const GCAF_SIZES = new Set([160, 200, 220, 240, 250, 280, 300, 320]);

const SEMANTIC_ROLES = new Set(['primary', 'accent', 'tertiary', 'success', 'warning', 'error', 'info']);
const Z_VALUES = new Set([0, 10, 20, 30, 40, 50]);
const FW_VALUES = new Set([300, 400, 500, 600, 700]);

// ─── Algorithmic resolver ───────────────────────────────────────
function resolveAlgorithmic(n) {
  let m;

  // (a) Spacing: p0-p64, px0-px64, gap0-gap64, etc.
  if ((m = n.match(/^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gx|gy)(\d+)$/))) {
    const prop = SPACING_PROPS[m[1]];
    const num = Number(m[2]);
    if (prop && validSpacing(num)) return `${prop}:${rem(num)}`;
  }

  // (b) Negative margins: -m1, -mx4, etc.
  if ((m = n.match(/^(-m|-mx|-my|-mt|-mr|-mb|-ml)(\d+)$/))) {
    const prop = NEG_MARGIN_PROPS[m[1]];
    const num = Number(m[2]);
    if (prop && validNeg(num)) return `${prop}:-${rem(num)}`;
  }

  // (c) Sizing: w0-w12, w14-w64 (extScale), h0-h12, etc.
  // Excludes w100/wscreen/etc. (those are in DIRECT)
  if ((m = n.match(/^(w|h|mw|mh)(\d+)$/))) {
    const prop = SIZE_PROPS[m[1]];
    const num = Number(m[2]);
    // Skip if it's a keyword-number already in DIRECT (100)
    if (prop && num !== 100 && validSpacing(num)) return `${prop}:${rem(num)}`;
  }

  // (d) Min-sizing: minw0-minw12, minw14-minw64, minh0-minh12, etc.
  if ((m = n.match(/^(minw|minh)(\d+)$/))) {
    const prop = MINSIZE_PROPS[m[1]];
    const num = Number(m[2]);
    if (prop && validSpacing(num)) return `${prop}:${rem(num)}`;
  }

  // (e) Grid columns: gc1-gc12
  if ((m = n.match(/^gc(\d+)$/))) {
    const num = Number(m[1]);
    if (num >= 1 && num <= 12) return `grid-template-columns:repeat(${num},minmax(0,1fr))`;
  }

  // (f) Grid rows: gr1-gr6
  if ((m = n.match(/^gr(\d+)$/))) {
    const num = Number(m[1]);
    if (num >= 1 && num <= 6) return `grid-template-rows:repeat(${num},minmax(0,1fr))`;
  }

  // (g) Grid span: span1-span12
  if ((m = n.match(/^span(\d+)$/))) {
    const num = Number(m[1]);
    if (num >= 1 && num <= 12) return `grid-column:span ${num}/span ${num}`;
  }

  // (h) Row span: rspan1-rspan6
  if ((m = n.match(/^rspan(\d+)$/))) {
    const num = Number(m[1]);
    if (num >= 1 && num <= 6) return `grid-row:span ${num}/span ${num}`;
  }

  // (i) Grid col/row start/end
  if ((m = n.match(/^(gcs|gce)(\d+)$/))) {
    const num = Number(m[2]);
    if (num >= 1 && num <= 13) return `${m[1] === 'gcs' ? 'grid-column-start' : 'grid-column-end'}:${num}`;
  }
  if ((m = n.match(/^(grs|gre)(\d+)$/))) {
    const num = Number(m[2]);
    if (num >= 1 && num <= 7) return `${m[1] === 'grs' ? 'grid-row-start' : 'grid-row-end'}:${num}`;
  }

  // (j) Grid auto-fit sized: gcaf160, gcaf200, etc.
  if ((m = n.match(/^gcaf(\d+)$/))) {
    const size = Number(m[1]);
    if (GCAF_SIZES.has(size)) return `grid-template-columns:repeat(auto-fit,minmax(${size}px,1fr))`;
  }

  // (k) Typography sizes: t10, t12, t14, t16, t18, t20, t24, t28, t32, t36, t40, t48
  if ((m = n.match(/^t(\d+)$/))) {
    const size = FONT_SIZES[m[1]];
    if (size) return `font-size:${size}rem`;
  }

  // (l) Font weight: fw300-fw700
  if ((m = n.match(/^fw(\d+)$/))) {
    const num = Number(m[1]);
    if (FW_VALUES.has(num)) return `font-weight:${num}`;
  }

  // (m) Opacity: op0-op10
  if ((m = n.match(/^op(\d+)$/))) {
    const num = Number(m[1]);
    if (num >= 0 && num <= 10) return `opacity:${num / 10}`;
  }

  // (n) Border radius: r0-r8
  if ((m = n.match(/^r(\d)$/))) {
    const num = Number(m[1]);
    if (num >= 0 && num <= 8) return `border-radius:${rem(num)}`;
  }

  // (o) Z-index: z0, z10, z20, z30, z40, z50
  if ((m = n.match(/^z(\d+)$/))) {
    const num = Number(m[1]);
    if (Z_VALUES.has(num)) return `z-index:${num}`;
  }

  // (p) Semantic colors: bg/fg/bc + role + optional suffix
  if ((m = n.match(/^(bg|fg|bc)(primary|accent|tertiary|success|warning|error|info)(sub|bdr|on)?$/))) {
    const [, prefix, role, suffix] = m;
    if (!suffix) {
      if (prefix === 'bg') return `background:var(--d-${role})`;
      if (prefix === 'fg') return `color:var(--d-${role})`;
      return `border-color:var(--d-${role})`;
    }
    if (suffix === 'sub') {
      if (prefix === 'bg') return `background:var(--d-${role}-subtle)`;
      if (prefix === 'fg') return `color:var(--d-${role}-subtle-fg)`;
    }
    if (suffix === 'bdr' && prefix === 'bc') return `border-color:var(--d-${role}-border)`;
    if (suffix === 'on' && prefix === 'fg') return `color:var(--d-${role}-fg)`;
    return null;
  }

  // (r) Surfaces: surface0-3, fgsurface0-3, bcsurface0-3
  if ((m = n.match(/^(surface|fgsurface|bcsurface)(\d)$/))) {
    const num = Number(m[2]);
    if (num >= 0 && num <= 3) {
      if (m[1] === 'surface') return `background:var(--d-surface-${num})`;
      if (m[1] === 'fgsurface') return `color:var(--d-surface-${num}-fg)`;
      return `border-color:var(--d-surface-${num}-border)`;
    }
  }

  // (s) Elevations: elev0-3
  if ((m = n.match(/^elev(\d)$/))) {
    const num = Number(m[1]);
    if (num >= 0 && num <= 3) return `box-shadow:var(--d-elevation-${num})`;
  }

  // (t) Logical spacing: mis/mie/mbs/mbe/pis/pie/pbs/pbe + number
  if ((m = n.match(/^(mis|mie|mbs|mbe|pis|pie|pbs|pbe)(\d+)$/))) {
    const prop = LOGICAL_PROPS[m[1]];
    const num = Number(m[2]);
    if (prop && validSpacing(num)) return `${prop}:${rem(num)}`;
  }

  // (u) Flex-basis: basis1-basis12, basis14-basis64 (extScale)
  if ((m = n.match(/^basis(\d+)$/))) {
    const num = Number(m[2] || m[1]);
    // Percentages already in DIRECT (25,33,50,66,75), and basis0 is in DIRECT
    if (num >= 1 && num <= 12) return `flex-basis:${rem(num)}`;
    if (extKeys.has(num)) return `flex-basis:${rem(num)}`;
  }

  // (v) Order: ord0-ord12, ord-1
  if ((m = n.match(/^ord(-?\d+)$/))) {
    const num = Number(m[1]);
    if ((num >= 0 && num <= 12) || num === -1) return `order:${num}`;
  }

  // (w) Gradient directions: gradR, gradBR, etc.
  if ((m = n.match(/^grad(R|L|T|B|BR|BL|TR|TL)$/))) {
    const dir = GRAD_DIRS[m[1]];
    return `background-image:linear-gradient(${dir},var(--d-grad-stops,transparent,transparent))`;
  }

  // (x) Gradient from/via/to
  if ((m = n.match(/^(from|via|to)(Primary|Accent|Tertiary|Success|Warning|Error|Info|Bg|Surface1|Transparent)$/))) {
    const color = GRAD_COLORS[m[2]];
    if (m[1] === 'from') return `--d-grad-from:${color};--d-grad-stops:var(--d-grad-from),var(--d-grad-to,transparent)`;
    if (m[1] === 'via') return `--d-grad-stops:var(--d-grad-from,transparent),${color},var(--d-grad-to,transparent)`;
    return `--d-grad-to:${color}`;
  }

  // (y) Backdrop filter: bfblur, bfsat, bfbright
  if ((m = n.match(/^bfblur(\d+)$/))) {
    const v = BF_BLUR[Number(m[1])];
    if (v !== undefined) return `--d-bf-blur:${v};${BF}`;
  }
  if ((m = n.match(/^bfsat(\d+)$/))) {
    const v = BF_SAT[Number(m[1])];
    if (v !== undefined) return `--d-bf-sat:${v};${BF}`;
  }
  if ((m = n.match(/^bfbright(\d+)$/))) {
    const v = BF_BRIGHT[Number(m[1])];
    if (v !== undefined) return `--d-bf-bright:${v};${BF}`;
  }

  // (z) bgSurface convenience: bgSurface0-3
  if ((m = n.match(/^bgSurface(\d)$/))) {
    const num = Number(m[1]);
    if (num >= 0 && num <= 3) return `background:var(--d-surface-${num})`;
  }

  return null;
}

// ─── RESIDUAL — compound atoms that can't be computed ───────────
const RESIDUAL = {
  truncate: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap',
  clamp2: 'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden',
  clamp3: 'display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden',
  srOnly: 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0',
  disabled: 'opacity:var(--d-disabled-opacity);cursor:not-allowed;pointer-events:none',
  // Typography presets
  heading1: 'font-size:var(--d-text-4xl,2.5rem);font-weight:var(--d-fw-heading,700);line-height:var(--d-lh-tight,1.1);letter-spacing:var(--d-ls-heading,-0.025em)',
  heading2: 'font-size:var(--d-text-3xl,2rem);font-weight:var(--d-fw-heading,700);line-height:var(--d-lh-tight,1.1);letter-spacing:var(--d-ls-heading,-0.025em)',
  heading3: 'font-size:var(--d-text-2xl,1.5rem);font-weight:var(--d-fw-heading,700);line-height:var(--d-lh-snug,1.25);letter-spacing:var(--d-ls-heading,-0.025em)',
  heading4: 'font-size:var(--d-text-xl,1.25rem);font-weight:var(--d-fw-title,600);line-height:var(--d-lh-snug,1.25)',
  heading5: 'font-size:var(--d-text-lg,1.125rem);font-weight:var(--d-fw-title,600);line-height:var(--d-lh-snug,1.25)',
  heading6: 'font-size:var(--d-text-md,1rem);font-weight:var(--d-fw-title,600);line-height:var(--d-lh-normal,1.5)',
  body: 'font-size:var(--d-text-base,0.875rem);line-height:var(--d-lh-normal,1.5)',
  bodylg: 'font-size:var(--d-text-md,1rem);line-height:var(--d-lh-relaxed,1.6)',
  caption: 'font-size:var(--d-text-sm,0.75rem);line-height:var(--d-lh-normal,1.5);color:var(--d-muted-fg)',
  label: 'font-size:var(--d-text-sm,0.75rem);font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-none,1)',
  overline: 'font-size:var(--d-text-xs,0.625rem);font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-none,1);text-transform:uppercase;letter-spacing:0.08em',
  // Field/state
  field: 'background:var(--d-field-bg);border:var(--d-field-border-width) var(--d-border-style) var(--d-field-border);border-radius:var(--d-field-radius)',
  fieldFilled: '--d-field-bg:var(--d-surface-1);--d-field-border:transparent',
  fieldGhost: '--d-field-bg:transparent;--d-field-border:transparent',
  hoverBg: 'background:var(--d-item-hover-bg)',
  activeBg: 'background:var(--d-item-active-bg)',
  selectedBg: 'background:var(--d-selected-bg)',
  selectedFg: 'color:var(--d-selected-fg)',
  proseWidth: 'max-width:var(--d-prose-width)',
  // Gradient presets
  gradbrand: 'background:var(--d-gradient-brand)',
  gradbrandalt: 'background:var(--d-gradient-brand-alt)',
  gradbrandfull: 'background:var(--d-gradient-brand-full)',
  gradsurface: 'background:var(--d-gradient-surface)',
  gradoverlay: 'background:var(--d-gradient-overlay)',
  gradtext: 'background:var(--d-gradient-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent',
  gradtextalt: 'background:var(--d-gradient-text-alt);-webkit-background-clip:text;-webkit-text-fill-color:transparent',
  // Miscellaneous
  bgOverlay: 'background:var(--d-overlay)',
  rounded: 'border-radius:var(--d-radius)',
  bgTransparent: 'background:transparent',
  outlineNone: 'outline:none',
  borderB: 'border-bottom:1px solid var(--d-border)',
  borderT: 'border-top:1px solid var(--d-border)',
  borderR: 'border-right:1px solid var(--d-border)',
  borderL: 'border-left:1px solid var(--d-border)',
  borderBorder: 'border-color:var(--d-border)',
  overflowX: 'overflow-x:auto',
  // Regular filters
  fblur4: 'filter:blur(4px)', fblur8: 'filter:blur(8px)', fblur16: 'filter:blur(16px)',
  fgray: 'filter:grayscale(1)', fgray50: 'filter:grayscale(0.5)', finvert: 'filter:invert(1)',
  fbright50: 'filter:brightness(0.5)', fbright75: 'filter:brightness(0.75)', fbright110: 'filter:brightness(1.1)',
  // Ring utilities (focus indicators, decorative outlines)
  ring1: 'box-shadow:0 0 0 1px var(--d-ring)',
  ring2: 'box-shadow:0 0 0 2px var(--d-ring)',
  ring4: 'box-shadow:0 0 0 4px var(--d-ring)',
  ring0: 'box-shadow:none',
  ringPrimary: '--d-ring:var(--d-primary)',
  ringAccent: '--d-ring:var(--d-accent)',
  ringBorder: '--d-ring:var(--d-border)',
  // Transition-property shortcuts
  transColors: 'transition:color 0.2s ease,background-color 0.2s ease,border-color 0.2s ease,fill 0.2s ease,stroke 0.2s ease',
  transOpacity: 'transition:opacity 0.2s ease',
  transTransform: 'transition:transform 0.2s ease',
  transShadow: 'transition:box-shadow 0.2s ease',
  // Text wrapping
  textBalance: 'text-wrap:balance',
  textPretty: 'text-wrap:pretty',
  // Scroll behavior
  scrollSmooth: 'scroll-behavior:smooth',
  // Component-class atoms (resolved as class passthrough, CSS comes from components.js)
  // _prose → adds 'd-prose' class
  // _divideY → adds 'd-divide-y' class
  // _divideX → adds 'd-divide-x' class
};

// ─── ALIASES — long-form → canonical (both with leading _) ──────
export const ALIASES = {
  // Grid columns: _gridCols1 → _gc1 ... _gridCols12 → _gc12
  ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`_gridCols${i + 1}`, `_gc${i + 1}`])),
  '_gridColsNone': '_gcnone',
  // Grid rows: _gridRows1 → _gr1 ... _gridRows6 → _gr6
  ...Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`_gridRows${i + 1}`, `_gr${i + 1}`])),
  // Text decoration
  '_noDecoration': '_nounder',
  // Border shortcuts
  '_border': '_b1',
  '_borderColor': '_bcborder',
  // Border radius
  '_radius': '_r1',
  '_radiusFull': '_rfull',
  '_radiusCircle': '_rcircle',
  ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`_radius${i}`, `_r${i}`])),
  // Layout/Flexbox
  '_flexCol': '_col', '_flexRow': '_row',
  '_flexWrap': '_wrap', '_flexNowrap': '_nowrap',
  '_flexGrow': '_grow', '_flexShrink': '_shrink',
  '_flexNone': '_flexnone', '_flexAuto': '_flexauto',
  // Alignment
  '_itemsCenter': '_aic', '_itemsStart': '_aifs', '_itemsEnd': '_aife',
  '_itemsStretch': '_ais', '_itemsBaseline': '_aibs',
  '_justifyCenter': '_jcc', '_justifyBetween': '_jcsb',
  '_justifyAround': '_jcsa', '_justifyEvenly': '_jcse',
  '_justifyStart': '_jcfs', '_justifyEnd': '_jcfe',
  '_selfCenter': '_asc', '_selfStart': '_asfs', '_selfEnd': '_asfe',
  // Sizing (case-sensitivity fix)
  '_wFull': '_wfull', '_hFull': '_hfull',
  '_wScreen': '_wscreen', '_hScreen': '_hscreen',
  '_wAuto': '_wauto', '_hAuto': '_hauto',
  '_wFit': '_wfit', '_hFit': '_hfit',
  '_minWFull': '_minwfull', '_maxWFull': '_mwfull',
  // Text/typography
  '_textCenter': '_tc', '_textRight': '_tr', '_textLeft': '_tl',
  '_uppercase': '_upper', '_lowercase': '_lower', '_capitalize': '_cap',
  '_fontBold': '_bold', '_fontMedium': '_medium', '_fontMono': '_fontmono',
  // Overflow
  '_overflowHidden': '_ohidden', '_overflowAuto': '_oauto',
  '_overflowScroll': '_oscroll', '_overflowVisible': '_ovisible',
  '_overflowXHidden': '_oxhidden', '_overflowXAuto': '_oxauto',
  '_overflowYHidden': '_oyhidden', '_overflowYAuto': '_oyauto',
  '_overflowYScroll': '_oyscroll',
  // Cursor/interaction
  '_cursor': '_pointer', '_cursorPointer': '_pointer', '_cursorGrab': '_grab',
  // Transition
  '_transAll': '_trans',
  // Visibility
  '_hidden': '_none',
  // Auto-margin
  '_mlAuto': '_mla', '_mrAuto': '_mra', '_mxAuto': '_mxa',
  // Field/state aliases
  '_fieldOutlined': '_field',
  // Case-fix aliases for Error
  '_bgError': '_bgerror',
  '_fgError': '_fgerror',

  // ── Tailwind-compatible aliases (bridge for LLM training data) ──
  // Layout / Flexbox
  '_flex-col': '_col', '_flex-row': '_row',
  '_flex-wrap': '_wrap', '_flex-nowrap': '_nowrap',
  '_flex-1': '_flex1', '_flex-none': '_flexnone', '_flex-auto': '_flexauto',
  '_flex-grow': '_grow', '_flex-shrink': '_shrink',
  // Alignment
  '_items-center': '_aic', '_items-start': '_aifs', '_items-end': '_aife',
  '_items-stretch': '_ais', '_items-baseline': '_aibs',
  '_justify-center': '_jcc', '_justify-between': '_jcsb',
  '_justify-around': '_jcsa', '_justify-evenly': '_jcse',
  '_justify-start': '_jcfs', '_justify-end': '_jcfe',
  '_self-center': '_asc', '_self-start': '_asfs', '_self-end': '_asfe',
  '_place-center': '_pic', '_place-items-center': '_pic',
  // Sizing
  '_w-full': '_wfull', '_h-full': '_hfull',
  '_w-screen': '_wscreen', '_h-screen': '_hscreen',
  '_w-auto': '_wauto', '_h-auto': '_hauto',
  '_w-fit': '_wfit', '_h-fit': '_hfit',
  '_min-h-screen': '_minhscreen', '_min-w-full': '_minwfull',
  '_max-w-full': '_mwfull',
  // Typography
  '_text-center': '_tc', '_text-left': '_tl', '_text-right': '_tr',
  '_font-bold': '_bold', '_font-medium': '_medium',
  '_font-normal': '_normal', '_font-light': '_light',
  '_font-mono': '_fontmono',
  '_text-xs': '_textxs', '_text-sm': '_textsm', '_text-base': '_textbase',
  '_text-lg': '_textlg', '_text-xl': '_textxl', '_text-2xl': '_text2xl',
  '_text-3xl': '_text3xl', '_text-4xl': '_text4xl',
  '_leading-tight': '_lhtight', '_leading-normal': '_lhnormal',
  '_leading-relaxed': '_lhrelaxed', '_leading-loose': '_lhloose',
  '_tracking-tight': '_lsheading',
  '_uppercase': '_upper', '_lowercase': '_lower', '_capitalize': '_cap',
  '_line-through': '_strike', '_no-underline': '_nounder',
  '_line-clamp-2': '_clamp2', '_line-clamp-3': '_clamp3',
  '_whitespace-nowrap': '_wsnw',
  // Spacing (hyphenated: _p-4 → _p4, etc.)
  ...Object.fromEntries([0,1,2,3,4,5,6,7,8,9,10,11,12].flatMap(n => [
    [`_p-${n}`, `_p${n}`], [`_px-${n}`, `_px${n}`], [`_py-${n}`, `_py${n}`],
    [`_m-${n}`, `_m${n}`], [`_mx-${n}`, `_mx${n}`], [`_my-${n}`, `_my${n}`],
    [`_gap-${n}`, `_gap${n}`]
  ])),
  // Borders / Radius
  '_border': '_b1', '_border-0': '_b0', '_border-2': '_b2',
  '_rounded-full': '_rfull',
  '_rounded-sm': '_r1', '_rounded-md': '_r2', '_rounded-lg': '_r4',
  '_rounded-xl': '_r6', '_rounded-2xl': '_r8', '_rounded-none': '_r0',
  // Shadows
  '_shadow-md': '_shadowmd', '_shadow-lg': '_shadowlg',
  '_shadow-none': '_shadowno',
  // Colors (Tailwind-style semantic)
  '_bg-primary': '_bgprimary', '_bg-accent': '_bgaccent',
  '_bg-success': '_bgsuccess', '_bg-warning': '_bgwarning', '_bg-error': '_bgerror',
  '_bg-muted': '_bgmuted', '_bg-transparent': '_bgTransparent',
  '_text-primary': '_fgprimary', '_text-accent': '_fgaccent',
  '_text-muted': '_fgmuted', '_text-muted-foreground': '_fgmutedfg',
  '_text-success': '_fgsuccess', '_text-warning': '_fgwarning', '_text-error': '_fgerror',
  '_border-border': '_bcborder', '_border-strong': '_bcstrong',
  // Overflow
  '_overflow-hidden': '_ohidden', '_overflow-auto': '_oauto',
  '_overflow-scroll': '_oscroll', '_overflow-visible': '_ovisible',
  '_overflow-x-hidden': '_oxhidden', '_overflow-x-auto': '_oxauto',
  '_overflow-y-hidden': '_oyhidden', '_overflow-y-auto': '_oyauto',
  // Position
  // Position (only add aliases that differ from canonical names)
  '_inset-0': '_inset0', '_top-0': '_top0', '_right-0': '_right0',
  '_bottom-0': '_bottom0', '_left-0': '_left0',
  // Transition
  '_transition': '_trans', '_transition-all': '_trans', '_transition-none': '_transnone',
  // Cursor
  '_cursor-pointer': '_pointer', '_cursor-grab': '_grab',
  // Visibility
  '_sr-only': '_srOnly',
  // Grid
  '_grid-cols-1': '_gc1', '_grid-cols-2': '_gc2', '_grid-cols-3': '_gc3',
  '_grid-cols-4': '_gc4', '_grid-cols-6': '_gc6', '_grid-cols-12': '_gc12',
  '_col-span-1': '_span1', '_col-span-2': '_span2', '_col-span-3': '_span3',
  '_col-span-4': '_span4', '_col-span-6': '_span6', '_col-span-full': '_spanfull',
  // Opacity
  '_opacity-0': '_op0', '_opacity-50': '_op5', '_opacity-100': '_op10',
};

// ─── Main resolver ──────────────────────────────────────────────
export function resolveAtomDecl(name) {
  // Alias resolution (aliases include underscore prefix)
  if (ALIASES[name]) return resolveAtomDecl(ALIASES[name]);

  // Strip leading underscore
  const n = name.startsWith('_') ? name.slice(1) : name;

  // DIRECT lookup
  if (DIRECT[n] !== undefined) return DIRECT[n];

  // Algorithmic resolution
  const algo = resolveAlgorithmic(n);
  if (algo) return algo;

  // Residual
  return RESIDUAL[n] || null;
}
