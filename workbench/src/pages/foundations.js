import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { navigate } from 'decantr/router';
import { Breadcrumb } from 'decantr/components';
import { FoundationsExplorer, loadFoundationItems } from '../explorer/foundations.js';

const { div, h2, h3, p } = tags;

export function FoundationsIndex() {
  const container = div({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, 'Foundations'),
      p({ class: css('_body _fgmutedfg') }, 'Interactive API playgrounds for Decantr primitives.')
    )
  );

  loadFoundationItems().then(items => {
    container.appendChild(div({ class: 'de-card-grid' },
      ...items.map(item =>
        div({
          class: 'de-card-item',
          onclick: () => navigate(`/foundations/${item.id}`)
        },
          h3({ class: css('_heading6') }, item.label)
        )
      )
    ));
  });

  return container;
}

export function FoundationPage({ subsection }) {
  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: [
      { label: 'Foundations', onclick: () => navigate('/foundations') },
      { label: subsection }
    ]}),
    FoundationsExplorer(subsection)
  );
}
