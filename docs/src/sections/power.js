import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon } from 'decantr/components';

const { section, div, h2, h3, p, span } = tags;

function StatCard({ value, label, iconName, delay }) {
  return div({ class: `ds-glass ds-animate ds-delay-${delay} ${css('_flex _col _aic _p6 _gap3')}` },
    div({ style: 'color:var(--d-accent)' }, icon(iconName, { size: '28px' })),
    span({ class: 'ds-stat ds-gradient-text' }, value),
    p({ class: css('_textsm'), style: 'color:var(--d-muted-fg);font-weight:500' }, label),
  );
}

function ClaimCard({ title, description, delay }) {
  return div({ class: `ds-glass ds-animate ds-delay-${delay} ${css('_flex _col _gap3 _p6')}` },
    h3({ class: css('_textlg _fwheading'), style: 'color:var(--d-fg)' }, title),
    p({ class: css('_textbase _lhrelaxed'), style: 'color:var(--d-muted-fg)' }, description),
  );
}

export function PowerSection() {
  return section({ class: `ds-section ds-reveal ${css('_flex _col _aic')}`, id: 'power' },
    // Decorative orb
    div({ class: 'ds-orb', style: 'width:600px;height:600px;background:rgba(101,0,198,0.08);top:0;right:-20%' }),

    div({ class: css('_flex _col _aic _gap12 _relative _z10'), style: 'max-width:1100px;width:100%' },
      // Header
      div({ class: css('_flex _col _aic _gap4 _tc') },
        h2({ class: 'ds-gradient-text ds-animate', style: 'font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-0.03em;line-height:1.1' },
          'The Most Powerful UI Framework',
        ),
        p({ class: `ds-animate ds-delay-1 ${css('_textlg _lhrelaxed')}`, style: 'color:var(--d-muted-fg);max-width:700px' },
          'No React. No Angular. No Vue. No Tailwind. No third parties. ',
          span({ style: 'color:var(--d-fg);font-weight:600' }, 'Just pure, unadulterated power.'),
        ),
      ),

      // Stats grid
      div({ class: css('_grid _gcaf220 _gap4'), style: 'width:100%' },
        StatCard({ value: '97+', label: 'Components', iconName: 'layers', delay: 2 }),
        StatCard({ value: '170+', label: 'Design Tokens', iconName: 'tool', delay: 3 }),
        StatCard({ value: '25+', label: 'Chart Types', iconName: 'bar-chart', delay: 4 }),
        StatCard({ value: '0', label: 'Dependencies', iconName: 'package', delay: 5 }),
      ),

      // Bold claims
      div({ class: css('_grid _gcaf300 _gap4'), style: 'width:100%' },
        ClaimCard({
          title: 'Real DOM. Real Performance.',
          description: 'No virtual DOM. No diffing. No reconciliation overhead. Direct DOM manipulation with surgical signal updates. The browser was already fast — we just stopped getting in its way.',
          delay: 3,
        }),
        ClaimCard({
          title: 'No Build Required.',
          description: 'Native ES modules. Import and ship. No webpack. No Vite config. No bundler wars. Your framework should work the moment you write it, not after 47 plugins agree to cooperate.',
          delay: 4,
        }),
        ClaimCard({
          title: 'Runtime CSS Engine.',
          description: '1000+ atomic utilities generated on demand. Zero bytes shipped unused. No purging. No config files. No Tailwind breakpoint debates at 2am. Just css(\'_flex _gap4 _p6\') and move on.',
          delay: 5,
        }),
      ),
    ),
  );
}
