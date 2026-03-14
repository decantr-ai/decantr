import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { navigate } from 'decantr/router';
import { Breadcrumb } from 'decantr/components';
import { ThemeStudio, loadToolItems } from '../explorer/tools.js';

const { div, h2, h3, p } = tags;

export function ToolsIndex() {
  const container = div({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, 'Tools'),
      p({ class: css('_body _fgmutedfg') }, 'Interactive tools for creating and exploring Decantr styles and palettes.')
    )
  );

  loadToolItems().then(items => {
    container.appendChild(div({ class: 'de-card-grid' },
      ...items.map(item =>
        div({
          class: 'de-card-item',
          onclick: () => navigate(`/tools/${item.id}`)
        },
          h3({ class: css('_heading6') }, item.label)
        )
      )
    ));
  });

  return container;
}

export function ToolDetailPage({ tool }) {
  const content = tool === 'theme-studio'
    ? ThemeStudio()
    : div({}, p({}, `Unknown tool: ${tool}`));

  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: [
      { label: 'Tools', onclick: () => navigate('/tools') },
      { label: tool === 'theme-studio' ? 'Theme Studio' : tool }
    ]}),
    content
  );
}
