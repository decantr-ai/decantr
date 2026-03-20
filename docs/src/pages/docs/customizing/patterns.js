import { NewDocsShell } from '../../../layouts/docs-shell.js';
import { Prose, H2, H3, P, List, Code, CodeBlock, Callout, PromptExample, RelatedLinks, Strong } from '../../../components/docs-prose.js';

const headings = [
  { id: 'what-are-patterns', label: 'What Are Patterns?', level: 2 },
  { id: 'creating-a-local-pattern', label: 'Creating a Local Pattern', level: 2 },
  { id: 'pattern-structure', label: 'Pattern Structure', level: 2 },
  { id: 'pattern-presets', label: 'Pattern Presets', level: 2 },
  { id: 'using-local-patterns', label: 'Using Local Patterns', level: 2 },
];

export function CreatingPatternsPage() {
  return NewDocsShell(
    {
      title: 'Creating Patterns',
      breadcrumbs: [
        { label: 'Customizing', path: '/docs/customizing/patterns' },
        { label: 'Creating Patterns', path: '/docs/customizing/patterns' },
      ],
      headings,
    },
    Prose(
      P('Patterns are reusable layout compositions. Learn how to create your own for project-specific needs.'),

      H2('What Are Patterns?'),
      P('Patterns are higher-level components that combine multiple UI elements into a cohesive layout. Examples:'),

      List(
        'hero: Landing page hero section',
        'card-grid: Grid of feature or product cards',
        'data-table: Sortable, filterable table',
        'form-sections: Multi-section form layout',
      ),

      P('Registry patterns cover common use cases. For unique needs, create local patterns.'),

      H2('Creating a Local Pattern'),
      P('Local patterns live in ', Code('src/patterns/'), ':'),

      PromptExample('Create a local pattern called "team-grid" that shows team member cards with photo, name, role, and social links'),

      P('AI creates:'),

      CodeBlock({
        lang: 'text',
        code: `src/patterns/
└── team-grid.js    # Pattern component`,
      }),

      H2('Pattern Structure'),
      P('A pattern file exports a function that returns a DOM element:'),

      CodeBlock({
        lang: 'js',
        code: `// src/patterns/team-grid.js
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Card, icon } from 'decantr/components';

const { div, img, h3, p, a } = tags;

// Sample data (replaced with props in production)
const TEAM = [
  { name: 'Alex Chen', role: 'CEO', photo: '/team/alex.jpg', twitter: '@alexchen' },
  // ...
];

export function TeamGridPattern({ members = TEAM } = {}) {
  return div({ class: css('_grid _gc3 _gap6 _md:gc2 _sm:gc1') },
    ...members.map(member =>
      Card({ class: css('_flex _col _aic _p6 _textc') },
        img({ src: member.photo, class: css('_w[80px] _h[80px] _r[50%] _objcover _mb4') }),
        h3({ class: css('_label _bold') }, member.name),
        p({ class: css('_textsm _fgmutedfg _mb3') }, member.role),
        div({ class: css('_flex _gap3') },
          a({ href: \`https://twitter.com/\${member.twitter}\`, class: css('_fgmutedfg _hover:fgprimary') },
            icon('twitter', { size: '18px' })
          ),
        ),
      )
    ),
  );
}`,
      }),

      H2('Pattern Presets'),
      P('Patterns can have presets — structural variants:'),

      CodeBlock({
        lang: 'js',
        code: `export function TeamGridPattern({ preset = 'standard', members = TEAM } = {}) {
  const presets = {
    standard: css('_grid _gc3 _gap6'),
    compact: css('_grid _gc4 _gap4'),
    featured: css('_grid _gc1 _gap8'),
  };

  return div({ class: presets[preset] || presets.standard },
    // ... render members
  );
}`,
      }),

      H2('Using Local Patterns'),
      P('Reference local patterns in your Essence with the ', Code('local:'), ' prefix:'),

      CodeBlock({
        lang: 'json',
        code: `{
  "id": "about",
  "skeleton": "top-nav-main",
  "blend": [
    "hero",
    { "pattern": "local:team-grid", "preset": "standard" }
  ]
}`,
      }),

      PromptExample('Add the team-grid pattern to the about page'),

      Callout({ type: 'tip', title: 'Pattern Guidelines' },
        P('Patterns should be self-contained, accept props for data, and use semantic styling (atoms, not hardcoded colors).'),
      ),

      RelatedLinks([
        { label: 'Creating Themes', path: '/docs/customizing/themes', iconName: 'brush' },
        { label: 'Publishing to Registry', path: '/docs/customizing/publishing', iconName: 'package' },
      ]),
    ),
  );
}
