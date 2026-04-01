/**
 * Static manifest of @decantr/ui component APIs.
 *
 * This is a hand-curated (but auto-generatable) registry of component props,
 * usage examples, and metadata. The MCP server uses this to answer
 * "what props does Button accept?" without importing @decantr/ui at runtime.
 *
 * IMPORTANT: Keep this in sync with the actual component source files in
 * packages/ui/src/components/ and packages/ui/src/compose/.
 */

export interface ComponentManifestEntry {
  name: string;
  category: string;
  description: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: string;
    description: string;
  }>;
  usage: string;
  subComponents?: string[];
  relatedComponents?: string[];
}

export const COMPONENT_MANIFEST: Record<string, ComponentManifestEntry> = {
  // ─── Original Components ───────────────────────────────────────

  Button: {
    name: 'Button',
    category: 'original',
    description: 'Primary action button with variants, sizes, loading state, and icon support.',
    props: [
      { name: 'variant', type: "'default' | 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'success' | 'warning' | 'outline' | 'ghost' | 'link'", required: false, default: "'default'", description: 'Visual style variant.' },
      { name: 'size', type: "'xs' | 'sm' | 'default' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'", required: false, default: "'default'", description: 'Button size.' },
      { name: 'disabled', type: 'boolean | (() => boolean)', required: false, description: 'Disable the button. Accepts a signal for reactive state.' },
      { name: 'loading', type: 'boolean | (() => boolean)', required: false, description: 'Show loading spinner overlay and disable the button.' },
      { name: 'block', type: 'boolean', required: false, description: 'Full-width button (display: block).' },
      { name: 'rounded', type: 'boolean', required: false, description: 'Fully rounded pill shape.' },
      { name: 'iconLeft', type: 'string | Node', required: false, description: 'Leading icon. String = icon name, Node = custom element.' },
      { name: 'iconRight', type: 'string | Node', required: false, description: 'Trailing icon. String = icon name, Node = custom element.' },
      { name: 'onclick', type: '(e: MouseEvent) => void', required: false, description: 'Click handler.' },
      { name: 'type', type: "'button' | 'submit' | 'reset'", required: false, default: "'button'", description: 'HTML button type attribute.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Button } from '@decantr/ui';

// Basic
Button({ variant: 'primary' }, 'Save')

// With icons
Button({ variant: 'outline', iconLeft: 'plus' }, 'Add Item')

// Loading state (reactive)
const [loading, setLoading] = createSignal(false);
Button({ variant: 'primary', loading, onclick: () => setLoading(true) }, 'Submit')

// Button group
Button.Group({},
  Button({ variant: 'outline' }, 'Left'),
  Button({ variant: 'outline' }, 'Center'),
  Button({ variant: 'outline' }, 'Right'),
)`,
    subComponents: ['Button.Group'],
    relatedComponents: ['Spinner', 'Dropdown'],
  },

  Card: {
    name: 'Card',
    category: 'original',
    description: 'Container with optional title, header, footer, cover image, actions, and loading skeleton.',
    props: [
      { name: 'title', type: 'string | Node', required: false, description: 'Card title — auto-creates a Card.Header.' },
      { name: 'extra', type: 'Node | Function', required: false, description: 'Top-right header content (e.g., action link).' },
      { name: 'hoverable', type: 'boolean', required: false, description: 'Add hover elevation effect.' },
      { name: 'bordered', type: 'boolean', required: false, default: 'true', description: 'Show border. Set false for borderless.' },
      { name: 'loading', type: 'boolean | (() => boolean)', required: false, description: 'Show skeleton loading placeholder.' },
      { name: 'size', type: "'default' | 'sm'", required: false, default: "'default'", description: 'Card size variant.' },
      { name: 'type', type: "'inner'", required: false, description: 'Inner card variant for nesting.' },
      { name: 'cover', type: 'Node', required: false, description: 'Cover image shorthand — wraps in Card.Cover.' },
      { name: 'actions', type: 'Node[]', required: false, description: 'Bottom action bar items — wraps in Card.Actions.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Card } from '@decantr/ui';

// Simple card
Card({ title: 'My Card' }, 'Card content here.')

// With shorthand props
Card({
  title: 'Product',
  extra: Button({ variant: 'link' }, 'Edit'),
  cover: h('img', { src: '/photo.jpg', alt: 'Product' }),
  actions: [Button({}, 'Buy'), Button({ variant: 'ghost' }, 'Share')],
}, 'Description text.')

// Compound (explicit sections)
Card({ hoverable: true },
  Card.Header({}, 'Custom Header'),
  Card.Body({}, 'Body content'),
  Card.Meta({ avatar: Avatar({ src: '/me.jpg' }), title: 'Name', description: 'Role' }),
  Card.Footer({}, 'Footer'),
)`,
    subComponents: ['Card.Header', 'Card.Body', 'Card.Footer', 'Card.Cover', 'Card.Meta', 'Card.Grid', 'Card.Actions'],
    relatedComponents: ['Skeleton', 'Avatar'],
  },

  Modal: {
    name: 'Modal',
    category: 'original',
    description: 'Dialog overlay with focus trap, backdrop click-to-close, and animated open/close transitions.',
    props: [
      { name: 'title', type: 'string', required: false, description: 'Modal title — auto-creates header with close button.' },
      { name: 'footer', type: 'Node | Node[]', required: false, description: 'Footer content (e.g., action buttons).' },
      { name: 'visible', type: '() => boolean', required: true, description: 'Signal getter controlling visibility. MUST be a signal function.' },
      { name: 'onClose', type: '() => void', required: false, description: 'Called when modal is closed (via close button, backdrop, or Escape).' },
      { name: 'width', type: 'string', required: false, default: "'480px'", description: 'CSS width of the modal panel.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Modal, Button } from '@decantr/ui';
import { createSignal } from '@decantr/ui/state';

const [open, setOpen] = createSignal(false);

Button({ onclick: () => setOpen(true) }, 'Open Modal')

Modal({
  title: 'Confirm Action',
  visible: open,
  onClose: () => setOpen(false),
  footer: [
    Button({ variant: 'ghost', onclick: () => setOpen(false) }, 'Cancel'),
    Button({ variant: 'primary', onclick: handleConfirm }, 'Confirm'),
  ],
}, 'Are you sure you want to proceed?')`,
    subComponents: ['Modal.Header', 'Modal.Body', 'Modal.Footer'],
    relatedComponents: ['Drawer', 'AlertDialog', 'Button'],
  },

  Tabs: {
    name: 'Tabs',
    category: 'original',
    description: 'Tabbed interface with roving tabindex keyboard navigation and sliding indicator.',
    props: [
      { name: 'tabs', type: "Array<{ id: string, label: string, content?: () => Node, disabled?: boolean, closable?: boolean }>", required: true, description: 'Tab definitions. content is a render function called lazily.' },
      { name: 'active', type: 'string | (() => string)', required: false, description: 'Active tab ID. Use a signal for controlled mode.' },
      { name: 'onchange', type: '(tabId: string) => void', required: false, description: 'Called when active tab changes.' },
      { name: 'onclose', type: '(tabId: string) => void', required: false, description: 'Called when a closable tab is closed.' },
      { name: 'orientation', type: "'horizontal' | 'vertical'", required: false, default: "'horizontal'", description: 'Tab list orientation.' },
      { name: 'size', type: "'sm' | 'lg'", required: false, description: 'Tab size.' },
      { name: 'disabled', type: 'boolean | (() => boolean)', required: false, description: 'Disable all tabs.' },
      { name: 'destroyInactive', type: 'boolean', required: false, default: 'true', description: 'When false, all panels stay in DOM (hidden). When true, only active panel is rendered.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Tabs } from '@decantr/ui';

Tabs({
  tabs: [
    { id: 'overview', label: 'Overview', content: () => h('div', {}, 'Overview content') },
    { id: 'details', label: 'Details', content: () => h('div', {}, 'Details content') },
    { id: 'settings', label: 'Settings', content: () => h('div', {}, 'Settings content') },
  ],
  active: 'overview',
  onchange: (id) => console.log('Tab changed:', id),
})`,
    relatedComponents: ['Accordion', 'Segmented'],
  },

  Table: {
    name: 'Table',
    category: 'original',
    description: 'Simple static data table. For sorting, pagination, and selection, use DataTable instead.',
    props: [
      { name: 'columns', type: "Array<{ key: string, label: string, width?: string, render?: (value, row) => Node | string }>", required: true, description: 'Column definitions.' },
      { name: 'data', type: 'Object[]', required: true, description: 'Row data array.' },
      { name: 'striped', type: 'boolean', required: false, description: 'Striped row backgrounds.' },
      { name: 'hoverable', type: 'boolean', required: false, description: 'Row hover highlight.' },
      { name: 'compact', type: 'boolean', required: false, description: 'Compact row padding.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Table } from '@decantr/ui';

Table({
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (val) => Badge({ variant: 'info' }, val) },
  ],
  data: [
    { name: 'Alice', email: 'alice@example.com', role: 'Admin' },
    { name: 'Bob', email: 'bob@example.com', role: 'User' },
  ],
  striped: true,
  hoverable: true,
})`,
    relatedComponents: ['DataTable', 'Pagination'],
  },

  Input: {
    name: 'Input',
    category: 'original',
    description: 'Text input with prefix/suffix slots, validation states, reactive value, and built-in form field wrapping.',
    props: [
      { name: 'type', type: 'string', required: false, default: "'text'", description: 'HTML input type (text, password, email, etc.).' },
      { name: 'placeholder', type: 'string', required: false, description: 'Placeholder text.' },
      { name: 'value', type: 'string | (() => string)', required: false, description: 'Input value. Use a signal for two-way binding.' },
      { name: 'disabled', type: 'boolean | (() => boolean)', required: false, description: 'Disable the input.' },
      { name: 'readonly', type: 'boolean | (() => boolean)', required: false, description: 'Make input read-only.' },
      { name: 'prefix', type: 'string | Node', required: false, description: 'Leading content inside the input (e.g., icon, "$").' },
      { name: 'suffix', type: 'string | Node', required: false, description: 'Trailing content inside the input (e.g., icon, unit).' },
      { name: 'error', type: 'boolean | string | (() => boolean | string)', required: false, description: 'Error state. String shows as message.' },
      { name: 'success', type: 'boolean | string | (() => boolean | string)', required: false, description: 'Success state.' },
      { name: 'loading', type: 'boolean | (() => boolean)', required: false, description: 'Loading indicator.' },
      { name: 'variant', type: "'outlined' | 'filled' | 'ghost'", required: false, default: "'outlined'", description: 'Visual style variant.' },
      { name: 'size', type: "'xs' | 'sm' | 'lg'", required: false, description: 'Input size.' },
      { name: 'label', type: 'string', required: false, description: 'Form field label. When set, auto-wraps in a form field.' },
      { name: 'help', type: 'string', required: false, description: 'Help text below the input.' },
      { name: 'required', type: 'boolean', required: false, description: 'Mark as required (adds aria-required).' },
      { name: 'oninput', type: '(e: Event) => void', required: false, description: 'Fires on every keystroke.' },
      { name: 'onchange', type: '(value: string) => void', required: false, description: 'Fires on blur/commit.' },
      { name: 'ref', type: '(el: HTMLInputElement) => void', required: false, description: 'Callback with the raw input element.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Input } from '@decantr/ui';
import { createSignal } from '@decantr/ui/state';

// Simple
Input({ placeholder: 'Enter your name' })

// With label and validation
const [email, setEmail] = createSignal('');
Input({
  type: 'email',
  label: 'Email Address',
  placeholder: 'you@example.com',
  value: email,
  oninput: (e) => setEmail(e.target.value),
  error: () => email() && !email().includes('@') ? 'Invalid email' : false,
  help: 'We will never share your email.',
  required: true,
})

// With prefix/suffix
Input({ prefix: '$', suffix: '.00', placeholder: '0' })`,
    relatedComponents: ['Textarea', 'Select', 'InputNumber', 'InputGroup', 'Form'],
  },

  Textarea: {
    name: 'Textarea',
    category: 'original',
    description: 'Multi-line text input with resizing, validation states, and form field wrapping.',
    props: [
      { name: 'placeholder', type: 'string', required: false, description: 'Placeholder text.' },
      { name: 'value', type: 'string | (() => string)', required: false, description: 'Textarea value. Signal for reactive binding.' },
      { name: 'disabled', type: 'boolean | (() => boolean)', required: false, description: 'Disable the textarea.' },
      { name: 'readonly', type: 'boolean | (() => boolean)', required: false, description: 'Make read-only.' },
      { name: 'error', type: 'boolean | string | (() => boolean | string)', required: false, description: 'Error state.' },
      { name: 'success', type: 'boolean | string | (() => boolean | string)', required: false, description: 'Success state.' },
      { name: 'variant', type: "'outlined' | 'filled' | 'ghost'", required: false, default: "'outlined'", description: 'Visual style.' },
      { name: 'size', type: "'xs' | 'sm' | 'lg'", required: false, description: 'Textarea size.' },
      { name: 'rows', type: 'number', required: false, default: '3', description: 'Visible rows.' },
      { name: 'resize', type: "'none' | 'vertical' | 'horizontal' | 'both'", required: false, default: "'vertical'", description: 'Resize behavior.' },
      { name: 'label', type: 'string', required: false, description: 'Form field label.' },
      { name: 'help', type: 'string', required: false, description: 'Help text below.' },
      { name: 'required', type: 'boolean', required: false, description: 'Mark as required.' },
      { name: 'oninput', type: '(e: Event) => void', required: false, description: 'Input handler.' },
      { name: 'ref', type: '(el: HTMLTextAreaElement) => void', required: false, description: 'Callback with the raw textarea element.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Textarea } from '@decantr/ui';

Textarea({
  label: 'Description',
  placeholder: 'Tell us about your project...',
  rows: 5,
  help: 'Markdown supported.',
})`,
    relatedComponents: ['Input', 'Form'],
  },

  Select: {
    name: 'Select',
    category: 'original',
    description: 'Custom dropdown select with keyboard navigation, search, and form field support.',
    props: [
      { name: 'options', type: "Array<{ value: string, label: string, disabled?: boolean }>", required: true, description: 'Option list.' },
      { name: 'value', type: 'string | (() => string)', required: false, description: 'Selected value. Signal for controlled mode.' },
      { name: 'placeholder', type: 'string', required: false, description: 'Placeholder text when no value selected.' },
      { name: 'disabled', type: 'boolean | (() => boolean)', required: false, description: 'Disable the select.' },
      { name: 'error', type: 'boolean | string | (() => boolean | string)', required: false, description: 'Error state.' },
      { name: 'success', type: 'boolean | string | (() => boolean | string)', required: false, description: 'Success state.' },
      { name: 'variant', type: "'outlined' | 'filled' | 'ghost'", required: false, default: "'outlined'", description: 'Visual style.' },
      { name: 'size', type: "'xs' | 'sm' | 'lg'", required: false, description: 'Select size.' },
      { name: 'label', type: 'string', required: false, description: 'Form field label.' },
      { name: 'help', type: 'string', required: false, description: 'Help text.' },
      { name: 'required', type: 'boolean', required: false, description: 'Mark as required.' },
      { name: 'onchange', type: '(value: string) => void', required: false, description: 'Called when selection changes.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Select } from '@decantr/ui';

Select({
  label: 'Country',
  placeholder: 'Choose a country',
  options: [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'de', label: 'Germany', disabled: true },
  ],
  onchange: (val) => console.log('Selected:', val),
})`,
    relatedComponents: ['Combobox', 'Cascader', 'TreeSelect', 'Input'],
  },

  Checkbox: {
    name: 'Checkbox',
    category: 'original',
    description: 'Checkbox input with label, indeterminate state, and validation support.',
    props: [
      { name: 'checked', type: 'boolean | (() => boolean)', required: false, description: 'Checked state. Signal for reactive binding.' },
      { name: 'disabled', type: 'boolean | (() => boolean)', required: false, description: 'Disable the checkbox.' },
      { name: 'label', type: 'string', required: false, description: 'Label text next to the checkbox.' },
      { name: 'indeterminate', type: 'boolean', required: false, description: 'Indeterminate (dash) state for "select all" patterns.' },
      { name: 'error', type: 'boolean | string | (() => boolean | string)', required: false, description: 'Error state.' },
      { name: 'success', type: 'boolean | string | (() => boolean | string)', required: false, description: 'Success state.' },
      { name: 'help', type: 'string', required: false, description: 'Help text (wraps in form field).' },
      { name: 'required', type: 'boolean', required: false, description: 'Mark as required.' },
      { name: 'size', type: "'xs' | 'sm' | 'lg'", required: false, description: 'Checkbox size.' },
      { name: 'onchange', type: '(checked: boolean) => void', required: false, description: 'Called when checked state changes.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Checkbox } from '@decantr/ui';
import { createSignal } from '@decantr/ui/state';

const [agreed, setAgreed] = createSignal(false);

Checkbox({
  checked: agreed,
  onchange: setAgreed,
  label: 'I agree to the terms and conditions',
  required: true,
})`,
    relatedComponents: ['Switch', 'RadioGroup', 'Form'],
  },

  Switch: {
    name: 'Switch',
    category: 'original',
    description: 'Toggle switch with accessible role="switch" and ARIA attributes.',
    props: [
      { name: 'checked', type: 'boolean | (() => boolean)', required: false, description: 'On/off state. Signal for reactive binding.' },
      { name: 'disabled', type: 'boolean | (() => boolean)', required: false, description: 'Disable the switch.' },
      { name: 'label', type: 'string', required: false, description: 'Label text.' },
      { name: 'error', type: 'boolean | string | (() => boolean | string)', required: false, description: 'Error state.' },
      { name: 'size', type: "'xs' | 'sm' | 'lg'", required: false, description: 'Switch size.' },
      { name: 'name', type: 'string', required: false, description: 'Form field name.' },
      { name: 'required', type: 'boolean', required: false, description: 'Mark as required.' },
      { name: 'onchange', type: '(checked: boolean) => void', required: false, description: 'Called when toggled.' },
      { name: 'ref', type: '(el: HTMLInputElement) => void', required: false, description: 'Callback with the raw input element.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Switch } from '@decantr/ui';
import { createSignal } from '@decantr/ui/state';

const [dark, setDark] = createSignal(false);

Switch({
  checked: dark,
  onchange: setDark,
  label: 'Dark mode',
})`,
    relatedComponents: ['Checkbox', 'Toggle'],
  },

  Badge: {
    name: 'Badge',
    category: 'original',
    description: 'Status indicator pill, dot indicator, or superscript count badge.',
    props: [
      { name: 'count', type: 'number | (() => number)', required: false, description: 'Numeric count to display.' },
      { name: 'color', type: 'string', required: false, description: 'CSS color override.' },
      { name: 'dot', type: 'boolean', required: false, description: 'Show as dot instead of pill.' },
      { name: 'status', type: "'success' | 'error' | 'warning' | 'info' | 'processing' | 'primary'", required: false, description: 'Semantic status color.' },
      { name: 'variant', type: 'string', required: false, description: 'Alias for status.' },
      { name: 'solid', type: 'boolean', required: false, description: 'Use saturated/solid colors instead of subtle.' },
      { name: 'icon', type: 'string | Node', required: false, description: 'Leading icon.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Badge } from '@decantr/ui';

// Label badge
Badge({ variant: 'success' }, 'Active')

// Count superscript on another element
Badge({ count: 5 }, icon('bell', { size: '1.5em' }))

// Status dot
Badge({ dot: true, status: 'processing' })`,
    relatedComponents: ['Chip', 'Tag', 'Alert'],
  },

  Alert: {
    name: 'Alert',
    category: 'original',
    description: 'Inline alert banner with icon, dismissible option, and semantic variants.',
    props: [
      { name: 'variant', type: "'info' | 'success' | 'warning' | 'error'", required: false, default: "'info'", description: 'Semantic variant.' },
      { name: 'dismissible', type: 'boolean', required: false, description: 'Show close button. Removes from DOM on dismiss.' },
      { name: 'onDismiss', type: '() => void', required: false, description: 'Called when dismissed.' },
      { name: 'icon', type: 'string | Node', required: false, description: 'Leading icon.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Alert } from '@decantr/ui';

Alert({ variant: 'warning', dismissible: true },
  'Your session will expire in 5 minutes.'
)

Alert({ variant: 'error', icon: 'alert-circle' },
  'Failed to save changes. Please try again.'
)`,
    relatedComponents: ['AlertDialog', 'Banner', 'notification', 'message'],
  },

  Accordion: {
    name: 'Accordion',
    category: 'original',
    description: 'Collapsible content panels with animated open/close, keyboard navigation, and single/multiple mode.',
    props: [
      { name: 'items', type: "Array<{ id: string, title: string, content: (() => Node) | string, disabled?: boolean }>", required: true, description: 'Accordion item definitions. content is lazy-rendered.' },
      { name: 'multiple', type: 'boolean', required: false, default: 'false', description: 'Allow multiple panels open simultaneously.' },
      { name: 'collapsible', type: 'boolean', required: false, default: 'true', description: 'Allow collapsing the last open panel (single mode).' },
      { name: 'defaultOpen', type: 'string[]', required: false, description: 'Array of item IDs to open initially.' },
      { name: 'disabled', type: 'boolean | (() => boolean)', required: false, description: 'Disable all items or per-item via callback.' },
      { name: 'onValueChange', type: '(openIds: string[]) => void', required: false, description: 'Called when open panels change.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Accordion } from '@decantr/ui';

Accordion({
  items: [
    { id: 'faq1', title: 'What is Decantr?', content: () => h('p', {}, 'A Design Intelligence API.') },
    { id: 'faq2', title: 'How does it work?', content: () => h('p', {}, 'Through the Design Pipeline.') },
    { id: 'faq3', title: 'Is it free?', content: 'Community tier is free.' },
  ],
  defaultOpen: ['faq1'],
})`,
    relatedComponents: ['Collapsible', 'Tabs'],
  },

  Dropdown: {
    name: 'Dropdown',
    category: 'original',
    description: 'Menu triggered by a button with keyboard navigation, separators, icons, and shortcuts.',
    props: [
      { name: 'trigger', type: '() => HTMLElement', required: false, description: 'Function returning the trigger element. Defaults to a "Menu" button.' },
      { name: 'items', type: "Array<{ label: string, value?: string, icon?: string | Node, shortcut?: string, disabled?: boolean, separator?: boolean, onclick?: () => void }>", required: true, description: 'Menu items. Set separator: true for dividers.' },
      { name: 'align', type: "'left' | 'right'", required: false, default: "'left'", description: 'Dropdown alignment.' },
      { name: 'block', type: 'boolean', required: false, description: 'Full-width trigger.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Dropdown, Button } from '@decantr/ui';

Dropdown({
  trigger: () => Button({ variant: 'outline', iconRight: 'chevron-down' }, 'Actions'),
  items: [
    { label: 'Edit', icon: 'pencil', onclick: handleEdit },
    { label: 'Duplicate', icon: 'copy', shortcut: 'Ctrl+D' },
    { separator: true },
    { label: 'Delete', icon: 'trash', onclick: handleDelete },
  ],
})`,
    relatedComponents: ['ContextMenu', 'Menu', 'Popover'],
  },

  Drawer: {
    name: 'Drawer',
    category: 'original',
    description: 'Slide-over panel from any edge with focus trap, animated transitions, and compound sections.',
    props: [
      { name: 'visible', type: '() => boolean', required: true, description: 'Signal getter controlling visibility. MUST be a signal function.' },
      { name: 'onClose', type: '() => void', required: false, description: 'Called when drawer is closed.' },
      { name: 'side', type: "'left' | 'right' | 'top' | 'bottom'", required: false, default: "'right'", description: 'Edge to slide from.' },
      { name: 'title', type: 'string', required: false, description: 'Drawer title — auto-creates header with close button.' },
      { name: 'footer', type: 'Node | Node[]', required: false, description: 'Footer content.' },
      { name: 'size', type: 'string', required: false, default: "'320px'", description: 'CSS width (left/right) or height (top/bottom).' },
      { name: 'closeOnOutside', type: 'boolean', required: false, default: 'true', description: 'Close when clicking outside the panel.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Drawer, Button } from '@decantr/ui';
import { createSignal } from '@decantr/ui/state';

const [open, setOpen] = createSignal(false);

Button({ onclick: () => setOpen(true) }, 'Open Drawer')

Drawer({
  title: 'Settings',
  visible: open,
  onClose: () => setOpen(false),
  side: 'right',
  size: '400px',
}, 'Drawer content here.')`,
    subComponents: ['Drawer.Header', 'Drawer.Body', 'Drawer.Footer'],
    relatedComponents: ['Modal', 'AlertDialog'],
  },

  Pagination: {
    name: 'Pagination',
    category: 'original',
    description: 'Page navigation with prev/next, page numbers, ellipsis, and reactive signals.',
    props: [
      { name: 'total', type: 'number | (() => number)', required: true, description: 'Total number of items.' },
      { name: 'perPage', type: 'number', required: false, default: '10', description: 'Items per page.' },
      { name: 'current', type: 'number | (() => number)', required: false, default: '1', description: 'Current page. Signal for controlled mode.' },
      { name: 'onchange', type: '(page: number) => void', required: false, description: 'Called when page changes.' },
      { name: 'siblings', type: 'number', required: false, default: '1', description: 'Number of page buttons shown around current page.' },
      { name: 'size', type: "'sm' | 'lg'", required: false, description: 'Pagination size.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Pagination } from '@decantr/ui';
import { createSignal } from '@decantr/ui/state';

const [page, setPage] = createSignal(1);

Pagination({
  total: 200,
  perPage: 10,
  current: page,
  onchange: setPage,
})`,
    relatedComponents: ['Table', 'DataTable'],
  },

  Tooltip: {
    name: 'Tooltip',
    category: 'original',
    description: 'Informational popup on hover or focus with configurable position and delay.',
    props: [
      { name: 'content', type: 'string', required: true, description: 'Tooltip text content.' },
      { name: 'position', type: "'top' | 'bottom' | 'left' | 'right'", required: false, default: "'top'", description: 'Tooltip position relative to the trigger.' },
      { name: 'delay', type: 'number', required: false, default: '200', description: 'Show delay in milliseconds.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Tooltip, Button } from '@decantr/ui';

Tooltip({ content: 'Save your changes', position: 'bottom' },
  Button({ variant: 'primary' }, 'Save')
)`,
    relatedComponents: ['Popover', 'HoverCard'],
  },

  Progress: {
    name: 'Progress',
    category: 'original',
    description: 'Progress bar with percentage, variants, striped/animated styles, and label support.',
    props: [
      { name: 'value', type: 'number | (() => number)', required: false, description: 'Current value (0 to max). Signal for reactive updates.' },
      { name: 'max', type: 'number', required: false, default: '100', description: 'Maximum value.' },
      { name: 'label', type: 'string', required: false, description: 'Label text (displayed inside bar for md/lg, outside for other sizes).' },
      { name: 'variant', type: "'primary' | 'success' | 'warning' | 'error'", required: false, description: 'Color variant.' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", required: false, description: 'Bar height.' },
      { name: 'striped', type: 'boolean', required: false, description: 'Add striped pattern.' },
      { name: 'animated', type: 'boolean', required: false, description: 'Animate the stripes.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Progress } from '@decantr/ui';
import { createSignal } from '@decantr/ui/state';

const [progress, setProgress] = createSignal(45);

Progress({
  value: progress,
  variant: 'primary',
  size: 'md',
  label: '45%',
  striped: true,
  animated: true,
})`,
    relatedComponents: ['Spinner', 'Statistic'],
  },

  Spinner: {
    name: 'Spinner',
    category: 'original',
    description: 'Loading indicator with multiple animation variants: ring, dots, pulse, bars, orbit.',
    props: [
      { name: 'variant', type: "'ring' | 'dots' | 'pulse' | 'bars' | 'orbit'", required: false, default: "'ring'", description: 'Animation style.' },
      { name: 'size', type: "'xs' | 'sm' | 'lg' | 'xl'", required: false, description: 'Spinner size.' },
      { name: 'color', type: "'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'muted'", required: false, description: 'Semantic color.' },
      { name: 'icon', type: 'string', required: false, description: 'Icon name for hybrid mode (ring spins around static center icon).' },
      { name: 'label', type: 'string', required: false, default: "'Loading'", description: 'Accessible label (screen reader text).' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { Spinner } from '@decantr/ui';

// Default ring spinner
Spinner({ size: 'lg', color: 'primary' })

// Dots variant
Spinner({ variant: 'dots', size: 'sm' })

// Hybrid: ring around an icon
Spinner({ icon: 'cloud', size: 'xl' })`,
    relatedComponents: ['Progress', 'Button'],
  },

  // ─── Data Display ──────────────────────────────────────────────

  DataTable: {
    name: 'DataTable',
    category: 'data-display',
    description: 'Enterprise data grid with sorting, pagination, multi-selection, column pinning, cell editing, row expansion, filtering, CSV export, virtual scrolling, and column resizing.',
    props: [
      { name: 'columns', type: "Array<{ key: string, label: string, width?: string, sortable?: boolean, filterable?: boolean, pinned?: 'left' | 'right', render?: (val, row) => Node, editable?: boolean, align?: 'left' | 'center' | 'right', sort?: (a, b) => number }>", required: true, description: 'Column definitions with sorting, filtering, pinning, and cell editing options.' },
      { name: 'data', type: 'Array<Object> | (() => Array<Object>)', required: true, description: 'Row data. Signal for reactive updates.' },
      { name: 'pagination', type: "{ pageSize?: number, serverSide?: boolean, total?: number | (() => number), onPageChange?: ({page, pageSize}) => void }", required: false, description: 'Enable pagination. Supports client-side and server-side modes.' },
      { name: 'selection', type: "'single' | 'multi' | 'none'", required: false, default: "'none'", description: 'Row selection mode.' },
      { name: 'onSelectionChange', type: '(selectedRows: Object[]) => void', required: false, description: 'Called when selection changes.' },
      { name: 'striped', type: 'boolean', required: false, default: 'false', description: 'Striped rows.' },
      { name: 'hoverable', type: 'boolean', required: false, default: 'true', description: 'Row hover highlight.' },
      { name: 'stickyHeader', type: 'boolean', required: false, default: 'false', description: 'Sticky table header on scroll.' },
      { name: 'onSort', type: '({ key: string, direction: "asc" | "desc" }) => void', required: false, description: 'Called when sort changes (for server-side sorting).' },
      { name: 'rowKey', type: '(row: Object, index: number) => string | number', required: false, description: 'Unique key extractor for each row. Defaults to index.' },
      { name: 'onCellEdit', type: '({ row, column, value, oldValue }) => void', required: false, description: 'Called when an editable cell is committed.' },
      { name: 'expandable', type: 'boolean', required: false, default: 'false', description: 'Enable row expansion.' },
      { name: 'expandRender', type: '(row: Object) => Node | string', required: false, description: 'Render function for expanded row content.' },
      { name: 'exportable', type: 'boolean', required: false, default: 'false', description: 'Show "Export CSV" button.' },
      { name: 'emptyText', type: 'string', required: false, default: "'No data'", description: 'Text shown when data is empty.' },
      { name: 'class', type: 'string', required: false, description: 'Additional CSS class.' },
    ],
    usage: `import { DataTable } from '@decantr/ui';

DataTable({
  columns: [
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', render: (val) => Badge({ variant: val === 'admin' ? 'primary' : 'info' }, val) },
    { key: 'status', label: 'Status', pinned: 'right' },
  ],
  data: users,
  pagination: { pageSize: 20 },
  selection: 'multi',
  onSelectionChange: (rows) => console.log('Selected:', rows),
  striped: true,
  stickyHeader: true,
  exportable: true,
})`,
    relatedComponents: ['Table', 'Pagination', 'Checkbox'],
  },

  // ─── Composition API ───────────────────────────────────────────

  compose: {
    name: 'compose',
    category: 'utility',
    description: 'Render a single pattern by ID using the current DNA context. Must be called inside an EssenceProvider.',
    props: [
      { name: 'patternId', type: 'string', required: true, description: 'Pattern ID from the registry (e.g., "hero", "data-table", "kpi-grid").' },
      { name: 'options.props', type: 'Record<string, unknown>', required: false, description: 'Props to pass to the pattern renderer.' },
      { name: 'options.preset', type: 'string', required: false, description: 'Preset name for the pattern.' },
      { name: 'options.slots', type: 'Record<string, () => HTMLElement>', required: false, description: 'Named slot render functions.' },
    ],
    usage: `import { compose } from '@decantr/ui/compose';

// Inside an EssenceProvider:
compose('hero', { props: { title: 'Welcome', subtitle: 'Get started' } })
compose('data-table', { preset: 'product', props: { data: products } })`,
    relatedComponents: ['composePage', 'EssenceProvider'],
  },

  composePage: {
    name: 'composePage',
    category: 'utility',
    description: 'Render a full page from the essence blueprint. Finds the page by ID, resolves each pattern in the layout, and wraps in a shell.',
    props: [
      { name: 'pageId', type: 'string', required: true, description: 'Page ID from the blueprint (e.g., "landing", "dashboard").' },
    ],
    usage: `import { composePage } from '@decantr/ui/compose';

// Inside an EssenceProvider:
composePage('landing')
composePage('dashboard')`,
    relatedComponents: ['compose', 'EssenceProvider', 'EssenceApp'],
  },

  EssenceProvider: {
    name: 'EssenceProvider',
    category: 'utility',
    description: 'Context provider that makes the Essence spec (DNA tokens, guard settings) available to all descendant components and compose() calls.',
    props: [
      { name: 'essence', type: 'EssenceV3', required: false, description: 'Full v3 essence spec object. If omitted, inherits from parent provider.' },
      { name: 'overrides', type: 'Partial<EssenceContextValue>', required: false, description: 'Partial DNA overrides (style, mode, shape, density, etc.) for nested providers.' },
    ],
    usage: `import { EssenceProvider } from '@decantr/ui/essence';
import essence from './decantr.essence.json';

EssenceProvider({ essence },
  composePage('landing'),
)

// Nested override:
EssenceProvider({ overrides: { mode: 'dark', density: 'compact' } },
  compose('sidebar'),
)`,
    relatedComponents: ['EssenceApp', 'compose', 'composePage'],
  },

  EssenceApp: {
    name: 'EssenceApp',
    category: 'utility',
    description: 'Top-level convenience component that wraps children in an EssenceProvider. Use as the root of your app.',
    props: [
      { name: 'essence', type: 'EssenceV3', required: true, description: 'Full v3 essence spec object.' },
    ],
    usage: `import { EssenceApp } from '@decantr/ui/compose';
import essence from './decantr.essence.json';

document.body.appendChild(
  EssenceApp({ essence },
    composePage('landing'),
  )
);`,
    relatedComponents: ['EssenceProvider', 'compose', 'composePage'],
  },
};

/** All unique category names in the manifest. */
export const CATEGORIES = [...new Set(Object.values(COMPONENT_MANIFEST).map(c => c.category))];

/** Get components filtered by category. */
export function getComponentsByCategory(category?: string): Record<string, ComponentManifestEntry[]> {
  const entries = Object.values(COMPONENT_MANIFEST);
  const filtered = category && category !== 'all'
    ? entries.filter(c => c.category === category)
    : entries;

  const grouped: Record<string, ComponentManifestEntry[]> = {};
  for (const entry of filtered) {
    if (!grouped[entry.category]) grouped[entry.category] = [];
    grouped[entry.category].push(entry);
  }
  return grouped;
}
