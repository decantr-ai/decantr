import { tags } from 'decantr/tags';
import { useRoute } from 'decantr/router';
import { Card } from 'decantr/components';

const { div, h1, h2, h3, p, code, pre, table, thead, tbody, tr, th, td } = tags;

const apiContent = {
  'core': {
    title: 'Core API',
    functions: [
      { name: 'mount', signature: 'mount(element, component)', description: 'Mount a component to a DOM element' },
      { name: 'h', signature: 'h(tag, props, children)', description: 'Create a virtual DOM element' },
      { name: 'createSignal', signature: 'createSignal(initial)', description: 'Create a reactive signal' },
    ],
  },
  'components': {
    title: 'Components API',
    functions: [
      { name: 'Button', signature: 'Button({ variant, size, onClick })', description: 'Interactive button component' },
      { name: 'Card', signature: 'Card({ children })', description: 'Container component with styling' },
      { name: 'Input', signature: 'Input({ value, onChange })', description: 'Text input component' },
    ],
  },
  'hooks': {
    title: 'Hooks API',
    functions: [
      { name: 'onMount', signature: 'onMount(callback)', description: 'Run callback when component mounts' },
      { name: 'onDestroy', signature: 'onDestroy(callback)', description: 'Run callback when component unmounts' },
      { name: 'createEffect', signature: 'createEffect(fn)', description: 'Create a reactive effect' },
    ],
  },
};

export function APIPage() {
  const route = useRoute();
  const section = () => route().params.section || 'core';
  const api = () => apiContent[section()] || { title: 'Not Found', functions: [] };

  return div({ class: '_p8 _maxw[900px]' },
    h1({ class: '_fs3xl _fwbold _mb8' }, () => api().title),

    () => api().functions.map(fn =>
      Card({
        class: '_mb6',
        children: [
          Card.Header({},
            code({ class: '_fgprimary _fwbold' }, fn.name)
          ),
          Card.Body({},
            pre({ class: '_bgsurface _p3 _rounded _mb4 _fssm' },
              code({}, fn.signature)
            ),
            p({ class: '_fgmuted' }, fn.description),
          ),
        ],
      })
    )
  );
}
