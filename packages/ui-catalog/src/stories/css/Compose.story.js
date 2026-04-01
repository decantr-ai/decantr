import { compose } from '@decantr/ui/compose';
import { EssenceProvider } from '@decantr/ui/essence';
import { h } from '@decantr/ui/runtime';

const sampleEssence = {
  dna: { style: 'auradecantism', mode: 'light', density: 'comfortable' },
};

function HeroDemo() {
  return EssenceProvider({ essence: sampleEssence },
    compose('hero', {
      headline: 'Build beautiful apps',
      subheadline: 'With the Decantr composition API',
      cta: { label: 'Get Started', href: '#' },
    }),
  );
}

function FeatureGridDemo() {
  return EssenceProvider({ essence: sampleEssence },
    compose('feature-grid', {
      columns: 3,
      features: [
        { title: 'Fast', description: 'Lightning-fast rendering' },
        { title: 'Flexible', description: 'Compose any layout' },
        { title: 'Accessible', description: 'WCAG compliant by default' },
      ],
    }),
  );
}

function CtaDemo() {
  return EssenceProvider({ essence: sampleEssence },
    compose('cta-section', {
      headline: 'Ready to start?',
      description: 'Join thousands of developers building with Decantr.',
      primaryAction: { label: 'Sign Up', href: '#' },
      secondaryAction: { label: 'Learn More', href: '#' },
    }),
  );
}

export default {
  component: (props) => {
    if (props._variant === 'feature-grid') return FeatureGridDemo();
    if (props._variant === 'cta') return CtaDemo();
    return HeroDemo();
  },
  title: 'compose()',
  category: 'css',
  description: 'Shows how compose() renders patterns declaratively. Each pattern is resolved from the registry and rendered with the current Essence context.',
  variants: [
    { name: 'Hero', props: {} },
    { name: 'Feature Grid', props: { _variant: 'feature-grid' } },
    { name: 'CTA Section', props: { _variant: 'cta' } },
  ],
  usage: [
    {
      title: 'compose a hero',
      code: `import { compose } from '@decantr/ui/compose'

compose('hero', {
  headline: 'Build beautiful apps',
  subheadline: 'With the Decantr composition API',
  cta: { label: 'Get Started', href: '#' },
})`,
    },
    {
      title: 'compose a feature grid',
      code: `import { compose } from '@decantr/ui/compose'

compose('feature-grid', {
  columns: 3,
  features: [
    { title: 'Fast', description: 'Lightning-fast rendering' },
    { title: 'Flexible', description: 'Compose any layout' },
    { title: 'Accessible', description: 'WCAG compliant by default' },
  ],
})`,
    },
    {
      title: 'compose a CTA section',
      code: `import { compose } from '@decantr/ui/compose'

compose('cta-section', {
  headline: 'Ready to start?',
  primaryAction: { label: 'Sign Up', href: '#' },
  secondaryAction: { label: 'Learn More', href: '#' },
})`,
    },
  ],
};
