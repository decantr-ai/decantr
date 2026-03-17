import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { navigate } from 'decantr/router';
import { Breadcrumb } from 'decantr/components';
import { ArchetypeDetail, ArchetypeListView } from 'decantr/explorer/archetypes.js';
import { wbPath } from '../path-prefix.js';

const { div, h2, p } = tags;

const nav = (path) => navigate(wbPath(path));

export function ArchetypesIndex() {
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, 'Archetypes'),
      p({ class: css('_body _fgmutedfg') }, 'Domain blueprints with pages, tannins, and structure.')
    ),
    ArchetypeListView(nav)
  );
}

export function ArchetypeDetailPage({ id }) {
  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: [
      { label: 'Archetypes', onclick: () => navigate(wbPath('/archetypes')) },
      { label: id }
    ]}),
    ArchetypeDetail(id, nav)
  );
}
