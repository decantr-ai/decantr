/**
 * Decantr CSS Atoms - Direct atom definitions and algorithmic resolution.
 */

/** Direct atom -> CSS declaration mapping */
const DIRECT: Record<string, string> = {
  // Display
  block: 'display:block',
  inline: 'display:inline',
  flex: 'display:flex',
  inlineflex: 'display:inline-flex',
  grid: 'display:grid',
  inlinegrid: 'display:inline-grid',
  none: 'display:none',
  contents: 'display:contents',

  // Flexbox direction
  col: 'flex-direction:column',
  row: 'flex-direction:row',
  colrev: 'flex-direction:column-reverse',
  rowrev: 'flex-direction:row-reverse',

  // Flex wrap
  wrap: 'flex-wrap:wrap',
  nowrap: 'flex-wrap:nowrap',
  wraprev: 'flex-wrap:wrap-reverse',

  // Flex grow/shrink
  flex1: 'flex:1',
  flex0: 'flex:none',
  flexauto: 'flex:auto',
  grow: 'flex-grow:1',
  grow0: 'flex-grow:0',
  shrink: 'flex-shrink:1',
  shrink0: 'flex-shrink:0',

  // Align items
  aic: 'align-items:center',
  aifs: 'align-items:flex-start',
  aife: 'align-items:flex-end',
  aist: 'align-items:stretch',
  aibl: 'align-items:baseline',

  // Justify content
  jcc: 'justify-content:center',
  jcfs: 'justify-content:flex-start',
  jcfe: 'justify-content:flex-end',
  jcsb: 'justify-content:space-between',
  jcsa: 'justify-content:space-around',
  jcse: 'justify-content:space-evenly',

  // Align self
  asc: 'align-self:center',
  asfs: 'align-self:flex-start',
  asfe: 'align-self:flex-end',
  asst: 'align-self:stretch',

  // Justify self
  jsc: 'justify-self:center',
  jsfs: 'justify-self:start',
  jsfe: 'justify-self:end',
  jsst: 'justify-self:stretch',

  // Place items/content
  pic: 'place-items:center',
  pcc: 'place-content:center',

  // Position
  rel: 'position:relative',
  abs: 'position:absolute',
  fixed: 'position:fixed',
  sticky: 'position:sticky',
  static: 'position:static',

  // Sizing
  wfull: 'width:100%',
  hfull: 'height:100%',
  w100: 'width:100%',
  h100: 'height:100%',
  wscreen: 'width:100vw',
  hscreen: 'height:100vh',
  wfit: 'width:fit-content',
  hfit: 'height:fit-content',
  wmin: 'width:min-content',
  hmin: 'height:min-content',
  wmax: 'width:max-content',
  hmax: 'height:max-content',
  wauto: 'width:auto',
  hauto: 'height:auto',
  minw0: 'min-width:0',
  minh0: 'min-height:0',
  maxwfull: 'max-width:100%',
  maxhfull: 'max-height:100%',
  mw640: 'max-width:40rem',
  mw480: 'max-width:30rem',

  // Overflow
  overhidden: 'overflow:hidden',
  overauto: 'overflow:auto',
  overscroll: 'overflow:scroll',
  overvis: 'overflow:visible',
  overclip: 'overflow:clip',
  overxhidden: 'overflow-x:hidden',
  overyhidden: 'overflow-y:hidden',
  overxauto: 'overflow-x:auto',
  overyauto: 'overflow-y:auto',

  // Text alignment
  textl: 'text-align:left',
  textc: 'text-align:center',
  textr: 'text-align:right',
  textj: 'text-align:justify',

  // Vertical alignment
  vam: 'vertical-align:middle',
  vat: 'vertical-align:top',
  vab: 'vertical-align:bottom',
  vabl: 'vertical-align:baseline',

  // Font weight
  fontlight: 'font-weight:300',
  fontnormal: 'font-weight:400',
  fontmedium: 'font-weight:500',
  fontsemi: 'font-weight:600',
  fontbold: 'font-weight:700',
  fontextrabold: 'font-weight:800',

  // Font family
  fontmono: 'font-family:var(--d-font-mono,ui-monospace,monospace)',

  // Font style
  italic: 'font-style:italic',
  notitalic: 'font-style:normal',

  // Text decoration
  underline: 'text-decoration:underline',
  linethrough: 'text-decoration:line-through',
  nounderline: 'text-decoration:none',

  // Text transform
  uppercase: 'text-transform:uppercase',
  lowercase: 'text-transform:lowercase',
  capitalize: 'text-transform:capitalize',
  normalcase: 'text-transform:none',

  // Whitespace
  nowraptext: 'white-space:nowrap',
  pre: 'white-space:pre',
  prewrap: 'white-space:pre-wrap',
  preline: 'white-space:pre-line',
  breakspaces: 'white-space:break-spaces',

  // Word/text breaking
  breakword: 'overflow-wrap:break-word',
  breakall: 'word-break:break-all',
  breakkeep: 'word-break:keep-all',
  truncate: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap',

  // Cursor
  pointer: 'cursor:pointer',
  cursordefault: 'cursor:default',
  wait: 'cursor:wait',
  cursortext: 'cursor:text',
  move: 'cursor:move',
  notallowed: 'cursor:not-allowed',
  grab: 'cursor:grab',
  grabbing: 'cursor:grabbing',

  // Pointer events
  ptrall: 'pointer-events:all',
  ptrnone: 'pointer-events:none',
  ptrauto: 'pointer-events:auto',

  // User select
  selectnone: 'user-select:none',
  selecttext: 'user-select:text',
  selectall: 'user-select:all',
  selectauto: 'user-select:auto',

  // Visibility
  visible: 'visibility:visible',
  invisible: 'visibility:hidden',

  // Opacity
  op0: 'opacity:0',
  op25: 'opacity:0.25',
  op50: 'opacity:0.5',
  op75: 'opacity:0.75',
  op100: 'opacity:1',

  // Border style
  bordernone: 'border:none',
  bordersolid: 'border-style:solid',
  borderdashed: 'border-style:dashed',
  borderdotted: 'border-style:dotted',

  // Border radius
  rounded: 'border-radius:var(--d-radius,0.5rem)',
  roundedfull: 'border-radius:9999px',
  roundednone: 'border-radius:0',
  roundedsm: 'border-radius:0.25rem',
  roundedlg: 'border-radius:0.75rem',
  roundedxl: 'border-radius:1rem',
  rounded2xl: 'border-radius:1.5rem',

  // Shadows
  shadow: 'box-shadow:var(--d-shadow,0 1px 3px rgba(0,0,0,0.1))',
  shadowsm: 'box-shadow:0 1px 2px rgba(0,0,0,0.05)',
  shadowmd: 'box-shadow:0 4px 6px rgba(0,0,0,0.1)',
  shadowlg: 'box-shadow:0 10px 15px rgba(0,0,0,0.1)',
  shadowxl: 'box-shadow:0 20px 25px rgba(0,0,0,0.1)',
  shadownone: 'box-shadow:none',

  // Transitions
  trans: 'transition:all 0.15s ease',
  transnone: 'transition:none',
  transcolors: 'transition:color,background-color,border-color 0.15s ease',
  transopacity: 'transition:opacity 0.15s ease',
  transtransform: 'transition:transform 0.15s ease',

  // Object fit
  objcover: 'object-fit:cover',
  objcontain: 'object-fit:contain',
  objfill: 'object-fit:fill',
  objnone: 'object-fit:none',
  objscale: 'object-fit:scale-down',

  // Object position
  objcenter: 'object-position:center',
  objtop: 'object-position:top',
  objbottom: 'object-position:bottom',
  objleft: 'object-position:left',
  objright: 'object-position:right',

  // List style
  listnone: 'list-style:none',
  listdisc: 'list-style-type:disc',
  listdecimal: 'list-style-type:decimal',

  // Table
  bordercollapse: 'border-collapse:collapse',
  borderseparate: 'border-collapse:separate',
  tablelayout: 'table-layout:fixed',

  // Aspect ratio
  aspect11: 'aspect-ratio:1/1',
  aspect169: 'aspect-ratio:16/9',
  aspect43: 'aspect-ratio:4/3',
  aspectvideo: 'aspect-ratio:16/9',
  aspectsquare: 'aspect-ratio:1/1',

  // Z-index
  z0: 'z-index:0',
  z10: 'z-index:10',
  z20: 'z-index:20',
  z30: 'z-index:30',
  z40: 'z-index:40',
  z50: 'z-index:50',
  zauto: 'z-index:auto',
  zneg: 'z-index:-1',

  // Isolation
  isolate: 'isolation:isolate',
  isolateauto: 'isolation:auto',

  // Inset
  inset0: 'inset:0',
  insetauto: 'inset:auto',
  top0: 'top:0',
  right0: 'right:0',
  bottom0: 'bottom:0',
  left0: 'left:0',

  // Appearance
  appearancenone: 'appearance:none',

  // Outline
  outlinenone: 'outline:none',
  ring: 'outline:2px solid var(--d-primary,#6366f1);outline-offset:2px',
  ring1: 'outline:1px solid var(--d-primary,#6366f1);outline-offset:1px',
  ring2: 'outline:2px solid var(--d-primary,#6366f1);outline-offset:2px',

  // Container queries
  cqinline: 'container-type:inline-size',

  // Container (max-width containment)
  container: 'max-width:1200px;margin-inline:auto;width:100%;padding-inline:1rem',
  containersm: 'max-width:640px;margin-inline:auto;width:100%;padding-inline:1rem',
  containermd: 'max-width:768px;margin-inline:auto;width:100%;padding-inline:1rem',
  containerlg: 'max-width:1024px;margin-inline:auto;width:100%;padding-inline:1rem',
  containerxl: 'max-width:1400px;margin-inline:auto;width:100%;padding-inline:1rem',
  containerfull: 'max-width:100%;margin-inline:auto;width:100%;padding-inline:1rem',

  // Background
  bgcover: 'background-size:cover',
  bgcontain: 'background-size:contain',
  bgcenter: 'background-position:center',
  bgnorepeat: 'background-repeat:no-repeat',
  bgrepeat: 'background-repeat:repeat',
  bgfixed: 'background-attachment:fixed',

  // Will-change
  willchange: 'will-change:transform',
  willchangeauto: 'will-change:auto',

  // Backface
  backfacehidden: 'backface-visibility:hidden',
  backfacevisible: 'backface-visibility:visible',

  // Resize
  resizenone: 'resize:none',
  resizex: 'resize:horizontal',
  resizey: 'resize:vertical',
  resize: 'resize:both',

  // Touch action
  touchnone: 'touch-action:none',
  touchpan: 'touch-action:pan-x pan-y',
  touchmanip: 'touch-action:manipulation',

  // Scroll behavior
  scrollsmooth: 'scroll-behavior:smooth',
  scrollauto: 'scroll-behavior:auto',

  // Snap
  snapx: 'scroll-snap-type:x mandatory',
  snapy: 'scroll-snap-type:y mandatory',
  snapstart: 'scroll-snap-align:start',
  snapcenter: 'scroll-snap-align:center',
  snapend: 'scroll-snap-align:end',

  // SR only
  sronly:
    'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0',
  notsr:
    'position:static;width:auto;height:auto;padding:0;margin:0;overflow:visible;clip:auto;white-space:normal',
};

