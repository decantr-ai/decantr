/* ── Mock data for Knowledge Base showcase ── */

export interface DocNode {
  id: string;
  title: string;
  slug: string;
  children?: DocNode[];
}

export interface Article {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  lastUpdated: string;
  readTime: string;
  toc: { id: string; label: string; level: number }[];
}

export interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  summary: string;
  content: string;
  highlights: string[];
}

export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  title: string;
  group: string;
  description: string;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  responseExample: string;
}

export interface SearchResult {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  highlights: string[];
}

/* ── Docs tree ── */
export const docsTree: DocNode[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    slug: 'getting-started',
    children: [
      { id: 'installation', title: 'Installation', slug: 'installation' },
      { id: 'quickstart', title: 'Quick Start Guide', slug: 'quickstart' },
      { id: 'configuration', title: 'Configuration', slug: 'configuration' },
    ],
  },
  {
    id: 'core-concepts',
    title: 'Core Concepts',
    slug: 'core-concepts',
    children: [
      { id: 'architecture', title: 'Architecture', slug: 'architecture' },
      { id: 'design-tokens', title: 'Design Tokens', slug: 'design-tokens' },
      { id: 'theming', title: 'Theming', slug: 'theming' },
      { id: 'components', title: 'Components', slug: 'components' },
    ],
  },
  {
    id: 'guides',
    title: 'Guides',
    slug: 'guides',
    children: [
      { id: 'authentication', title: 'Authentication', slug: 'authentication' },
      { id: 'data-fetching', title: 'Data Fetching', slug: 'data-fetching' },
      { id: 'deployment', title: 'Deployment', slug: 'deployment' },
    ],
  },
  {
    id: 'api-docs',
    title: 'API Reference',
    slug: 'api-docs',
    children: [
      { id: 'hooks-ref', title: 'Hooks', slug: 'hooks-ref' },
      { id: 'utilities-ref', title: 'Utilities', slug: 'utilities-ref' },
    ],
  },
];

