import { NewDocsShell } from '../../layouts/docs-shell.js';
import { Prose, H2, H3, P, List, Code, CodeBlock, Callout, PromptExample, RelatedLinks, Strong, Link } from '../../components/docs-prose.js';

const headings = [
  { id: 'the-prompt-first-approach', label: 'The Prompt-First Approach', level: 2 },
  { id: 'anatomy-of-a-good-prompt', label: 'Anatomy of a Good Prompt', level: 2 },
  { id: 'your-first-feature', label: 'Your First Feature', level: 2 },
  { id: 'iterating-with-ai', label: 'Iterating with AI', level: 2 },
  { id: 'common-patterns', label: 'Common Patterns', level: 2 },
];

export function FirstPromptPage() {
  return NewDocsShell(
    {
      title: 'Your First Prompt',
      breadcrumbs: [{ label: 'Your First Prompt', path: '/docs/first-prompt' }],
      headings,
    },
    Prose(
      P('Learn how to communicate with AI to build your first feature in Decantr.'),

      H2('The Prompt-First Approach'),
      P('Decantr is built for a new way of working: you describe what you want in natural language, and AI generates the code. Your job is to be a good ', Strong('director'), ' — clear about what you want, specific about constraints, and iterative in your feedback.'),

      Callout({ type: 'tip', title: 'Think Like a Director' },
        P('You\'re not writing code — you\'re directing a scene. Describe the outcome, not the implementation.'),
      ),

      H2('Anatomy of a Good Prompt'),
      P('A good Decantr prompt has three parts:'),

      List(
        'What you want (the feature or change)',
        'Where it goes (page, section, component)',
        'How it should feel (style, behavior, constraints)',
      ),

      H3('Example: Bad Prompt'),
      CodeBlock({
        lang: 'text',
        code: `"Add a button"`,
      }),
      P('Too vague. What kind of button? Where? What does it do?'),

      H3('Example: Good Prompt'),
      PromptExample('Add a "Get Started" button to the hero section that navigates to /docs/quick-setup. Use the primary color with a subtle glow effect on hover.'),

      P('This tells AI exactly what to build, where to put it, and how it should look.'),

      H2('Your First Feature'),
      P('Let\'s add a feature to your project. Open your AI assistant and try this prompt:'),

      PromptExample('Create a landing page with: 1) A hero section with headline "Welcome to My App" and a brief tagline, 2) A feature grid with 3 cards highlighting key benefits, 3) A call-to-action section at the bottom'),

      P('AI will generate a complete page using Decantr patterns. It understands:'),
      List(
        'The pattern library (hero, card-grid, cta-section)',
        'The styling system (atoms, recipes)',
        'The component API (Card, Button, icon)',
      ),

      H2('Iterating with AI'),
      P('Rarely is the first output perfect. Iterate with follow-up prompts:'),

      PromptExample('Make the hero headline larger and add a gradient effect'),

      PromptExample('Change the feature cards to use icons instead of images'),

      PromptExample('Add subtle entrance animations to each section'),

      Callout({ type: 'info', title: 'Context Matters' },
        P('AI remembers the conversation context. Build on previous prompts rather than starting over.'),
      ),

      H2('Common Patterns'),
      P('Here are prompts that work well with Decantr:'),

      H3('Adding Pages'),
      PromptExample('Add a pricing page with three tiers: Free, Pro, and Enterprise'),

      H3('Modifying Layout'),
      PromptExample('Change the navigation from top-nav to a sidebar layout'),

      H3('Styling'),
      PromptExample('Switch the theme to glassmorphism with dark mode'),

      H3('Adding Features'),
      PromptExample('Add a search command palette that opens with Cmd+K'),

      RelatedLinks([
        { label: 'The Decantation Process', path: '/docs/decantation', iconName: 'wine' },
        { label: 'Prompt Patterns', path: '/docs/building/prompts', iconName: 'lightbulb' },
      ]),
    ),
  );
}