/** Spacing scale (rem-based, 4px = 0.25rem) */
const SPACING_SCALE: Record<number, string> = {
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

/** Font size scale */
const TEXT_SCALE: Record<string, string> = {
  xs: 'font-size:0.75rem;line-height:1rem',
  sm: 'font-size:0.875rem;line-height:1.25rem',
  base: 'font-size:1rem;line-height:1.5rem',
  lg: 'font-size:1.125rem;line-height:1.75rem',
  xl: 'font-size:1.25rem;line-height:1.75rem',
  '2xl': 'font-size:1.5rem;line-height:2rem',
  '3xl': 'font-size:1.875rem;line-height:2.25rem',
  '4xl': 'font-size:2.25rem;line-height:2.5rem',
  '5xl': 'font-size:3rem;line-height:1',
  '6xl': 'font-size:3.75rem;line-height:1',
};

/** Heading presets */
const HEADING_SCALE: Record<string, string> = {
  '1': 'font-size:2.25rem;line-height:2.5rem;font-weight:700',
  '2': 'font-size:1.875rem;line-height:2.25rem;font-weight:700',
  '3': 'font-size:1.5rem;line-height:2rem;font-weight:600',
  '4': 'font-size:1.25rem;line-height:1.75rem;font-weight:600',
  '5': 'font-size:1.125rem;line-height:1.75rem;font-weight:600',
  '6': 'font-size:1rem;line-height:1.5rem;font-weight:600',
};

/** Color atoms (use CSS variables) */
const COLOR_ATOMS: Record<string, string> = {
  // Background colors
  bgprimary: 'background:var(--d-primary)',
  bgsecondary: 'background:var(--d-secondary)',
  bgaccent: 'background:var(--d-accent)',
  bgsurface: 'background:var(--d-surface)',
  bgsurface0: 'background:var(--d-surface-0,var(--d-bg))',
  bgsurface1: 'background:var(--d-surface-1,var(--d-surface))',
  bgsurface2: 'background:var(--d-surface-2,var(--d-surface-raised))',
  bgsurf: 'background:var(--d-surface)',
  bgsurfraised: 'background:var(--d-surface-raised)',
  bgmuted: 'background:var(--d-muted,var(--d-surface))',
  bgbg: 'background:var(--d-bg)',
  bgtransparent: 'background:transparent',
  bgwhite: 'background:#fff',
  bgblack: 'background:#000',
  bgsuccess: 'background:var(--d-success,#22c55e)',
  bgerror: 'background:var(--d-error,#ef4444)',
  bgwarning: 'background:var(--d-warning,#f59e0b)',
  bginfo: 'background:var(--d-info,#3b82f6)',

  // Foreground/text colors
  fgprimary: 'color:var(--d-primary)',
  fgsecondary: 'color:var(--d-secondary)',
  fgaccent: 'color:var(--d-accent)',
  fgmuted: 'color:var(--d-text-muted,var(--d-muted))',
  fgtext: 'color:var(--d-text)',
  fgwhite: 'color:#fff',
  fgblack: 'color:#000',
  fginherit: 'color:inherit',
  fgsuccess: 'color:var(--d-success,#22c55e)',
  fgerror: 'color:var(--d-error,#ef4444)',
  fgwarning: 'color:var(--d-warning,#f59e0b)',
  fginfo: 'color:var(--d-info,#3b82f6)',

  // Border colors
  bcprimary: 'border-color:var(--d-primary)',
  bcsecondary: 'border-color:var(--d-secondary)',
  bcaccent: 'border-color:var(--d-accent)',
  bcborder: 'border-color:var(--d-border)',
  bcmuted: 'border-color:var(--d-muted,var(--d-border))',
  bctransparent: 'border-color:transparent',
};

/** Grid column patterns */
const GRID_COLS: Record<string, string> = {
  gc1: 'grid-template-columns:repeat(1,minmax(0,1fr))',
  gc2: 'grid-template-columns:repeat(2,minmax(0,1fr))',
  gc3: 'grid-template-columns:repeat(3,minmax(0,1fr))',
  gc4: 'grid-template-columns:repeat(4,minmax(0,1fr))',
  gc5: 'grid-template-columns:repeat(5,minmax(0,1fr))',
  gc6: 'grid-template-columns:repeat(6,minmax(0,1fr))',
  gc7: 'grid-template-columns:repeat(7,minmax(0,1fr))',
  gc8: 'grid-template-columns:repeat(8,minmax(0,1fr))',
  gc9: 'grid-template-columns:repeat(9,minmax(0,1fr))',
  gc10: 'grid-template-columns:repeat(10,minmax(0,1fr))',
  gc11: 'grid-template-columns:repeat(11,minmax(0,1fr))',
  gc12: 'grid-template-columns:repeat(12,minmax(0,1fr))',
};

/** Grid row patterns */
const GRID_ROWS: Record<string, string> = {
  gr1: 'grid-template-rows:repeat(1,minmax(0,1fr))',
  gr2: 'grid-template-rows:repeat(2,minmax(0,1fr))',
  gr3: 'grid-template-rows:repeat(3,minmax(0,1fr))',
  gr4: 'grid-template-rows:repeat(4,minmax(0,1fr))',
  gr5: 'grid-template-rows:repeat(5,minmax(0,1fr))',
  gr6: 'grid-template-rows:repeat(6,minmax(0,1fr))',
};

/** Grid span patterns */
const GRID_SPAN: Record<string, string> = {
  span1: 'grid-column:span 1/span 1',
  span2: 'grid-column:span 2/span 2',
  span3: 'grid-column:span 3/span 3',
  span4: 'grid-column:span 4/span 4',
  span5: 'grid-column:span 5/span 5',
  span6: 'grid-column:span 6/span 6',
  span7: 'grid-column:span 7/span 7',
  span8: 'grid-column:span 8/span 8',
  span9: 'grid-column:span 9/span 9',
  span10: 'grid-column:span 10/span 10',
  span11: 'grid-column:span 11/span 11',
  span12: 'grid-column:span 12/span 12',
  spanfull: 'grid-column:1/-1',
  rowspan1: 'grid-row:span 1/span 1',
  rowspan2: 'grid-row:span 2/span 2',
  rowspan3: 'grid-row:span 3/span 3',
  rowspan4: 'grid-row:span 4/span 4',
  rowspan5: 'grid-row:span 5/span 5',
  rowspan6: 'grid-row:span 6/span 6',
  rowspanfull: 'grid-row:1/-1',
};

/**
 * Resolve an atom name to its CSS declaration.
 * @param atom - Atom name (e.g., '_flex', '_gap4', '_p2')
 * @returns CSS declaration or null if not recognized
 */
export function resolveAtomDecl(atom: string): string | null {
  // Strip leading underscore if present
  const name = atom.startsWith('_') ? atom.slice(1) : atom;

  // Direct lookup
  if (DIRECT[name]) return DIRECT[name];
  if (COLOR_ATOMS[name]) return COLOR_ATOMS[name];
  if (GRID_COLS[name]) return GRID_COLS[name];
  if (GRID_ROWS[name]) return GRID_ROWS[name];
  if (GRID_SPAN[name]) return GRID_SPAN[name];

  // Text size: _textsm, _textlg, _text2xl
  if (name.startsWith('text')) {
    const size = name.slice(4);
    if (TEXT_SCALE[size]) return TEXT_SCALE[size];
  }

  // Heading: _heading1, _heading2, ...
  if (name.startsWith('heading')) {
    const level = name.slice(7);
    if (HEADING_SCALE[level]) return HEADING_SCALE[level];
  }

  // Gap: _gap0, _gap4, _gap8, etc.
  const gapMatch = name.match(/^gap(\d+(?:\.\d+)?)$/);
  if (gapMatch) {
    const n = parseFloat(gapMatch[1]);
    const value = SPACING_SCALE[n];
    if (value) return `gap:${value}`;
  }

  // Column gap: _gx4
  const gxMatch = name.match(/^gx(\d+(?:\.\d+)?)$/);
  if (gxMatch) {
    const n = parseFloat(gxMatch[1]);
    const value = SPACING_SCALE[n];
    if (value) return `column-gap:${value}`;
  }

  // Row gap: _gy4
  const gyMatch = name.match(/^gy(\d+(?:\.\d+)?)$/);
  if (gyMatch) {
    const n = parseFloat(gyMatch[1]);
    const value = SPACING_SCALE[n];
    if (value) return `row-gap:${value}`;
  }

  // Padding: _p4, _pt2, _px4, _py2
  const paddingMatch = name.match(/^p([trblxy]?)(\d+(?:\.\d+)?)$/);
  if (paddingMatch) {
    const [, dir, num] = paddingMatch;
    const n = parseFloat(num);
    const value = SPACING_SCALE[n];
    if (value) {
      if (!dir || dir === '') return `padding:${value}`;
      if (dir === 't') return `padding-top:${value}`;
      if (dir === 'r') return `padding-right:${value}`;
      if (dir === 'b') return `padding-bottom:${value}`;
      if (dir === 'l') return `padding-left:${value}`;
      if (dir === 'x') return `padding-inline:${value}`;
      if (dir === 'y') return `padding-block:${value}`;
    }
  }

  // Margin: _m4, _mt2, _mx4, _my2
  const marginMatch = name.match(/^m([trblxy]?)(\d+(?:\.\d+)?)$/);
  if (marginMatch) {
    const [, dir, num] = marginMatch;
    const n = parseFloat(num);
    const value = SPACING_SCALE[n];
    if (value) {
      if (!dir || dir === '') return `margin:${value}`;
      if (dir === 't') return `margin-top:${value}`;
      if (dir === 'r') return `margin-right:${value}`;
      if (dir === 'b') return `margin-bottom:${value}`;
      if (dir === 'l') return `margin-left:${value}`;
      if (dir === 'x') return `margin-inline:${value}`;
      if (dir === 'y') return `margin-block:${value}`;
    }
  }

  // Margin auto: _mauto, _mtauto, _mxauto, _myauto, _mlauto, _mrauto.
  // Covers the "push to end" / "center horizontally" idioms that the
  // numeric margin atoms can't express (e.g., footer `_mtauto` to pin
  // to the bottom of a flex column, content `_mxauto` to center).
  const marginAutoMatch = name.match(/^m([trblxy]?)auto$/);
  if (marginAutoMatch) {
    const [, dir] = marginAutoMatch;
    if (!dir || dir === '') return `margin:auto`;
    if (dir === 't') return `margin-top:auto`;
    if (dir === 'r') return `margin-right:auto`;
    if (dir === 'b') return `margin-bottom:auto`;
    if (dir === 'l') return `margin-left:auto`;
    if (dir === 'x') return `margin-inline:auto`;
    if (dir === 'y') return `margin-block:auto`;
  }

  // Negative margin: _-mt4, _-mx2
  const negMarginMatch = name.match(/^-m([trblxy]?)(\d+(?:\.\d+)?)$/);
  if (negMarginMatch) {
    const [, dir, num] = negMarginMatch;
    const n = parseFloat(num);
    const value = SPACING_SCALE[n];
    if (value) {
      const negValue = `-${value}`;
      if (!dir || dir === '') return `margin:${negValue}`;
      if (dir === 't') return `margin-top:${negValue}`;
      if (dir === 'r') return `margin-right:${negValue}`;
      if (dir === 'b') return `margin-bottom:${negValue}`;
      if (dir === 'l') return `margin-left:${negValue}`;
      if (dir === 'x') return `margin-inline:${negValue}`;
      if (dir === 'y') return `margin-block:${negValue}`;
    }
  }

  // Width: _w4, _w64
  const widthMatch = name.match(/^w(\d+(?:\.\d+)?)$/);
  if (widthMatch) {
    const n = parseFloat(widthMatch[1]);
    const value = SPACING_SCALE[n];
    if (value) return `width:${value}`;
  }

  // Height: _h4, _h64
  const heightMatch = name.match(/^h(\d+(?:\.\d+)?)$/);
  if (heightMatch) {
    const n = parseFloat(heightMatch[1]);
    const value = SPACING_SCALE[n];
    if (value) return `height:${value}`;
  }

  // Min width: _minw4
  const minwMatch = name.match(/^minw(\d+(?:\.\d+)?)$/);
  if (minwMatch) {
    const n = parseFloat(minwMatch[1]);
    const value = SPACING_SCALE[n];
    if (value) return `min-width:${value}`;
  }

  // Max width: _maxw4
  const maxwMatch = name.match(/^maxw(\d+(?:\.\d+)?)$/);
  if (maxwMatch) {
    const n = parseFloat(maxwMatch[1]);
    const value = SPACING_SCALE[n];
    if (value) return `max-width:${value}`;
  }

  // Min height: _minh4
  const minhMatch = name.match(/^minh(\d+(?:\.\d+)?)$/);
  if (minhMatch) {
    const n = parseFloat(minhMatch[1]);
    const value = SPACING_SCALE[n];
    if (value) return `min-height:${value}`;
  }

  // Max height: _maxh4
  const maxhMatch = name.match(/^maxh(\d+(?:\.\d+)?)$/);
  if (maxhMatch) {
    const n = parseFloat(maxhMatch[1]);
    const value = SPACING_SCALE[n];
    if (value) return `max-height:${value}`;
  }

  // Border width: _bw1, _bw2
  const bwMatch = name.match(/^bw(\d+)$/);
  if (bwMatch) {
    const n = parseInt(bwMatch[1], 10);
    return `border-width:${n}px`;
  }

  // Border radius: _r4, _r8
  const radiusMatch = name.match(/^r(\d+)$/);
  if (radiusMatch) {
    const n = parseInt(radiusMatch[1], 10);
    return `border-radius:${n}px`;
  }

  // Line height: _lh1, _lh1.5
  const lhMatch = name.match(/^lh(\d+(?:\.\d+)?)$/);
  if (lhMatch) {
    return `line-height:${lhMatch[1]}`;
  }

  // Letter spacing: _ls1, _ls2
  const lsMatch = name.match(/^ls(\d+)$/);
  if (lsMatch) {
    const n = parseInt(lsMatch[1], 10);
    return `letter-spacing:${n * 0.025}em`;
  }

  // Transform scale: _scale95, _scale100, _scale105
  const scaleMatch = name.match(/^scale(\d+)$/);
  if (scaleMatch) {
    const n = parseInt(scaleMatch[1], 10);
    return `transform:scale(${n / 100})`;
  }

  // Transform rotate: _rotate45, _rotate90
  const rotateMatch = name.match(/^rotate(-?\d+)$/);
  if (rotateMatch) {
    return `transform:rotate(${rotateMatch[1]}deg)`;
  }

  // Transform translate: _translatex4, _translatey4
  const translateXMatch = name.match(/^translatex(-?\d+)$/);
  if (translateXMatch) {
    const n = parseInt(translateXMatch[1], 10);
    const value = SPACING_SCALE[Math.abs(n)] || `${n}px`;
    return `transform:translateX(${n < 0 ? '-' : ''}${value})`;
  }

  const translateYMatch = name.match(/^translatey(-?\d+)$/);
  if (translateYMatch) {
    const n = parseInt(translateYMatch[1], 10);
    const value = SPACING_SCALE[Math.abs(n)] || `${n}px`;
    return `transform:translateY(${n < 0 ? '-' : ''}${value})`;
  }

  // Inset values: _top4, _left8, _right2, _bottom4
  const insetMatch = name.match(/^(top|right|bottom|left|inset)(\d+(?:\.\d+)?)$/);
  if (insetMatch) {
    const [, prop, num] = insetMatch;
    const n = parseFloat(num);
    const value = SPACING_SCALE[n];
    if (value) return `${prop}:${value}`;
  }

  // Not found
  return null;
}