/* ── Articles ── */
export const articles: Record<string, Article> = {
  installation: {
    slug: 'installation',
    title: 'Installation',
    category: 'Getting Started',
    excerpt: 'Learn how to install and set up the Knowledge Base framework in your project.',
    lastUpdated: '2026-03-28',
    readTime: '3 min',
    content: `## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** version 20 or later
- **pnpm** version 9 or later
- A modern code editor (VS Code recommended)

## Install via Package Manager

Run the following command in your terminal:

\`\`\`bash
pnpm add @acme/knowledge-base
\`\`\`

## Project Structure

After installation, your project should look like this:

\`\`\`
my-project/
  src/
    pages/
    components/
    styles/
  package.json
  tsconfig.json
\`\`\`

## Verify Installation

Run the development server to verify everything is working:

\`\`\`bash
pnpm dev
\`\`\`

You should see the welcome page at \`http://localhost:5173\`.

> **Tip:** If you encounter any issues, check the troubleshooting guide or reach out on our community forum.`,
    toc: [
      { id: 'prerequisites', label: 'Prerequisites', level: 2 },
      { id: 'install-via-package-manager', label: 'Install via Package Manager', level: 2 },
      { id: 'project-structure', label: 'Project Structure', level: 2 },
      { id: 'verify-installation', label: 'Verify Installation', level: 2 },
    ],
  },
  quickstart: {
    slug: 'quickstart',
    title: 'Quick Start Guide',
    category: 'Getting Started',
    excerpt: 'Get up and running with a fully functional knowledge base in under 5 minutes.',
    lastUpdated: '2026-03-30',
    readTime: '5 min',
    content: `## Create a New Project

Use our CLI tool to scaffold a new knowledge base project:

\`\`\`bash
npx create-kb my-docs
cd my-docs
\`\`\`

## Add Your First Article

Create a new file at \`src/content/hello-world.md\`:

\`\`\`markdown
---
title: Hello World
category: Getting Started
---

Welcome to your knowledge base! This is your first article.
\`\`\`

## Customize the Theme

Open \`src/styles/tokens.css\` and modify the design tokens to match your brand:

\`\`\`css
:root {
  --d-primary: #2E8B8B;
  --d-accent: #E07B4C;
}
\`\`\`

## Deploy

When you are ready, build and deploy your knowledge base:

\`\`\`bash
pnpm build
\`\`\`

The output will be in the \`dist/\` directory, ready for any static hosting platform.`,
    toc: [
      { id: 'create-a-new-project', label: 'Create a New Project', level: 2 },
      { id: 'add-your-first-article', label: 'Add Your First Article', level: 2 },
      { id: 'customize-the-theme', label: 'Customize the Theme', level: 2 },
      { id: 'deploy', label: 'Deploy', level: 2 },
    ],
  },
  configuration: {
    slug: 'configuration',
    title: 'Configuration',
    category: 'Getting Started',
    excerpt: 'Comprehensive guide to all configuration options available in the framework.',
    lastUpdated: '2026-03-25',
    readTime: '8 min',
    content: `## Configuration File

The main configuration file is \`kb.config.ts\` in your project root:

\`\`\`typescript
export default {
  title: 'My Knowledge Base',
  description: 'Documentation for my project',
  theme: 'paper',
  search: {
    provider: 'local',
    indexFields: ['title', 'content', 'tags'],
  },
  navigation: {
    style: 'tree',
    collapsible: true,
  },
};
\`\`\`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| \`KB_PORT\` | Development server port | \`5173\` |
| \`KB_BASE_URL\` | Base URL for the site | \`/\` |
| \`KB_SEARCH_KEY\` | API key for search | \`null\` |

## Advanced Options

### Custom Plugins

You can extend functionality with plugins:

\`\`\`typescript
export default {
  plugins: [
    analyticsPlugin({ trackingId: 'UA-123456' }),
    sitemapPlugin(),
  ],
};
\`\`\`

### Internationalization

Enable multi-language support with the i18n configuration:

\`\`\`typescript
export default {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr', 'de'],
  },
};
\`\`\``,
    toc: [
      { id: 'configuration-file', label: 'Configuration File', level: 2 },
      { id: 'environment-variables', label: 'Environment Variables', level: 2 },
      { id: 'advanced-options', label: 'Advanced Options', level: 2 },
    ],
  },
  architecture: {
    slug: 'architecture',
    title: 'Architecture',
    category: 'Core Concepts',
    excerpt: 'Understand the architecture and design principles behind the knowledge base platform.',
    lastUpdated: '2026-03-20',
    readTime: '10 min',
    content: `## Overview

The knowledge base is built on a layered architecture that separates concerns into distinct modules:

1. **Content Layer** -- Manages articles, categories, and metadata
2. **Presentation Layer** -- Handles rendering, theming, and layout
3. **Search Layer** -- Provides full-text and semantic search
4. **API Layer** -- Exposes a RESTful interface for integrations

## Content Pipeline

Content flows through a well-defined pipeline:

\`\`\`
Markdown/MDX -> Parser -> AST -> Renderer -> HTML
\`\`\`

Each stage is pluggable, allowing custom transformations and extensions.

## Design Principles

- **Convention over configuration** -- Sensible defaults reduce boilerplate
- **Progressive enhancement** -- Start simple, add complexity as needed
- **Content-first** -- Every decision prioritizes the reading experience
- **Accessible by default** -- WCAG AA compliance built into every component

## Module Dependencies

\`\`\`
@acme/content -> @acme/search
@acme/content -> @acme/renderer
@acme/renderer -> @acme/theme
@acme/search -> @acme/indexer
\`\`\`

> The architecture is designed so that modules can be used independently or composed together for a full-featured documentation platform.`,
    toc: [
      { id: 'overview', label: 'Overview', level: 2 },
      { id: 'content-pipeline', label: 'Content Pipeline', level: 2 },
      { id: 'design-principles', label: 'Design Principles', level: 2 },
      { id: 'module-dependencies', label: 'Module Dependencies', level: 2 },
    ],
  },
  'design-tokens': {
    slug: 'design-tokens',
    title: 'Design Tokens',
    category: 'Core Concepts',
    excerpt: 'Learn about the design token system that powers consistent theming across your knowledge base.',
    lastUpdated: '2026-03-22',
    readTime: '6 min',
    content: `## What Are Design Tokens?

Design tokens are the atomic building blocks of a design system. They represent visual design decisions as data -- colors, spacing, typography, elevation, and motion.

## Token Categories

### Color Tokens

\`\`\`css
--d-primary: #2E8B8B;      /* Brand color */
--d-accent: #E07B4C;       /* Highlight color */
--d-bg: #FDFCFA;           /* Background */
--d-surface: #FFFFFF;      /* Card surfaces */
--d-text: #1A1918;         /* Body text */
--d-text-muted: #78756F;   /* Secondary text */
\`\`\`

### Spacing Tokens

All spacing is derived from a 4px base unit:

| Token | Value | Usage |
|-------|-------|-------|
| \`--d-gap-1\` | 4px | Tight spacing |
| \`--d-gap-2\` | 8px | Compact spacing |
| \`--d-gap-4\` | 16px | Standard content gap |
| \`--d-gap-8\` | 32px | Section spacing |

### Radius Tokens

\`\`\`css
--d-radius-sm: 4px;
--d-radius: 8px;
--d-radius-lg: 12px;
--d-radius-full: 9999px;
\`\`\`

## Using Tokens in Code

Always reference tokens through CSS custom properties:

\`\`\`css
.my-component {
  background: var(--d-surface);
  padding: var(--d-gap-4);
  border-radius: var(--d-radius);
  color: var(--d-text);
}
\`\`\``,
    toc: [
      { id: 'what-are-design-tokens', label: 'What Are Design Tokens?', level: 2 },
      { id: 'token-categories', label: 'Token Categories', level: 2 },
      { id: 'using-tokens-in-code', label: 'Using Tokens in Code', level: 2 },
    ],
  },
  theming: {
    slug: 'theming',
    title: 'Theming',
    category: 'Core Concepts',
    excerpt: 'Create custom themes and adapt the visual identity of your knowledge base.',
    lastUpdated: '2026-03-18',
    readTime: '7 min',
    content: `## Theme Structure

A theme is a collection of design tokens, decorators, and treatments that define the visual identity of your knowledge base.

## Built-in Themes

| Theme | Description |
|-------|-------------|
| Paper | Warm, reading-optimized with comfortable typography |
| Carbon | Dark, technical, data-dense |
| Aurora | Vibrant gradients with glassmorphism |

## Creating a Custom Theme

1. Define your token overrides in \`tokens.css\`
2. Create decorator classes in \`decorators.css\`
3. Register the theme in your configuration

\`\`\`css
@layer tokens {
  :root {
    --d-primary: #6366f1;
    --d-accent: #f59e0b;
    --d-bg: #fafaf9;
  }
}
\`\`\`

## Theme Switching

Toggle between themes at runtime:

\`\`\`typescript
function toggleTheme(theme: 'paper' | 'carbon' | 'aurora') {
  document.documentElement.dataset.theme = theme;
}
\`\`\``,
    toc: [
      { id: 'theme-structure', label: 'Theme Structure', level: 2 },
      { id: 'built-in-themes', label: 'Built-in Themes', level: 2 },
      { id: 'creating-a-custom-theme', label: 'Creating a Custom Theme', level: 2 },
      { id: 'theme-switching', label: 'Theme Switching', level: 2 },
    ],
  },
  components: {
    slug: 'components',
    title: 'Components',
    category: 'Core Concepts',
    excerpt: 'Explore the component library and learn how to compose UI elements.',
    lastUpdated: '2026-03-15',
    readTime: '12 min',
    content: `## Component Philosophy

Components follow a treatment-based styling approach. Each component applies visual treatments via CSS classes rather than inline styles.

## Core Components

### Button

\`\`\`tsx
<button className="d-interactive" data-variant="primary">
  Save Changes
</button>
\`\`\`

Variants: \`primary\`, \`ghost\`, \`danger\`

### Surface

\`\`\`tsx
<div className="d-surface" data-elevation="raised">
  Card content here
</div>
\`\`\`

### Control (Input)

\`\`\`tsx
<input className="d-control" placeholder="Search..." />
\`\`\`

### Annotation (Badge)

\`\`\`tsx
<span className="d-annotation" data-status="success">
  Published
</span>
\`\`\`

## Composition Patterns

Components compose together using flex and grid utilities:

\`\`\`tsx
<div className={css('_flex _col _gap4')}>
  <div className="d-surface paper-card">
    <h3>Section Title</h3>
    <p>Section content...</p>
  </div>
</div>
\`\`\``,
    toc: [
      { id: 'component-philosophy', label: 'Component Philosophy', level: 2 },
      { id: 'core-components', label: 'Core Components', level: 2 },
      { id: 'composition-patterns', label: 'Composition Patterns', level: 2 },
    ],
  },
  authentication: {
    slug: 'authentication',
    title: 'Authentication',
    category: 'Guides',
    excerpt: 'Implement authentication and authorization in your knowledge base.',
    lastUpdated: '2026-03-12',
    readTime: '9 min',
    content: `## Overview

The knowledge base supports multiple authentication strategies out of the box. Choose the one that fits your needs.

## Strategies

### Local Auth

Simple email/password authentication with session management:

\`\`\`typescript
const auth = useAuth();
auth.login(email, password);
\`\`\`

### OAuth Providers

Integrate with popular OAuth providers:

- Google
- GitHub
- Microsoft

\`\`\`typescript
auth.loginWithProvider('github');
\`\`\`

## Route Guards

Protect pages that require authentication:

\`\`\`tsx
function AuthGuard({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
}
\`\`\`

## Permissions

Define granular permissions for content access:

| Permission | Description |
|-----------|-------------|
| \`read:docs\` | View documentation |
| \`write:docs\` | Create/edit documentation |
| \`admin:users\` | Manage user accounts |`,
    toc: [
      { id: 'overview', label: 'Overview', level: 2 },
      { id: 'strategies', label: 'Strategies', level: 2 },
      { id: 'route-guards', label: 'Route Guards', level: 2 },
      { id: 'permissions', label: 'Permissions', level: 2 },
    ],
  },
  'data-fetching': {
    slug: 'data-fetching',
    title: 'Data Fetching',
    category: 'Guides',
    excerpt: 'Patterns and best practices for fetching and caching data in your knowledge base.',
    lastUpdated: '2026-03-10',
    readTime: '7 min',
    content: `## Fetching Strategies

### Static Generation

Pre-render content at build time for optimal performance:

\`\`\`typescript
export async function getStaticContent(slug: string) {
  const article = await loadArticle(slug);
  return { props: { article } };
}
\`\`\`

### On-Demand Loading

Load content dynamically when needed:

\`\`\`typescript
const { data, loading } = useContent(slug);
\`\`\`

## Caching

Content is cached at multiple levels:

1. **Browser cache** -- HTTP cache headers
2. **Service worker** -- Offline-first strategy
3. **Memory cache** -- In-app LRU cache

## Search Indexing

The search index is built incrementally:

\`\`\`typescript
const index = await buildSearchIndex({
  fields: ['title', 'content', 'tags'],
  boost: { title: 3, tags: 2, content: 1 },
});
\`\`\``,
    toc: [
      { id: 'fetching-strategies', label: 'Fetching Strategies', level: 2 },
      { id: 'caching', label: 'Caching', level: 2 },
      { id: 'search-indexing', label: 'Search Indexing', level: 2 },
    ],
  },
  deployment: {
    slug: 'deployment',
    title: 'Deployment',
    category: 'Guides',
    excerpt: 'Deploy your knowledge base to production with confidence.',
    lastUpdated: '2026-03-08',
    readTime: '5 min',
    content: `## Build for Production

\`\`\`bash
pnpm build
\`\`\`

This creates an optimized static build in the \`dist/\` directory.

## Hosting Options

### Vercel

\`\`\`bash
vercel deploy
\`\`\`

### Netlify

\`\`\`bash
netlify deploy --prod
\`\`\`

### Docker

\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY dist/ ./dist/
RUN npm install -g serve
CMD ["serve", "dist", "-l", "3000"]
\`\`\`

## Environment Configuration

Set production environment variables:

\`\`\`bash
KB_BASE_URL=https://docs.example.com
KB_SEARCH_KEY=your-api-key
\`\`\`

## Performance Checklist

- [ ] Enable CDN caching
- [ ] Configure cache headers
- [ ] Enable gzip/brotli compression
- [ ] Set up monitoring and alerts`,
    toc: [
      { id: 'build-for-production', label: 'Build for Production', level: 2 },
      { id: 'hosting-options', label: 'Hosting Options', level: 2 },
      { id: 'environment-configuration', label: 'Environment Configuration', level: 2 },
      { id: 'performance-checklist', label: 'Performance Checklist', level: 2 },
    ],
  },
  'hooks-ref': {
    slug: 'hooks-ref',
    title: 'Hooks',
    category: 'API Reference',
    excerpt: 'Complete reference for all custom hooks provided by the framework.',
    lastUpdated: '2026-03-05',
    readTime: '6 min',
    content: `## useAuth

Authentication hook for managing user sessions.

\`\`\`typescript
const { isAuthenticated, login, logout } = useAuth();
\`\`\`

| Return | Type | Description |
|--------|------|-------------|
| \`isAuthenticated\` | \`boolean\` | Current auth state |
| \`login\` | \`() => void\` | Trigger login |
| \`logout\` | \`() => void\` | Trigger logout |

## useContent

Content loading hook with caching.

\`\`\`typescript
const { data, loading, error } = useContent(slug);
\`\`\`

## useSearch

Search hook with debounced query.

\`\`\`typescript
const { results, query, setQuery } = useSearch();
\`\`\`

## useTheme

Theme management hook.

\`\`\`typescript
const { theme, setTheme, toggleMode } = useTheme();
\`\`\``,
    toc: [
      { id: 'useauth', label: 'useAuth', level: 2 },
      { id: 'usecontent', label: 'useContent', level: 2 },
      { id: 'usesearch', label: 'useSearch', level: 2 },
      { id: 'usetheme', label: 'useTheme', level: 2 },
    ],
  },
  'utilities-ref': {
    slug: 'utilities-ref',
    title: 'Utilities',
    category: 'API Reference',
    excerpt: 'Reference for utility functions including CSS helpers, formatters, and validators.',
    lastUpdated: '2026-03-02',
    readTime: '4 min',
    content: `## css()

Atomic CSS class composer:

\`\`\`typescript
import { css } from '@acme/css';

const className = css('_flex _col _gap4 _p6');
\`\`\`

## formatDate

Date formatting utility:

\`\`\`typescript
formatDate('2026-03-01'); // 'March 1, 2026'
formatDate('2026-03-01', 'relative'); // '2 days ago'
\`\`\`

## slugify

URL-safe string conversion:

\`\`\`typescript
slugify('Hello World!'); // 'hello-world'
\`\`\`

## debounce

Function debouncing utility:

\`\`\`typescript
const debouncedSearch = debounce(search, 300);
\`\`\``,
    toc: [
      { id: 'css', label: 'css()', level: 2 },
      { id: 'formatdate', label: 'formatDate', level: 2 },
      { id: 'slugify', label: 'slugify', level: 2 },
      { id: 'debounce', label: 'debounce', level: 2 },
    ],
  },
};

