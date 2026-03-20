import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { navigate } from 'decantr/router';
import { Breadcrumb } from 'decantr/components';
import { ShellDetail, ShellListView } from '../../../src/explorer/shells.js';
import { wbPath } from './path-prefix.js';

const { div, h2, p } = tags;

const nav = (path) => navigate(wbPath(path));

export function ShellsIndex() {
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, 'Shells'),
      p({ class: css('_body _fgmutedfg') }, 'Configurable shell layouts from the skeleton registry.')
    ),
    ShellListView(nav)
  );
}

export function ShellDetailPage({ id }) {
  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: [
      { label: 'Shells', onclick: () => navigate(wbPath('/shells')) },
      { label: id }
    ]}),
    ShellDetail(id, nav)
  );
}
