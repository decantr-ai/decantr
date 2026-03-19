/**
 * Section 4: Bento Features — Hero feature + stats + supporting features
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Card, Badge, CodeBlock, createHighlighter, icon } from 'decantr/components';

const { div, section, h2, h3, p, span, pre } = tags;

const MCP_PREVIEW = `$ claude "Add a kanban board to the dashboard"

→ lookup_pattern { "id": "kanban-board" }
→ get_pattern_code { "id": "kanban-board", "preset": "task" }
→ validate_essence { "path": "decantr.essence.json" }

✓ Pattern added to overview page blend
✓ Code generated with drag-drop + status columns
✓ Essence updated, Cork rules validated`;

export function BentoFeaturesSection() {
  const stats = [
    { icon: 'box', value: '100+', label: 'Components' },
    { icon: 'file-code', value: '<13KB', label: 'Bundle' },
    { icon: 'layout-grid', value: '48', label: 'Patterns' },
    { icon: 'palette', value: '10', label: 'Themes' },
  ];

  const features = [
    { icon: 'zap', title: 'Signal Reactivity', description: 'Fine-grained updates without virtual DOM. Changes propagate exactly where needed.' },
    { icon: 'shield', title: 'Enterprise Ready', description: 'OIDC/PKCE auth, RBAC, form validation, error boundaries, route guards built in.' },
    { icon: 'server', title: 'SSR Support', description: 'Server-side rendering with streaming and hydration. Edge-ready.' },
  ];

  return section({ class: css('_py24 _px6 d-mesh') },
    div({ class: css('_mw[1100px] _mx[auto] _flex _col _gap8') },
      // Hero feature card
      Card({ class: css('d-glass _p6') },
        Card.Body({ class: css('_grid _gc1 _lg:gc2 _gap8 _aic') },
          div({ class: css('_flex _col _gap4') },
            Badge({ variant: 'primary', icon: 'cpu' }, 'MCP Server'),
            h2({ class: css('_heading2 _fgfg') }, 'Registry-Driven Generation'),
            p({ class: css('_fgmuted _lh[1.6]') },
              'The MCP server exposes 16 tools for AI to query components, resolve atoms, generate patterns, and validate essence files. Your AI assistant becomes a Decantr expert.'
            )
          ),
          div({ class: css('d-glass-strong _r3 _overflow[hidden]') },
            pre({ class: css('_p4 _m0 _textsm _lh[1.6] _font[var(--d-font-mono)] _fgfg') }, MCP_PREVIEW)
          )
        )
      ),
      // Stats row
      div({ class: css('_grid _gc2 _md:gc4 _gap4') },
        ...stats.map(s =>
          Card({ class: css('d-glass _tc _p4') },
            Card.Body({ class: css('_flex _col _gap2 _aic') },
              icon(s.icon, { class: css('_fgprimary _w6 _h6') }),
              span({ class: css('_heading2 _fgfg') }, s.value),
              span({ class: css('_textsm _fgmuted') }, s.label)
            )
          )
        )
      ),
      // Features row
      div({ class: css('_grid _gc1 _md:gc3 _gap4') },
        ...features.map(f =>
          Card({ class: css('d-glass') },
            Card.Body({ class: css('_flex _col _gap3') },
              div({ class: css('_w10 _h10 _r2 _bgprimary/10 _flex _aic _jcc _fgprimary') },
                icon(f.icon)
              ),
              h3({ class: css('_heading5 _fgfg') }, f.title),
              p({ class: css('_textsm _fgmuted _lh[1.5]') }, f.description)
            )
          )
        )
      )
    )
  );
}
