import { NewDocsShell } from '../../../layouts/docs-shell.js';
import { Prose, H2, H3, P, List, Code, CodeBlock, Callout, PromptExample, RelatedLinks, Strong } from '../../../components/docs-prose.js';

const headings = [
  { id: 'feature-prompting', label: 'Feature Prompting', level: 2 },
  { id: 'ui-features', label: 'UI Features', level: 2 },
  { id: 'data-features', label: 'Data Features', level: 2 },
  { id: 'interactive-features', label: 'Interactive Features', level: 2 },
  { id: 'tannins', label: 'Tannins (System Features)', level: 2 },
];

export function AddingFeaturesPage() {
  return NewDocsShell(
    {
      title: 'Adding Features',
      breadcrumbs: [
        { label: 'Building', path: '/docs/building/pages' },
        { label: 'Adding Features', path: '/docs/building/features' },
      ],
      headings,
    },
    Prose(
      P('Learn how to add features to your Decantr application through effective prompting.'),

      H2('Feature Prompting'),
      P('Features in Decantr are added through natural language prompts. The key is being specific about ', Strong('what'), ', ', Strong('where'), ', and ', Strong('how'), '.'),

      Callout({ type: 'tip', title: 'Be Specific' },
        P('The more specific your prompt, the better the result. "Add a search" is vague. "Add a command palette search that opens with Cmd+K and searches pages, components, and actions" is specific.'),
      ),

      H2('UI Features'),
      P('Common UI feature prompts:'),

      H3('Navigation'),
      PromptExample('Add a breadcrumb navigation to all pages that shows the current path'),

      H3('Modals'),
      PromptExample('Add a confirmation modal that appears before deleting items'),

      H3('Notifications'),
      PromptExample('Add a toast notification system for success/error messages'),

      H3('Search'),
      PromptExample('Add a command palette (Cmd+K) that searches across all pages and actions'),

      H2('Data Features'),
      P('Features that involve data management:'),

      H3('Tables'),
      PromptExample('Add a data table to the customers page with sorting, filtering, and pagination'),

      H3('Forms'),
      PromptExample('Add a multi-step form for user onboarding with validation'),

      H3('Charts'),
      PromptExample('Add a line chart showing revenue over time to the dashboard'),

      H2('Interactive Features'),
      P('Features that add interactivity:'),

      H3('Drag and Drop'),
      PromptExample('Make the task list sortable with drag and drop'),

      H3('Keyboard Shortcuts'),
      PromptExample('Add keyboard shortcuts: Cmd+N for new item, Cmd+S for save'),

      H3('Real-time Updates'),
      PromptExample('Add real-time updates to the activity feed using WebSocket'),

      H2('Tannins (System Features)'),
      P('Tannins are system-level features that integrate across your app:'),

      List(
        'auth: Authentication and authorization',
        'payments: Payment processing',
        'realtime-data: WebSocket/SSE data syncing',
        'analytics: Usage tracking',
        'i18n: Internationalization',
      ),

      P('Add a tannin by prompting:'),

      PromptExample('Add authentication with email/password login and OAuth for Google and GitHub'),

      Callout({ type: 'info', title: 'Tannins Update the Essence' },
        P('When you add a tannin, AI updates your Essence file to track it. This ensures consistency across your app.'),
      ),

      RelatedLinks([
        { label: 'Prompt Patterns', path: '/docs/building/prompts', iconName: 'lightbulb' },
        { label: 'Working with Essence', path: '/docs/building/essence', iconName: 'file-code' },
      ]),
    ),
  );
}
