import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { Button, icon } from 'decantr/components';
import { navigate } from 'decantr/router';

const { div, h1, p, span } = tags;

export default function NotFoundPage() {
  return div({ class: css('d-page-enter _flex _col _center _hfull _gap4 cy-pastel-mesh') },
    div({ class: css('_flex _col _center _gap3 cy-pillow _p12') },
      icon('palette', { size: '3rem', class: css('_fgprimary cy-float') }),
      h1({ class: css('_heading1 d-gradient-text') }, '404'),
      span({ class: css('cy-label') }, 'PAGE NOT FOUND'),
      p({ class: css('_textsm _fgmuted _tc') }, 'This color does not exist in our palette.'),
      Button({ variant: 'primary', class: css('_mt4 cy-glow cy-squish'), onclick: () => navigate('/') },
        icon('arrow-left', { size: '1em' }), ' Back to Home'
      )
    )
  );
}
