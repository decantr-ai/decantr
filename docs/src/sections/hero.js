import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Button } from 'decantr/components';

const { section, div, img, h1, p, span, a, code, pre } = tags;

// Terminal-style demo showing a prompt → essence → app flow
function TerminalDemo() {
  const lines = [
    { prompt: true, text: 'npx decantr create --prompt "SaaS analytics dashboard"' },
    { text: '' },
    { accent: true, text: '  POUR    Capturing intent...' },
    { accent: true, text: '  SETTLE  Decomposing into layers...' },
    { accent: true, text: '  CLARIFY Writing essence.json...' },
    { accent: true, text: '  DECANT  Resolving blend specs...' },
    { accent: true, text: '  SERVE   Generating 6 pages...' },
    { text: '' },
    { success: true, text: '  Done. Your app is ready at http://localhost:4200' },
    { muted: true, text: '  4 pages | 12 components | auradecantism style | dark mode' },
  ];

  return div({ class: `ds-glass ${css('_w100 _maxw[640px] _r3 _ohidden')}` },
    // Title bar
    div({ class: css('_flex _aic _gap2 _px4 _py2 _borderB _bcborder') },
      div({ class: css('_w[10px] _h[10px] _rfull _bg[#ff5f57]') }),
      div({ class: css('_w[10px] _h[10px] _rfull _bg[#febc2e]') }),
      div({ class: css('_w[10px] _h[10px] _rfull _bg[#28c840]') }),
      span({ class: css('_flex1 _tc _textsm _fgmutedfg') }, 'Terminal'),
    ),
    // Content
    pre({ class: css('_p4 _m0 _textsm _lhrelaxed _font[var(--d-font-mono)] _oauto') },
      ...lines.map(line => {
        if (!line.text && !line.prompt) return div({ class: css('_h4') });
        const cls = line.prompt ? '_fgfg' :
                    line.accent ? '_fgprimary' :
                    line.success ? '_fg[var(--d-success)]' :
                    line.muted ? '_fgmutedfg' : '_fgfg';
        return div({ class: css(cls) },
          line.prompt ? span({ class: css('_fgmutedfg') }, '$ ') : null,
          line.text,
        );
      }),
    ),
  );
}

export function HeroSection() {
  return section({ class: `ds-mesh ${css('_flex _col _aic _jcc _minh[calc(100vh_-_52px)] _relative _ohidden')}`, id: 'hero' },
    // Decorative orbs
    div({ class: `ds-orb ds-drift-1 ds-orb-purple-35 ${css('_w[600px] _h[600px] _top[-15%] _left[-10%]')}` }),
    div({ class: `ds-orb ds-drift-2 ds-orb-cyan-25 ${css('_w[500px] _h[500px] _bottom[-10%] _right[-5%]')}` }),
    div({ class: `ds-orb ds-drift-3 ds-orb-pink-20 ${css('_w[400px] _h[400px] _top[55%] _left[45%]')}` }),

    div({ class: css('_flex _col _aic _gap10 _relative _z10 _maxw[900px] _w100 _mx[auto] _px6') },
      // Headline
      div({ class: css('_flex _col _aic _gap6 _tc') },
        h1({ class: `ds-heading-hero ${css('_fw[900] _ls[-0.04em] _lh[1]')}` },
          span('Describe it.'),
          span({ class: 'ds-pink' }, ' Build it.'),
          span(' Ship it.'),
        ),
        p({ class: css('_textxl _lhrelaxed _fgmutedfg _maxw[600px]') },
          'The AI-native web framework. One prompt generates a complete, production-ready application. ',
          span({ class: css('_bold') + ' ds-gradient-text' }, 'Zero dependencies. 100+ components. Fully themed.'),
        ),
      ),

      // Terminal demo
      TerminalDemo(),

      // CTAs
      div({ class: css('_flex _row _gap4 _mt2') },
        a({ href: '#/gallery', class: css('_nounder') },
          Button({ variant: 'primary', size: 'lg', class: 'ds-glow' }, 'See What It Builds'),
        ),
        a({ href: '#/explorer', class: css('_nounder') },
          Button({ variant: 'outline', size: 'lg' }, 'Explore Components'),
        ),
      ),
    ),
  );
}
