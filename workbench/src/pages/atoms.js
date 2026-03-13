import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { navigate } from 'decantr/router';
import { Breadcrumb } from 'decantr/components';
import { AtomsExplorer, loadAtomItems } from '../explorer/atoms.js';

const { div, h2, h3, p } = tags;

export function AtomsIndex() {
  const container = div({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, 'Atoms'),
      p({ class: css('_body _fgmutedfg') }, '1000+ atomic CSS utility classes. Each prefixed with _ for namespace safety.')
    )
  );

  loadAtomItems().then(items => {
    container.appendChild(div({ class: 'de-card-grid' },
      ...items.map(item =>
        div({
          class: 'de-card-item',
          onclick: () => navigate(`/atoms/${item.id}`)
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
      { label: 'Atoms', onclick: () => navigate('/atoms') },
      { label: category }
    ]}),
    AtomsExplorer(category)
  );
}
