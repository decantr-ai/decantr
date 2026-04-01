import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'swimlane', ...props }),
  title: 'Swimlane Chart',
  category: 'charts',
  description: 'Swimlane chart for displaying activities across parallel lanes or categories.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { lane: 'Frontend', task: 'UI Design', start: 0, end: 3 },
          { lane: 'Frontend', task: 'Implementation', start: 3, end: 7 },
          { lane: 'Backend', task: 'API Design', start: 1, end: 4 },
          { lane: 'Backend', task: 'Development', start: 4, end: 8 },
          { lane: 'QA', task: 'Test Plan', start: 2, end: 5 },
          { lane: 'QA', task: 'Testing', start: 6, end: 9 },
        ],
        x: 'task',
        y: ['start', 'end'],
        title: 'Project Swimlane',
      },
    },
    {
      name: 'Sprint Board',
      props: {
        data: [
          { lane: 'To Do', task: 'Feature A', start: 0, end: 2 },
          { lane: 'To Do', task: 'Feature B', start: 1, end: 3 },
          { lane: 'In Progress', task: 'Feature C', start: 2, end: 5 },
          { lane: 'Done', task: 'Feature D', start: 0, end: 4 },
        ],
        x: 'task',
        y: ['start', 'end'],
        title: 'Sprint Overview',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { lane: 'Lane 1', task: 'Task A', start: 0, end: 3 },
        { lane: 'Lane 1', task: 'Task B', start: 3, end: 6 },
        { lane: 'Lane 2', task: 'Task C', start: 1, end: 5 },
      ],
      x: 'task',
      y: ['start', 'end'],
      title: 'Swimlane',
    },
    controls: [
      { name: 'height', type: 'text' },
      { name: 'animate', type: 'boolean' },
      { name: 'tooltip', type: 'boolean' },
      { name: 'legend', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Project swimlane',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'swimlane',
  data: [
    { lane: 'Dev', task: 'Build', start: 0, end: 5 },
    { lane: 'QA', task: 'Test', start: 3, end: 7 },
  ],
  x: 'task',
  y: ['start', 'end'],
});
document.body.appendChild(chart);`,
    },
  ],
};
