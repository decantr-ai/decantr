import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon } from 'decantr/components';

const { section, div, h2, p, span, img } = tags;

export function StagePour() {
  return section({ class: `ds-section ds-reveal ${css('_flex _col _aic')}` },
    div({ class: `ds-orb ds-orb-purple-10 ${css('_w[400px] _h[400px] _top[20%] _right[-10%]')}` }),

    div({ class: css('_flex _row _wrap _gap12 _aic _relative _z10 _maxw[1100px] _w100') },
      // Left: Visual
      div({ class: css('_flex _aic _jcc _relative _flex1 _minw[280px]') },
        // Glow orb behind logo
        div({ class: `ds-glow-purple ${css('_absolute _w[200px] _h[200px] _rfull')}` }),
        div({ class: css('_flex _col _aic _gap4 _relative') },
          div({ class: `ds-glass ${css('_flex _aic _jcc _p8 _rfull _w[140px] _h[140px]')}` },
            img({ src: './images/logo.svg', alt: '', class: `ds-logo-glow-sm ${css('_w[80px]')}` }),
          ),
          // Pouring line
          div({ class: `ds-flow-gradient ds-flow-line ${css('_w[2px] _h[60px]')}` }),
        ),
      ),

      // Right: Text
      div({ class: css('_flex _col _gap6 _flex1 _minw[320px]') },
        // Stage badge
        div({ class: css('_flex _row _aic _gap3') },
          span({ class: `ds-stage-num ${css('_flex _aic _jcc')}` }, '1'),
          span({ class: css('_textsm _fwheading _fgmutedfg _uppercase _ls[0.1em]') }, 'Stage 1'),
        ),

        h2({ class: `ds-heading-stage ds-gradient-text ds-animate ${css('_fw[800] _ls[-0.03em] _lh[1.1]')}` },
          'POUR \u2014 Express Your Intent',
        ),

        p({ class: `ds-animate ds-delay-1 ${css('_textbase _lhrelaxed _fgmutedfg')}` },
          'No forms. No wizards. No configuration files. Just say what you want in plain language. The Decantation Process begins the moment you speak.',
        ),

        // Example card
        div({ class: `ds-glass-strong ds-animate ds-delay-2 ${css('_flex _col _gap3 _p6')}` },
          div({ class: css('_flex _row _aic _gap2 _fgaccent') },
            icon('message-square', { size: '16px' }),
            span({ class: css('_textsm _fwheading') }, 'Prompt'),
          ),
          p({ class: css('_fgfg _lh[1.6]') + ' ds-code' },
            '"Build me a SaaS dashboard with real-time analytics, user management, and dark mode."',
          ),
        ),

        p({ class: `ds-animate ds-delay-3 ${css('_textlg _fgfg _bold')}` },
          'One sentence. That\u2019s all it takes.',
        ),
      ),
    ),
  );
}
