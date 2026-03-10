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
    div({ class: css('_flex _row _aic _gap12 _relative _z10 _wrap _jcc'), style: 'max-width:1100px;width:100%;padding:0 2rem' },
      // Left: Logo
      div({ class: `ds-float ${css('_flex _aic _jcc _shrink0')}`, style: 'flex-basis:300px' },
        img({
          src: './images/logo.svg',
          alt: 'decantr logo',
          style: 'width:280px;height:auto;filter:drop-shadow(0 0 40px rgba(101,0,198,0.3))',
        }),
      ),

      // Right: Typography
      div({ class: css('_flex _col _gap6') },
        // Wordmark: decantr.ai
        h1({ style: 'font-size:clamp(3rem,7vw,5.5rem);font-weight:900;letter-spacing:-0.04em;line-height:1' },
          span('decantr'),
          span({ class: 'ds-pink' }, '.'),
          span('a'),
          span({ class: 'ds-pink', style: 'position:relative' },
            'i',
            // Decorative dot on the i — we style the whole letter pink
          ),
        ),

        // Lead line
        p({ class: css('_textxl _lhrelaxed'), style: 'color:var(--d-muted-fg);max-width:500px' },
          'The last UI framework you\'ll ever install. ',
          span({ class: 'ds-gradient-text', style: 'font-weight:700' }, 'AI-first. Zero dependencies. No React. No Angular. No Vue. No Tailwind. No TypeScript. No third parties. Just pure, unadulterated power...'),
        ),

        // CTA
        div({ class: css('_flex _row _gap4 _mt2') },
          a({ href: '#power', style: 'text-decoration:none' },
            Button({ variant: 'primary', size: 'lg', class: 'ds-glow' }, 'Explore the Power'),
          ),
          a({ href: 'https://github.com/decantr-ai/decantr', target: '_blank', rel: 'noopener', style: 'text-decoration:none' },
            Button({ variant: 'outline', size: 'lg' }, 'GitHub'),
          ),
        ),
      ),
    ),

    // Scroll indicator
    div({ class: css('_absolute _bottom0 _flex _col _aic _pb6'), style: 'left:50%;transform:translateX(-50%)' },
      div({ style: 'width:1px;height:40px;background:linear-gradient(to bottom,transparent,var(--d-muted));animation:ds-pulse 2s infinite' }),
    ),
  );
}
