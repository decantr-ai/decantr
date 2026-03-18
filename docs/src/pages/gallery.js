/**
 * Showcase Gallery — displays pre-built applications generated from essence files.
 * Each showcase proves the Decantation Process works end-to-end.
 *
 * Showcase data is loaded from showcase.manifest.json (single source of truth).
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Card, Badge, Button, icon } from 'decantr/components';
import { SiteShell } from '../layouts/site-shell.js';
import showcaseManifest from '../../../showcase/showcase.manifest.json';

const { div, h1, h2, h3, p, span, section, a, img } = tags;

const SHOWCASES = showcaseManifest.showcases;

function ShowcaseCard({ showcase }) {
  const isLive = showcase.status === 'live';
  const showcaseUrl = `/showcase/${showcase.id}/`;

  return Card({
    hoverable: true,
    class: `ds-glass ${css('_flex _col _gap4 _p0 _ohidden')}`,
  },
    // Thumbnail
    a({ href: showcaseUrl, target: '_blank', rel: 'noopener', class: css('_db _ohidden _bgmuted') },
      img({
        src: `/showcase/${showcase.id}/thumbnail.svg`,
        alt: `${showcase.title} screenshot`,
        loading: 'lazy',
        class: css('_w100 _h[200px] _objcover _db _trans[transform_0.3s_ease] _h:scale[1.03]'),
        onerror: 'this.style.display="none"',
      }),
    ),
    // Card body
    div({ class: css('_flex _col _gap4 _p6 _flex1') },
      div({ class: css('_flex _aic _jcsb') },
        Badge({
          variant: isLive ? 'success' : 'default',
        }, isLive ? 'Live' : 'Coming Soon'),
        div({ class: css('_flex _gap2') },
          Badge({ variant: 'outline' }, showcase.style),
          Badge({ variant: 'outline' }, showcase.mode),
        ),
      ),
      h3({ class: css('_heading5 _fgfg') }, showcase.title),
      p({ class: css('_body _fgmutedfg _lhrelaxed') }, showcase.description),
      div({ class: css('_flex _wrap _gap2') },
        ...showcase.tags.map(tag =>
          span({ class: css('_textsm _fgmutedfg _bgmuted _px2 _py1 _r1') }, tag)
        ),
      ),
      div({ class: css('_flex _aic _jcsb _mt[auto] _pt3 _borderT _bcborder') },
        div({ class: css('_flex _aic _gap2') },
          icon('layers', { size: '14px', class: css('_fgmutedfg') }),
          span({ class: css('_textsm _fgmutedfg') }, `Archetype: ${showcase.archetype}`),
        ),
        isLive
          ? a({ href: showcaseUrl, target: '_blank', rel: 'noopener', class: css('_nounder') },
              Button({ variant: 'primary', size: 'sm' }, 'View Live', icon('arrow-up-right', { size: '14px' })),
            )
          : null,
      ),
    ),
  );
}

export function GalleryPage() {
  return SiteShell(
    section({ class: `ds-section ${css('_flex _col _aic _gap12')}` },
      div({ class: css('_flex _col _aic _gap4 _tc _maxw[700px]') },
        span({ class: css('_caption _uppercase _ls[0.1em] _fgprimary _bold') }, 'Showcase Gallery'),
        h1({ class: `ds-heading ds-gradient-text ${css('_fw[800] _ls[-0.03em] _lh[1.1]')}` },
          'Built with Decantr',
        ),
        p({ class: css('_textlg _lhrelaxed _fgmutedfg') },
          'Real applications generated from essence files using the Decantation Process. Each showcase proves the system works end-to-end.',
        ),
      ),
      div({ class: css('_grid _gcaf320 _gap6 _w100 _maxw[1100px]') },
        ...SHOWCASES.map(s => ShowcaseCard({ showcase: s })),
      ),
      div({ class: `ds-glass-strong ${css('_flex _col _aic _tc _gap4 _p8 _w100 _maxw[700px]')}` },
        h2({ class: css('_heading5 _fgfg') }, 'Want to see your app here?'),
        p({ class: css('_body _fgmutedfg') },
          'Every showcase starts with a single essence.json file. Describe your domain, pick a style, and let the Decantation Process do the rest.',
        ),
        div({ class: css('_flex _gap4') },
          a({ href: '#/docs', class: css('_nounder') },
            Button({ variant: 'primary' }, 'Read the Docs'),
          ),
          a({ href: '#/explorer', class: css('_nounder') },
            Button({ variant: 'outline' }, 'Explore Components'),
          ),
        ),
      ),
    ),
  );
}
