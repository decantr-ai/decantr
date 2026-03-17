import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { link } from 'decantr/router';
import { icon, Card } from 'decantr/components';
import { DocsLayout } from '../layouts/docs-layout.js';

const { div, h1, h2, p, span, section } = tags;

function QuickLink(label, desc, path, iconName) {
  return link({ href: path, class: css('_nounder _fgfg') },
    Card({ hoverable: true, bordered: false, class: `ds-glass ${css('_flex _col _gap2 _p4')}` },
      div({ class: css('_flex _aic _gap2') },
        icon(iconName, { size: '1.25rem' }),
        span({ class: css('_label _bold') }, label),
      ),
      p({ class: css('_caption _fgmutedfg') }, desc),
    ),
  );
}

export function DocsHomePage() {
  return DocsLayout(div({ class: css('_flex _col _gap8 _maxw[800px]') },
    div({ class: css('_flex _col _gap3') },
      h1({ class: css('_heading2') }, 'Documentation'),
      p({ class: css('_textlg _fgmutedfg _lhrelaxed') },
        'Everything you need to build with decantr. From first install to production deployment.'
      ),
    ),

    section({ class: css('_flex _col _gap3') },
      h2({ class: css('_heading4') }, 'Getting Started'),
      div({ class: css('_grid _gc2 _gap4 _sm:gc1') },
        QuickLink('Tutorial', 'Step-by-step guide from zero to deployed app', '/docs/tutorial/01-install', 'book-open'),
        QuickLink('Cookbook', 'Standalone recipes for common features', '/docs/cookbook/dashboard', 'chef-hat'),
      ),
    ),

    section({ class: css('_flex _col _gap3') },
      h2({ class: css('_heading4') }, 'Explore'),
      div({ class: css('_grid _gc3 _gap4 _md:gc2 _sm:gc1') },
        QuickLink('Components', '100+ UI components with live previews', '/docs/components', 'blocks'),
        QuickLink('Patterns', 'Compositional layout patterns', '/docs/patterns', 'layout-grid'),
        QuickLink('Icons', '400+ built-in icons', '/docs/icons', 'sparkles'),
        QuickLink('Tokens', 'Design token inspector', '/docs/tokens', 'palette'),
        QuickLink('API Reference', 'Core, State, Router, Forms, Data', '/docs/foundations', 'code'),
        QuickLink('Theme Studio', 'Customize and preview styles', '/docs/tools', 'sliders-horizontal'),
      ),
    ),

    section({ class: css('_flex _col _gap3') },
      h2({ class: css('_heading4') }, 'Developer Tools'),
      div({ class: css('_grid _gc2 _gap4 _sm:gc1') },
        QuickLink('Workbench', 'Full explorer with style/mode/shape controls, viewport simulator, and global search', '/workbench', 'settings'),
      ),
    ),
  ));
}
