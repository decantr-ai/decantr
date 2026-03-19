import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Button, icon } from 'decantr/components';
import { navigate } from 'decantr/router';

const { div, h1, p } = tags;

export default function NotFoundPage() {
  onMount(() => { document.title = '404 — eCommerce Admin'; });

  return div({ class: css('d-page-enter _flex _col _center _hfull _gap4') },
    div({ class: css('d-glass _flex _col _center _gap3 _p12 _r4') },
      icon('shopping-bag', { size: '3rem', class: css('_fgprimary') }),
      h1({ class: css('d-gradient-text _heading1 _bold') }, '404'),
      p({ class: css('_fgmuted _medium') }, 'Page not found'),
      Button({ variant: 'primary', class: css('_mt4'), onclick: () => navigate('/') },
        icon('arrow-left', { size: '1em' }), ' Return to Dashboard'
      )
    )
  );
}
