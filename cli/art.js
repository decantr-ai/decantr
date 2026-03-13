// Truecolor detection
const NO_COLOR = 'NO_COLOR' in process.env || !process.stdout.isTTY;
const TRUECOLOR = !NO_COLOR && (
  process.env.FORCE_COLOR === '3' ||
  process.env.COLORTERM === 'truecolor' ||
  process.env.COLORTERM === '24bit' ||
  /^(iTerm\.app|WezTerm|vscode)$/.test(process.env.TERM_PROGRAM || '')
);

// Basic ANSI fallbacks
const WINE = '\x1b[35m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';

// Auradecantism brand palette (RGB tuples from src/css/styles/auradecantism.js)
const P = {
  primary:  [254, 68, 116],   // #FE4474
  accent:   [10, 243, 235],   // #0AF3EB
  tertiary: [101, 0, 198],    // #6500C6
  success:  [0, 195, 136],    // #00C388
};

function fg(rgb) { return `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m`; }

function lerp(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function gradientText(str, from, to) {
  if (NO_COLOR) return str;
  if (!TRUECOLOR) return `${CYAN}${str}${RESET}`;
  const n = str.length;
  return str.split('').map((ch, i) =>
    `${fg(lerp(from, to, n > 1 ? i / (n - 1) : 0))}${ch}`
  ).join('') + RESET;
}

// Bottle geometry
const BOTTLE = [
  '       ╭─────╮',
  '       │     │',
  '       ╰──┬──╯',
  '          │',
  '       ╭──┴──╮',
  '      ╱       ╲',
  '     ╱         ╲',
  null, // "decantr" line — special handling
  '    │           │',
  '     ╲         ╱',
  '      ╰───────╯',
];

function buildBottle() {
  if (NO_COLOR) {
    return '\n' + BOTTLE.map((ln, i) =>
      i === 7 ? '    │  decantr  │' : ln
    ).join('\n');
  }
  const n = BOTTLE.length;
  return '\n' + BOTTLE.map((ln, i) => {
    const t = i / (n - 1);
    const c = TRUECOLOR ? fg(lerp(P.primary, P.tertiary, t)) : WINE;
    if (i === 7) {
      const nc = TRUECOLOR ? fg(P.accent) : CYAN;
      return `${c}    │  ${RESET}${BOLD}${nc}decantr${RESET}${c}  │${RESET}`;
    }
    return `${c}${ln}${RESET}`;
  }).join('\n');
}

const messages = [
  'Letting the code breathe...',
  'Decanting your project...',
  'Swirling the dependencies...',
  'Pouring the components...',
  'A fine vintage of JavaScript...',
  'Uncorking fresh signals...',
  'Aerating the DOM...',
  'Notes of CSS on the palate...',
  'Bottle-aged to perfection...',
  'Full-bodied, zero dependencies...'
];

export function art() {
  return buildBottle();
}

export function tagline() {
  return messages[Math.floor(Math.random() * messages.length)];
}

export function welcome(version) {
  const name = NO_COLOR ? 'decantr'
    : TRUECOLOR ? `${BOLD}${fg(P.primary)}decantr${RESET}`
    : `${BOLD}decantr${RESET}`;
  const tl = gradientText(tagline(), P.accent, P.primary);
  return `${art()}

  ${name} ${DIM}v${version}${RESET} ${DIM}— AI-first web framework${RESET}
  ${tl}
`;
}

export function success(msg) {
  if (NO_COLOR) return `✓ ${msg}`;
  const check = TRUECOLOR ? `${fg(P.success)}✓${RESET}` : `${GREEN}✓${RESET}`;
  return `${check} ${msg}`;
}

export function info(msg) {
  if (NO_COLOR) return `→ ${msg}`;
  const arrow = TRUECOLOR ? `${fg(P.accent)}→${RESET}` : `${CYAN}→${RESET}`;
  return `${arrow} ${msg}`;
}

export function heading(msg) {
  if (NO_COLOR) return `\n  ${msg}\n`;
  const styled = TRUECOLOR ? `${BOLD}${fg(P.primary)}${msg}${RESET}` : `${BOLD}${msg}${RESET}`;
  return `\n  ${styled}\n`;
}
