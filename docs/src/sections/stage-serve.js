import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon } from 'decantr/components';

const { section, div, h2, p, span, pre } = tags;

function MockDashboard() {
  return div({ class: `ds-glass-strong ${css('_flex _row _ohidden _h[280px] _w100')}` },
    // Sidebar
    div({ class: `ds-mock-sidebar ${css('_w[48px] _shrink0')}` }),
    // Main area
    div({ class: css('_flex _col _gap3 _p4 _flex1') },
      // Header bar
      div({ class: `ds-mock-bar ${css('_h[24px] _radius _w100')}` }),
      // KPI row
      div({ class: css('_flex _row _gap2') },
        div({ class: `ds-mock-kpi-1 ${css('_flex1 _h[48px] _radius')}` }),
        div({ class: `ds-mock-kpi-2 ${css('_flex1 _h[48px] _radius')}` }),
        div({ class: `ds-mock-kpi-3 ${css('_flex1 _h[48px] _radius')}` }),
      ),
      // Table area
      div({ class: `ds-mock-table ${css('_flex1 _radius')}` }),
    ),
  );
}

export function StageServe() {
  return section({ class: `ds-section ds-reveal ${css('_flex _col _aic')}` },
    div({ class: `ds-orb ds-orb-cyan-06 ${css('_w[400px] _h[400px] _bottom[20%] _right[-10%]')}` }),

    div({ class: css('_flex _row _wrap _gap8 _aic _relative _z10 _maxw[1100px] _w100') },
      // Left: Blend spec input
      div({ class: css('_flex _col _gap6 _flex1 _minw[300px]') },
        div({ class: css('_flex _row _aic _gap3') },
          span({ class: `ds-stage-num ${css('_flex _aic _jcc')}` }, '5'),
          span({ class: css('_textsm _fwheading _fgmutedfg _uppercase _ls[0.1em]') }, 'Stage 5'),
        ),

        h2({ class: `ds-heading-stage ds-gradient-text ds-animate ${css('_fw[800] _ls[-0.03em] _lh[1.1]')}` },
          'SERVE \u2014 Deterministic Generation',
        ),

        p({ class: `ds-animate ds-delay-1 ${css('_textbase _lhrelaxed _fgmutedfg')}` },
          'The Blend spec is consumed. Code is generated \u2014 not improvised. Same spec, same output. Every time. Every LLM.',
        ),

        // Input spec card
        div({ class: `ds-glass ds-animate ds-delay-2 ${css('_p5')}` },
          span({ class: css('_textsm _fwheading _fgaccent _block _mb[0.5rem]') }, 'Input: Blend'),
          pre({ class: css('_m0 _lh[1.6] _t[0.75rem]') + ' ds-code' },
            span({ class: 'ds-code-brace' }, '['),
            '\n  ',
            span({ class: 'ds-code-str' }, '"kpi-grid"'),
            ',\n  ',
            span({ class: 'ds-code-str' }, '"data-table"'),
            ',\n  ',
            span({ class: 'ds-code-brace' }, '{'),
            span({ class: 'ds-code-key' }, '"cols"'),
            ': ...',
            span({ class: 'ds-code-brace' }, '}'),
            '\n',
            span({ class: 'ds-code-brace' }, ']'),
          ),
        ),

        // Arrow
        div({ class: `ds-animate ds-delay-3 ${css('_flex _aic _jcc _py2 _fgaccent')}` },
          icon('chevron-down', { size: '28px' }),
        ),
      ),

      // Right: Rendered output
      div({ class: css('_flex _col _gap4 _flex1 _minw[300px]') },
        span({ class: `ds-animate ds-delay-3 ${css('_textsm _fwheading _fgaccent')}` }, 'Output: Generated UI'),
        div({ class: 'ds-animate ds-delay-4' },
          MockDashboard(),
        ),
        p({ class: `ds-animate ds-delay-5 ${css('_textlg _fgfg _bold')}` },
          'Same spec, same output. Every time.',
        ),
      ),
    ),
  );
}
