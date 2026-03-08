import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Tabs, Accordion, Separator, Breadcrumb, Pagination } from 'decantr/components';

const { div, section, h2, h3, p } = tags;

function DemoGroup(label, ...children) {
  return div({ class: css('_flex _col _gap3') },
    h3({ class: css('_t12 _bold _fg4'), style: 'text-transform:uppercase;letter-spacing:0.05em' }, label),
    ...children
  );
}

export function LayoutSection() {
  return section({ id: 'layout', class: css('_flex _col _gap8') },
    h2({ class: css('_t24 _bold _mb2') }, 'Layout Components'),

    DemoGroup('Tabs',
      Tabs({
        tabs: [
          { id: 'tab1', label: 'Overview', content: () => p({ class: css('_p4 _fg4') }, 'Overview panel content. This tab is selected by default.') },
          { id: 'tab2', label: 'Features', content: () => p({ class: css('_p4 _fg4') }, 'Features panel content with detailed information.') },
          { id: 'tab3', label: 'Settings', content: () => p({ class: css('_p4 _fg4') }, 'Settings panel content for configuration options.') }
        ]
      })
    ),

    DemoGroup('Accordion — Single',
      Accordion({
        items: [
          { id: 'a1', title: 'What is decantr?', content: () => p({ class: css('_fg4') }, 'An AI-first web framework with zero dependencies. Native JS/CSS/HTML.') },
          { id: 'a2', title: 'How do themes work?', content: () => p({ class: css('_fg4') }, 'Five unified themes (light, dark, retro, hot-lava, stormy-ai) switchable via setTheme().') },
          { id: 'a3', title: 'What about reactivity?', content: () => p({ class: css('_fg4') }, 'Signal-based reactivity with createSignal, createEffect, and createMemo.') }
        ]
      })
    ),

    DemoGroup('Accordion — Multiple',
      Accordion({
        multiple: true,
        items: [
          { id: 'b1', title: 'Section A', content: () => p({ class: css('_fg4') }, 'Multiple sections can be open at the same time.') },
          { id: 'b2', title: 'Section B', content: () => p({ class: css('_fg4') }, 'This section is independent of the others.') },
          { id: 'b3', title: 'Section C', content: () => p({ class: css('_fg4') }, 'Try opening all three at once.') }
        ]
      })
    ),

    DemoGroup('Separator',
      div({ class: css('_flex _col _gap4') },
        Separator({}),
        Separator({ label: 'OR' }),
        div({ class: css('_flex _aic _gap4'), style: 'height:40px' },
          p({ class: css('_fg4') }, 'Left'),
          Separator({ vertical: true }),
          p({ class: css('_fg4') }, 'Center'),
          Separator({ vertical: true }),
          p({ class: css('_fg4') }, 'Right')
        )
      )
    ),

    DemoGroup('Pagination',
      div({ class: css('_flex _col _gap3') },
        Pagination({ total: 100, perPage: 10 }),
        Pagination({ total: 50, perPage: 10, page: 3 })
      )
    ),

    DemoGroup('Breadcrumb',
      div({ class: css('_flex _col _gap3') },
        Breadcrumb({
          items: [
            { label: 'Home', href: '#' },
            { label: 'Components', href: '#' },
            { label: 'Breadcrumb' }
          ]
        }),
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
  );
}
