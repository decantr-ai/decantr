import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Button } from 'decantr/components';

const { section, div, img, h1, p, span, a } = tags;

export function HeroSection() {
  return section({ class: `ds-mesh ${css('_flex _col _aic _jcc _minhscreen _relative _ohidden')}`, id: 'hero' },
    // Decorative orbs
    div({ class: 'ds-orb ds-pulse', style: 'width:500px;height:500px;background:rgba(101,0,198,0.12);top:-10%;left:-10%' }),
    div({ class: 'ds-orb ds-pulse', style: 'width:400px;height:400px;background:rgba(10,243,235,0.08);bottom:-5%;right:-5%;animation-delay:1.5s' }),
    div({ class: 'ds-orb ds-pulse', style: 'width:300px;height:300px;background:rgba(254,68,116,0.06);top:60%;left:50%;animation-delay:3s' }),

    // Main content — split layout
    div({ class: css('_flex _row _aic _gap12 _relative _z10 _wrap _jcc _maxw[1100px] _w100 _px[2rem]') },
      // Left: Logo
      div({ class: `ds-float ${css('_flex _aic _jcc _shrink0')}`, style: 'flex-basis:300px' },
        img({
          src: './images/logo-portrait.svg',
          alt: 'decantr logo',
          class: css('_w[280px]'),
          style: 'filter:drop-shadow(0 0 40px rgba(101,0,198,0.3))',
        }),
      ),

      // Right: Typography
      div({ class: css('_flex _col _gap6') },
        // Wordmark: decantr.ai
        h1({ class: css('_fw[900] _ls[-0.04em] _lh[1]'), style: 'font-size:clamp(3rem,7vw,5.5rem)' },
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
    div({ class: css('_absolute _bottom0 _flex _col _aic _pb6 _left[50%]'), style: 'transform:translateX(-50%)' },
      div({ class: css('_w[1px] _h[40px]'), style: 'background:linear-gradient(to bottom,transparent,var(--d-muted));animation:ds-pulse 2s infinite' }),
    ),
  );
}
