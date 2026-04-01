import { h } from '@decantr/ui/runtime';

export function ComponentDetail(params) {
  return h('div', null, `Component: ${params.slug || 'unknown'}`);
}
