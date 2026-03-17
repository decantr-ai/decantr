import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { navigate } from 'decantr/router';
import { Breadcrumb } from 'decantr/components';
import { IconDetail, IconGroupView, loadIconItems } from 'decantr/explorer/icons.js';
import { wbPath } from './path-prefix.js';

const { div, h2, h3, p } = tags;

const nav = (path) => navigate(wbPath(path));

export function IconsIndex() {
  const container = div({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, 'Icons'),
      p({ class: css('_body _fgmutedfg') }, '195 essential icons across 11 categories. Click a group to explore.')
    )
  );

  loadIconItems().then(groups => {
    container.appendChild(div({ class: '_grid _gcaf280 _gap4' },
      ...groups.map(group =>
        div({
          class: '_surface1 _r2 _p4 _b1 _bcborder _flex _col _gap2',
          onclick: () => navigate(wbPath(`/icons/${group.id}`))
        },
          h3({ class: css('_heading6') }, group.label)
        )
      )
    ));
  });

  return container;
}

export function IconGroupPage({ group }) {
  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: [
      { label: 'Icons', onclick: () => navigate(wbPath('/icons')) },
      { label: group }
    ]}),
    IconGroupView(group, nav)
  );
}

export function IconDetailPage({ group, name }) {
  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: [
      { label: 'Icons', onclick: () => navigate(wbPath('/icons')) },
      { label: group, onclick: () => navigate(wbPath(`/icons/${group}`)) },
      { label: name }
    ]}),
    IconDetail(name)
  );
}