/* Helper to get flat article list from tree */
export function flattenTree(nodes: DocNode[]): DocNode[] {
  const flat: DocNode[] = [];
  for (const node of nodes) {
    flat.push(node);
    if (node.children) {
      flat.push(...flattenTree(node.children));
    }
  }
  return flat;
}

/* ── Changelog ── */
export const changelogEntries: ChangelogEntry[] = [
  {
    id: 'v3-0-0',
    version: '3.0.0',
    title: 'Knowledge Base 3.0 — A New Chapter',
    date: '2026-03-28',
    type: 'major',
    summary: 'Complete redesign with AI-powered search, new three-column browser, and the Paper theme.',
    highlights: [
      'AI-powered semantic search with highlighted excerpts',
      'Three-column browser layout for docs navigation',
      'New Paper theme with reading-optimized typography',
      'Interactive API reference with try-it-out console',
    ],
    content: `## What is new in 3.0

This is our biggest release ever. Knowledge Base 3.0 introduces a completely redesigned experience focused on readability and discoverability.

### AI-Powered Search

Search now understands natural language queries. Ask a question and get relevant results with highlighted excerpts showing exactly where your answer lives.

### Three-Column Browser

The new documentation browser features a navigation tree, article list, and content preview — all visible simultaneously on desktop. Navigate complex documentation hierarchies with ease.

### Paper Theme

Our new default theme uses warm paper-like backgrounds, comfortable reading typography with a 65-75 character measure, and subtle decorative elements that enhance without distracting.

### Interactive API Reference

The API reference now includes a try-it-out console where you can send real requests, view responses, and generate code snippets in multiple languages.`,
  },
  {
    id: 'v2-5-0',
    version: '2.5.0',
    title: 'Enhanced Navigation & Performance',
    date: '2026-02-15',
    type: 'minor',
    summary: 'Faster page loads, breadcrumb navigation, and command palette support.',
    highlights: [
      'Command palette (Cmd+K) for quick navigation',
      'Breadcrumb navigation with overflow handling',
      '40% faster initial page load',
      'Improved search relevance scoring',
    ],
    content: `## Navigation Improvements

### Command Palette

Press Cmd+K (or Ctrl+K) to open the command palette. Search for pages, actions, and settings all from one place.

### Breadcrumbs

Every page now shows a breadcrumb trail with smart overflow handling. Deep hierarchies collapse gracefully into a dropdown menu.

## Performance

Page load times improved by 40% through lazy loading, code splitting, and optimized asset delivery.`,
  },
  {
    id: 'v2-4-1',
    version: '2.4.1',
    title: 'Bug Fixes & Stability',
    date: '2026-01-20',
    type: 'patch',
    summary: 'Fixed search indexing issues and improved mobile responsiveness.',
    highlights: [
      'Fixed search index corruption on large datasets',
      'Improved mobile navigation drawer performance',
      'Fixed code block copy button alignment',
    ],
    content: `## Bug Fixes

- Fixed an issue where the search index could become corrupted when processing articles with more than 50,000 words
- Resolved a rendering glitch in the mobile navigation drawer when quickly toggling between open and closed states
- Fixed the copy button alignment in code blocks that have horizontal scrolling
- Corrected the table of contents highlight when scrolling through long articles`,
  },
  {
    id: 'v2-4-0',
    version: '2.4.0',
    title: 'Changelog & Versioning',
    date: '2026-01-05',
    type: 'minor',
    summary: 'Introduced changelog center, version tracking, and migration guides.',
    highlights: [
      'Changelog feed with chronological entries',
      'Version badge system for articles',
      'Auto-generated migration guides',
      'RSS feed for changelog updates',
    ],
    content: `## Changelog Center

Track product evolution with our new changelog center. Each release gets a dedicated page with highlights, migration guides, and version diffs.

## Version Badges

Articles now show version badges indicating when content was added or last updated. Readers always know if documentation matches their version.

## Migration Guides

When breaking changes occur, migration guides are auto-generated to help you upgrade smoothly.`,
  },
  {
    id: 'v2-3-0',
    version: '2.3.0',
    title: 'Internationalization Support',
    date: '2025-12-10',
    type: 'minor',
    summary: 'Multi-language documentation support with automatic locale detection.',
    highlights: [
      'Support for 12 languages',
      'Automatic locale detection',
      'Language switcher component',
      'RTL layout support',
    ],
    content: `## Multi-Language Documentation

Your knowledge base can now serve content in multiple languages. Configure supported locales and the framework handles routing, content resolution, and locale detection automatically.

## RTL Support

Full right-to-left layout support for Arabic, Hebrew, and other RTL languages. The layout mirrors automatically based on the active locale.`,
  },
];

