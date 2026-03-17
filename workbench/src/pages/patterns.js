import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { navigate } from 'decantr/router';
import { Breadcrumb } from 'decantr/components';
import { PatternDetail, PatternListView } from 'decantr/explorer/patterns.js';
import { wbPath } from '../path-prefix.js';

const { div, h2, p } = tags;

const nav = (path) => navigate(wbPath(path));

export function PatternsIndex() {
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, 'Patterns'),
      p({ class: css('_body _fgmutedfg') }, 'Composable UI compositions from the registry.')
    ),
    PatternListView(nav)
  );
}

const CATEGORY_LABELS = {
  layout: 'Layout', data: 'Data Display', content: 'Content',
  navigation: 'Navigation', forms: 'Forms', commerce: 'Commerce',
  activity: 'Activity', meta: 'Meta / Docs'
};

function toKebab(str) {
  return str.replace(/\s+/g, '-').toLowerCase();
}

export function PatternDetailPage({ id, group }) {
  const patternId = toKebab(id);
  const groupLabel = group ? (CATEGORY_LABELS[group] || group) : null;
  const crumbs = [
    { label: 'Patterns', onclick: () => navigate(wbPath('/patterns')) },
    ...(groupLabel ? [{ label: groupLabel, onclick: () => navigate(wbPath('/patterns')) }] : []),
    { label: id }
  ];

  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: crumbs }),
    PatternDetail(patternId, nav)
  );
}
