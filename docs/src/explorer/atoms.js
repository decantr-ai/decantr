import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { navigate } from 'decantr/router';
import { Breadcrumb } from 'decantr/components';
import { AtomsExplorer, loadAtomItems } from '../../../src/explorer/atoms.js';
import { wbPath } from './path-prefix.js';

const { div, h2, h3, p } = tags;

export function AtomsIndex() {
  const container = div({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, 'Atoms'),
      p({ class: css('_body _fgmutedfg') }, '1000+ atomic CSS utility classes. Each prefixed with _ for namespace safety.')
    )
  );

  loadAtomItems().then(items => {
    container.appendChild(div({ class: '_grid _gcaf280 _gap4' },
      ...items.map(item =>
        div({
          class: '_surface1 _r2 _p4 _b1 _bcborder _flex _col _gap2',
          onclick: () => navigate(wbPath(`/atoms/${item.id}`))
        },
          h3({ class: css('_heading6') }, item.label)
        )
      )
    ));
  });

  return container;
}

export function AtomPage({ category }) {
  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: [
      { label: 'Atoms', onclick: () => navigate(wbPath('/atoms')) },
      { label: category }
    ]}),
    AtomsExplorer(category)
  );
}
