import { NewDocsShell } from '../../../layouts/docs-shell.js';
import { Prose, H2, H3, P, List, Code, CodeBlock, Callout, PromptExample, RelatedLinks, Strong } from '../../../components/docs-prose.js';

const headings = [
  { id: 'theme-anatomy', label: 'Theme Anatomy', level: 2 },
  { id: 'creating-a-style', label: 'Creating a Style', level: 2 },
  { id: 'creating-a-recipe', label: 'Creating a Recipe', level: 2 },
  { id: 'testing-your-theme', label: 'Testing Your Theme', level: 2 },
];

export function CreatingThemesPage() {
  return NewDocsShell(
    {
      title: 'Creating Themes',
      breadcrumbs: [
        { label: 'Customizing', path: '/docs/customizing/patterns' },
        { label: 'Creating Themes', path: '/docs/customizing/themes' },
      ],
      headings,
    },
    Prose(
      P('Create custom themes by defining styles and recipes. Share your unique visual language with the community.'),

      H2('Theme Anatomy'),
      P('A complete theme has two parts:'),

      List(
        'Style: CSS custom properties (colors, fonts, spacing)',
        'Recipe: Pattern configurations (how patterns use the style)',
      ),

      P('You can create just a style (for simple color themes) or both (for complete visual languages).'),

      H2('Creating a Style'),
      P('Styles are JavaScript modules that export CSS:'),

      CodeBlock({
        lang: 'js',
        code: `// src/styles/my-style.js
export const myStyle = {
  name: 'my-style',
  css: \`
    :root {
      /* Colors */
      --c-primary: #8b5cf6;
      --c-secondary: #ec4899;
      --c-accent: #06b6d4;

      /* Backgrounds */
      --c-bg: #fafafa;
      --c-fg: #18181b;
      --c-muted: #f4f4f5;
      --c-muted-fg: #71717a;
      --c-border: #e4e4e7;

      /* Typography */
      --d-font-sans: 'Inter', system-ui, sans-serif;
      --d-font-mono: 'JetBrains Mono', monospace;

      /* Spacing */
      --d-radius: 8px;
    }

    [data-mode="dark"] {
      --c-bg: #09090b;
      --c-fg: #fafafa;
      --c-muted: #27272a;
      --c-muted-fg: #a1a1aa;
      --c-border: #27272a;
    }
  \`,
};`,
      }),

      P('Register and use your style:'),

      CodeBlock({
        lang: 'js',
        code: `import { registerStyle, setStyle } from 'decantr/css';
import { myStyle } from './styles/my-style.js';

registerStyle(myStyle);
setStyle('my-style');`,
      }),

      H2('Creating a Recipe'),
      P('Recipes define how patterns should look with your style:'),

      CodeBlock({
        lang: 'json',
        code: `{
  "name": "my-recipe",
  "style": "my-style",
  "pattern_preferences": {
    "default_presets": {
      "hero": "landing",
      "card-grid": "icon"
    }
  },
  "spatial_hints": {
    "card_wrapping": "always",
    "content_gap_shift": 0
  },
  "skeleton": {
    "nav_style": "pill",
    "nav_width": "260px"
  },
  "pattern_overrides": {
    "hero": {
      "background": "linear-gradient(135deg, var(--c-primary)/10, transparent)"
    }
  }
}`,
      }),

      H3('Recipe Fields'),
      List(
        'pattern_preferences: Default presets for each pattern',
        'spatial_hints: Spacing and wrapping behavior',
        'skeleton: Shell/layout configuration',
        'pattern_overrides: Background effects per pattern',
      ),

      H2('Testing Your Theme'),
      PromptExample('Apply my-style and my-recipe to the current project to test'),

      P('Use the Explorer to preview your theme across all components:'),

      CodeBlock({
        lang: 'bash',
        code: `npm run dev
# Open http://localhost:3000/explorer
# Select your style from the dropdown`,
      }),

      Callout({ type: 'tip', title: 'Iterate Visually' },
        P('Use the Theme Studio (/explorer/tools) to adjust colors and see changes in real-time.'),
      ),

      RelatedLinks([
        { label: 'Publishing to Registry', path: '/docs/customizing/publishing', iconName: 'package' },
        { label: 'Themes & Recipes', path: '/docs/styling/themes', iconName: 'palette' },
      ]),
    ),
  );
}
