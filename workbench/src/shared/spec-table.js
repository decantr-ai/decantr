import { tags } from 'decantr/tags';
import { css } from 'decantr/css';

const { div, table, thead, tbody, tr, th, td, span, code } = tags;

/**
 * Auto-generated props/API table from registry JSON.
 * @param {{ props: Record<string, { type: string, default?: any, description?: string, enum?: string[] }> }} opts
 */
export function SpecTable({ props }) {
  if (!props || Object.keys(props).length === 0) {
    return div({ class: css('_fgmutedfg _body') }, 'No props defined in registry.');
  }

  const rows = Object.entries(props).map(([name, meta]) => {
    const typeStr = meta.enum ? meta.enum.join(' | ') : (meta.type || 'any');
    const defaultStr = meta.default !== undefined ? String(meta.default) : '—';
    return tr({},
      td({ class: 'de-spec-name' }, code({}, name)),
      td({ class: 'de-spec-type' }, code({}, typeStr)),
      td({ class: 'de-spec-default' }, defaultStr),
      td({ class: 'de-spec-desc' }, meta.description || '—')
    );
  });

  return div({ class: 'de-spec-table-wrap' },
    table({ class: 'de-spec-table' },
      thead({},
        tr({},
          th({}, 'Prop'),
          th({}, 'Type'),
          th({}, 'Default'),
          th({}, 'Description')
        )
      ),
      tbody({}, ...rows)
    )
  );
}
