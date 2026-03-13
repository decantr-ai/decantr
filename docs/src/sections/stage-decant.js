import { css } from 'decantr/css';
import { tags } from 'decantr/tags';

const { section, div, h2, p, span, pre } = tags;

function BlendRow({ label, cols }) {
  if (cols) {
    return div({ class: `ds-blend-row ${css('_grid _gap3')}`, style: `grid-template-columns:repeat(${cols.length},1fr)` },
      ...cols.map(c =>
        div({ class: css('_flex _aic _jcc _py6 _fontmono _t[0.8rem] _fgmutedfg') }, c)
      ),
    );
  }
  return div({ class: `ds-blend-row ${css('_flex _aic _jcc _py6 _fontmono _t[0.8rem] _fgmutedfg')}` },
    label,
  );
}

export function StageDecant() {
  return section({ class: `ds-section ds-reveal ${css('_flex _col _aic')}` },
    div({ class: `ds-orb ds-orb-purple-08 ${css('_w[500px] _h[500px] _top[10%] _left[-15%]')}` }),

    div({ class: css('_flex _col _aic _gap10 _relative _z10 _maxw[900px] _w100') },
      // Header
      div({ class: css('_flex _col _aic _gap4 _tc') },
        div({ class: css('_flex _row _aic _gap3 _jcc') },
          span({ class: `ds-stage-num ${css('_flex _aic _jcc')}` }, '4'),
          span({ class: css('_textsm _fwheading _fgmutedfg _uppercase _ls[0.1em]') }, 'Stage 4'),
        ),
        h2({ class: `ds-heading-stage ds-gradient-text ds-animate ${css('_fw[800] _ls[-0.03em] _lh[1.1]')}` },
          'DECANT \u2014 Spatial Resolution',
        ),
        p({ class: `ds-animate ds-delay-1 ${css('_textbase _lhrelaxed _fgmutedfg _maxw[600px]')}` },
          'Each page resolves to a Blend \u2014 a row-based layout tree that specifies spatial arrangement. No guessing. Every pixel has a spec.',
        ),
      ),

      // Mock page layout grid
      div({ class: `ds-glass ds-animate ds-delay-2 ${css('_flex _col _gap3 _p6 _w100')}` },
        span({ class: css('_textsm _fwheading _fgaccent') }, 'Dashboard Overview'),
        BlendRow({ label: 'kpi-grid' }),
        BlendRow({ label: 'data-table' }),
        BlendRow({ cols: ['activity-feed', 'chart-grid'] }),
      ),

      // Corresponding Blend JSON
      div({ class: `ds-glass-strong ds-animate ds-delay-3 ${css('_p6 _w100')}` },
        span({ class: css('_textsm _fwheading _mb2 _fgaccent _block _mb[0.5rem]') }, 'Blend Spec'),
        pre({ class: css('_m0 _lh[1.7] _t[0.8rem] _overflow[auto]') + ' ds-code' },
          span({ class: 'ds-code-key' }, '"blend"'),
          ': ',
          span({ class: 'ds-code-brace' }, '['),
          '\n  ',
          span({ class: 'ds-code-str' }, '"kpi-grid"'),
          ',\n  ',
          span({ class: 'ds-code-str' }, '"data-table"'),
          ',\n  ',
          span({ class: 'ds-code-brace' }, '{'),
          ' ',
          span({ class: 'ds-code-key' }, '"cols"'),
          ': [',
          span({ class: 'ds-code-str' }, '"activity-feed"'),
          ', ',
          span({ class: 'ds-code-str' }, '"chart-grid"'),
          '], ',
          span({ class: 'ds-code-key' }, '"at"'),
          ': ',
          span({ class: 'ds-code-str' }, '"lg"'),
          ' ',
          span({ class: 'ds-code-brace' }, '}'),
          '\n',
          span({ class: 'ds-code-brace' }, ']'),
        ),
      ),

      p({ class: `ds-animate ds-delay-4 ${css('_textlg _tc _fgfg _bold')}` },
        'Every pixel has a spec. Every spec has a reason.',
      ),
    ),
  );
}
