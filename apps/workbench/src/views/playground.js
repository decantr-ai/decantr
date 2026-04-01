import { h } from '@decantr/ui/runtime';
import { css } from '@decantr/css';
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
      { class: css('_p-6'), style: 'opacity: 0.5' },
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
    class: css('_flex-1 _flex _items-center _justify-center _overflow-auto _rounded-md _p-6'),
    style: 'min-height: 120px; background: rgba(0,0,0,0.15)',
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
      class: css('_border-l _border-subtle _overflow-auto _flex _col'),
      style: 'width: 260px; min-width: 260px',
    },
    PropsPanel({ playground, currentProps, onChange }),
    StatePanel({ currentProps }),
  );

  return h(
    'div',
    { class: css('_flex _h-full _overflow-hidden') },
    // Main area: preview + code
    h(
      'div',
      { class: css('_flex-1 _p-6 _flex _col _gap-4 _overflow-auto') },
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
