import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { navigate } from 'decantr/router';
import { Breadcrumb } from 'decantr/components';
import { ComponentDetail, ComponentGroupView, loadComponentItems } from '../../../src/explorer/components.js';
import { wbPath } from '../path-prefix.js';

const { div, h2, h3, p } = tags;

const nav = (path) => navigate(wbPath(path));

export function ComponentsIndex() {
  const container = div({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, 'Components'),
      p({ class: css('_body _fgmutedfg') }, 'UI component library. Click a group to explore.')
    )
  );

  loadComponentItems().then(groups => {
    container.appendChild(div({ class: '_grid _gcaf280 _gap4' },
      ...groups.map(group =>
        div({
          class: '_surface1 _r2 _p4 _b1 _bcborder _flex _col _gap2',
          onclick: () => navigate(wbPath(`/components/${group.id}`))
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
      { label: 'Components', onclick: () => navigate(wbPath('/components')) },
      { label: group }
    ]}),
    ComponentGroupView(group, nav)
  );
}

export function ComponentDetailPage({ group, name }) {
  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: [
      { label: 'Components', onclick: () => navigate(wbPath('/components')) },
      { label: group, onclick: () => navigate(wbPath(`/components/${group}`)) },
      { label: name }
    ]}),
    ComponentDetail(name, nav, group)
  );
}
