import { h } from '@decantr/ui/runtime';

export function ChartDetail(params) {
  return h('div', null, `Chart: ${params.slug || 'unknown'}`);
}
