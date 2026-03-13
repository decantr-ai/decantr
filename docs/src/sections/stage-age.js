import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon } from 'decantr/components';

const { section, div, h2, h3, p, span } = tags;

const pillars = [
  {
    iconName: 'shield',
    title: 'Cork Rules',
    description: 'Anti-drift validation. Every new prompt is checked against the Essence. Style, structure, and personality are enforced automatically.',
  },
  {
    iconName: 'file-text',
    title: 'Tasting Notes',
    description: 'Append-only decision changelog. Every iteration, every trade-off, every override \u2014 recorded and permanent.',
  },
  {
    iconName: 'book-open',
    title: 'Essence First',
    description: 'Every session reads the DNA before writing a single line. Context isn\u2019t lost. It accumulates.',
  },
];

export function StageAge() {
  return section({ class: `ds-section ds-reveal ${css('_flex _col _aic')}` },
    div({ class: `ds-orb ds-orb-pink-06 ${css('_w[500px] _h[500px] _top[20%] _left[-15%]')}` }),

    div({ class: css('_flex _col _aic _gap10 _relative _z10 _maxw[900px] _w100') },
      // Header
      div({ class: css('_flex _col _aic _gap4 _tc') },
        div({ class: css('_flex _row _aic _gap3 _jcc') },
          span({ class: `ds-stage-num ${css('_flex _aic _jcc')}` }, '6'),
          span({ class: css('_textsm _fwheading _fgmutedfg _uppercase _ls[0.1em]') }, 'Stage 6'),
        ),
        h2({ class: `ds-heading-stage ds-gradient-text ds-animate ${css('_fw[800] _ls[-0.03em] _lh[1.1]')}` },
          'AGE \u2014 Identity Deepens',
        ),
        p({ class: `ds-animate ds-delay-1 ${css('_textbase _lhrelaxed _fgmutedfg _maxw[600px]')}` },
          'Great wine doesn\u2019t change character as it ages \u2014 it intensifies. Your project is the same. Every session reinforces its identity.',
        ),
      ),

      // Three cards
      div({ class: css('_grid _gcaf250 _gap6 _w100') },
        ...pillars.map((pillar, i) =>
          div({ class: `ds-glass ds-animate ds-delay-${i + 2} ${css('_flex _col _gap4 _p8')}` },
            div({ class: `ds-accent-bg ${css('_fgaccent _inlineflex _p[0.75rem] _r[var(--d-radius-lg)] _aisstart')}` },
              icon(pillar.iconName, { size: '28px' }),
            ),
            h3({ class: css('_textlg _fwheading _fgfg') }, pillar.title),
            p({ class: css('_textbase _lhrelaxed _fgmutedfg') }, pillar.description),
          )
        ),
      ),

      // Quote
      div({ class: `ds-animate ds-delay-5 ${css('_tc _py4')}` },
        p({ class: `ds-heading-md ds-gradient-text ${css('_fw[800] _ls[-0.02em] _italic')}` },
          '"Identity doesn\u2019t drift. It deepens."',
        ),
      ),
    ),
  );
}
