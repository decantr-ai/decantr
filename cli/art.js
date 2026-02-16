const WINE = '\x1b[35m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';

const DECANTER = `
${WINE}       ╭─────╮
       │     │
       ╰──┬──╯
          │
       ╭──┴──╮
      ╱       ╲
     ╱         ╲
    │  ${RESET}${BOLD}decantr${RESET}${WINE}  │
    │           │
     ╲         ╱
      ╰───────╯${RESET}`;

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
  return DECANTER;
}

export function tagline() {
  return messages[Math.floor(Math.random() * messages.length)];
}

export function welcome(version) {
  return `${art()}

  ${BOLD}decantr${RESET} ${DIM}v${version}${RESET} ${DIM}— AI-first web framework${RESET}
  ${CYAN}${tagline()}${RESET}
`;
}

export function success(msg) {
  return `\x1b[32m✓${RESET} ${msg}`;
}

export function info(msg) {
  return `${CYAN}→${RESET} ${msg}`;
}

export function heading(msg) {
  return `\n  ${BOLD}${msg}${RESET}\n`;
}
