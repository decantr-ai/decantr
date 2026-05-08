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
  // Hyphenated aliases — DECANTR.md examples used `_w-full` / `_h-full`
  // historically; cold-LLM scaffolds fall back to the doc-spelling. Accept
  // both so the doc and runtime can never silently disagree.
  'w-full': 'width:100%',
  'h-full': 'height:100%',
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
  // Item alignment aliases — DECANTR.md examples used `_items-center` /
  // `_items-start` etc. (Tailwind-style); accept both alongside the
  // canonical `_aic` / `_aifs` etc. so doc-driven AI scaffolds resolve.
  'items-center': 'align-items:center',
  'items-start': 'align-items:flex-start',
  'items-end': 'align-items:flex-end',
  'items-stretch': 'align-items:stretch',
  'items-baseline': 'align-items:baseline',
  'justify-center': 'justify-content:center',
  'justify-start': 'justify-content:flex-start',
  'justify-end': 'justify-content:flex-end',
  'justify-between': 'justify-content:space-between',
  'justify-around': 'justify-content:space-around',
  'justify-evenly': 'justify-content:space-evenly',

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

const TAILWIND_DIRECT: Record<string, string> = {
  relative: 'position:relative',
  absolute: 'position:absolute',
  'gap-auto': 'gap:var(--d-gap,1rem)',
  'inline-flex': 'display:inline-flex',
  'inline-grid': 'display:inline-grid',
  center: 'align-items:center;justify-content:center',
  'align-center': 'align-items:center',
  'align-start': 'align-items:flex-start',
  'flex-col': 'flex-direction:column',
  'flex-row': 'flex-direction:row',
  'col-reverse': 'flex-direction:column-reverse',
  'flex-col-reverse': 'flex-direction:column-reverse',
  'flex-row-reverse': 'flex-direction:row-reverse',
  'flex-wrap': 'flex-wrap:wrap',
  flexwrap: 'flex-wrap:wrap',
  'flex-nowrap': 'flex-wrap:nowrap',
  'flex-wrap-nowrap': 'flex-wrap:nowrap',
  'flex-1': 'flex:1',
  'flex-auto': 'flex:auto',
  'flex-none': 'flex:none',
  'grow-0': 'flex-grow:0',
  'shrink-0': 'flex-shrink:0',
  'items-center': 'align-items:center',
  'items-start': 'align-items:flex-start',
  'items-end': 'align-items:flex-end',
  'items-stretch': 'align-items:stretch',
  'items-baseline': 'align-items:baseline',
  'justify-center': 'justify-content:center',
  'justify-start': 'justify-content:flex-start',
  'justify-end': 'justify-content:flex-end',
  'justify-between': 'justify-content:space-between',
  'justify-around': 'justify-content:space-around',
  'justify-evenly': 'justify-content:space-evenly',
  'place-items-center': 'place-items:center',
  'place-content-center': 'place-content:center',
  'self-center': 'align-self:center',
  'self-start': 'align-self:flex-start',
  'self-end': 'align-self:flex-end',
  'overflow-hidden': 'overflow:hidden',
  'overflow-auto': 'overflow:auto',
  'overflow-visible': 'overflow:visible',
  overflowhidden: 'overflow:hidden',
  'overflow-x-hidden': 'overflow-x:hidden',
  'overflow-x-auto': 'overflow-x:auto',
  'overflow-y-hidden': 'overflow-y:hidden',
  'overflow-y-auto': 'overflow-y:auto',
  'scrollbar-thin': 'scrollbar-width:thin',
  'pointer-events-none': 'pointer-events:none',
  'pointer-events-auto': 'pointer-events:auto',
  'pointer-events-restricted': 'pointer-events:none',
  'cursor-pointer': 'cursor:pointer',
  'cursor-grab': 'cursor:grab',
  'select-none': 'user-select:none',
  'whitespace-nowrap': 'white-space:nowrap',
  'whitespace-pre': 'white-space:pre',
  'whitespace-pre-wrap': 'white-space:pre-wrap',
  'break-words': 'overflow-wrap:break-word',
  'break-all': 'word-break:break-all',
  'sr-only':
    'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0',
  'not-sr-only':
    'position:static;width:auto;height:auto;padding:0;margin:0;overflow:visible;clip:auto;white-space:normal',
  'object-cover': 'object-fit:cover',
  'object-contain': 'object-fit:contain',
  'object-center': 'object-position:center',
  'list-none': 'list-style:none',
  mono: 'font-family:var(--d-font-mono,ui-monospace,monospace)',
  'aspect-video': 'aspect-ratio:16/9',
  'aspect-square': 'aspect-ratio:1/1',
  full: 'width:100%;height:100%',
  'w-full': 'width:100%',
  'h-full': 'height:100%',
  'w-screen': 'width:100vw',
  'h-screen': 'height:100vh',
  'w-auto': 'width:auto',
  'h-auto': 'height:auto',
  'w-fit': 'width:fit-content',
  'h-fit': 'height:fit-content',
  'min-w-0': 'min-width:0',
  'min-h-0': 'min-height:0',
  'min-h-screen': 'min-height:100vh',
  'min-h-dvh': 'min-height:100dvh',
  'max-w-full': 'max-width:100%',
  'max-w-none': 'max-width:none',
  'mx-auto': 'margin-inline:auto',
  'my-auto': 'margin-block:auto',
  'mt-auto': 'margin-top:auto',
  'mb-auto': 'margin-bottom:auto',
  'ml-auto': 'margin-left:auto',
  'mr-auto': 'margin-right:auto',
  'inset-0': 'inset:0',
  'inset-x-0': 'left:0;right:0',
  'inset-y-0': 'top:0;bottom:0',
  'top-0': 'top:0',
  'right-0': 'right:0',
  'bottom-0': 'bottom:0',
  'left-0': 'left:0',
  'left-1/2': 'left:50%',
  'top-1/2': 'top:50%',
  '-translate-x-1/2': 'translate:-50% 0',
  '-translate-y-1/2': 'translate:0 -50%',
  jcs: 'justify-content:flex-start',
  jce: 'justify-content:flex-end',
  'border': 'border:1px solid var(--d-border)',
  'border-t': 'border-top:1px solid var(--d-border)',
  'border-r': 'border-right:1px solid var(--d-border)',
  'border-b': 'border-bottom:1px solid var(--d-border)',
  'border-l': 'border-left:1px solid var(--d-border)',
  'border-0': 'border:0',
  border2: 'border:2px solid var(--d-border)',
  'border-dashed': 'border-style:dashed',
  borderb: 'border-bottom:1px solid var(--d-border)',
  borderB: 'border-bottom:1px solid var(--d-border)',
  borderT: 'border-top:1px solid var(--d-border)',
  borderR: 'border-right:1px solid var(--d-border)',
  borderL: 'border-left:1px solid var(--d-border)',
  bbsolid: 'border-bottom:1px solid var(--d-border)',
  rfull: 'border-radius:9999px',
  'rounded-full': 'border-radius:9999px',
  'rounded-none': 'border-radius:0',
  'rounded-sm': 'border-radius:0.25rem',
  'rounded-md': 'border-radius:0.375rem',
  'rounded-lg': 'border-radius:0.5rem',
  'rounded-xl': 'border-radius:0.75rem',
  'rounded-2xl': 'border-radius:1rem',
  'rounded-3xl': 'border-radius:1.5rem',
  'shadow-sm': 'box-shadow:0 1px 2px rgba(0,0,0,0.05)',
  'shadow-md': 'box-shadow:0 4px 6px rgba(0,0,0,0.1)',
  'shadow-lg': 'box-shadow:0 10px 15px rgba(0,0,0,0.1)',
  'shadow-xl': 'box-shadow:0 20px 25px rgba(0,0,0,0.1)',
  'shadow-none': 'box-shadow:none',
  'backdrop-blur': 'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)',
  'backdrop-blur-sm': 'backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)',
  'backdrop-blur-md': 'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)',
  'backdrop-blur-lg': 'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)',
  'transition': 'transition:all 0.15s ease',
  'transition-all': 'transition:all 0.15s ease',
  'transition-colors': 'transition:color,background-color,border-color 0.15s ease',
  'scroll-smooth': 'scroll-behavior:smooth',
  'duration-150': 'transition-duration:150ms',
  'duration-200': 'transition-duration:200ms',
  'duration-300': 'transition-duration:300ms',
  'ease-out': 'transition-timing-function:cubic-bezier(0,0,0.2,1)',
  'ease-in-out': 'transition-timing-function:cubic-bezier(0.4,0,0.2,1)',
  tc: 'text-align:center',
  textCenter: 'text-align:center',
  fggreen: 'color:#22c55e',
  compact: 'gap:0.5rem',
  'auto-rows-fr': 'grid-auto-rows:minmax(0,1fr)',
};

