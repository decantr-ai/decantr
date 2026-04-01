import { h } from '@decantr/ui/runtime';
import { createSignal, createEffect } from '@decantr/ui/state';
import { PropsPanel } from '../panels/props-panel.js';
import { StatePanel } from '../panels/state-panel.js';

/**
 * Playground view — live preview, code output, and prop editor.
 * @param {{ story: Object }} params
 */
export function PlaygroundView({ story }) {
  const playground = story.playground;

  if (!playground) {
    return h(
      'div',
      { style: 'padding: 24px; opacity: 0.5' },
      'No playground controls defined.',
    );
  }

  // Signal holding current prop values, seeded from defaults
  const [currentProps, setCurrentProps] = createSignal(
    Object.assign({}, playground.defaults || {}),
  );

  function onChange(key, value) {
    const next = Object.assign({}, currentProps());
    if (value === undefined || value === '') {
      delete next[key];
    } else {
      next[key] = value;
    }
    setCurrentProps(next);
  }

  // Live preview container
  const previewContainer = h('div', {
    style:
      'flex: 1; min-height: 120px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.15); border-radius: 6px; padding: 24px; overflow: auto',
  });

  createEffect(() => {
    const props = currentProps();
    previewContainer.innerHTML = '';
    try {
      const el = story.component(props);
      if (el instanceof Node) {
        previewContainer.appendChild(el);
      } else if (typeof el === 'string') {
        previewContainer.textContent = el;
      }
    } catch (err) {
      previewContainer.appendChild(
        h('pre', { style: 'color: #f87171; font-size: 12px' }, String(err)),
      );
    }
  });

  // Code output
  const codeBlock = h('pre', {
    style:
      'margin: 0; font-size: 12px; white-space: pre-wrap; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 4px; max-height: 200px; overflow: auto',
  });

  createEffect(() => {
    const props = currentProps();
    const title = story.title || 'Component';
    const entries = Object.entries(props);
    const propsStr = entries
      .map(([k, v]) => {
        if (typeof v === 'boolean') return v ? `  ${k}` : `  ${k}={false}`;
        if (typeof v === 'number') return `  ${k}={${v}}`;
        return `  ${k}="${v}"`;
      })
      .join('\n');
    const tag = entries.length > 0
      ? `<${title}\n${propsStr}\n/>`
      : `<${title} />`;
    codeBlock.textContent = `import { ${title} } from '@decantr/ui/components';\n\n${tag}`;
  });

  // Side panel with props + state
  const sidePanel = h(
    'div',
    {
      style:
        'width: 260px; min-width: 260px; border-left: 1px solid rgba(255,255,255,0.1); overflow: auto; display: flex; flex-direction: column',
    },
    PropsPanel({ playground, currentProps, onChange }),
    StatePanel({ currentProps }),
  );

  return h(
    'div',
    {
      style:
        'display: flex; height: 100%; overflow: hidden',
    },
    // Main area: preview + code
    h(
      'div',
      {
        style:
          'flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 16px; overflow: auto',
      },
      h('h2', { style: 'margin: 0 0 4px' }, story.title + ' — Playground'),
      previewContainer,
      h(
        'div',
        null,
        h('h3', { style: 'margin: 0 0 8px; font-size: 14px' }, 'Code'),
        codeBlock,
      ),
    ),
    // Side panel
    sidePanel,
  );
}
