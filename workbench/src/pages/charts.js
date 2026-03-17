import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { navigate } from 'decantr/router';
import { Breadcrumb } from 'decantr/components';
import { ChartDetail, ChartGroupView, loadChartItems } from 'decantr/explorer/charts.js';
import { wbPath } from '../path-prefix.js';

const { div, h2, h3, p } = tags;

const nav = (path) => navigate(wbPath(path));

export function ChartsIndex() {
  const container = div({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, 'Charts'),
      p({ class: css('_body _fgmutedfg') }, '25 chart types across 5 categories. Click a group to explore.')
    )
  );

  loadChartItems().then(groups => {
    container.appendChild(div({ class: '_grid _gcaf280 _gap4' },
      ...groups.map(group =>
        div({
          class: '_surface1 _r2 _p4 _b1 _bcborder _flex _col _gap2',
          onclick: () => navigate(wbPath(`/charts/${group.id}`))
        },
          h3({ class: css('_heading6') }, group.label),
          p({ class: css('_caption _fgmutedfg') }, `${group.children.length} chart types`)
        )
      )
    ));
  });

  return container;
}

export function ChartGroupPage({ group }) {
  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: [
      { label: 'Charts', onclick: () => navigate(wbPath('/charts')) },
      { label: group }
    ]}),
    ChartGroupView(group, nav)
  );
}

export function ChartDetailPage({ group, name }) {
  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: [
      { label: 'Charts', onclick: () => navigate(wbPath('/charts')) },
      { label: group, onclick: () => navigate(wbPath(`/charts/${group}`)) },
      { label: name }
    ]}),
    ChartDetail(name, nav)
  );
}
