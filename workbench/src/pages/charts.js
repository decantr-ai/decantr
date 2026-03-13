import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { navigate } from 'decantr/router';
import { Breadcrumb } from 'decantr/components';
import { ChartDetail, ChartGroupView, loadChartItems } from '../explorer/charts.js';

const { div, h2, h3, p } = tags;

const nav = (path) => navigate(path);

export function ChartsIndex() {
  const container = div({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, 'Charts'),
      p({ class: css('_body _fgmutedfg') }, '25 chart types across 5 categories. Click a group to explore.')
    )
  );

  loadChartItems().then(groups => {
    container.appendChild(div({ class: 'de-card-grid' },
      ...groups.map(group =>
        div({
          class: 'de-card-item',
          onclick: () => navigate(`/charts/${group.id}`)
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
      { label: 'Charts', onclick: () => navigate('/charts') },
      { label: group }
    ]}),
    ChartGroupView(group, nav)
  );
}

export function ChartDetailPage({ group, name }) {
  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: [
      { label: 'Charts', onclick: () => navigate('/charts') },
      { label: group, onclick: () => navigate(`/charts/${group}`) },
      { label: name }
    ]}),
    ChartDetail(name, nav)
  );
}
