import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { Button, icon } from 'decantr/components';
import { navigate } from 'decantr/router';

const { div, h1, p, span } = tags;

export default function NotFoundPage() {
  return div({ class: css('d-page-enter _flex _col _center _hfull _gap4 cc-grid') },
    div({ class: css('_flex _col _center _gap3 cc-frame _p12') },
      icon('alert-triangle', { size: '3rem', class: css('_fgprimary cc-blink') }),
      h1({ class: css('cc-data _heading1') }, '404'),
      p({ class: css('cc-label _fgmuted') }, 'SIGNAL NOT FOUND'),
      span({ class: css('cc-data _textxs _fgmuted') }, 'The requested endpoint does not exist in this sector.'),
      Button({ variant: 'primary', class: css('_mt4 cc-label'), onclick: () => navigate('/') },
        icon('arrow-left', { size: '1em' }), ' RETURN TO BASE'
      )
    )
  );
}
