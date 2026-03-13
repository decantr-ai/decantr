import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon } from 'decantr/components';

const { section, div, h2, h3, p, span } = tags;

const layers = [
  {
    iconName: 'map-pin',
    name: 'Terroir',
    description: 'Domain archetype \u2014 what kind of product this is.',
    example: 'SaaS dashboard, e-commerce, portfolio, content site',
  },
  {
    iconName: 'palette',
    name: 'Vintage',
    description: 'Visual identity \u2014 style, mode, recipe, and shape.',
    example: 'Command Center + dark mode + sharp edges',
  },
  {
    iconName: 'sparkles',
    name: 'Character',
    description: 'Brand personality as trait words. Guides density, tone, motion.',
    example: '"tactical", "data-dense", "operational"',
  },
  {
    iconName: 'layout',
    name: 'Structure',
    description: 'Page/view map \u2014 every screen in the app.',
    example: 'Overview, Alerts, Settings, User Profile',
  },
  {
    iconName: 'activity',
    name: 'Tannins',
    description: 'Functional systems \u2014 the living machinery.',
    example: 'Auth, real-time data, notifications, search',
  },
];

function LayerCard({ iconName, name, description, example, index }) {
  return div({
    class: `ds-glass ds-settle-layer ds-animate ds-delay-${index + 2} ${css('_flex _row _aic _gap4 _p6')}`,
  },
    div({ class: css('_fgaccent _inlineflex _shrink0 _p[0.75rem] _r[var(--d-radius-lg)]'), style: 'background:rgba(10,243,235,0.1)' },
      icon(iconName, { size: '24px' }),
    ),
    div({ class: css('_flex _col _gap1') },
      h3({ class: css('_textlg _fwheading _fgfg') }, name),
      p({ class: css('_textsm _lhrelaxed _fgmutedfg') }, description),
      span({ class: css('_textsm _fgmuted _italic') }, example),
    ),
  );
}

export function StageSettle() {
  return section({ class: `ds-section ds-reveal ${css('_flex _col _aic')}` },
    div({ class: 'ds-orb', style: 'width:500px;height:500px;background:rgba(10,243,235,0.06);bottom:10%;left:-15%' }),

    div({ class: css('_flex _col _aic _gap10 _relative _z10 _maxw[900px] _w100') },
      // Header
      div({ class: css('_flex _col _aic _gap4 _tc') },
        div({ class: css('_flex _row _aic _gap3 _jcc') },
          span({ class: `ds-stage-num ${css('_flex _aic _jcc')}` }, '2'),
          span({ class: css('_textsm _fwheading _fgmutedfg _uppercase _ls[0.1em]') }, 'Stage 2'),
        ),
        h2({ class: css('_fw[800] _ls[-0.03em] _lh[1.1]') + ' ds-gradient-text ds-animate', style: 'font-size:clamp(1.75rem,4vw,2.75rem)' },
          'SETTLE \u2014 Five Layers Emerge',
        ),
        p({ class: `ds-animate ds-delay-1 ${css('_textbase _lhrelaxed _fgmutedfg _maxw[600px]')}` },
          'Intent isn\u2019t simple. It has geology. The LLM decomposes your request into five named layers \u2014 each one settling into its natural position.',
        ),
      ),

      // Stacked layer cards with progressive offset
      div({ class: css('_flex _col _gap4 _w100') },
        ...layers.map((layer, i) => LayerCard({ ...layer, index: i })),
      ),

      p({ class: `ds-animate ds-delay-8 ${css('_textlg _tc _fgfg _bold _maxw[500px]')}` },
        'Five layers. One intent. Complete decomposition.',
      ),
    ),
  );
}
