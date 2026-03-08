import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Card, Badge, Table, Avatar, Progress, Skeleton, Chip, Button } from 'decantr/components';

const { div, section, h2, h3, p, span } = tags;

function DemoGroup(label, ...children) {
  return div({ class: css('_flex _col _gap3') },
    h3({ class: css('_t12 _bold _fg4'), style: 'text-transform:uppercase;letter-spacing:0.05em' }, label),
    ...children
  );
}

function DemoRow(...children) {
  return div({ class: css('_flex _gap3 _wrap _aic') }, ...children);
}

export function DisplaySection() {
  return section({ id: 'display', class: css('_flex _col _gap8') },
    h2({ class: css('_t24 _bold _mb2') }, 'Display Components'),

    DemoGroup('Card',
      div({ class: css('_grid _gc2 _gap4') },
        Card({},
          Card.Header({}, span({ class: css('_bold') }, 'Card Title')),
          Card.Body({},
            p({ class: css('_fg4 _textbase') }, 'Card body content with Header, Body, and Footer composition.')
          ),
          Card.Footer({},
            Button({ size: 'sm' }, 'Action')
          )
        ),
        Card({ title: 'Hoverable Card', hoverable: true },
          p({ class: css('_fg4 _textbase') }, 'This card has a hover effect. Move your cursor over it.')
        ),
        Card({},
          Card.Body({},
            p({ class: css('_fg4 _textbase') }, 'Simple card with body only, no header or footer.')
          )
        ),
        Card({ title: 'With Title Prop' },
          p({ class: css('_fg4 _textbase') }, 'Using the title shorthand prop instead of Card.Header.')
        )
      )
    ),

    DemoGroup('Badge',
      DemoRow(
        Badge({ status: 'success' }, span({}, 'Active')),
        Badge({ status: 'error' }, span({}, 'Error')),
        Badge({ status: 'warning' }, span({}, 'Warning')),
        Badge({ status: 'processing' }, span({}, 'Processing')),
        Badge({ count: 5 }, Button({}, 'Inbox')),
        Badge({ dot: true, status: 'success' }, span({}, 'Online'))
      )
    ),

    DemoGroup('Table',
      Table({
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'role', label: 'Role' },
          { key: 'status', label: 'Status' }
        ],
        data: [
          { name: 'Alice', role: 'Engineer', status: 'Active' },
          { name: 'Bob', role: 'Designer', status: 'Away' },
          { name: 'Carol', role: 'Manager', status: 'Active' },
          { name: 'Dave', role: 'DevOps', status: 'Offline' }
        ],
        striped: true,
        hoverable: true
      })
    ),

    DemoGroup('Avatar',
      DemoRow(
        Avatar({ size: 'sm', fallback: 'SM' }),
        Avatar({ fallback: 'MD' }),
        Avatar({ size: 'lg', fallback: 'LG' })
      )
    ),

    DemoGroup('Progress',
      div({ class: css('_flex _col _gap3'), style: 'max-width:400px' },
        Progress({ value: 25, label: '25%' }),
        Progress({ value: 60, variant: 'success', label: '60% success' }),
        Progress({ value: 45, variant: 'warning', label: '45% warning' }),
        Progress({ value: 80, variant: 'error', label: '80% error' }),
        Progress({ value: 70, striped: true, label: '70% striped' })
      )
    ),

    DemoGroup('Skeleton',
      div({ class: css('_flex _col _gap3'), style: 'max-width:300px' },
        Skeleton({ variant: 'text', lines: 3 }),
        DemoRow(
          Skeleton({ variant: 'circle', width: '48px', height: '48px' }),
          div({ class: css('_flex _col _gap2 _grow') },
            Skeleton({ variant: 'text' }),
            Skeleton({ variant: 'text', width: '60%' })
          )
        ),
        Skeleton({ variant: 'rect', height: '120px' })
      )
    ),

    DemoGroup('Chip',
      DemoRow(
        Chip({ label: 'Default' }),
        Chip({ label: 'Outline', variant: 'outline' }),
        Chip({ label: 'Filled', variant: 'filled' }),
        Chip({ label: 'Selected', selected: true }),
        Chip({ label: 'Removable', removable: true, onRemove: () => {} }),
        Chip({ label: 'Small', size: 'sm' }),
        Chip({ label: 'Clickable', onClick: () => {} })
      )
    )
  );
}
