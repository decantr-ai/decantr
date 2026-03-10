import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Tabs, Accordion, Separator, Breadcrumb, Pagination, Space, AspectRatio, Resizable, ScrollArea, Collapsible, Button, Card, Input, icon } from 'decantr/components';
import { SectionHeader, DemoGroup, DemoRow } from './_shared.js';

const { div, section, h3, p, span, small } = tags;

export function LayoutSection() {
  const [collOpen, setCollOpen] = createSignal(false);

  return section({ id: 'layout', class: css('_flex _col _gap10') },
    SectionHeader('Layout Components', 'Tabs, accordions, separators, pagination, and content layout primitives.'),

    DemoGroup('Tabs', 'Switchable content panels with a tabbed interface.',
      Tabs({
        tabs: [
          { id: 'tab1', label: 'Overview', content: () => p({ class: css('_p4 _textbase _fg4 _lhnormal') }, 'Overview panel content. This tab is selected by default.') },
          { id: 'tab2', label: 'Features', content: () => p({ class: css('_p4 _textbase _fg4 _lhnormal') }, 'Features panel content with detailed information.') },
          { id: 'tab3', label: 'Settings', content: () => p({ class: css('_p4 _textbase _fg4 _lhnormal') }, 'Settings panel content for configuration options.') }
        ]
      })
    ),

    DemoGroup('Accordion — Single', 'Only one item can be expanded at a time.',
      Accordion({
        items: [
          { id: 'a1', title: 'What is decantr?', content: () => p({ class: css('_textbase _fg4 _lhnormal') }, 'An AI-first web framework with zero dependencies. Native JS/CSS/HTML.') },
          { id: 'a2', title: 'How do themes work?', content: () => p({ class: css('_textbase _fg4 _lhnormal') }, 'Five unified themes switchable via setTheme().') },
          { id: 'a3', title: 'What about reactivity?', content: () => p({ class: css('_textbase _fg4 _lhnormal') }, 'Signal-based reactivity with createSignal, createEffect, and createMemo.') }
        ]
      })
    ),

    DemoGroup('Accordion — Multiple', 'Multiple sections can be open simultaneously.',
      Accordion({
        multiple: true,
        items: [
          { id: 'b1', title: 'Section A', content: () => p({ class: css('_textbase _fg4 _lhnormal') }, 'Multiple sections can be open at the same time.') },
          { id: 'b2', title: 'Section B', content: () => p({ class: css('_textbase _fg4 _lhnormal') }, 'This section is independent of the others.') },
          { id: 'b3', title: 'Section C', content: () => p({ class: css('_textbase _fg4 _lhnormal') }, 'Try opening all three at once.') }
        ]
      })
    ),

    DemoGroup('Collapsible', 'Toggle visibility of a content region with smooth animation.',
      div({ class: 'wb-mw-400' },
        Collapsible({
          open: collOpen,
          onToggle: v => setCollOpen(v),
          trigger: () => Button({ variant: 'outline', size: 'sm' }, 'Toggle content')
        },
          div({ class: css('_p4 _mt2') + ' wb-panel' },
            p({ class: css('_textbase _fg4 _lhnormal') }, 'This content can be expanded and collapsed. It uses the createDisclosure behavior for smooth height animation.')
          )
        )
      )
    ),

    DemoGroup('Space', 'Utility component for consistent spacing between elements.',
      div({ class: css('_flex _col _gap4') },
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Horizontal'),
          Space({ direction: 'horizontal', size: 16 },
            Button({}, 'One'),
            Button({}, 'Two'),
            Button({}, 'Three')
          )
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Vertical'),
          Space({ direction: 'vertical', size: 8 },
            span({ class: css('_textbase _fg4') }, 'Vertical item A'),
            span({ class: css('_textbase _fg4') }, 'Vertical item B'),
            span({ class: css('_textbase _fg4') }, 'Vertical item C')
          )
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Wrapping'),
          Space({ direction: 'horizontal', size: 8, wrap: true },
            ...[1,2,3,4,5,6,7,8].map(n => Button({ size: 'sm' }, `Tag ${n}`))
          )
        )
      )
    ),

    DemoGroup('AspectRatio', 'Maintain consistent width-to-height ratios for content containers.',
      div({ class: css('_flex _gap4') },
        div({ class: css('_flex _col _gap2') },
          div({ class: 'wb-w-200' },
            AspectRatio({ ratio: 16/9 },
              div({ class: css('_flex _center _hfull') + ' wb-panel' },
                span({ class: css('_textsm _fg4') }, '16:9')
              )
            )
          ),
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Widescreen')
        ),
        div({ class: css('_flex _col _gap2') },
          div({ class: 'wb-w-120' },
            AspectRatio({ ratio: 1 },
              div({ class: css('_flex _center _hfull') + ' wb-panel' },
                span({ class: css('_textsm _fg4') }, '1:1')
              )
            )
          ),
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Square')
        ),
        div({ class: css('_flex _col _gap2') },
          div({ class: 'wb-w-120' },
            AspectRatio({ ratio: 4/3 },
              div({ class: css('_flex _center _hfull') + ' wb-panel' },
                span({ class: css('_textsm _fg4') }, '4:3')
              )
            )
          ),
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Classic')
        )
      )
    ),

    DemoGroup('Resizable', 'Drag the handle to resize panels within a container.',
      div({ class: css('_ohidden') + ' wb-h-200 wb-bordered' },
        Resizable({ direction: 'horizontal', defaultSize: 40 },
          div({ class: css('_flex _center _p4 _hfull') + ' wb-panel' },
            span({ class: css('_textsm _fg4') }, 'Left panel')
          ),
          div({ class: css('_flex _center _p4 _hfull') },
            span({ class: css('_textsm _fg4') }, 'Right panel')
          )
        )
      )
    ),

    DemoGroup('ScrollArea', 'Custom scrollable container with styled scrollbar.',
      ScrollArea({ maxHeight: '180px', class: 'wb-w-300 wb-bordered' },
        div({ class: css('_flex _col _gap2 _p3') },
          ...[1,2,3,4,5,6,7,8,9,10,11,12].map(n =>
            p({ class: css('_textbase _fg4 _lhnormal') }, `Scroll item ${n} \u2014 content inside a custom scroll area.`)
          )
        )
      )
    ),

    // ── Separator Showcase ──────────────────────────────────────────

    DemoGroup('Separator', 'Horizontal and vertical dividers for visual rhythm and content grouping.',
      div({ class: css('_flex _col _gap4') },
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Default'),
          Separator({})
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Subtle'),
          Separator({ class: 'wb-sep-subtle' })
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Strong'),
          Separator({ class: 'wb-sep-strong' })
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Dashed'),
          Separator({ class: 'wb-sep-dashed' })
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Dotted'),
          Separator({ class: 'wb-sep-dotted' })
        )
      )
    ),

    DemoGroup('Separator \u2014 Labeled', 'Text labels positioned at the center of a divider line.',
      div({ class: css('_flex _col _gap4') },
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'OR'),
          Separator({ label: 'OR' })
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'AND'),
          Separator({ label: 'AND' })
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Section Title'),
          Separator({ label: 'Account Settings' })
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Timestamp'),
          Separator({ label: 'March 10, 2026' })
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Chapter'),
          Separator({ label: 'Chapter 2' })
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Continue'),
          Separator({ label: 'Continue Reading' })
        )
      )
    ),

    DemoGroup('Separator \u2014 Decorative', 'Gradient and styled dividers for visual emphasis.',
      div({ class: css('_flex _col _gap4') },
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Primary Gradient'),
          Separator({ class: 'wb-sep-gradient' })
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Accent Gradient'),
          Separator({ class: 'wb-sep-gradient-accent' })
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Brand Gradient'),
          Separator({ class: 'wb-sep-gradient-full' })
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Thick Accent Bar'),
          Separator({ class: 'wb-sep-thick' })
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Gradient + Label'),
          Separator({ label: 'Featured', class: 'wb-sep-gradient' })
        )
      )
    ),

    DemoGroup('Separator \u2014 Vertical', 'Inline vertical dividers for toolbars, stats, and text groups.',
      div({ class: css('_flex _col _gap4') },
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Between Text'),
          div({ class: css('_flex _aic _gap4') + ' wb-h-40' },
            p({ class: css('_textbase _fg4') }, 'Left'),
            Separator({ vertical: true }),
            p({ class: css('_textbase _fg4') }, 'Center'),
            Separator({ vertical: true }),
            p({ class: css('_textbase _fg4') }, 'Right')
          )
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'In Toolbar'),
          div({ class: 'wb-sep-toolbar' },
            Button({ size: 'sm', variant: 'ghost', 'aria-label': 'Edit' }, icon('edit')),
            Button({ size: 'sm', variant: 'ghost', 'aria-label': 'Copy' }, icon('copy')),
            Button({ size: 'sm', variant: 'ghost', 'aria-label': 'Trash' }, icon('trash')),
            Separator({ vertical: true }),
            Button({ size: 'sm', variant: 'ghost', 'aria-label': 'Star' }, icon('star')),
            Button({ size: 'sm', variant: 'ghost', 'aria-label': 'Bookmark' }, icon('bookmark')),
            Button({ size: 'sm', variant: 'ghost', 'aria-label': 'Share' }, icon('send')),
            Separator({ vertical: true }),
            Button({ size: 'sm', variant: 'ghost', 'aria-label': 'Link' }, icon('link'))
          )
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Stats Row'),
          div({ class: 'wb-sep-stats' },
            div({ class: 'wb-sep-stat' },
              span({ class: 'wb-sep-stat-value' }, '2.4K'),
              span({ class: 'wb-sep-stat-label' }, 'Users')
            ),
            Separator({ vertical: true, class: 'wb-sep-vertical-tall' }),
            div({ class: 'wb-sep-stat' },
              span({ class: 'wb-sep-stat-value' }, '18.2K'),
              span({ class: 'wb-sep-stat-label' }, 'Views')
            ),
            Separator({ vertical: true, class: 'wb-sep-vertical-tall' }),
            div({ class: 'wb-sep-stat' },
              span({ class: 'wb-sep-stat-value' }, '94%'),
              span({ class: 'wb-sep-stat-label' }, 'Uptime')
            )
          )
        )
      )
    ),

    DemoGroup('Separator \u2014 In Context', 'Real-world compositions showing separators in layouts.',
      div({ class: css('_flex _col _gap6') },

        // Between Cards
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Between Cards'),
          div({ class: css('_flex _col _gap4') },
            Card({},
              Card.Header({}, span({ class: css('_fwtitle _textbase') }, 'Account Overview')),
              Card.Body({}, p({ class: css('_textsm _fg4 _lhnormal') }, 'Review your account status and recent activity below.'))
            ),
            Separator({ label: 'or', class: 'wb-sep-gradient' }),
            Card({},
              Card.Header({}, span({ class: css('_fwtitle _textbase') }, 'Quick Actions')),
              Card.Body({}, p({ class: css('_textsm _fg4 _lhnormal') }, 'Update your profile, manage billing, or contact support.'))
            )
          )
        ),

        // Form Sections
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Form Sections'),
          div({ class: css('_flex _col _gap4') + ' wb-mw-640' },
            div({ class: css('_flex _col _gap3') },
              h3({ class: css('_textsm _fwtitle') }, 'Personal Information'),
              div({ class: css('_grid _gc2 _gap3') },
                Input({ placeholder: 'First name' }),
                Input({ placeholder: 'Last name' })
              )
            ),
            Separator({ label: 'Contact Details' }),
            div({ class: css('_flex _col _gap3') },
              div({ class: css('_grid _gc2 _gap3') },
                Input({ placeholder: 'Email address' }),
                Input({ placeholder: 'Phone number' })
              )
            )
          )
        ),

        // Content Sections
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Content Sections'),
          div({ class: css('_flex _col _gap4') + ' wb-mw-640' },
            p({ class: css('_textbase _fg4 _lhrelaxed') }, 'The design system provides a cohesive set of tokens that ensure visual consistency across every component. From spacing to typography, each decision flows from the seed-derived architecture.'),
            Separator({ class: 'wb-sep-gradient-accent' }),
            p({ class: css('_textbase _fg4 _lhrelaxed') }, 'By leveraging CSS custom properties, themes can be swapped at runtime without any layout shift. The token system guarantees that every surface, shadow, and color adapts to the active style and mode.')
          )
        )
      )
    ),

    // ── End Separator Showcase ──────────────────────────────────────

    DemoGroup('Pagination', 'Page navigation controls for paginated content.',
      div({ class: css('_flex _col _gap3') },
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, '10 Pages'),
          Pagination({ total: 100, perPage: 10 })
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Starting at Page 3'),
          Pagination({ total: 50, perPage: 10, page: 3 })
        )
      )
    ),

    DemoGroup('Breadcrumb', 'Hierarchical navigation trail showing the current location.',
      div({ class: css('_flex _col _gap3') },
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Default Separator'),
          Breadcrumb({
            items: [
              { label: 'Home', href: '#' },
              { label: 'Components', href: '#' },
              { label: 'Breadcrumb' }
            ]
          })
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Custom Separator'),
          Breadcrumb({
            separator: '>',
            items: [
              { label: 'Dashboard', href: '#' },
              { label: 'Settings', href: '#' },
              { label: 'Profile' }
            ]
          })
        )
      )
    )
  );
}
