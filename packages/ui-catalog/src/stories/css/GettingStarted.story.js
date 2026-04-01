import { EssenceApp, composePage } from '@decantr/ui/compose';
import { h } from '@decantr/ui/runtime';

const sampleEssence = {
  dna: { style: 'auradecantism', mode: 'light', density: 'comfortable' },
  guard: { mode: 'guided' },
  structure: {
    pages: {
      home: { patterns: ['hero', 'feature-grid', 'cta-section'] },
    },
  },
};

function FullAppDemo() {
  return EssenceApp({ essence: sampleEssence },
    composePage('home'),
  );
}

export default {
  component: () => FullAppDemo(),
  title: 'Getting Started',
  category: 'css',
  description: 'Complete minimal app example using the composition API. Shows EssenceApp wrapping composePage to render a full page from the Essence spec in five lines.',
  variants: [
    { name: 'Minimal App', props: {} },
  ],
  usage: [
    {
      title: 'Full 5-line app',
      code: `import { EssenceApp, composePage } from '@decantr/ui/compose'
import essence from './essence.json'

mount(root, () =>
  EssenceApp({ essence }, composePage('home'))
)`,
    },
  ],
};
