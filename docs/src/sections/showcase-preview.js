/**
 * Section 5: Showcase Preview — 3 app cards with link to full showcase
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Card, Badge, Button, icon } from 'decantr/components';
import { link } from 'decantr/router';
import { showcaseManifest } from '../data/showcases.js';

const { div, section, h2, h3, p, span, a, img } = tags;
const SHOWCASES = showcaseManifest.showcases.filter(s => s.status === 'live').slice(0, 3);

export function ShowcasePreviewSection() {
  return section({ class: css('_py24 _px6') },
    div({ class: css('_mw[1100px] _mx[auto] _flex _col _gap8') },
      div({ class: css('_tc') },
        h2({ class: css('_heading2 _fgfg _mb3') }, 'Built with Decantr'),
        p({ class: css('_fgmuted') }, 'Real applications generated from essence files')
      ),
      div({ class: css('_grid _gc1 _md:gc3 _gap6') },
        ...SHOWCASES.map(item =>
          Card({ hoverable: true, class: css('d-glass _overflow[hidden]') },
            a({ href: `/showcase/${item.id}/`, target: '_blank', rel: 'noopener', class: css('_block _bgmuted') },
              img({ src: `/showcase/${item.id}/thumbnail.svg`, alt: item.title, loading: 'lazy',
                    class: css('_wfull _h[160px] _object[cover] _trans[transform_0.3s_ease] _h:scale[1.03]') })
            ),
            div({ class: css('_p4 _flex _col _gap2') },
              div({ class: css('_flex _aic _jcsb') },
                h3({ class: css('_textsm _fgfg _bold') }, item.title),
                Badge({ variant: 'success', size: 'xs' }, 'LIVE')
              ),
              div({ class: css('_flex _gap2') },
                Badge({ variant: 'outline', size: 'xs' }, item.style),
                Badge({ variant: 'outline', size: 'xs' }, item.mode)
              )
            )
          )
        )
      ),
      div({ class: css('_tc') },
        link({ href: '/showcase', class: css('_nounder') },
          Button({ variant: 'outline' }, 'View All Showcases', icon('arrow-right'))
        )
      )
    )
  );
}
