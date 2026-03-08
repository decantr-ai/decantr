import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Button, Spinner, Dropdown, icon } from 'decantr/components';

const { div, section, h2, h3, span } = tags;

function DemoGroup(label, ...children) {
  return div({ class: css('_flex _col _gap3') },
    h3({ class: css('_t12 _bold _fg4'), style: 'text-transform:uppercase;letter-spacing:0.05em' }, label),
    ...children
  );
}

function DemoRow(...children) {
  return div({ class: css('_flex _gap3 _wrap _aic') }, ...children);
}

export function ActionSection() {
  return section({ id: 'action', class: css('_flex _col _gap8') },
    h2({ class: css('_t24 _bold _mb2') }, 'Action Components'),

    DemoGroup('Button — Variants',
      DemoRow(
        Button({}, 'Default'),
        Button({ variant: 'primary' }, 'Primary'),
        Button({ variant: 'secondary' }, 'Secondary'),
        Button({ variant: 'destructive' }, 'Destructive'),
        Button({ variant: 'success' }, 'Success'),
        Button({ variant: 'warning' }, 'Warning'),
        Button({ variant: 'outline' }, 'Outline'),
        Button({ variant: 'ghost' }, 'Ghost'),
        Button({ variant: 'link' }, 'Link')
      )
    ),

    DemoGroup('Button — Sizes',
      DemoRow(
        Button({ size: 'xs' }, 'Extra Small'),
        Button({ size: 'sm' }, 'Small'),
        Button({}, 'Default'),
        Button({ size: 'lg' }, 'Large'),
        Button({ variant: 'primary', size: 'icon', 'aria-label': 'Settings' }, icon('settings')),
        Button({ variant: 'primary', size: 'icon-xs', 'aria-label': 'Close' }, icon('x')),
        Button({ variant: 'primary', size: 'icon-sm', 'aria-label': 'Edit' }, icon('edit')),
        Button({ variant: 'primary', size: 'icon-lg', 'aria-label': 'Menu' }, icon('menu'))
      )
    ),

    DemoGroup('Button — States',
      DemoRow(
        Button({ disabled: true }, 'Disabled'),
        Button({ loading: true }, 'Loading'),
        Button({ variant: 'primary', loading: true }, 'Saving...'),
        Button({ variant: 'primary', rounded: true }, 'Rounded')
      ),
      Button({ block: true, variant: 'primary' }, 'Full Width (block)'),
      Button.Group({},
        Button({ variant: 'outline' }, 'Left'),
        Button({ variant: 'outline' }, 'Center'),
        Button({ variant: 'outline' }, 'Right')
      )
    ),

    DemoGroup('Dropdown',
      DemoRow(
        Dropdown({
          trigger: () => Button({ variant: 'outline' }, 'Actions'),
          items: [
            { label: 'Edit', onclick: () => {} },
            { label: 'Duplicate', onclick: () => {} },
            { separator: true },
            { label: 'Delete', onclick: () => {} }
          ]
        }),
        Dropdown({
          trigger: () => Button({ variant: 'primary' }, 'With shortcuts'),
          items: [
            { label: 'Cut', shortcut: '⌘X', onclick: () => {} },
            { label: 'Copy', shortcut: '⌘C', onclick: () => {} },
            { label: 'Paste', shortcut: '⌘V', onclick: () => {} },
            { separator: true },
            { label: 'Disabled item', disabled: true }
          ]
        }),
        Dropdown({
          trigger: () => Button({ variant: 'outline' }, 'Right aligned'),
          align: 'right',
          items: [
            { label: 'Profile', onclick: () => {} },
            { label: 'Settings', onclick: () => {} },
            { separator: true },
            { label: 'Sign out', onclick: () => {} }
          ]
        })
      )
    ),

    DemoGroup('Spinner — Sizes',
      DemoRow(
        Spinner({ size: 'xs' }),
        span({ class: css('_t12 _fg4') }, 'xs'),
        Spinner({ size: 'sm' }),
        span({ class: css('_t12 _fg4') }, 'sm'),
        Spinner({}),
        span({ class: css('_t12 _fg4') }, 'default'),
        Spinner({ size: 'lg' }),
        span({ class: css('_t12 _fg4') }, 'lg')
      )
    )
  );
}
