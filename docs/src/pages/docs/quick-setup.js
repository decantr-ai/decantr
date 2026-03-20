import { NewDocsShell } from '../../layouts/docs-shell.js';
import { Prose, H2, H3, P, List, Code, CodeBlock, Callout, PromptExample, RelatedLinks, Strong } from '../../components/docs-prose.js';

const headings = [
  { id: 'prerequisites', label: 'Prerequisites', level: 2 },
  { id: 'installation', label: 'Installation', level: 2 },
  { id: 'create-project', label: 'Create a Project', level: 2 },
  { id: 'start-dev-server', label: 'Start Dev Server', level: 2 },
  { id: 'next-steps', label: 'Next Steps', level: 2 },
];

export function QuickSetupPage() {
  return NewDocsShell(
    {
      title: 'Quick Setup',
      breadcrumbs: [{ label: 'Quick Setup', path: '/docs/quick-setup' }],
      headings,
    },
    Prose(
      P('Get Decantr installed and create your first project in under 2 minutes.'),

      H2('Prerequisites'),
      List(
        'Node.js 18+ installed',
        'A code editor (VS Code recommended)',
        'An AI assistant (Claude, GPT, or Cursor)',
      ),

      Callout({ type: 'tip', title: 'AI-Native Development' },
        P('Decantr is designed to work ', Strong('with'), ' AI, not against it. Have your AI assistant ready — you\'ll be prompting it to build your app.'),
      ),

      H2('Installation'),
      P('Install Decantr globally or use npx:'),

      CodeBlock({
        lang: 'bash',
        code: `# Using npm
npm install -g decantr

# Or use npx (no install needed)
npx decantr create my-app`,
      }),

      H2('Create a Project'),
      P('Create a new project with the CLI:'),

      CodeBlock({
        lang: 'bash',
        code: `npx decantr create my-app
cd my-app`,
      }),

      P('This creates a minimal project structure:'),

      CodeBlock({
        lang: 'text',
        code: `my-app/
├── src/
│   ├── app.js          # Entry point
│   └── pages/          # Route pages
├── public/
│   └── index.html      # HTML shell
├── decantr.config.json # Project config
└── package.json`,
      }),

      H2('Start Dev Server'),
      P('Start the development server:'),

      CodeBlock({
        lang: 'bash',
        code: `npm run dev`,
      }),

      P('Open ', Code('http://localhost:3000'), ' to see your app.'),

      Callout({ type: 'info', title: 'Hot Reload' },
        P('The dev server supports hot module replacement. Changes appear instantly without full page refresh.'),
      ),

      H2('Next Steps'),
      P('Now that you have a project running, learn how to work with AI to build features:'),

      PromptExample('Add a landing page with a hero section and feature grid'),

      RelatedLinks([
        { label: 'Your First Prompt', path: '/docs/first-prompt', iconName: 'message-square' },
        { label: 'The Decantation Process', path: '/docs/decantation', iconName: 'wine' },
      ]),
    ),
  );
}
