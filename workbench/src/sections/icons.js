import { createSignal, createEffect } from 'decantr/state';
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon, Input } from 'decantr/components';
import { getIconNames } from 'decantr/icons';
import { SectionHeader, DemoGroup, DemoRow } from './_shared.js';

const { div, section, h3, span, p, code, pre } = tags;

const SIZES = ['0.75em', '1em', '1.25em', '1.5em', '2em'];

function IconGrid(names, label) {
  return div({},
    h3({ class: css('_textbase _fwtitle _lhsnug') }, label),
    div({ class: css('_flex _wrap _gap3 _mt3') },
      ...names.map(name =>
        div({
          class: css('_flex _col _aic _gap1 _p2'),
          style: 'min-width:80px',
          title: name
        },
          icon(name, { size: '1.5em' }),
          span({ class: css('_textsm _fg4 _tc'), style: 'word-break:break-all' }, name)
        )
      )
    )
  );
}

export function IconSection() {
  const [query, setQuery] = createSignal('');
  const allNames = getIconNames().sort();

  const container = section({ id: 'icons', class: css('_flex _col _gap10') },
    SectionHeader('Icons', `${allNames.length} essential icons. Add more via registerIcon() or tools/icons.js.`),

    DemoGroup('Sizes', 'Icon scaling from 0.75em to 2em.',
      DemoRow(
        ...SIZES.map(size =>
          div({ class: css('_flex _col _aic _gap1') },
            icon('star', { size }),
            span({ class: css('_textsm _fg4') }, size)
          )
        )
      )
    ),

    // Search
    div({},
      Input({
        placeholder: 'Filter icons...',
        oninput: e => setQuery(e.target.value.toLowerCase())
      })
    )
  );

  const gridArea = div();
  container.appendChild(gridArea);

  // Custom icon guide
  container.appendChild(
    DemoGroup('Adding Custom Icons', 'Register SVG icons from a directory or individually.',
      pre({ class: css('_textsm _fg3'), style: 'white-space:pre-wrap' },
        `// Import SVG directory as JS module:\n` +
        `// node tools/icons.js ./my-svgs custom.js\n\n` +
        `// Then register in your app:\n` +
        `import { ICONS } from './icons/custom.js';\n` +
        `import { registerIcons } from 'decantr/icons';\n` +
        `registerIcons(ICONS);\n\n` +
        `// Or register one at a time:\n` +
        `import { registerIcon } from 'decantr/components';\n` +
        `registerIcon('my-icon', '<path d="M12 2L2 22h20z"/>');`
      )
    )
  );

  function renderGrid() {
    gridArea.innerHTML = '';
    const q = query();
    const filtered = q ? allNames.filter(n => n.includes(q)) : allNames;
    if (filtered.length === 0) {
      gridArea.appendChild(p({ class: css('_fg4') }, `No icons matching "${q}"`));
    } else {
      gridArea.appendChild(IconGrid(filtered, `Icons (${filtered.length})`));
    }
  }

  createEffect(renderGrid);

  return container;
}
