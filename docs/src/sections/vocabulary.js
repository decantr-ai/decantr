import { css } from 'decantr/css';
import { tags } from 'decantr/tags';

const { section, div, h2, h3, p, span } = tags;

const groups = [
  {
    title: 'Project Identity',
    terms: [
      { name: 'Terroir', def: 'Domain archetype. What kind of product this is.' },
      { name: 'Vintage', def: 'Visual identity \u2014 style + mode + recipe + shape.' },
      { name: 'Character', def: 'Brand personality as trait words. Guides density, tone, animation.' },
      { name: 'Essence', def: 'The persistent project DNA file (decantr.essence.json).' },
    ],
  },
  {
    title: 'Architecture',
    terms: [
      { name: 'Vessel', def: 'App container type + routing strategy (SPA/MPA, hash/history).' },
      { name: 'Structure', def: 'Page/view map \u2014 all screens in the app.' },
      { name: 'Skeleton', def: 'Layout type per page (sidebar-main, top-nav-main, full-bleed, centered).' },
    ],
  },
  {
    title: 'Composition',
    terms: [
      { name: 'Blend', def: 'Per-page spatial arrangement \u2014 row-based layout tree.' },
      { name: 'Recipe', def: 'Visual language composition rules \u2014 how components are decorated.' },
      { name: 'Plumbing', def: 'State signals, stores, and data flows for the page.' },
      { name: 'Pattern', def: 'Reusable UI building block referenced by archetypes.' },
    ],
  },
  {
    title: 'Visual Surface',
    terms: [
      { name: 'Bouquet', def: 'Colors \u2014 palette tokens from derive().' },
      { name: 'Body', def: 'Typography \u2014 font, weight, spacing from style definition.' },
      { name: 'Finish', def: 'Motion + interaction \u2014 durations, easing from personality.' },
      { name: 'Clarity', def: 'White space \u2014 density, compound spacing from density trait.' },
    ],
  },
  {
    title: 'Drift Prevention',
    terms: [
      { name: 'Cork', def: 'Validation constraints derived from the Essence.' },
      { name: 'Tasting Notes', def: 'Append-only changelog of decisions and iterations.' },
    ],
  },
];

function TermCard({ name, def, delay }) {
  return div({ class: `ds-glass ds-animate ds-delay-${delay} ${css('_flex _col _gap2 _p5')}` },
    span({ class: css('_textbase _fwheading _fgfg') }, name),
    p({ class: css('_textsm _lhrelaxed _fgmutedfg') }, def),
  );
}

export function Vocabulary() {
  return section({ class: `ds-section ds-reveal ${css('_flex _col _aic')}` },
    div({ class: css('_flex _col _aic _gap12 _relative _z10 _maxw[1100px] _w100') },
      // Header
      div({ class: css('_flex _col _aic _gap4 _tc') },
        h2({ class: css('_fw[800] _ls[-0.03em] _lh[1.1]') + ' ds-gradient-text ds-animate', style: 'font-size:clamp(1.75rem,4vw,2.75rem)' },
          'The Vocabulary',
        ),
        p({ class: `ds-animate ds-delay-1 ${css('_textbase _lhrelaxed _fgmutedfg _maxw[600px]')}` },
          'Every term has a precise meaning. Every meaning has a purpose.',
        ),
      ),

      // Groups
      ...groups.map((group, gi) =>
        div({ class: css('_flex _col _gap4 _w100') },
          h3({ class: `ds-animate ds-delay-${gi + 2} ${css('_textlg _fwheading _fgaccent')}` }, group.title),
          div({ class: css('_grid _gcaf250 _gap4 _w100') },
            ...group.terms.map((term, ti) => TermCard({ ...term, delay: ((gi + ti) % 5) + 2 })),
          ),
        )
      ),
    ),
  );
}
