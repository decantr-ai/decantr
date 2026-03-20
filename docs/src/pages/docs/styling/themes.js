import { NewDocsShell } from '../../../layouts/docs-shell.js';
import { Prose, H2, H3, P, List, Code, CodeBlock, Callout, PromptExample, RelatedLinks, Strong } from '../../../components/docs-prose.js';

const headings = [
  { id: 'built-in-styles', label: 'Built-in Styles', level: 2 },
  { id: 'recipes', label: 'Recipes', level: 2 },
  { id: 'modes', label: 'Modes', level: 2 },
  { id: 'shapes', label: 'Shapes', level: 2 },
  { id: 'switching-themes', label: 'Switching Themes', level: 2 },
];

export function ThemesRecipesPage() {
  return NewDocsShell(
    {
      title: 'Themes & Recipes',
      breadcrumbs: [
        { label: 'Styling', path: '/docs/styling/themes' },
        { label: 'Themes & Recipes', path: '/docs/styling/themes' },
      ],
      headings,
    },
    Prose(
      P('Decantr\'s styling system is built on styles, recipes, modes, and shapes. Learn how they work together.'),

      H2('Built-in Styles'),
      P('Styles define the overall visual language:'),

      H3('Core Styles (built-in)'),
      List(
        'auradecantism: Default style with glows, gradients, and glass effects',
      ),

      H3('Add-on Styles'),
      List(
        'clean: Minimal, professional, Stripe-inspired',
        'glassmorphism: Frosted glass effects with blur',
      ),

      H3('Community Styles'),
      List(
        'retro: 90s-inspired with bold colors',
        'bioluminescent: Organic glowing effects',
        'launchpad: Startup landing page aesthetic',
        'dopamine: Bright, energetic, attention-grabbing',
        'editorial: Magazine-style typography focus',
        'liquid-glass: Fluid glass morphism',
        'prismatic: Rainbow gradients and light effects',
      ),

      CodeBlock({
        lang: 'js',
        code: `// Using a style
import { setStyle } from 'decantr/css';
import { clean } from 'decantr/styles/clean';
import { registerStyle } from 'decantr/css';

registerStyle(clean);
setStyle('clean');`,
      }),

      H2('Recipes'),
      P('Recipes are style + pattern configurations that define how patterns should look:'),

      CodeBlock({
        lang: 'json',
        code: `// In decantr.essence.json
"vintage": {
  "style": "auradecantism",
  "recipe": "auradecantism"
}`,
      }),

      P('Recipes control:'),
      List(
        'Pattern backgrounds and borders',
        'Card styling and shadows',
        'Navigation appearance',
        'Animation timing',
        'Spacing presets',
      ),

      Callout({ type: 'tip', title: 'Style vs Recipe' },
        P('Style sets the CSS variables and base look. Recipe tells patterns how to use those variables.'),
      ),

      H2('Modes'),
      P('Modes switch between light and dark color schemes:'),

      List(
        'light: Light backgrounds, dark text',
        'dark: Dark backgrounds, light text',
        'auto: Follows system preference',
      ),

      CodeBlock({
        lang: 'js',
        code: `import { setMode } from 'decantr/css';

setMode('dark');  // or 'light' or 'auto'`,
      }),

      PromptExample('Add a light/dark mode toggle to the header'),

      H2('Shapes'),
      P('Shapes control border radius across the app:'),

      List(
        'sharp: No border radius (0px)',
        'rounded: Subtle rounding (8px)',
        'pill: Maximum rounding (9999px for buttons)',
      ),

      CodeBlock({
        lang: 'js',
        code: `import { setShape } from 'decantr/css';

setShape('pill');`,
      }),

      H2('Switching Themes'),
      P('To change your project\'s visual style:'),

      PromptExample('Switch the theme from auradecantism to glassmorphism with dark mode'),

      P('AI will update:'),
      List(
        'The Essence vintage configuration',
        'Style imports in app.js',
        'Recipe references in patterns',
      ),

      RelatedLinks([
        { label: 'Customizing Colors', path: '/docs/styling/colors', iconName: 'droplet' },
        { label: 'Visual Effects', path: '/docs/styling/effects', iconName: 'wand-2' },
      ]),
    ),
  );
}
