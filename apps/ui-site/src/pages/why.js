import { h } from '@decantr/ui/runtime';

const PAGE = 'max-width: 760px; margin: 0 auto; padding: 48px 24px';
const H1 = 'font-size: 32px; font-weight: 700; margin: 0 0 8px';
const SUB = 'font-size: 14px; color: var(--d-muted-fg, rgba(255,255,255,0.5)); margin: 0 0 40px';
const H2 = 'font-size: 22px; font-weight: 600; margin: 40px 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--d-border, rgba(255,255,255,0.1))';
const CARD = 'padding: 20px; border-radius: var(--d-radius-md, 8px); background: var(--d-surface-1, rgba(255,255,255,0.04)); border: 1px solid var(--d-border, rgba(255,255,255,0.08)); margin-bottom: 16px';
const CARD_TITLE = 'font-size: 16px; font-weight: 600; margin: 0 0 8px; color: var(--d-fg, #fff)';
const CARD_TEXT = 'font-size: 14px; color: var(--d-muted-fg, rgba(255,255,255,0.6)); margin: 0; line-height: 1.6';
const BULLET = 'font-size: 14px; color: var(--d-muted-fg, rgba(255,255,255,0.6)); margin: 4px 0; line-height: 1.6; padding-left: 16px';
const HIGHLIGHT = 'background: var(--d-accent, #7c3aed); color: white; padding: 24px; border-radius: var(--d-radius-md, 8px); margin: 40px 0';
const HIGHLIGHT_TITLE = 'font-size: 20px; font-weight: 700; margin: 0 0 12px';
const HIGHLIGHT_TEXT = 'font-size: 14px; line-height: 1.7; margin: 0; opacity: 0.9';
const STAT_ROW = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin: 32px 0';
const STAT = 'text-align: center; padding: 20px; border-radius: var(--d-radius-md, 8px); background: var(--d-surface-1, rgba(255,255,255,0.04)); border: 1px solid var(--d-border, rgba(255,255,255,0.08))';
const STAT_NUM = 'font-size: 28px; font-weight: 700; margin: 0 0 4px; color: var(--d-accent, #7c3aed)';
const STAT_LABEL = 'font-size: 12px; color: var(--d-muted-fg, rgba(255,255,255,0.5)); margin: 0';

function comparisonCard(title, points) {
  const card = h('div', { style: CARD });
  card.appendChild(h('h3', { style: CARD_TITLE }, title));
  for (const point of points) {
    card.appendChild(h('p', { style: BULLET }, '\u2022 ' + point));
  }
  return card;
}

function stat(value, label) {
  const el = h('div', { style: STAT });
  el.appendChild(h('div', { style: STAT_NUM }, value));
  el.appendChild(h('div', { style: STAT_LABEL }, label));
  return el;
}

export function Why() {
  const container = h('div', { style: PAGE });

  container.appendChild(h('h1', { style: H1 }, 'Why Decantr UI?'));
  container.appendChild(h('p', { style: SUB }, 'A modern UI framework designed for the age of AI-assisted development.'));

  // Stats
  const stats = h('div', { style: STAT_ROW });
  stats.appendChild(stat('0', 'Virtual DOM overhead'));
  stats.appendChild(stat('~4kb', 'Core runtime gzipped'));
  stats.appendChild(stat('100+', 'Components'));
  stats.appendChild(stat('Signal', 'Reactivity model'));
  container.appendChild(stats);

  // vs React
  container.appendChild(h('h2', { style: H2 }, 'vs React'));
  container.appendChild(comparisonCard('No Virtual DOM', [
    'Decantr uses direct DOM manipulation with signal-based reactivity. No reconciliation pass, no fiber tree, no diffing overhead.',
    'Updates are surgical: only the exact DOM nodes that depend on a changed signal are re-rendered.',
  ]));
  container.appendChild(comparisonCard('No JSX Required', [
    'The h() function works with plain JavaScript. No babel plugin, no TypeScript JSX configuration, no build step required.',
    'Components are just functions that return DOM nodes. No class components, no hooks rules to memorize.',
  ]));
  container.appendChild(comparisonCard('Signals > Hooks', [
    'Signals are values, not rules. No stale closure bugs, no dependency arrays, no useCallback/useMemo dance.',
    'createSignal() returns a getter and setter. createEffect() runs when its dependencies change. That is the entire API.',
  ]));
  container.appendChild(comparisonCard('Smaller Bundle', [
    'The core runtime is a fraction of React + ReactDOM. Tree-shaking is automatic because every component is a standalone function.',
    'No context providers, no suspense boundaries, no concurrent mode complexity.',
  ]));

  // vs Svelte
  container.appendChild(h('h2', { style: H2 }, 'vs Svelte'));
  container.appendChild(comparisonCard('No Compiler Lock-in', [
    'Decantr works as plain JavaScript. The Decantr compiler is optional and adds optimizations, but is never required.',
    'Your components are portable JS functions. No .svelte file format, no compiler-specific syntax to learn.',
  ]));
  container.appendChild(comparisonCard('Richer Component Library', [
    '100+ pre-built components with theme awareness, accessibility baked in, and design token integration.',
    'From basic inputs to data tables, date pickers, charts, and full layout shells — all from one coherent system.',
  ]));

  // vs Tailwind
  container.appendChild(h('h2', { style: H2 }, 'vs Tailwind CSS'));
  container.appendChild(comparisonCard('Theme-Aware Tokens', [
    'Decantr CSS is not just utility classes. Every atom is aware of the active theme, mode (light/dark), and shape preset.',
    'Switch from dark to light mode and every component adapts. Change the shape preset and all border radii update. No class swapping needed.',
  ]));
  container.appendChild(comparisonCard('Design Intelligence', [
    'The css() function understands design tokens, not just CSS properties. It enforces consistency at the API level.',
    'Atoms like _bg-surface and _text-muted resolve to theme-specific values, not hardcoded colors.',
  ]));

  // Philosophy
  const highlight = h('div', { style: HIGHLIGHT });
  highlight.appendChild(h('h2', { style: HIGHLIGHT_TITLE }, 'Built for AI-First Development'));
  highlight.appendChild(h('p', { style: HIGHLIGHT_TEXT },
    'Decantr\'s design intelligence layer means AI-generated code is consistent by default. ' +
    'When an AI assistant uses Decantr components and atoms, the output automatically respects your design system: ' +
    'correct spacing, proper color tokens, accessible markup, and theme-aware styling. ' +
    'No manual cleanup. No design drift. Every AI-generated view looks like it was hand-crafted by your design team.'
  ));
  container.appendChild(highlight);

  return container;
}
