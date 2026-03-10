import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Menu, Steps, Segmented, ContextMenu, NavigationMenu, BackTop, Affix, Button, icon } from 'decantr/components';
import { SectionHeader, DemoGroup, DemoRow } from './_shared.js';

const { div, section, h3, p, span, a } = tags;

export function NavigationSection() {
  const [step, setStep] = createSignal(1);
  const [segVal, setSegVal] = createSignal('daily');

  return section({ id: 'navigation', class: css('_flex _col _gap10') },
    SectionHeader('Navigation Components', 'Menus, steps, segmented controls, and context menus.'),

    DemoGroup('Menu', 'Vertical navigation with nested submenus and separators.',
      DemoRow(
        div({ style: 'width:220px;border:1px solid var(--d-border);border-radius:var(--d-radius)' },
          Menu({
            items: [
              { label: 'Dashboard', value: 'dashboard', icon: icon('bar-chart') },
              { label: 'Projects', value: 'projects', icon: icon('folder'), children: [
                { label: 'Active', value: 'active' },
                { label: 'Archived', value: 'archived' }
              ]},
              { separator: true },
              { label: 'Settings', value: 'settings', icon: icon('settings') },
              { label: 'Logout', value: 'logout', icon: icon('log-out') }
            ],
            onSelect: v => {}
          })
        )
      )
    ),

    DemoGroup('Steps — Horizontal', 'Clickable multi-step progress indicator.',
      Steps({
        items: [
          { title: 'Account', description: 'Create account' },
          { title: 'Profile', description: 'Set up profile' },
          { title: 'Billing', description: 'Add payment' },
          { title: 'Complete', description: 'All done!' }
        ],
        current: step,
        clickable: true,
        onChange: v => setStep(v)
      })
    ),

    DemoGroup('Steps — Vertical', 'Vertical layout for order tracking and workflows.',
      div({ style: 'max-width:300px' },
        Steps({
          items: [
            { title: 'Order placed', description: 'March 1, 2024' },
            { title: 'Processing', description: 'Preparing shipment' },
            { title: 'Shipped', description: 'In transit' },
            { title: 'Delivered' }
          ],
          current: 2,
          direction: 'vertical'
        })
      )
    ),

    DemoGroup('Segmented', 'Toggle between related options with different sizes.',
      div({ class: css('_flex _col _gap4') },
        Segmented({
          options: [
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Yearly', value: 'yearly' }
          ],
          value: segVal,
          onChange: v => setSegVal(v)
        }),
        Segmented({
          options: [
            { label: 'S', value: 'sm' },
            { label: 'M', value: 'md' },
            { label: 'L', value: 'lg' },
            { label: 'XL', value: 'xl' }
          ],
          value: 'md',
          size: 'sm'
        }),
        Segmented({
          options: [
            { label: 'List', value: 'list', icon: icon('list') },
            { label: 'Grid', value: 'grid', icon: icon('grid-3x3') },
            { label: 'Board', value: 'board', icon: icon('kanban') }
          ],
          value: 'list',
          size: 'lg'
        })
      )
    ),

    DemoGroup('NavigationMenu', 'Horizontal nav bar with hover-triggered dropdown panels.',
      NavigationMenu({
        items: [
          { label: 'Getting Started', children: [
            { label: 'Introduction', href: '#', description: 'Overview of the framework and core concepts.' },
            { label: 'Installation', href: '#', description: 'Set up your project in under a minute.' },
            { label: 'Quick Start', href: '#', description: 'Build your first app with a guided tutorial.' }
          ]},
          { label: 'Components', children: [
            { label: 'Form', href: '#', description: 'Input, select, checkbox, and more.' },
            { label: 'Display', href: '#', description: 'Cards, tables, badges, and avatars.' },
            { label: 'Feedback', href: '#', description: 'Modals, toasts, alerts, and dialogs.' },
            { label: 'Layout', href: '#', description: 'Tabs, accordion, and grid utilities.' }
          ]},
          { label: 'Documentation', href: '#' },
          { label: 'GitHub', href: '#' }
        ]
      })
    ),

    DemoGroup('BackTop', 'Floating scroll-to-top button that appears after scrolling past a threshold.',
      div({ style: 'position:relative;height:200px;overflow:auto;border:1px solid var(--d-border);border-radius:var(--d-radius)' },
        (() => {
          const scrollContainer = div({ style: 'padding:1rem' },
            p({ class: css('_fg4 _textsm _mb3') }, 'Scroll down in this container to reveal the BackTop button.'),
            ...Array.from({ length: 20 }, (_, i) =>
              p({ class: css('_textsm _fg4 _mb1') }, `Line ${i + 1} — scroll content to trigger BackTop visibility.`)
            )
          );
          const backTop = BackTop({ visibilityHeight: 100, target: scrollContainer });
          scrollContainer.appendChild(backTop);
          return scrollContainer;
        })()
      )
    ),

    DemoGroup('Affix', 'Pins content to viewport on scroll with configurable offset.',
      div({ style: 'position:relative;height:200px;overflow:auto;border:1px solid var(--d-border);border-radius:var(--d-radius)' },
        div({ class: css('_p4') },
          p({ class: css('_fg4 _textsm _mb3') }, 'Affix pins elements when scrolled past their position. In production, it attaches to the window scroll.'),
          div({ class: css('_p3'), style: 'background:var(--d-primary-subtle);border-radius:var(--d-radius)' },
            p({ class: css('_textsm'), style: 'color:var(--d-primary)' }, 'This element would become fixed at the top when scrolling past it (window-level).')
          ),
          div({ class: css('_mt4') },
            ...Array.from({ length: 10 }, (_, i) =>
              p({ class: css('_textsm _fg4 _mb1') }, `Spacer line ${i + 1}`)
            )
          )
        )
      )
    ),

    DemoGroup('ContextMenu', 'Right-click triggered menu with keyboard shortcuts.',
      (() => {
        const target = div({
          class: css('_flex _center _p8'),
          style: 'border:2px dashed var(--d-border);border-radius:var(--d-radius);background:var(--d-surface-1);min-height:120px'
        }, p({ class: css('_fg4') }, 'Right-click here for context menu'));

        ContextMenu({
          target,
          items: [
            { label: 'Cut', shortcut: '\u2318X' },
            { label: 'Copy', shortcut: '\u2318C' },
            { label: 'Paste', shortcut: '\u2318V' },
            { separator: true },
            { label: 'Select All', shortcut: '\u2318A' },
            { separator: true },
            { label: 'Delete', disabled: false }
          ],
          onSelect: item => {}
        });

        return target;
      })()
    )
  );
}
