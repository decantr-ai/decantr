import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { Button, icon } from 'decantr/components';
import { navigate } from 'decantr/router';

const { div, h1, p, span } = tags;

export default function NotFoundPage() {
  return div({ class: css('d-page-enter _flex _col _center _hfull _gap4 gg-mesh') },
    div({ class: css('_flex _col _center _gap3 gg-panel _p12') },
      icon('shield-off', { size: '3rem', class: css('_fgprimary gg-float') }),
      h1({ class: css('gg-data _heading1 d-gradient-text') }, '404'),
      p({ class: css('gg-label _fgmuted') }, 'ZONE NOT FOUND'),
      span({ class: css('gg-data _textxs _fgmuted') }, 'The requested area does not exist in this realm.'),
      Button({ variant: 'primary', class: css('_mt4 gg-label gg-glow'), onclick: () => navigate('/') },
        icon('arrow-left', { size: '1em' }), ' RETURN TO BASE'
      )
    )
  );
}
