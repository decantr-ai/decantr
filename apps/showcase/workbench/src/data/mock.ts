// ── Component tree items ──

export interface ComponentItem {
  id: string;
  name: string;
  category: 'primitives' | 'composites' | 'patterns' | 'layouts';
  status: 'stable' | 'beta' | 'experimental' | 'deprecated';
  version: string;
  props: number;
  variants: number;
  updatedAt: string;
  description: string;
}

export const components: ComponentItem[] = [
  {
    id: 'btn-01',
    name: 'Button',
    category: 'primitives',
    status: 'stable',
    version: '3.2.0',
    props: 12,
    variants: 5,
    updatedAt: '2 hours ago',
    description: 'Primary interactive element with multiple variants, sizes, and icon support.',
  },
  {
    id: 'inp-01',
    name: 'Input',
    category: 'primitives',
    status: 'stable',
    version: '3.1.0',
    props: 18,
    variants: 4,
    updatedAt: '1 day ago',
    description: 'Text input with label, validation states, prefix/suffix slots, and clear action.',
  },
  {
    id: 'sel-01',
    name: 'Select',
    category: 'primitives',
    status: 'stable',
    version: '3.0.1',
    props: 14,
    variants: 3,
    updatedAt: '3 days ago',
    description: 'Dropdown select with search, multi-select, and grouped options.',
  },
  {
    id: 'card-01',
    name: 'Card',
    category: 'composites',
    status: 'stable',
    version: '2.4.0',
    props: 8,
    variants: 3,
    updatedAt: '5 hours ago',
    description: 'Surface container with header, body, footer slots and elevation levels.',
  },
  {
    id: 'modal-01',
    name: 'Modal',
    category: 'composites',
    status: 'beta',
    version: '1.2.0',
    props: 15,
    variants: 4,
    updatedAt: '12 hours ago',
    description: 'Overlay dialog with backdrop, focus trap, and configurable close behavior.',
  },
  {
    id: 'table-01',
    name: 'DataTable',
    category: 'composites',
    status: 'stable',
    version: '3.0.0',
    props: 22,
    variants: 2,
    updatedAt: '2 days ago',
    description: 'Sortable, filterable data table with pagination, row selection, and virtual scrolling.',
  },
  {
    id: 'form-01',
    name: 'FormSections',
    category: 'patterns',
    status: 'stable',
    version: '2.1.0',
    props: 10,
    variants: 3,
    updatedAt: '4 days ago',
    description: 'Grouped form fields organized in labeled sections with validation.',
  },
  {
    id: 'cmd-01',
    name: 'CommandPalette',
    category: 'patterns',
    status: 'beta',
    version: '1.0.0',
    props: 8,
    variants: 2,
    updatedAt: '6 hours ago',
    description: 'Cmd+K style command search overlay with fuzzy search, categories, and keyboard navigation.',
  },
  {
    id: 'auth-01',
    name: 'AuthForm',
    category: 'patterns',
    status: 'stable',
    version: '2.0.0',
    props: 6,
    variants: 4,
    updatedAt: '1 week ago',
    description: 'Unified auth form with login, register, forgot-password, and MFA modes.',
  },
  {
    id: 'sidebar-01',
    name: 'SidebarLayout',
    category: 'layouts',
    status: 'stable',
    version: '3.0.0',
    props: 7,
    variants: 2,
    updatedAt: '3 days ago',
    description: 'Collapsible sidebar shell with header bar and scrollable main content.',
  },
  {
    id: 'split-01',
    name: 'SplitPane',
    category: 'layouts',
    status: 'experimental',
    version: '0.3.0',
    props: 6,
    variants: 2,
    updatedAt: '1 day ago',
    description: 'Resizable split-pane layout with horizontal or vertical orientation.',
  },
  {
    id: 'toast-01',
    name: 'Toast',
    category: 'composites',
    status: 'stable',
    version: '2.0.0',
    props: 9,
    variants: 4,
    updatedAt: '5 days ago',
    description: 'Non-blocking notification with auto-dismiss, stacking, and action support.',
  },
];

// ── Component properties (for inspector) ──

export interface PropertyDef {
  name: string;
  type: string;
  default: string;
  required: boolean;
  description: string;
}

export const buttonProperties: PropertyDef[] = [
  { name: 'variant', type: '"primary" | "ghost" | "danger" | "outline"', default: '"primary"', required: false, description: 'Visual style variant' },
  { name: 'size', type: '"sm" | "md" | "lg"', default: '"md"', required: false, description: 'Button size' },
  { name: 'disabled', type: 'boolean', default: 'false', required: false, description: 'Disable interaction' },
  { name: 'loading', type: 'boolean', default: 'false', required: false, description: 'Show loading spinner' },
  { name: 'icon', type: 'ReactNode', default: 'undefined', required: false, description: 'Leading icon element' },
  { name: 'iconRight', type: 'ReactNode', default: 'undefined', required: false, description: 'Trailing icon element' },
  { name: 'fullWidth', type: 'boolean', default: 'false', required: false, description: 'Expand to container width' },
  { name: 'onClick', type: '() => void', default: 'undefined', required: false, description: 'Click event handler' },
  { name: 'type', type: '"button" | "submit" | "reset"', default: '"button"', required: false, description: 'HTML button type' },
  { name: 'children', type: 'ReactNode', default: 'undefined', required: true, description: 'Button content' },
  { name: 'className', type: 'string', default: '""', required: false, description: 'Additional CSS classes' },
  { name: 'aria-label', type: 'string', default: 'undefined', required: false, description: 'Accessible label' },
];

