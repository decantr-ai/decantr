import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'radar', ...props }),
  title: 'Radar Chart',
  category: 'charts',
  description: 'Radar chart for comparing multiple variables on a radial axis.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { axis: 'Speed', value: 85 },
          { axis: 'Reliability', value: 72 },
          { axis: 'Comfort', value: 90 },
          { axis: 'Safety', value: 88 },
          { axis: 'Efficiency', value: 65 },
        ],
        x: 'axis',
        y: 'value',
        title: 'Product Rating',
      },
    },
    {
      name: 'Multi-Series',
      props: {
        data: [
          { axis: 'Attack', teamA: 80, teamB: 65 },
          { axis: 'Defense', teamA: 70, teamB: 85 },
          { axis: 'Speed', teamA: 90, teamB: 75 },
          { axis: 'Stamina', teamA: 60, teamB: 80 },
          { axis: 'Technique', teamA: 75, teamB: 70 },
        ],
        x: 'axis',
        y: ['teamA', 'teamB'],
        title: 'Team Comparison',
      },
    },
    {
      name: 'Skill Assessment',
      props: {
        data: [
          { axis: 'JavaScript', value: 90 },
          { axis: 'CSS', value: 75 },
          { axis: 'React', value: 85 },
          { axis: 'Node.js', value: 70 },
          { axis: 'SQL', value: 60 },
          { axis: 'DevOps', value: 50 },
        ],
        x: 'axis',
        y: 'value',
        title: 'Developer Skills',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { axis: 'A', value: 80 },
        { axis: 'B', value: 65 },
        { axis: 'C', value: 90 },
        { axis: 'D', value: 70 },
        { axis: 'E', value: 85 },
      ],
      x: 'axis',
      y: 'value',
      title: 'Radar Chart',
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
      title: 'Skill radar',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'radar',
  data: [
    { axis: 'Speed', value: 85 },
    { axis: 'Power', value: 70 },
    { axis: 'Agility', value: 90 },
  ],
  x: 'axis',
  y: 'value',
});
document.body.appendChild(chart);`,
    },
  ],
};
