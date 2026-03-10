import { css } from 'decantr/css';
import { tags } from 'decantr/tags';

const { section, div, h2, p, span, blockquote } = tags;

const quotes = [
  'Zero entries in package.json dependencies. By design.',
  'What happens when you strip a framework down to pure intent? You get this.',
  'Built from scratch. Built for AI. Built to make you wonder why you ever needed anything else.',
  'The enterprise UI framework that ships with everything and depends on nothing.',
  '97 components. 170 design tokens. 25 chart types. Zero dependencies. One framework to end the debate.',
  'Engineered for the AI era. No compromises. No dependencies. No competition.',
  'One framework. Zero dependencies. Infinite possibilities.',
  'The framework that ships everything and imports nothing.',
  'Everything you need. Nothing you don\'t. Built for what comes next.',
];

function QuoteCard({ text, delay }) {
  return blockquote({ class: `ds-glass ds-animate ds-delay-${delay} ${css('_flex _col _jcc _p8 _relative _ohidden')}`, style: 'min-height:140px' },
    // Large decorative quote mark
    span({ style: 'position:absolute;top:-0.25rem;left:1rem;font-size:5rem;line-height:1;font-weight:900;background:linear-gradient(135deg,var(--d-primary),var(--d-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;opacity:0.3;pointer-events:none' }, '\u201C'),
    // Quote text — bright white with subtle gradient hint
    p({ style: 'font-size:clamp(1.05rem,2.2vw,1.3rem);font-weight:700;line-height:1.4;letter-spacing:-0.01em;position:relative;z-index:1;padding-top:1.5rem;color:rgba(255,255,255,0.92);background:linear-gradient(135deg,rgba(255,255,255,0.95) 60%,var(--d-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text' },
      text,
    ),
  );
}

export function QuotesSection() {
  return section({ class: `ds-section ds-reveal ${css('_flex _col _aic')}` },
    div({ class: 'ds-orb', style: 'width:400px;height:400px;background:rgba(253,163,3,0.06);top:30%;right:-10%' }),

    div({ class: css('_flex _col _aic _gap12 _relative _z10'), style: 'max-width:1100px;width:100%' },
      // Header
      div({ class: css('_flex _col _aic _gap4 _tc') },
        h2({ class: 'ds-gradient-text ds-animate', style: 'font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-0.03em;line-height:1.1' },
          'We Couldn\'t Pick Just One',
        ),
        p({ class: `ds-animate ds-delay-1 ${css('_textlg _lhrelaxed')}`, style: 'color:var(--d-muted-fg);max-width:600px' },
          'Our marketing team quit, so we asked the AI to write taglines. It got a little ',
          span({ style: 'color:var(--d-fg);font-weight:600' }, 'carried away.'),
          ' We kept them all.',
        ),
      ),

      // Quotes grid
      div({ class: css('_grid _gcaf300 _gap4'), style: 'width:100%' },
        ...quotes.map((text, i) => QuoteCard({ text, delay: (i % 5) + 2 })),
      ),
    ),
  );
}