// ── Catalog items ──

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  tags: string[];
  status: 'stable' | 'beta' | 'experimental' | 'deprecated';
  downloads: string;
  description: string;
}

export const catalogItems: CatalogItem[] = [
  { id: 'btn-01', name: 'Button', category: 'Primitives', tags: ['interactive', 'form'], status: 'stable', downloads: '24.3k', description: 'Primary interactive element' },
  { id: 'inp-01', name: 'Input', category: 'Primitives', tags: ['form', 'control'], status: 'stable', downloads: '21.8k', description: 'Text input with validation' },
  { id: 'sel-01', name: 'Select', category: 'Primitives', tags: ['form', 'dropdown'], status: 'stable', downloads: '18.2k', description: 'Dropdown select control' },
  { id: 'card-01', name: 'Card', category: 'Composites', tags: ['surface', 'container'], status: 'stable', downloads: '19.5k', description: 'Surface container with slots' },
  { id: 'modal-01', name: 'Modal', category: 'Composites', tags: ['overlay', 'dialog'], status: 'beta', downloads: '14.1k', description: 'Overlay dialog with focus trap' },
  { id: 'table-01', name: 'DataTable', category: 'Composites', tags: ['data', 'grid'], status: 'stable', downloads: '16.7k', description: 'Sortable, filterable data table' },
  { id: 'toast-01', name: 'Toast', category: 'Composites', tags: ['notification', 'feedback'], status: 'stable', downloads: '15.3k', description: 'Non-blocking notification' },
  { id: 'form-01', name: 'FormSections', category: 'Patterns', tags: ['form', 'settings'], status: 'stable', downloads: '12.4k', description: 'Grouped form with sections' },
  { id: 'cmd-01', name: 'CommandPalette', category: 'Patterns', tags: ['search', 'navigation'], status: 'beta', downloads: '9.8k', description: 'Cmd+K command search overlay' },
  { id: 'auth-01', name: 'AuthForm', category: 'Patterns', tags: ['auth', 'form'], status: 'stable', downloads: '11.6k', description: 'Unified auth form with modes' },
  { id: 'sidebar-01', name: 'SidebarLayout', category: 'Layouts', tags: ['shell', 'navigation'], status: 'stable', downloads: '13.9k', description: 'Collapsible sidebar shell' },
  { id: 'split-01', name: 'SplitPane', category: 'Layouts', tags: ['layout', 'resize'], status: 'experimental', downloads: '4.2k', description: 'Resizable split-pane layout' },
  { id: 'tabs-01', name: 'Tabs', category: 'Primitives', tags: ['navigation', 'content'], status: 'stable', downloads: '17.0k', description: 'Tab navigation with panels' },
  { id: 'badge-01', name: 'Badge', category: 'Primitives', tags: ['annotation', 'status'], status: 'stable', downloads: '20.1k', description: 'Status annotation badge' },
  { id: 'tooltip-01', name: 'Tooltip', category: 'Primitives', tags: ['overlay', 'info'], status: 'stable', downloads: '16.4k', description: 'Contextual tooltip on hover' },
  { id: 'avatar-01', name: 'Avatar', category: 'Primitives', tags: ['identity', 'image'], status: 'stable', downloads: '14.8k', description: 'User avatar with fallback' },
];

// ── Navigation items ──

export interface NavItem {
  icon: string;
  label: string;
  href: string;
  group?: string;
}

export const sidebarNavItems: NavItem[] = [
  { icon: 'layout-panel-left', label: 'Workspace', href: '/workspace', group: 'Workbench' },
  { icon: 'grid-3x3', label: 'Catalog', href: '/catalog', group: 'Workbench' },
  { icon: 'scan-search', label: 'Inspector', href: '/inspector', group: 'Tools' },
  { icon: 'eye', label: 'Preview', href: '/preview', group: 'Tools' },
  { icon: 'settings', label: 'Settings', href: '/settings', group: 'Account' },
];

// ── Settings ──

export interface AppSettings {
  displayName: string;
  email: string;
  avatar: string;
  theme: 'dark' | 'light' | 'system';
  editorFont: string;
  fontSize: number;
  tabSize: number;
  notifications: boolean;
  compactMode: boolean;
  autoSave: boolean;
  timezone: string;
}

export const appSettings: AppSettings = {
  displayName: 'Dev User',
  email: 'dev@example.com',
  avatar: 'DU',
  theme: 'dark',
  editorFont: 'Geist Mono',
  fontSize: 13,
  tabSize: 2,
  notifications: true,
  compactMode: false,
  autoSave: true,
  timezone: 'America/New_York',
};
