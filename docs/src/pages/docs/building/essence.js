import { NewDocsShell } from '../../../layouts/docs-shell.js';
import { Prose, H2, H3, P, List, Code, CodeBlock, Callout, PromptExample, RelatedLinks, Strong } from '../../../components/docs-prose.js';

const headings = [
  { id: 'what-is-the-essence', label: 'What is the Essence?', level: 2 },
  { id: 'essence-schema', label: 'Essence Schema', level: 2 },
  { id: 'reading-the-essence', label: 'Reading the Essence', level: 2 },
  { id: 'modifying-the-essence', label: 'Modifying the Essence', level: 2 },
  { id: 'cork-enforcement', label: 'Cork Enforcement', level: 2 },
];

export function WorkingWithEssencePage() {
  return NewDocsShell(
    {
      title: 'Working with Essence',
      breadcrumbs: [
        { label: 'Building', path: '/docs/building/pages' },
        { label: 'Working with Essence', path: '/docs/building/essence' },
      ],
      headings,
    },
    Prose(
      P('The ', Code('decantr.essence.json'), ' file is the DNA of your project. Learn how to read, modify, and enforce it.'),

      H2('What is the Essence?'),
      P('The Essence file captures every design decision made during the Decantation Process:'),

      List(
        'Domain archetype (Terroir)',
        'Visual style configuration (Vintage)',
        'Personality traits (Character)',
        'Page structure and layouts',
        'Integrated systems (Tannins)',
        'Enforcement rules (Cork)',
      ),

      Callout({ type: 'warning', title: 'Source of Truth' },
        P('AI reads the Essence before generating any code. If the Essence is wrong, the code will be wrong. Keep it accurate.'),
      ),

      H2('Essence Schema'),
      P('A complete Essence file:'),

      CodeBlock({
        lang: 'json',
        code: `{
  "version": "1.0.0",
  "terroir": "saas-dashboard",
  "vintage": {
    "style": "auradecantism",
    "mode": "dark",
    "recipe": "auradecantism",
    "shape": "rounded"
  },
  "character": ["professional", "data-rich", "minimal"],
  "vessel": {
    "type": "spa",
    "routing": "hash"
  },
  "structure": [
    {
      "id": "overview",
      "skeleton": "sidebar-main",
      "blend": ["kpi-grid", "data-table"]
    }
  ],
  "tannins": ["auth", "realtime-data"],
  "cork": {
    "enforce_style": true,
    "enforce_recipe": true,
    "mode": "maintenance"
  },
  "clarity": {
    "density": "comfortable",
    "content_gap": "_gap4"
  }
}`,
      }),

      H3('Key Sections'),
      List(
        'terroir: Domain archetype from the registry',
        'vintage: Style, mode, recipe, and shape settings',
        'character: Personality traits that guide AI decisions',
        'vessel: App type (spa/mpa) and routing mode',
        'structure: Array of page definitions',
        'tannins: Array of integrated systems',
        'cork: Enforcement settings',
        'clarity: Spacing and density configuration',
      ),

      H2('Reading the Essence'),
      P('Before making any change, prompt AI to read the Essence:'),

      PromptExample('Read my decantr.essence.json and summarize the current project setup'),

      P('This ensures AI understands your project\'s constraints before generating code.'),

      H2('Modifying the Essence'),
      P('There are two ways to modify the Essence:'),

      H3('Through Prompts'),
      PromptExample('Add a new page called "analytics" with a chart grid and data table'),

      P('AI will update the Essence structure and generate the corresponding code.'),

      H3('Direct Editing'),
      P('You can edit the Essence file directly. Common modifications:'),

      CodeBlock({
        lang: 'json',
        code: `// Add a new page
"structure": [
  // ... existing pages
  {
    "id": "analytics",
    "skeleton": "sidebar-main",
    "blend": ["chart-grid", "data-table"]
  }
]

// Change the style
"vintage": {
  "style": "glassmorphism",
  "mode": "dark"
}

// Add a tannin
"tannins": ["auth", "realtime-data", "analytics"]`,
      }),

      Callout({ type: 'tip', title: 'Validate After Editing' },
        P('Run ', Code('npx decantr validate'), ' after editing the Essence to check for errors.'),
      ),

      H2('Cork Enforcement'),
      P('Cork rules prevent drift from your design decisions:'),

      CodeBlock({
        lang: 'json',
        code: `"cork": {
  "enforce_style": true,    // AI must use the specified style
  "enforce_recipe": true,   // AI must follow recipe patterns
  "mode": "maintenance"     // strict | guided | creative
}`,
      }),

      H3('Enforcement Modes'),
      List(
        'strict: All 5 Cork rules enforced exactly',
        'guided: Structure enforced, layout flexible',
        'creative: Rules are advisory, for initial scaffolding',
      ),

      P('When AI tries to deviate from the Essence, Cork enforcement flags it:'),

      PromptExample('I want to use glassmorphism on this page'),

      P('AI response: "Your Essence specifies auradecantism style with enforce_style: true. To use glassmorphism, update the Essence first. Would you like me to update it?"'),

      RelatedLinks([
        { label: 'The Decantation Process', path: '/docs/decantation', iconName: 'wine' },
        { label: 'Adding Pages', path: '/docs/building/pages', iconName: 'file' },
      ]),
    ),
  );
}
