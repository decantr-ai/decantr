import { NewDocsShell } from '../../../layouts/docs-shell.js';
import { Prose, H2, H3, P, List, Code, CodeBlock, Callout, PromptExample, RelatedLinks, Strong } from '../../../components/docs-prose.js';

const headings = [
  { id: 'prompt-structure', label: 'Prompt Structure', level: 2 },
  { id: 'context-prompts', label: 'Context Prompts', level: 2 },
  { id: 'modification-prompts', label: 'Modification Prompts', level: 2 },
  { id: 'style-prompts', label: 'Style Prompts', level: 2 },
  { id: 'debugging-prompts', label: 'Debugging Prompts', level: 2 },
  { id: 'anti-patterns', label: 'Anti-Patterns', level: 2 },
];

export function PromptPatternsPage() {
  return NewDocsShell(
    {
      title: 'Prompt Patterns',
      breadcrumbs: [
        { label: 'Building', path: '/docs/building/pages' },
        { label: 'Prompt Patterns', path: '/docs/building/prompts' },
      ],
      headings,
    },
    Prose(
      P('Master the art of prompting AI to build exactly what you want in Decantr.'),

      H2('Prompt Structure'),
      P('Effective Decantr prompts follow a pattern:'),

      CodeBlock({
        lang: 'text',
        code: `[ACTION] [WHAT] [WHERE] [HOW/CONSTRAINTS]

Examples:
- Add a search bar to the header with Cmd+K shortcut
- Change the card grid to show 4 columns on desktop
- Remove the footer from the landing page
- Fix the button hover state to use primary color`,
      }),

      H2('Context Prompts'),
      P('Start with context when working on specific files:'),

      PromptExample('Looking at src/pages/dashboard.js, add a KPI grid at the top showing total users, revenue, and active subscriptions'),

      PromptExample('In the customers page, the data table needs a column for subscription status'),

      Callout({ type: 'tip', title: 'Reference Files' },
        P('Mentioning specific files helps AI understand scope and find the right code to modify.'),
      ),

      H2('Modification Prompts'),
      P('When changing existing features:'),

      H3('Adding'),
      PromptExample('Add a "Last Active" column to the users table'),

      H3('Removing'),
      PromptExample('Remove the sidebar from the login page'),

      H3('Moving'),
      PromptExample('Move the search bar from the sidebar to the header'),

      H3('Replacing'),
      PromptExample('Replace the static logo with an animated SVG logo'),

      H2('Style Prompts'),
      P('For visual changes:'),

      H3('Colors'),
      PromptExample('Change the primary color to a deep purple (#7c3aed)'),

      H3('Spacing'),
      PromptExample('Increase the padding in all cards from 16px to 24px'),

      H3('Effects'),
      PromptExample('Add a subtle glass effect to the sidebar'),

      H3('Animations'),
      PromptExample('Add a fade-in animation when pages load'),

      H2('Debugging Prompts'),
      P('When things go wrong:'),

      PromptExample('The button click handler isn\'t working. Check src/pages/settings.js'),

      PromptExample('The layout breaks on mobile. Fix the responsive behavior'),

      PromptExample('The data table isn\'t showing any data. Debug the fetch logic'),

      Callout({ type: 'info', title: 'Describe the Problem' },
        P('Include what you expected vs. what happened. The more context, the faster AI can diagnose.'),
      ),

      H2('Anti-Patterns'),
      P('Prompts to avoid:'),

      H3('Too Vague'),
      CodeBlock({
        lang: 'text',
        code: `Bad: "Make it look better"
Good: "Add more whitespace between sections and use a softer background color"`,
      }),

      H3('Too Implementation-Focused'),
      CodeBlock({
        lang: 'text',
        code: `Bad: "Add a useState hook for the modal"
Good: "Add a modal that opens when clicking the Edit button"`,
      }),

      H3('Contradicting the Essence'),
      CodeBlock({
        lang: 'text',
        code: `Bad: "Use a glassmorphism style" (when Essence says auradecantism)
Good: "Update the Essence to use glassmorphism, then restyle the app"`,
      }),

      RelatedLinks([
        { label: 'Working with Essence', path: '/docs/building/essence', iconName: 'file-code' },
        { label: 'Your First Prompt', path: '/docs/first-prompt', iconName: 'message-square' },
      ]),
    ),
  );
}
