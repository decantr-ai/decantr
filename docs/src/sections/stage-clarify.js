import { css } from 'decantr/css';
import { tags } from 'decantr/tags';

const { section, div, h2, p, span, pre } = tags;

// Manual syntax-colored JSON — keys in accent, strings in primary, braces in muted
function jsonLine(indent, key, value, comma) {
  const pad = '\u00A0'.repeat(indent * 2);
  if (key === null) {
    // Just a brace/bracket line
    return span(pad, span({ class: 'ds-code-brace' }, value), comma ? ',' : '');
  }
  const parts = [
    pad,
    span({ class: 'ds-code-key' }, `"${key}"`),
    ': ',
  ];
  if (typeof value === 'string') {
    parts.push(span({ class: 'ds-code-str' }, `"${value}"`));
  } else {
    parts.push(span({ class: 'ds-code-brace' }, value));
  }
  if (comma) parts.push(',');
  return span(...parts);
}

export function StageClarify() {
  return section({ class: `ds-section ds-reveal ${css('_flex _col _aic')}` },
    div({ class: 'ds-orb', style: 'width:400px;height:400px;background:rgba(254,68,116,0.06);top:30%;right:-10%' }),

    div({ class: css('_flex _row _wrap _gap12 _aic _relative _z10 _maxw[1100px] _w100') },
      // Left: Visual — Logo with crystalline glow
      div({ class: css('_flex _aic _jcc _relative _flex1 _minw[260px]') },
        div({ class: css('_absolute _w[180px] _h[180px] _rfull'), style: 'background:rgba(10,243,235,0.15);filter:blur(50px)' }),
        div({ class: `ds-glass ds-glow ${css('_flex _aic _jcc _p10 _r[var(--d-radius-xl)]')}` },
          div({ class: css('_flex _col _aic _gap2') },
            span({ class: css('_t[3rem]') }, '\uD83D\uDC8E'),
            span({ class: css('_textsm _fwheading _fgaccent') }, 'essence.json'),
          ),
        ),
      ),

      // Right: JSON preview + text
      div({ class: css('_flex _col _gap6 _flex1 _minw[320px]') },
        div({ class: css('_flex _row _aic _gap3') },
          span({ class: `ds-stage-num ${css('_flex _aic _jcc')}` }, '3'),
          span({ class: css('_textsm _fwheading _fgmutedfg _uppercase _ls[0.1em]') }, 'Stage 3'),
        ),

        h2({ class: css('_fw[800] _ls[-0.03em] _lh[1.1]') + ' ds-gradient-text ds-animate', style: 'font-size:clamp(1.75rem,4vw,2.75rem)' },
          'CLARIFY \u2014 Your Project\u2019s DNA',
        ),

        p({ class: `ds-animate ds-delay-1 ${css('_textbase _lhrelaxed _fgmutedfg')}` },
          'The settled layers crystallize into a single file \u2014 your project\u2019s persistent DNA. Every future decision references it. Drift ends here.',
        ),

        // JSON preview card
        div({ class: `ds-glass-strong ds-animate ds-delay-2 ${css('_p6')}` },
          pre({ class: css('_m0 _lh[1.7] _t[0.8rem] _overflow[auto]') + ' ds-code' },
            jsonLine(0, null, '{', false), '\n',
            jsonLine(1, 'terroir', 'saas-dashboard', true), '\n',
            jsonLine(1, 'vintage', '{', false), '\n',
            jsonLine(2, 'style', 'command-center', true), '\n',
            jsonLine(2, 'mode', 'dark', true), '\n',
            jsonLine(2, 'shape', 'sharp', false), '\n',
            jsonLine(1, null, '}', true), '\n',
            jsonLine(1, 'character', '["tactical", "data-dense"]', true), '\n',
            jsonLine(1, 'vessel', '{ "type": "spa" }', false), '\n',
            jsonLine(0, null, '}', false),
          ),
        ),

        p({ class: `ds-animate ds-delay-3 ${css('_textlg _fgfg _bold')}` },
          'Written once. Referenced forever.',
        ),
      ),
    ),
  );
}
