import { h } from '@decantr/ui/runtime';
import { createSignal, createEffect } from '@decantr/ui/state';
import { css } from '@decantr/css';
import { navigate } from '@decantr/ui/router';
import { getStory } from '@decantr/ui-catalog';
import { renderVariants, renderUsage } from '@decantr/ui-catalog/renderer';
import { Badge } from '@decantr/ui/components';

/**
 * Build playground controls and live preview for a story.
 * @param {Object} story
 * @returns {HTMLElement}
 */
function buildPlayground(story) {
  const pg = story.playground;
  const defaults = pg.defaults || {};
  const controls = pg.controls || [];

  // Create reactive prop state from defaults
  const propSignals = {};
  for (const ctrl of controls) {
    propSignals[ctrl.name] = createSignal(
      defaults[ctrl.name] !== undefined ? defaults[ctrl.name] : (ctrl.type === 'boolean' ? false : '')
    );
  }

  const wrapper = h('div', { class: css('_flex _col _gap4') });

  // Controls panel
  const controlsPanel = h('div', {
    class: css('_grid _gap3 _p4 _rounded _border _border-subtle _bg-surface'),
    style: 'grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))',
  });

  for (const ctrl of controls) {
    const [getter, setter] = propSignals[ctrl.name];
    const fieldWrap = h('div', { class: css('_flex _col _gap1') });
    fieldWrap.appendChild(h('label', { class: css('_text-xs _font-medium _text-muted') }, ctrl.name));

    if (ctrl.type === 'select') {
      const select = h('select', {
        class: css('_px2 _py1 _rounded _border _border-subtle _bg-surface _text-sm'),
        onchange: (e) => setter(e.target.value),
      });
      for (const opt of ctrl.options || []) {
        const option = h('option', { value: opt }, opt);
        if (getter() === opt) option.selected = true;
        select.appendChild(option);
      }
      fieldWrap.appendChild(select);
    } else if (ctrl.type === 'boolean') {
      const checkbox = h('input', {
        type: 'checkbox',
        checked: getter(),
        onchange: (e) => setter(e.target.checked),
      });
      fieldWrap.appendChild(checkbox);
    } else if (ctrl.type === 'number') {
      const numInput = h('input', {
        type: 'number',
        value: getter(),
        class: css('_px2 _py1 _rounded _border _border-subtle _bg-surface _text-sm'),
        oninput: (e) => setter(Number(e.target.value)),
      });
      fieldWrap.appendChild(numInput);
    } else if (ctrl.type === 'color') {
      const colorInput = h('input', {
        type: 'color',
        value: getter() || '#000000',
        oninput: (e) => setter(e.target.value),
      });
      fieldWrap.appendChild(colorInput);
    } else {
      // text
      const textInput = h('input', {
        type: 'text',
        value: getter(),
        class: css('_px2 _py1 _rounded _border _border-subtle _bg-surface _text-sm'),
        oninput: (e) => setter(e.target.value),
      });
      fieldWrap.appendChild(textInput);
    }

    controlsPanel.appendChild(fieldWrap);
  }

  wrapper.appendChild(controlsPanel);

  // Live preview
  const previewContainer = h('div', {
    class: css('_p6 _rounded _border _border-subtle _flex _items-center _justify-center _min-h-24'),
  });

  createEffect(() => {
    const props = {};
    for (const ctrl of controls) {
      const [getter] = propSignals[ctrl.name];
      const val = getter();
      // Only include non-empty values
      if (val !== '' && val !== false && val !== 'default') {
        props[ctrl.name] = val;
      }
    }
    previewContainer.innerHTML = '';
    try {
      const rendered = story.component(props);
      previewContainer.appendChild(rendered);
    } catch (e) {
      previewContainer.appendChild(
        h('p', { class: css('_text-sm _text-destructive') }, `Render error: ${e.message}`)
      );
    }
  });

  wrapper.appendChild(previewContainer);
  return wrapper;
}

export function ComponentDetail(params) {
  const slug = params.slug;

  const container = h('div', { class: css('_flex _col _gap8 _p6 _max-w-5xl _mx-auto') });

  const story = getStory(slug);

  if (!story) {
    // Not found state
    const notFound = h('div', { class: css('_flex _col _items-center _justify-center _gap4 _py16') });
    notFound.appendChild(h('h1', { class: css('_text-2xl _font-bold') }, 'Component not found'));
    notFound.appendChild(h('p', { class: css('_text-muted') }, `No component with slug "${slug}" exists in the catalog.`));
    const backBtn = h('button', {
      class: css('_px4 _py2 _rounded _bg-primary _text-on-primary _cursor-pointer _border-none _font-medium'),
      onclick: () => navigate('/components'),
    }, 'Back to Components');
    notFound.appendChild(backBtn);
    container.appendChild(notFound);
    return container;
  }

  // Back link
  const backLink = h('button', {
    class: css('_text-sm _text-muted _cursor-pointer _border-none _bg-transparent _hover:text-default _transition'),
    onclick: () => navigate('/components'),
  }, '\u2190 All Components');
  container.appendChild(backLink);

  // Header
  const header = h('div', { class: css('_flex _col _gap2') });
  header.appendChild(h('h1', { class: css('_text-3xl _font-bold') }, story.title));
  header.appendChild(h('p', { class: css('_text-muted _text-lg') }, story.description));

  const catLabel = story.category.replace('components/', '').replace(/(^|\-)(\w)/g, (_, sep, c) => (sep ? ' ' : '') + c.toUpperCase());
  header.appendChild(Badge({ variant: 'outline' }, catLabel));
  container.appendChild(header);

  // Variants section
  const variantsSection = h('section', { class: css('_flex _col _gap3') });
  variantsSection.appendChild(h('h2', { class: css('_text-xl _font-semibold') }, 'Variants'));
  variantsSection.appendChild(renderVariants(story));
  container.appendChild(variantsSection);

  // Usage section
  const usageEl = renderUsage(story);
  if (usageEl) {
    const usageSection = h('section', { class: css('_flex _col _gap3') });
    usageSection.appendChild(h('h2', { class: css('_text-xl _font-semibold') }, 'Usage'));
    usageSection.appendChild(usageEl);
    container.appendChild(usageSection);
  }

  // Playground section
  if (story.playground) {
    const playgroundSection = h('section', { class: css('_flex _col _gap3') });
    playgroundSection.appendChild(h('h2', { class: css('_text-xl _font-semibold') }, 'Playground'));
    playgroundSection.appendChild(buildPlayground(story));
    container.appendChild(playgroundSection);
  }

  return container;
}
