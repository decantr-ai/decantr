import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon } from 'decantr/components';

const { section, div, h2, h3, p, span, table, thead, tbody, tr, th, td } = tags;

const COMPARISONS = [
  { feature: 'Bundle size (hello world)', decantr: '~13 KB', react: '~45 KB', angular: '~65 KB' },
  { feature: 'Dependencies', decantr: '0', react: '5+', angular: '20+' },
  { feature: 'Built-in components', decantr: '100+', react: '0', angular: '35' },
  { feature: 'Built-in routing', decantr: 'Yes', react: 'No', angular: 'Yes' },
  { feature: 'Built-in state', decantr: 'Yes', react: 'No', angular: 'Yes' },
  { feature: 'Built-in CSS engine', decantr: 'Yes', react: 'No', angular: 'No' },
  { feature: 'Design tokens', decantr: '170+', react: '0', angular: '0' },
  { feature: 'AI-optimized registry', decantr: 'Yes', react: 'No', angular: 'No' },
  { feature: 'MCP server', decantr: 'Yes', react: 'No', angular: 'No' },
  { feature: 'Build tool required', decantr: 'No', react: 'Yes', angular: 'Yes' },
];

function checkIcon() {
  return icon('check-circle', { size: '1rem' });
}

export function PricingSection() {
  return section({ class: `ds-section ${css('_flex _col _aic _gap8')}`, id: 'pricing' },
    div({ class: css('_flex _col _aic _gap3 _tc _maxw[600px]') },
      span({ class: css('_caption _uppercase _ls[0.1em] _fgprimary _bold') }, 'Pricing'),
      h2({ class: 'ds-heading' }, 'Free. Forever.'),
      p({ class: css('_textlg _fgmutedfg _lhrelaxed') },
        'MIT open source. No premium tiers. No vendor lock-in. The full framework, always free.'
      ),
    ),

    // Comparison table
    div({ class: `ds-glass ${css('_w100 _maxw[800px] _oxauto _r3')}` },
      table({ class: css('_w100') },
        thead({},
          tr({ class: css('_borderB') },
            th({ class: css('_p3 _tl _fgmutedfg _textsm') }, 'Feature'),
            th({ class: css('_p3 _tc _fgprimary _textsm _bold') }, 'decantr'),
            th({ class: css('_p3 _tc _fgmutedfg _textsm') }, 'React + ecosystem'),
            th({ class: css('_p3 _tc _fgmutedfg _textsm') }, 'Angular'),
          ),
        ),
        tbody({},
          ...COMPARISONS.map(row =>
            tr({ class: css('_borderB') },
              td({ class: css('_p3 _textsm _fgfg') }, row.feature),
              td({ class: css('_p3 _tc _textsm _fgprimary _bold') }, row.decantr),
              td({ class: css('_p3 _tc _textsm _fgmutedfg') }, row.react),
              td({ class: css('_p3 _tc _textsm _fgmutedfg') }, row.angular),
            )
          ),
        ),
      ),
    ),
  );
}
