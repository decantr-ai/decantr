import { tags } from 'decantr/tags';
import { useRoute } from 'decantr/router';

const { div, h1, h2, p, code, pre, ul, li } = tags;

const docsContent = {
  'introduction': {
    title: 'Introduction',
    content: () => [
      p({ class: '_fgmuted _lh[1.8] _mb4' },
        'Welcome to our library documentation. This guide will help you understand the core concepts and get started quickly.'
      ),
      h2({ class: '_fs xl _fwbold _mb4 _mt8' }, 'Features'),
      ul({ class: '_list[disc] _pl6 _fgmuted _lh[1.8]' },
        li({}, 'Simple and intuitive API'),
        li({}, 'TypeScript support'),
        li({}, 'Lightweight and fast'),
        li({}, 'Comprehensive documentation'),
      ),
    ],
  },
  'installation': {
    title: 'Installation',
    content: () => [
      p({ class: '_fgmuted _lh[1.8] _mb4' }, 'Install the library using npm or yarn:'),
      pre({ class: '_bgsurface _p4 _rounded _mb4 _overflow[auto]' },
        code({}, 'npm install my-library')
      ),
      p({ class: '_fgmuted _lh[1.8]' }, 'Or with yarn:'),
      pre({ class: '_bgsurface _p4 _rounded _overflow[auto]' },
        code({}, 'yarn add my-library')
      ),
    ],
  },
  'quick-start': {
    title: 'Quick Start',
    content: () => [
      p({ class: '_fgmuted _lh[1.8] _mb4' },
        'Get started with a minimal example:'
      ),
      pre({ class: '_bgsurface _p4 _rounded _mb4 _overflow[auto]' },
        code({}, `import { mount } from 'my-library';

function App() {
  return h('div', {}, 'Hello World!');
}

mount(document.getElementById('app'), App);`)
      ),
    ],
  },
  'routing': {
    title: 'Routing',
    content: () => [
      p({ class: '_fgmuted _lh[1.8] _mb4' },
        'The router provides declarative routing for your application.'
      ),
      h2({ class: '_fsxl _fwbold _mb4 _mt8' }, 'Basic Usage'),
      pre({ class: '_bgsurface _p4 _rounded _overflow[auto]' },
        code({}, `const router = createRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
  ],
});`)
      ),
    ],
  },
};

export function DocsPage() {
  const route = useRoute();
  const section = () => route().params.section || 'introduction';
  const doc = () => docsContent[section()] || { title: 'Not Found', content: () => [p({}, 'Documentation page not found.')] };

  return div({ class: '_p8 _maxw[800px]' },
    h1({ class: '_fs3xl _fwbold _mb8' }, () => doc().title),
    () => doc().content()
  );
}
