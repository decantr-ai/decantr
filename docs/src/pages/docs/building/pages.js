import { NewDocsShell } from '../../../layouts/docs-shell.js';
import { Prose, H2, H3, P, List, Code, CodeBlock, Callout, PromptExample, RelatedLinks, Strong } from '../../../components/docs-prose.js';

const headings = [
  { id: 'page-basics', label: 'Page Basics', level: 2 },
  { id: 'creating-a-new-page', label: 'Creating a New Page', level: 2 },
  { id: 'page-structure', label: 'Page Structure', level: 2 },
  { id: 'routing', label: 'Routing', level: 2 },
  { id: 'layouts-and-skeletons', label: 'Layouts and Skeletons', level: 2 },
];

export function AddingPagesPage() {
  return NewDocsShell(
    {
      title: 'Adding Pages',
      breadcrumbs: [
        { label: 'Building', path: '/docs/building/pages' },
        { label: 'Adding Pages', path: '/docs/building/pages' },
      ],
      headings,
    },
    Prose(
      P('Learn how to add new pages to your Decantr application using prompts and the Essence file.'),

      H2('Page Basics'),
      P('In Decantr, pages are defined in two places:'),
      List(
        'The Essence file (decantr.essence.json) — declares the page structure',
        'The src/pages/ directory — contains the page code',
      ),

      Callout({ type: 'info', title: 'Essence First' },
        P('Always add pages to the Essence file first. AI uses this to understand your project structure and generate consistent code.'),
      ),

      H2('Creating a New Page'),
      P('The easiest way to add a page is to prompt AI:'),

      PromptExample('Add a settings page with user profile form, notification preferences, and account management sections'),

      P('AI will:'),
      List(
        'Add the page to your Essence structure',
        'Select appropriate patterns for each section',
        'Generate the page code',
        'Add the route',
      ),

      H2('Page Structure'),
      P('Each page in the Essence has this structure:'),

      CodeBlock({
        lang: 'json',
        code: `{
  "id": "settings",
  "path": "/settings",
  "skeleton": "sidebar-main",
  "blend": [
    { "pattern": "detail-header", "preset": "profile" },
    { "pattern": "form-sections", "preset": "settings" }
  ],
  "surface": "_flex _col _gap4 _p4"
}`,
      }),

      H3('Page Fields'),
      List(
        'id: Unique identifier for the page',
        'path: URL path (optional, defaults to /id)',
        'skeleton: Layout preset (sidebar-main, top-nav-main, full-bleed)',
        'blend: Array of patterns that compose the page',
        'surface: Container styling atoms',
      ),

      H2('Routing'),
      P('Routes are automatically generated from the Essence structure. Dynamic routes use the ', Code(':param'), ' syntax:'),

      CodeBlock({
        lang: 'json',
        code: `{
  "id": "customer-detail",
  "path": "/customers/:id",
  "skeleton": "sidebar-main",
  "blend": ["detail-header", "data-table"]
}`,
      }),

      H2('Layouts and Skeletons'),
      P('Skeletons define the overall page layout:'),

      List(
        'sidebar-main: Left sidebar with main content area',
        'top-nav-main: Top navigation with full-width content',
        'sidebar-aside: Left sidebar, main content, right aside',
        'full-bleed: No navigation, edge-to-edge content',
      ),

      PromptExample('Change the dashboard page from sidebar-main to top-nav-main layout'),

      RelatedLinks([
        { label: 'Adding Features', path: '/docs/building/features', iconName: 'sparkles' },
        { label: 'Working with Essence', path: '/docs/building/essence', iconName: 'file-code' },
      ]),
    ),
  );
}
