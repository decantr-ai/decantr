import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Separator } from 'decantr/components';

const { div, h2, h3, p } = tags;

function slugify(label) {
  return 'demo-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function SectionHeader(title, subtitle) {
  return div({ class: css('_flex _col _gap2') },
    h2({ class: css('_text2xl _fwheading _lhtight _lsheading') }, title),
    subtitle ? p({ class: css('_textsm _fg4') }, subtitle) : null
  );
}

export function DemoGroup(label, description, ...children) {
  return div({ class: css('_flex _col _gap4'), id: slugify(label), 'data-demo-label': label },
    Separator({}),
    div({ class: css('_flex _col _gap2') },
      h3({ class: css('_textlg _fwheading _lhsnug') }, label),
      description ? p({ class: css('_textsm _fg4 _lhnormal') }, description) : null
    ),
    ...children
  );
}

export function DemoRow(...children) {
  return div({ class: css('_flex _gap3 _wrap _aic') }, ...children);
}
