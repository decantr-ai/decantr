import { Tree } from '@decantr/ui/components';

const treeData = [
  {
    key: '1', label: 'Documents',
    children: [
      { key: '1-1', label: 'Resume.pdf', isLeaf: true },
      { key: '1-2', label: 'Cover Letter.docx', isLeaf: true },
    ],
  },
  {
    key: '2', label: 'Photos',
    children: [
      { key: '2-1', label: 'Vacation', children: [
        { key: '2-1-1', label: 'beach.jpg', isLeaf: true },
        { key: '2-1-2', label: 'sunset.jpg', isLeaf: true },
      ] },
      { key: '2-2', label: 'Family', children: [
        { key: '2-2-1', label: 'portrait.jpg', isLeaf: true },
      ] },
    ],
  },
  { key: '3', label: 'README.md', isLeaf: true },
];

export default {
  component: (props) => Tree({ data: treeData, ...props }),
  title: 'Tree',
  category: 'components/data-display',
  description: 'Hierarchical tree view with expand/collapse, checkboxes, and selection.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Default Expand All', props: { defaultExpandAll: true } },
    { name: 'Checkable', props: { checkable: true, defaultExpandAll: true } },
    { name: 'Not Selectable', props: { selectable: false, defaultExpandAll: true } },
    { name: 'Pre-expanded', props: { expandedKeys: ['1', '2'] } },
    { name: 'Pre-selected', props: { selectedKeys: ['1-1'], expandedKeys: ['1'] } },
    { name: 'Checkable with Checked', props: { checkable: true, checkedKeys: ['1-1', '2-1-1'], expandedKeys: ['1', '2', '2-1'] } },
  ],
  playground: {
    defaults: { defaultExpandAll: true },
    controls: [
      { name: 'checkable', type: 'boolean' },
      { name: 'selectable', type: 'boolean' },
      { name: 'defaultExpandAll', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic tree',
      code: `import { Tree } from '@decantr/ui/components';

const tree = Tree({
  data: [
    { key: '1', label: 'Folder', children: [
      { key: '1-1', label: 'File.txt', isLeaf: true },
    ] },
  ],
  defaultExpandAll: true,
});
document.body.appendChild(tree);`,
    },
    {
      title: 'Checkable tree',
      code: `import { Tree } from '@decantr/ui/components';

const tree = Tree({
  data: myTreeData,
  checkable: true,
  onCheck: (keys, info) => console.log('Checked:', keys),
});`,
    },
  ],
};
