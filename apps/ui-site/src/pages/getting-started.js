import { h } from '@decantr/ui/runtime';

const PAGE = 'max-width: 760px; margin: 0 auto; padding: 48px 24px';
const H1 = 'font-size: 32px; font-weight: 700; margin: 0 0 8px';
const SUB = 'font-size: 14px; color: var(--d-muted-fg, rgba(255,255,255,0.5)); margin: 0 0 40px';
const STEP_NUM = 'display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: var(--d-accent, #7c3aed); color: white; font-size: 13px; font-weight: 700; flex-shrink: 0';
const STEP_HEAD = 'display: flex; align-items: center; gap: 12px; margin-bottom: 8px';
const STEP_TITLE = 'font-size: 20px; font-weight: 600; margin: 0';
const STEP_DESC = 'font-size: 14px; color: var(--d-muted-fg, rgba(255,255,255,0.6)); margin: 0 0 12px; line-height: 1.6';
const CODE = 'background: var(--d-surface-1, rgba(255,255,255,0.04)); border-radius: var(--d-radius-md, 8px); padding: 16px 20px; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 13px; line-height: 1.7; color: var(--d-fg, #fff); overflow-x: auto; border: 1px solid var(--d-border, rgba(255,255,255,0.08)); white-space: pre; margin: 0';
const STEP_WRAP = 'margin-bottom: 36px; padding-bottom: 36px; border-bottom: 1px solid var(--d-border, rgba(255,255,255,0.06))';

function step(num, title, description, code) {
  const wrap = h('div', { style: STEP_WRAP });

  const head = h('div', { style: STEP_HEAD });
  head.appendChild(h('span', { style: STEP_NUM }, String(num)));
  head.appendChild(h('h2', { style: STEP_TITLE }, title));
  wrap.appendChild(head);

  wrap.appendChild(h('p', { style: STEP_DESC }, description));
  wrap.appendChild(h('pre', { style: CODE }, code));

  return wrap;
}

export function GettingStarted() {
  const container = h('div', { style: PAGE });

  container.appendChild(h('h1', { style: H1 }, 'Getting Started'));
  container.appendChild(h('p', { style: SUB }, 'Build your first Decantr UI app in five steps.'));

  container.appendChild(step(
    1,
    'Install',
    'Add the core packages to your project.',
    `npm install @decantr/ui @decantr/css`
  ));

  container.appendChild(step(
    2,
    'Create your first component',
    'Import the runtime and render a button. No JSX or compiler required.',
    `import { h } from '@decantr/ui/runtime';
import { Button } from '@decantr/ui/components';

function HelloWorld() {
  return h('div', { style: 'padding: 24px' },
    Button({ variant: 'solid', onclick: () => alert('Hello!') }, 'Click me')
  );
}`
  ));

  container.appendChild(step(
    3,
    'Add reactivity',
    'Use signals for fine-grained reactivity. No virtual DOM diffing — only the nodes that depend on a signal update when it changes.',
    `import { h } from '@decantr/ui/runtime';
import { createSignal, createEffect } from '@decantr/ui/state';

function Counter() {
  const [getCount, setCount] = createSignal(0);

  const label = h('span', null, '0');
  createEffect(() => { label.textContent = String(getCount()); });

  return h('div', { style: 'display: flex; gap: 8px; align-items: center' },
    h('button', { onclick: () => setCount(getCount() + 1) }, '+'),
    label,
  );
}`
  ));

  container.appendChild(step(
    4,
    'Mount the app',
    'Use mount() to render your root component into a DOM node.',
    `import { mount } from '@decantr/ui/runtime';
import { App } from './app.js';

const root = document.getElementById('app');
mount(root, App);`
  ));

  container.appendChild(step(
    5,
    'Add a theme',
    'Apply a visual style, color mode, and shape preset. All components automatically adapt.',
    `import { setStyle, setMode, setShape } from '@decantr/ui/css';

setStyle('auradecantism');  // Visual personality
setMode('dark');             // 'light' | 'dark' | 'auto'
setShape('rounded');         // 'sharp' | 'rounded' | 'pill'`
  ));

  return container;
}
