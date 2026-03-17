# 03 — Using Components

Decantr ships 100+ UI components. Every component is a function that accepts a props object and returns an `HTMLElement`.

## Importing Components

```js
import { Button, Input, Card, Modal, Tabs, Select, Badge, Avatar, Alert } from 'decantr/components';
```

## Component Signatures

All components follow the same pattern:

```js
ComponentName(props, ...children)
```

- **props** — An object of typed properties (variant, size, disabled, etc.)
- **children** — Optional child elements or strings

## Button

The most common component. Supports variants, sizes, loading state, and click handlers:

```js
import { Button } from 'decantr/components';

// Basic
Button({ variant: 'primary' }, 'Save')

// Variants
Button({ variant: 'primary' }, 'Primary')
Button({ variant: 'outline' }, 'Outline')
Button({ variant: 'ghost' }, 'Ghost')
Button({ variant: 'destructive' }, 'Delete')
Button({ variant: 'link' }, 'Link')

// Sizes
Button({ size: 'sm' }, 'Small')
Button({ size: 'md' }, 'Medium')   // default
Button({ size: 'lg' }, 'Large')

// With click handler
Button({ variant: 'primary', onclick: () => console.log('clicked') }, 'Click Me')

// Loading state
Button({ variant: 'primary', loading: true }, 'Saving...')

// Disabled
Button({ variant: 'primary', disabled: true }, 'Disabled')
```

## Input

Text input with label, placeholder, and change events:

```js
import { Input } from 'decantr/components';

Input({ label: 'Email', type: 'email', placeholder: 'you@example.com' })

Input({ label: 'Password', type: 'password' })

// With change handler
Input({
  label: 'Search',
  placeholder: 'Type to search...',
  oninput: (e) => console.log(e.target.value)
})
```

## Card

A container with optional header, body, footer, and sub-components:

```js
import { Card } from 'decantr/components';
import { tags } from 'decantr/tags';
import { css } from 'decantr/css';

const { h3, p } = tags;

Card({},
  Card.Header({},
    h3({ class: css('_heading5') }, 'Card Title'),
    p({ class: css('_fgmuted _textsm') }, 'A brief description')
  ),
  Card.Body({ class: css('_flex _col _gap3') },
    p('Card content goes here. This is the main body of the card.')
  ),
  Card.Footer({ class: css('_flex _jce _gap2') },
    Button({ variant: 'outline' }, 'Cancel'),
    Button({ variant: 'primary' }, 'Confirm')
  )
)
```

### Card Sub-Components

| Sub-Component | Purpose |
|---------------|---------|
| `Card.Header` | Top section with title and optional `extra` slot |
| `Card.Body` | Main content area |
| `Card.Footer` | Bottom section, typically for actions |
| `Card.Cover` | Full-width image cover |
| `Card.Meta` | Avatar + title + description row |
| `Card.Actions` | Action button group |

## Select

Dropdown selection from a list of options:

```js
import { Select } from 'decantr/components';

Select({
  label: 'Country',
  placeholder: 'Select a country',
  options: [
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' },
    { label: 'United Kingdom', value: 'uk' },
  ],
  onchange: (val) => console.log('Selected:', val)
})
```

## Tabs

Tabbed content sections:

```js
import { Tabs } from 'decantr/components';

Tabs({
  items: [
    { label: 'Overview', content: () => div({}, p('Overview content here')) },
    { label: 'Settings', content: () => div({}, p('Settings panel')) },
    { label: 'Activity', content: () => div({}, p('Activity log')) },
  ]
})
```

## DataTable

A data grid with sorting, pagination, and custom cell rendering:

```js
import { DataTable } from 'decantr/components';

DataTable({
  columns: [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', render: (val) => Badge({ variant: val === 'active' ? 'success' : 'default' }, val) },
  ],
  data: [
    { name: 'Alice', email: 'alice@example.com', role: 'Admin', status: 'active' },
    { name: 'Bob', email: 'bob@example.com', role: 'User', status: 'inactive' },
  ],
  sortable: true,
  paginate: true,
  pageSize: 10
})
```

## Other Common Components

```js
// Badge — status labels
Badge({ variant: 'success' }, 'Active')
Badge({ variant: 'warning' }, 'Pending')
Badge({ variant: 'error' }, 'Failed')

// Avatar — user profile image or initials
Avatar({ src: '/avatar.jpg', name: 'Alice', size: 'md' })

// Alert — informational messages
Alert({ variant: 'info' }, 'Your account has been updated.')
Alert({ variant: 'error' }, 'Something went wrong.')

// Breadcrumb — navigation path
Breadcrumb({ items: [
  { label: 'Home', href: '#/' },
  { label: 'Products', href: '#/products' },
  { label: 'Details' },
]})

// Pagination — page navigation
Pagination({ current: 1, total: 50, onChange: (page) => console.log(page) })

// Progress — progress bar
Progress({ value: 65 })

// Skeleton — loading placeholder
Skeleton({ width: '100%', height: '200px' })

// Statistic — metric display
Statistic({ label: 'Revenue', value: 48250, prefix: '$', trend: 'up', trendValue: '+12%' })

// Separator — horizontal divider
Separator()
```

## Nesting Components in a Layout

Combine tag functions and components to build a complete page:

```js
import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { Button, Card, Input, Badge, Avatar, Statistic } from 'decantr/components';

const { div, h1, h2, p, span } = tags;

export default function DashboardPage() {
  return div({ class: css('_flex _col _gap6 _p6') },

    // Page header
    div({ class: css('_flex _aic _jcsb') },
      h1({ class: css('_heading3') }, 'Dashboard'),
      Button({ variant: 'primary' }, 'New Report')
    ),

    // KPI row
    div({ class: css('_grid _gc4 _gap4') },
      Statistic({ label: 'Users', value: 12400, trend: 'up', trendValue: '+8%' }),
      Statistic({ label: 'Revenue', value: 84200, prefix: '$', trend: 'up', trendValue: '+15%' }),
      Statistic({ label: 'Orders', value: 3420, trend: 'down', trendValue: '-3%' }),
      Statistic({ label: 'Conversion', value: 2.8, suffix: '%' })
    ),

    // Content card
    Card({},
      Card.Header({},
        h2({ class: css('_heading5') }, 'Recent Activity')
      ),
      Card.Body({},
        div({ class: css('_flex _col _gap3') },
          div({ class: css('_flex _aic _gap3') },
            Avatar({ name: 'Alice', size: 'sm' }),
            span('Alice created a new report'),
            Badge({ variant: 'success' }, 'New')
          ),
          div({ class: css('_flex _aic _gap3') },
            Avatar({ name: 'Bob', size: 'sm' }),
            span('Bob updated the settings'),
            Badge({ variant: 'default' }, 'Update')
          )
        )
      )
    )
  );
}
```

## What's Next

Components are static so far. In the next section, you will learn how to style your app with themes and modes.

---

Previous: [02 — First Page](./02-first-page.md) | Next: [04 — Styling](./04-styling.md)
