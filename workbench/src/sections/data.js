import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { List, Tree, Calendar, Carousel, Image, Timeline, HoverCard } from 'decantr/components';
import { SectionHeader, DemoGroup, DemoRow } from './_shared.js';

const { div, section, h3, p, span, a } = tags;

export function DataSection() {
  const [calDate, setCalDate] = createSignal(new Date());

  return section({ id: 'data', class: css('_flex _col _gap10') },
    SectionHeader('Data Components', 'Lists, trees, calendars, carousels, timelines, and interactive data views.'),

    DemoGroup('List', 'Bordered list with title and description per item.',
      div({ style: 'max-width:480px' },
        List({
          items: [
            { title: 'Alice Johnson', description: 'Frontend Engineer \u2014 React, TypeScript' },
            { title: 'Bob Smith', description: 'Backend Developer \u2014 Go, PostgreSQL' },
            { title: 'Carol Williams', description: 'Product Designer \u2014 Figma, Research' },
            { title: 'Dave Brown', description: 'DevOps Engineer \u2014 Kubernetes, AWS' }
          ],
          bordered: true,
          size: 'default'
        })
      )
    ),

    DemoGroup('Tree', 'Hierarchical data with checkable nodes and expand/collapse.',
      div({ style: 'max-width:360px' },
        Tree({
          data: [
            { key: 'src', label: 'src', children: [
              { key: 'components', label: 'components', children: [
                { key: 'button', label: 'button.js' },
                { key: 'modal', label: 'modal.js' },
                { key: 'card', label: 'card.js' }
              ]},
              { key: 'core', label: 'core', children: [
                { key: 'index', label: 'index.js' },
                { key: 'dom', label: 'dom.js' }
              ]},
              { key: 'state', label: 'state', children: [
                { key: 'signal', label: 'signal.js' }
              ]}
            ]},
            { key: 'test', label: 'test', children: [
              { key: 'unit', label: 'unit.test.js' }
            ]},
            { key: 'pkg', label: 'package.json' }
          ],
          checkable: true,
          defaultExpandAll: true,
          onSelect: (key) => {},
          onCheck: (keys) => {}
        })
      )
    ),

    DemoGroup('Calendar', 'Mini date picker with signal-driven selected date.',
      div({ style: 'max-width:360px' },
        Calendar({
          value: calDate,
          onChange: v => setCalDate(v),
          mini: true
        })
      )
    ),

    DemoGroup('Carousel', 'Sliding content with arrows, dots, and loop support.',
      div({ style: 'max-width:480px;height:200px' },
        Carousel({ showArrows: true, showDots: true, loop: true },
          div({ class: css('_flex _center'), style: 'height:200px;background:var(--d-surface-1);border-radius:var(--d-radius)' },
            p({ class: css('_textbase _fg4') }, 'Slide 1')
          ),
          div({ class: css('_flex _center'), style: 'height:200px;background:var(--d-surface-1);border-radius:var(--d-radius)' },
            p({ class: css('_textbase _fg4') }, 'Slide 2')
          ),
          div({ class: css('_flex _center'), style: 'height:200px;background:var(--d-surface-1);border-radius:var(--d-radius)' },
            p({ class: css('_textbase _fg4') }, 'Slide 3')
          )
        )
      )
    ),

    DemoGroup('Image', 'Static and previewable image components.',
      DemoRow(
        Image({
          src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" fill="%23e2e8f0"><rect width="160" height="120"/><text x="80" y="60" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="%2364748b">160\u00d7120</text></svg>'),
          alt: 'Placeholder',
          width: '160',
          height: '120'
        }),
        Image({
          src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" fill="%23dbeafe"><rect width="160" height="120"/><text x="80" y="60" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="%231e40af">Preview</text></svg>'),
          alt: 'Previewable',
          width: '160',
          height: '120',
          preview: true
        })
      )
    ),

    DemoGroup('Timeline', 'Vertical timeline with colored markers and timestamps.',
      div({ style: 'max-width:400px' },
        Timeline({
          items: [
            { label: 'Project started', content: 'Initial commit and setup', time: 'Jan 2024', color: 'var(--d-primary)' },
            { label: 'Alpha release', content: 'Core features complete', time: 'Mar 2024', color: 'var(--d-success)' },
            { label: 'Beta release', content: 'Component library shipped', time: 'Jun 2024', color: 'var(--d-warning)' },
            { label: 'v1.0 Launch', content: 'Production ready', time: 'Sep 2024', color: 'var(--d-success)' }
          ],
          mode: 'left'
        })
      )
    ),

    DemoGroup('HoverCard', 'Popover content triggered on hover with configurable position.',
      DemoRow(
        HoverCard({
          trigger: () => a({ href: '#', class: css('_fg1 _underline') }, '@alice'),
          position: 'bottom'
        },
          div({ class: css('_flex _col _gap2 _p2') },
            span({ class: css('_fwtitle') }, 'Alice Johnson'),
            span({ class: css('_textsm _fg4') }, 'Frontend Engineer at Decantr'),
            span({ class: css('_textsm _fg4') }, 'San Francisco, CA')
          )
        ),
        HoverCard({
          trigger: () => a({ href: '#', class: css('_fg1 _underline') }, '@bob'),
          position: 'bottom'
        },
          div({ class: css('_flex _col _gap2 _p2') },
            span({ class: css('_fwtitle') }, 'Bob Smith'),
            span({ class: css('_textsm _fg4') }, 'Backend Developer'),
            span({ class: css('_textsm _fg4') }, 'New York, NY')
          )
        )
      )
    )
  );
}
