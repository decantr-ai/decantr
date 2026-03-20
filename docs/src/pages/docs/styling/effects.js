import { NewDocsShell } from '../../../layouts/docs-shell.js';
import { Prose, H2, H3, P, List, Code, CodeBlock, Callout, PromptExample, RelatedLinks, Strong } from '../../../components/docs-prose.js';

const headings = [
  { id: 'glass-effects', label: 'Glass Effects', level: 2 },
  { id: 'glow-effects', label: 'Glow Effects', level: 2 },
  { id: 'gradients', label: 'Gradients', level: 2 },
  { id: 'animations', label: 'Animations', level: 2 },
  { id: 'shadows', label: 'Shadows', level: 2 },
];

export function VisualEffectsPage() {
  return NewDocsShell(
    {
      title: 'Visual Effects',
      breadcrumbs: [
        { label: 'Styling', path: '/docs/styling/themes' },
        { label: 'Visual Effects', path: '/docs/styling/effects' },
      ],
      headings,
    },
    Prose(
      P('Add visual polish to your Decantr app with glass effects, glows, gradients, and animations.'),

      H2('Glass Effects'),
      P('Glass (frosted glass, glassmorphism) effects create depth:'),

      CodeBlock({
        lang: 'js',
        code: `// Using the ds-glass utility class
Card({ class: 'ds-glass' }, content)

// Custom glass with atoms
div({ class: css('_bg[rgba(255,255,255,0.1)] _backdrop[blur(12px)]') })`,
      }),

      PromptExample('Add a glass effect to the header that becomes more opaque on scroll'),

      H2('Glow Effects'),
      P('Glows add emphasis and visual interest:'),

      CodeBlock({
        lang: 'js',
        code: `// Box shadow glow
css('_shadow[0_0_20px_var(--c-primary)/30]')

// Text glow
css('_shadow[0_0_10px_currentColor]')

// Using utility classes
div({ class: 'ds-glow' })`,
      }),

      PromptExample('Add a subtle glow effect to the active navigation item'),

      H2('Gradients'),
      P('Gradients for backgrounds and text:'),

      H3('Background Gradients'),
      CodeBlock({
        lang: 'js',
        code: `// Linear gradient
css('_bg[linear-gradient(135deg,var(--c-primary),var(--c-secondary))]')

// Radial gradient
css('_bg[radial-gradient(circle_at_top,var(--c-primary)/20,transparent)]')`,
      }),

      H3('Text Gradients'),
      CodeBlock({
        lang: 'js',
        code: `// Gradient text
css('_bg[linear-gradient(90deg,var(--c-primary),var(--c-secondary))] _bgclip[text] _fgtransparent')`,
      }),

      PromptExample('Add a gradient background to the hero section that shifts from primary to secondary'),

      H2('Animations'),
      P('Built-in animation utilities:'),

      H3('Entrance Animations'),
      CodeBlock({
        lang: 'js',
        code: `// Page entrance
div({ class: 'd-page-enter' })

// Fade in
div({ class: css('_anim[fadeIn_0.3s_ease]') })

// Slide up
div({ class: css('_anim[slideUp_0.3s_ease]') })`,
      }),

      H3('Transitions'),
      CodeBlock({
        lang: 'js',
        code: `// Smooth transitions
css('_trans[all_0.2s_ease]')
css('_trans[transform_0.15s,opacity_0.15s]')

// Hover transforms
css('_hover:scale[1.02] _trans[transform_0.2s]')`,
      }),

      PromptExample('Add a subtle bounce animation to buttons on hover'),

      Callout({ type: 'tip', title: 'Performance' },
        P('Use ', Code('transform'), ' and ', Code('opacity'), ' for animations. They\'re GPU-accelerated and won\'t cause layout shifts.'),
      ),

      H2('Shadows'),
      P('Shadow utilities for depth:'),

      CodeBlock({
        lang: 'js',
        code: `// Elevation shadows
css('_shadow1')  // Subtle
css('_shadow2')  // Medium
css('_shadow3')  // Strong

// Custom shadows
css('_shadow[0_4px_6px_rgba(0,0,0,0.1)]')

// Colored shadows
css('_shadow[0_10px_40px_var(--c-primary)/20]')`,
      }),

      RelatedLinks([
        { label: 'Customizing Colors', path: '/docs/styling/colors', iconName: 'droplet' },
        { label: 'Themes & Recipes', path: '/docs/styling/themes', iconName: 'palette' },
      ]),
    ),
  );
}
