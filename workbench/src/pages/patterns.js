import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { navigate } from 'decantr/router';
import { Breadcrumb } from 'decantr/components';
import { PatternDetail, PatternListView } from '../explorer/patterns.js';

const { div, h2, p } = tags;

const nav = (path) => navigate(path);

export function PatternsIndex() {
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, 'Patterns'),
      p({ class: css('_body _fgmutedfg') }, 'Composable UI compositions from the registry.')
    ),
    PatternListView(nav)
  );
}

export function PatternDetailPage({ id }) {
  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: [
      { label: 'Patterns', onclick: () => navigate('/patterns') },
      { label: id }
    ]}),
    PatternDetail(id, nav)
  );
}
