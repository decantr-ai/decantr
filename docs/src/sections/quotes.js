import { css } from 'decantr/css';
import { tags } from 'decantr/tags';

const { section, div, h2, p, span, blockquote } = tags;

const quotes = [
  'Zero entries in package.json dependencies. By design.',
  'What happens when you strip a framework down to pure intent? You get this.',
  'Built from scratch. Built for AI. Built to make you wonder why you ever needed anything else.',
  'The enterprise UI framework that ships with everything and depends on nothing.',
  '102 components. 170 design tokens. 25 chart types. Zero dependencies. One framework to end the debate.',
  'Engineered for the AI era. No compromises. No dependencies. No competition.',
  'One framework. Zero dependencies. Infinite possibilities.',
  'The framework that ships everything and imports nothing.',
  'Everything you need. Nothing you don\'t. Built for what comes next.',
];

function QuoteCard({ text, delay }) {
  return blockquote({ class: `ds-glass ds-animate ds-delay-${delay} ${css('_flex _col _jcc _p8 _relative _ohidden _minh[140px]')}` },
    // Large decorative quote mark
    span({ class: `ds-quote-mark ${css('_absolute _top[-0.25rem] _left[1rem] _t[5rem] _lh[1] _fw[900] _op[0.3]')}` }, '\u201C'),
    // Quote text — bright white with subtle gradient hint
    p({ class: `ds-quote-text ds-heading-quote ${css('_bold _lh[1.4] _ls[-0.01em] _relative _z[1] _pt[1.5rem]')}` },
      text,
    ),
  );
}

export function QuotesSection() {
  return section({ class: `ds-section ds-reveal ${css('_flex _col _aic')}` },
    div({ class: `ds-orb ds-orb-gold-06 ${css('_w[400px] _h[400px] _top[30%] _right[-10%]')}` }),

    div({ class: css('_flex _col _aic _gap12 _relative _z10 _maxw[1100px] _w100') },
      // Header
      div({ class: css('_flex _col _aic _gap4 _tc') },
        h2({ class: `ds-heading ds-gradient-text ds-animate ${css('_fw[800] _ls[-0.03em] _lh[1.1]')}` },
          'We Couldn\'t Pick Just One',
        ),
        p({ class: `ds-animate ds-delay-1 ${css('_textlg _lhrelaxed _fgmutedfg _maxw[600px]')}` },
          'Our marketing team quit, so we asked the AI to write taglines. It got a little ',
          span({ class: css('_fgfg _fw[600]') }, 'carried away.'),
          ' We kept them all.',
        ),
      ),

      // Quotes grid
      div({ class: css('_grid _gcaf300 _gap4 _w100') },
        ...quotes.map((text, i) => QuoteCard({ text, delay: (i % 5) + 2 })),
      ),
    ),
  );
}
