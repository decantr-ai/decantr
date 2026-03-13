import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { navigate } from 'decantr/router';
import { Breadcrumb } from 'decantr/components';
import { TokensExplorer, loadTokenItems } from '../explorer/tokens.js';

const { div, h2, h3, p } = tags;

export function TokensIndex() {
  const container = div({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, 'Tokens'),
      p({ class: css('_body _fgmutedfg') }, '170+ design tokens. Values update live when you switch styles or modes.')
    )
  );

  loadTokenItems().then(items => {
    container.appendChild(div({ class: 'de-card-grid' },
      ...items.map(item =>
        div({
          class: 'de-card-item',
          onclick: () => navigate(`/tokens/${item.id}`)
        },
          h3({ class: css('_heading6') }, item.label)
        )
      )
    ));
  });

  return container;
}

export function TokenPage({ group }) {
  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: [
      { label: 'Tokens', onclick: () => navigate('/tokens') },
      { label: group }
    ]}),
    TokensExplorer(group)
  );
}
