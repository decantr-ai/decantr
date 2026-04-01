import { Tabs } from '@decantr/ui/components';

export default {
  component: (props) => Tabs(props),
  title: 'Tabs',
  category: 'components/original',
  description: 'Tabbed interface with roving tabindex keyboard navigation and animated indicator.',
  variants: [
    {
      name: 'Default',
      props: {
        tabs: [
          { id: 'tab1', label: 'Overview', content: () => 'Overview content here.' },
          { id: 'tab2', label: 'Details', content: () => 'Details content here.' },
          { id: 'tab3', label: 'Settings', content: () => 'Settings content here.' },
        ],
        active: 'tab1',
      },
    },
    {
      name: 'With Disabled Tab',
      props: {
        tabs: [
          { id: 'a', label: 'Active', content: () => 'Active tab content.' },
          { id: 'b', label: 'Disabled', disabled: true, content: () => 'Disabled.' },
          { id: 'c', label: 'Another', content: () => 'Another tab.' },
        ],
        active: 'a',
      },
    },
    {
      name: 'Vertical',
      props: {
        orientation: 'vertical',
        tabs: [
          { id: 'v1', label: 'General', content: () => 'General settings.' },
          { id: 'v2', label: 'Security', content: () => 'Security settings.' },
          { id: 'v3', label: 'Notifications', content: () => 'Notification preferences.' },
        ],
        active: 'v1',
      },
    },
    {
      name: 'Small Size',
      props: {
        size: 'sm',
        tabs: [
          { id: 's1', label: 'Tab A', content: () => 'Content A' },
          { id: 's2', label: 'Tab B', content: () => 'Content B' },
        ],
        active: 's1',
      },
    },
    {
      name: 'Large Size',
      props: {
        size: 'lg',
        tabs: [
          { id: 'l1', label: 'Tab A', content: () => 'Content A' },
          { id: 'l2', label: 'Tab B', content: () => 'Content B' },
        ],
        active: 'l1',
      },
    },
    {
      name: 'Closable Tabs',
      props: {
        tabs: [
          { id: 'c1', label: 'File 1', closable: true, content: () => 'File 1 content.' },
          { id: 'c2', label: 'File 2', closable: true, content: () => 'File 2 content.' },
          { id: 'c3', label: 'Pinned', content: () => 'Pinned tab content.' },
        ],
        active: 'c1',
      },
    },
  ],
  playground: {
    defaults: {
      tabs: [
        { id: 'p1', label: 'First', content: () => 'First panel.' },
        { id: 'p2', label: 'Second', content: () => 'Second panel.' },
      ],
      active: 'p1',
    },
    controls: [
      { name: 'orientation', type: 'select', options: ['horizontal', 'vertical'] },
      { name: 'size', type: 'select', options: ['default', 'sm', 'lg'] },
      { name: 'disabled', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Tabs } from '@decantr/ui/components';

const tabs = Tabs({
  tabs: [
    { id: 'overview', label: 'Overview', content: () => 'Overview...' },
    { id: 'details', label: 'Details', content: () => 'Details...' },
  ],
  active: 'overview',
  onchange: (id) => console.log('switched to', id),
});
document.body.appendChild(tabs);`,
    },
    {
      title: 'With EssenceProvider',
      code: `import { mount } from '@decantr/ui/runtime'
import { EssenceProvider } from '@decantr/ui/essence'
import { Tabs } from '@decantr/ui/components'
import essence from './essence.json'

mount(root, () =>
  EssenceProvider({ essence },
    Tabs({
      tabs: [
        { id: 'overview', label: 'Overview', content: () => 'Overview...' },
        { id: 'details', label: 'Details', content: () => 'Details...' },
      ],
      active: 'overview',
    })
  )
)`,
    },
  ],
};