const TAILWIND_MAX_WIDTH: Record<string, string> = {
  xs: '20rem',
  sm: '24rem',
  md: '28rem',
  lg: '32rem',
  xl: '36rem',
  '2xl': '42rem',
  '3xl': '48rem',
  '4xl': '56rem',
  '5xl': '64rem',
  '6xl': '72rem',
  '7xl': '80rem',
  full: '100%',
  none: 'none',
  'screen-sm': '640px',
  'screen-md': '768px',
  'screen-lg': '1024px',
  'screen-xl': '1280px',
  'screen-2xl': '1536px',
};

const TAILWIND_ARBITRARY_PROPS: Record<string, string> = {
  w: 'width',
  h: 'height',
  mw: 'max-width',
  mh: 'max-height',
  maxw: 'max-width',
  maxh: 'max-height',
  minw: 'min-width',
  minh: 'min-height',
  'min-w': 'min-width',
  'min-h': 'min-height',
  'max-w': 'max-width',
  'max-h': 'max-height',
  p: 'padding',
  px: 'padding-inline',
  py: 'padding-block',
  pt: 'padding-top',
  pr: 'padding-right',
  pb: 'padding-bottom',
  pl: 'padding-left',
  m: 'margin',
  mx: 'margin-inline',
  my: 'margin-block',
  mt: 'margin-top',
  mr: 'margin-right',
  mb: 'margin-bottom',
  ml: 'margin-left',
  gap: 'gap',
  'gap-x': 'column-gap',
  'gap-y': 'row-gap',
  'grid-cols': 'grid-template-columns',
  'grid-rows': 'grid-template-rows',
  gc: 'grid-template-columns',
  gr: 'grid-template-rows',
  'border': 'border',
  bb: 'border-bottom',
  bt: 'border-top',
  'rounded': 'border-radius',
  'text': 'text-align',
  'bg': 'background',
  'z': 'z-index',
  'top': 'top',
  'right': 'right',
  'bottom': 'bottom',
  'left': 'left',
  'inset': 'inset',
  'aspect': 'aspect-ratio',
};

