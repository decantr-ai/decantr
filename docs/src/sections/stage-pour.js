import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon } from 'decantr/components';

const { section, div, h2, p, span, img } = tags;

export function StagePour() {
  return section({ class: `ds-section ds-reveal ${css('_flex _col _aic')}` },
    div({ class: 'ds-orb', style: 'width:400px;height:400px;background:rgba(101,0,198,0.1);top:20%;right:-10%' }),

    div({ class: css('_flex _row _wrap _gap12 _aic _relative _z10 _maxw[1100px] _w100') },
      // Left: Visual
      div({ class: css('_flex _aic _jcc _relative _flex1 _minw[280px]') },
        // Glow orb behind logo
        div({ class: css('_absolute _w[200px] _h[200px] _rfull'), style: 'background:rgba(101,0,198,0.2);filter:blur(60px)' }),
        div({ class: css('_flex _col _aic _gap4 _relative') },
          div({ class: `ds-glass ${css('_flex _aic _jcc _p8 _rfull _w[140px] _h[140px]')}` },
            img({ src: './images/logo.svg', alt: '', class: css('_w[80px]'), style: 'filter:drop-shadow(0 0 20px rgba(101,0,198,0.4))' }),
          ),
          // Pouring line
          div({ class: css('_w[2px] _h[60px]') + ' ds-flow-line', style: 'background:linear-gradient(to bottom,var(--d-primary),transparent)' }),
        ),
      ),

      // Right: Text
      div({ class: css('_flex _col _gap6 _flex1 _minw[320px]') },
        // Stage badge
        div({ class: css('_flex _row _aic _gap3') },
          span({ class: `ds-stage-num ${css('_flex _aic _jcc')}` }, '1'),
          span({ class: css('_textsm _fwheading _fgmutedfg _uppercase _ls[0.1em]') }, 'Stage 1'),
        ),

        h2({ class: css('_fw[800] _ls[-0.03em] _lh[1.1]') + ' ds-gradient-text ds-animate', style: 'font-size:clamp(1.75rem,4vw,2.75rem)' },
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
