import { css } from 'decantr/css';
import { tags } from 'decantr/tags';

const { footer, div, p, span, img } = tags;

export function SiteFooter() {
  return footer({ class: css('_flex _col _aic _gap6 _py12 _px8 _bt[var(--d-border-width)_solid_var(--d-border)]') },
    div({ class: css('_flex _row _aic _gap4') },
      img({ src: './images/logo.svg', alt: 'decantr', class: css('_w[32px]') }),
      span({ class: css('_t[1.25rem] _bold _ls[-0.02em] _fgfg') },
        'decantr',
        span({ class: 'ds-pink' }, '.'),
        'ai',
      ),
    ),

    div({ class: css('_flex _row _aic _gap6') },
      span({ class: css('_fgmuted _t[0.875rem]') }, 'Docs \u2014 Coming Soon'),
      span({ class: css('_fg[var(--d-border-strong)]') }, '|'),
      span({ class: css('_fgmuted _t[0.875rem]') }, 'Discord \u2014 Coming Soon'),
    ),

    p({ class: css('_fgmuted _t[0.75rem]') },
      '\u00A9 2026 decantr. AI-first web framework. Built with decantr.',
    ),
  );
}
