import type { MetricSnapshot } from './types';

export const modelMetrics: MetricSnapshot[] = [
  {
    label: 'Total Inferences',
    value: 142847,
    unit: '',
    trend: 12.3,
    history: [
      98200, 102400, 107800, 111300, 115900, 119400, 123100, 127600, 131200,
      135800, 139400, 142847,
    ],
  },
  {
    label: 'Avg Confidence',
    value: 94.2,
    unit: '%',
    trend: 1.8,
    history: [
      93.1, 93.4, 93.0, 93.7, 93.9, 94.1, 93.6, 93.8, 94.0, 94.3, 94.1,
      94.2,
    ],
  },
  {
    label: 'Token Throughput',
    value: 28400,
    unit: 'tok/s',
    trend: -2.1,
    history: [
      29100, 28700, 29400, 28200, 27800, 29000, 28500, 27600, 28900, 28100,
      27900, 28400,
    ],
  },
  {
    label: 'Error Rate',
    value: 0.34,
    unit: '%',
    trend: -15.2,
    history: [
      0.82, 0.76, 0.71, 0.65, 0.58, 0.54, 0.49, 0.45, 0.42, 0.39, 0.36,
      0.34,
    ],
  },
  {
    label: 'P95 Latency',
    value: 127,
    unit: 'ms',
    trend: 3.4,
    history: [121, 123, 120, 125, 128, 124, 130, 126, 132, 129, 131, 127],
  },
];
