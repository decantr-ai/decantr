import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { navigate } from 'decantr/router';
import { Breadcrumb } from 'decantr/components';
import { ComponentDetail, ComponentGroupView, loadComponentItems } from '../explorer/components.js';

const { div, h2, h3, p } = tags;

const nav = (path) => navigate(path);

export function ComponentsIndex() {
  const container = div({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, 'Components'),
      p({ class: css('_body _fgmutedfg') }, 'UI component library. Click a group to explore.')
    )
  );

  loadComponentItems().then(groups => {
    container.appendChild(div({ class: 'de-card-grid' },
      ...groups.map(group =>
        div({
          class: 'de-card-item',
          onclick: () => navigate(`/components/${group.id}`)
        },
          h3({ class: css('_heading6') }, group.label),
          p({ class: css('_caption _fgmutedfg') }, `${group.children.length} components`)
        )
      )
    ));
  });

  return container;
}

export function ComponentGroupPage({ group }) {
  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: [
      { label: 'Components', onclick: () => navigate('/components') },
      { label: group }
    ]}),
    ComponentGroupView(group, nav)
  );
}

export function ComponentDetailPage({ group, name }) {
  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: [
      { label: 'Components', onclick: () => navigate('/components') },
      { label: group, onclick: () => navigate(`/components/${group}`) },
      { label: name }
    ]}),
    ComponentDetail(name, nav, group)
  );
}
