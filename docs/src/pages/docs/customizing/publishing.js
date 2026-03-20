import { NewDocsShell } from '../../../layouts/docs-shell.js';
import { Prose, H2, H3, P, List, Code, CodeBlock, Callout, PromptExample, RelatedLinks, Strong } from '../../../components/docs-prose.js';

const headings = [
  { id: 'what-can-you-publish', label: 'What Can You Publish?', level: 2 },
  { id: 'preparing-for-publication', label: 'Preparing for Publication', level: 2 },
  { id: 'publishing-process', label: 'Publishing Process', level: 2 },
  { id: 'registry-guidelines', label: 'Registry Guidelines', level: 2 },
];

export function PublishingPage() {
  return NewDocsShell(
    {
      title: 'Publishing to Registry',
      breadcrumbs: [
        { label: 'Customizing', path: '/docs/customizing/patterns' },
        { label: 'Publishing to Registry', path: '/docs/customizing/publishing' },
      ],
      headings,
    },
    Prose(
      P('Share your patterns, styles, and recipes with the Decantr community by publishing to the registry.'),

      H2('What Can You Publish?'),
      P('The registry accepts:'),

      List(
        'Patterns: Reusable layout compositions',
        'Styles: CSS theme definitions',
        'Recipes: Style + pattern configurations',
        'Archetypes: Domain-specific project templates',
      ),

      H2('Preparing for Publication'),

      H3('Patterns'),
      P('Ensure your pattern:'),
      List(
        'Uses semantic styling (atoms, not hardcoded values)',
        'Accepts props for customization',
        'Includes presets for common variants',
        'Works across all modes (light/dark)',
        'Has no external dependencies',
      ),

      CodeBlock({
        lang: 'json',
        code: `// pattern.json metadata
{
  "name": "team-grid",
  "description": "Team member cards with photos and social links",
  "category": "content",
  "presets": ["standard", "compact", "featured"],
  "io": {
    "produces": [],
    "consumes": ["members"]
  }
}`,
      }),

      H3('Styles'),
      P('Ensure your style:'),
      List(
        'Defines all required tokens (--c-primary, --c-bg, etc.)',
        'Supports both light and dark modes',
        'Uses web-safe fonts or includes font imports',
        'Has no conflicting global styles',
      ),

      H3('Recipes'),
      P('Ensure your recipe:'),
      List(
        'References an existing or published style',
        'Defines sensible defaults for all patterns',
        'Includes spatial hints for consistency',
      ),

      H2('Publishing Process'),

      H3('Step 1: Create Package'),
      CodeBlock({
        lang: 'bash',
        code: `npx decantr registry package pattern/team-grid`,
      }),

      H3('Step 2: Test Locally'),
      CodeBlock({
        lang: 'bash',
        code: `npx decantr registry test pattern/team-grid`,
      }),

      H3('Step 3: Submit'),
      CodeBlock({
        lang: 'bash',
        code: `npx decantr registry submit pattern/team-grid`,
      }),

      P('This opens a PR on the registry repository. Maintainers will review and merge.'),

      H2('Registry Guidelines'),

      Callout({ type: 'warning', title: 'Quality Standards' },
        P('Registry content is curated. Low-quality or duplicate submissions will be rejected.'),
      ),

      H3('Naming'),
      List(
        'Use lowercase kebab-case: team-grid, not TeamGrid',
        'Be descriptive but concise',
        'Avoid generic names like "cool-card"',
      ),

      H3('Documentation'),
      P('Include a README with:'),
      List(
        'Description of what it does',
        'Screenshot or demo link',
        'Usage examples',
        'Available presets/props',
      ),

      H3('Licensing'),
      P('All registry content is MIT licensed. By publishing, you agree to these terms.'),

      RelatedLinks([
        { label: 'Creating Patterns', path: '/docs/customizing/patterns', iconName: 'puzzle' },
        { label: 'Creating Themes', path: '/docs/customizing/themes', iconName: 'brush' },
      ]),
    ),
  );
}
