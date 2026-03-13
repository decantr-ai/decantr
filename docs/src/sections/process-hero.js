import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon } from 'decantr/components';

const { section, div, h1, p, span } = tags;

const stages = [
  { name: 'POUR', iconName: 'droplet' },
  { name: 'SETTLE', iconName: 'layers' },
  { name: 'CLARIFY', iconName: 'diamond' },
  { name: 'DECANT', iconName: 'filter' },
  { name: 'SERVE', iconName: 'code' },
  { name: 'AGE', iconName: 'shield' },
];

function PipelineNode({ name, iconName, delay }) {
  return div({ class: `ds-pipeline-node ds-animate ds-delay-${delay} ${css('_flex _col _aic _gap2')}` },
    div({ class: `ds-pipeline-dot ${css('_flex _aic _jcc')}` },
      icon(iconName, { size: '20px' }),
    ),
    span({ class: `ds-pipeline-label ${css('_textsm _fwheading')}` }, name),
  );
}

function PipelineLine({ delay }) {
  return div({ class: `ds-pipeline-line ds-animate ds-delay-${delay}` });
}

export function ProcessHero() {
  return section({ class: `ds-mesh ds-section ${css('_flex _col _aic _jcc _minhscreen _relative _ohidden')}` },
    // Decorative orbs
    div({ class: 'ds-orb ds-pulse', style: 'width:500px;height:500px;background:rgba(101,0,198,0.12);top:-10%;left:-10%' }),
    div({ class: 'ds-orb ds-pulse', style: 'width:400px;height:400px;background:rgba(10,243,235,0.08);bottom:-5%;right:-5%;animation-delay:1.5s' }),

    div({ class: css('_flex _col _aic _gap12 _relative _z10 _maxw[1100px] _w100') },
      // Headline
      div({ class: css('_flex _col _aic _gap4 _tc') },
        h1({ class: css('_fw[900] _ls[-0.04em] _lh[1.05]') + ' ds-gradient-text ds-animate', style: 'font-size:clamp(2.5rem,6vw,4.5rem)' },
          'The Decantation Process',
        ),
        p({ class: `ds-animate ds-delay-1 ${css('_textlg _lhrelaxed _fgmutedfg _maxw[650px]')}` },
          'From raw intent to production code \u2014 six stages, zero ambiguity.',
        ),
       
      ),

      // Pipeline visualization
      div({ class: `ds-pipeline ${css('_flex _aic _jcc _wrap')}`, role: 'img', 'aria-label': 'Six stages: Pour, Settle, Clarify, Decant, Serve, Age' },
        ...stages.flatMap((s, i) => {
          const node = PipelineNode({ ...s, delay: i + 2 });
          if (i < stages.length - 1) {
            return [node, PipelineLine({ delay: i + 2 })];
          }
          return [node];
        }),
      ),
    ),

    // Scroll indicator
    div({ class: css('_absolute _bottom0 _flex _col _aic _pb6 _left[50%]'), style: 'transform:translateX(-50%)' },
      div({ class: css('_w[1px] _h[40px]'), style: 'background:linear-gradient(to bottom,transparent,var(--d-muted));animation:ds-pulse 2s infinite' }),
    ),
  );
}
