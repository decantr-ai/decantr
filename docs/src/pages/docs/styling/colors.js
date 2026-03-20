import { NewDocsShell } from '../../../layouts/docs-shell.js';
import { Prose, H2, H3, P, List, Code, CodeBlock, Callout, PromptExample, RelatedLinks, Strong } from '../../../components/docs-prose.js';

const headings = [
  { id: 'color-tokens', label: 'Color Tokens', level: 2 },
  { id: 'semantic-colors', label: 'Semantic Colors', level: 2 },
  { id: 'customizing-colors', label: 'Customizing Colors', level: 2 },
  { id: 'color-atoms', label: 'Color Atoms', level: 2 },
];

export function CustomizingColorsPage() {
  return NewDocsShell(
    {
      title: 'Customizing Colors',
      breadcrumbs: [
        { label: 'Styling', path: '/docs/styling/themes' },
        { label: 'Customizing Colors', path: '/docs/styling/colors' },
      ],
      headings,
    },
    Prose(
      P('Learn how to customize colors in your Decantr application using tokens and atoms.'),

      H2('Color Tokens'),
      P('Decantr uses CSS custom properties (tokens) for all colors:'),

      CodeBlock({
        lang: 'css',
        code: `/* Core color tokens */
--c-primary: #8b5cf6;     /* Primary brand color */
--c-secondary: #ec4899;   /* Secondary accent */
--c-accent: #06b6d4;      /* Tertiary accent */

/* Semantic tokens */
--c-bg: #0a0a0f;          /* Background */
--c-fg: #fafafa;          /* Foreground (text) */
--c-muted: #27272a;       /* Muted background */
--c-muted-fg: #a1a1aa;    /* Muted text */
--c-border: #27272a;      /* Border color */

/* State colors */
--c-success: #22c55e;
--c-warning: #f59e0b;
--c-danger: #ef4444;
--c-info: #3b82f6;`,
      }),

      H2('Semantic Colors'),
      P('Use semantic colors for consistent theming:'),

      List(
        'bg/fg: Main background and text',
        'muted/muted-fg: Secondary surfaces and text',
        'primary: Brand color for CTAs and accents',
        'border: Dividers and outlines',
      ),

      Callout({ type: 'tip', title: 'Semantic Over Literal' },
        P('Use ', Code('_bgprimary'), ' instead of ', Code('_bg[#8b5cf6]'), '. Semantic colors adapt to themes.'),
      ),

      H2('Customizing Colors'),
      P('Override colors in your project\'s CSS:'),

      CodeBlock({
        lang: 'css',
        code: `/* In public/styles.css or via setStyle */
:root {
  --c-primary: #7c3aed;  /* Custom purple */
  --c-secondary: #f472b6; /* Custom pink */
}

/* Mode-specific overrides */
[data-mode="dark"] {
  --c-bg: #0f0f1a;
  --c-fg: #f0f0f5;
}`,
      }),

      P('Or prompt AI to change colors:'),

      PromptExample('Change the primary color to a deep blue (#1e40af) and the accent to teal'),

      H2('Color Atoms'),
      P('Atoms for applying colors:'),

      H3('Background'),
      CodeBlock({
        lang: 'js',
        code: `css('_bgprimary')      // Primary background
css('_bgmuted')        // Muted background
css('_bgprimary/50')   // 50% opacity
css('_bg[#custom]')    // Arbitrary color`,
      }),

      H3('Text (Foreground)'),
      CodeBlock({
        lang: 'js',
        code: `css('_fgfg')           // Main text color
css('_fgmutedfg')      // Muted text
css('_fgprimary')      // Primary colored text
css('_fgfg/80')        // 80% opacity`,
      }),

      H3('Border'),
      CodeBlock({
        lang: 'js',
        code: `css('_bcborder')       // Border color
css('_bcprimary')      // Primary border
css('_bcborder/50')    // 50% opacity`,
      }),

      Callout({ type: 'info', title: 'Opacity Modifiers' },
        P('Add ', Code('/NN'), ' to any color atom for opacity: ', Code('_bgprimary/50'), ', ', Code('_fgmuted/80'), '.'),
      ),

      RelatedLinks([
        { label: 'Visual Effects', path: '/docs/styling/effects', iconName: 'wand-2' },
        { label: 'Themes & Recipes', path: '/docs/styling/themes', iconName: 'palette' },
      ]),
    ),
  );
}