/* ── API Endpoints ── */
export const apiEndpoints: ApiEndpoint[] = [
  {
    id: 'list-articles',
    method: 'GET',
    path: '/v1/articles',
    title: 'List Articles',
    group: 'Articles',
    description: 'Retrieve a paginated list of all published articles. Supports filtering by category, tag, and search query.',
    parameters: [
      { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
      { name: 'limit', type: 'number', required: false, description: 'Items per page (default: 20, max: 100)' },
      { name: 'category', type: 'string', required: false, description: 'Filter by category slug' },
      { name: 'q', type: 'string', required: false, description: 'Search query string' },
    ],
    responseExample: `{
  "data": [
    {
      "id": "art_01",
      "title": "Installation",
      "slug": "installation",
      "category": "getting-started",
      "excerpt": "Learn how to install..."
    }
  ],
  "meta": {
    "page": 1,
    "total": 42,
    "limit": 20
  }
}`,
  },
  {
    id: 'get-article',
    method: 'GET',
    path: '/v1/articles/:slug',
    title: 'Get Article',
    group: 'Articles',
    description: 'Retrieve a single article by its slug. Returns the full content, metadata, and table of contents.',
    parameters: [
      { name: 'slug', type: 'string', required: true, description: 'Article URL slug' },
    ],
    responseExample: `{
  "id": "art_01",
  "title": "Installation",
  "slug": "installation",
  "content": "## Prerequisites...",
  "toc": [
    { "id": "prerequisites", "label": "Prerequisites", "level": 2 }
  ],
  "lastUpdated": "2026-03-28"
}`,
  },
  {
    id: 'create-article',
    method: 'POST',
    path: '/v1/articles',
    title: 'Create Article',
    group: 'Articles',
    description: 'Create a new article. Requires authentication with write permissions.',
    parameters: [
      { name: 'title', type: 'string', required: true, description: 'Article title' },
      { name: 'content', type: 'string', required: true, description: 'Markdown content body' },
      { name: 'category', type: 'string', required: true, description: 'Category slug' },
      { name: 'tags', type: 'string[]', required: false, description: 'Array of tag strings' },
    ],
    responseExample: `{
  "id": "art_new",
  "title": "New Article",
  "slug": "new-article",
  "status": "draft",
  "createdAt": "2026-03-30T12:00:00Z"
}`,
  },
  {
    id: 'update-article',
    method: 'PUT',
    path: '/v1/articles/:slug',
    title: 'Update Article',
    group: 'Articles',
    description: 'Update an existing article. Partial updates are supported.',
    parameters: [
      { name: 'slug', type: 'string', required: true, description: 'Article URL slug' },
      { name: 'title', type: 'string', required: false, description: 'Updated title' },
      { name: 'content', type: 'string', required: false, description: 'Updated content' },
    ],
    responseExample: `{
  "id": "art_01",
  "title": "Updated Title",
  "slug": "installation",
  "updatedAt": "2026-03-30T14:00:00Z"
}`,
  },
  {
    id: 'delete-article',
    method: 'DELETE',
    path: '/v1/articles/:slug',
    title: 'Delete Article',
    group: 'Articles',
    description: 'Permanently delete an article. This action cannot be undone.',
    parameters: [
      { name: 'slug', type: 'string', required: true, description: 'Article URL slug' },
    ],
    responseExample: `{
  "deleted": true,
  "slug": "installation"
}`,
  },
  {
    id: 'search',
    method: 'GET',
    path: '/v1/search',
    title: 'Search',
    group: 'Search',
    description: 'Perform a full-text or semantic search across all published content.',
    parameters: [
      { name: 'q', type: 'string', required: true, description: 'Search query' },
      { name: 'mode', type: 'string', required: false, description: 'Search mode: "text" or "semantic" (default: "text")' },
      { name: 'limit', type: 'number', required: false, description: 'Max results (default: 10)' },
    ],
    responseExample: `{
  "results": [
    {
      "title": "Installation",
      "slug": "installation",
      "excerpt": "Learn how to <mark>install</mark>...",
      "score": 0.95
    }
  ],
  "query": "install",
  "mode": "text",
  "total": 5
}`,
  },
  {
    id: 'list-categories',
    method: 'GET',
    path: '/v1/categories',
    title: 'List Categories',
    group: 'Categories',
    description: 'Retrieve all content categories with article counts.',
    parameters: [],
    responseExample: `{
  "data": [
    { "slug": "getting-started", "title": "Getting Started", "count": 3 },
    { "slug": "core-concepts", "title": "Core Concepts", "count": 4 },
    { "slug": "guides", "title": "Guides", "count": 3 }
  ]
}`,
  },
  {
    id: 'get-changelog',
    method: 'GET',
    path: '/v1/changelog',
    title: 'List Changelog',
    group: 'Changelog',
    description: 'Retrieve changelog entries ordered by date descending.',
    parameters: [
      { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
    ],
    responseExample: `{
  "data": [
    {
      "id": "v3-0-0",
      "version": "3.0.0",
      "title": "Knowledge Base 3.0",
      "date": "2026-03-28",
      "type": "major"
    }
  ]
}`,
  },
];

/* ── Search results (pre-built) ── */
export const searchResults: SearchResult[] = [
  {
    title: 'Installation',
    slug: 'installation',
    category: 'Getting Started',
    excerpt: 'Learn how to install and set up the Knowledge Base framework in your project. Run pnpm add @acme/knowledge-base to get started.',
    highlights: ['install and set up', 'pnpm add @acme/knowledge-base'],
  },
  {
    title: 'Configuration',
    slug: 'configuration',
    category: 'Getting Started',
    excerpt: 'The main configuration file is kb.config.ts in your project root. Configure search providers, navigation style, and plugins.',
    highlights: ['configuration file', 'kb.config.ts', 'search providers'],
  },
  {
    title: 'Design Tokens',
    slug: 'design-tokens',
    category: 'Core Concepts',
    excerpt: 'Design tokens are the atomic building blocks of a design system. They represent visual design decisions as data.',
    highlights: ['design tokens', 'atomic building blocks', 'visual design decisions'],
  },
  {
    title: 'Architecture',
    slug: 'architecture',
    category: 'Core Concepts',
    excerpt: 'The knowledge base is built on a layered architecture that separates concerns into distinct modules.',
    highlights: ['layered architecture', 'separates concerns'],
  },
  {
    title: 'Authentication',
    slug: 'authentication',
    category: 'Guides',
    excerpt: 'The knowledge base supports multiple authentication strategies out of the box including local auth and OAuth providers.',
    highlights: ['authentication strategies', 'OAuth providers'],
  },
  {
    title: 'Deployment',
    slug: 'deployment',
    category: 'Guides',
    excerpt: 'Deploy your knowledge base to production with Vercel, Netlify, or Docker. Build an optimized static output.',
    highlights: ['deploy', 'production', 'Vercel, Netlify, or Docker'],
  },
];
