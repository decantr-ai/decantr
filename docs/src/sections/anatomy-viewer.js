/**
 * Anatomy Viewer — Interactive pattern breakdown
 * Shows visual preview with numbered hotspots + component/atom details
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { createSignal, createEffect } from 'decantr/state';
import { Card, Badge, Button, icon } from 'decantr/components';

const { div, h3, h4, span, ul, li, code, img } = tags;

export function AnatomyViewer({ pattern }) {
  const [selectedSlot, setSelectedSlot] = createSignal(null);

  // Preview panel with hotspots
  const previewPanel = Card({ class: css('_relative _overflow[hidden] _flex1') },
    div({ class: css('_bgmuted/5 _p6 _flex _center _minh[320px] _relative') },
      // Pattern preview image
      pattern.preview
        ? img({ src: pattern.preview, alt: pattern.name, class: css('_maxw[100%] _maxh[280px] _object[contain]') })
        : div({ class: css('_flex _center _w[200px] _h[200px] _bgmuted/10 _r2') },
            icon('layout', { size: '3rem', class: css('_fgmuted/50') })
          ),
      // Hotspot overlays
      ...(pattern.slots || []).map((slot, i) => {
        const hotspot = div({
          class: css('_absolute _cursor[pointer] _trans[transform_0.15s_ease]'),
          style: `left: ${slot.x}%; top: ${slot.y}%; transform: translate(-50%, -50%);`,
          onclick: () => setSelectedSlot(slot),
        },
          span({
            class: css('_flex _center _w8 _h8 _rfull _bgprimary _fgfg _textsm _bold _shadow[0_2px_8px_rgba(0,0,0,0.3)] _h:scale[1.1]')
          }, String(i + 1))
        );

        // Highlight on selection
        createEffect(() => {
          const sel = selectedSlot();
          hotspot.classList.toggle('aura-glow', sel?.id === slot.id);
        });

        return hotspot;
      })
    )
  );

  // Details panel
  const detailsPanel = Card({ class: css('_flex1 _minh[320px]') },
    Card.Header({ class: css('_flex _jcsb _aic') },
      h3({ class: css('_heading5') }, pattern.name),
      pattern.preset ? Badge({ variant: 'outline', size: 'sm' }, pattern.preset) : null
    ),
    Card.Body({ class: css('_flex _col _gap4') },
      // Description
      span({ class: css('_textsm _fgmuted _lh[1.6]') }, pattern.description),

      // Components section
      div({ class: css('_flex _col _gap2') },
        h4({ class: css('_caption _fgmutedfg _uppercase _ls[0.05em]') }, 'Components'),
        div({ class: css('_flex _wrap _gap2') },
          ...pattern.components.map(c => Badge({ variant: 'secondary', size: 'sm' }, c))
        )
      ),

      // Atoms section
      div({ class: css('_flex _col _gap2') },
        h4({ class: css('_caption _fgmutedfg _uppercase _ls[0.05em]') }, 'Layout Atoms'),
        div({ class: css('_flex _wrap _gap1') },
          ...pattern.atoms.map(a => code({ class: css('_textxs _bgmuted/20 _px1 _py[2px] _r1 _fgmuted') }, a))
        )
      ),

      // Slots section
      div({ class: css('_flex _col _gap2') },
        h4({ class: css('_caption _fgmutedfg _uppercase _ls[0.05em]') }, 'Slots'),
        ul({ class: css('_flex _col _gap1') },
          ...(pattern.slots || []).map((slot, i) => {
            const item = li({
              class: css('_flex _aic _gap2 _p2 _r1 _cursor[pointer] _trans[background_0.15s_ease] _h:bgmuted/10'),
              onclick: () => setSelectedSlot(slot),
            },
              Badge({ variant: 'outline', size: 'sm' }, String(i + 1)),
              span({ class: css('_textsm') }, slot.label)
            );

            createEffect(() => {
              const sel = selectedSlot();
              item.classList.toggle(css('_bgprimary/10'), sel?.id === slot.id);
            });

            return item;
          })
        )
      )
    )
  );

  return div({ class: css('_grid _gc1 _lg:gc2 _gap6') },
    previewPanel,
    detailsPanel
  );
}
