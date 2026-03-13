import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Button } from 'decantr/components';

const { section, div, img, h1, p, span, a } = tags;

export function HeroSection() {
  return section({ class: `ds-mesh ${css('_flex _col _aic _jcc _minhscreen _relative _ohidden')}`, id: 'hero' },
    // Decorative orbs
    div({ class: `ds-orb ds-pulse ds-orb-purple-12 ${css('_w[500px] _h[500px] _top[-10%] _left[-10%]')}` }),
    div({ class: `ds-orb ds-pulse ds-orb-cyan-08 ds-delay-1500 ${css('_w[400px] _h[400px] _bottom[-5%] _right[-5%]')}` }),
    div({ class: `ds-orb ds-pulse ds-orb-pink-06 ds-delay-3000 ${css('_w[300px] _h[300px] _top[60%] _left[50%]')}` }),

    // Main content — split layout
    div({ class: css('_flex _row _aic _gap12 _relative _z10 _wrap _jcc _maxw[1100px] _w100 _px[2rem]') },
      // Left: Logo
      div({ class: `ds-float ds-logo-col ${css('_flex _aic _jcc _shrink0')}` },
        img({
          src: './images/logo-portrait.svg',
          alt: 'decantr logo',
          class: `ds-logo-glow ${css('_w[280px]')}`,
        }),
      ),

      // Right: Typography
      div({ class: css('_flex _col _gap6') },
        // Wordmark: decantr.ai
        h1({ class: `ds-heading-hero ${css('_fw[900] _ls[-0.04em] _lh[1]')}` },
          span('decantr'),
          span({ class: 'ds-pink' }, '.'),
          span('a'),
          span({ class: css('_relative') + ' ds-pink' },
            'i',
            // Decorative dot on the i — we style the whole letter pink
          ),
        ),

        // Lead line
        p({ class: css('_textxl _lhrelaxed _fgmutedfg _maxw[500px]') },
          'The last UI framework you\'ll ever install. ',
          span({ class: css('_bold') + ' ds-gradient-text' }, 'AI-first. Zero dependencies. No React. No Angular. No Vue. No Tailwind. No TypeScript. No third parties. Just pure, unadulterated power...'),
        ),

        // CTA
        div({ class: css('_flex _row _gap4 _mt2') },
          a({ href: '#power', class: css('_nounder') },
            Button({ variant: 'primary', size: 'lg', class: 'ds-glow' }, 'Explore the Power'),
          ),
          Button({ variant: 'outline', size: 'lg', disabled: true }, 'Github - coming soon'),
        ),
      ),
    ),

    // Scroll indicator
    div({ class: `ds-center-x ${css('_absolute _bottom0 _flex _col _aic _pb6 _left[50%]')}` },
      div({ class: `ds-scroll-line ${css('_w[1px] _h[40px]')}` }),
    ),
  );
}
