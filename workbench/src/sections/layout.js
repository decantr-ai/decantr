import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Tabs, Accordion, Separator, Breadcrumb, Pagination, Space, AspectRatio, Resizable, ScrollArea, Collapsible, Button } from 'decantr/components';

const { div, section, h2, h3, p, span, small } = tags;

function DemoGroup(label, description, ...children) {
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _col _gap1') },
      h3({ class: css('_textlg _fwheading _lhsnug') }, label),
      description ? p({ class: css('_textsm _fg4 _lhnormal') }, description) : null
    ),
    ...children
  );
}

function DemoRow(...children) {
  return div({ class: css('_flex _gap3 _wrap _aic') }, ...children);
}

export function LayoutSection() {
  const [collOpen, setCollOpen] = createSignal(false);

  return section({ id: 'layout', class: css('_flex _col _gap10') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_text2xl _fwheading _lhtight _lsheading') }, 'Layout Components'),
      p({ class: css('_textsm _fg4') }, 'Tabs, accordions, separators, pagination, and content layout primitives.')
    ),
    Separator({}),

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
      div({ style: 'max-width:400px' },
        Collapsible({
          open: collOpen,
          onToggle: v => setCollOpen(v),
          trigger: () => Button({ variant: 'outline', size: 'sm' }, 'Toggle content')
        },
          div({ class: css('_p4'), style: 'background:var(--d-surface-1);border-radius:var(--d-radius);margin-top:8px' },
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
          div({ style: 'width:200px' },
            AspectRatio({ ratio: 16/9 },
              div({ class: css('_flex _center'), style: 'background:var(--d-surface-1);border-radius:var(--d-radius);height:100%' },
                span({ class: css('_textsm _fg4') }, '16:9')
              )
            )
          ),
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Widescreen')
        ),
        div({ class: css('_flex _col _gap2') },
          div({ style: 'width:120px' },
            AspectRatio({ ratio: 1 },
              div({ class: css('_flex _center'), style: 'background:var(--d-surface-1);border-radius:var(--d-radius);height:100%' },
                span({ class: css('_textsm _fg4') }, '1:1')
              )
            )
          ),
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Square')
        ),
        div({ class: css('_flex _col _gap2') },
          div({ style: 'width:120px' },
            AspectRatio({ ratio: 4/3 },
              div({ class: css('_flex _center'), style: 'background:var(--d-surface-1);border-radius:var(--d-radius);height:100%' },
                span({ class: css('_textsm _fg4') }, '4:3')
              )
            )
          ),
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Classic')
        )
      )
    ),

    DemoGroup('Resizable', 'Drag the handle to resize panels within a container.',
      div({ style: 'height:200px;border:1px solid var(--d-border);border-radius:var(--d-radius);overflow:hidden' },
        Resizable({ direction: 'horizontal', defaultSize: 40 },
          div({ class: css('_flex _center _p4'), style: 'background:var(--d-surface-1);height:100%' },
            span({ class: css('_textsm _fg4') }, 'Left panel')
          ),
          div({ class: css('_flex _center _p4'), style: 'height:100%' },
            span({ class: css('_textsm _fg4') }, 'Right panel')
          )
        )
      )
    ),

    DemoGroup('ScrollArea', 'Custom scrollable container with styled scrollbar.',
      ScrollArea({ maxHeight: '180px', style: 'width:300px;border:1px solid var(--d-border);border-radius:var(--d-radius)' },
        div({ class: css('_flex _col _gap2 _p3') },
          ...[1,2,3,4,5,6,7,8,9,10,11,12].map(n =>
            p({ class: css('_textbase _fg4 _lhnormal') }, `Scroll item ${n} \u2014 content inside a custom scroll area.`)
          )
        )
      )
    ),

    DemoGroup('Separator', 'Horizontal and vertical dividers with optional labels.',
      div({ class: css('_flex _col _gap4') },
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Default'),
          Separator({})
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'With Label'),
          Separator({ label: 'OR' })
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Vertical'),
          div({ class: css('_flex _aic _gap4'), style: 'height:40px' },
            p({ class: css('_textbase _fg4') }, 'Left'),
            Separator({ vertical: true }),
            p({ class: css('_textbase _fg4') }, 'Center'),
            Separator({ vertical: true }),
            p({ class: css('_textbase _fg4') }, 'Right')
          )
        )
      )
    ),

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
