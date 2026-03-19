import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { Button, icon } from 'decantr/components';
import { navigate } from 'decantr/router';

const { div, h1, p, span } = tags;

export default function NotFoundPage() {
  return div({ class: css('d-page-enter _flex _col _center _hfull _gap4') },
    div({ class: css('_flex _col _center _gap3 _p12 _r4') },
      icon('cloud-off', { size: '3rem', class: css('_fgprimary') }),
      h1({ class: css('_heading1 _bold') }, '404'),
      p({ class: css('_fgmuted _medium') }, 'Page not found'),
      span({ class: css('_textxs _fgmuted _tc') }, 'The page you are looking for does not exist or has been moved.'),
      Button({ variant: 'primary', class: css('_mt4'), onclick: () => navigate('/apps') },
        icon('arrow-left', { size: '1em' }), ' Go Home'
      )
    )
  );
}
