import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon } from 'decantr/components';
import { NewDocsShell } from '../../layouts/docs-shell.js';
import { Prose, H2, H3, P, List, Code, CodeBlock, Callout, PromptExample, RelatedLinks, Strong } from '../../components/docs-prose.js';

const { div, span } = tags;

const headings = [
  { id: 'what-is-decantation', label: 'What is Decantation?', level: 2 },
  { id: 'the-five-stages', label: 'The Five Stages', level: 2 },
  { id: 'stage-1-pour', label: 'Stage 1: POUR', level: 3 },
  { id: 'stage-2-settle', label: 'Stage 2: SETTLE', level: 3 },
  { id: 'stage-3-clarify', label: 'Stage 3: CLARIFY', level: 3 },
  { id: 'stage-4-decant', label: 'Stage 4: DECANT', level: 3 },
  { id: 'stage-5-serve', label: 'Stage 5: SERVE', level: 3 },
  { id: 'the-essence-file', label: 'The Essence File', level: 2 },
  { id: 'ongoing-aging', label: 'Ongoing: AGE', level: 2 },
];

// Stage card component
function StageCard({ number, name, description, iconName }) {
  return div({ class: css('_flex _gap4 _p4 _r2 _bgmuted/20 _border _bcborder/30') },
    div({ class: css('_flex _aic _jcc _w[48px] _h[48px] _r2 _bgprimary/15 _fgprimary _shrink0') },
      icon(iconName, { size: '24px' }),
    ),
    div({ class: css('_flex _col _gap1') },
      div({ class: css('_flex _aic _gap2') },
        span({ class: css('_caption _fgprimary _fw[600]') }, `STAGE ${number}`),
        span({ class: css('_label _bold _fgfg') }, name),
      ),
      P(description),
    ),
  );
}

export function DecantationPage() {
  return NewDocsShell(
    {
      title: 'The Decantation Process',
      breadcrumbs: [{ label: 'The Decantation Process', path: '/docs/decantation' }],
      headings,
    },
    Prose(
      P('The Decantation Process is Decantr\'s structured workflow for turning your ideas into fully-realized applications. It guides both you and AI through a series of stages that ensure quality, consistency, and alignment with your vision.'),

      H2('What is Decantation?'),
      P('Like decanting wine separates sediment from the pure liquid, the Decantation Process separates your raw ideas into structured, actionable specifications. It\'s a ', Strong('collaboration protocol'), ' between you and AI.'),

      Callout({ type: 'info', title: 'Why Process Matters' },
        P('Without structure, AI tends to make assumptions. The Decantation Process ensures AI understands your intent before generating code.'),
      ),

      H2('The Five Stages'),

      div({ class: css('_flex _col _gap4 _my4') },
        StageCard({
          number: 1,
          name: 'POUR',
          description: 'You express your intent in natural language. Describe what you want to build, who it\'s for, and how it should feel.',
          iconName: 'message-square',
        }),
        StageCard({
          number: 2,
          name: 'SETTLE',
          description: 'AI decomposes your intent into five layers: Terroir (domain), Vintage (style), Character (personality), Structure (pages), and Tannins (systems).',
          iconName: 'layers',
        }),
        StageCard({
          number: 3,
          name: 'CLARIFY',
          description: 'AI generates a decantr.essence.json file capturing all decisions. You review and confirm before any code is written.',
          iconName: 'file-check',
        }),
        StageCard({
          number: 4,
          name: 'DECANT',
          description: 'AI resolves each page\'s spatial arrangement (Blend) based on the Essence. Patterns are selected and composed.',
          iconName: 'layout',
        }),
        StageCard({
          number: 5,
          name: 'SERVE',
          description: 'AI generates code from the Blend specifications. Each page is built according to the confirmed structure.',
          iconName: 'code',
        }),
      ),

      H3('Stage 1: POUR', 'stage-1-pour'),
      P('Start by describing your project. Be as detailed or as vague as you like — AI will ask clarifying questions.'),

      PromptExample('I want to build a SaaS dashboard for managing customer subscriptions. It should feel professional but modern, with a dark theme. Key features: subscription overview, customer list, billing history, and settings.'),

      H3('Stage 2: SETTLE', 'stage-2-settle'),
      P('AI analyzes your POUR and decomposes it into five layers:'),

      List(
        'Terroir: The domain archetype (saas-dashboard, portfolio, docs-site)',
        'Vintage: Visual style + mode + recipe (auradecantism, dark, rounded)',
        'Character: Personality traits (professional, data-rich, minimal)',
        'Structure: Page/view map with layout assignments',
        'Tannins: Functional systems (auth, payments, realtime-data)',
      ),

      H3('Stage 3: CLARIFY', 'stage-3-clarify'),
      P('AI generates a ', Code('decantr.essence.json'), ' file — the DNA of your project. Review it carefully:'),

      CodeBlock({
        lang: 'json',
        code: `{
  "terroir": "saas-dashboard",
  "vintage": { "style": "auradecantism", "mode": "dark" },
  "character": ["professional", "data-rich"],
  "structure": [
    { "id": "overview", "skeleton": "sidebar-main", "blend": ["kpi-grid", "data-table"] },
    { "id": "customers", "skeleton": "sidebar-main", "blend": ["filter-bar", "data-table"] }
  ],
  "tannins": ["auth", "payments"]
}`,
      }),

      Callout({ type: 'warning', title: 'Always Review the Essence' },
        P('The Essence file is your contract with AI. Once confirmed, all code generation follows it. Take time to verify it matches your intent.'),
      ),

      H3('Stage 4: DECANT', 'stage-4-decant'),
      P('AI resolves the spatial arrangement for each page. Patterns are selected from the registry and composed into a Blend:'),

      CodeBlock({
        lang: 'json',
        code: `"blend": [
  { "pattern": "kpi-grid", "preset": "standard" },
  { "cols": ["filter-bar", "data-table"], "at": "lg" }
]`,
      }),

      H3('Stage 5: SERVE', 'stage-5-serve'),
      P('AI generates the actual code. Each page follows its Blend specification exactly. You can now run the app and see your vision realized.'),

      H2('The Essence File'),
      P('The ', Code('decantr.essence.json'), ' file is the heart of your project. It captures every decision made during Decantation and serves as the source of truth for all code generation.'),

      P('Key sections:'),
      List(
        'terroir: Domain archetype',
        'vintage: Style configuration',
        'character: Personality traits',
        'structure: Page definitions and layouts',
        'tannins: Integrated systems',
        'cork: Enforcement rules',
      ),

      H2('Ongoing: AGE'),
      P('After initial creation, your project enters the ', Strong('AGE'), ' phase. Every time you or AI make changes:'),

      List(
        'Read the Essence file first',
        'Verify changes align with the established style',
        'Update the Essence if the scope changes',
        'Guard against drift from the original vision',
      ),

      Callout({ type: 'tip', title: 'Cork Rules' },
        P('Cork enforcement prevents drift. The Essence\'s cork.enforce_style and cork.enforce_recipe settings ensure AI respects your design decisions.'),
      ),

      RelatedLinks([
        { label: 'Working with Essence', path: '/docs/building/essence', iconName: 'file-code' },
        { label: 'Adding Pages', path: '/docs/building/pages', iconName: 'file' },
      ]),
    ),
  );
}
