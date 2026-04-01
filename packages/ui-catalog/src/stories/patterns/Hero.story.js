import { h } from '@decantr/ui/runtime';
import { Button } from '@decantr/ui/components';
import { css } from '@decantr/css';

export default {
  component: (props) => {
    const { preset = 'landing' } = props;
    return h('section', { class: css('_flex _col _aic _jcc _gap6 _p12 _textcenter') },
      h('h1', { class: css('_heading1') }, props.headline || 'Build Something Amazing'),
      h('p', { class: css('_texlg _fgmuted') }, props.subtext || 'The platform for modern web development.'),
      h('div', { class: css('_flex _gap4 _jcc') },
        h(Button, { variant: 'primary', size: 'lg' }, props.primaryCta || 'Get Started'),
        h(Button, { variant: 'ghost', size: 'lg' }, props.secondaryCta || 'Learn More'),
      ),
    );
  },
  title: 'Hero',
  category: 'components/layout',
  description: 'Landing page hero section with headline, subtext, and CTA buttons. Maps to the Decantr hero pattern.',
  variants: [
    { name: 'Landing', props: { preset: 'landing', headline: 'AI-Powered Developer Tools', subtext: 'Ship faster with design intelligence.', primaryCta: 'Start Free', secondaryCta: 'View Demo' } },
    { name: 'Brand', props: { preset: 'brand', headline: 'Decantr', subtext: 'OpenAPI for AI-generated UI.' } },
    { name: 'Minimal', props: { preset: 'split', headline: 'Simple. Fast. Beautiful.', subtext: 'Build production-quality web apps.' } },
  ],
  usage: [
    { title: 'Basic Hero', code: `import { Hero } from '@decantr/ui-catalog/patterns';\n\nh(Hero, { headline: 'Welcome', subtext: 'Get started today.' })` },
  ],
};