const TAILWIND_SPACING_PROPS: Record<string, string> = {
  p: 'padding',
  px: 'padding-inline',
  py: 'padding-block',
  pt: 'padding-top',
  pr: 'padding-right',
  pb: 'padding-bottom',
  pl: 'padding-left',
  m: 'margin',
  mx: 'margin-inline',
  my: 'margin-block',
  mt: 'margin-top',
  mr: 'margin-right',
  mb: 'margin-bottom',
  ml: 'margin-left',
  gap: 'gap',
  'gap-x': 'column-gap',
  'gap-y': 'row-gap',
  top: 'top',
  right: 'right',
  bottom: 'bottom',
  left: 'left',
  inset: 'inset',
};

const FONT_WEIGHTS: Record<string, string> = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

const LINE_HEIGHTS: Record<string, string> = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
};

const LETTER_SPACING: Record<string, string> = {
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

function spacingValue(token: string): string | null {
  if (token === 'px') return '1px';
  const n = Number(token);
  if (!Number.isFinite(n)) return null;
  return SPACING_SCALE[n] ?? null;
}

function fractionValue(token: string): string | null {
  const match = token.match(/^(\d+)\/(\d+)$/);
  if (!match) return null;
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  if (!denominator) return null;
  return `${(numerator / denominator) * 100}%`;
}

function dimensionValue(prop: string, token: string): string | null {
  if (token === 'full') return '100%';
  if (token === 'auto') return 'auto';
  if (token === 'fit') return 'fit-content';
  if (token === 'min') return 'min-content';
  if (token === 'max') return 'max-content';
  if (token === 'screen') return prop.includes('h') ? '100vh' : '100vw';
  if (token === 'dvh' && prop.includes('h')) return '100dvh';
  if (prop === 'max-w' && TAILWIND_MAX_WIDTH[token]) return TAILWIND_MAX_WIDTH[token];
  const spacing = spacingValue(token);
  if (spacing) return spacing;
  const fraction = fractionValue(token);
  if (fraction) return fraction;
  if (/^\d+(?:\.\d+)?$/.test(token)) return `${token}px`;
  return null;
}

function sanitizeTailwindValue(value: string): string {
  let safe = value.replace(/[{}<>;]/g, '');
  safe = safe.replace(/url\s*\(/gi, '');
  return safe.replace(/_/g, ' ');
}

function semanticColorValue(token: string, prop: 'background' | 'color' | 'border-color'): string | null {
  const key = token.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  if (key === 'transparent') return 'transparent';
  if (key === 'white') return '#fff';
  if (key === 'black') return '#000';
  if (key === 'background' || key === 'bg' || key === 'canvas') return 'var(--d-bg)';
  if (key === 'surface' || key === 'card') return 'var(--d-surface)';
  if (key === 'surface-subtle' || key === 'surface-muted') {
    return 'var(--d-surface-1,var(--d-surface))';
  }
  if (key === 'surface-raised' || key === 'raised' || key === 'popover') {
    return 'var(--d-surface-raised)';
  }
  if (key === 'primary') return 'var(--d-primary)';
  if (key === 'secondary') return 'var(--d-secondary)';
  if (key === 'accent') return 'var(--d-accent)';
  if (key === 'success') return 'var(--d-success,#22c55e)';
  if (key === 'warning') return 'var(--d-warning,#f59e0b)';
  if (key === 'danger' || key === 'error' || key === 'destructive') return 'var(--d-error,#ef4444)';
  if (key === 'info') return 'var(--d-info,#3b82f6)';
  if (key === 'green') return '#22c55e';
  if (key === 'red') return '#ef4444';
  if (key === 'amber' || key === 'yellow') return '#f59e0b';
  if (key === 'blue') return '#3b82f6';
  if (key === 'gray-950') return '#030712';
  if (key === 'gray' || key === 'slate') return '#64748b';
  if (key === 'border' || key === 'input') return 'var(--d-border)';
  if (key === 'text' || key === 'foreground' || key === 'fg') return 'var(--d-text)';
  if (key === 'muted') {
    if (prop === 'color') return 'var(--d-text-muted,var(--d-muted))';
    if (prop === 'border-color') return 'var(--d-muted,var(--d-border))';
    return 'var(--d-muted,var(--d-surface))';
  }
  return null;
}

function semanticColorDecl(
  prop: 'background' | 'color' | 'border-color',
  rawToken: string,
): string | null {
  const alphaMatch = rawToken.match(/^(.+)\/(\d+)$/);
  const token = alphaMatch ? alphaMatch[1] : rawToken;
  const value = semanticColorValue(token, prop);
  if (!value) return null;

  if (alphaMatch) {
    const alpha = Number(alphaMatch[2]);
    if (!Number.isFinite(alpha) || alpha < 0 || alpha > 100) return null;
    return `${prop}:color-mix(in srgb,${value} ${alpha}%,transparent)`;
  }

  return `${prop}:${value}`;
}

function compactSemanticColorToken(name: string, prefix: string): string | null {
  if (!name.startsWith(prefix) || name.length === prefix.length) return null;
  const token = name.slice(prefix.length);
  const slashIndex = token.indexOf('/');

  if (slashIndex !== -1) {
    if (slashIndex === 0 || slashIndex === token.length - 1) return null;
    if (token.indexOf('/', slashIndex + 1) !== -1) return null;
    if (!isCompactColorName(token.slice(0, slashIndex))) return null;
    if (!isAsciiDigitString(token.slice(slashIndex + 1))) return null;
    return token;
  }

  return isCompactColorName(token) ? token : null;
}

function isCompactColorName(value: string): boolean {
  if (!value) return false;
  for (const char of value) {
    const codePoint = char.charCodeAt(0);
    const isAllowed =
      (codePoint >= 48 && codePoint <= 57) ||
      (codePoint >= 65 && codePoint <= 90) ||
      (codePoint >= 97 && codePoint <= 122) ||
      char === '-';
    if (!isAllowed) return false;
  }
  return true;
}

function isAsciiDigitString(value: string): boolean {
  if (!value) return false;
  for (const char of value) {
    const codePoint = char.charCodeAt(0);
    if (codePoint < 48 || codePoint > 57) return false;
  }
  return true;
}

function resolveTailwindishDecl(name: string): string | null {
  if (TAILWIND_DIRECT[name]) return TAILWIND_DIRECT[name];

  const arbitraryMatch = name.match(/^([a-z]+(?:-[a-z]+)*)-\[([^\]]+)\]$/);
  if (arbitraryMatch) {
    const [, prefix, rawValue] = arbitraryMatch;
    const prop = TAILWIND_ARBITRARY_PROPS[prefix];
    if (!prop) return null;
    const value = sanitizeTailwindValue(rawValue);
    return value ? `${prop}:${value}` : null;
  }

  const compactArbitraryMatch = name.match(/^([a-z]+(?:-[a-z]+)?)\[([^\]]+)\]$/);
  if (compactArbitraryMatch) {
    const [, prefix, rawValue] = compactArbitraryMatch;
    if (prefix === 'scale') {
      const value = sanitizeTailwindValue(rawValue);
      return value ? `transform:scale(${value})` : null;
    }
    const prop = TAILWIND_ARBITRARY_PROPS[prefix];
    if (!prop) return null;
    const value = sanitizeTailwindValue(rawValue);
    return value ? `${prop}:${value}` : null;
  }

  const dimensionMatch = name.match(/^(w|h|min-w|min-h|max-w|max-h)-(.+)$/);
  if (dimensionMatch) {
    const [, prop, token] = dimensionMatch;
    const cssProp = {
      w: 'width',
      h: 'height',
      'min-w': 'min-width',
      'min-h': 'min-height',
      'max-w': 'max-width',
      'max-h': 'max-height',
    }[prop];
    const value = dimensionValue(prop, token);
    if (cssProp && value) return `${cssProp}:${value}`;
  }

  const spacingMatch = name.match(
    /^(-?)(gap-x|gap-y|gap|px|py|pt|pr|pb|pl|p|mx|my|mt|mr|mb|ml|m|top|right|bottom|left|inset)-(\d+(?:\.\d+)?|px)$/,
  );
  if (spacingMatch) {
    const [, negative, prefix, token] = spacingMatch;
    const prop = TAILWIND_SPACING_PROPS[prefix];
    const value = spacingValue(token);
    if (prop && value) {
      const canBeNegative = prop.startsWith('margin') || ['top', 'right', 'bottom', 'left'].includes(prop);
      if (negative && !canBeNegative) return null;
      return `${prop}:${negative ? '-' : ''}${value}`;
    }
  }

  const gridColsMatch = name.match(/^grid-cols-(\d+)$/);
  if (gridColsMatch) {
    return `grid-template-columns:repeat(${gridColsMatch[1]},minmax(0,1fr))`;
  }

  if (name === 'grid-cols-auto-fill') {
    return 'grid-template-columns:repeat(auto-fill,minmax(16rem,1fr))';
  }

  if (name === 'grid-cols-auto') {
    return 'grid-template-columns:repeat(auto-fit,minmax(0,1fr))';
  }

  const gridRowsMatch = name.match(/^grid-rows-(\d+)$/);
  if (gridRowsMatch) {
    return `grid-template-rows:repeat(${gridRowsMatch[1]},minmax(0,1fr))`;
  }

  const colSpanMatch = name.match(/^col-span-(\d+|full)$/);
  if (colSpanMatch) {
    const span = colSpanMatch[1];
    return span === 'full' ? 'grid-column:1/-1' : `grid-column:span ${span}/span ${span}`;
  }

  const rowSpanMatch = name.match(/^row-span-(\d+|full)$/);
  if (rowSpanMatch) {
    const span = rowSpanMatch[1];
    return span === 'full' ? 'grid-row:1/-1' : `grid-row:span ${span}/span ${span}`;
  }

  const columnsMatch = name.match(/^(?:cols|columns)(\d+)$/);
  if (columnsMatch) return `columns:${columnsMatch[1]}`;

  const textMatch = name.match(/^text-(.+)$/);
  if (textMatch) {
    const token = textMatch[1];
    if (TEXT_SCALE[token]) return TEXT_SCALE[token];
    return semanticColorDecl('color', token);
  }

  const bgMatch = name.match(/^bg-(.+)$/);
  if (bgMatch) return semanticColorDecl('background', bgMatch[1]);

  const borderColorMatch = name.match(/^border-(.+)$/);
  if (borderColorMatch) {
    const decl = semanticColorDecl('border-color', borderColorMatch[1]);
    if (decl) return decl;
  }

  const compactBorderColor = compactSemanticColorToken(name, 'border');
  if (compactBorderColor) {
    const decl = semanticColorDecl('border-color', compactBorderColor);
    if (decl) return decl;
  }

  const compactFg = compactSemanticColorToken(name, 'fg');
  if (compactFg) return semanticColorDecl('color', compactFg);

  const compactBg = compactSemanticColorToken(name, 'bg');
  if (compactBg) return semanticColorDecl('background', compactBg);

  const borderSideWidthMatch = name.match(/^border-([trbl])-(\d+)$/);
  if (borderSideWidthMatch) {
    const side = { t: 'top', r: 'right', b: 'bottom', l: 'left' }[borderSideWidthMatch[1]];
    return `border-${side}:${borderSideWidthMatch[2]}px solid var(--d-border)`;
  }

  const roundedSideMatch = name.match(/^rounded-([rltb])-(sm|md|lg|xl|2xl|3xl|full)$/);
  if (roundedSideMatch) {
    const [, side, size] = roundedSideMatch;
    const value = {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px',
    }[size];
    if (!value) return null;
    if (side === 'r') return `border-top-right-radius:${value};border-bottom-right-radius:${value}`;
    if (side === 'l') return `border-top-left-radius:${value};border-bottom-left-radius:${value}`;
    if (side === 't') return `border-top-left-radius:${value};border-top-right-radius:${value}`;
    if (side === 'b') return `border-bottom-left-radius:${value};border-bottom-right-radius:${value}`;
  }

  const fontMatch = name.match(/^font-(.+)$/);
  if (fontMatch && FONT_WEIGHTS[fontMatch[1]]) return `font-weight:${FONT_WEIGHTS[fontMatch[1]]}`;

  const leadingMatch = name.match(/^leading-(.+)$/);
  if (leadingMatch && LINE_HEIGHTS[leadingMatch[1]]) return `line-height:${LINE_HEIGHTS[leadingMatch[1]]}`;

  const trackingMatch = name.match(/^tracking-(.+)$/);
  if (trackingMatch && LETTER_SPACING[trackingMatch[1]]) {
    return `letter-spacing:${LETTER_SPACING[trackingMatch[1]]}`;
  }

  const opacityMatch = name.match(/^opacity-(\d+)$/);
  if (opacityMatch) {
    const n = Number(opacityMatch[1]);
    if (n >= 0 && n <= 100) return `opacity:${n / 100}`;
  }

  const zMatch = name.match(/^z-(\d+|auto)$/);
  if (zMatch) return zMatch[1] === 'auto' ? 'z-index:auto' : `z-index:${zMatch[1]}`;

  const compactZMatch = name.match(/^z(\d+)$/);
  if (compactZMatch) return `z-index:${compactZMatch[1]}`;

  const perspectiveMatch = name.match(/^perspective-(\d+)$/);
  if (perspectiveMatch) return `perspective:${perspectiveMatch[1]}px`;

  const negativeSpaceXMatch = name.match(/^-space-x-(\d+(?:\.\d+)?)$/);
  if (negativeSpaceXMatch) {
    const value = spacingValue(negativeSpaceXMatch[1]);
    if (value) return `margin-left:-${value}`;
  }

  return null;
}

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
  const tailwindish = resolveTailwindishDecl(name);
  if (tailwindish) return tailwindish;

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
