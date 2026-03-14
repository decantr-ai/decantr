import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Button } from 'decantr/components';

const { section, div, img, h1, p, span, a } = tags;

export function HeroSection() {
  return section({ class: `ds-mesh ${css('_flex _col _aic _jcc _minhscreen _relative _ohidden')}`, id: 'hero' },
    // Decorative orbs
    div({ class: `ds-orb ds-drift-1 ds-orb-purple-35 ${css('_w[600px] _h[600px] _top[-15%] _left[-10%]')}` }),
    div({ class: `ds-orb ds-drift-2 ds-orb-cyan-25 ${css('_w[500px] _h[500px] _bottom[-10%] _right[-5%]')}` }),
    div({ class: `ds-orb ds-drift-3 ds-orb-pink-20 ${css('_w[400px] _h[400px] _top[55%] _left[45%]')}` }),

    // Main content — split layout
    div({ class: css('_flex _col _aic _gap8 _relative _z10 _jcc _mw[900px] _w100 _mx[auto] _px6 _md:row _md:gap10 _md:px8') },
      // Left: Logo
      div({ class: `ds-float ds-logo-col ${css('_flex _aic _jcc')}` },
        img({
          src: './images/logo-portrait.svg',
          alt: 'decantr logo',
          class: `ds-logo-glow ${css('_w[220px]')}`,
        }),
      ),

      // Right: Typography
      div({ class: css('_flex _col _gap6 _flex1 _minw0 _aic _tc _md:aifs _md:tl') },
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
  );
}
